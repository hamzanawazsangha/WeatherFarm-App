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
 * @param {Object} riskIndex - Crop risk index data
 * @param {Array} activeAlerts - Active weather/farming alerts
 * @returns {string} System prompt
 */
const buildSystemPrompt = (weatherData, cropType, language = 'en', location = null, riskIndex = null, activeAlerts = []) => {
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

  // Add risk index context
  if (riskIndex) {
    const riskText = isUrdu
      ? `\n\nفصل کا خطرہ انڈیکس: ${riskIndex.totalScore}/100 (${riskIndex.category})\nاہم خطرات:\n- گرمی کا دباؤ: ${riskIndex.breakdown?.heatStress?.score || 0}/100\n- پانی کا دباؤ: ${riskIndex.breakdown?.waterStress?.score || 0}/100\n- کیڑے/بیماری: ${riskIndex.breakdown?.pestRisk?.score || 0}/100\n- ہوا کا نقصان: ${riskIndex.breakdown?.windRisk?.score || 0}/100`
      : `\n\nCrop Risk Index: ${riskIndex.totalScore}/100 (${riskIndex.category})\nKey Risks:\n- Heat Stress: ${riskIndex.breakdown?.heatStress?.score || 0}/100\n- Water Stress: ${riskIndex.breakdown?.waterStress?.score || 0}/100\n- Pest/Disease: ${riskIndex.breakdown?.pestRisk?.score || 0}/100\n- Wind Damage: ${riskIndex.breakdown?.windRisk?.score || 0}/100`
    prompt += riskText
  }

  // Add active alerts context
  if (activeAlerts && activeAlerts.length > 0) {
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 3)
    if (criticalAlerts.length > 0) {
      const alertsText = isUrdu
        ? `\n\nفعال انتباہات:\n${criticalAlerts.map(a => `- ${a.title}: ${a.message}`).join('\n')}`
        : `\n\nActive Alerts:\n${criticalAlerts.map(a => `- ${a.title}: ${a.message}`).join('\n')}`
      prompt += alertsText
    }
  }

  prompt += isUrdu
    ? '\n\nآپ کا کام:\n1. کسان کو سادہ اردو میں جواب دیں\n2. عملی اقدامات بتائیں\n3. مثالیں اور تفصیلات دیں\n4. فوری اقدامات کو نمایاں کریں\n5. سائنسی اصطلاحات سے بچیں'
    : '\n\nYour Role:\n1. Answer in simple, clear English\n2. Provide actionable steps\n3. Give examples and details\n4. Highlight urgent actions\n5. Avoid technical jargon\n6. Be practical and farmer-friendly'

  return prompt
}

/**
 * Get example prompt templates based on context
 */
export const getExamplePrompts = (language = 'en', riskIndex = null, activeAlerts = []) => {
  const isUrdu = language === 'ur'
  
  // Dynamic prompts based on risk and alerts
  const hasHighRisk = riskIndex && riskIndex.totalScore > 60
  const hasCriticalAlerts = activeAlerts.some(a => a.severity === 'critical')
  
  if (isUrdu) {
    if (hasCriticalAlerts) {
      return [
        'انتباہات کی تفصیل سمجھائیں',
        'میں فوری کیا کروں؟',
        'کیا آج باہر کام کرنا محفوظ ہے؟',
        'آج کے لیے اہم اقدامات بتائیں',
      ]
    }
    if (hasHighRisk) {
      return [
        'خطرے کی وجہ کیا ہے؟',
        'میں خطرہ کیسے کم کروں؟',
        'کیا میری فصل محفوظ ہے؟',
        'کون سی احتیاطی تدابیر اختیار کروں؟',
      ]
    }
    return [
      'آج کے لیے مکمل مشورہ دیں',
      'کیا آبیاری کا اچھا وقت ہے؟',
      'میری فصل کی صحت کیسی ہے؟',
      'کل کے لیے کیا منصوبہ بنائیں؟',
      'کیڑے مار دوا کب چھڑکیں؟',
      'بارش کب آئے گی؟',
      'کھاد کب ڈالنی چاہیے؟',
      'فصل کی کٹائی کب کریں؟',
    ]
  }
  
  // English prompts
  if (hasCriticalAlerts) {
    return [
      'Explain the critical alerts',
      'What should I do immediately?',
      'Is it safe to work outside today?',
      'Give me urgent action plan',
    ]
  }
  if (hasHighRisk) {
    return [
      'Why is the risk high?',
      'How can I reduce the risk?',
      'Is my crop safe?',
      'What precautions should I take?',
    ]
  }
  return [
    'Give me today\'s complete advice',
    'Is it good time for irrigation?',
    'How is my crop health?',
    'What should I plan for tomorrow?',
    'When should I spray pesticide?',
    'When will it rain?',
    'When to apply fertilizer?',
    'When to harvest my crop?',
  ]
}

/**
 * Generate daily action summary
 */
export const generateDailySummary = async (weatherData, cropType, riskIndex, activeAlerts, language = 'en') => {
  const isUrdu = language === 'ur'
  const question = isUrdu
    ? 'آج کے لیے مکمل کاشتکاری کا خلاصہ دیں۔ کیا کرنا ہے اور کیا نہیں کرنا؟ ترجیح کی بنیاد پر 3-5 نکات دیں۔'
    : 'Give me a complete farming summary for today. What to do and what not to do? Provide 3-5 points in order of priority.'
  
  return await sendAIMessage(question, [], weatherData, cropType, language, null, riskIndex, activeAlerts)
}

/**
 * Explain specific alert
 */
export const explainAlert = async (alert, weatherData, cropType, language = 'en') => {
  const isUrdu = language === 'ur'
  const question = isUrdu
    ? `اس انتباہ کی تفصیل بتائیں: "${alert.title}". میری فصل پر کیا اثر ہوگا اور میں کیا کروں؟`
    : `Explain this alert in detail: "${alert.title}". How will it affect my crop and what should I do?`
  
  return await sendAIMessage(question, [], weatherData, cropType, language, null, null, [alert])
}

/**
 * Send message to AI assistant with context
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} weatherData - Current weather data
 * @param {string} cropType - Selected crop type
 * @param {string} language - 'en' or 'ur'
 * @param {Object} location - Current location
 * @param {Object} riskIndex - Crop risk index
 * @param {Array} activeAlerts - Active alerts
 * @returns {Promise<string>} AI response
 */
export const sendAIMessage = async (message, conversationHistory = [], weatherData = null, cropType = null, language = 'en', location = null, riskIndex = null, activeAlerts = []) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file')
  }

  try {
    const systemPrompt = buildSystemPrompt(weatherData, cropType, language, location, riskIndex, activeAlerts)
    
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

