import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import LoadingSkeleton from './components/LoadingSkeleton'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Weather = lazy(() => import('./pages/Weather'))
const Farming = lazy(() => import('./pages/Farming'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Alerts = lazy(() => import('./pages/Alerts'))
const AIChat = lazy(() => import('./pages/AIChat'))
const OfflinePage = lazy(() => import('./pages/OfflinePage'))

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div className="space-y-6 p-4 md:p-10">
      <LoadingSkeleton type="card" count={2} />
    </div>
  }>
    {children}
  </Suspense>
)

function App() {
  try {
    return (
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<SuspenseWrapper><Home /></SuspenseWrapper>} />
            <Route path="/weather" element={<SuspenseWrapper><Weather /></SuspenseWrapper>} />
            <Route path="/farming" element={<SuspenseWrapper><Farming /></SuspenseWrapper>} />
            <Route path="/analytics" element={<SuspenseWrapper><Analytics /></SuspenseWrapper>} />
            <Route path="/alerts" element={<SuspenseWrapper><Alerts /></SuspenseWrapper>} />
            <Route path="/ai-chat" element={<SuspenseWrapper><AIChat /></SuspenseWrapper>} />
            <Route path="/offline" element={<SuspenseWrapper><OfflinePage /></SuspenseWrapper>} />
          </Routes>
        </Layout>
      </ThemeProvider>
    )
  } catch (error) {
    console.error('App Error:', error)
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error Loading App</h1>
        <p>{error.message}</p>
      </div>
    )
  }
}

export default App

