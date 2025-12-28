/**
 * Early Warning & Disaster Alert Engine
 * 
 * Analyzes weather data and farming conditions to generate
 * real-time alerts for potential disasters and critical events.
 * 
 * Alert Types:
 * - Heatwave stress
 * - Flood risk
 * - Frost damage
 * - High wind lodging
 * - Pest outbreak
 * - Irrigation stop warning
 */

// Alert severity levels
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Alert categories
export const ALERT_CATEGORIES = {
  WEATHER: 'weather',
  PEST: 'pest',
  IRRIGATION: 'irrigation',
  DISASTER: 'disaster'
}

// Alert type definitions
export const ALERT_TYPES = {
  HEATWAVE: 'heatwave',
  FLOOD: 'flood',
  FROST: 'frost',
  HIGH_WIND: 'high_wind',
  PEST_OUTBREAK: 'pest_outbreak',
  IRRIGATION_STOP: 'irrigation_stop',
  HEAVY_RAIN: 'heavy_rain',
  DROUGHT: 'drought'
}

/**
 * Alert thresholds configuration
 */
const ALERT_THRESHOLDS = {
  // Temperature thresholds
  HEATWAVE_TEMP: 35, // °C
  HEATWAVE_DURATION: 3, // consecutive days
  FROST_TEMP: 2, // °C
  EXTREME_COLD: -5, // °C
  
  // Precipitation thresholds
  FLOOD_DAILY_RAIN: 50, // mm per day
  FLOOD_3DAY_RAIN: 100, // mm in 3 days
  HEAVY_RAIN: 30, // mm per day
  DROUGHT_DAYS: 14, // days without rain
  
  // Wind thresholds
  HIGH_WIND_SPEED: 40, // km/h
  EXTREME_WIND_SPEED: 60, // km/h
  
  // Humidity thresholds
  HIGH_HUMIDITY: 85, // %
  LOW_HUMIDITY: 30, // %
  
  // Pest outbreak risk score
  PEST_RISK_HIGH: 70, // out of 100
  PEST_RISK_CRITICAL: 85, // out of 100
  
  // Irrigation thresholds
  IRRIGATION_STOP_RAIN: 20, // mm expected in next 48h
  SOIL_MOISTURE_LOW: 30 // %
}

/**
 * Generate all alerts based on weather data and farming conditions
 */
export const generateAlerts = (weatherData, cropType = null, soilData = null, pestRisk = null) => {
  const alerts = []
  
  if (!weatherData || !weatherData.current) {
    return alerts
  }
  
  const { current, forecast = [], historical = [] } = weatherData
  
  // 1. Heatwave Stress Alert
  const heatwaveAlert = checkHeatwave(current, forecast)
  if (heatwaveAlert) alerts.push(heatwaveAlert)
  
  // 2. Flood Risk Alert
  const floodAlert = checkFloodRisk(current, forecast, historical)
  if (floodAlert) alerts.push(floodAlert)
  
  // 3. Frost Damage Alert
  const frostAlert = checkFrostRisk(current, forecast)
  if (frostAlert) alerts.push(frostAlert)
  
  // 4. High Wind Lodging Alert
  const windAlert = checkHighWind(current, forecast)
  if (windAlert) alerts.push(windAlert)
  
  // 5. Heavy Rain Alert
  const rainAlert = checkHeavyRain(current, forecast)
  if (rainAlert) alerts.push(rainAlert)
  
  // 6. Drought Alert
  const droughtAlert = checkDrought(current, forecast, historical)
  if (droughtAlert) alerts.push(droughtAlert)
  
  // 7. Pest Outbreak Alert (if pest risk data available)
  if (pestRisk && cropType) {
    const pestAlert = checkPestOutbreak(pestRisk, cropType)
    if (pestAlert) alerts.push(pestAlert)
  }
  
  // 8. Irrigation Stop Warning (if soil data available)
  if (soilData) {
    const irrigationAlert = checkIrrigationStop(current, forecast, soilData)
    if (irrigationAlert) alerts.push(irrigationAlert)
  }
  
  // Add timestamps and IDs to all alerts
  return alerts.map((alert, index) => ({
    ...alert,
    id: `alert_${Date.now()}_${index}`,
    timestamp: new Date().toISOString(),
    isRead: false,
    isActive: true
  }))
}

/**
 * Check for heatwave conditions
 */
const checkHeatwave = (current, forecast) => {
  const currentTemp = current.temperature
  const forecastHighTemps = forecast.slice(0, 5).map(d => d.maxTemp || d.temperature)
  
  // Count consecutive hot days
  let hotDays = currentTemp >= ALERT_THRESHOLDS.HEATWAVE_TEMP ? 1 : 0
  for (const temp of forecastHighTemps) {
    if (temp >= ALERT_THRESHOLDS.HEATWAVE_TEMP) {
      hotDays++
    } else {
      break
    }
  }
  
  if (hotDays >= ALERT_THRESHOLDS.HEATWAVE_DURATION) {
    const severity = hotDays >= 5 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH
    return {
      type: ALERT_TYPES.HEATWAVE,
      category: ALERT_CATEGORIES.DISASTER,
      severity,
      title: '🌡️ Heatwave Alert',
      message: `Extreme heat expected for ${hotDays} consecutive days (${Math.max(...[currentTemp, ...forecastHighTemps])}°C peak)`,
      details: [
        `Current temperature: ${currentTemp}°C`,
        `Expected hot days: ${hotDays}`,
        `Peak temperature: ${Math.max(...[currentTemp, ...forecastHighTemps])}°C`
      ],
      recommendations: [
        '💧 Increase irrigation frequency',
        '🌿 Provide shade for sensitive crops',
        '⏰ Work during cooler hours (early morning/evening)',
        '🚰 Ensure adequate water supply for livestock',
        '🌱 Apply mulch to retain soil moisture'
      ],
      impact: 'High risk of crop stress, wilting, and reduced yield',
      expiresAt: new Date(Date.now() + hotDays * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for flood risk
 */
const checkFloodRisk = (current, forecast, historical) => {
  const currentRain = current.precipitation || 0
  const forecastRain = forecast.slice(0, 3).reduce((sum, d) => sum + (d.precipitation || 0), 0)
  const totalRain3Days = currentRain + forecastRain
  
  // Check daily flood risk
  const maxDailyRain = Math.max(currentRain, ...forecast.slice(0, 3).map(d => d.precipitation || 0))
  
  if (maxDailyRain >= ALERT_THRESHOLDS.FLOOD_DAILY_RAIN || totalRain3Days >= ALERT_THRESHOLDS.FLOOD_3DAY_RAIN) {
    const severity = maxDailyRain >= ALERT_THRESHOLDS.FLOOD_DAILY_RAIN ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH
    return {
      type: ALERT_TYPES.FLOOD,
      category: ALERT_CATEGORIES.DISASTER,
      severity,
      title: '💦 Flood Risk Alert',
      message: `Heavy rainfall expected: ${totalRain3Days.toFixed(1)}mm in next 3 days (max ${maxDailyRain.toFixed(1)}mm/day)`,
      details: [
        `Current rainfall: ${currentRain.toFixed(1)}mm`,
        `Next 3 days total: ${totalRain3Days.toFixed(1)}mm`,
        `Highest single-day: ${maxDailyRain.toFixed(1)}mm`
      ],
      recommendations: [
        '🚧 Check and clear drainage systems',
        '📦 Move equipment to higher ground',
        '🌊 Create water diversion channels',
        '🌾 Harvest mature crops if possible',
        '⚠️ Prepare for possible waterlogging',
        '🏠 Secure farm structures and livestock shelters'
      ],
      impact: 'Risk of waterlogging, soil erosion, and crop damage',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for frost risk
 */
const checkFrostRisk = (current, forecast) => {
  const currentTemp = current.temperature
  const minTemps = forecast.slice(0, 3).map(d => d.minTemp || d.temperature)
  const lowestTemp = Math.min(currentTemp, ...minTemps)
  
  if (lowestTemp <= ALERT_THRESHOLDS.FROST_TEMP) {
    const severity = lowestTemp <= ALERT_THRESHOLDS.EXTREME_COLD ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH
    const daysAtRisk = minTemps.filter(t => t <= ALERT_THRESHOLDS.FROST_TEMP).length
    
    return {
      type: ALERT_TYPES.FROST,
      category: ALERT_CATEGORIES.DISASTER,
      severity,
      title: '❄️ Frost Damage Alert',
      message: `Freezing temperatures expected: ${lowestTemp}°C (${daysAtRisk} days at risk)`,
      details: [
        `Current temperature: ${currentTemp}°C`,
        `Lowest expected: ${lowestTemp}°C`,
        `Days below ${ALERT_THRESHOLDS.FROST_TEMP}°C: ${daysAtRisk}`
      ],
      recommendations: [
        '🔥 Use frost protection methods (covers, heaters)',
        '💨 Run wind machines to mix air layers',
        '💧 Light irrigation before frost (ice = insulation)',
        '🌿 Cover sensitive plants with cloth/plastic',
        '📅 Delay planting if possible',
        '🚜 Prepare to harvest before frost hits'
      ],
      impact: 'Severe risk of crop damage, especially for tender plants',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for high wind conditions
 */
const checkHighWind = (current, forecast) => {
  const currentWind = current.windSpeed || 0
  const maxWind = Math.max(currentWind, ...forecast.slice(0, 2).map(d => d.windSpeed || 0))
  
  if (maxWind >= ALERT_THRESHOLDS.HIGH_WIND_SPEED) {
    const severity = maxWind >= ALERT_THRESHOLDS.EXTREME_WIND_SPEED ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH
    
    return {
      type: ALERT_TYPES.HIGH_WIND,
      category: ALERT_CATEGORIES.DISASTER,
      severity,
      title: '💨 High Wind Alert',
      message: `Strong winds expected: ${maxWind} km/h (risk of crop lodging)`,
      details: [
        `Current wind speed: ${currentWind} km/h`,
        `Peak wind speed: ${maxWind} km/h`,
        `Wind direction: ${current.windDirection || 'N/A'}°`
      ],
      recommendations: [
        '🌾 Stake tall crops if possible',
        '🏠 Secure farm structures and equipment',
        '📦 Move loose items indoors',
        '🌱 Delay spraying operations',
        '🚜 Postpone harvesting mature grain crops',
        '⚠️ Check and reinforce plant supports'
      ],
      impact: 'Risk of crop lodging, broken stems, and structural damage',
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for heavy rain
 */
const checkHeavyRain = (current, forecast) => {
  const maxRain = Math.max(
    current.precipitation || 0,
    ...forecast.slice(0, 2).map(d => d.precipitation || 0)
  )
  
  if (maxRain >= ALERT_THRESHOLDS.HEAVY_RAIN && maxRain < ALERT_THRESHOLDS.FLOOD_DAILY_RAIN) {
    return {
      type: ALERT_TYPES.HEAVY_RAIN,
      category: ALERT_CATEGORIES.WEATHER,
      severity: ALERT_SEVERITY.MEDIUM,
      title: '🌧️ Heavy Rain Alert',
      message: `Heavy rainfall expected: ${maxRain.toFixed(1)}mm`,
      details: [
        `Expected rainfall: ${maxRain.toFixed(1)}mm`,
        `Rain probability: ${forecast[0]?.rainProbability || 'N/A'}%`
      ],
      recommendations: [
        '⏸️ Postpone irrigation',
        '🚫 Avoid field operations (soil compaction risk)',
        '🌱 Delay fertilizer application',
        '🚜 Wait for soil to dry before working'
      ],
      impact: 'Moderate risk of soil compaction and nutrient leaching',
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for drought conditions
 */
const checkDrought = (current, forecast, historical) => {
  // Count days without significant rain
  let daysWithoutRain = 0
  
  // Check historical data
  if (historical && historical.length > 0) {
    for (let i = historical.length - 1; i >= 0; i--) {
      if ((historical[i].precipitation || 0) < 2) {
        daysWithoutRain++
      } else {
        break
      }
    }
  }
  
  // Check forecast
  const forecastDryDays = forecast.slice(0, 7).filter(d => (d.precipitation || 0) < 2).length
  const totalDryDays = daysWithoutRain + forecastDryDays
  
  if (totalDryDays >= ALERT_THRESHOLDS.DROUGHT_DAYS) {
    const severity = totalDryDays >= 21 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH
    
    return {
      type: ALERT_TYPES.DROUGHT,
      category: ALERT_CATEGORIES.WEATHER,
      severity,
      title: '☀️ Drought Alert',
      message: `Extended dry period: ${totalDryDays} days without significant rain`,
      details: [
        `Past dry days: ${daysWithoutRain}`,
        `Forecast dry days: ${forecastDryDays}`,
        `Total dry period: ${totalDryDays} days`,
        `Current temperature: ${current.temperature}°C`
      ],
      recommendations: [
        '💧 Implement water conservation measures',
        '🌾 Prioritize irrigation for critical crops',
        '🌱 Apply mulch to reduce evaporation',
        '📅 Consider drought-resistant crop varieties',
        '🚰 Monitor water sources and storage',
        '⏰ Irrigate during cooler hours'
      ],
      impact: 'High risk of crop stress, reduced yield, and water shortage',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for pest outbreak risk
 */
const checkPestOutbreak = (pestRisk, cropType) => {
  if (!pestRisk || !pestRisk.riskScore) return null
  
  const { riskScore, overallRisk, highRiskCount, risks = [] } = pestRisk
  
  if (riskScore >= ALERT_THRESHOLDS.PEST_RISK_HIGH) {
    const severity = riskScore >= ALERT_THRESHOLDS.PEST_RISK_CRITICAL ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH
    const topThreats = risks.slice(0, 3).map(r => r.name).join(', ')
    
    return {
      type: ALERT_TYPES.PEST_OUTBREAK,
      category: ALERT_CATEGORIES.PEST,
      severity,
      title: '🐛 Pest Outbreak Alert',
      message: `High pest/disease risk for ${cropType} (Score: ${riskScore}/100)`,
      details: [
        `Risk level: ${overallRisk}`,
        `High-risk threats: ${highRiskCount}`,
        `Top threats: ${topThreats}`,
        `Crop: ${cropType}`
      ],
      recommendations: [
        '🔍 Scout fields daily for pest signs',
        '🐛 Prepare pest control measures',
        '📋 Follow IPM (Integrated Pest Management)',
        '🌿 Consider preventive treatments',
        '📞 Consult agricultural extension officer',
        '🚜 Keep spraying equipment ready'
      ],
      impact: 'High risk of pest/disease outbreak and crop damage',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Check for irrigation stop conditions
 */
const checkIrrigationStop = (current, forecast, soilData) => {
  const upcomingRain = forecast.slice(0, 2).reduce((sum, d) => sum + (d.precipitation || 0), 0)
  const soilMoisture = soilData.moistureLevel || 0
  
  if (upcomingRain >= ALERT_THRESHOLDS.IRRIGATION_STOP_RAIN && soilMoisture > ALERT_THRESHOLDS.SOIL_MOISTURE_LOW) {
    return {
      type: ALERT_TYPES.IRRIGATION_STOP,
      category: ALERT_CATEGORIES.IRRIGATION,
      severity: ALERT_SEVERITY.MEDIUM,
      title: '🚫 Irrigation Stop Warning',
      message: `Stop irrigation - ${upcomingRain.toFixed(1)}mm rain expected in next 48 hours`,
      details: [
        `Expected rainfall: ${upcomingRain.toFixed(1)}mm`,
        `Current soil moisture: ${soilMoisture}%`,
        `Rain probability: ${forecast[0]?.rainProbability || 'N/A'}%`
      ],
      recommendations: [
        '⏸️ Pause all irrigation activities',
        '💰 Save water and reduce costs',
        '🌱 Let natural rain water your crops',
        '📅 Resume irrigation after rain stops',
        '🔧 Use this time for equipment maintenance'
      ],
      impact: 'Save water, reduce costs, avoid waterlogging',
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return null
}

/**
 * Filter alerts by severity
 */
export const filterAlertsBySeverity = (alerts, minSeverity = ALERT_SEVERITY.LOW) => {
  const severityOrder = [ALERT_SEVERITY.LOW, ALERT_SEVERITY.MEDIUM, ALERT_SEVERITY.HIGH, ALERT_SEVERITY.CRITICAL]
  const minIndex = severityOrder.indexOf(minSeverity)
  
  return alerts.filter(alert => {
    const alertIndex = severityOrder.indexOf(alert.severity)
    return alertIndex >= minIndex
  })
}

/**
 * Get active alerts (not expired)
 */
export const getActiveAlerts = (alerts) => {
  const now = new Date()
  return alerts.filter(alert => {
    if (!alert.expiresAt) return true
    return new Date(alert.expiresAt) > now
  })
}

/**
 * Get unread alerts count
 */
export const getUnreadCount = (alerts) => {
  return alerts.filter(alert => !alert.isRead && alert.isActive).length
}

/**
 * Get critical alerts count
 */
export const getCriticalCount = (alerts) => {
  return alerts.filter(alert => 
    alert.severity === ALERT_SEVERITY.CRITICAL && 
    alert.isActive &&
    new Date(alert.expiresAt) > new Date()
  ).length
}

