/**
 * Crop Advisor Service - Rules-based farming intelligence
 * Provides crop-specific insights, irrigation recommendations, pest/disease predictions,
 * activity planning, and crop loss risk scoring
 */

const CROP_TYPES = {
  WHEAT: 'wheat',
  RICE: 'rice',
  COTTON: 'cotton',
  SUGARCANE: 'sugarcane',
  VEGETABLES: 'vegetables',
};

/**
 * Crop-specific optimal conditions
 */
const CROP_OPTIMAL_CONDITIONS = {
  [CROP_TYPES.WHEAT]: {
    tempMin: 10,
    tempMax: 25,
    tempOptimal: [15, 20],
    humidityMin: 40,
    humidityMax: 70,
    humidityOptimal: [50, 60],
    rainfallMin: 25,
    rainfallMax: 75,
    rainfallOptimal: [40, 60],
    windMax: 30,
    uvIndexMax: 8,
  },
  [CROP_TYPES.RICE]: {
    tempMin: 20,
    tempMax: 35,
    tempOptimal: [25, 30],
    humidityMin: 70,
    humidityMax: 90,
    humidityOptimal: [75, 85],
    rainfallMin: 100,
    rainfallMax: 200,
    rainfallOptimal: [120, 180],
    windMax: 20,
    uvIndexMax: 7,
  },
  [CROP_TYPES.COTTON]: {
    tempMin: 21,
    tempMax: 30,
    tempOptimal: [24, 28],
    humidityMin: 50,
    humidityMax: 80,
    humidityOptimal: [60, 70],
    rainfallMin: 50,
    rainfallMax: 100,
    rainfallOptimal: [60, 80],
    windMax: 25,
    uvIndexMax: 9,
  },
  [CROP_TYPES.SUGARCANE]: {
    tempMin: 20,
    tempMax: 35,
    tempOptimal: [26, 32],
    humidityMin: 60,
    humidityMax: 85,
    humidityOptimal: [70, 80],
    rainfallMin: 75,
    rainfallMax: 150,
    rainfallOptimal: [100, 130],
    windMax: 30,
    uvIndexMax: 8,
  },
  [CROP_TYPES.VEGETABLES]: {
    tempMin: 15,
    tempMax: 28,
    tempOptimal: [18, 24],
    humidityMin: 50,
    humidityMax: 75,
    humidityOptimal: [60, 70],
    rainfallMin: 30,
    rainfallMax: 80,
    rainfallOptimal: [40, 60],
    windMax: 25,
    uvIndexMax: 7,
  },
};

/**
 * Get crop-specific insights based on current and forecast weather
 * @param {string} cropType - Type of crop
 * @param {Object} currentWeather - Current weather data
 * @param {Array} forecast - 5-day forecast array
 * @returns {Object} Crop insights object
 */
export const getCropInsights = (cropType, currentWeather, forecast = []) => {
  if (!currentWeather || !CROP_OPTIMAL_CONDITIONS[cropType]) {
    return null;
  }

  const conditions = CROP_OPTIMAL_CONDITIONS[cropType];
  const insights = {
    cropType,
    cropName: cropType.charAt(0).toUpperCase() + cropType.slice(1),
    currentConditions: analyzeCurrentConditions(currentWeather, conditions),
    irrigationRecommendation: getIrrigationRecommendation(currentWeather, forecast, conditions),
    pestDiseaseRisk: getPestDiseaseRisk(currentWeather, forecast, conditions),
    activityPlanner: getActivityPlanner(forecast, conditions),
    cropLossRisk: calculateCropLossRisk(currentWeather, forecast, conditions),
    recommendations: generateRecommendations(currentWeather, forecast, conditions),
  };

  return insights;
};

/**
 * Analyze current weather conditions against optimal ranges
 */
const analyzeCurrentConditions = (weather, conditions) => {
  const temp = weather.temperature;
  const humidity = weather.humidity;
  const precipitation = weather.precipitation || 0;
  const windSpeed = weather.windSpeed || 0;
  const uvIndex = weather.uvIndex || 0;

  const analysis = {
    temperature: {
      value: temp,
      status: getStatus(temp, conditions.tempOptimal[0], conditions.tempOptimal[1], conditions.tempMin, conditions.tempMax),
      message: getTemperatureMessage(temp, conditions),
    },
    humidity: {
      value: humidity,
      status: getStatus(humidity, conditions.humidityOptimal[0], conditions.humidityOptimal[1], conditions.humidityMin, conditions.humidityMax),
      message: getHumidityMessage(humidity, conditions),
    },
    precipitation: {
      value: precipitation,
      status: getPrecipitationStatus(precipitation, conditions),
      message: getPrecipitationMessage(precipitation, conditions),
    },
    windSpeed: {
      value: windSpeed,
      status: windSpeed > conditions.windMax ? 'critical' : windSpeed > conditions.windMax * 0.8 ? 'warning' : 'good',
      message: windSpeed > conditions.windMax ? 'High wind may damage crops' : windSpeed > conditions.windMax * 0.8 ? 'Moderate wind - monitor closely' : 'Wind conditions are favorable',
    },
    uvIndex: {
      value: uvIndex,
      status: uvIndex > conditions.uvIndexMax ? 'warning' : 'good',
      message: uvIndex > conditions.uvIndexMax ? 'High UV - protect crops from sunburn' : 'UV levels are safe',
    },
  };

  return analysis;
};

/**
 * Get irrigation recommendations
 */
const getIrrigationRecommendation = (currentWeather, forecast, conditions) => {
  const currentPrecip = currentWeather.precipitation || 0;
  const avgPrecip = forecast.length > 0 
    ? forecast.reduce((sum, day) => sum + (day.precipitation || 0), 0) / forecast.length 
    : 0;
  
  const totalPrecip = currentPrecip + avgPrecip * forecast.length;
  const weeklyNeed = conditions.rainfallOptimal[1] * 7; // Optimal weekly rainfall
  const deficit = weeklyNeed - totalPrecip;

  let recommendation = {
    needed: false,
    urgency: 'low',
    amount: 0,
    timing: 'Not needed',
    message: 'Natural rainfall is sufficient',
  };

  if (deficit > 20) {
    recommendation.needed = true;
    recommendation.urgency = deficit > 50 ? 'high' : 'medium';
    recommendation.amount = Math.round(deficit);
    recommendation.timing = getBestIrrigationTime(forecast);
    recommendation.message = `Irrigation recommended: ${recommendation.amount}mm needed. Best time: ${recommendation.timing}`;
  } else if (deficit > 0) {
    recommendation.needed = true;
    recommendation.urgency = 'low';
    recommendation.amount = Math.round(deficit);
    recommendation.timing = getBestIrrigationTime(forecast);
    recommendation.message = `Light irrigation may be beneficial: ${recommendation.amount}mm. Best time: ${recommendation.timing}`;
  }

  return recommendation;
};

/**
 * Get best time for irrigation based on forecast
 */
const getBestIrrigationTime = (forecast) => {
  if (!forecast || forecast.length === 0) return 'Early morning (6-8 AM)';
  
  // Find day with lowest wind and moderate temperature
  const bestDay = forecast.reduce((best, day, index) => {
    const score = (day.windSpeed || 0) + (day.maxTemp > 30 ? 10 : 0);
    const bestScore = (best.windSpeed || 0) + (best.maxTemp > 30 ? 10 : 0);
    return score < bestScore ? { ...day, dayIndex: index } : best;
  }, forecast[0]);

  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  return `${dayNames[bestDay.dayIndex] || 'Early morning'} (6-8 AM)`;
};

/**
 * Get pest and disease risk prediction
 */
const getPestDiseaseRisk = (currentWeather, forecast, conditions) => {
  const risks = [];
  let overallRisk = 'low';
  let riskScore = 0;

  // High humidity + warm temperature = fungal disease risk
  if (currentWeather.humidity > 75 && currentWeather.temperature > 25) {
    risks.push({
      type: 'Fungal Diseases',
      severity: 'high',
      message: 'High humidity and warm temperature create ideal conditions for fungal diseases like powdery mildew and rust.',
      prevention: 'Apply fungicide preventively, ensure good air circulation, avoid overhead watering.',
    });
    riskScore += 40;
  } else if (currentWeather.humidity > 70 && currentWeather.temperature > 22) {
    risks.push({
      type: 'Fungal Diseases',
      severity: 'medium',
      message: 'Moderate risk of fungal diseases. Monitor crops closely.',
      prevention: 'Maintain proper spacing, avoid wetting leaves during irrigation.',
    });
    riskScore += 20;
  }

  // High temperature + low humidity = pest risk (aphids, mites)
  if (currentWeather.temperature > 28 && currentWeather.humidity < 50) {
    risks.push({
      type: 'Pest Infestation',
      severity: 'high',
      message: 'Hot and dry conditions favor pest activity (aphids, spider mites).',
      prevention: 'Increase humidity if possible, apply organic pest control, monitor regularly.',
    });
    riskScore += 35;
  } else if (currentWeather.temperature > 25 && currentWeather.humidity < 55) {
    risks.push({
      type: 'Pest Infestation',
      severity: 'medium',
      message: 'Moderate pest risk. Keep fields clean and monitor.',
      prevention: 'Use beneficial insects, maintain field hygiene.',
    });
    riskScore += 15;
  }

  // Excessive rainfall = root rot risk
  const avgRainfall = forecast.length > 0 
    ? forecast.reduce((sum, day) => sum + (day.precipitation || 0), 0) / forecast.length 
    : 0;
  
  if (avgRainfall > conditions.rainfallOptimal[1] * 1.5) {
    risks.push({
      type: 'Root Rot',
      severity: 'high',
      message: 'Excessive rainfall predicted. Risk of waterlogging and root diseases.',
      prevention: 'Improve drainage, avoid overwatering, use raised beds if possible.',
    });
    riskScore += 30;
  }

  // Determine overall risk
  if (riskScore >= 60) {
    overallRisk = 'critical';
  } else if (riskScore >= 40) {
    overallRisk = 'high';
  } else if (riskScore >= 20) {
    overallRisk = 'medium';
  }

  return {
    overallRisk,
    riskScore: Math.min(riskScore, 100),
    risks,
  };
};

/**
 * Get activity planner (best days for harvest, spray, fertilize)
 */
const getActivityPlanner = (forecast, conditions) => {
  if (!forecast || forecast.length === 0) {
    return {
      harvest: { day: 'Today', score: 70, reason: 'Current conditions are suitable' },
      spray: { day: 'Today', score: 70, reason: 'Weather is favorable' },
      fertilize: { day: 'Today', score: 70, reason: 'Good conditions for application' },
    };
  }

  // Best day for harvest: low wind, no rain, moderate temperature
  const harvestDay = forecast.reduce((best, day, index) => {
    const score = calculateHarvestScore(day, conditions);
    return score > best.score ? { day: getDayName(index), score, index, reason: getHarvestReason(day) } : best;
  }, { day: 'Today', score: calculateHarvestScore({ precipitation: 0, windSpeed: 0, maxTemp: 25 }, conditions), index: -1, reason: 'Current conditions' });

  // Best day for spraying: low wind, no rain expected for 24h, moderate temperature
  const sprayDay = forecast.reduce((best, day, index) => {
    const score = calculateSprayScore(day, forecast[index + 1]);
    return score > best.score ? { day: getDayName(index), score, index, reason: getSprayReason(day) } : best;
  }, { day: 'Today', score: calculateSprayScore({ precipitation: 0, windSpeed: 0, maxTemp: 25 }, null), index: -1, reason: 'Current conditions' });

  // Best day for fertilizing: light rain expected or just after rain, moderate temperature
  const fertilizeDay = forecast.reduce((best, day, index) => {
    const score = calculateFertilizeScore(day);
    return score > best.score ? { day: getDayName(index), score, index, reason: getFertilizeReason(day) } : best;
  }, { day: 'Today', score: calculateFertilizeScore({ precipitation: 0, maxTemp: 25 }), index: -1, reason: 'Current conditions' });

  return {
    harvest: harvestDay,
    spray: sprayDay,
    fertilize: fertilizeDay,
  };
};

