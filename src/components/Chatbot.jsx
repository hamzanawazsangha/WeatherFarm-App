import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2, X, Languages, Sparkles } from 'lucide-react'
import { sendAIMessage, getExamplePrompts } from '../services/aiService'
import { getCachedWeatherData } from '../services/weatherService'
import { CROP_TYPES } from '../services/cropAdvisorService'

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI farming assistant. I can help you with weather-based farming advice, irrigation recommendations, pest management, and more. How can I assist you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en')
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [location, setLocation] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load weather data and location from cache, update when cache changes
  useEffect(() => {
    const loadWeatherData = () => {
      const cached = getCachedWeatherData()
      if (cached) {
        if (cached.weatherData) {
          setWeatherData(cached.weatherData)
        }
        if (cached.location) {
          setLocation(cached.location)
        }
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
    
    // Also check periodically (every 3 seconds) for cache updates
    const interval = setInterval(loadWeatherData, 3000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setLoading(true)

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      // Get location for context
      const cached = getCachedWeatherData()
      const currentLocation = cached?.location || location

      const response = await sendAIMessage(
        userMessage.content,
        conversationHistory,
        weatherData,
        selectedCrop,
        language,
        currentLocation
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
      console.error('AI Chat error:', err)
      setError(err.message || 'Failed to get AI response. Please check your API key configuration.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: language === 'ur'
            ? 'معذرت، میں آپ کے سوال کا جواب نہیں دے سکا۔ براہ کرم اپنی API key چیک کریں یا دوبارہ کوشش کریں۔'
            : 'Sorry, I couldn\'t process your request. Please check your API key configuration or try again.',
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleExampleClick = (example) => {
    setInput(example)
    inputRef.current?.focus()
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: language === 'ur'
          ? 'ہیلو! میں آپ کا AI زرعی مشیر ہوں۔ میں آپ کی کیسے مدد کر سکتا ہوں؟'
          : 'Hello! I\'m your AI farming assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ])
    setError(null)
  }

  const examplePrompts = getExamplePrompts(language)

  return (
    <div className="flex flex-col h-full w-full animate-fade-in">
      {/* Header */}
      <div className="glass-card mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-lg"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">AI Farming Assistant</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {location && weatherData && weatherData.current 
                  ? `Weather data for ${location.displayName || location.name || 'current location'}` 
                  : 'No weather data - Select location on Weather page'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ur">اردو</option>
              </select>
              <Languages className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            {/* Crop Selector */}
            <div className="relative">
              <select
                value={selectedCrop || ''}
                onChange={(e) => setSelectedCrop(e.target.value || null)}
                className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Crops</option>
                {Object.values(CROP_TYPES).map((crop) => (
                  <option key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Clear chat"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden mb-4">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            return (
              <div
                key={index}
                className={`flex items-start gap-4 animate-fade-in ${
                  isUser ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                    isUser
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                  }`}
                >
                  {isUser ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[80%] md:max-w-[70%] ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white ml-auto'
                        : message.isError
                        ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ur' ? 'جواب تیار ہو رہا ہے...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <form
          onSubmit={handleSend}
          className="flex items-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder={
                language === 'ur'
                  ? 'اپنا سوال یہاں لکھیں...'
                  : 'Type your question here... (Press Enter to send, Shift+Enter for new line)'
              }
              rows={1}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-300 max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Example Questions */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {language === 'ur' ? 'مثال کے سوالات' : 'Example Questions'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(prompt)}
              disabled={loading}
              className="p-3 text-left bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 text-sm text-gray-800 dark:text-gray-100 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Chatbot

