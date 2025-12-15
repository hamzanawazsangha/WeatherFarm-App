/**
 * Analytics Service
 * Handles analytics data storage and retrieval for charts
 */

const ANALYTICS_STORAGE_KEY = 'analyticsData'
const MAX_HISTORY_DAYS = 30 // Keep 30 days of history

/**
 * Save analytics data point
 * @param {Object} weatherData - Current weather data
 * @param {Object} cropRiskData - Optional crop risk data
 */
export const saveAnalyticsData = (weatherData, cropRiskData = null) => {
  try {
    const existing = getAnalyticsData()
    const timestamp = Date.now()
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    const dataPoint = {
      date,
      timestamp,
      temperature: weatherData.current?.temperature || 0,
      humidity: weatherData.current?.humidity || 0,
      windSpeed: weatherData.current?.windSpeed || 0,
      precipitation: weatherData.current?.precipitation || 0,
      rainProbability: weatherData.forecast?.[0]?.rainProbability || 0,
      uvIndex: weatherData.current?.uvIndex || 0,
      cropRiskScore: cropRiskData?.cropLossRisk || null,
    }

    // Add or update data for today
    const existingIndex = existing.findIndex(item => item.date === date)
    if (existingIndex >= 0) {
      existing[existingIndex] = { ...existing[existingIndex], ...dataPoint }
    } else {
      existing.push(dataPoint)
    }

    // Sort by date and keep only last MAX_HISTORY_DAYS
    existing.sort((a, b) => new Date(a.date) - new Date(b.date))
    const recent = existing.slice(-MAX_HISTORY_DAYS)

    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(recent))
    return true
  } catch (error) {
    console.error('Error saving analytics data:', error)
    return false
  }
}

/**
 * Get all analytics data
 * @returns {Array} Array of analytics data points
 */
export const getAnalyticsData = () => {
  try {
    const data = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error getting analytics data:', error)
    return []
  }
}

/**
 * Get analytics data for a specific date range
 * @param {number} days - Number of days to retrieve (default: 7)
 * @returns {Array} Filtered analytics data
 */
export const getAnalyticsDataRange = (days = 7) => {
  const allData = getAnalyticsData()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return allData.filter(item => new Date(item.date) >= cutoffDate)
}

/**
 * Get formatted data for temperature chart
 * @param {number} days - Number of days
 * @returns {Array} Chart data array
 */
export const getTemperatureChartData = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  return data.map(item => ({
    date: formatDate(item.date),
    temperature: item.temperature || 0,
  }))
}

/**
 * Get formatted data for rainfall probability chart
 * @param {number} days - Number of days
 * @returns {Array} Chart data array
 */
export const getRainfallProbabilityChartData = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  return data.map(item => ({
    date: formatDate(item.date),
    probability: item.rainProbability || 0,
  }))
}

/**
 * Get formatted data for wind speed chart
 * @param {number} days - Number of days
 * @returns {Array} Chart data array
 */
export const getWindSpeedChartData = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  return data.map(item => ({
    date: formatDate(item.date),
    windSpeed: item.windSpeed || 0,
  }))
}

/**
 * Get formatted data for humidity chart
 * @param {number} days - Number of days
 * @returns {Array} Chart data array
 */
export const getHumidityChartData = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  return data.map(item => ({
    date: formatDate(item.date),
    humidity: item.humidity || 0,
  }))
}

/**
 * Get formatted data for crop risk score chart
 * @param {number} days - Number of days
 * @returns {Array} Chart data array
 */
export const getCropRiskChartData = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  return data
    .filter(item => item.cropRiskScore !== null)
    .map(item => ({
      date: formatDate(item.date),
      riskScore: item.cropRiskScore || 0,
    }))
}

/**
 * Get irrigation insights data
 * @param {number} days - Number of days
 * @returns {Object} Irrigation insights
 */
export const getIrrigationInsights = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  if (data.length === 0) return null

  const totalPrecipitation = data.reduce((sum, item) => sum + (item.precipitation || 0), 0)
  const avgPrecipitation = totalPrecipitation / data.length
  const daysWithRain = data.filter(item => (item.precipitation || 0) > 0).length
  const avgRainProbability = data.reduce((sum, item) => sum + (item.rainProbability || 0), 0) / data.length

  return {
    totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
    avgPrecipitation: Math.round(avgPrecipitation * 10) / 10,
    daysWithRain,
    avgRainProbability: Math.round(avgRainProbability),
    irrigationNeeded: avgPrecipitation < 5, // Less than 5mm average suggests irrigation needed
  }
}

/**
 * Get weather trends summary
 * @param {number} days - Number of days
 * @returns {Object} Trends summary
 */
export const getWeatherTrends = (days = 7) => {
  const data = getAnalyticsDataRange(days)
  if (data.length === 0) return null

  const temps = data.map(item => item.temperature || 0).filter(t => t > 0)
  const humidities = data.map(item => item.humidity || 0).filter(h => h > 0)
  const windSpeeds = data.map(item => item.windSpeed || 0).filter(w => w > 0)

  const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0
  const avgHumidity = humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0
  const avgWindSpeed = windSpeeds.length > 0 ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length : 0

  const tempTrend = data.length >= 2 
    ? (data[data.length - 1].temperature - data[0].temperature) / data.length 
    : 0
  const humidityTrend = data.length >= 2
    ? (data[data.length - 1].humidity - data[0].humidity) / data.length
    : 0

  return {
    avgTemperature: Math.round(avgTemp * 10) / 10,
    avgHumidity: Math.round(avgHumidity * 10) / 10,
    avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
    tempTrend: Math.round(tempTrend * 10) / 10,
    humidityTrend: Math.round(humidityTrend * 10) / 10,
    dataPoints: data.length,
  }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Clear old analytics data (older than MAX_HISTORY_DAYS)
 */
export const cleanupOldData = () => {
  try {
    const data = getAnalyticsData()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS)
    
    const recent = data.filter(item => new Date(item.date) >= cutoffDate)
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(recent))
  } catch (error) {
    console.error('Error cleaning up analytics data:', error)
  }
}