/**
 * Calculate crop loss risk score (0-100)
 */
const calculateCropLossRisk = (currentWeather, forecast, conditions) => {
  let riskScore = 0;

  // Temperature extremes
  if (currentWeather.temperature < conditions.tempMin || currentWeather.temperature > conditions.tempMax) {
    riskScore += 30;
  } else if (currentWeather.temperature < conditions.tempOptimal[0] || currentWeather.temperature > conditions.tempOptimal[1]) {
    riskScore += 15;
  }

  // Humidity extremes
  if (currentWeather.humidity < conditions.humidityMin || currentWeather.humidity > conditions.humidityMax) {
    riskScore += 20;
  }

  // Excessive or insufficient rainfall
  const weeklyPrecip = (currentWeather.precipitation || 0) + 
    (forecast.length > 0 ? forecast.reduce((sum, day) => sum + (day.precipitation || 0), 0) : 0);
  
  if (weeklyPrecip > conditions.rainfallOptimal[1] * 2) {
    riskScore += 25; // Flooding risk
  } else if (weeklyPrecip < conditions.rainfallOptimal[0] * 0.5) {
    riskScore += 20; // Drought risk
  }

  // High wind
  if (currentWeather.windSpeed > conditions.windMax) {
    riskScore += 15;
  }

  // Pest/disease risk (from pestDiseaseRisk calculation)
  const pestRisk = getPestDiseaseRisk(currentWeather, forecast, conditions);
  riskScore += pestRisk.riskScore * 0.3; // Weight pest risk

  return Math.min(Math.round(riskScore), 100);
};

/**
 * Generate actionable recommendations
 */
const generateRecommendations = (currentWeather, forecast, conditions) => {
  const recommendations = [];

  // Temperature recommendations
  if (currentWeather.temperature < conditions.tempMin) {
    recommendations.push({
      type: 'temperature',
      priority: 'high',
      message: `Temperature is below optimal range (${conditions.tempMin}°C). Consider using row covers or greenhouses to protect crops.`,
    });
  } else if (currentWeather.temperature > conditions.tempMax) {
    recommendations.push({
      type: 'temperature',
      priority: 'high',
      message: `Temperature is above optimal range (${conditions.tempMax}°C). Provide shade and increase irrigation frequency.`,
    });
  }

  // Humidity recommendations
  if (currentWeather.humidity < conditions.humidityMin) {
    recommendations.push({
      type: 'humidity',
      priority: 'medium',
      message: `Low humidity detected. Increase irrigation frequency or use misting systems.`,
    });
  } else if (currentWeather.humidity > conditions.humidityMax) {
    recommendations.push({
      type: 'humidity',
      priority: 'medium',
      message: `High humidity detected. Ensure good air circulation and avoid overhead watering.`,
    });
  }

  // Irrigation recommendations
  const irrigation = getIrrigationRecommendation(currentWeather, forecast, conditions);
  if (irrigation.needed && irrigation.urgency === 'high') {
    recommendations.push({
      type: 'irrigation',
      priority: 'high',
      message: irrigation.message,
    });
  }

  return recommendations;
};

// Helper functions
const getStatus = (value, optimalMin, optimalMax, absoluteMin, absoluteMax) => {
  if (value >= optimalMin && value <= optimalMax) return 'optimal';
  if (value >= absoluteMin && value <= absoluteMax) return 'good';
  if (value < absoluteMin || value > absoluteMax) return 'critical';
  return 'warning';
};

const getTemperatureMessage = (temp, conditions) => {
  if (temp < conditions.tempMin) return `Too cold for optimal growth (min: ${conditions.tempMin}°C)`;
  if (temp > conditions.tempMax) return `Too hot for optimal growth (max: ${conditions.tempMax}°C)`;
  if (temp < conditions.tempOptimal[0]) return `Slightly below optimal (optimal: ${conditions.tempOptimal[0]}-${conditions.tempOptimal[1]}°C)`;
  if (temp > conditions.tempOptimal[1]) return `Slightly above optimal (optimal: ${conditions.tempOptimal[0]}-${conditions.tempOptimal[1]}°C)`;
  return `Ideal temperature for growth`;
};

const getHumidityMessage = (humidity, conditions) => {
  if (humidity < conditions.humidityMin) return `Low humidity - may need irrigation`;
  if (humidity > conditions.humidityMax) return `High humidity - risk of fungal diseases`;
  if (humidity < conditions.humidityOptimal[0]) return `Slightly low humidity`;
  if (humidity > conditions.humidityOptimal[1]) return `Slightly high humidity`;
  return `Optimal humidity level`;
};

const getPrecipitationStatus = (precip, conditions) => {
  if (precip >= conditions.rainfallOptimal[0] && precip <= conditions.rainfallOptimal[1]) return 'optimal';
  if (precip < conditions.rainfallOptimal[0]) return 'low';
  if (precip > conditions.rainfallOptimal[1] * 1.5) return 'excessive';
  return 'good';
};

const getPrecipitationMessage = (precip, conditions) => {
  if (precip < conditions.rainfallOptimal[0]) return `Low rainfall - irrigation may be needed`;
  if (precip > conditions.rainfallOptimal[1] * 1.5) return `Excessive rainfall - ensure proper drainage`;
  return `Adequate rainfall for crop needs`;
};

const calculateHarvestScore = (day, conditions) => {
  let score = 100;
  if (day.precipitation > 5) score -= 40; // Rain is bad for harvest
  if (day.windSpeed > conditions.windMax * 0.7) score -= 20;
  if (day.maxTemp > conditions.tempMax) score -= 15;
  if (day.maxTemp < conditions.tempMin) score -= 15;
  return Math.max(score, 0);
};

const calculateSprayScore = (day, nextDay) => {
  let score = 100;
  if (day.precipitation > 2) score -= 50; // Rain washes away spray
  if (nextDay && nextDay.precipitation > 5) score -= 30; // Rain expected soon
  if (day.windSpeed > 15) score -= 30; // Wind drifts spray
  if (day.maxTemp > 30) score -= 15; // Too hot for effective spraying
  return Math.max(score, 0);
};

const calculateFertilizeScore = (day) => {
  let score = 100;
  if (day.precipitation > 0 && day.precipitation < 10) score += 20; // Light rain helps
  if (day.precipitation > 20) score -= 30; // Heavy rain washes away fertilizer
  if (day.maxTemp > 32) score -= 15; // Too hot
  return Math.max(Math.min(score, 100), 0);
};

const getHarvestReason = (day) => {
  if (day.precipitation < 2 && day.windSpeed < 15) return 'Dry and calm conditions';
  if (day.precipitation < 5) return 'Minimal rain expected';
  return 'Moderate conditions';
};

const getSprayReason = (day) => {
  if (day.precipitation < 1 && day.windSpeed < 10) return 'Dry and calm - ideal for spraying';
  if (day.precipitation < 2) return 'Minimal rain - suitable for spraying';
  return 'Moderate conditions';
};

const getFertilizeReason = (day) => {
  if (day.precipitation > 0 && day.precipitation < 10) return 'Light rain expected - perfect for fertilizer';
  if (day.precipitation < 2) return 'Dry conditions - water after application';
  return 'Moderate conditions';
};

const getDayName = (index) => {
  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  return days[index] || `Day ${index + 1}`;
};

export { CROP_TYPES };

