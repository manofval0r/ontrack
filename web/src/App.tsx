import React from 'react'
import { BrowserRouter, Navigate, Routes, Route, useParams } from 'react-router-dom'
import { GoalProvider } from './context/GoalContext'
import { ThemeProvider } from './context/ThemeContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ResetPassword } from './pages/ResetPassword'
import { Onboarding } from './pages/Onboarding'
import { DashboardOverview } from './pages/DashboardOverview'
import { Chat } from './pages/Chat'
import { GoalWorkspace } from './pages/GoalWorkspace'
import { NotFound } from './pages/NotFound'
import { DashboardShell } from './components/dashboard/DashboardShell'
import { ActivityPanel } from './components/dashboard/panels/ActivityPanel'
import { ManagePanel } from './components/dashboard/panels/ManagePanel'
import { ProgramPanel } from './components/dashboard/panels/ProgramPanel'
import { ReportsPanel } from './components/dashboard/panels/ReportsPanel'
import { CommunityPanel } from './components/dashboard/panels/CommunityPanel'
import { IntegrationsPanel } from './components/dashboard/panels/IntegrationsPanel'
import { CalendarPanel } from './components/dashboard/panels/CalendarPanel'
import { AccountPanel } from './components/dashboard/panels/AccountPanel'
import { captureAuthFromUrl } from './utils/auth'

// Capture any incoming OAuth callback tokens on load
captureAuthFromUrl()

/** Redirects unauthenticated visitors to /login.
 * Rejects mock/dev tokens so a stale mock token can never 401-loop
 * against the real backend — user is sent back to /login instead. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('ontrack_token')
  if (!token || token.startsWith('mock_')) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <GoalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Core Authenticated App Flow */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="calendar" element={<CalendarPanel />} />
              <Route path="activity" element={<ActivityPanel />} />
              <Route path="goals" element={<ManagePanel />} />
              <Route path="program" element={<ProgramPanel />} />
              <Route path="reports" element={<ReportsPanel />} />
              <Route path="community" element={<CommunityPanel />} />
              <Route path="integrations" element={<IntegrationsPanel />} />
              <Route path="account" element={<AccountPanel />} />
              <Route path="chat" element={<Chat />} />
              <Route path="goal/:id" element={<GoalWorkspace />} />
            </Route>

            <Route path="/settings" element={<Navigate to="/dashboard/integrations" replace />} />
            <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
            <Route path="/goal/:id" element={<GoalIdRedirect />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GoalProvider>
    </ThemeProvider>
  )
}

function GoalIdRedirect() {
  const { id } = useParams()
  return <Navigate to={`/dashboard/goal/${id}`} replace />
}

export default App
