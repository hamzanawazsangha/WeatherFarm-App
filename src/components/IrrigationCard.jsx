import { motion } from 'framer-motion';
import { Droplet, AlertTriangle, CheckCircle, Clock, TrendingUp, Thermometer, Wind, CloudRain } from 'lucide-react';

const IrrigationCard = ({ soilData }) => {
  if (!soilData) {
    return null;
  }

  const {
    moistureLevel,
    moistureScore,
    moistureDescription,
    recommendation,
    priority,
    explanation,
    details,
    color
  } = soilData;

  // Color schemes based on priority
  const colorSchemes = {
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-600 dark:bg-red-500',
      gradient: 'from-red-500 to-red-600',
      icon: 'text-red-600 dark:text-red-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-300 dark:border-orange-700',
      text: 'text-orange-700 dark:text-orange-300',
      badge: 'bg-orange-600 dark:bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      icon: 'text-orange-600 dark:text-orange-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-300',
      badge: 'bg-yellow-600 dark:bg-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      badge: 'bg-green-600 dark:bg-green-500',
      gradient: 'from-green-500 to-green-600',
      icon: 'text-green-600 dark:text-green-400'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-600 dark:bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800/20',
      border: 'border-gray-300 dark:border-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      badge: 'bg-gray-600 dark:bg-gray-500',
      gradient: 'from-gray-500 to-gray-600',
      icon: 'text-gray-600 dark:text-gray-400'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.gray;

  // Priority icon
  const getPriorityIcon = () => {
    if (priority === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (priority === 'medium') return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  // Moisture level bar width
  const moistureBarWidth = `${moistureScore}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card ${scheme.bg} border ${scheme.border} overflow-hidden shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${scheme.gradient} flex items-center justify-center shadow-md`}>
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Soil Moisture & Irrigation
            </h3>
          </div>
        </div>
        
        {/* Priority Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${scheme.badge} text-white text-sm font-semibold shadow-sm`}>
          {getPriorityIcon()}
          <span className="uppercase">{priority}</span>
        </div>
      </div>

      {/* Soil Moisture Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Moisture Level
          </span>
          <span className={`text-lg font-bold ${scheme.text}`}>
            {moistureLevel} ({moistureScore}%)
          </span>
        </div>
        
        {/* Moisture Bar */}
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: moistureBarWidth }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute h-full bg-gradient-to-r ${scheme.gradient} rounded-full`}
          />
        </div>
      </div>

      {/* Recommendation Box */}
      <div className={`py-3 px-4 rounded-lg border ${scheme.border} bg-white/50 dark:bg-gray-800/50 mb-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{soilData.icon}</span>
          <h4 className={`text-base font-bold ${scheme.text}`}>
            {recommendation}
          </h4>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {explanation}
        </p>
      </div>

      {/* Details Grid */}
      {details && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Recent Rainfall */}
          <div className="text-center py-3 px-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <CloudRain className={`w-6 h-6 mx-auto mb-2 ${scheme.icon}`} />
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recent Rain</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {details.recentRainfall}mm
            </p>
          </div>

          {/* Upcoming Rain */}
          <div className="text-center py-3 px-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <CloudRain className={`w-6 h-6 mx-auto mb-2 ${scheme.icon}`} />
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Forecast</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {details.upcomingRain}mm
            </p>
          </div>

          {/* Water Loss (ET0) */}
          <div className="text-center py-3 px-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${scheme.icon}`} />
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Water Loss</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {details.todayET0}mm
            </p>
          </div>

          {/* Temperature */}
          <div className="text-center py-3 px-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <Thermometer className={`w-6 h-6 mx-auto mb-2 ${scheme.icon}`} />
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Temperature</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {details.currentTemp}°C
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IrrigationCard;

