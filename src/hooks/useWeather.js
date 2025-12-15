import { useState, useEffect } from 'react'
import { weatherService } from '../services/weatherService'
import { storageService } from '../services/storageService'

export const useWeather = (latitude, longitude) => {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false)
      return
    }

    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to get cached data first
        const cacheKey = `weather_${latitude}_${longitude}`
        const cached = storageService.localStorage.get(cacheKey)
        
        if (cached && Date.now() - cached.timestamp < 600000) { // 10 minutes cache
          setWeather(cached.data.current)
          setForecast(cached.data.forecast)
          setLoading(false)
        }

        // Fetch fresh data
        const [currentData, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(latitude, longitude),
          weatherService.getForecast(latitude, longitude),
        ])

        const weatherData = {
          current: currentData.current,
          forecast: forecastData.daily,
        }

        // Cache the data
        storageService.localStorage.set(cacheKey, {
          data: weatherData,
          timestamp: Date.now(),
        })

        setWeather(currentData.current)
        setForecast(forecastData.daily)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching weather:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude])

  return { weather, forecast, loading, error }
}

