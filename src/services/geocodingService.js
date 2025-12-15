/**
 * Geocoding Service using Open-Meteo Geocoding API
 * https://open-meteo.com/en/docs/geocoding-api
 */

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search for cities/villages by name
 * @param {string} query - City or village name
 * @returns {Promise<Array>} Array of location objects
 */
export const searchLocation = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      name: query.trim(),
      count: 10,
      language: 'en',
      format: 'json',
    });

    const response = await fetch(`${GEOCODING_API_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Format and return location data
    return data.results.map((location) => ({
      id: location.id,
      name: location.name,
      country: location.country,
      admin1: location.admin1, // State/Province
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
      timezone: location.timezone,
      countryCode: location.country_code,
      displayName: `${location.name}${location.admin1 ? `, ${location.admin1}` : ''}, ${location.country}`,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to search location: ${error.message}`);
  }
};

/**
 * Get location details by coordinates using Nominatim (OpenStreetMap)
 * Open-Meteo doesn't support reverse geocoding, so we use Nominatim as a fallback
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Location object
 */
export const getLocationByCoordinates = async (latitude, longitude) => {
  try {
    // Use Nominatim (OpenStreetMap) for reverse geocoding
    const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'en',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'WeatherFarm App' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return null;
    }

    const addr = data.address;
    const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown Location';
    const admin1 = addr.state || addr.region || addr.province || '';
    const country = addr.country || 'Unknown Country';
    const countryCode = addr.country_code ? addr.country_code.toUpperCase() : '';

    // Try to get timezone from Open-Meteo based on coordinates
    let timezone = 'auto';
    try {
      const timezoneResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`);
      if (timezoneResponse.ok) {
        const timezoneData = await timezoneResponse.json();
        timezone = timezoneData.timezone || 'auto';
      }
    } catch (e) {
      // Ignore timezone fetch errors
    }

    return {
      id: data.place_id || `${latitude},${longitude}`,
      name: name,
      country: country,
      admin1: admin1,
      latitude: latitude,
      longitude: longitude,
      elevation: null,
      timezone: timezone,
      countryCode: countryCode,
      displayName: `${name}${admin1 ? `, ${admin1}` : ''}, ${country}`,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

