import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2, Languages, Sparkles, TrendingUp, AlertTriangle, Leaf, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendAIMessage, getExamplePrompts, generateDailySummary, explainAlert } from '../services/aiService'
import { useLocation } from '../context/LocationContext'
import { getFarmingWeatherData } from '../services/weatherService'
import { getActiveAlerts } from '../services/alertStorage'
import { calculateCropRiskIndex } from '../services/cropRiskIndexService'
import { analyzePestDiseaseRisk } from '../services/pestDiseaseService'
import { CROP_DATABASE } from '../services/cropCalendarService'
import CropSelector from './CropSelector'

const Chatbot = () => {
  const { location } = useLocation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en')
  const [selectedCrop, setSelectedCrop] = useState('wheat')
  const [weatherData, setWeatherData] = useState(null)
  const [riskIndex, setRiskIndex] = useState(null)
  const [activeAlerts, setActiveAlerts] = useState([])
  const [showQuickQuestions, setShowQuickQuestions] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load context data and calculate risk dynamically
  useEffect(() => {
    const loadContext = async () => {
      if (location) {
        try {
          // Load weather data
          const weather = await getFarmingWeatherData(location.latitude, location.longitude)
          setWeatherData(weather)
          
          // Calculate crop risk index dynamically based on selected crop
          if (weather && selectedCrop) {
            // Get pest/disease risk for the selected crop
            const pestRisk = analyzePestDiseaseRisk(weather, selectedCrop)
            
            // Calculate real-time risk index for this specific crop
            const riskData = calculateCropRiskIndex(
              weather,
              selectedCrop,
              null, // soil data
              pestRisk
            )
            setRiskIndex(riskData)
          }
          
          // Load active alerts
          const alerts = getActiveAlerts()
          setActiveAlerts(alerts)
        } catch (error) {
          console.error('Error loading context:', error)
        }
      }
    }

    loadContext()
    const interval = setInterval(loadContext, 60000) // Refresh every minute
    
    return () => clearInterval(interval)
  }, [location, selectedCrop]) // Recalculate when crop changes

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = language === 'ur'
        ? 'السلام علیکم! میں آپ کا زرعی مشیر ہوں۔ میں موسم، کاشتکاری، اور فصل کی دیکھ بھال میں آپ کی مدد کر سکتا ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟'
        : 'Hello! I\'m your AI Farming Assistant. I can help you with weather-based farming advice, crop management, pest control, irrigation, and more. How can I assist you today?'
      
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }])
    }
  }, [language])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e, customMessage = null) => {
    e?.preventDefault()
    const messageContent = customMessage || input.trim()
    if (!messageContent || loading) return

    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setLoading(true)
    setShowQuickQuestions(false)

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await sendAIMessage(
        userMessage.content,
        conversationHistory,
        weatherData,
        selectedCrop,
        language,
        location,
        riskIndex,
        activeAlerts
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      console.error('AI Error:', err)
      const errorMessage = language === 'ur'
        ? 'معذرت! کچھ غلط ہوگیا۔ براہ کرم دوبارہ کوشش کریں۔'
        : 'Sorry! Something went wrong. Please try again.'
      setError(err.message || errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (question) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleDailySummary = async () => {
    setLoading(true)
    setError(null)
    setShowQuickQuestions(false)
    
    try {
      const summary = await generateDailySummary(weatherData, selectedCrop, riskIndex, activeAlerts, language)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: summary,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      console.error('Daily summary error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExplainAlert = async (alert) => {
    setLoading(true)
    setError(null)
    
    try {
      const explanation = await explainAlert(alert, weatherData, selectedCrop, language)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: explanation,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      console.error('Alert explanation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ur' : 'en')
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const quickQuestions = getExamplePrompts(language, riskIndex, activeAlerts)
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 2)

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title and Location */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                {language === 'ur' ? 'زرعی مشیر' : 'AI Farming Assistant'}
              </h1>
              {location && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    📍 {location.displayName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    {CROP_DATABASE[selectedCrop]?.icon || '🌾'} {CROP_DATABASE[selectedCrop]?.name || selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Crop Selector */}
            <div className="min-w-[180px] max-w-[220px]">
              <CropSelector
                value={selectedCrop}
                onChange={setSelectedCrop}
              />
            </div>

            {/* Daily Summary Button */}
            <button
              onClick={handleDailySummary}
              disabled={loading || !weatherData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ur' ? 'آج کا خلاصہ' : 'Daily Summary'}</span>
              <span className="sm:hidden">Summary</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-semibold shadow-md"
            >
              <Languages className="w-4 h-4" />
              <span className="text-sm">{language === 'ur' ? 'اردو' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Context Info */}
        {(riskIndex || criticalAlerts.length > 0) && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Index */}
            {riskIndex && (
              <div className={`p-4 rounded-xl border-2 shadow-md transition-all hover:shadow-lg ${
                riskIndex.totalScore > 60 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-400 dark:border-red-600' :
                riskIndex.totalScore > 30 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-400 dark:border-yellow-600' :
                'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-400 dark:border-green-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      riskIndex.totalScore > 60 ? 'bg-red-500' :
                      riskIndex.totalScore > 30 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ur' ? 'فصل کا خطرہ' : 'Crop Risk Index'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {riskIndex.totalScore}<span className="text-base">/100</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    riskIndex.totalScore > 60 ? 'bg-red-500 text-white' :
                    riskIndex.totalScore > 30 ? 'bg-yellow-500 text-gray-900' :
                    'bg-green-500 text-white'
                  }`}>
                    {riskIndex.category}
                  </span>
                </div>
              </div>
            )}

            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-xl shadow-md transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
                        {language === 'ur' ? 'فعال انتباہات' : 'Active Alerts'}
                      </p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {criticalAlerts.length}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                    {language === 'ur' ? 'اہم' : 'Critical'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto glass-card p-6 space-y-4 mb-6 min-h-[400px] max-h-[600px] shadow-lg">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5 px-2">
                  {formatTime(msg.timestamp)}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {showQuickQuestions && messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-6 shadow-lg"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            {language === 'ur' ? 'تجویز کردہ سوالات' : 'Quick Questions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 text-blue-900 dark:text-blue-100 rounded-xl transition-all text-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md font-medium"
              >
                {question}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="glass-card shadow-lg">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'ur' ? 'اپنا سوال یہاں لکھیں...' : 'Ask me anything about your farm...'}
            className="flex-1 px-5 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base shadow-sm"
            disabled={loading}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">{language === 'ur' ? 'بھیجیں' : 'Send'}</span>
              </>
            )}
          </button>
        </form>

        {!location && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {language === 'ur' 
                ? 'بہتر مشورے کے لیے Weather صفحہ پر جا کر اپنا مقام منتخب کریں'
                : 'Select a location on the Weather page for personalized farming advice based on your local weather'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chatbot
