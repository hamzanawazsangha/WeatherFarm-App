/**
 * Soil Moisture & Irrigation Recommendation Service
 * 
 * Uses simple, rule-based logic to estimate soil moisture and provide
 * irrigation recommendations based on weather data.
 */

/**
 * Calculate soil moisture level and irrigation recommendation
 * @param {Object} weatherData - Comprehensive farming weather data
 * @returns {Object} Soil moisture analysis and recommendation
 */
export const analyzeSoilMoisture = (weatherData) => {
  if (!weatherData || !weatherData.current) {
    return getDefaultRecommendation();
  }

  const { current } = weatherData;
  const historical = weatherData.historical || {};
  const daily = Array.isArray(weatherData.daily) ? weatherData.daily : [];
  
  // Step 1: Calculate recent rainfall impact (last 7 days available)
  const recentRainfall = historical.totalRainfall || 0;
  const avgDailyRain = historical.averageDailyRainfall || 0;
  
  // Step 2: Get today's conditions
  const todayTemp = current.temperature || 0;
  const todayWindSpeed = current.windSpeed || 0;
  const todayHumidity = current.humidity || 0;
  
  // Step 3: Check upcoming rain (next 3 days)
  const upcomingRain = daily.length > 0 
    ? daily.slice(0, 3).reduce((sum, day) => sum + (day.rain || day.precipitation || 0), 0)
    : 0;
  const upcomingRainProbability = daily.length > 0
    ? daily.slice(0, 3).reduce((max, day) => Math.max(max, day.precipitationProbability || 0), 0)
    : 0;
  
  // Step 4: Get ET0 (water loss) for today
  const todayET0 = daily.length > 0 ? (daily[0]?.evapotranspiration || 0) : 0;
  
  // Step 5: Calculate moisture score (0-100)
  const moistureScore = calculateMoistureScore({
    recentRainfall,
    avgDailyRain,
    temperature: todayTemp,
    windSpeed: todayWindSpeed,
    humidity: todayHumidity,
    et0: todayET0,
    upcomingRain
  });
  
  // Step 6: Determine moisture level
  const moistureLevel = getMoistureLevel(moistureScore);
  
  // Step 7: Generate irrigation recommendation
  const recommendation = getIrrigationRecommendation({
    moistureScore,
    moistureLevel,
    upcomingRain,
    upcomingRainProbability,
    todayET0,
    recentRainfall,
    temperature: todayTemp
  });
  
  return {
    moistureLevel: moistureLevel.level,
    moistureScore: Math.round(moistureScore),
    moistureDescription: moistureLevel.description,
    recommendation: recommendation.action,
    priority: recommendation.priority,
    explanation: recommendation.explanation,
    details: {
      recentRainfall: Math.round(recentRainfall * 10) / 10,
      avgDailyRain: Math.round(avgDailyRain * 10) / 10,
      upcomingRain: Math.round(upcomingRain * 10) / 10,
      upcomingRainProbability,
      todayET0: Math.round(todayET0 * 10) / 10,
      currentTemp: todayTemp,
      currentHumidity: todayHumidity,
      currentWindSpeed: todayWindSpeed
    },
    icon: recommendation.icon,
    color: recommendation.color
  };
};

/**
 * Calculate moisture score based on multiple factors
 * Score: 0 (very dry) to 100 (saturated)
 */
