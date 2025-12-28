/**
 * Risk History Storage Service
 * 
 * Manages storage and retrieval of daily crop risk index scores
 * for trend analysis and historical tracking.
 */

const STORAGE_KEY = 'weatherfarm_risk_history'
const MAX_HISTORY_DAYS = 30 // Keep 30 days of history

/**
 * Save risk index to history
 */
export const saveRiskToHistory = (riskData) => {
  try {
    const history = getRiskHistory()
    
    const entry = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      timestamp: riskData.timestamp,
      totalScore: riskData.totalScore,
      category: riskData.category,
      categoryColor: riskData.categoryColor,
      breakdown: {
        heatStress: riskData.breakdown.heatStress.score,
        waterStress: riskData.breakdown.waterStress.score,
        pestRisk: riskData.breakdown.pestRisk.score,
        windRisk: riskData.breakdown.windRisk.score
      },
      cropType: riskData.cropType,
      metadata: riskData.metadata
    }
    
    // Check if entry for today already exists
    const todayIndex = history.findIndex(h => h.date === entry.date)
    
    if (todayIndex !== -1) {
      // Update existing entry
      history[todayIndex] = entry
    } else {
      // Add new entry
      history.unshift(entry)
      
      // Trim to max history
      if (history.length > MAX_HISTORY_DAYS) {
        history.splice(MAX_HISTORY_DAYS)
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('Error saving risk history:', error)
    return false
  }
}

/**
 * Get risk history
 */
export const getRiskHistory = () => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY)
    return historyJson ? JSON.parse(historyJson) : []
  } catch (error) {
    console.error('Error reading risk history:', error)
    return []
  }
}

/**
 * Get risk history for last N days
 */
export const getRiskHistoryForDays = (days = 7) => {
  const history = getRiskHistory()
  return history.slice(0, days)
}

/**
 * Get trend analysis
 */
export const getRiskTrend = (days = 7) => {
  const history = getRiskHistoryForDays(days)
  
  if (history.length < 2) {
    return {
      direction: 'stable',
      change: 0,
      average: history[0]?.totalScore || 0
    }
  }
  
  const latest = history[0].totalScore
  const oldest = history[history.length - 1].totalScore
  const change = latest - oldest
  const average = Math.round(history.reduce((sum, h) => sum + h.totalScore, 0) / history.length)
  
  let direction = 'stable'
  if (change > 10) direction = 'increasing'
  else if (change < -10) direction = 'decreasing'
  
  return {
    direction,
    change,
    average,
    latest,
    oldest,
    dataPoints: history.length
  }
}

/**
 * Get highest risk day in history
 */
export const getHighestRiskDay = (days = 30) => {
  const history = getRiskHistoryForDays(days)
  
  if (history.length === 0) return null
  
  return history.reduce((highest, current) => 
    current.totalScore > highest.totalScore ? current : highest
  )
}

/**
 * Get lowest risk day in history
 */
export const getLowestRiskDay = (days = 30) => {
  const history = getRiskHistoryForDays(days)
  
  if (history.length === 0) return null
  
  return history.reduce((lowest, current) => 
    current.totalScore < lowest.totalScore ? current : lowest
  )
}

/**
 * Get average risk by category
 */
export const getAverageRiskByFactor = (days = 7) => {
  const history = getRiskHistoryForDays(days)
  
  if (history.length === 0) {
    return {
      heatStress: 0,
      waterStress: 0,
      pestRisk: 0,
      windRisk: 0
    }
  }
  
  const totals = history.reduce((acc, h) => ({
    heatStress: acc.heatStress + h.breakdown.heatStress,
    waterStress: acc.waterStress + h.breakdown.waterStress,
    pestRisk: acc.pestRisk + h.breakdown.pestRisk,
    windRisk: acc.windRisk + h.breakdown.windRisk
  }), { heatStress: 0, waterStress: 0, pestRisk: 0, windRisk: 0 })
  
  return {
    heatStress: Math.round(totals.heatStress / history.length),
    waterStress: Math.round(totals.waterStress / history.length),
    pestRisk: Math.round(totals.pestRisk / history.length),
    windRisk: Math.round(totals.windRisk / history.length)
  }
}

/**
 * Clear risk history
 */
export const clearRiskHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing risk history:', error)
    return false
  }
}

/**
 * Export risk history as CSV
 */
export const exportRiskHistoryCSV = () => {
  const history = getRiskHistory()
  
  if (history.length === 0) return null
  
  const headers = ['Date', 'Total Score', 'Category', 'Heat Stress', 'Water Stress', 'Pest Risk', 'Wind Risk', 'Crop Type']
  const rows = history.map(h => [
    h.date,
    h.totalScore,
    h.category,
    h.breakdown.heatStress,
    h.breakdown.waterStress,
    h.breakdown.pestRisk,
    h.breakdown.windRisk,
    h.cropType
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  return csv
}

