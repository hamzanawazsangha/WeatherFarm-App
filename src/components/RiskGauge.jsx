import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { getRiskColor, getRiskStatusText } from '../services/cropRiskIndexService'

const RiskGauge = ({ riskData, trend = null }) => {
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  if (!riskData) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No risk data available. Configure weather and crop settings.
        </p>
      </div>
    )
  }

  const { totalScore, category, contributingFactors, recommendations, metadata } = riskData
  const riskColor = getRiskColor(totalScore)
  const statusText = getRiskStatusText(totalScore)
  
  // Calculate gauge rotation (-90 to 90 degrees)
  const rotation = (totalScore / 100) * 180 - 90
  
  // Get trend icon
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.direction === 'increasing') return <TrendingUp className="w-5 h-5 text-red-500" />
    if (trend.direction === 'decreasing') return <TrendingDown className="w-5 h-5 text-green-500" />
    return <Minus className="w-5 h-5 text-gray-500" />
  }
  
  const getTrendText = () => {
    if (!trend) return ''
    if (trend.direction === 'increasing') return `+${trend.change} (Worsening)`
    if (trend.direction === 'decreasing') return `${trend.change} (Improving)`
    return 'Stable'
  }

  const getCategoryIcon = () => {
    if (category === 'High Risk') return <AlertTriangle className="w-8 h-8" />
    if (category === 'Moderate Risk') return <Info className="w-8 h-8" />
    return <Shield className="w-8 h-8" />
  }

  const getCategoryGradient = () => {
    if (category === 'High Risk') return 'from-red-500 to-red-600'
    if (category === 'Moderate Risk') return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-emerald-500'
  }

  return (
    <div className="space-y-6">
      {/* Main Risk Gauge Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${getCategoryGradient()} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getCategoryIcon()}
              <div>
                <h2 className="text-3xl font-bold">Crop Risk Index</h2>
                <p className="text-white/90 text-sm mt-1">{statusText}</p>
              </div>
            </div>
            {trend && (
              <div className="text-right bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 justify-end">
                  {getTrendIcon()}
                  <span className="font-bold">{getTrendText()}</span>
                </div>
                <p className="text-xs text-white/80 mt-1">{trend.dataPoints} day avg: {trend.average}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Circular Gauge */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Gauge Background */}
            <svg className="w-80 h-40" viewBox="0 0 200 100">
              {/* Background Arc */}
              <path
                d="M 10 90 A 90 90 0 0 1 190 90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                strokeLinecap="round"
                className="dark:stroke-gray-700"
              />
              
              {/* Colored Sections */}
              {/* Green (0-30) */}
              <path
                d="M 10 90 A 90 90 0 0 1 64 15"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.6"
              />
              
              {/* Yellow (30-60) */}
              <path
                d="M 64 15 A 90 90 0 0 1 136 15"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.6"
              />
              
              {/* Red (60-100) */}
              <path
                d="M 136 15 A 90 90 0 0 1 190 90"
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.6"
              />
              
              {/* Needle */}
              <motion.g
                initial={{ rotate: -90 }}
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                style={{ transformOrigin: '100px 90px' }}
              >
                <circle cx="100" cy="90" r="8" fill={riskColor.start} />
                <path
                  d="M 100 90 L 100 20"
                  stroke={riskColor.start}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="20" r="6" fill={riskColor.start} />
              </motion.g>
            </svg>
            
            {/* Score Display */}
            <div className="absolute bottom-0 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-6xl font-black"
                style={{ color: riskColor.start }}
              >
                {totalScore}
              </motion.div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                Risk Score
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex justify-center mb-6">
            <span className={`px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r ${getCategoryGradient()} text-white shadow-lg`}>
              {category}
            </span>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Temperature</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{metadata.temperature}°C</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Humidity</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{metadata.humidity}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Wind Speed</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{metadata.windSpeed} km/h</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Precipitation</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{metadata.precipitation}mm</p>
            </div>
          </div>

          {/* Toggle Breakdown Button */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all"
          >
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {showBreakdown ? 'Hide' : 'Show'} Risk Breakdown
            </span>
            {showBreakdown ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Risk Breakdown */}
          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 space-y-3"
            >
              {contributingFactors.map((factor, index) => {
                const factorColor = getRiskColor(factor.score)
                const percentage = factor.score
                
                return (
                  <motion.div
                    key={factor.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{factor.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          {(factor.weight * 100).toFixed(0)}% weight
                        </span>
                      </div>
                      <span className="text-2xl font-black" style={{ color: factorColor.start }}>
                        {factor.score}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${factorColor.start}, ${factorColor.end})`
                        }}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {factor.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Recommendations Card */}
      {recommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                  rec.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                  rec.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {rec.message}
                    </h4>
                    <ul className="space-y-1">
                      {rec.actions.map((action, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RiskGauge

