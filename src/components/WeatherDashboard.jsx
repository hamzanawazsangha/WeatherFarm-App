import { useState, useEffect } from 'react'
import WeatherCard from './WeatherCard'
import SearchBar from './SearchBar'
import LoadingSkeleton from './LoadingSkeleton'
import IrrigationCard from './IrrigationCard'
import { getFarmingWeatherData, cacheWeatherData, getCachedWeatherData } from '../services/weatherService'
import { saveAnalyticsData } from '../services/analyticsService'
import { analyzeSoilMoisture } from '../services/soilMoistureService'
import { generateAlerts } from '../services/alertEngine'
import { saveAlerts } from '../services/alertStorage'
import { useTheme } from '../context/ThemeContext'
import { useLocation } from '../context/LocationContext'
import { 
  Droplet, Wind, Thermometer, Sun, Moon, Gauge, CloudRain, 
  AlertCircle, RefreshCw, MapPin, TrendingUp, Activity, Clock, Calendar
} from 'lucide-react'

// Helper function to safely format dates
const formatTime = (date) => {
  if (!date) return ''
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  return dateObj.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Helper function to get wind direction name
const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

const WeatherDashboard = () => {
  const { setWeatherBasedTheme } = useTheme()
  const { location, updateLocation } = useLocation()
  const [weatherData, setWeatherData] = useState(null)
  const [soilMoistureData, setSoilMoistureData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [historicalDays, setHistoricalDays] = useState(7)

  // Load cached weather data when location changes
  useEffect(() => {
    if (!location) return;
    
    const loadWeatherData = async () => {
      console.log('Loading weather for location:', location.displayName);
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFarmingWeatherData(
          location.latitude,
          location.longitude,
          location.timezone || 'auto',
          historicalDays
        );
        
        if (!data || !data.current) {
          throw new Error('Invalid weather data received');
        }
        
        setWeatherData(data);
        setWeatherBasedTheme(data.current.condition);
        setLastUpdate(new Date());
        cacheWeatherData(location, data);
        
        // Calculate soil moisture
        const soilAnalysis = analyzeSoilMoisture(data);
        setSoilMoistureData(soilAnalysis);
        
        // Generate and save alerts
        const alerts = generateAlerts(data, null, soilAnalysis, null);
        await saveAlerts(alerts);
        
        // Dispatch event for AlertBell to update
        window.dispatchEvent(new Event('newAlert'));
        
        // Save analytics
        saveAnalyticsData(data);
        
        console.log('✅ Weather data loaded successfully for:', location.displayName);
        if (alerts.length > 0) {
          console.log(`⚠️ Generated ${alerts.length} alert(s)`);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err.message || 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };
    
    loadWeatherData();
  }, [location, historicalDays, setWeatherBasedTheme])

  const handleLocationSelect = async (selectedLocation) => {
    if (!selectedLocation || !selectedLocation.latitude || !selectedLocation.longitude) {
      console.error('Invalid location:', selectedLocation)
      setError('Invalid location data')
      return
    }

    console.log('📍 Location selected:', selectedLocation.displayName);
    // Update the global location context
    updateLocation(selectedLocation);
  }

  const handleRefresh = async () => {
    if (!location) return
    
    console.log('🔄 Refreshing weather data for:', location.displayName);
    setLoading(true)
    setError(null)
    
    try {
      const data = await getFarmingWeatherData(
        location.latitude,
        location.longitude,
        location.timezone || 'auto',
        historicalDays
      )
      
      if (!data || !data.current) {
        throw new Error('Invalid weather data received');
      }
      
      setWeatherData(data)
      setWeatherBasedTheme(data.current.condition)
      cacheWeatherData(location, data)
      setLastUpdate(new Date())
      
      // Calculate soil moisture
      const soilAnalysis = analyzeSoilMoisture(data)
      setSoilMoistureData(soilAnalysis)
      
      // Generate and save alerts
      const alerts = generateAlerts(data, null, soilAnalysis, null)
      await saveAlerts(alerts)
      
      // Dispatch event for AlertBell to update
      window.dispatchEvent(new Event('newAlert'))
      
      saveAnalyticsData(data)
      
      console.log('✅ Weather data refreshed successfully');
      if (alerts.length > 0) {
        console.log(`⚠️ Generated ${alerts.length} alert(s)`);
      }
    } catch (err) {
      console.error('Weather refresh error:', err)
      setError(err.message || 'Failed to refresh weather data')
    } finally {
      setLoading(false)
    }
  }

  const { current, daily, hourly, historical, summary } = weatherData || {}
  const forecast = daily || []
  const sunrise = summary?.sunrise
  const sunset = summary?.sunset

  return (
    <div className="w-full space-y-8">

      {/* Header with Search - Always visible */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">Weather Forecast</h1>
          {location && (
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-lg text-gray-800 dark:text-gray-200">
                <span className="font-semibold">{location.displayName}</span>
                {lastUpdate && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    • Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar 
              onLocationSelect={handleLocationSelect}
              placeholder="Search location..."
            />
          </div>
          {location && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Refresh weather"
            >
              <RefreshCw className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !weatherData && (
        <div className="space-y-6">
          <LoadingSkeleton type="weather" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LoadingSkeleton type="card" count={4} />
          </div>
        </div>
      )}

      {/* Search Screen - Show when no weather data */}
      {!weatherData && !loading && (
        <div className="text-center space-y-6 py-12 w-full">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Search for a city or village</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Enter a city name to get current weather and forecast</p>
          <div className="max-w-2xl mx-auto w-full">
            <SearchBar onLocationSelect={handleLocationSelect} />
          </div>
        </div>
      )}

      {/* Weather Content */}
      {weatherData && current && (
        <>
          {/* Main Weather Card + Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Current Weather Card - Wider */}
            <div className="lg:col-span-2">
              <WeatherCard
                temperature={current.temperature}
                condition={current.condition}
                feelsLike={current.feelsLike}
                humidity={current.humidity}
                wind={current.windSpeed}
                pressure={Math.round((current.precipitation || 0) * 10) / 10}
                time={formatTime(current.time)}
                variant="main"
              />
            </div>

            {/* 5-Day Forecast */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">5-Day Forecast</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {forecast && forecast.slice(1, 6).map((day, index) => (
                  <WeatherCard
                    key={index}
                    temperature={day.maxTemp}
                    condition={day.condition}
                    feelsLike={day.minTemp}
                    humidity={day.precipitationProbability}
                    wind={day.windSpeed}
                    pressure={day.rain.toFixed(1)}
                    time={day.dayName}
                    variant="mini"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Weather Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rain */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <CloudRain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Rain</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {current.precipitation > 0 ? `${current.precipitation.toFixed(1)}mm` : '0mm'}
                  </p>
                </div>
              </div>
              {forecast && forecast.length > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Rain probability: {forecast[0]?.precipitationProbability || 0}%
                </div>
              )}
            </div>

            {/* UV Index */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">UV Index</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {current.uvIndex}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {current.uvIndex <= 2 ? 'Low' : 
                 current.uvIndex <= 5 ? 'Moderate' : 
                 current.uvIndex <= 7 ? 'High' : 
                 current.uvIndex <= 10 ? 'Very High' : 'Extreme'}
              </div>
            </div>

            {/* Sunrise */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sunrise</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTime(sunrise)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sunset */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sunset</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTime(sunset)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card text-center">
              <Wind className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wind Speed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {current.windSpeed} km/h
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {getWindDirection(current.windDirection)}
              </p>
            </div>

            <div className="glass-card text-center">
              <Droplet className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Humidity</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {current.humidity}%
              </p>
            </div>

            <div className="glass-card text-center">
              <Thermometer className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Feels Like</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {current.feelsLike}°C
              </p>
            </div>

            <div className="glass-card text-center">
              <Gauge className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cloud Cover</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {current.cloudCover}%
              </p>
            </div>
          </div>

          {/* 🌾 Farming Intelligence Section */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text flex items-center gap-3">
              <Activity className="w-8 h-8" />
              Farming Intelligence
            </h2>

            {/* Soil Moisture & Irrigation */}
            {soilMoistureData && (
              <IrrigationCard soilData={soilMoistureData} />
            )}

            {/* Hourly Forecast & Historical Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Forecast */}
              {hourly && hourly.length > 0 && (
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                    <Clock className="w-6 h-6" />
                    Hourly Forecast (24h)
                  </h3>
                  <div className="glass-card">
                    <div className="overflow-x-auto scrollbar-thin">
                      <div className="flex gap-3 pb-2">
                        {hourly.slice(0, 24).map((hour, index) => (
                          <div 
                            key={index} 
                            className="flex-shrink-0 flex flex-col items-center p-3 bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all min-w-[90px]"
                          >
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              {new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric' })}
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {hour.temperature}°
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                              🔥 {hour.heatIndex}°
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              💧 {hour.precipitationProbability}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Rainfall */}
              {historical && historical.rainfall && historical.rainfall.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      Historical Rainfall ({historicalDays} days)
                    </h3>
                    <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                      {[7, 15, 30].map((days) => (
                        <button
                          key={days}
                          onClick={async () => {
                            setHistoricalDays(days);
                            if (location) {
                              setLoading(true);
                              try {
                                const data = await getFarmingWeatherData(
                                  location.latitude,
                                  location.longitude,
                                  location.timezone || 'auto',
                                  days
                                );
                                setWeatherData(data);
                                const soilAnalysis = analyzeSoilMoisture(data);
                                setSoilMoistureData(soilAnalysis);
                              } catch (err) {
                                console.error('Error refreshing data:', err);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                            historicalDays === days
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-700/70'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card">
                    <div className="space-y-3 mb-4">
                      {historical.rainfall.slice(0, Math.min(10, historical.rainfall.length)).map((day, index) => {
                        const barWidth = Math.min(100, (day.rain / 20) * 100);
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-24 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex-1">
                              <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                                <div className="absolute inset-0 flex items-center px-2">
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {day.rain.toFixed(1)}mm
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="w-20 text-xs text-gray-600 dark:text-gray-400 text-right">
                              {day.tempMin}° - {day.tempMax}°
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Rainfall</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {historical.totalRainfall}mm
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Daily Average</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {historical.averageDailyRainfall}mm
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Days Tracked</p>
                        <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {historical.rainfall.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WeatherDashboard
