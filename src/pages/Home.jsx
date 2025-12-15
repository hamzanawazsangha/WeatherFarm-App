import { Link } from 'react-router-dom'
import { Cloud, Sprout, BarChart3, Bell, MessageSquare, ArrowRight, Wifi, Smartphone } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Cloud,
      title: 'Weather Forecast',
      description: 'Real-time weather data with detailed forecasts',
      link: '/weather',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sprout,
      title: 'Farming Assistant',
      description: 'Smart farming recommendations based on weather',
      link: '/farming',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize weather and farming data trends',
      link: '/analytics',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified about important weather events',
      link: '/alerts',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Chat with AI for farming and weather advice',
      link: '/ai-chat',
      color: 'from-indigo-500 to-purple-500',
    },
  ]

  return (
    <div className="space-y-16 animate-fade-in relative z-10">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16 md:py-24">
        <div className="relative inline-block mb-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold gradient-text relative z-10">
            Weather & Farming Assistant
          </h1>
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-500/20 to-pink-600/20 blur-3xl -z-10"></div>
        </div>
        <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
          Your all-in-one solution for weather monitoring and smart farming decisions.
          <span className="block mt-2 text-lg text-gray-700 dark:text-gray-300">
            Powered by AI and real-time data analytics.
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Link to="/weather" className="btn-primary group">
            <span className="flex items-center">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
          <Link to="/ai-chat" className="btn-secondary group">
            <span className="flex items-center">
              Try AI Assistant
              <MessageSquare className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Features</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Discover powerful tools designed to enhance your farming experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link
                key={index}
                to={feature.link}
                className="feature-card glass-card group relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative z-10">
                  <div className="relative w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white relative z-10" />
                  </div>
                   <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                   <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all duration-300">
                     <span>Learn more</span>
                     <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="glass-card text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Why Choose WeatherFarm?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Experience the future of smart farming with cutting-edge technology
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="group">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-100">Real-time Data</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Get up-to-date weather information from reliable sources with instant updates
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-100">AI-Powered</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Smart recommendations using advanced AI technology for optimal farming decisions
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-100">PWA Ready</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Works offline and installable on any device for seamless access anywhere
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

