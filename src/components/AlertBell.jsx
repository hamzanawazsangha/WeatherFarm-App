import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, ShieldAlert, Info, CheckCircle } from 'lucide-react'
import { getUnreadCount, getActiveAlerts, markAlertAsRead, markAllAlertsAsRead } from '../services/alertStorage'
import { Link } from 'react-router-dom'

const AlertBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [recentAlerts, setRecentAlerts] = useState([])

  // Update unread count
  const updateAlerts = () => {
    const count = getUnreadCount()
    setUnreadCount(count)
    
    // Get top 5 recent active alerts
    const alerts = getActiveAlerts().slice(0, 5)
    setRecentAlerts(alerts)
  }

  useEffect(() => {
    updateAlerts()
    
    // Poll for new alerts every 30 seconds
    const interval = setInterval(updateAlerts, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Listen for custom alert events
  useEffect(() => {
    const handleNewAlert = () => {
      updateAlerts()
    }
    
    window.addEventListener('newAlert', handleNewAlert)
    return () => window.removeEventListener('newAlert', handleNewAlert)
  }, [])

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const handleMarkAsRead = async (alertId) => {
    await markAlertAsRead(alertId)
    updateAlerts()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAlertsAsRead()
    updateAlerts()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-blue-100 dark:bg-blue-900/30' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`w-6 h-6 transition-colors ${
          unreadCount > 0 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-700 dark:text-gray-300'
        }`} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-[90vw] sm:w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
              style={{ maxWidth: '400px' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Alerts
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              {unreadCount > 0 && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark all as read
                  </button>
                </div>
              )}

              {/* Alerts List */}
              <div className="overflow-y-auto max-h-[400px]">
                {recentAlerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      No active alerts
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                          !alert.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                                {alert.title}
                              </p>
                              {!alert.isRead && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                alert.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {formatTime(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {recentAlerts.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <Link
                    to="/alerts"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All Alerts
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlertBell

