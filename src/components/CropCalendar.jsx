import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle, Clock, AlertTriangle, Droplet, Wind,
  Thermometer, Sun, CloudRain, Sprout, Flower2, Wheat, Tractor,
  ChevronRight, Plus, X, Loader2
} from 'lucide-react';
import {
  CROP_DATABASE,
  getCurrentStage,
  getNextActions,
  getCropTimeline,
  getSowingWindow,
  getAvailableCrops,
  getRecommendedCrops
} from '../services/cropCalendarService';
import { getFarmingWeatherData } from '../services/weatherService';
import { useLocation } from '../context/LocationContext';

const ACTION_ICONS = {
  sowing: Sprout,
  transplanting: Sprout,
  irrigation: Droplet,
  fertilizer: Wheat,
  pesticide: AlertTriangle,
  weeding: Flower2,
  pruning: Flower2,
  monitoring: Clock,
  harvest: Tractor,
  storage: Calendar,
  staking: CheckCircle
};

const CropCalendar = () => {
  const { location } = useLocation();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [plantingDate, setPlantingDate] = useState(null);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [currentStageInfo, setCurrentStageInfo] = useState(null);
  const [nextActions, setNextActions] = useState([]);
  const [activeCrops, setActiveCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saved crops from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('activeCrops');
    if (saved) {
      try {
        setActiveCrops(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading crops:', e);
      }
    }
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      console.log('🌾 Crop Calendar: Fetching weather for', location.displayName);
      setLoading(true);
      getFarmingWeatherData(location.latitude, location.longitude)
        .then(data => {
          setWeatherData(data);
          console.log('✅ Crop Calendar: Weather data loaded for', location.displayName);
        })
        .catch(err => {
          console.error('Crop Calendar: Weather fetch error:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [location]);

  // Update timeline when crop or planting date changes
  useEffect(() => {
    if (selectedCrop && plantingDate) {
      const timelineData = getCropTimeline(selectedCrop, plantingDate);
      setTimeline(timelineData);
      
      const stageInfo = getCurrentStage(selectedCrop, plantingDate);
      setCurrentStageInfo(stageInfo);
      
      if (weatherData) {
        const actions = getNextActions(selectedCrop, plantingDate, weatherData);
        setNextActions(actions);
      }
    }
  }, [selectedCrop, plantingDate, weatherData]);

  const handleAddCrop = (cropId, date) => {
    const newCrop = {
      id: Date.now(),
      cropId,
      plantingDate: date,
      addedAt: new Date().toISOString()
    };
    
    const updated = [...activeCrops, newCrop];
    setActiveCrops(updated);
    localStorage.setItem('activeCrops', JSON.stringify(updated));
    
    setSelectedCrop(cropId);
    setPlantingDate(date);
    setShowAddCrop(false);
  };

  const handleRemoveCrop = (id) => {
    const updated = activeCrops.filter(c => c.id !== id);
    setActiveCrops(updated);
    localStorage.setItem('activeCrops', JSON.stringify(updated));
    
    if (updated.length > 0) {
      setSelectedCrop(updated[0].cropId);
      setPlantingDate(updated[0].plantingDate);
    } else {
      setSelectedCrop(null);
      setPlantingDate(null);
      setTimeline(null);
    }
  };

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop.cropId);
    setPlantingDate(crop.plantingDate);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'now': return 'bg-red-500';
      case 'soon': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            🌾 Smart Crop Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered crop management with weather-based recommendations
          </p>
        </div>
        <button
          onClick={() => setShowAddCrop(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Crop
        </button>
      </div>

      {/* Active Crops Tabs */}
      {activeCrops.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeCrops.map(crop => {
            const cropData = CROP_DATABASE[crop.cropId];
            const isActive = selectedCrop === crop.cropId && plantingDate === crop.plantingDate;
            
            return (
              <button
                key={crop.id}
                onClick={() => handleSelectCrop(crop)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }`}
              >
                <span className="text-xl">{cropData.icon}</span>
                <span>{cropData.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCrop(crop.id);
                  }}
                  className="ml-1 hover:bg-white/20 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      {selectedCrop && timeline ? (
        <>
          {/* Current Stage Overview */}
          {currentStageInfo && currentStageInfo.stage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
                    {currentStageInfo.stage.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {currentStageInfo.stage.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentStageInfo.stage.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(currentStageInfo.progress)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Day {currentStageInfo.daysIntoStage + 1} of {currentStageInfo.stage.duration}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStageInfo.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                />
              </div>

              {/* Weather Requirements */}
              {currentStageInfo.stage.weatherRequirements && (
                <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Optimal Weather Conditions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>
                        {currentStageInfo.stage.weatherRequirements.temperature.min}°C - 
                        {currentStageInfo.stage.weatherRequirements.temperature.max}°C
                      </span>
                    </div>
                    {weatherData && weatherData.current && (
                      <div className={`flex items-center gap-2 ${
                        weatherData.current.temperature >= currentStageInfo.stage.weatherRequirements.temperature.min &&
                        weatherData.current.temperature <= currentStageInfo.stage.weatherRequirements.temperature.max
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        <Sun className="w-4 h-4" />
                        <span>Current: {weatherData.current.temperature}°C</span>
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-1 text-gray-600 dark:text-gray-400">
                      {currentStageInfo.stage.weatherRequirements.description}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Next Actions */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold gradient-text mb-4">
              📋 Recommended Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nextActions.slice(0, 6).map((action, index) => {
                const ActionIcon = ACTION_ICONS[action.type] || CheckCircle;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card relative overflow-hidden ${
                      action.urgency === 'now' ? 'border-2 border-red-500' : ''
                    }`}
                  >
                    {/* Urgency Indicator */}
                    <div className={`absolute top-0 right-0 w-2 h-full ${getUrgencyColor(action.urgency)}`} />
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0`}>
                        <ActionIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold ${getPriorityColor(action.priority)}`}>
                            {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                          </h3>
                          {action.urgency === 'now' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                              NOW
                            </span>
                          )}
                          {action.urgency === 'soon' && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                              SOON
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {action.description}
                        </p>
                        
                        {/* Timing */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <Clock className="w-3 h-3" />
                          {action.daysUntilAction <= 0 ? (
                            <span className="font-semibold text-red-600">Due today</span>
                          ) : action.daysUntilAction === 1 ? (
                            <span>Tomorrow</span>
                          ) : (
                            <span>In {action.daysUntilAction} days</span>
                          )}
                        </div>

                        {/* Weather Suitability */}
                        {action.weatherSuitable && (
                          <div className={`flex items-start gap-2 text-xs p-2 rounded ${
                            action.weatherSuitable.suitable
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}>
                            {action.weatherSuitable.suitable ? (
                              <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            )}
                            <span>{action.weatherSuitable.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Timeline Visualization */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold gradient-text mb-4">
              📅 Growth Timeline
            </h2>
            <div className="glass-card">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500" />
                
                {/* Timeline Stages */}
                <div className="space-y-6">
                  {timeline.timeline.map((stage, index) => {
                    const isPast = currentStageInfo && index < currentStageInfo.stageIndex;
                    const isCurrent = currentStageInfo && index === currentStageInfo.stageIndex;
                    const isFuture = currentStageInfo && index > currentStageInfo.stageIndex;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-20"
                      >
                        {/* Stage Icon */}
                        <div className={`absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          isPast ? 'bg-green-500' :
                          isCurrent ? 'bg-blue-600 ring-4 ring-blue-200 dark:ring-blue-800' :
                          'bg-gray-300 dark:bg-gray-700'
                        }`}>
                          {isPast ? '✓' : stage.icon}
                        </div>
                        
                        {/* Stage Content */}
                        <div className={`pb-6 ${isCurrent ? 'border-l-4 border-blue-600 pl-4' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={`text-lg font-bold ${
                                isCurrent ? 'text-blue-600 dark:text-blue-400' : 
                                'text-gray-900 dark:text-gray-100'
                              }`}>
                                {stage.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {stage.description}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-600 dark:text-gray-400">
                                {stage.startDate.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {stage.duration} days
                              </p>
                            </div>
                          </div>
                          
                          {/* Stage Actions */}
                          {stage.actions.length > 0 && (isCurrent || isFuture) && (
                            <div className="mt-3 space-y-2">
                              {stage.actions.map((action, aIdx) => (
                                <div key={aIdx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                  <CheckCircle className="w-4 h-4 text-blue-500" />
                                  <span>{action.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Harvest Date */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tractor className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">Expected Harvest</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Based on {timeline.totalDuration} day growth cycle
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {timeline.expectedHarvest.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="glass-card text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl mx-auto mb-4">
            🌱
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Active Crops
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add your first crop to start tracking growth stages and get smart recommendations
          </p>
          <button
            onClick={() => setShowAddCrop(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Your First Crop
          </button>
        </div>
      )}

      {/* Add Crop Modal */}
      <AnimatePresence>
        {showAddCrop && (
          <AddCropModal
            onClose={() => setShowAddCrop(false)}
            onAdd={handleAddCrop}
            weatherData={weatherData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* Add Crop Modal Component */
const AddCropModal = ({ onClose, onAdd, weatherData }) => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [plantingDate, setPlantingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // Get crops filtered by location
  const availableCrops = weatherData && weatherData.location
    ? getAvailableCrops(weatherData.location.latitude, weatherData.location.longitude)
    : getAvailableCrops();
  
  // Get crop recommendations based on weather
  const recommendations = weatherData 
    ? getRecommendedCrops(weatherData)
    : null;

  const handleSubmit = () => {
    if (selectedCrop && plantingDate) {
      onAdd(selectedCrop, plantingDate);
    }
  };
  
  // Get suitability badge color
  const getSuitabilityBadgeClass = (color) => {
    const colors = {
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
      yellow: 'bg-yellow-500 text-gray-900',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white',
      gray: 'bg-gray-500 text-white'
    };
    return colors[color] || colors.gray;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold gradient-text">Add New Crop</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Weather-Based Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  Recommended Crops for Current Weather
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {recommendations.slice(0, 3).map(rec => (
                  <div key={rec.cropId} className="flex items-center gap-2">
                    <span className="text-lg">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rec.cropName}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getSuitabilityBadgeClass(rec.suitabilityColor)}`}>
                        {rec.suitabilityLabel} ({rec.score}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Crop Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Select Crop
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recommendations ? recommendations.map(rec => {
                return (
                  <button
                    key={rec.cropId}
                    onClick={() => setSelectedCrop(rec.cropId)}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      selectedCrop === rec.cropId
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">{rec.icon}</div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {rec.cropName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {rec.duration} days
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getSuitabilityBadgeClass(rec.suitabilityColor)}`}>
                        {rec.suitabilityLabel}
                      </span>
                    </div>
                    {rec.isOptimalSeason && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </button>
                );
              }) : availableCrops.map(crop => {
                const sowingWindow = getSowingWindow(crop.id);
                
                return (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedCrop === crop.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">{crop.icon}</div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {crop.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {crop.duration} days
                    </p>
                    {sowingWindow.isOptimalNow && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Optimal Now
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planting Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Planting Date
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Detailed Crop Suitability */}
          {selectedCrop && recommendations && (
            <div className="space-y-3">
              {(() => {
                const cropRec = recommendations.find(r => r.cropId === selectedCrop);
                if (!cropRec) return null;
                
                return (
                  <>
                    {/* Suitability Score */}
                    <div className={`p-4 rounded-lg border-2 ${
                      cropRec.score >= 80 ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800' :
                      cropRec.score >= 60 ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800' :
                      cropRec.score >= 40 ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-800'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Thermometer className="w-5 h-5" />
                          Weather Suitability
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSuitabilityBadgeClass(cropRec.suitabilityColor)}`}>
                          {cropRec.score}% {cropRec.suitabilityLabel}
                        </span>
                      </div>
                      
                      {/* Reasons */}
                      {cropRec.reasons.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {cropRec.reasons.map((reason, idx) => (
                            <p key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{reason}</span>
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {/* Warnings */}
                      {cropRec.warnings.length > 0 && (
                        <div className="space-y-1">
                          {cropRec.warnings.map((warning, idx) => (
                            <p key={idx} className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Optimal Sowing Months */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Optimal Sowing Months
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {cropRec.sowingSeasons.map(m => 
                          m.charAt(0).toUpperCase() + m.slice(1)
                        ).join(', ')}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCrop || !plantingDate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Crop
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CropCalendar;

