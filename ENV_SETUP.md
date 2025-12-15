# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Open-Meteo Weather API (No API key required)
VITE_WEATHER_API_URL=https://api.open-meteo.com/v1

# AI Chat API Keys (Choose one)
# For Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# For OpenAI API
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_API_URL=https://api.openai.com/v1

# App Configuration
VITE_APP_NAME=Weather & Farming Assistant
VITE_APP_VERSION=1.0.0
```

## Getting API Keys

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into `VITE_GEMINI_API_KEY`

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste it into `VITE_OPENAI_API_KEY`

## Notes

- The Open-Meteo API does not require an API key
- You only need to configure one AI provider (Gemini or OpenAI)
- Never commit your `.env` file to version control

