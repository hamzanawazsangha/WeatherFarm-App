/**
 * Alert Storage Service
 * 
 * Manages local storage and persistence of alerts for offline PWA support.
 * Uses both localStorage (for quick access) and IndexedDB (for large data).
 */

const STORAGE_KEYS = {
  ALERTS: 'weatherfarm_alerts',
  ALERTS_HISTORY: 'weatherfarm_alerts_history',
  LAST_UPDATE: 'weatherfarm_alerts_last_update',
  NOTIFICATION_SETTINGS: 'weatherfarm_notification_settings'
}

const DB_NAME = 'WeatherFarmAlerts'
const DB_VERSION = 1
const STORE_NAME = 'alerts'

// Maximum alerts to store (for performance)
const MAX_ALERTS = 100
const ALERT_RETENTION_DAYS = 7

/**
 * Initialize IndexedDB
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        objectStore.createIndex('timestamp', 'timestamp', { unique: false })
        objectStore.createIndex('severity', 'severity', { unique: false })
        objectStore.createIndex('isActive', 'isActive', { unique: false })
        objectStore.createIndex('isRead', 'isRead', { unique: false })
      }
    }
  })
}

/**
 * Save alerts to localStorage (for quick access)
 */
export const saveAlertsToLocalStorage = (alerts) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts))
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString())
    return true
  } catch (error) {
    console.error('Error saving alerts to localStorage:', error)
    return false
  }
}

/**
 * Get alerts from localStorage
 */
export const getAlertsFromLocalStorage = () => {
  try {
    const alertsJson = localStorage.getItem(STORAGE_KEYS.ALERTS)
    return alertsJson ? JSON.parse(alertsJson) : []
  } catch (error) {
    console.error('Error reading alerts from localStorage:', error)
    return []
  }
}

/**
 * Save alerts to IndexedDB (for persistence)
 */
export const saveAlertsToIndexedDB = async (alerts) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    
    // Save each alert
    for (const alert of alerts) {
      objectStore.put(alert)
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close()
        resolve(true)
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }
    })
  } catch (error) {
    console.error('Error saving alerts to IndexedDB:', error)
    return false
  }
}

/**
 * Get alerts from IndexedDB
 */
export const getAlertsFromIndexedDB = async () => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.getAll()
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close()
        resolve(request.result || [])
      }
      request.onerror = () => {
        db.close()
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Error reading alerts from IndexedDB:', error)
    return []
  }
}

/**
 * Save a single alert
 */
export const saveAlert = async (alert) => {
  try {
    // Get existing alerts
    const existingAlerts = getAlertsFromLocalStorage()
    
    // Check if alert already exists
    const index = existingAlerts.findIndex(a => a.id === alert.id)
    
    if (index !== -1) {
      // Update existing alert
      existingAlerts[index] = alert
    } else {
      // Add new alert
      existingAlerts.unshift(alert)
      
      // Trim to max size
      if (existingAlerts.length > MAX_ALERTS) {
        existingAlerts.splice(MAX_ALERTS)
      }
    }
    
    // Save to both storages
    saveAlertsToLocalStorage(existingAlerts)
    await saveAlertsToIndexedDB(existingAlerts)
    
    return true
  } catch (error) {
    console.error('Error saving alert:', error)
    return false
  }
}

/**
 * Save multiple alerts
 */
export const saveAlerts = async (alerts) => {
  try {
    // Get existing alerts
    const existingAlerts = getAlertsFromLocalStorage()
    const alertMap = new Map(existingAlerts.map(a => [a.id, a]))
    
    // Merge new alerts
    for (const alert of alerts) {
      alertMap.set(alert.id, alert)
    }
    
    // Convert back to array and sort by timestamp (newest first)
    const mergedAlerts = Array.from(alertMap.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, MAX_ALERTS)
    
    // Save to both storages
    saveAlertsToLocalStorage(mergedAlerts)
    await saveAlertsToIndexedDB(mergedAlerts)
    
    return true
  } catch (error) {
    console.error('Error saving alerts:', error)
    return false
  }
}

