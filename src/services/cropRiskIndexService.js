/**
 * Crop Stress & Yield Risk Index Service
 * 
 * Comprehensive risk scoring system that combines multiple stress factors
 * to provide a unified risk assessment for crop health and yield potential.
 * 
 * Risk Factors:
 * - Heat Stress (30% weight)
 * - Water Stress (30% weight)
 * - Pest/Disease Risk (25% weight)
 * - Wind Damage Risk (15% weight)
 * 
 * Output: Combined Risk Score (0-100)
 * - 0-30: Safe (Low Risk)
 * - 31-60: Moderate Risk
 * - 61-100: High Risk (Critical)
 */

// Weight distribution for different stress factors
const STRESS_WEIGHTS = {
  HEAT: 0.30,      // 30% - Critical for most crops
  WATER: 0.30,     // 30% - Essential for survival
  PEST: 0.25,      // 25% - Can devastate crops quickly
  WIND: 0.15       // 15% - Secondary but significant
}

// Risk thresholds for categorization
export const RISK_CATEGORIES = {
  SAFE: { min: 0, max: 30, label: 'Safe', color: 'green' },
  MODERATE: { min: 31, max: 60, label: 'Moderate Risk', color: 'yellow' },
  HIGH: { min: 61, max: 100, label: 'High Risk', color: 'red' }
}

// Optimal ranges for different crops (can be expanded)
const CROP_OPTIMAL_RANGES = {
  wheat: {
    tempMin: 15, tempMax: 25,
    waterMin: 25, waterMax: 40, // mm per week
    windMax: 35 // km/h
  },
  rice: {
    tempMin: 20, tempMax: 35,
    waterMin: 150, waterMax: 200, // mm per week (water-intensive)
    windMax: 40
  },
  corn: {
    tempMin: 18, tempMax: 30,
    waterMin: 30, waterMax: 50,
    windMax: 40
  },
  cotton: {
    tempMin: 20, tempMax: 35,
    waterMin: 20, waterMax: 35,
    windMax: 35
  },
  soybean: {
    tempMin: 20, tempMax: 30,
    waterMin: 25, waterMax: 45,
    windMax: 35
  },
  default: {
    tempMin: 15, tempMax: 30,
    waterMin: 25, waterMax: 45,
    windMax: 35
  }
}

/**
 * Calculate comprehensive crop risk index
 */
export const calculateCropRiskIndex = (
  weatherData,
  cropType = 'default',
  soilData = null,
  pestRiskData = null
) => {
  if (!weatherData || !weatherData.current) {
    return {
      totalScore: 0,
      category: 'safe',
      breakdown: {},
      recommendations: [],
      timestamp: new Date().toISOString()
    }
  }

  // Ensure daily and historical are arrays
  const daily = Array.isArray(weatherData.daily) ? weatherData.daily : []
  const historical = Array.isArray(weatherData.historical) ? weatherData.historical : []
  const { current } = weatherData
  const cropRanges = CROP_OPTIMAL_RANGES[cropType] || CROP_OPTIMAL_RANGES.default

  // Calculate individual stress scores
  const heatStress = calculateHeatStress(current, daily, cropRanges)
  const waterStress = calculateWaterStress(current, daily, historical, cropRanges, soilData)
  const pestRisk = calculatePestRisk(pestRiskData)
  const windRisk = calculateWindRisk(current, daily, cropRanges)

  // Calculate weighted total score
  const totalScore = Math.round(
    (heatStress.score * STRESS_WEIGHTS.HEAT) +
    (waterStress.score * STRESS_WEIGHTS.WATER) +
    (pestRisk.score * STRESS_WEIGHTS.PEST) +
    (windRisk.score * STRESS_WEIGHTS.WIND)
  )

  // Determine risk category
  const category = getRiskCategory(totalScore)

  // Generate recommendations
  const recommendations = generateRecommendations({
    heatStress,
    waterStress,
    pestRisk,
    windRisk,
    totalScore,
    category
  })

  // Get contributing factors (sorted by severity)
  const contributingFactors = [
    { name: 'Heat Stress', ...heatStress, weight: STRESS_WEIGHTS.HEAT },
    { name: 'Water Stress', ...waterStress, weight: STRESS_WEIGHTS.WATER },
    { name: 'Pest/Disease Risk', ...pestRisk, weight: STRESS_WEIGHTS.PEST },
    { name: 'Wind Damage Risk', ...windRisk, weight: STRESS_WEIGHTS.WIND }
  ].sort((a, b) => b.score - a.score)

  return {
    totalScore,
    category: category.label,
    categoryColor: category.color,
    breakdown: {
      heatStress,
      waterStress,
      pestRisk,
      windRisk
    },
    contributingFactors,
    recommendations,
    timestamp: new Date().toISOString(),
    cropType,
    metadata: {
      temperature: current.temperature,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      precipitation: current.precipitation || 0
    }
  }
}

