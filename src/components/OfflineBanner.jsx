import { useState, useEffect } from 'react'
import { WifiOff, X, Wifi } from 'lucide-react'

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setShowBanner(true)
      // Hide banner after 3 seconds when coming back online
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowBanner(true)
    }

    // Check initial state
    setIsOffline(!navigator.onLine)
    setShowBanner(!navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 shadow-lg ${
          isOffline
            ? 'bg-orange-500 text-white'
            : 'bg-green-500 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="w-5 h-5 animate-pulse" />
          ) : (
            <Wifi className="w-5 h-5" />
          )}
          <span className="font-semibold text-sm md:text-base">
            {isOffline
              ? 'You are offline. Some features may be limited.'
              : 'You are back online!'}
          </span>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default OfflineBanner

