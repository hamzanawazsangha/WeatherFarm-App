import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Check } from 'lucide-react'

const CROPS = [
  { id: 'wheat', name: 'Wheat', emoji: '🌾', category: 'Grains' },
  { id: 'rice', name: 'Rice', emoji: '🌾', category: 'Grains' },
  { id: 'corn', name: 'Corn', emoji: '🌽', category: 'Grains' },
  { id: 'barley', name: 'Barley', emoji: '🌾', category: 'Grains' },
  { id: 'oats', name: 'Oats', emoji: '🌾', category: 'Grains' },
  { id: 'cotton', name: 'Cotton', emoji: '🌿', category: 'Fibers' },
  { id: 'soybean', name: 'Soybean', emoji: '🌱', category: 'Legumes' },
  { id: 'peanut', name: 'Peanut', emoji: '🥜', category: 'Legumes' },
  { id: 'chickpea', name: 'Chickpea', emoji: '🌱', category: 'Legumes' },
  { id: 'lentil', name: 'Lentil', emoji: '🌱', category: 'Legumes' },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', category: 'Oilseeds' },
  { id: 'canola', name: 'Canola', emoji: '🌼', category: 'Oilseeds' },
  { id: 'potato', name: 'Potato', emoji: '🥔', category: 'Vegetables' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Vegetables' },
  { id: 'onion', name: 'Onion', emoji: '🧅', category: 'Vegetables' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'Vegetables' },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: 'Vegetables' },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', category: 'Vegetables' },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋', category: 'Cash Crops' },
  { id: 'tobacco', name: 'Tobacco', emoji: '🌿', category: 'Cash Crops' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'Beverages' },
  { id: 'tea', name: 'Tea', emoji: '🍵', category: 'Beverages' },
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'Fruits' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'Fruits' },
  { id: 'mango', name: 'Mango', emoji: '🥭', category: 'Fruits' },
  { id: 'orange', name: 'Orange', emoji: '🍊', category: 'Fruits' },
  { id: 'grape', name: 'Grape', emoji: '🍇', category: 'Fruits' }
]

const CropSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Filter crops based on search query
  const filteredCrops = CROPS.filter(crop =>
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group crops by category
  const groupedCrops = filteredCrops.reduce((acc, crop) => {
    if (!acc[crop.category]) {
      acc[crop.category] = []
    }
    acc[crop.category].push(crop)
    return acc
  }, {})

  const selectedCrop = CROPS.find(c => c.id === value) || CROPS[0]

  const handleSelect = (cropId) => {
    onChange(cropId)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Crop Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedCrop.emoji}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span>{selectedCrop.name}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedCrop.category}</span>
            </div>
            <p className="text-xs text-white/80 font-normal">Click to change crop type</p>
          </div>
        </div>
        <ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crops..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Crops List */}
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(groupedCrops).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No crops found matching "{searchQuery}"
                </div>
              ) : (
                Object.entries(groupedCrops).map(([category, crops]) => (
                  <div key={category}>
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {category}
                      </h3>
                    </div>
                    {crops.map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => handleSelect(crop.id)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          crop.id === value ? 'bg-green-50 dark:bg-green-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{crop.emoji}</span>
                          <span className={`font-semibold ${
                            crop.id === value 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {crop.name}
                          </span>
                        </div>
                        {crop.id === value && (
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer Info */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} available • Select one for personalized insights
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CropSelector

