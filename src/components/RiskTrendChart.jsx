import { Line } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'
import { getRiskHistory, exportRiskHistoryCSV } from '../services/riskHistoryStorage'
import { useState, useEffect } from 'react'

const RiskTrendChart = ({ days = 7 }) => {
  const [history, setHistory] = useState([])
  const [selectedMetric, setSelectedMetric] = useState('total')

  useEffect(() => {
    loadHistory()
  }, [days])

  const loadHistory = () => {
    const data = getRiskHistory().slice(0, days).reverse()
    setHistory(data)
  }

  const handleExport = () => {
    const csv = exportRiskHistoryCSV()
    if (!csv) return

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crop-risk-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (history.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No historical data available yet. Risk scores will be tracked daily.
        </p>
      </div>
    )
  }

  // Calculate trend
  const latest = history[history.length - 1]?.totalScore || 0
  const oldest = history[0]?.totalScore || 0
  const change = latest - oldest
  const average = Math.round(history.reduce((sum, h) => sum + h.totalScore, 0) / history.length)

  let trendDirection = 'stable'
  if (change > 10) trendDirection = 'increasing'
  else if (change < -10) trendDirection = 'decreasing'

  // Prepare chart data
  const labels = history.map(h => {
    const date = new Date(h.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const getDataset = () => {
    switch (selectedMetric) {
      case 'total':
        return {
          label: 'Total Risk Score',
          data: history.map(h => h.totalScore),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }
      case 'heat':
        return {
          label: 'Heat Stress',
          data: history.map(h => h.breakdown.heatStress),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
        }
      case 'water':
        return {
          label: 'Water Stress',
          data: history.map(h => h.breakdown.waterStress),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }
      case 'pest':
        return {
          label: 'Pest/Disease Risk',
          data: history.map(h => h.breakdown.pestRisk),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
        }
      case 'wind':
        return {
          label: 'Wind Damage Risk',
          data: history.map(h => h.breakdown.windRisk),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
        }
      default:
        return {
          label: 'Total Risk Score',
          data: history.map(h => h.totalScore),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        ...getDataset(),
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="glass-card">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Risk Trend Analysis
          </h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Score</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{latest}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average ({days}d)</p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{average}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trend</p>
            <div className="flex items-center gap-2">
              {trendDirection === 'increasing' && (
                <>
                  <TrendingUp className="w-6 h-6 text-red-600" />
                  <span className="text-2xl font-black text-red-600">+{change}</span>
                </>
              )}
              {trendDirection === 'decreasing' && (
                <>
                  <TrendingDown className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-black text-green-600">{change}</span>
                </>
              )}
              {trendDirection === 'stable' && (
                <>
                  <Minus className="w-6 h-6 text-gray-600" />
                  <span className="text-2xl font-black text-gray-600">0</span>
                </>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data Points</p>
            <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{history.length}</p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedMetric('total')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'total'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Total Score
          </button>
          <button
            onClick={() => setSelectedMetric('heat')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'heat'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Heat Stress
          </button>
          <button
            onClick={() => setSelectedMetric('water')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'water'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Water Stress
          </button>
          <button
            onClick={() => setSelectedMetric('pest')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'pest'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pest Risk
          </button>
          <button
            onClick={() => setSelectedMetric('wind')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'wind'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Wind Risk
          </button>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80"
        >
          <Line data={chartData} options={chartOptions} />
        </motion.div>
      </div>

      {/* Risk Distribution */}
      <div className="glass-card">
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Risk Category Distribution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Safe', 'Moderate Risk', 'High Risk'].map((cat, idx) => {
            const count = history.filter(h => h.category === cat).length
            const percentage = ((count / history.length) * 100).toFixed(0)
            const colors = ['green', 'yellow', 'red']
            const color = colors[idx]
            
            return (
              <div
                key={cat}
                className={`p-4 rounded-lg border-2 ${
                  color === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  color === 'yellow' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p className={`text-sm font-semibold mb-2 ${
                  color === 'green' ? 'text-green-700 dark:text-green-400' :
                  color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                  'text-red-700 dark:text-red-400'
                }`}>
                  {cat}
                </p>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-black ${
                    color === 'green' ? 'text-green-600 dark:text-green-400' :
                    color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {count}
                  </span>
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    days ({percentage}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RiskTrendChart