/**
 * Calculate heat stress score (0-100)
 */
const calculateHeatStress = (current, forecast, cropRanges) => {
  const temp = current.temperature
  const { tempMin, tempMax } = cropRanges
  
  let score = 0
  let severity = 'low'
  let description = ''
  
  // Count days with extreme temperatures
  const forecastTemps = (forecast && Array.isArray(forecast) && forecast.length > 0)
    ? forecast.slice(0, 7).map(d => ({
        max: d.maxTemp || d.temperature,
        min: d.minTemp || d.temperature
      }))
    : []
  
  const hotDays = forecastTemps.filter(d => d.max > tempMax + 5).length
  const veryHotDays = forecastTemps.filter(d => d.max > tempMax + 10).length
  const coldDays = forecastTemps.filter(d => d.min < tempMin - 5).length
  
  // Current temperature scoring
  if (temp > tempMax + 10) {
    score = 90
    severity = 'critical'
    description = `Extreme heat (${temp}°C) - Critical crop stress`
  } else if (temp > tempMax + 5) {
    score = 70
    severity = 'high'
    description = `Very hot (${temp}°C) - High heat stress`
  } else if (temp > tempMax) {
    score = 50
    severity = 'moderate'
    description = `Above optimal range (${temp}°C)`
  } else if (temp < tempMin - 5) {
    score = 75
    severity = 'high'
    description = `Very cold (${temp}°C) - Cold damage risk`
  } else if (temp < tempMin) {
    score = 45
    severity = 'moderate'
    description = `Below optimal range (${temp}°C)`
  } else {
    score = 10
    severity = 'low'
    description = `Optimal temperature (${temp}°C)`
  }
  
  // Adjust for forecast trends
  if (veryHotDays >= 3) {
    score = Math.min(100, score + 20)
    description += ` • ${veryHotDays} extreme heat days ahead`
  } else if (hotDays >= 3) {
    score = Math.min(100, score + 10)
    description += ` • ${hotDays} hot days ahead`
  }
  
  if (coldDays >= 2) {
    score = Math.min(100, score + 15)
    description += ` • ${coldDays} cold days ahead`
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    severity,
    description,
    details: {
      currentTemp: temp,
      optimalRange: `${tempMin}-${tempMax}°C`,
      hotDays,
      coldDays
    }
  }
}

/**
 * Calculate water stress score (0-100)
 */
const calculateWaterStress = (current, forecast, historical, cropRanges, soilData) => {
  let score = 0
  let severity = 'low'
  let description = ''
  
  // Calculate recent rainfall (last 7 days)
  const recentRain = (historical && Array.isArray(historical) && historical.length > 0)
    ? historical.slice(-7).reduce((sum, day) => sum + (day.precipitation || 0), 0)
    : 0
  
  // Calculate upcoming rainfall (next 7 days)
  const upcomingRain = (forecast && Array.isArray(forecast) && forecast.length > 0)
    ? forecast.slice(0, 7).reduce((sum, day) => sum + (day.precipitation || 0), 0)
    : 0
  
  const totalWeeklyRain = recentRain + upcomingRain
  const { waterMin, waterMax } = cropRanges
  
  // Soil moisture factor
  let soilMoistureFactor = 0
  if (soilData && soilData.moistureLevel) {
    if (soilData.moistureLevel < 30) {
      soilMoistureFactor = 30 // Dry soil adds to stress
    } else if (soilData.moistureLevel > 80) {
      soilMoistureFactor = 20 // Waterlogged soil
    }
  }
  
  // Drought conditions
  if (totalWeeklyRain < waterMin * 0.5) {
    score = 85 + soilMoistureFactor
    severity = 'critical'
    description = `Severe drought (${totalWeeklyRain.toFixed(1)}mm vs ${waterMin}mm needed)`
  } else if (totalWeeklyRain < waterMin) {
    score = 60 + soilMoistureFactor
    severity = 'high'
    description = `Water deficit (${totalWeeklyRain.toFixed(1)}mm vs ${waterMin}mm needed)`
  } else if (totalWeeklyRain > waterMax * 2) {
    score = 75
    severity = 'high'
    description = `Excessive rainfall (${totalWeeklyRain.toFixed(1)}mm) - Waterlogging risk`
  } else if (totalWeeklyRain > waterMax) {
    score = 50
    severity = 'moderate'
    description = `High rainfall (${totalWeeklyRain.toFixed(1)}mm) - Monitor drainage`
  } else {
    score = 15
    severity = 'low'
    description = `Adequate water (${totalWeeklyRain.toFixed(1)}mm)`
  }
  
  // Check for consecutive dry days
  const dryDays = (historical && Array.isArray(historical) && historical.length > 0)
    ? historical.slice(-7).filter(d => (d.precipitation || 0) < 2).length
    : 0
  
  if (dryDays >= 5 && totalWeeklyRain < waterMin) {
    score = Math.min(100, score + 15)
    description += ` • ${dryDays} consecutive dry days`
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    severity,
    description,
    details: {
      recentRain: recentRain.toFixed(1),
      upcomingRain: upcomingRain.toFixed(1),
      totalWeeklyRain: totalWeeklyRain.toFixed(1),
      optimalRange: `${waterMin}-${waterMax}mm/week`,
      dryDays,
      soilMoisture: soilData?.moistureLevel || 'N/A'
    }
  }
}

/**
 * Calculate pest/disease risk score (0-100)
 */
const calculatePestRisk = (pestRiskData) => {
  if (!pestRiskData || !pestRiskData.riskScore) {
    return {
      score: 0,
      severity: 'low',
      description: 'No pest risk data available',
      details: {}
    }
  }
  
  const { riskScore, overallRisk, highRiskCount } = pestRiskData
  
  let severity = 'low'
  if (riskScore >= 85) severity = 'critical'
  else if (riskScore >= 70) severity = 'high'
  else if (riskScore >= 40) severity = 'moderate'
  
  const description = highRiskCount > 0
    ? `${highRiskCount} high-risk threat(s) detected (${riskScore}/100)`
    : `Low pest pressure (${riskScore}/100)`
  
  return {
    score: riskScore,
    severity,
    description,
    details: {
      overallRisk,
      highRiskCount,
      riskScore
    }
  }
}

/**
 * Calculate wind damage risk score (0-100)
 */
const calculateWindRisk = (current, forecast, cropRanges) => {
  const currentWind = current.windSpeed || 0
  const { windMax } = cropRanges
  
  let score = 0
  let severity = 'low'
  let description = ''
  
  // Get max wind speed in forecast
  const forecastWinds = (forecast && Array.isArray(forecast) && forecast.length > 0)
    ? forecast.slice(0, 3).map(d => d.windSpeed || 0)
    : []
  const maxWind = forecastWinds.length > 0 ? Math.max(currentWind, ...forecastWinds) : currentWind
  const highWindDays = forecastWinds.filter(w => w > windMax).length
  
  if (maxWind > windMax + 25) {
    score = 95
    severity = 'critical'
    description = `Extreme winds (${maxWind} km/h) - Severe lodging risk`
  } else if (maxWind > windMax + 15) {
    score = 75
    severity = 'high'
    description = `Very strong winds (${maxWind} km/h) - High damage risk`
  } else if (maxWind > windMax) {
    score = 50
    severity = 'moderate'
    description = `Strong winds (${maxWind} km/h) - Monitor crops`
  } else if (maxWind > windMax * 0.7) {
    score = 25
    severity = 'low'
    description = `Moderate winds (${maxWind} km/h)`
  } else {
    score = 5
    severity = 'low'
    description = `Calm conditions (${maxWind} km/h)`
  }
  
  // Adjust for sustained high winds
  if (highWindDays >= 2) {
    score = Math.min(100, score + 20)
    description += ` • ${highWindDays} high-wind days`
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    severity,
    description,
    details: {
      currentWind,
      maxWind,
      optimalMax: `<${windMax} km/h`,
      highWindDays
    }
  }
}

/**
 * Get risk category from score
 */
