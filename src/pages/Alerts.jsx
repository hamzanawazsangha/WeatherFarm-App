import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Info, X, RefreshCw, CheckCircle } from 'lucide-react'
import { getAlerts, dismissAlert, clearDismissedAlerts } from '../services/alertsService'
import { getCachedWeatherData } from '../services/weatherService'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [location, setLocation] = useState(null)

  useEffect(() => {
    const loadAlerts = () => {
      const cached = getCachedWeatherData()
      if (cached && cached.location) {
        setLocation(cached.location)
      }
      
      const generatedAlerts = getAlerts()
      setAlerts(generatedAlerts)
    }

    loadAlerts()

    // Refresh alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000)

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'weatherCache' || e.key === 'weatherAlerts' || !e.key) {
        loadAlerts()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleDismiss = (alertId) => {
    dismissAlert(alertId)
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const handleRefresh = () => {
    clearDismissedAlerts()
    const cached = getCachedWeatherData()
    if (cached && cached.location) {
      setLocation(cached.location)
    }
    const generatedAlerts = getAlerts()
    setAlerts(generatedAlerts)
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return AlertTriangle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Bell
    }
  }

  const getAlertStyles = (type, severity) => {
    if (type === 'error' || severity === 'high') {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
    } else if (type === 'warning' || severity === 'medium') {
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
    } else {
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-lg"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">Alerts & Notifications</h1>
        </div>
      </div>

      {location && (
        <div className="glass-card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Alerts for <span className="font-bold">{location.displayName}</span>
            </p>
          </div>
        </div>
      )}

      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              No active alerts. All conditions are normal.
            </p>
            {!location && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Select a location on the Weather page to generate alerts.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 relative ${getAlertStyles(alert.type, alert.severity)}`}
                >
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="absolute top-3 right-3 p-1 hover:bg-white/20 dark:hover:bg-black/20 rounded transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-3 pr-8">
                    <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{alert.title}</h3>
                        <span className="text-xs px-2 py-0.5 bg-white/20 dark:bg-black/20 rounded-full capitalize">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs opacity-75">
                        <span>{formatTime(alert.timestamp)}</span>
                        {alert.category && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{alert.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h2 className="text-xl font-semibold mb-4">Alert Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-medium">Frost Warnings</h3>
              <p className="text-sm text-gray-500">Get notified about freezing temperatures</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-medium">Rain Alerts</h3>
              <p className="text-sm text-gray-500">Notifications for precipitation forecasts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <h3 className="font-medium">Farming Recommendations</h3>
              <p className="text-sm text-gray-500">AI-powered farming suggestions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts

