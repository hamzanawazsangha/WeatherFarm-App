# 🌾 Weather & Farming Assistant - Quick Start Guide

Welcome to your comprehensive Weather & Farming Assistant! This guide will help you get started quickly.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [First Steps](#first-steps)
3. [Key Features](#key-features)
4. [How to Use Each Feature](#how-to-use-each-feature)
5. [Tips & Best Practices](#tips--best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Initial Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone or download the project**
   ```bash
   cd WeatherFarm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your API keys:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

---

## 🎯 First Steps

### 1. Select Your Location
- Go to the **Weather Dashboard** (home page)
- Use the search bar to find your city/village
- Or click "Use Current Location" to auto-detect

**Why it matters:** All farming advice, risk calculations, and alerts are based on your location's actual weather data.

### 2. Choose Your Crop
- Go to **Farming Intelligence** page
- Select your crop from the dropdown at the top
- This selection affects all farming recommendations

### 3. Explore Your Dashboard
The app will now show personalized data for your location and crop!

---

## 🌟 Key Features

### 1. **Weather Dashboard** 📊
- Real-time weather data
- 5-day forecast
- Detailed metrics (UV index, humidity, wind, precipitation)
- Historical weather trends

### 2. **Farming Intelligence** 🌱
- **Crop Risk Index**: Real-time risk assessment (0-100 scale)
- **Activity Planner**: Daily recommendations for irrigation, pesticide, fertilizer, and harvesting
- **Pest & Disease Risk**: Threat analysis with prevention advice
- **Crop Advisor**: Detailed insights on crop conditions

### 3. **Smart Crop Calendar** 📅
- Growth stage tracking
- Fertilizer and pesticide schedules
- Weather-aware recommendations
- Multi-crop management
- Location-based crop suggestions

### 4. **Analytics Dashboard** 📈
- Temperature trends
- Rainfall probability charts
- Crop risk history
- 7, 14, or 30-day views

### 5. **Smart Alerts** 🔔
- Heatwave warnings
- Flood risk alerts
- Frost damage notifications
- High wind warnings
- Pest outbreak alerts
- Real-time notifications

### 6. **AI Farming Assistant** 🤖
- Context-aware chat (knows your location, crop, and weather)
- Bilingual support (English + Urdu)
- Daily farming summary
- Alert explanations
- Personalized advice

---

## 📖 How to Use Each Feature

### Weather Dashboard

1. **Select Location**: Click the search bar, type your city name, select from results
2. **View Current Weather**: See temperature, humidity, wind, and more
3. **Check Forecast**: Scroll to see 5-day weather forecast
4. **Refresh Data**: Click the refresh button to update weather

### Farming Intelligence

1. **Select Crop**: Use the dropdown at the top to choose your crop
2. **Check Risk Index**: See your crop's overall risk score (0-30 = Safe, 31-60 = Moderate, 61-100 = High)
3. **Review Activity Planner**: Get YES/NO/WAIT decisions for today's farming activities
4. **Expand Sections**: Click on "Pest & Disease Risk" or "Additional Farming Insights" to see detailed information

### Smart Crop Calendar

1. **Add a Crop**: Click "Add Crop" button
2. **Select Crop & Date**: Choose crop type and planting date
3. **View Timeline**: See growth stages and upcoming tasks
4. **Get Recommendations**: Check weather-aware advice for each stage
5. **Track Multiple Crops**: Add as many crops as you're growing

### Analytics Dashboard

1. **Choose Tab**: Select from Weather Trends, Crop Health, or Crop Risks
2. **Adjust Time Range**: Click 7, 14, or 30 days to see different periods
3. **Analyze Charts**: Hover over chart points for detailed data
4. **Export Data**: (Coming soon) Download data as CSV

### Smart Alerts

1. **Check Alert Bell**: Top-right corner shows unread alert count
2. **View Recent Alerts**: Click bell to see latest 5 alerts
3. **See All Alerts**: Click "View All Alerts" or go to Alerts page
4. **Dismiss Alerts**: Click alert to see details and dismiss
5. **Mark as Read**: Click "Mark all as read" to clear notifications

### AI Farming Assistant

1. **Select Crop**: Choose your crop from the dropdown
2. **Click Quick Questions**: Or type your own question
3. **Get Daily Summary**: Click "Daily Summary" for complete daily advice
4. **Switch Language**: Toggle between English and Urdu
5. **Ask Follow-ups**: Continue conversation for detailed advice

---

## 💡 Tips & Best Practices

### For Best Results

1. **Update Location Regularly**
   - Weather data is location-specific
   - Update if you move or manage multiple farms

2. **Check Daily**
   - Review the Activity Planner each morning
   - Check alerts before planning your day
   - Use Daily Summary in AI Assistant

3. **Track Your Crops**
   - Add all your crops to the Crop Calendar
   - Update planting dates accurately
   - Follow stage-specific recommendations

4. **Understand Risk Scores**
   - **0-30 (Safe)**: Normal conditions, routine care
   - **31-60 (Moderate)**: Monitor closely, prepare preventive actions
   - **61-100 (High)**: Immediate action needed, follow urgent recommendations

5. **Use the AI Assistant**
   - Ask specific questions about your situation
   - Request explanations for alerts you don't understand
   - Get advice on unusual weather patterns

### Weather Data Interpretation

- **Precipitation**: Total rainfall expected (in mm)
- **Precipitation Probability**: Chance of rain (%)
- **UV Index**: 
  - 0-2: Low
  - 3-5: Moderate
  - 6-7: High
  - 8-10: Very High
  - 11+: Extreme
- **Wind Speed**: Measured in km/h
  - <20: Light breeze
  - 20-40: Moderate wind
  - 40+: Strong wind (risk of crop damage)

---

## 🔧 Troubleshooting

### Common Issues

**Problem: Location not found**
- Solution: Try searching with different keywords (e.g., "city, country")
- Alternative: Use "Current Location" button

**Problem: Weather data not loading**
- Solution: Check internet connection
- Solution: Refresh the page
- Solution: Clear browser cache

**Problem: AI Assistant not responding**
- Solution: Check if OpenAI API key is set in `.env` file
- Solution: Verify API key is valid and has credits

**Problem: Crop not showing in selector**
- Solution: Try searching by crop name
- Solution: Check spelling
- Note: System supports 27+ crops

**Problem: Alerts not appearing**
- Solution: Select a location first (alerts are location-specific)
- Solution: Check if weather data is loaded
- Solution: Refresh the page

**Problem: Farming Intelligence shows "Select a location"**
- Solution: Go to Weather page and select your location
- Solution: Allow location access when prompted

### Performance Tips

1. **Slow Loading**
   - Clear browser cache
   - Close unnecessary browser tabs
   - Restart the development server

2. **Data Not Updating**
   - Click the refresh button
   - Wait 5 seconds for API response
   - Check console for errors (F12)

3. **Chart Issues**
   - Reload the page
   - Try a different time range
   - Ensure location is selected

---

## 📱 Mobile Usage

The app is fully responsive! On mobile:
- Use hamburger menu (☰) to access navigation
- Swipe cards horizontally for better viewing
- Tap to expand collapsible sections
- All features work the same as desktop

---

## 🌐 Offline Mode (PWA)

This app works offline (Progressive Web App):
- Once loaded, it caches data
- Alerts work offline
- Weather data may be outdated when offline
- Reconnect for fresh data

---

## 🆘 Need More Help?

1. Check the README.md for technical documentation
2. Review feature tooltips in the app
3. Ask the AI Assistant for guidance
4. Check the GitHub repository for updates

---

## 🎉 You're Ready!

Start by:
1. Selecting your location on the Weather Dashboard
2. Choosing your crop on Farming Intelligence
3. Checking today's Activity Planner
4. Asking the AI Assistant: "Give me today's complete advice"

Happy Farming! 🌾

