import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'

const FloatingAIChat = () => {
  return (
    <Link
      to="/ai-chat"
      className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-[60] group animate-float"
      aria-label="Open AI Assistant"
    >
      <div className="relative">
        {/* Pulse Animation Rings */}
        <div className="absolute inset-0 bg-blue-600/60 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 bg-blue-500/50 rounded-full animate-pulse"></div>
        
        {/* Main Button */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-blue-600/50 transition-all duration-300 hover:scale-110 group-hover:rotate-12 cursor-pointer border-2 border-white/30">
          <MessageSquare className="w-7 h-7 md:w-9 md:h-9 text-white relative z-10 drop-shadow-lg" />
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none border border-blue-700 dark:border-blue-600">
          <span>AI Assistant</span>
          <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-blue-600 dark:border-t-blue-500"></div>
        </div>
      </div>
    </Link>
  )
}

export default FloatingAIChat

