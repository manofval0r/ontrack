import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/goal/:id" element={<GoalWorkspace />} />
            <Route path="/settings" element={<Settings />} />

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GoalProvider>
    </ThemeProvider>
  )
}

export default App
