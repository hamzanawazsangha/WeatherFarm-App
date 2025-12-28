/**
 * Advanced Weather Service for Farming Intelligence
 * Powered by Open-Meteo Weather API
 * https://open-meteo.com/en/docs
 * 
 * Features:
 * - Current weather conditions
 * - Hourly forecast (48 hours)
 * - Daily forecast (7 days)
 * - Historical rainfall data (7 days)
 * - Heat index calculation
 * - Evapotranspiration estimation
 * - Offline caching with IndexedDB
 */

import { storageService } from './storageService';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_KEY = 'farmingWeatherData';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Main function to get comprehensive farming weather data
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} timezone - Timezone (e.g., 'America/New_York')
 * @param {number} historicalDays - Number of historical days to fetch (default: 7)
 * @returns {Promise<Object>} Normalized farming intelligence data
 */
export const getFarmingWeatherData = async (latitude, longitude, timezone = 'auto', historicalDays = 7) => {
  try {
    // Try to get cached data first for offline support (only for default 7 days)
    if (historicalDays === 7) {
      const cachedData = await getCachedFarmingData(latitude, longitude);
      if (cachedData) {
        console.log('Using cached farming weather data');
        return cachedData;
      }
    }

    // Fetch fresh data from API
    const [currentData, historicalData] = await Promise.all([
      fetchCurrentAndForecast(latitude, longitude, timezone),
      fetchHistoricalRainfall(latitude, longitude, timezone, historicalDays)
    ]);

    // Normalize all data into a unified object
    const normalizedData = normalizeFarmingData(
      currentData,
      historicalData,
      latitude,
      longitude,
      timezone
    );

    // Cache the data for offline use
    await cacheFarmingData(latitude, longitude, normalizedData);

    return normalizedData;
  } catch (error) {
    console.error('Error fetching farming weather data:', error);
    
    // Try to return cached data even if expired
    const fallbackData = await getCachedFarmingData(latitude, longitude, true);
    if (fallbackData) {
      console.log('Using expired cached data as fallback');
      return { ...fallbackData, isStale: true };
    }
    
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

/**
 * Fetch current weather and forecasts (hourly + daily)
 */
const fetchCurrentAndForecast = async (latitude, longitude, timezone) => {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: timezone,
    // Current weather parameters
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
      'pressure_msl',
      'surface_pressure',
      'uv_index',
      'is_day',
      'sunshine_duration'
    ].join(','),
    // Hourly forecast parameters (48 hours)
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'precipitation_probability',
      'rain',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'is_day',
      'soil_temperature_0cm',
      'soil_moisture_0_to_1cm'
    ].join(','),
    // Daily forecast parameters (7 days)
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'precipitation_sum',
      'rain_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'uv_index_max',
      'sunrise',
      'sunset',
      'precipitation_hours',
      'et0_fao_evapotranspiration'
    ].join(','),
    forecast_days: 7,
    past_days: 0,
    timeformat: 'iso8601',
  });

  const response = await fetch(`${WEATHER_API_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return await response.json();
};

/**
 * Fetch historical rainfall data (configurable days)
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} timezone
 * @param {number} days - Number of days to fetch (default: 7)
 */
const fetchHistoricalRainfall = async (latitude, longitude, timezone, days = 7) => {
  // Calculate date range for last N days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: timezone,
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    daily: [
      'precipitation_sum',
      'rain_sum',
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean'
    ].join(','),
    timeformat: 'iso8601',
  });

  const response = await fetch(`${WEATHER_API_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Historical API error: ${response.status}`);
  }

  return await response.json();
};

/**
 * Calculate heat index using temperature and humidity
 * Based on the Rothfusz regression
 * @param {number} tempC - Temperature in Celsius
 * @param {number} humidity - Relative humidity (%)
 * @returns {number} Heat index in Celsius
 */
const calculateHeatIndex = (tempC, humidity) => {
  // Convert to Fahrenheit for calculation
  const tempF = (tempC * 9/5) + 32;
  
  // Simple formula for lower temperatures
  if (tempF < 80) {
    return tempC;
  }
  
  // Rothfusz regression (multiple regression analysis)
  const T = tempF;
  const RH = humidity;
  
  let HI = -42.379 + 
           2.04901523 * T + 
           10.14333127 * RH - 
           0.22475541 * T * RH - 
           0.00683783 * T * T - 
           0.05481717 * RH * RH + 
           0.00122874 * T * T * RH + 
           0.00085282 * T * RH * RH - 
           0.00000199 * T * T * RH * RH;
  
  // Adjustments
  if (RH < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (RH > 85 && T >= 80 && T <= 87) {
    HI += ((RH - 85) / 10) * ((87 - T) / 5);
  }
  
  // Convert back to Celsius
  return Math.round((HI - 32) * 5/9);
};

/**
 * Estimate reference evapotranspiration using simplified Hargreaves equation
 * When FAO ET0 is not available from API
 * @param {number} tempMax - Maximum temperature (°C)
 * @param {number} tempMin - Minimum temperature (°C)
 * @param {number} tempMean - Mean temperature (°C)
 * @param {number} latitude - Latitude for solar radiation estimation
 * @param {number} dayOfYear - Day of year (1-365)
 * @returns {number} ET0 in mm/day
 */
const calculateEvapotranspiration = (tempMax, tempMin, tempMean, latitude, dayOfYear) => {
  // Hargreaves equation: ET0 = 0.0023 × Ra × (Tmean + 17.8) × TD^0.5
  // where TD = Tmax - Tmin, Ra = extraterrestrial radiation
  
  const TD = tempMax - tempMin;
  
  // Calculate extraterrestrial radiation (Ra) - simplified
  const latRad = latitude * Math.PI / 180;
  const dr = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
  const declination = 0.409 * Math.sin((2 * Math.PI * dayOfYear / 365) - 1.39);
  const ws = Math.acos(-Math.tan(latRad) * Math.tan(declination));
  const Ra = (24 * 60 / Math.PI) * 0.082 * dr * 
             (ws * Math.sin(latRad) * Math.sin(declination) + 
              Math.cos(latRad) * Math.cos(declination) * Math.sin(ws));
  
  // Calculate ET0
  const ET0 = 0.0023 * Ra * (tempMean + 17.8) * Math.pow(TD, 0.5);
  
  return Math.max(0, Math.round(ET0 * 10) / 10); // Round to 1 decimal place
};

/**
 * Normalize all weather data into a unified farming intelligence object
 */
const normalizeFarmingData = (currentData, historicalData, latitude, longitude, timezone) => {
  const { current, hourly, daily } = currentData;
  
  // Current conditions with farming metrics
  const currentConditions = {
    temperature: Math.round(current.temperature_2m || 0),
    feelsLike: Math.round(current.apparent_temperature || 0),
    heatIndex: calculateHeatIndex(
      current.temperature_2m || 0,
      current.relative_humidity_2m || 0
    ),
    humidity: current.relative_humidity_2m || 0,
    precipitation: current.precipitation || 0,
    rain: current.rain || 0,
    weatherCode: current.weather_code || 0,
    condition: getWeatherCondition(current.weather_code || 0),
    cloudCover: current.cloud_cover || 0,
    windSpeed: Math.round(current.wind_speed_10m || 0),
    windDirection: current.wind_direction_10m || 0,
    pressure: current.pressure_msl || current.surface_pressure || 0,
    uvIndex: Math.round(current.uv_index || 0),
    isDay: current.is_day === 1,
    sunshineDuration: current.sunshine_duration || 0,
    timestamp: new Date(current.time || Date.now()),
  };

  // Hourly forecast (next 48 hours)
  const hourlyForecast = [];
  const hoursToForecast = Math.min(48, hourly.time?.length || 0);
  
  for (let i = 0; i < hoursToForecast; i++) {
    hourlyForecast.push({
      time: new Date(hourly.time[i]),
      hour: new Date(hourly.time[i]).getHours(),
      temperature: Math.round(hourly.temperature_2m?.[i] || 0),
      feelsLike: Math.round(hourly.apparent_temperature?.[i] || 0),
      heatIndex: calculateHeatIndex(
        hourly.temperature_2m?.[i] || 0,
        hourly.relative_humidity_2m?.[i] || 0
      ),
      humidity: hourly.relative_humidity_2m?.[i] || 0,
      precipitation: hourly.precipitation?.[i] || 0,
      precipitationProbability: hourly.precipitation_probability?.[i] || 0,
      rain: hourly.rain?.[i] || 0,
      weatherCode: hourly.weather_code?.[i] || 0,
      condition: getWeatherCondition(hourly.weather_code?.[i] || 0),
      cloudCover: hourly.cloud_cover?.[i] || 0,
      windSpeed: Math.round(hourly.wind_speed_10m?.[i] || 0),
      windDirection: hourly.wind_direction_10m?.[i] || 0,
      uvIndex: Math.round(hourly.uv_index?.[i] || 0),
      isDay: hourly.is_day?.[i] === 1,
      soilTemperature: hourly.soil_temperature_0cm?.[i] || null,
      soilMoisture: hourly.soil_moisture_0_to_1cm?.[i] || null,
    });
  }

  // Daily forecast (next 7 days)
  const dailyForecast = [];
  const daysToForecast = Math.min(7, daily.time?.length || 0);
  
  for (let i = 0; i < daysToForecast; i++) {
    const date = new Date(daily.time[i]);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const tempMax = daily.temperature_2m_max?.[i] || 0;
    const tempMin = daily.temperature_2m_min?.[i] || 0;
    const tempMean = (tempMax + tempMin) / 2;
    
    // Use API's FAO ET0 if available, otherwise calculate
    const et0 = daily.et0_fao_evapotranspiration?.[i] || 
                calculateEvapotranspiration(tempMax, tempMin, tempMean, latitude, dayOfYear);
    
    dailyForecast.push({
      date: date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfWeek: date.getDay(),
      maxTemp: Math.round(tempMax),
      minTemp: Math.round(tempMin),
      maxFeelsLike: Math.round(daily.apparent_temperature_max?.[i] || 0),
      minFeelsLike: Math.round(daily.apparent_temperature_min?.[i] || 0),
      maxHeatIndex: calculateHeatIndex(tempMax, 50), // Assume 50% humidity for daily max
      weatherCode: daily.weather_code?.[i] || 0,
      condition: getWeatherCondition(daily.weather_code?.[i] || 0),
      precipitation: daily.precipitation_sum?.[i] || 0,
      rain: daily.rain_sum?.[i] || 0,
      precipitationProbability: daily.precipitation_probability_max?.[i] || 0,
      precipitationHours: daily.precipitation_hours?.[i] || 0,
      windSpeed: Math.round(daily.wind_speed_10m_max?.[i] || 0),
      windDirection: daily.wind_direction_10m_dominant?.[i] || 0,
      uvIndex: Math.round(daily.uv_index_max?.[i] || 0),
      sunrise: new Date(daily.sunrise?.[i] || Date.now()),
      sunset: new Date(daily.sunset?.[i] || Date.now()),
      // Farming-specific metrics
      evapotranspiration: et0,
      irrigationNeed: Math.max(0, et0 - (daily.precipitation_sum?.[i] || 0)),
    });
  }

  // Historical rainfall (last 7 days)
  const historicalRainfall = [];
  const historicalDays = historicalData.daily?.time?.length || 0;
  
  for (let i = 0; i < historicalDays; i++) {
    historicalRainfall.push({
      date: new Date(historicalData.daily.time[i]),
      precipitation: historicalData.daily.precipitation_sum?.[i] || 0,
      rain: historicalData.daily.rain_sum?.[i] || 0,
      tempMax: Math.round(historicalData.daily.temperature_2m_max?.[i] || 0),
      tempMin: Math.round(historicalData.daily.temperature_2m_min?.[i] || 0),
      tempMean: Math.round(historicalData.daily.temperature_2m_mean?.[i] || 0),
    });
  }

  // Calculate summary statistics
  const totalHistoricalRain = historicalRainfall.reduce((sum, day) => sum + day.rain, 0);
  const avgDailyRain = historicalDays > 0 ? totalHistoricalRain / historicalDays : 0;
  
  const next7DaysRain = dailyForecast.slice(0, 7).reduce((sum, day) => sum + day.rain, 0);
  const next7DaysET = dailyForecast.slice(0, 7).reduce((sum, day) => sum + day.evapotranspiration, 0);

  // Today's sunrise/sunset
  const todaySunrise = daily.sunrise?.[0] ? new Date(daily.sunrise[0]) : new Date();
  const todaySunset = daily.sunset?.[0] ? new Date(daily.sunset[0]) : new Date();

  // Return normalized farming intelligence data
  return {
    location: {
      latitude,
      longitude,
      timezone: currentData.timezone || timezone,
      timezoneAbbreviation: currentData.timezone_abbreviation || 'UTC',
    },
    current: currentConditions,
    hourly: hourlyForecast,
    daily: dailyForecast,
    historical: {
      rainfall: historicalRainfall,
      totalRainfall: Math.round(totalHistoricalRain * 10) / 10,
      averageDailyRainfall: Math.round(avgDailyRain * 10) / 10,
    },
    summary: {
      next7Days: {
        totalRainfall: Math.round(next7DaysRain * 10) / 10,
        totalEvapotranspiration: Math.round(next7DaysET * 10) / 10,
        irrigationNeed: Math.round((next7DaysET - next7DaysRain) * 10) / 10,
      },
      sunrise: todaySunrise,
      sunset: todaySunset,
    },
    metadata: {
      fetchedAt: new Date(),
      version: '3.0',
      source: 'Open-Meteo API',
    }
  };
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
 * Cache farming weather data to IndexedDB for offline use
 */
const cacheFarmingData = async (latitude, longitude, data) => {
  try {
    const cacheEntry = {
      key: `${CACHE_KEY}_${latitude}_${longitude}`,
      latitude,
      longitude,
      data: JSON.stringify(data), // Stringify to handle Date objects
      timestamp: Date.now(),
      version: '3.0',
    };

    // Store in IndexedDB
    await storageService.update('settings', cacheEntry);
    
    // Also store in localStorage as fallback
    localStorage.setItem(cacheEntry.key, JSON.stringify(cacheEntry));
    
    console.log('Farming weather data cached successfully');
  } catch (error) {
    console.error('Failed to cache farming weather data:', error);
  }
};

/**
 * Get cached farming weather data from IndexedDB or localStorage
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {boolean} ignoreExpiry - If true, return cached data even if expired
 * @returns {Promise<Object|null>} Cached farming data or null
 */
const getCachedFarmingData = async (latitude, longitude, ignoreExpiry = false) => {
  try {
    const key = `${CACHE_KEY}_${latitude}_${longitude}`;
    
    // Try IndexedDB first
    let cached = null;
    try {
      cached = await storageService.get('settings', key);
    } catch (error) {
      console.log('IndexedDB not available, trying localStorage');
    }
    
    // Fallback to localStorage
    if (!cached) {
      const localData = localStorage.getItem(key);
      if (localData) {
        cached = JSON.parse(localData);
      }
    }
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is expired
    if (!ignoreExpiry && (Date.now() - cached.timestamp > CACHE_DURATION)) {
      console.log('Cache expired');
      return null;
    }
    
    // Parse and restore the data
    const data = typeof cached.data === 'string' 
      ? JSON.parse(cached.data) 
      : cached.data;
    
    // Restore Date objects
    return restoreDates(data);
  } catch (error) {
    console.error('Failed to get cached farming weather data:', error);
    return null;
  }
};

/**
 * Helper function to recursively restore Date objects from ISO strings
 */
const restoreDates = (obj) => {
  if (!obj) return obj;
  
  // If it's a Date-like string, convert it
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(obj)) {
    return new Date(obj);
  }
  
  // If it's an array, process each element
  if (Array.isArray(obj)) {
    return obj.map(item => restoreDates(item));
  }
  
  // If it's an object, process each property
  if (typeof obj === 'object' && obj !== null) {
    const restored = {};
    for (const key in obj) {
      if (key === 'time' || key === 'date' || key === 'timestamp' || 
          key === 'sunrise' || key === 'sunset' || key === 'fetchedAt') {
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
 * Legacy function for backward compatibility
 * @deprecated Use getFarmingWeatherData instead
 */
export const getWeatherData = async (latitude, longitude, timezone = 'auto') => {
  const farmingData = await getFarmingWeatherData(latitude, longitude, timezone);
  
  // Return in old format for backward compatibility
  return {
    current: farmingData.current,
    forecast: farmingData.daily.slice(1, 6), // Next 5 days (excluding today)
    sunrise: farmingData.summary.sunrise,
    sunset: farmingData.summary.sunset,
    timezone: farmingData.location.timezone,
    timezoneAbbreviation: farmingData.location.timezoneAbbreviation,
  };
};

/**
 * Legacy caching functions for backward compatibility
 * @deprecated Use internal caching with getFarmingWeatherData
 */
export const cacheWeatherData = (location, weatherData) => {
  try {
    const cache = {
      location,
      weatherData,
      timestamp: Date.now(),
      version: '2.0',
    };
    localStorage.setItem('weatherCache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache weather data:', error);
  }
};

export const getCachedWeatherData = () => {
  try {
    const cached = localStorage.getItem('weatherCache');
    if (!cached) return null;
    
    const cache = JSON.parse(cached);
    const LEGACY_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    
    if (Date.now() - cache.timestamp > LEGACY_CACHE_DURATION) {
      localStorage.removeItem('weatherCache');
      return null;
    }
    
    if (cache.weatherData) {
      cache.weatherData = restoreDates(cache.weatherData);
    }
    
    return cache;
  } catch (error) {
    console.error('Failed to get cached weather data:', error);
    return null;
  }
};

// Export all functions
export default {
  getFarmingWeatherData,
  getWeatherData,
  cacheWeatherData,
  getCachedWeatherData,
};
