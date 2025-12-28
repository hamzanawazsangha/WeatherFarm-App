import { Calendar } from 'lucide-react'
import CropCalendar from '../components/CropCalendar'
import { useLocation } from '../context/LocationContext'

const CropCalendarPage = () => {
  const { location } = useLocation()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
          <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          Smart Crop Calendar
        </h1>
        {location && (
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Location: <span className="font-semibold">{location.displayName}</span>
            </p>
          </div>
        )}
      </div>

      <CropCalendar />
    </div>
  )
}

export default CropCalendarPage

