/**
 * Farm Activity Decision Engine
 * Provides simple YES/NO/WAIT decisions for farming activities
 * Based on weather, soil conditions, and pest risk data
 */

/**
 * Decision types
 */
export const DECISION = {
  YES: 'yes',
  NO: 'no',
  WAIT: 'wait'
};

/**
 * Activity types
 */
export const ACTIVITIES = {
  IRRIGATION: 'irrigation',
  PESTICIDE: 'pesticide',
  FERTILIZER: 'fertilizer',
  HARVESTING: 'harvesting'
};

/**
 * Decide whether to irrigate based on weather and soil conditions
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - Weather forecast (next 3-5 days)
 * @param {Object} soilData - Soil moisture data (optional)
 * @returns {Object} Decision with reason
 */
const decideIrrigation = (currentWeather, forecast, soilData = null) => {
  const upcomingRain = forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0);
  const recentRain = currentWeather.precipitation || 0;
  const temperature = currentWeather.temperature;
  const humidity = currentWeather.humidity;

  // Heavy rain expected in next 3 days
  if (upcomingRain > 30) {
    return {
      decision: DECISION.NO,
      reason: `Rain expected (${Math.round(upcomingRain)}mm in next 3 days). Skip irrigation.`,
      confidence: 'high',
      bestDay: null,
      details: 'Natural rainfall will provide adequate water'
    };
  }

  // Recent rain
  if (recentRain > 15) {
    return {
      decision: DECISION.WAIT,
      reason: `Recent rainfall (${recentRain.toFixed(1)}mm). Wait 2-3 days before irrigating.`,
      confidence: 'medium',
      bestDay: 'Day 3',
      details: 'Soil has adequate moisture from recent rain'
    };
  }

  // Hot and dry - urgent irrigation needed
  if (temperature > 32 && humidity < 40 && upcomingRain < 5) {
    return {
      decision: DECISION.YES,
      reason: `Hot and dry conditions (${temperature}°C, ${humidity}% humidity). Irrigate urgently.`,
      confidence: 'high',
      bestDay: 'Today',
      details: 'Crops need water immediately to prevent stress'
    };
  }

  // Moderate rain expected (10-30mm)
  if (upcomingRain >= 10 && upcomingRain <= 30) {
    return {
      decision: DECISION.WAIT,
      reason: `Light rain expected (${Math.round(upcomingRain)}mm). Wait and monitor.`,
      confidence: 'medium',
      bestDay: 'After rain',
      details: 'Evaluate soil moisture after rainfall'
    };
  }

  // Warm weather, no rain expected
  if (temperature > 28 && upcomingRain < 10) {
    return {
      decision: DECISION.YES,
      reason: `Warm weather, no rain forecast. Irrigate within 1-2 days.`,
      confidence: 'high',
      bestDay: 'Today or Tomorrow',
      details: 'Apply 25-30mm of water depending on crop stage'
    };
  }

  // Cool weather, moderate conditions
  if (temperature <= 28 && humidity >= 50) {
    return {
      decision: DECISION.WAIT,
      reason: `Moderate conditions. Monitor soil moisture daily.`,
      confidence: 'medium',
      bestDay: 'Day 2-3',
      details: 'Irrigate only if soil becomes dry'
    };
  }

  // Default - irrigation needed
  return {
    decision: DECISION.YES,
    reason: `No significant rain expected. Irrigate within 2 days.`,
    confidence: 'medium',
    bestDay: 'Tomorrow',
    details: 'Regular irrigation schedule'
  };
};

/**
 * Decide whether to spray pesticides based on weather
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - Weather forecast (next 3 days)
 * @param {Object} pestRisk - Pest risk data (optional)
 * @returns {Object} Decision with reason
 */
const decidePesticideSpraying = (currentWeather, forecast, pestRisk = null) => {
  const windSpeed = currentWeather.windSpeed || 0;
  const temperature = currentWeather.temperature;
  const upcomingRain = forecast.slice(0, 2).reduce((sum, day) => sum + (day.precipitation || 0), 0);
  const currentRain = currentWeather.precipitation || 0;

  // Currently raining
  if (currentRain > 2) {
    return {
      decision: DECISION.NO,
      reason: `Currently raining. Never spray during rain.`,
      confidence: 'high',
      bestDay: null,
      details: 'Rain washes away pesticides immediately'
    };
  }

  // High wind
  if (windSpeed > 15) {
    return {
      decision: DECISION.NO,
      reason: `High wind (${windSpeed} km/h). Spray drift risk too high.`,
      confidence: 'high',
      bestDay: null,
      details: 'Wait for calm conditions (wind < 10 km/h)'
    };
  }

  // Rain expected within 24 hours
  if (upcomingRain > 10) {
    return {
      decision: DECISION.NO,
      reason: `Heavy rain expected (${Math.round(upcomingRain)}mm). Rain will wash pesticide off.`,
      confidence: 'high',
      bestDay: 'After rain ends',
      details: 'Wait until 24 hours after last rain'
    };
  }

  // Light rain expected (5-10mm)
  if (upcomingRain >= 5 && upcomingRain <= 10) {
    return {
      decision: DECISION.WAIT,
      reason: `Light rain possible. Wait for clearer weather window.`,
      confidence: 'medium',
      bestDay: 'Day 3',
      details: 'Check forecast again tomorrow'
    };
  }

  // Too hot (>35°C)
  if (temperature > 35) {
    return {
      decision: DECISION.WAIT,
      reason: `Very hot (${temperature}°C). Spray in early morning or evening instead.`,
      confidence: 'medium',
      bestDay: 'Early morning',
      details: 'Best time: 6-9 AM or 5-7 PM when cooler'
    };
  }

  // Ideal conditions
  if (windSpeed <= 10 && upcomingRain < 5 && temperature >= 15 && temperature <= 30) {
    return {
      decision: DECISION.YES,
      reason: `Perfect conditions! Calm, dry, moderate temp (${temperature}°C).`,
      confidence: 'high',
      bestDay: 'Today',
      details: 'Spray in morning (7-10 AM) for best results'
    };
  }

  // Moderate wind (10-15 km/h)
  if (windSpeed > 10 && windSpeed <= 15) {
    return {
      decision: DECISION.WAIT,
      reason: `Moderate wind (${windSpeed} km/h). Wait for calmer conditions.`,
      confidence: 'medium',
      bestDay: 'Tomorrow morning',
      details: 'Early morning usually has less wind'
    };
  }

  // Good conditions
  return {
    decision: DECISION.YES,
    reason: `Good conditions for spraying. Wind low, no rain forecast.`,
    confidence: 'high',
    bestDay: 'Today or Tomorrow',
    details: 'Ensure good coverage and follow label instructions'
  };
};

/**
 * Decide whether to apply fertilizer based on weather and soil
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - Weather forecast (next 5 days)
 * @param {Object} soilData - Soil data (optional)
 * @returns {Object} Decision with reason
 */
const decideFertilizerApplication = (currentWeather, forecast, soilData = null) => {
  const upcomingRain = forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0);
  const lightRainDay = forecast.findIndex(day => day.precipitation >= 5 && day.precipitation <= 20);
  const heavyRainDay = forecast.findIndex(day => day.precipitation > 50);
  const temperature = currentWeather.temperature;

  // Heavy rain expected
  if (heavyRainDay !== -1 && heavyRainDay <= 2) {
    return {
      decision: DECISION.NO,
      reason: `Heavy rain expected in ${heavyRainDay + 1} day(s). Fertilizer will wash away.`,
      confidence: 'high',
      bestDay: null,
      details: 'Wait until after heavy rain period ends'
    };
  }

  // Perfect - light rain expected
  if (lightRainDay !== -1 && lightRainDay <= 2) {
    return {
      decision: DECISION.YES,
      reason: `Ideal! Light rain expected in ${lightRainDay + 1} day(s). Perfect for fertilizer.`,
      confidence: 'high',
      bestDay: lightRainDay === 0 ? 'Today (before rain)' : 'Tomorrow',
      details: 'Light rain helps dissolve and move nutrients into soil'
    };
  }

  // No rain, very dry
  if (upcomingRain < 5 && currentWeather.humidity < 40) {
    return {
      decision: DECISION.WAIT,
      reason: `Very dry conditions. Fertilizer needs moisture to work.`,
      confidence: 'medium',
      bestDay: 'After irrigation',
      details: 'Irrigate within 24 hours after fertilizer application'
    };
  }

  // Too hot
  if (temperature > 35) {
    return {
      decision: DECISION.WAIT,
      reason: `Very hot (${temperature}°C). Risk of fertilizer burn to plants.`,
      confidence: 'medium',
      bestDay: 'When cooler',
      details: 'Wait for temperature below 30°C or apply in evening'
    };
  }

  // Moderate rain expected (20-50mm)
  if (upcomingRain >= 20 && upcomingRain <= 50) {
    return {
      decision: DECISION.YES,
      reason: `Moderate rain forecast (${Math.round(upcomingRain)}mm). Apply 1-2 days before rain.`,
      confidence: 'high',
      bestDay: 'Today or Tomorrow',
      details: 'Rain will help incorporate fertilizer into soil'
    };
  }

  // Dry period
  if (upcomingRain < 10) {
    return {
      decision: DECISION.YES,
      reason: `No rain forecast. Apply fertilizer and irrigate within 24 hours.`,
      confidence: 'medium',
      bestDay: 'Today',
      details: 'Must irrigate after application for nutrient uptake'
    };
  }

  // Default - can apply
  return {
    decision: DECISION.YES,
    reason: `Conditions suitable for fertilizer application.`,
    confidence: 'medium',
    bestDay: 'Within 2 days',
    details: 'Ensure adequate soil moisture after application'
  };
};

/**
 * Decide whether to harvest based on weather
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - Weather forecast (next 5 days)
 * @param {string} cropType - Type of crop
 * @returns {Object} Decision with reason
 */
const decideHarvesting = (currentWeather, forecast, cropType = null) => {
  const upcomingRain = forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0);
  const currentRain = currentWeather.precipitation || 0;
  const humidity = currentWeather.humidity;
  const windSpeed = currentWeather.windSpeed || 0;
  const nextDayRain = forecast[0]?.precipitation || 0;

  // Currently raining
  if (currentRain > 2) {
    return {
      decision: DECISION.NO,
      reason: `Currently raining. Wait for dry weather.`,
      confidence: 'high',
      bestDay: null,
      details: 'Wet harvesting damages crop and reduces quality'
    };
  }

  // Heavy rain expected very soon
  if (nextDayRain > 20) {
    return {
      decision: DECISION.WAIT,
      reason: `Heavy rain expected tomorrow (${Math.round(nextDayRain)}mm). Wait for clearer period.`,
      confidence: 'high',
      bestDay: 'After rain',
      details: 'Harvest when field and crop are completely dry'
    };
  }

  // Rain expected in 2-3 days
  if (upcomingRain > 30 && nextDayRain < 5) {
    return {
      decision: DECISION.YES,
      reason: `Rain coming in 2-3 days. Harvest urgently before rain!`,
      confidence: 'high',
      bestDay: 'Today or Tomorrow',
      details: 'Complete harvest before rainfall to avoid losses'
    };
  }

  // Very high humidity
  if (humidity > 85 && nextDayRain > 10) {
    return {
      decision: DECISION.WAIT,
      reason: `High humidity (${humidity}%) and rain forecast. Crop too wet.`,
      confidence: 'high',
      bestDay: 'Day 3-4',
      details: 'Wait until relative humidity drops below 70%'
    };
  }

  // High wind
  if (windSpeed > 25) {
    return {
      decision: DECISION.WAIT,
      reason: `Very high wind (${windSpeed} km/h). Harvesting difficult and unsafe.`,
      confidence: 'medium',
      bestDay: 'Tomorrow',
      details: 'Wait for wind to subside below 20 km/h'
    };
  }

  // Perfect conditions
  if (currentRain === 0 && humidity < 70 && upcomingRain < 10 && windSpeed < 20) {
    return {
      decision: DECISION.YES,
      reason: `Perfect harvest weather! Dry, low humidity (${humidity}%), calm.`,
      confidence: 'high',
      bestDay: 'Today',
      details: 'Harvest during mid-morning to early afternoon when dew has dried'
    };
  }

  // Good conditions
  if (upcomingRain < 15 && humidity < 75) {
    return {
      decision: DECISION.YES,
      reason: `Good conditions for harvesting. Dry period ahead.`,
      confidence: 'high',
      bestDay: 'Today or Tomorrow',
      details: 'Avoid early morning (dew) and late evening'
    };
  }

  // Moderate conditions
  if (upcomingRain < 20) {
    return {
      decision: DECISION.WAIT,
      reason: `Some rain possible (${Math.round(upcomingRain)}mm). Monitor daily.`,
      confidence: 'medium',
      bestDay: 'Day 2-3',
      details: 'Check weather forecast daily and be ready to harvest quickly'
    };
  }

  // Default
  return {
    decision: DECISION.WAIT,
    reason: `Weather uncertain. Monitor forecast closely.`,
    confidence: 'low',
    bestDay: 'When conditions improve',
    details: 'Aim for dry, sunny days with low humidity'
  };
};

/**
 * Get decisions for all farming activities
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - Weather forecast
 * @param {Object} additionalData - Soil, pest risk, crop data
 * @returns {Object} Decisions for all activities
 */
export const getFarmActivityDecisions = (currentWeather, forecast = [], additionalData = {}) => {
  if (!currentWeather) {
    return null;
  }

  const { soilData = null, pestRisk = null, cropType = null } = additionalData;

  return {
    irrigation: decideIrrigation(currentWeather, forecast, soilData),
    pesticide: decidePesticideSpraying(currentWeather, forecast, pestRisk),
    fertilizer: decideFertilizerApplication(currentWeather, forecast, soilData),
    harvesting: decideHarvesting(currentWeather, forecast, cropType),
    metadata: {
      generatedAt: new Date(),
      weatherSummary: {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        windSpeed: currentWeather.windSpeed || 0,
        precipitation: currentWeather.precipitation || 0
      }
    }
  };
};

export default {
  getFarmActivityDecisions,
  DECISION,
  ACTIVITIES
};

