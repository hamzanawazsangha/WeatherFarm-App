import { useState, useEffect } from 'react'
import { getCropInsights, CROP_TYPES } from '../services/cropAdvisorService'
import LoadingSkeleton from './LoadingSkeleton'
import {
  Sprout, Droplet, AlertTriangle, Calendar, TrendingDown, TrendingUp,
  CheckCircle, XCircle, AlertCircle, Thermometer, Wind, CloudRain,
  Activity, Shield, Lightbulb, ChevronDown, ChevronUp
} from 'lucide-react'

const CropAdvisor = ({ weatherData }) => {
  const [selectedCrop, setSelectedCrop] = useState(CROP_TYPES.WHEAT)
  const [insights, setInsights] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    conditions: true,
    irrigation: true,
    risks: true,
    activities: true,
    recommendations: true,
  })

  useEffect(() => {
    if (weatherData && weatherData.current) {
      const cropInsights = getCropInsights(
        selectedCrop,
        weatherData.current,
        weatherData.forecast || []
      )
      setInsights(cropInsights)
    } else {
      setInsights(null)
    }
  }, [selectedCrop, weatherData])

  if (!weatherData || !weatherData.current) {
    return (
      <div className="glass-card text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Please select a location on the Weather page to get farming insights
        </p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    )
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-gray-900'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getCropLossColor = (score) => {
    if (score >= 70) return 'text-red-600 dark:text-red-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Crop Selector */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Select Crop Type
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(CROP_TYPES).map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedCrop === crop
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
              }`}
            >
              {crop.charAt(0).toUpperCase() + crop.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Loss Risk Score */}
      <div className="glass-card bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Crop Loss Risk Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overall risk assessment for {insights.cropName}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-extrabold ${getCropLossColor(insights.cropLossRisk)}`}>
              {insights.cropLossRisk}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              insights.cropLossRisk >= 70 ? 'bg-red-500' :
              insights.cropLossRisk >= 50 ? 'bg-orange-500' :
              insights.cropLossRisk >= 30 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${insights.cropLossRisk}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {insights.cropLossRisk >= 70 ? 'High Risk - Immediate action recommended' :
           insights.cropLossRisk >= 50 ? 'Moderate Risk - Monitor closely' :
           insights.cropLossRisk >= 30 ? 'Low-Moderate Risk - Take preventive measures' :
           'Low Risk - Conditions are favorable'}
        </p>
      </div>

      {/* Current Conditions */}
      <div className="glass-card">
        <button
          onClick={() => toggleSection('conditions')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Current Conditions
          </h3>
          {expandedSections.conditions ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.conditions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(insights.currentConditions).map(([key, condition]) => (
              <div
                key={key}
                className={`p-4 rounded-xl border-2 ${
                  condition.status === 'optimal' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                  condition.status === 'good' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                  condition.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {key === 'precipitation' ? 'Rainfall' : key === 'windSpeed' ? 'Wind Speed' : key === 'uvIndex' ? 'UV Index' : key}
                  </span>
                  {getStatusIcon(condition.status)}
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {key === 'temperature' ? `${condition.value}°C` :
                   key === 'humidity' ? `${condition.value}%` :
                   key === 'precipitation' ? `${condition.value.toFixed(1)}mm` :
                   key === 'windSpeed' ? `${condition.value} km/h` :
                   condition.value}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{condition.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Irrigation Recommendation */}
      <div className="glass-card">
        <button
          onClick={() => toggleSection('irrigation')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Irrigation Recommendation
          </h3>
          {expandedSections.irrigation ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.irrigation && (
          <div className={`p-6 rounded-xl border-2 ${
            insights.irrigationRecommendation.urgency === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
            insights.irrigationRecommendation.urgency === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
            insights.irrigationRecommendation.needed ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-start gap-4">
              <Droplet className={`w-8 h-8 flex-shrink-0 ${
                insights.irrigationRecommendation.needed ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
              }`} />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {insights.irrigationRecommendation.message}
                </p>
                {insights.irrigationRecommendation.needed && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Amount:</span>
                      <span>{insights.irrigationRecommendation.amount}mm</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Urgency:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(insights.irrigationRecommendation.urgency)}`}>
                        {insights.irrigationRecommendation.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pest & Disease Risk */}
      <div className="glass-card">
        <button
          onClick={() => toggleSection('risks')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Pest & Disease Risk
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${getRiskBadgeColor(insights.pestDiseaseRisk.overallRisk)}`}>
              {insights.pestDiseaseRisk.overallRisk.toUpperCase()}
            </span>
          </h3>
          {expandedSections.risks ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.risks && (
          <div className="space-y-4">
            {insights.pestDiseaseRisk.risks.length > 0 ? (
              insights.pestDiseaseRisk.risks.map((risk, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    risk.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{risk.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(risk.severity)}`}>
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{risk.message}</p>
                  <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Prevention:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{risk.prevention}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  ✓ Low risk of pests and diseases. Current conditions are favorable.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Planner */}
      <div className="glass-card">
        <button
          onClick={() => toggleSection('activities')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Activity Planner
          </h3>
          {expandedSections.activities ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {expandedSections.activities && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['harvest', 'spray', 'fertilize'].map((activity) => {
              const activityData = insights.activityPlanner[activity]
              const score = activityData.score
              return (
                <div
                  key={activity}
                  className="p-4 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                      {activity === 'spray' ? 'Spraying' : activity === 'fertilize' ? 'Fertilizing' : 'Harvesting'}
                    </h4>
                    {score >= 80 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : score >= 60 ? (
                      <Activity className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                      {activityData.day}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Score: {score}/100
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activityData.reason}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="glass-card">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Actionable Recommendations
            </h3>
            {expandedSections.recommendations ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSections.recommendations && (
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    rec.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      rec.priority === 'high' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rec.priority === 'high' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{rec.type}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CropAdvisor