const calculateMoistureScore = ({
  recentRainfall,
  avgDailyRain,
  temperature,
  windSpeed,
  humidity,
  et0,
  upcomingRain
}) => {
  let score = 50; // Start at medium
  
  // Factor 1: Recent rainfall (most important) - up to ±30 points
  if (recentRainfall > 50) {
    score += 30; // Very wet
  } else if (recentRainfall > 30) {
    score += 20; // Wet
  } else if (recentRainfall > 15) {
    score += 10; // Adequate
  } else if (recentRainfall > 7) {
    score += 0; // Normal
  } else if (recentRainfall > 3) {
    score -= 10; // Dry
  } else {
    score -= 20; // Very dry
  }
  
  // Factor 2: Daily rain average - up to ±10 points
  if (avgDailyRain > 7) {
    score += 10; // Consistently wet
  } else if (avgDailyRain > 3) {
    score += 5; // Regular rain
  } else if (avgDailyRain < 1) {
    score -= 10; // Consistently dry
  }
  
  // Factor 3: Temperature impact - up to ±15 points
  if (temperature > 35) {
    score -= 15; // Extreme heat dries soil
  } else if (temperature > 30) {
    score -= 10; // High heat
  } else if (temperature > 25) {
    score -= 5; // Moderate heat
  } else if (temperature < 15) {
    score += 5; // Cool temps preserve moisture
  }
  
  // Factor 4: Wind speed impact - up to ±10 points
  if (windSpeed > 30) {
    score -= 10; // High wind dries soil
  } else if (windSpeed > 20) {
    score -= 5; // Moderate wind
  }
  
  // Factor 5: Humidity impact - up to ±10 points
  if (humidity > 80) {
    score += 10; // High humidity preserves moisture
  } else if (humidity > 60) {
    score += 5; // Moderate humidity
  } else if (humidity < 40) {
    score -= 10; // Low humidity increases evaporation
  } else if (humidity < 50) {
    score -= 5;
  }
  
  // Factor 6: ET0 (water loss) - up to ±10 points
  if (et0 > 7) {
    score -= 10; // High water loss
  } else if (et0 > 5) {
    score -= 5; // Moderate water loss
  } else if (et0 < 3) {
    score += 5; // Low water loss
  }
  
  // Factor 7: Upcoming rain (predictive) - up to ±15 points
  if (upcomingRain > 20) {
    score += 15; // Heavy rain expected
  } else if (upcomingRain > 10) {
    score += 10; // Moderate rain expected
  } else if (upcomingRain > 5) {
    score += 5; // Some rain expected
  }
  
  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
};

/**
 * Determine moisture level from score
 */
const getMoistureLevel = (score) => {
  if (score >= 70) {
    return {
      level: 'High',
      description: 'Soil is well saturated with moisture',
      status: 'excellent'
    };
  } else if (score >= 50) {
    return {
      level: 'Medium',
      description: 'Soil has adequate moisture levels',
      status: 'good'
    };
  } else if (score >= 30) {
    return {
      level: 'Medium-Low',
      description: 'Soil moisture is below optimal',
      status: 'fair'
    };
  } else {
    return {
      level: 'Low',
      description: 'Soil is dry and needs water',
      status: 'poor'
    };
  }
};

/**
 * Generate irrigation recommendation
 */
const getIrrigationRecommendation = ({
  moistureScore,
  moistureLevel,
  upcomingRain,
  upcomingRainProbability,
  todayET0,
  recentRainfall,
  temperature
}) => {
  // Rule 1: High soil moisture - Don't irrigate
  if (moistureScore >= 70) {
    return {
      action: 'Do Not Irrigate',
      priority: 'low',
      explanation: 'Soil moisture is excellent. No irrigation needed. Overwatering can harm crops and waste water.',
      icon: '✅',
      color: 'green'
    };
  }
  
  // Rule 2: Heavy rain expected - Delay irrigation
  if (upcomingRain > 15 && upcomingRainProbability > 70) {
    return {
      action: 'Delay Irrigation',
      priority: 'low',
      explanation: `Heavy rain expected (${Math.round(upcomingRain)}mm, ${upcomingRainProbability}% probability). Wait for natural rainfall before irrigating.`,
      icon: '⛈️',
      color: 'blue'
    };
  }
  
  // Rule 3: Moderate rain expected with adequate moisture - Delay
  if (upcomingRain > 10 && upcomingRainProbability > 60 && moistureScore >= 40) {
    return {
      action: 'Delay Irrigation',
      priority: 'low',
      explanation: `Moderate rain likely (${Math.round(upcomingRain)}mm, ${upcomingRainProbability}% probability). Current moisture is adequate. Monitor and irrigate after rain if needed.`,
      icon: '🌧️',
      color: 'blue'
    };
  }
  
  // Rule 4: Low moisture, no rain - Irrigate urgently
  if (moistureScore < 30 && upcomingRain < 5) {
    const amount = Math.max(15, todayET0 * 2); // At least 15mm or double ET0
    return {
      action: 'Irrigate Today',
      priority: 'high',
      explanation: `Soil is dry (moisture: ${Math.round(moistureScore)}%). Little rain expected. Apply approximately ${Math.round(amount)}mm water to restore optimal moisture.`,
      icon: '🚨',
      color: 'red'
    };
  }
  
  // Rule 5: Medium-low moisture, high ET0 - Irrigate
  if (moistureScore < 45 && todayET0 > 5) {
    const amount = Math.round(todayET0 * 1.5);
    return {
      action: 'Irrigate Today',
      priority: 'medium',
      explanation: `Soil moisture below optimal and high water loss expected (ET0: ${todayET0}mm). Apply approximately ${amount}mm water to maintain healthy crop growth.`,
      icon: '💧',
      color: 'orange'
    };
  }
  
  // Rule 6: Low moisture, some rain expected - Light irrigation
  if (moistureScore < 40 && upcomingRain > 5) {
    const amount = Math.round(Math.max(5, todayET0 - upcomingRain));
    return {
      action: 'Light Irrigation',
      priority: 'medium',
      explanation: `Soil moisture is low but rain expected (${Math.round(upcomingRain)}mm). Apply light irrigation (~${amount}mm) now, then reassess after rain.`,
      icon: '💦',
      color: 'yellow'
    };
  }
  
  // Rule 7: Medium moisture, moderate conditions - Monitor
  if (moistureScore >= 45 && moistureScore < 60) {
    return {
      action: 'Monitor Closely',
      priority: 'low',
      explanation: 'Soil moisture is adequate for now. Monitor daily and be ready to irrigate if no rain occurs within 2-3 days.',
      icon: '👁️',
      color: 'yellow'
    };
  }
  
  // Rule 8: Extreme heat conditions
  if (temperature > 35 && moistureScore < 50) {
    return {
      action: 'Irrigate Today',
      priority: 'high',
      explanation: `Extreme heat (${temperature}°C) is rapidly drying soil. Irrigate to prevent heat stress on crops. Consider evening irrigation to minimize evaporation.`,
      icon: '🔥',
      color: 'red'
    };
  }
  
  // Default: Good conditions
  return {
    action: 'No Action Needed',
    priority: 'low',
    explanation: 'Soil moisture is good. Continue regular monitoring. Next irrigation may be needed in 3-5 days depending on weather.',
    icon: '✅',
    color: 'green'
  };
};

