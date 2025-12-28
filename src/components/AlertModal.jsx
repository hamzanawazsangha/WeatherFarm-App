import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ShieldAlert, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const AlertModal = ({ alert, onClose, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false)

  if (!alert) return null

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: ShieldAlert,
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          border: 'border-red-500',
          badge: 'bg-red-600 text-white',
          textColor: 'text-red-700 dark:text-red-400',
          bgLight: 'bg-red-50 dark:bg-red-900/20'
        }
      case 'high':
        return {
          icon: AlertTriangle,
          bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
          border: 'border-orange-500',
          badge: 'bg-orange-600 text-white',
          textColor: 'text-orange-700 dark:text-orange-400',
          bgLight: 'bg-orange-50 dark:bg-orange-900/20'
        }
      case 'medium':
        return {
          icon: Info,
          bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
          border: 'border-yellow-500',
          badge: 'bg-yellow-600 text-white',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          bgLight: 'bg-yellow-50 dark:bg-yellow-900/20'
        }
      default:
        return {
          icon: Info,
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          border: 'border-blue-500',
          badge: 'bg-blue-600 text-white',
          textColor: 'text-blue-700 dark:text-blue-400',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20'
        }
    }
  }

  const config = getSeverityConfig(alert.severity)
  const Icon = config.icon

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(alert.id)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className={`${config.bg} p-6 text-white`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      {alert.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 break-words">
                    {alert.title}
                  </h2>
                  <p className="text-white/90 text-lg break-words">
                    {alert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Impact */}
            {alert.impact && (
              <div className={`${config.bgLight} border-l-4 ${config.border} p-4 rounded-r-lg`}>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${config.textColor}`} />
                  Impact
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {alert.impact}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {alert.recommendations && alert.recommendations.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Recommended Actions
                </h3>
                <div className="space-y-2">
                  {alert.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 flex-1">
                        {rec}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Details (Collapsible) */}
            {alert.details && alert.details.length > 0 && (
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Technical Details
                  </h3>
                  {showDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {alert.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Expires At */}
            {alert.expiresAt && (
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Alert expires: {new Date(alert.expiresAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDismiss}
              className={`px-6 py-2.5 ${config.bg} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
            >
              Dismiss Alert
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AlertModal

