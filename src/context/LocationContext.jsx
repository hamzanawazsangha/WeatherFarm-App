import { createContext, useContext, useState, useEffect } from 'react';
import { getLocationByCoordinates } from '../services/geocodingService';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        console.log('Loaded saved location:', parsed.displayName);
      } catch (e) {
        console.error('Error loading saved location:', e);
      }
    } else {
      // Auto-detect location if no saved location
      requestAutoLocation();
    }
  }, []);

  const requestAutoLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const permissionDenied = localStorage.getItem('locationPermissionDenied');
    if (permissionDenied === 'true') {
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get location name from coordinates
          const locationData = await getLocationByCoordinates(latitude, longitude);
          
          if (locationData) {
            updateLocation(locationData);
            localStorage.removeItem('locationPermissionDenied');
          } else {
            // Fallback if reverse geocoding fails
            const fallbackLocation = {
              latitude,
              longitude,
              displayName: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
              timezone: 'auto'
            };
            updateLocation(fallbackLocation);
          }
        } catch (err) {
          console.error('Error getting location:', err);
          setError('Failed to get your location');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === 1) {
          localStorage.setItem('locationPermissionDenied', 'true');
          setError('Location permission denied');
        } else {
          setError('Failed to get location');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const updateLocation = (newLocation) => {
    console.log('Location updated:', newLocation.displayName || newLocation);
    setLocation(newLocation);
    // Save to localStorage
    localStorage.setItem('selectedLocation', JSON.stringify(newLocation));
    setError(null);
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('selectedLocation');
  };

  const value = {
    location,
    loading,
    error,
    updateLocation,
    clearLocation,
    requestAutoLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;

