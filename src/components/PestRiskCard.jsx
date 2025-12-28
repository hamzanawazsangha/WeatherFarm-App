import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldAlert, Bug, AlertTriangle, Droplet, Wind,
  CloudRain, CheckCircle, ChevronDown, ChevronUp, Info,
  Thermometer, Eye, Droplets
} from 'lucide-react'

const PestRiskCard = ({ riskData }) => {
  const [expandedThreat, setExpandedThreat] = useState(null)
  const [showAllThreats, setShowAllThreats] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!riskData) {
    return (
      <div className="glass-card text-center py-8">
        <Bug className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          Select a crop to view pest & disease risk analysis
        </p>
      </div>
    )
  }

  const getRiskBadgeClass = (color) => {
    const colors = {
      red: 'bg-red-500 text-white',
      orange: 'bg-orange-500 text-white',
      yellow: 'bg-yellow-500 text-gray-900',
      green: 'bg-green-500 text-white'
    }
    return colors[color] || colors.green
  }

  const getRiskIconBg = (color) => {
    const colors = {
      red: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800',
      orange: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800',
      green: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800'
    }
    return colors[color] || colors.green
  }

  const getRecommendationIcon = (iconName) => {
    const icons = {
      'droplet': Droplet,
      'cloud-rain': CloudRain,
      'alert-triangle': AlertTriangle,
      'shield-alert': ShieldAlert,
      'spray-can': Droplets,
      'bug': Bug,
      'wind': Wind,
      'check-circle': CheckCircle
    }
    return icons[iconName] || AlertTriangle
  }

  const getRecommendationColor = (type) => {
    const colors = {
      urgent: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100',
      important: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-100',
      monitor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
      safe: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-900 dark:text-green-100'
    }
    return colors[type] || colors.monitor
  }

  const threatsToShow = showAllThreats ? riskData.allThreats : riskData.topThreats

  return (
    <div className="glass-card">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${getRiskIconBg(riskData.overallRiskColor)}`}>
            {riskData.overallRisk === 'high' || riskData.overallRisk === 'medium' ? (
              <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pest & Disease Risk
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isExpanded ? 'Click to collapse' : `${riskData.cropType.charAt(0).toUpperCase() + riskData.cropType.slice(1)} - Click to view details`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full font-bold text-sm ${getRiskBadgeClass(riskData.overallRiskColor)}`}>
            {riskData.overallRiskLabel}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-500" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-500" />
          )}
        </div>
      </button>

      {/* Quick Summary (Always Visible) */}
      {!isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{riskData.highRiskCount}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">High Risk</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{riskData.mediumRiskCount}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Medium Risk</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{riskData.totalThreats}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Threats</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Thermometer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{riskData.weatherSummary.temperature}°C</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{riskData.weatherSummary.humidity}% humidity</p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-6 mt-4">

              {/* Recommendations */}
        {riskData.recommendations && riskData.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recommendations
            </h3>
            {riskData.recommendations.map((rec, index) => {
              const Icon = getRecommendationIcon(rec.icon)
              return (
                <div key={index} className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{rec.message}</p>
                      <p className="text-sm opacity-90">
                        <span className="font-semibold">Action:</span> {rec.action}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

              {/* Threats List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Bug className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    Identified Threats
                  </h3>
          {riskData.allThreats.length > 3 && (
            <button
              onClick={() => setShowAllThreats(!showAllThreats)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {showAllThreats ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show All ({riskData.allThreats.length}) <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {threatsToShow.map((threat) => (
            <motion.div
              key={threat.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Threat Header */}
              <button
                onClick={() => setExpandedThreat(expandedThreat === threat.id ? null : threat.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getRiskIconBg(threat.riskColor)}`}>
                    {threat.category === 'pest' ? (
                      <Bug className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{threat.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRiskBadgeClass(threat.riskColor)}`}>
                        {threat.riskLabel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {threat.type} {threat.category} • Risk Score: {threat.riskScore}%
                    </p>
                  </div>
                </div>
                {expandedThreat === threat.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedThreat === threat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                      {/* Symptoms */}
                      <div>
                        <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Symptoms
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{threat.symptoms}</p>
                      </div>

                      {/* Prevention */}
                      <div>
                        <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Prevention
                        </h5>
                        <ul className="space-y-1">
                          {threat.prevention.map((step, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Treatment */}
                      <div>
                        <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          Treatment
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{threat.treatment}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PestRiskCard

