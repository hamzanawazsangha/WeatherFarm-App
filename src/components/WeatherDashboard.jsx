import { useState, useEffect } from 'react'
import WeatherCard from './WeatherCard'
import SearchBar from './SearchBar'
import LoadingSkeleton from './LoadingSkeleton'
import { getWeatherData, cacheWeatherData, getCachedWeatherData } from '../services/weatherService'
import { getLocationByCoordinates } from '../services/geocodingService'
import { saveAnalyticsData } from '../services/analyticsService'
import { useTheme } from '../context/ThemeContext'
import { 
  Droplet, Wind, Thermometer, Sun, Moon, Gauge, CloudRain, 
  AlertCircle, Loader2, RefreshCw, MapPin, X
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

const WeatherDashboard = () => {
  const { setWeatherBasedTheme } = useTheme()
  const [location, setLocation] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [locationPermission, setLocationPermission] = useState(null)

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('not-supported')
      return
    }

    // Check if permission was previously denied
    const permissionDenied = localStorage.getItem('locationPermissionDenied')
    if (permissionDenied === 'true') {
      setLocationPermission('denied')
      return
    }

    console.log('Requesting geolocation...')
    setLoading(true)
    setError(null)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Geolocation success:', position.coords)
          const { latitude, longitude } = position.coords
          
          // Get location name from coordinates
          console.log('Fetching location name for:', latitude, longitude)
          const locationData = await getLocationByCoordinates(latitude, longitude)
          
          if (locationData) {
            console.log('Location data received:', locationData)
            await handleLocationSelect(locationData)
          } else {
            // If reverse geocoding fails, create a location object
            console.log('Reverse geocoding failed, using fallback')
            const fallbackLocation = {
              latitude,
              longitude,
              displayName: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
              timezone: 'auto'
            }
            await handleLocationSelect(fallbackLocation)
          }
          
          setLocationPermission('granted')
          localStorage.removeItem('locationPermissionDenied')
          console.log('Location permission granted and data loaded')
        } catch (err) {
          console.error('Error getting location:', err)
          setError('Failed to get your location: ' + err.message)
          setLoading(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err.code, err.message)
        if (err.code === 1) {
          // Permission denied
          setLocationPermission('denied')
          localStorage.setItem('locationPermissionDenied', 'true')
        } else if (err.code === 2) {
          // Position unavailable
          setError('Location unavailable. Please try selecting a location manually.')
        } else if (err.code === 3) {
          // Timeout
          setError('Location request timed out. Please try again.')
        } else {
          setError('Failed to get location: ' + err.message)
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 300000
      }
    )
  }

  // Load cached data on mount - only run once
  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const cached = getCachedWeatherData()
        if (cached && cached.weatherData && cached.location && mounted) {
          console.log('Loading cached weather data')
          
          // Check if displayName is in coordinate format (e.g., "32.26, 74.66" or "32.26,74.66")
          const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/
          const isCoordinateFormat = cached.location.displayName && coordPattern.test(cached.location.displayName.trim())
          
          console.log('Cached location:', cached.location.displayName, 'Is coordinate format:', isCoordinateFormat)
          
          if (isCoordinateFormat && cached.location.latitude && cached.location.longitude) {
            // Try to get proper location name from coordinates
            console.log('Cached location has coordinates, fetching name from:', cached.location.latitude, cached.location.longitude)
            try {
              const locationData = await getLocationByCoordinates(
                cached.location.latitude,
                cached.location.longitude
              )
              console.log('Reverse geocoding result:', locationData)
              if (locationData && locationData.displayName && !coordPattern.test(locationData.displayName)) {
                // Update location with proper name
                const updatedLocation = {
                  ...cached.location,
                  displayName: locationData.displayName,
                  name: locationData.name,
                  country: locationData.country,
                  admin1: locationData.admin1,
                  countryCode: locationData.countryCode,
                }
                console.log('Updated location with name:', updatedLocation.displayName)
                setLocation(updatedLocation)
                // Update cache with new location name
                cacheWeatherData(updatedLocation, cached.weatherData)
              } else {
                console.log('Reverse geocoding failed or returned coordinates, using cached location')
                setLocation(cached.location)
              }
            } catch (err) {
              console.error('Error fetching location name:', err)
              setLocation(cached.location)
            }
          } else {
            setLocation(cached.location)
          }
          
          setWeatherData(cached.weatherData)
          if (cached.weatherData.current) {
            setWeatherBasedTheme(cached.weatherData.current.condition)
          }
          setLastUpdate(new Date(cached.timestamp))
        } else if (mounted) {
          // Auto-request location if no cached data
          const permissionDenied = localStorage.getItem('locationPermissionDenied')
          if (permissionDenied !== 'true' && navigator.geolocation) {
            console.log('No cached data, auto-requesting location')
            handleAutoLocation()
          }
        }
      } catch (err) {
        console.error('Error loading cached data:', err)
        // If error loading cache, try auto-location
        const permissionDenied = localStorage.getItem('locationPermissionDenied')
        if (permissionDenied !== 'true' && navigator.geolocation) {
          console.log('Error loading cache, trying auto-location')
          handleAutoLocation()
        }
      }
    }
    loadData()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  const handleLocationSelect = async (selectedLocation) => {
    if (!selectedLocation || !selectedLocation.latitude || !selectedLocation.longitude) {
      console.error('Invalid location:', selectedLocation)
      setError('Invalid location data')
      return
    }

    setLocation(selectedLocation)
    setError(null)
    setLoading(true)

    try {
      console.log('Fetching weather for:', selectedLocation)
      const data = await getWeatherData(
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.timezone || 'auto'
      )
      
      console.log('Weather data received:', data)
      
      if (!data || !data.current) {
        throw new Error('Invalid weather data received from API')
      }
      
      // Set all state together to prevent flickering
      setWeatherData(data)
      setLastUpdate(new Date())
      cacheWeatherData(selectedLocation, data)
      setWeatherBasedTheme(data.current.condition)
      
      // Save analytics data
      saveAnalyticsData(data)
      
      setLoading(false)
      
      console.log('State updated - weatherData:', !!data, 'location:', !!selectedLocation)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err.message || 'Failed to fetch weather data')
      setLoading(false)
      // Don't clear location on error - keep it so user can retry
    }
  }

  const handleRefresh = async () => {
    if (!location) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await getWeatherData(
        location.latitude,
        location.longitude,
        location.timezone || 'auto'
      )
      
      setWeatherData(data)
      setWeatherBasedTheme(data.current.condition)
      cacheWeatherData(location, data)
      setLastUpdate(new Date())
      
      // Save analytics data
      saveAnalyticsData(data)
    } catch (err) {
      console.error('Weather refresh error:', err)
      setError(err.message || 'Failed to refresh weather data')
    } finally {
      setLoading(false)
    }
  }

  const { current, forecast, sunrise, sunset } = weatherData || {}

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
                {forecast && forecast.map((day, index) => (
                  <WeatherCard
                    key={index}
                    temperature={day.maxTemp}
                    condition={day.condition}
                    feelsLike={day.minTemp}
                    humidity={day.rainProbability}
                    wind={day.windSpeed}
                    pressure={day.precipitation.toFixed(1)}
                    time={day.dayName}
                    variant="mini"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Weather Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rain Probability */}
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
                  Max probability: {Math.max(...forecast.map(d => d.rainProbability))}%
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
                {getWindDirection(current.windDirection)}°
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
        </>
      )}
    </div>
  )
}

// Helper function to get wind direction name
const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export default WeatherDashboard
