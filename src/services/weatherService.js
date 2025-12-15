/**
 * Weather Service using Open-Meteo Weather API
 * https://open-meteo.com/en/docs
 */

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get current weather and forecast
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} timezone - Timezone (e.g., 'America/New_York')
 * @returns {Promise<Object>} Weather data object
 */
export const getWeatherData = async (latitude, longitude, timezone = 'auto') => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      timezone: timezone,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'cloud_cover',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
        'is_day',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'rain_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
        'uv_index_max',
        'sunrise',
        'sunset',
      ].join(','),
      forecast_days: 6, // Today + 5 days
      timeformat: 'iso8601',
    });

    const response = await fetch(`${WEATHER_API_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('Raw API response:', data);
    
    if (!data) {
      throw new Error('No data received from API');
    }
    
    if (!data.current || !data.daily) {
      console.error('Missing current or daily data:', { hasCurrent: !!data.current, hasDaily: !!data.daily });
      throw new Error('Invalid weather data received - missing current or daily data');
    }

    const formatted = formatWeatherData(data);
    console.log('Formatted weather data:', formatted);
    return formatted;
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

/**
 * Format raw weather API data into a structured format
 */
const formatWeatherData = (data) => {
  try {
    const { current, daily } = data;
    
    if (!current || !daily) {
      throw new Error('Missing current or daily data in API response');
    }

    if (!daily.time || !Array.isArray(daily.time) || daily.time.length < 2) {
      throw new Error('Invalid daily time array in API response');
    }
    
    // Format current weather
    const currentWeather = {
      temperature: Math.round(current.temperature_2m || 0),
      feelsLike: Math.round(current.apparent_temperature || 0),
      humidity: current.relative_humidity_2m || 0,
      precipitation: current.precipitation || 0,
      rain: current.rain || 0,
      weatherCode: current.weather_code || 0,
      cloudCover: current.cloud_cover || 0,
      windSpeed: Math.round(current.wind_speed_10m || 0),
      windDirection: current.wind_direction_10m || 0,
      uvIndex: Math.round(current.uv_index || 0),
      isDay: current.is_day === 1,
      condition: getWeatherCondition(current.weather_code || 0),
      time: new Date(current.time || Date.now()),
    };

    // Format daily forecast (skip today, get next 5 days)
    const forecast = [];
    for (let i = 1; i <= 5 && i < daily.time.length; i++) {
      try {
        forecast.push({
          date: new Date(daily.time[i]),
          dayName: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
          maxTemp: Math.round((daily.temperature_2m_max && daily.temperature_2m_max[i]) || 0),
          minTemp: Math.round((daily.temperature_2m_min && daily.temperature_2m_min[i]) || 0),
          weatherCode: (daily.weather_code && daily.weather_code[i]) || 0,
          condition: getWeatherCondition((daily.weather_code && daily.weather_code[i]) || 0),
          precipitation: (daily.precipitation_sum && daily.precipitation_sum[i]) || 0,
          rain: (daily.rain_sum && daily.rain_sum[i]) || 0,
          rainProbability: (daily.precipitation_probability_max && daily.precipitation_probability_max[i]) || 0,
          windSpeed: Math.round((daily.wind_speed_10m_max && daily.wind_speed_10m_max[i]) || 0),
          windDirection: (daily.wind_direction_10m_dominant && daily.wind_direction_10m_dominant[i]) || 0,
          uvIndex: Math.round((daily.uv_index_max && daily.uv_index_max[i]) || 0),
          sunrise: new Date((daily.sunrise && daily.sunrise[i]) || Date.now()),
          sunset: new Date((daily.sunset && daily.sunset[i]) || Date.now()),
        });
      } catch (err) {
        console.error(`Error formatting forecast day ${i}:`, err);
      }
    }

    // Today's sunrise/sunset
    const todaySunrise = daily.sunrise && daily.sunrise[0] ? new Date(daily.sunrise[0]) : new Date();
    const todaySunset = daily.sunset && daily.sunset[0] ? new Date(daily.sunset[0]) : new Date();

    return {
      current: currentWeather,
      forecast,
      sunrise: todaySunrise,
      sunset: todaySunset,
      timezone: data.timezone || 'UTC',
      timezoneAbbreviation: data.timezone_abbreviation || 'UTC',
    };
  } catch (error) {
    console.error('Error formatting weather data:', error);
    console.error('Raw API data:', data);
    throw new Error(`Failed to format weather data: ${error.message}`);
  }
};

/**
 * Map WMO weather code to condition name
 * https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */
const getWeatherCondition = (code) => {
  const conditions = {
    0: 'clear',
    1: 'clear', // Mainly clear
    2: 'cloudy', // Partly cloudy
    3: 'cloudy', // Overcast
    45: 'foggy', // Fog
    48: 'foggy', // Depositing rime fog
    51: 'rainy', // Light drizzle
    53: 'rainy', // Moderate drizzle
    55: 'rainy', // Dense drizzle
    56: 'rainy', // Light freezing drizzle
    57: 'rainy', // Dense freezing drizzle
    61: 'rainy', // Slight rain
    63: 'rainy', // Moderate rain
    65: 'rainy', // Heavy rain
    66: 'rainy', // Light freezing rain
    67: 'rainy', // Heavy freezing rain
    71: 'snowy', // Slight snow fall
    73: 'snowy', // Moderate snow fall
    75: 'snowy', // Heavy snow fall
    77: 'snowy', // Snow grains
    80: 'rainy', // Slight rain showers
    81: 'rainy', // Moderate rain showers
    82: 'rainy', // Violent rain showers
    85: 'snowy', // Slight snow showers
    86: 'snowy', // Heavy snow showers
    95: 'stormy', // Thunderstorm
    96: 'stormy', // Thunderstorm with slight hail
    99: 'stormy', // Thunderstorm with heavy hail
  };
  
  return conditions[code] || 'clear';
};

/**
 * Cache weather data to localStorage
 */
export const cacheWeatherData = (location, weatherData) => {
  try {
    const cache = {
      location,
      weatherData,
      timestamp: Date.now(),
      version: '2.0', // Cache version to invalidate old caches
    };
    localStorage.setItem('weatherCache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache weather data:', error);
  }
};

/**
 * Helper function to convert date strings back to Date objects
 */
const restoreDates = (obj) => {
  if (!obj) return obj;
  
  // If it's a Date-like string, convert it
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}/.test(obj)) {
    return new Date(obj);
  }
  
  // If it's an array, process each element
  if (Array.isArray(obj)) {
    return obj.map(item => restoreDates(item));
  }
  
  // If it's an object, process each property
  if (typeof obj === 'object') {
    const restored = {};
    for (const key in obj) {
      if (key === 'time' || key === 'date' || key === 'sunrise' || key === 'sunset') {
        // These are date fields - convert them
        restored[key] = obj[key] ? new Date(obj[key]) : new Date();
      } else {
        restored[key] = restoreDates(obj[key]);
      }
    }
    return restored;
  }
  
  return obj;
};

/**
 * Get cached weather data
 */
export const getCachedWeatherData = () => {
  try {
    const cached = localStorage.getItem('weatherCache');
    if (!cached) return null;
    
    const cache = JSON.parse(cached);
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    
    // Invalidate old cache versions (without version field or version < 2.0)
    if (!cache.version || cache.version < '2.0') {
      console.log('Invalidating old cache version');
      localStorage.removeItem('weatherCache');
      return null;
    }
    
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      localStorage.removeItem('weatherCache');
      return null;
    }
    
    // Restore Date objects from strings
    if (cache.weatherData) {
      cache.weatherData = restoreDates(cache.weatherData);
    }
    
    return cache;
  } catch (error) {
    console.error('Failed to get cached weather data:', error);
    return null;
  }
};