/**
 * Get all alerts (from localStorage for speed)
 */
export const getAllAlerts = () => {
  return getAlertsFromLocalStorage()
}

/**
 * Get active alerts (not expired and active)
 */
export const getActiveAlerts = () => {
  const alerts = getAllAlerts()
  const now = new Date()
  
  return alerts.filter(alert => {
    if (!alert.isActive) return false
    if (!alert.expiresAt) return true
    return new Date(alert.expiresAt) > now
  })
}

/**
 * Get unread alerts
 */
export const getUnreadAlerts = () => {
  const alerts = getActiveAlerts()
  return alerts.filter(alert => !alert.isRead)
}

/**
 * Mark alert as read
 */
export const markAlertAsRead = async (alertId) => {
  try {
    const alerts = getAllAlerts()
    const alert = alerts.find(a => a.id === alertId)
    
    if (alert) {
      alert.isRead = true
      await saveAlert(alert)
    }
    
    return true
  } catch (error) {
    console.error('Error marking alert as read:', error)
    return false
  }
}

/**
 * Mark all alerts as read
 */
export const markAllAlertsAsRead = async () => {
  try {
    const alerts = getAllAlerts()
    
    for (const alert of alerts) {
      alert.isRead = true
    }
    
    await saveAlerts(alerts)
    return true
  } catch (error) {
    console.error('Error marking all alerts as read:', error)
    return false
  }
}

/**
 * Dismiss/deactivate an alert
 */
export const dismissAlert = async (alertId) => {
  try {
    const alerts = getAllAlerts()
    const alert = alerts.find(a => a.id === alertId)
    
    if (alert) {
      alert.isActive = false
      alert.isRead = true
      await saveAlert(alert)
    }
    
    return true
  } catch (error) {
    console.error('Error dismissing alert:', error)
    return false
  }
}

/**
 * Clear old alerts (older than retention period)
 */
export const clearOldAlerts = async () => {
  try {
    const alerts = getAllAlerts()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ALERT_RETENTION_DAYS)
    
    const recentAlerts = alerts.filter(alert => {
      const alertDate = new Date(alert.timestamp)
      return alertDate >= cutoffDate
    })
    
    saveAlertsToLocalStorage(recentAlerts)
    await saveAlertsToIndexedDB(recentAlerts)
    
    return true
  } catch (error) {
    console.error('Error clearing old alerts:', error)
    return false
  }
}

/**
 * Clear all alerts
 */
export const clearAllAlerts = async () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ALERTS)
    
    // Clear IndexedDB
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    objectStore.clear()
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close()
        resolve(true)
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }
    })
  } catch (error) {
    console.error('Error clearing all alerts:', error)
    return false
  }
}

/**
 * Get unread count
 */
export const getUnreadCount = () => {
  const unreadAlerts = getUnreadAlerts()
  return unreadAlerts.length
}

/**
 * Get critical alerts count
 */
export const getCriticalAlertsCount = () => {
  const alerts = getActiveAlerts()
  return alerts.filter(alert => alert.severity === 'critical').length
}

/**
 * Save notification settings
 */
export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Error saving notification settings:', error)
    return false
  }
}

/**
 * Get notification settings
 */
export const getNotificationSettings = () => {
  try {
    const settingsJson = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS)
    return settingsJson ? JSON.parse(settingsJson) : {
      enabled: true,
      showCritical: true,
      showHigh: true,
      showMedium: true,
      showLow: false,
      soundEnabled: true
    }
  } catch (error) {
    console.error('Error reading notification settings:', error)
    return {
      enabled: true,
      showCritical: true,
      showHigh: true,
      showMedium: true,
      showLow: false,
      soundEnabled: true
    }
  }
}

/**
 * Get last update timestamp
 */
export const getLastUpdateTime = () => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE)
    return timestamp ? new Date(timestamp) : null
  } catch (error) {
    console.error('Error reading last update time:', error)
    return null
  }
}

