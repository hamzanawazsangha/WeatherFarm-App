import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import FloatingAIChat from './FloatingAIChat'
import OfflineBanner from './OfflineBanner'
import InstallPrompt from './InstallPrompt'
import LanguageSelector from './LanguageSelector'
import {
  Home, Cloud, Sprout, BarChart3, Bell, Moon, Sun, Menu, X
} from 'lucide-react'

const getGradientClass = (weatherTheme) => {
  switch (weatherTheme) {
    case 'sunny': return 'gradient-bg-sunny';
    case 'cloudy': return 'gradient-bg-cloudy';
    case 'rainy': return 'gradient-bg-rainy';
    case 'stormy': return 'gradient-bg-stormy';
    case 'snowy': return 'gradient-bg-snowy';
    case 'foggy': return 'gradient-bg-foggy';
    default: return 'gradient-bg-sunny'
  }
}

const Layout = ({ children }) => {
  const { theme, toggleTheme, weatherTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/weather', icon: Cloud, label: 'Weather' },
    { path: '/farming', icon: Sprout, label: 'Farming' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
  ]

  const gradientClass = getGradientClass(weatherTheme || 'sunny')
  return (
    <div className={`min-h-screen flex ${gradientClass} text-gray-900 dark:text-gray-100`}> 
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col glass shadow-2xl w-64 min-h-screen py-10 px-6 space-y-8 fixed left-0 top-0 z-40 border-r border-white/20">
        <Link to="/" className="flex items-center gap-3 mb-8 group">
          <div className="relative">
             <Cloud className="w-10 h-10 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
             <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-xl"></div>
          </div>
          <span className="text-2xl font-extrabold gradient-text tracking-tight">WeatherFarm</span>
        </Link>
        <nav className="flex flex-col gap-3">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`nav-item flex items-center gap-4 px-5 py-4 font-semibold text-base transition-all duration-300 relative group rounded-[20px] ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-300 dark:border-blue-700' 
                      : 'text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C084FC] to-[#93C5FD] rounded-r-full"></div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-white/20">
          <LanguageSelector value={language} onChange={setLanguage} variant="desktop" />
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-3 glass px-4 py-3 rounded-[20px] font-medium text-gray-800 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-blue-600" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
              <span className="text-sm font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top Navbar for mobile */}
        <header className="glass sticky top-0 left-0 z-30 py-4 px-6 flex items-center justify-between lg:hidden backdrop-blur-xl border-b border-white/20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
             <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
             <div className="absolute inset-0 bg-[#C084FC]/20 dark:bg-[#93C5FD]/20 rounded-full blur-md"></div>
            </div>
            <span className="text-xl font-extrabold gradient-text tracking-tight">WeatherFarm</span>
          </Link>
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[12px] hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-blue-600" /> : <Moon className="w-5 h-5 text-blue-600" />}
            </button>
            <LanguageSelector value={language} onChange={setLanguage} variant="mobile" />
            <button
              className="p-2 rounded-lg md:hidden ml-1 hover:bg-white/10 dark:hover:bg-gray-800/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <nav className="lg:hidden fixed top-0 left-0 w-full h-full bg-black/40 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed top-0 left-0 bg-white dark:bg-gray-900 w-2/3 max-w-xs h-full shadow-lg glass flex flex-col p-4 gap-3">
              <Link to="/" className="flex items-center gap-2 mb-6">
                 <Cloud className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold gradient-text">WeatherFarm</span>
              </Link>
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                     className={`flex items-center gap-3 px-4 py-2 rounded-[16px] font-semibold text-base transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" /> {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
        <main className="flex-1 p-4 md:p-10 relative z-10">
          {children}
        </main>
        
        {/* Floating AI Chat Button */}
        <FloatingAIChat />
        
        {/* Install Prompt */}
        <InstallPrompt />
        
        <footer className="glass border-t border-white/30 dark:border-white/10 mt-auto py-8 text-center backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-base font-bold gradient-text">WeatherFarm</span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                © 2025 Weather & Farming Assistant
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Powered by React + Vite + TailwindCSS
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout

