import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoalProvider } from './context/GoalContext'
import { ThemeProvider } from './context/ThemeContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { Chat } from './pages/Chat'
import { GoalWorkspace } from './pages/GoalWorkspace'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'

/** Redirects unauthenticated visitors to /login.
 * Rejects mock/dev tokens so a stale `mock_google_oauth_token` can never 401-loop
 * against the real backend — user is sent back to /login instead. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('ontrack_token')
  if (!token || token === 'mock_google_oauth_token') return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <GoalProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Marketing */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Onboarding Flow */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Core Authenticated App Flow */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/goal/:id" element={<ProtectedRoute><GoalWorkspace /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GoalProvider>
    </ThemeProvider>
  )
}

export default App