const getRiskCategory = (score) => {
  if (score <= RISK_CATEGORIES.SAFE.max) {
    return RISK_CATEGORIES.SAFE
  } else if (score <= RISK_CATEGORIES.MODERATE.max) {
    return RISK_CATEGORIES.MODERATE
  } else {
    return RISK_CATEGORIES.HIGH
  }
}

/**
 * Generate actionable recommendations
 */
const generateRecommendations = (stressData) => {
  const { heatStress, waterStress, pestRisk, windRisk, totalScore, category } = stressData
  const recommendations = []
  
  // Overall status
  if (category === 'High Risk') {
    recommendations.push({
      priority: 'critical',
      icon: '🚨',
      message: 'CRITICAL: Immediate action required to protect crops',
      actions: ['Assess crop condition', 'Implement emergency measures', 'Monitor continuously']
    })
  } else if (category === 'Moderate Risk') {
    recommendations.push({
      priority: 'high',
      icon: '⚠️',
      message: 'CAUTION: Elevated risk - Take preventive measures',
      actions: ['Increase monitoring frequency', 'Prepare contingency plans', 'Review farming practices']
    })
  } else {
    recommendations.push({
      priority: 'low',
      icon: '✅',
      message: 'CONDITIONS FAVORABLE: Continue normal operations',
      actions: ['Maintain current practices', 'Regular monitoring', 'Stay informed of forecast changes']
    })
  }
  
  // Heat stress recommendations
  if (heatStress.score > 60) {
    recommendations.push({
      priority: 'high',
      icon: '🌡️',
      message: 'Heat Stress Management',
      actions: [
        '💧 Increase irrigation frequency',
        '🌿 Apply mulch to reduce soil temperature',
        '⏰ Schedule activities during cooler hours',
        '🌱 Consider shade cloth for sensitive crops'
      ]
    })
  }
  
  // Water stress recommendations
  if (waterStress.score > 60) {
    if (waterStress.description.includes('drought') || waterStress.description.includes('deficit')) {
      recommendations.push({
        priority: 'high',
        icon: '💧',
        message: 'Water Deficit Management',
        actions: [
          '🚰 Implement water conservation measures',
          '🌾 Prioritize irrigation for critical crops',
          '🌱 Apply mulch to retain moisture',
          '📊 Monitor soil moisture daily'
        ]
      })
    } else if (waterStress.description.includes('Excessive')) {
      recommendations.push({
        priority: 'high',
        icon: '🌊',
        message: 'Excess Water Management',
        actions: [
          '🚧 Check and clear drainage systems',
          '⏸️ Stop irrigation activities',
          '🌾 Avoid field operations until soil dries',
          '👀 Watch for waterlogging symptoms'
        ]
      })
    }
  }
  
  // Pest risk recommendations
  if (pestRisk.score > 60) {
    recommendations.push({
      priority: 'high',
      icon: '🐛',
      message: 'Pest/Disease Management',
      actions: [
        '🔍 Scout fields daily for pest signs',
        '🌿 Implement IPM strategies',
        '🚜 Prepare pest control equipment',
        '📞 Consult agricultural extension officer'
      ]
    })
  }
  
  // Wind risk recommendations
  if (windRisk.score > 50) {
    recommendations.push({
      priority: 'medium',
      icon: '💨',
      message: 'Wind Damage Prevention',
      actions: [
        '🌾 Stake tall or heavy crops',
        '🏠 Secure farm structures',
        '⏸️ Postpone spraying operations',
        '📦 Move loose equipment indoors'
      ]
    })
  }
  
  return recommendations
}

/**
 * Get color for risk score (for gradients)
 */
export const getRiskColor = (score) => {
  if (score <= 30) {
    return { start: '#10b981', end: '#34d399', name: 'green' } // Green
  } else if (score <= 60) {
    return { start: '#f59e0b', end: '#fbbf24', name: 'yellow' } // Yellow/Amber
  } else {
    return { start: '#ef4444', end: '#f87171', name: 'red' } // Red
  }
}

/**
 * Get risk status text
 */
export const getRiskStatusText = (score) => {
  if (score <= 30) return 'Excellent conditions - Crops thriving'
  if (score <= 40) return 'Good conditions - Minor stress'
  if (score <= 50) return 'Fair conditions - Monitor closely'
  if (score <= 60) return 'Elevated risk - Take action'
  if (score <= 75) return 'High risk - Immediate action needed'
  return 'Critical risk - Emergency measures required'
}

