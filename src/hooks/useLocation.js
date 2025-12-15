import { useState, useEffect } from 'react'

export const useLocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    // Try to get cached location first
    const cached = localStorage.getItem('userLocation')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setLocation(parsed)
        setLoading(false)
      } catch (err) {
        console.error('Error parsing cached location:', err)
      }
    }

    // Get current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setLocation(loc)
        localStorage.setItem('userLocation', JSON.stringify(loc))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
        // Use default location if geolocation fails
        const defaultLoc = { latitude: 40.7128, longitude: -74.0060 } // NYC
        setLocation(defaultLoc)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }, [])

  return { location, loading, error }
}

