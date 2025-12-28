import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Bug, Leaf, Wheat, Calendar, CheckCircle, XCircle,
  Clock, AlertCircle, TrendingUp, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import { getFarmActivityDecisions } from '../services/activityDecisionService'

const ActivityPlanner = ({ weatherData, soilData = null, pestRisk = null, cropType = null }) => {
  const [decisions, setDecisions] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (weatherData && weatherData.current && weatherData.forecast) {
      const activityDecisions = getFarmActivityDecisions(
        weatherData.current,
        weatherData.forecast || [],
        { soilData, pestRisk, cropType }
      )
      setDecisions(activityDecisions)
    } else {
      setDecisions(null)
    }
  }, [weatherData, soilData, pestRisk, cropType])

  if (!decisions) {
    return (
      <div className="glass-card text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading activity recommendations...
        </p>
      </div>
    )
  }

  const activities = [
    {
      id: 'irrigation',
      name: 'Irrigation',
      icon: Droplets,
      color: 'blue',
      data: decisions.irrigation
    },
    {
      id: 'pesticide',
      name: 'Pesticide Spray',
      icon: Bug,
      color: 'orange',
      data: decisions.pesticide
    },
    {
      id: 'fertilizer',
      name: 'Fertilizer',
      icon: Leaf,
      color: 'green',
      data: decisions.fertilizer
    },
    {
      id: 'harvesting',
      name: 'Harvesting',
      icon: Wheat,
      color: 'yellow',
      data: decisions.harvesting
    }
  ]

  const getDecisionBadge = (decision) => {
    const badges = {
      yes: {
        bg: 'bg-green-500',
        text: 'text-white',
        label: 'YES - Go Ahead',
        icon: CheckCircle
      },
      no: {
        bg: 'bg-red-500',
        text: 'text-white',
        label: 'NO - Don\'t Do',
        icon: XCircle
      },
      wait: {
        bg: 'bg-yellow-500',
        text: 'text-gray-900',
        label: 'WAIT - Hold On',
        icon: Clock
      }
    }
    return badges[decision] || badges.wait
  }

  const getConfidenceBadge = (confidence) => {
    const badges = {
      high: { text: 'High Confidence', color: 'text-green-600 dark:text-green-400' },
      medium: { text: 'Medium Confidence', color: 'text-yellow-600 dark:text-yellow-400' },
      low: { text: 'Low Confidence', color: 'text-gray-600 dark:text-gray-400' }
    }
    return badges[confidence] || badges.medium
  }

  const getColorClasses = (color, decision) => {
    const isYes = decision === 'yes'
    const colorMap = {
      blue: isYes ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-blue-300 dark:border-blue-700',
      orange: isYes ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-orange-300 dark:border-orange-700',
      green: isYes ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-green-300 dark:border-green-700',
      yellow: isYes ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-yellow-300 dark:border-yellow-700'
    }
    return colorMap[color] || colorMap.blue
  }

  const getIconBg = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="glass-card">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Farm Activity Planner
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isExpanded ? 'Click to collapse' : 'Click to view activity recommendations'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {decisions.metadata.weatherSummary.temperature}°C • {decisions.metadata.weatherSummary.humidity}% humidity
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Wind: {decisions.metadata.weatherSummary.windSpeed} km/h
            </p>
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {activities.map(activity => (
              <div key={activity.id} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <activity.icon className={`w-8 h-8 mx-auto mb-2 ${
                  activity.data.decision === 'yes' ? 'text-green-500' :
                  activity.data.decision === 'no' ? 'text-red-500' :
                  'text-yellow-500'
                }`} />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {activity.name}
                </p>
                <span className={`text-xs font-bold uppercase ${
                  activity.data.decision === 'yes' ? 'text-green-600 dark:text-green-400' :
                  activity.data.decision === 'no' ? 'text-red-600 dark:text-red-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {activity.data.decision}
                </span>
              </div>
            ))}
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
            <div className="px-4 pb-4 space-y-6">
              {/* Activity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {activities.map((activity, index) => {
          const badge = getDecisionBadge(activity.data.decision)
          const confidence = getConfidenceBadge(activity.data.confidence)
          const Icon = activity.icon
          const BadgeIcon = badge.icon
          const isYes = activity.data.decision === 'yes'

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card border-2 ${getColorClasses(activity.color, activity.data.decision)} ${
                isYes ? 'ring-2 ring-offset-2 ring-green-500 dark:ring-offset-gray-900' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${getIconBg(activity.color)} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {activity.name}
                    </h3>
                    <p className={`text-xs font-semibold ${confidence.color}`}>
                      {confidence.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decision Badge */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${badge.bg} ${badge.text} mb-4`}>
                <BadgeIcon className="w-5 h-5" />
                <span className="font-bold text-lg">{badge.label}</span>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {activity.data.reason}
                  </p>
                </div>
              </div>

              {/* Best Day */}
              {activity.data.bestDay && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Best time:
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md font-bold text-xs">
                      {activity.data.bestDay}
                    </span>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  {activity.data.details}
                </p>
              </div>

              {/* Highlight for YES decisions */}
              {isYes && (
                <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 rounded">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300">
                    ✓ Recommended: Good conditions for this activity!
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ActivityPlanner