/**
 * Get default recommendation when data is unavailable
 */
const getDefaultRecommendation = () => {
  return {
    moistureLevel: 'Unknown',
    moistureScore: 50,
    moistureDescription: 'Unable to calculate soil moisture',
    recommendation: 'Monitor Manually',
    priority: 'medium',
    explanation: 'Weather data unavailable. Check soil manually by feeling the soil 6 inches deep. If dry, irrigate. If moist, wait 1-2 days.',
    details: {},
    icon: '❓',
    color: 'gray'
  };
};

/**
 * Get irrigation schedule for next 7 days
 */
export const getIrrigationSchedule = (weatherData) => {
  if (!weatherData || !weatherData.daily) {
    return [];
  }

  const schedule = [];
  const { daily } = weatherData;

  daily.forEach((day, index) => {
    const needsIrrigation = day.irrigationNeed > 5;
    const highRainProbability = day.precipitationProbability > 70;
    
    let action, priority, note;
    
    if (highRainProbability) {
      action = 'Skip - Rain Expected';
      priority = 'low';
      note = `${day.precipitationProbability}% chance of ${day.rain}mm rain`;
    } else if (needsIrrigation && day.irrigationNeed > 10) {
      action = `Irrigate ${day.irrigationNeed}mm`;
      priority = 'high';
      note = `High water deficit (ET0: ${day.evapotranspiration}mm, Rain: ${day.rain}mm)`;
    } else if (needsIrrigation) {
      action = `Irrigate ${day.irrigationNeed}mm`;
      priority = 'medium';
      note = `Moderate water deficit (ET0: ${day.evapotranspiration}mm, Rain: ${day.rain}mm)`;
    } else if (day.rain > 0) {
      action = 'No irrigation needed';
      priority = 'low';
      note = `Expected rain: ${day.rain}mm will cover ET0`;
    } else {
      action = 'Monitor';
      priority = 'low';
      note = `Low water demand (ET0: ${day.evapotranspiration}mm)`;
    }

    schedule.push({
      date: day.date,
      dayName: day.dayName,
      action,
      priority,
      note,
      irrigationAmount: needsIrrigation ? day.irrigationNeed : 0,
      et0: day.evapotranspiration,
      expectedRain: day.rain,
      rainProbability: day.precipitationProbability
    });
  });

  return schedule;
};

export default {
  analyzeSoilMoisture,
  getIrrigationSchedule
};

