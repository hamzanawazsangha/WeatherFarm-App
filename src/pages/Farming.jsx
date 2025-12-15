import { useState, useEffect } from 'react'
import { Sprout, AlertCircle } from 'lucide-react'
import CropAdvisor from '../components/CropAdvisor'
import { getCachedWeatherData } from '../services/weatherService'

const Farming = () => {
  const [weatherData, setWeatherData] = useState(null)

  // Load weather data from cache and update when cache changes
  useEffect(() => {
    const loadWeatherData = () => {
      const cached = getCachedWeatherData()
      if (cached && cached.weatherData) {
        setWeatherData(cached.weatherData)
      }
    }

    // Load initially
    loadWeatherData()

    // Listen for storage changes (when weather is updated on Weather page)
    const handleStorageChange = (e) => {
      if (e.key === 'weatherCache' || !e.key) {
        loadWeatherData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically (every 5 seconds) for cache updates
    const interval = setInterval(loadWeatherData, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
          <Sprout className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          Farming Intelligence
        </h1>
      </div>

      <CropAdvisor weatherData={weatherData} />
    </div>
  )
}

export default Farming

