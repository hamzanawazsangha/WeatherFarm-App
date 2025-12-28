import { useState, useEffect } from 'react'
import { Sprout, MapPin, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CropSelector from '../components/CropSelector'
import CropAdvisor from '../components/CropAdvisor'
import RiskGauge from '../components/RiskGauge'
import PestRiskCard from '../components/PestRiskCard'
import ActivityPlanner from '../components/ActivityPlanner'
import { getFarmingWeatherData } from '../services/weatherService'
import { calculateCropRiskIndex } from '../services/cropRiskIndexService'
import { saveRiskToHistory, getRiskTrend } from '../services/riskHistoryStorage'
import { analyzeSoilMoisture } from '../services/soilMoistureService'
import { analyzePestDiseaseRisk } from '../services/pestDiseaseService'
import { useLocation } from '../context/LocationContext'
import LoadingSkeleton from '../components/LoadingSkeleton'

const Farming = () => {
  const { location } = useLocation()
  const [weatherData, setWeatherData] = useState(null)
  const [fullWeatherData, setFullWeatherData] = useState(null)
  const [riskData, setRiskData] = useState(null)
  const [riskTrend, setRiskTrend] = useState(null)
  const [pestRiskData, setPestRiskData] = useState(null)
  const [soilMoistureData, setSoilMoistureData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState('wheat')
  const [showAdditionalInsights, setShowAdditionalInsights] = useState(false)

  // Fetch weather data when location changes
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    console.log('🌾 Farming Page: Loading weather for', location.displayName);
    setLoading(true);

    getFarmingWeatherData(location.latitude, location.longitude)
      .then(data => {
        console.log('📊 Raw Farming Data:', data);
        
        // Store full weather data for risk calculation
        setFullWeatherData(data);
        
        // Transform to format expected by CropAdvisor
        const transformedData = {
          current: {
            temperature: data.current?.temperature || 0,
            humidity: data.current?.humidity || 0,
            precipitation: data.current?.precipitation || 0,
            windSpeed: data.current?.windSpeed || 0,
            uvIndex: data.current?.uvIndex || 0,
            condition: data.current?.condition || 'clear'
          },
          forecast: data.daily ? data.daily.slice(1, 6).map(day => ({
            maxTemp: day.maxTemp || 0,
            minTemp: day.minTemp || 0,
            precipitation: day.precipitation || 0,
            rainProbability: day.precipitationProbability || 0,
            windSpeed: day.windSpeed || 0,
            condition: day.condition || 'clear'
          })) : []
        };
        
        console.log('✅ Farming Page: Weather data loaded for', location.displayName);
        console.log('📊 Transformed Data:', transformedData);
        setWeatherData(transformedData);
        
        // Calculate soil moisture
        const soilData = analyzeSoilMoisture(data);
        setSoilMoistureData(soilData);
        
        // Calculate pest risk
        const pestRisk = analyzePestDiseaseRisk(selectedCrop, data.current, data.daily || []);
        setPestRiskData(pestRisk);
        
        // Calculate crop risk index
        const risk = calculateCropRiskIndex(data, selectedCrop, soilData, pestRisk);
        setRiskData(risk);
        
        // Save to history
        saveRiskToHistory(risk);
        
        // Get trend
        const trend = getRiskTrend(7);
        setRiskTrend(trend);
        
        console.log('📈 Risk Index Calculated:', risk.totalScore, risk.category);
      })
      .catch(err => {
        console.error('Farming Page: Weather fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, [location, selectedCrop])
  
  // Recalculate risk when crop selection changes
  useEffect(() => {
    if (fullWeatherData) {
      const soilData = analyzeSoilMoisture(fullWeatherData);
      setSoilMoistureData(soilData);
      
      const pestRisk = analyzePestDiseaseRisk(selectedCrop, fullWeatherData.current, fullWeatherData.daily || []);
      setPestRiskData(pestRisk);
      
      const risk = calculateCropRiskIndex(fullWeatherData, selectedCrop, soilData, pestRisk);
      setRiskData(risk);
      saveRiskToHistory(risk);
      
      const trend = getRiskTrend(7);
      setRiskTrend(trend);
    }
  }, [selectedCrop, fullWeatherData])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
          <Sprout className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          Farming Intelligence
        </h1>
        {location && (
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Location: <span className="font-semibold">{location.displayName}</span>
            </p>
          </div>
        )}
      </div>

      {!location ? (
        <div className="glass-card text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Select a Location First
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select a location on the Weather Dashboard to get farming insights
          </p>
        </div>
      ) : loading && !weatherData ? (
        <div className="space-y-6">
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : (
        <>
          {/* CROP SELECTOR - Single control for entire page */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Sprout className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Select Your Crop</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All insights below will be customized for this crop
                </p>
              </div>
            </div>
            <CropSelector 
              value={selectedCrop} 
              onChange={setSelectedCrop} 
            />
          </div>

          {/* 1. MAIN FEATURE: Crop Risk Index - Most Important */}
          {riskData && (
            <div className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-lg animate-pulse">
                  ⭐ MAIN FEATURE
                </span>
              </div>
              <RiskGauge riskData={riskData} trend={riskTrend} />
            </div>
          )}

          {/* 2. ACTIONABLE: Activity Planner - What to do NOW */}
          {weatherData && soilMoistureData && (
            <ActivityPlanner 
              weatherData={weatherData}
              soilData={soilMoistureData}
              pestRisk={pestRiskData}
              cropType={selectedCrop}
            />
          )}

          {/* 3. CRITICAL INFO: Pest & Disease Risk - Important but detailed */}
          {pestRiskData && (
            <PestRiskCard riskData={pestRiskData} />
          )}

          {/* 4. ADDITIONAL INSIGHTS: Collapsible detailed information */}
          {weatherData && (
            <div className="glass-card">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowAdditionalInsights(!showAdditionalInsights)
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 pointer-events-none">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Additional Farming Insights
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {showAdditionalInsights ? 'Click to hide' : 'Click to view detailed crop conditions, irrigation, and recommendations'}
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none">
                  {showAdditionalInsights ? (
                    <ChevronUp className="w-6 h-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </button>

              <AnimatePresence mode="wait">
                {showAdditionalInsights && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <CropAdvisor 
                        weatherData={weatherData} 
                        selectedCrop={selectedCrop}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Farming

