import { Link } from 'react-router-dom'
import { WifiOff, RefreshCw, Home, Cloud } from 'lucide-react'

const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="relative w-32 h-32 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-xl">
            <WifiOff className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            You're Offline
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            It looks like you've lost your internet connection. Don't worry, you can still access cached data.
          </p>
        </div>

        {/* Features Available Offline */}
        <div className="glass-card text-left">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Available Offline:
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cached weather data</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Farming insights from saved data</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Analytics dashboard (cached data)</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>AI Chat (requires internet)</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>New weather updates (requires internet)</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Cached Data Info */}
        <div className="glass-card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                Using Cached Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You're viewing data that was saved when you were online. 
                To get the latest updates, please check your internet connection and refresh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfflinePage

