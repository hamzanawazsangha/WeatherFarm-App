/**
 * AI Service
 * Handles API calls to OpenAI for farming assistant chat functionality
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1'

/**
 * Build system prompt with weather and crop context
 * @param {Object} weatherData - Current weather data
 * @param {string} cropType - Selected crop type
 * @param {string} language - 'en' or 'ur'
 * @param {Object} location - Current location
 * @returns {string} System prompt
 */
const buildSystemPrompt = (weatherData, cropType, language = 'en', location = null) => {
  const isUrdu = language === 'ur'
  
  let prompt = isUrdu 
    ? 'آپ ایک ماہر زرعی مشیر ہیں جو کسانوں کو موسم، کاشتکاری، اور زرعی مشورے دیتے ہیں۔ آپ کو اردو میں جواب دینا چاہیے۔'
    : 'You are an expert agricultural advisor helping farmers with weather, farming practices, and agricultural recommendations. Provide practical, actionable advice.'

  // Add location context
  if (location) {
    const locationName = location.displayName || location.name || `${location.latitude}, ${location.longitude}`
    const locationContext = isUrdu
      ? `\n\nمقام: ${locationName}`
      : `\n\nLocation: ${locationName}`
    prompt += locationContext
  }

  if (weatherData && weatherData.current) {
    const w = weatherData.current
    const weatherContext = isUrdu
      ? `\n\nموجودہ موسمی حالات:\n- درجہ حرارت: ${w.temperature}°C\n- نمی: ${w.humidity}%\n- بارش: ${(w.precipitation || 0).toFixed(1)}mm\n- ہوا کی رفتار: ${w.windSpeed || 0} km/h\n- یووی انڈیکس: ${w.uvIndex || 0}\n- موسمی حالت: ${w.condition}`
      : `\n\nCurrent Weather Conditions:\n- Temperature: ${w.temperature}°C\n- Humidity: ${w.humidity}%\n- Precipitation: ${(w.precipitation || 0).toFixed(1)}mm\n- Wind Speed: ${w.windSpeed || 0} km/h\n- UV Index: ${w.uvIndex || 0}\n- Condition: ${w.condition}`
    
    prompt += weatherContext

    if (weatherData.forecast && weatherData.forecast.length > 0) {
      const forecast = weatherData.forecast.slice(0, 3)
      const forecastText = isUrdu
        ? `\n\nاگلے 3 دنوں کی پیشن گوئی:\n${forecast.map((f, i) => `دن ${i + 1}: ${f.maxTemp}°C/${f.minTemp}°C, بارش ${(f.precipitation || 0).toFixed(1)}mm, بارش کا امکان ${f.rainProbability || 0}%`).join('\n')}`
        : `\n\nNext 3 Days Forecast:\n${forecast.map((f, i) => `Day ${i + 1}: ${f.maxTemp}°C/${f.minTemp}°C, Rain ${(f.precipitation || 0).toFixed(1)}mm, Rain Probability ${f.rainProbability || 0}%`).join('\n')}`
      
      prompt += forecastText
    }
  }

  if (cropType) {
    const cropText = isUrdu
      ? `\n\nمنتخب فصل: ${cropType.charAt(0).toUpperCase() + cropType.slice(1)}`
      : `\n\nSelected Crop: ${cropType.charAt(0).toUpperCase() + cropType.slice(1)}`
    prompt += cropText
  }

  prompt += isUrdu
    ? '\n\nمختصر، عملی، اور آسان الفاظ میں جواب دیں۔'
    : '\n\nProvide concise, practical answers in simple language.'

  return prompt
}

/**
 * Get example prompt templates
 */
export const getExamplePrompts = (language = 'en') => {
  const isUrdu = language === 'ur'
  
  if (isUrdu) {
    return [
      'کیا آبیاری کا اچھا وقت ہے؟',
      'میرے کپاس کے پتے پیلا کیوں ہیں؟',
      'کیا مجھے کل کیڑے مار دوا چھڑکنی چاہیے؟',
      'آج کے لیے کاشتکاری کے مشورے دیں۔',
      'میرے لیے بہترین کاشتکاری کا وقت کیا ہے؟',
      'بارش کی پیشن گوئی کیا ہے؟',
    ]
  }
  
  return [
    'Is it good time for irrigation?',
    'Why are my cotton leaves yellow?',
    'Should I spray pesticide tomorrow?',
    'Give me today\'s farming suggestions.',
    'What is the best time for planting?',
    'What is the rainfall forecast?',
  ]
}

/**
 * Send message to AI assistant with context
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} weatherData - Current weather data
 * @param {string} cropType - Selected crop type
 * @param {string} language - 'en' or 'ur'
 * @returns {Promise<string>} AI response
 */
export const sendAIMessage = async (message, conversationHistory = [], weatherData = null, cropType = null, language = 'en') => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file')
  }

  try {
    const systemPrompt = buildSystemPrompt(weatherData, cropType, language)
    
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory
        .filter(msg => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      { role: 'user', content: message },
    ]

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response from AI'
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw error
  }
}

// Legacy export for backward compatibility
export const aiService = {
  sendMessage: sendAIMessage,
}

