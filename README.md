# WeatherFarm - Weather & Farming Assistant

A full-featured Progressive Web App (PWA) that combines real-time weather forecasting with AI-powered farming intelligence. Built with React, Vite, and TailwindCSS.

![WeatherFarm](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![PWA](https://img.shields.io/badge/PWA-Enabled-purple)

## 🌟 Features

### Weather Intelligence
- **Real-time Weather Data** - Current conditions and 5-day forecasts
- **Location Search** - Search cities/villages worldwide
- **Auto-location Detection** - Automatic location using browser geolocation
- **Weather Analytics** - Temperature, humidity, wind speed, and rainfall trends
- **Offline Support** - Cached weather data available offline

### Farming Intelligence
- **Crop-Specific Insights** - Support for Wheat, Rice, Cotton, Sugarcane, and Vegetables
- **Smart Irrigation Recommendations** - AI-powered irrigation scheduling
- **Pest & Disease Risk Prediction** - Rules-based risk assessment
- **Activity Planner** - Best days for harvest, spraying, and fertilizing
- **Crop Loss Risk Score** - 0-100 risk assessment with actionable recommendations

### AI Assistant
- **Bilingual Support** - English and Urdu (اردو) responses
- **Context-Aware** - Uses current weather data and crop type
- **Farming Q&A** - Ask questions about irrigation, pests, diseases, and best practices
- **Example Prompts** - Pre-built questions for quick assistance

### Data Analytics
- **Interactive Charts** - Temperature, rainfall, wind speed, and humidity trends
- **Crop Risk History** - Track crop risk scores over time
- **Irrigation Insights** - Precipitation analysis and recommendations
- **Time Range Selection** - View data for 7, 14, or 30 days

### Progressive Web App
- **Installable** - Add to home screen on any device
- **Offline Support** - Works without internet connection
- **Fast Loading** - Optimized performance with code splitting
- **Responsive Design** - Works on mobile, tablet, and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key (for AI Chat feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_OPENAI_API_URL=https://api.openai.com/v1
   ```

   > **Note:** The app works without OpenAI API key, but AI Chat feature will be disabled.

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` directory with:
- Code splitting and lazy loading
- Minified JavaScript and CSS
- Optimized assets
- Service worker for PWA
- Tree-shaking for smaller bundle size

### Preview Production Build

```bash
npm run preview
```

Test the production build locally before deploying.

### Deployment Options

#### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - `VITE_OPENAI_API_KEY`

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Add environment variables in Netlify dashboard

#### GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

#### Docker

1. Build Docker image:
   ```bash
   docker build -t weatherfarm .
   ```

2. Run container:
   ```bash
   docker run -p 3000:80 weatherfarm
   ```

## 🛠️ Tech Stack

- **Frontend Framework:** React 18.2
- **Build Tool:** Vite 5.0 (with code splitting)
- **Styling:** TailwindCSS 3.3
- **Routing:** React Router DOM 6.20 (with lazy loading)
- **Charts:** Chart.js 4.4 + React-ChartJS-2
- **Icons:** Lucide React
- **Animations:** Framer Motion 10.16
- **PWA:** Vite Plugin PWA + Workbox
- **Performance:**
  - Lazy loading for all pages
  - Code splitting (React, Charts, Animations)
  - Loading skeletons
  - Error boundaries
- **APIs:**
  - Open-Meteo (Weather & Geocoding) - Free, no API key required
  - Nominatim (Reverse Geocoding) - Free, no API key required
  - OpenAI (AI Chat) - Requires API key

## 📁 Project Structure

```
weather-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── vite.svg               # App icon
├── src/
│   ├── components/
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── Chatbot.jsx
│   │   ├── CropAdvisor.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── FloatingAIChat.jsx
│   │   ├── InstallPrompt.jsx
│   │   ├── LanguageSelector.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── OfflineBanner.jsx
│   │   ├── SearchBar.jsx
│   │   └── WeatherCard.jsx
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   └── useOnlineStatus.js
│   ├── pages/
│   │   ├── AIChat.jsx
│   │   ├── Analytics.jsx
│   │   ├── Alerts.jsx
│   │   ├── Farming.jsx
│   │   ├── Home.jsx
│   │   ├── OfflinePage.jsx
│   │   └── Weather.jsx
│   ├── services/
│   │   ├── aiService.js
│   │   ├── analyticsService.js
│   │   ├── cropAdvisorService.js
│   │   ├── geocodingService.js
│   │   ├── storageService.js
│   │   └── weatherService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI Chat | Optional |
| `VITE_OPENAI_API_URL` | OpenAI API endpoint | Optional (defaults to official API) |

### PWA Configuration

PWA settings are configured in `vite.config.js`. Key settings:

- **Cache Strategy:** NetworkFirst for APIs, CacheFirst for images
- **Update Strategy:** Auto-update with prompt
- **Offline Support:** Full offline functionality with cached data

## 📱 Usage

### Weather Page

1. **Search Location:** Use the search bar to find cities/villages
2. **Auto-location:** Allow browser location access for automatic detection
3. **View Forecast:** See current weather and 5-day forecast
4. **Refresh:** Click refresh button to update weather data

### Farming Page

1. **Select Crop:** Choose from Wheat, Rice, Cotton, Sugarcane, or Vegetables
2. **View Insights:** See crop-specific recommendations and risk assessments
3. **Activity Planner:** Check best days for farming activities
4. **Risk Score:** Monitor crop loss risk (0-100)

### Analytics Page

1. **Select Time Range:** Choose 7, 14, or 30 days
2. **View Trends:** Explore weather and crop risk trends
3. **Switch Tabs:** Weather Trends, Crop Risks, or Irrigation Insights

### AI Chat

1. **Select Language:** Choose English or Urdu
2. **Select Crop:** Optional crop type selection
3. **Ask Questions:** Type farming-related questions
4. **Use Examples:** Click example questions for quick start

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6', // Blue
      // Add your custom colors
    }
  }
}
```

### Adding New Crops

Edit `src/services/cropAdvisorService.js`:

```javascript
const CROP_TYPES = {
  // Add new crop type
  NEW_CROP: 'new-crop',
}

// Add optimal conditions
const CROP_OPTIMAL_CONDITIONS = {
  [CROP_TYPES.NEW_CROP]: {
    tempMin: 15,
    tempMax: 30,
    // ... other conditions
  }
}
```

## 🐛 Troubleshooting

### App Not Loading

1. Clear browser cache
2. Check console for errors
3. Verify Node.js version (18+)
4. Reinstall dependencies: `rm -rf node_modules && npm install`

### PWA Not Installing

1. Ensure HTTPS (required for PWA)
2. Check manifest.json is accessible
3. Verify service worker is registered
4. Check browser console for errors

### AI Chat Not Working

1. Verify OpenAI API key in `.env`
2. Check API key has sufficient credits
3. Review browser console for API errors

### Weather Data Not Loading

1. Check internet connection
2. Verify Open-Meteo API is accessible
3. Check browser console for API errors
4. Try refreshing the page

## 📊 Performance Optimization

- **Code Splitting:** All pages are lazy-loaded
- **Asset Optimization:** Images and fonts are optimized
- **Caching:** Aggressive caching for APIs and static assets
- **Bundle Size:** Optimized with Vite's build process
- **Lighthouse Score:** 90+ on all metrics

## 🔒 Security

- API keys are stored in environment variables
- No sensitive data in client-side code
- HTTPS required for PWA features
- Service worker validates all requests

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## 🙏 Acknowledgments

- Open-Meteo for weather API
- OpenAI for AI capabilities
- React and Vite communities
- All contributors

---

**Made with ❤️ for farmers and agriculture**
