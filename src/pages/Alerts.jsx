import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, AlertTriangle, ShieldAlert, Info, X, RefreshCw, CheckCircle,
  Filter, ChevronDown, Settings, Trash2
} from 'lucide-react'
import { useLocation } from '../context/LocationContext'
import { getFarmingWeatherData } from '../services/weatherService'
import { generateAlerts, ALERT_SEVERITY } from '../services/alertEngine'
import {
  getAllAlerts,
  getActiveAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  dismissAlert,
  clearAllAlerts,
  saveAlerts,
  getNotificationSettings,
  saveNotificationSettings
} from '../services/alertStorage'
import AlertModal from '../components/AlertModal'

const Alerts = () => {
  const { location } = useLocation()
  const [alerts, setAlerts] = useState([])
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(getNotificationSettings())
  const [loading, setLoading] = useState(false)

  // Load alerts from storage
  const loadStoredAlerts = () => {
    const storedAlerts = getActiveAlerts()
    setAlerts(storedAlerts)
    applyFilters(storedAlerts)
  }

  // Generate new alerts from weather data
  const generateNewAlerts = async () => {
    if (!location) return

    setLoading(true)
    try {
      const weatherData = await getFarmingWeatherData(
        location.latitude,
        location.longitude,
        location.timezone || 'auto'
      )

      if (weatherData) {
        const newAlerts = generateAlerts(weatherData)
        
        // Save to storage
        await saveAlerts(newAlerts)
        
        // Update state
        setAlerts(newAlerts)
        applyFilters(newAlerts)

        // Dispatch event for AlertBell
        window.dispatchEvent(new Event('newAlert'))
      }
    } catch (error) {
      console.error('Error generating alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = (alertsList = alerts) => {
    let filtered = [...alertsList]

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(alert => alert.category === filterCategory)
    }

    setFilteredAlerts(filtered)
  }

  useEffect(() => {
    loadStoredAlerts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filterSeverity, filterCategory, alerts])

  // Auto-generate alerts when location changes
  useEffect(() => {
    if (location) {
      generateNewAlerts()
    }
  }, [location])

  // Handle refresh
  const handleRefresh = () => {
    generateNewAlerts()
  }

  // Handle alert click
  const handleAlertClick = async (alert) => {
    setSelectedAlert(alert)
    setShowModal(true)
    await markAlertAsRead(alert.id)
    loadStoredAlerts()
  }

  // Handle dismiss
  const handleDismiss = async (alertId) => {
    await dismissAlert(alertId)
    loadStoredAlerts()
    setShowModal(false)
  }

  // Handle clear all
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all alerts?')) {
      await clearAllAlerts()
      loadStoredAlerts()
    }
  }

  // Handle settings change
  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveNotificationSettings(newSettings)
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
      case 'medium':
        return <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    }
  }

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:border-red-400'
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 hover:border-orange-400'
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 hover:border-yellow-400'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400'
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg"></div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Alerts & Notifications
            </h1>
            {location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {location.displayName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-card overflow-hidden"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Notification Settings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Enable Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Turn all notifications on/off</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                  className="w-12 h-6 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Critical Alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show critical severity alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showCritical}
                  onChange={(e) => handleSettingsChange('showCritical', e.target.checked)}
                  className="w-12 h-6 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">High Priority Alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show high severity alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showHigh}
                  onChange={(e) => handleSettingsChange('showHigh', e.target.checked)}
                  className="w-12 h-6 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Medium Priority Alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show medium severity alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showMedium}
                  onChange={(e) => handleSettingsChange('showMedium', e.target.checked)}
                  className="w-12 h-6 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Stats */}
      <div className="glass-card">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Filters</h2>
          </div>
          
          {alerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="weather">Weather</option>
              <option value="disaster">Disaster</option>
              <option value="pest">Pest & Disease</option>
              <option value="irrigation">Irrigation</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{alerts.length}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {alerts.filter(a => a.severity === 'critical').length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getUnreadAlerts().length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Unread</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="glass-card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Active Alerts ({filteredAlerts.length})
        </h2>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              {alerts.length === 0 ? 'No active alerts' : 'No alerts match your filters'}
            </p>
            {!location && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Select a location on the Weather page to generate alerts.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAlertClick(alert)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getSeverityStyles(alert.severity)} ${
                  !alert.isRead ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                        {alert.title}
                      </h3>
                      {!alert.isRead && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        alert.severity === 'critical' ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                        alert.severity === 'high' ? 'bg-orange-200 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
                        alert.severity === 'medium' ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        'bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                        {alert.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTime(alert.timestamp)}
                      </span>
                      {alert.expiresAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          • Expires {new Date(alert.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {showModal && selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setShowModal(false)}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  )
}

export default Alerts
