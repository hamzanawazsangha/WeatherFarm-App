import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line as LineChart, Bar as BarChart } from 'react-chartjs-2'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Droplet,
  Wind,
  Thermometer,
  AlertTriangle,
  Calendar,
  CloudRain,
} from 'lucide-react'
import {
  getTemperatureChartData,
  getRainfallProbabilityChartData,
  getWindSpeedChartData,
  getHumidityChartData,
  getCropRiskChartData,
  getIrrigationInsights,
  getWeatherTrends,
  saveAnalyticsData,
} from '../services/analyticsService'
import { getCachedWeatherData } from '../services/weatherService'
import { getCropInsights, CROP_TYPES } from '../services/cropAdvisorService'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TABS = {
  WEATHER_TRENDS: 'weather',
  CROP_RISKS: 'crops',
  IRRIGATION: 'irrigation',
}

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.WEATHER_TRENDS)
  const [timeRange, setTimeRange] = useState(7) // days
  const [weatherData, setWeatherData] = useState(null)
  const [trends, setTrends] = useState(null)
  const [irrigationInsights, setIrrigationInsights] = useState(null)

  useEffect(() => {
    // Load weather data from cache
    const loadData = () => {
      const cached = getCachedWeatherData()
      if (cached && cached.weatherData) {
        setWeatherData(cached.weatherData)
        
        // Save current data point to analytics
        saveAnalyticsData(cached.weatherData)
        
        // Calculate crop risk if we have forecast data
        if (cached.weatherData.current && cached.weatherData.forecast) {
          const cropInsights = getCropInsights(
            CROP_TYPES.WHEAT, // Default crop for risk calculation
            cached.weatherData.current,
            cached.weatherData.forecast
          )
          if (cropInsights) {
            saveAnalyticsData(cached.weatherData, cropInsights)
          }
        }
      }
    }

    loadData()

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'weatherCache' || !e.key) {
        loadData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(loadData, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Update trends and insights when timeRange changes
  useEffect(() => {
    setTrends(getWeatherTrends(timeRange))
    setIrrigationInsights(getIrrigationInsights(timeRange))
  }, [timeRange])

  // Chart options with smooth animations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500',
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1)
              if (context.dataset.label?.includes('Temperature')) {
                label += '°C'
              } else if (context.dataset.label?.includes('Humidity')) {
                label += '%'
              } else if (context.dataset.label?.includes('Wind')) {
                label += ' km/h'
              } else if (context.dataset.label?.includes('Probability')) {
                label += '%'
              } else if (context.dataset.label?.includes('Risk')) {
                label += '/100'
              }
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  }

  // Dark mode chart options
  const darkChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        labels: {
          ...chartOptions.plugins.legend.labels,
          color: '#E5E7EB',
        },
      },
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        ticks: {
          ...chartOptions.scales.x.ticks,
          color: '#9CA3AF',
        },
      },
      y: {
        ...chartOptions.scales.y,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          ...chartOptions.scales.y.ticks,
          color: '#9CA3AF',
        },
      },
    },
  }

  const isDark = document.documentElement.classList.contains('dark')
  const currentChartOptions = isDark ? darkChartOptions : chartOptions

  // Get chart data
  const tempChartData = getTemperatureChartData(timeRange)
  const rainfallChartData = getRainfallProbabilityChartData(timeRange)
  const windChartData = getWindSpeedChartData(timeRange)
  const humidityChartData = getHumidityChartData(timeRange)
  const cropRiskChartData = getCropRiskChartData(timeRange)

  // Temperature Chart Data
  const temperatureData = {
    labels: tempChartData.length > 0 ? tempChartData.map(d => d.date) : ['No Data'],
    datasets: [
      {
        label: 'Temperature',
        data: tempChartData.length > 0 ? tempChartData.map(d => d.temperature) : [0],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  // Rainfall Probability Chart Data
  const rainfallProbabilityData = {
    labels: rainfallChartData.length > 0 ? rainfallChartData.map(d => d.date) : ['No Data'],
    datasets: [
      {
        label: 'Rain Probability',
        data: rainfallChartData.length > 0 ? rainfallChartData.map(d => d.probability) : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  // Wind Speed Chart Data
  const windSpeedData = {
    labels: windChartData.length > 0 ? windChartData.map(d => d.date) : ['No Data'],
    datasets: [
      {
        label: 'Wind Speed',
        data: windChartData.length > 0 ? windChartData.map(d => d.windSpeed) : [0],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  // Humidity Chart Data
  const humidityData = {
    labels: humidityChartData.length > 0 ? humidityChartData.map(d => d.date) : ['No Data'],
    datasets: [
      {
        label: 'Humidity',
        data: humidityChartData.length > 0 ? humidityChartData.map(d => d.humidity) : [0],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  // Crop Risk Score Chart Data
  const cropRiskData = {
    labels: cropRiskChartData.length > 0 ? cropRiskChartData.map(d => d.date) : ['No Data'],
    datasets: [
      {
        label: 'Crop Risk Score',
        data: cropRiskChartData.length > 0 ? cropRiskChartData.map(d => d.riskScore) : [0],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          Analytics Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 cursor-pointer"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {trends && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Temperature</span>
              <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {trends.avgTemperature}°C
            </div>
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trends.tempTrend > 0 ? 'text-red-500' : trends.tempTrend < 0 ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {trends.tempTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(trends.tempTrend).toFixed(1)}°C
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Humidity</span>
              <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {trends.avgHumidity}%
            </div>
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trends.humidityTrend > 0 ? 'text-green-500' : trends.humidityTrend < 0 ? 'text-orange-500' : 'text-gray-500'
            }`}>
              {trends.humidityTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(trends.humidityTrend).toFixed(1)}%
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Wind Speed</span>
              <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {trends.avgWindSpeed} km/h
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {trends.dataPoints} data points
            </div>
          </div>

          {irrigationInsights && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Rainfall</span>
                <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {irrigationInsights.totalPrecipitation}mm
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {irrigationInsights.daysWithRain} days with rain
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab(TABS.WEATHER_TRENDS)}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === TABS.WEATHER_TRENDS
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Weather Trends
          </button>
          <button
            onClick={() => setActiveTab(TABS.CROP_RISKS)}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === TABS.CROP_RISKS
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Crop Risks
          </button>
          <button
            onClick={() => setActiveTab(TABS.IRRIGATION)}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === TABS.IRRIGATION
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Irrigation Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Weather Trends Tab */}
        {activeTab === TABS.WEATHER_TRENDS && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Chart */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-4">
                  <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Temperature Variation</h3>
                </div>
                <div className="h-64">
                  <LineChart data={temperatureData} options={currentChartOptions} />
                </div>
              </div>

              {/* Humidity Chart */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-4">
                  <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Humidity Timeline</h3>
                </div>
                <div className="h-64">
                  <LineChart data={humidityData} options={currentChartOptions} />
                </div>
              </div>

              {/* Wind Speed Chart */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Wind Speed Trend</h3>
                </div>
                <div className="h-64">
                  <LineChart data={windSpeedData} options={currentChartOptions} />
                </div>
              </div>

              {/* Rainfall Probability Chart */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-4">
                  <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Rainfall Probability Trend</h3>
                </div>
                <div className="h-64">
                  <BarChart data={rainfallProbabilityData} options={currentChartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crop Risks Tab */}
        {activeTab === TABS.CROP_RISKS && (
          <div className="space-y-6">
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Crop Risk Score History</h3>
              </div>
              <div className="h-80">
                {getCropRiskChartData(timeRange).length > 0 ? (
                  <LineChart data={cropRiskData} options={currentChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No crop risk data available</p>
                      <p className="text-sm mt-1">Select a location and crop on the Farming page to generate risk scores</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Irrigation Insights Tab */}
        {activeTab === TABS.IRRIGATION && (
          <div className="space-y-6">
            {irrigationInsights ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                      <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Total Precipitation</h3>
                    </div>
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
                      {irrigationInsights.totalPrecipitation}mm
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Over the last {timeRange} days
                    </p>
                  </div>

                  <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                      <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Average Daily</h3>
                    </div>
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
                      {irrigationInsights.avgPrecipitation}mm
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Per day average
                    </p>
                  </div>

                  <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Rain Days</h3>
                    </div>
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
                      {irrigationInsights.daysWithRain}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Out of {timeRange} days
                    </p>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Rainfall Probability Trend</h3>
                  </div>
                  <div className="h-64">
                    <BarChart data={rainfallProbabilityData} options={currentChartOptions} />
                  </div>
                </div>

                <div className={`glass-card border-2 ${
                  irrigationInsights.irrigationNeeded
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-start gap-4">
                    <Droplet className={`w-8 h-8 flex-shrink-0 ${
                      irrigationInsights.irrigationNeeded
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
                        {irrigationInsights.irrigationNeeded ? 'Irrigation Recommended' : 'Adequate Rainfall'}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {irrigationInsights.irrigationNeeded
                          ? `Average daily precipitation (${irrigationInsights.avgPrecipitation}mm) is below optimal levels. Consider supplemental irrigation to maintain crop health.`
                          : `Average daily precipitation (${irrigationInsights.avgPrecipitation}mm) is within acceptable range. Natural rainfall should be sufficient for most crops.`}
                      </p>
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>Average rain probability: <span className="font-semibold">{irrigationInsights.avgRainProbability}%</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card text-center py-12">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No irrigation data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard

