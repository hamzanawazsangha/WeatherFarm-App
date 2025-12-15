import { motion } from 'framer-motion'
import { Cloud, Sun, CloudRain, CloudLightning, Snowflake, Droplet, Wind, Thermometer, CloudRain as CloudRainIcon } from 'lucide-react';

const weatherIcons = {
  sunny: Sun,
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  rainy: CloudRain,
  storm: CloudLightning,
  stormy: CloudLightning,
  snowy: Snowflake,
  foggy: Cloud,
  mist: Cloud,
};

// Unified Professional Color Scheme
const getGradientColor = (condition) => {
  // All cards use blue gradient for consistency
  return { start: '#2563eb', end: '#3b82f6' };
};

const WeatherCard = ({
  temperature = '--',
  condition = 'clear',
  feelsLike = '--',
  humidity = '--',
  wind = '--',
  pressure = '--',
  time = '',
  variant = 'main',
}) => {
  const Icon = weatherIcons[condition] || Sun;
  const gradient = getGradientColor(condition);
  const isMini = variant === 'mini';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg group ${isMini ? 'p-4 min-w-[140px]' : 'p-8'}`}
      style={{ background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)` }}
    >
      <div className="absolute inset-0 bg-white/10 dark:bg-black/20 rounded-xl transition-all duration-300"></div>
      <div className="relative z-10 flex flex-col items-center text-center w-full overflow-hidden">
        {/* Icon */}
        <div className={`flex items-center justify-center relative w-full ${isMini ? 'mb-3' : 'mb-6'}`}>
          <Icon className={`text-white drop-shadow-lg relative z-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${isMini ? 'w-10 h-10' : 'w-20 h-20 md:w-24 md:h-24'}`} />
        </div>
        <div className="w-full overflow-hidden">
          <h3 className={`font-extrabold mb-2 text-white drop-shadow-md break-words ${isMini ? 'text-xl' : 'text-4xl md:text-5xl mb-3'}`}>
            {typeof temperature === 'number' ? `${temperature}°C` : temperature}
          </h3>
          <div className={`font-bold capitalize text-white/95 drop-shadow-sm break-words ${isMini ? 'text-xs mb-1' : 'text-lg md:text-xl mb-2'}`}>{condition}</div>
          {time && <div className={`text-white/90 font-medium break-words ${isMini ? 'text-xs mb-2' : 'text-sm mb-4'}`}>{time}</div>}
          {!isMini && (
            <div className="w-full grid grid-cols-2 gap-3 mt-4 md:mt-6">
              <div className="flex items-start gap-2 bg-white/20 rounded-[16px] px-3 py-2.5 backdrop-blur-[20px] border border-white/30 overflow-hidden">
                <Thermometer className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-white/90 block mb-0.5 break-words">Feels like</span>
                  <span className="text-sm font-bold text-white break-words">{typeof feelsLike === 'number' ? feelsLike + '°C' : feelsLike}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/20 rounded-[16px] px-3 py-2.5 backdrop-blur-[20px] border border-white/30 overflow-hidden">
                <Droplet className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-white/90 block mb-0.5 break-words">Humidity</span>
                  <span className="text-sm font-bold text-white break-words">{typeof humidity === 'number' ? humidity + '%' : humidity}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/20 rounded-[16px] px-3 py-2.5 backdrop-blur-[20px] border border-white/30 overflow-hidden">
                <Wind className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-white/90 block mb-0.5 break-words">Wind</span>
                  <span className="text-sm font-bold text-white break-words">{typeof wind === 'number' ? wind + ' km/h' : wind}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/20 rounded-[16px] px-3 py-2.5 backdrop-blur-[20px] border border-white/30 overflow-hidden">
                <Droplet className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-white/90 block mb-0.5 break-words">Precip</span>
                  <span className="text-sm font-bold text-white break-words">{typeof pressure === 'number' ? pressure + 'mm' : pressure}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
