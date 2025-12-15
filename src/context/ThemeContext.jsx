import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'light'
  })
  
  const [weatherTheme, setWeatherTheme] = useState('sunny') // sunny, cloudy, rainy, stormy, snowy, foggy

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    if (theme === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setWeatherBasedTheme = (weatherCondition) => {
    setWeatherTheme(weatherCondition)
    // Apply weather-based color palette to root
    const root = document.documentElement
    const weatherColors = {
      sunny: { primary: '#FFD700', secondary: '#FFA500' },
      cloudy: { primary: '#87CEEB', secondary: '#B0C4DE' },
      rainy: { primary: '#4682B4', secondary: '#5F9EA0' },
      stormy: { primary: '#2F4F4F', secondary: '#1C1C1C' },
      snowy: { primary: '#E0E0E0', secondary: '#F5F5F5' },
      foggy: { primary: '#C0C0C0', secondary: '#A9A9A9' },
    }
    
    const colors = weatherColors[weatherCondition] || weatherColors.sunny
    root.style.setProperty('--weather-primary', colors.primary)
    root.style.setProperty('--weather-secondary', colors.secondary)
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      weatherTheme, 
      setWeatherBasedTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

