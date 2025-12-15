/**
 * Alerts Service
 * Generates weather-based alerts and manages alert storage
 */

import { getCachedWeatherData } from './weatherService'
import { getCropInsights, CROP_TYPES } from './cropAdvisorService'

const ALERTS_STORAGE_KEY = 'weatherAlerts'

/**
 * Generate weather-based alerts
 * @param {Object} weatherData - Current weather data
 * @param {Object} location - Current location
 * @returns {Array} Array of alert objects
 */
export const generateAlerts = (weatherData, location) => {
  if (!weatherData || !weatherData.current) {
    return []
  }

  const alerts = []
  const current = weatherData.current
  const forecast = weatherData.forecast || []
  const now = new Date()

  // Frost Warning
  if (current.temperature < 5 || (forecast.length > 0 && forecast[0].minTemp < 5)) {
    alerts.push({
      id: `frost-${Date.now()}`,
      type: 'warning',
      severity: 'high',
      title: 'Frost Warning',
      message: `Temperatures expected to drop below 5°C. Current: ${current.temperature}°C. Cover sensitive plants to protect them from frost damage.`,
      timestamp: now,
      category: 'temperature',
    })
  }

  // High Temperature Alert
  if (current.temperature > 35) {
    alerts.push({
      id: `heat-${Date.now()}`,
      type: 'error',
      severity: 'high',
      title: 'Heat Alert',
      message: `Extremely high temperature: ${current.temperature}°C. Provide shade for crops and increase irrigation frequency to prevent heat stress.`,
      timestamp: now,
      category: 'temperature',
    })
  } else if (current.temperature > 30) {
    alerts.push({
      id: `warm-${Date.now()}`,
      type: 'warning',
      severity: 'medium',
      title: 'High Temperature',
      message: `High temperature: ${current.temperature}°C. Monitor crops closely and ensure adequate water supply.`,
      timestamp: now,
      category: 'temperature',
    })
  }

  // Heavy Rain Alert
  if (current.precipitation > 20) {
    alerts.push({
      id: `heavy-rain-${Date.now()}`,
      type: 'error',
      severity: 'high',
      title: 'Heavy Rainfall',
      message: `Heavy rainfall detected: ${current.precipitation.toFixed(1)}mm. Ensure proper drainage to prevent waterlogging and root rot.`,
      timestamp: now,
      category: 'precipitation',
    })
  } else if (current.precipitation > 10) {
    alerts.push({
      id: `rain-${Date.now()}`,
      type: 'info',
      severity: 'medium',
      title: 'Rainfall Detected',
      message: `Rainfall: ${current.precipitation.toFixed(1)}mm. Adjust irrigation schedule accordingly.`,
      timestamp: now,
      category: 'precipitation',
    })
  }

  // High Wind Alert
  if (current.windSpeed > 40) {
    alerts.push({
      id: `high-wind-${Date.now()}`,
      type: 'error',
      severity: 'high',
      title: 'High Wind Warning',
      message: `Strong winds detected: ${current.windSpeed} km/h. Secure outdoor equipment and protect crops from wind damage.`,
      timestamp: now,
      category: 'wind',
    })
  } else if (current.windSpeed > 25) {
    alerts.push({
      id: `wind-${Date.now()}`,
      type: 'warning',
      severity: 'medium',
      title: 'Moderate Wind',
      message: `Moderate wind speed: ${current.windSpeed} km/h. Monitor crops and secure loose items.`,
      timestamp: now,
      category: 'wind',
    })
  }

  // Low Humidity Alert
  if (current.humidity < 30) {
    alerts.push({
      id: `low-humidity-${Date.now()}`,
      type: 'warning',
      severity: 'medium',
      title: 'Low Humidity',
      message: `Low humidity: ${current.humidity}%. Increase irrigation frequency to maintain soil moisture.`,
      timestamp: now,
      category: 'humidity',
    })
  }

  // High UV Index Alert
  if (current.uvIndex > 8) {
    alerts.push({
      id: `high-uv-${Date.now()}`,
      type: 'warning',
      severity: 'medium',
      title: 'High UV Index',
      message: `Very high UV index: ${current.uvIndex}. Protect sensitive crops from sunburn. Consider providing shade during peak hours.`,
      timestamp: now,
      category: 'uv',
    })
  }

  // Forecast-based alerts
  if (forecast.length > 0) {
    // Check next 3 days for extreme conditions
    const next3Days = forecast.slice(0, 3)
    
    // Heavy rain forecast
    const heavyRainDay = next3Days.find(day => day.precipitation > 15)
    if (heavyRainDay) {
      alerts.push({
        id: `forecast-rain-${Date.now()}`,
        type: 'info',
        severity: 'medium',
        title: 'Heavy Rain Forecast',
        message: `Heavy rainfall (${heavyRainDay.precipitation.toFixed(1)}mm) expected in the next few days. Plan irrigation and drainage accordingly.`,
        timestamp: now,
        category: 'forecast',
      })
    }

    // Extreme temperature forecast
    const extremeTempDay = next3Days.find(day => day.maxTemp > 35 || day.minTemp < 0)
    if (extremeTempDay) {
      alerts.push({
        id: `forecast-temp-${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'Extreme Temperature Forecast',
        message: `Extreme temperatures forecasted: ${extremeTempDay.maxTemp}°C / ${extremeTempDay.minTemp}°C. Take necessary precautions.`,
        timestamp: now,
        category: 'forecast',
      })
    }
  }

  // Crop-specific alerts (if we have crop insights)
  if (location) {
    try {
      const cropInsights = getCropInsights(
        CROP_TYPES.WHEAT, // Default to wheat for alerts
        current,
        forecast
      )

      if (cropInsights) {
        // High crop risk
        if (cropInsights.cropLossRisk > 70) {
          alerts.push({
            id: `crop-risk-${Date.now()}`,
            type: 'error',
            severity: 'high',
            title: 'High Crop Risk',
            message: `Crop loss risk score is ${cropInsights.cropLossRisk}/100. Immediate action recommended. Review farming recommendations.`,
            timestamp: now,
            category: 'crop',
          })
        }

        // Pest/Disease risk
        if (cropInsights.pestDiseaseRisk.overallRisk === 'high' || cropInsights.pestDiseaseRisk.overallRisk === 'critical') {
          alerts.push({
            id: `pest-risk-${Date.now()}`,
            type: 'warning',
            severity: 'high',
            title: 'Pest/Disease Risk',
            message: `High risk of ${cropInsights.pestDiseaseRisk.risks.map(r => r.type).join(' and ')}. Take preventive measures.`,
            timestamp: now,
            category: 'pest',
          })
        }

        // Irrigation needed
        if (cropInsights.irrigationRecommendation.needed && cropInsights.irrigationRecommendation.urgency === 'high') {
          alerts.push({
            id: `irrigation-${Date.now()}`,
            type: 'info',
            severity: 'medium',
            title: 'Irrigation Needed',
            message: `Irrigation recommended: ${cropInsights.irrigationRecommendation.amount}mm needed. Best time: ${cropInsights.irrigationRecommendation.timing}.`,
            timestamp: now,
            category: 'irrigation',
          })
        }
      }
    } catch (err) {
      console.error('Error generating crop alerts:', err)
    }
  }

  return alerts
}

/**
 * Get all alerts
 * @returns {Array} Array of alert objects
 */
export const getAlerts = () => {
  try {
    const cached = getCachedWeatherData()
    if (!cached || !cached.weatherData || !cached.location) {
      return []
    }

    // Get stored alerts
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY)
    const dismissedIds = stored ? JSON.parse(stored) : []

    // Generate new alerts
    const allAlerts = generateAlerts(cached.weatherData, cached.location)

    // Filter out dismissed alerts
    return allAlerts.filter(alert => !dismissedIds.includes(alert.id))
  } catch (error) {
    console.error('Error getting alerts:', error)
    return []
  }
}

/**
 * Dismiss an alert
 * @param {string} alertId - Alert ID to dismiss
 */
export const dismissAlert = (alertId) => {
  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY)
    const dismissedIds = stored ? JSON.parse(stored) : []
    
    if (!dismissedIds.includes(alertId)) {
      dismissedIds.push(alertId)
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(dismissedIds))
    }
  } catch (error) {
    console.error('Error dismissing alert:', error)
  }
}

/**
 * Clear all dismissed alerts
 */
export const clearDismissedAlerts = () => {
  try {
    localStorage.removeItem(ALERTS_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing dismissed alerts:', error)
  }
}

