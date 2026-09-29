import React from 'react'
import { BrowserRouter, Navigate, Routes, Route, useParams, useLocation } from 'react-router-dom'
import { GoalProvider } from './context/GoalContext'
import { ThemeProvider } from './context/ThemeContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ResetPassword } from './pages/ResetPassword'
import { Onboarding } from './pages/Onboarding'
import { Docs } from './pages/Docs'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'
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
import { BackendWakeupBanner } from './components/common/BackendWakeupBanner'
import { PanelErrorBoundary } from './components/common/PanelErrorBoundary'
import { captureAuthFromUrl } from './utils/auth'

// Capture any incoming OAuth callback tokens on load
captureAuthFromUrl()

/** Redirects unauthenticated visitors to /login preserving deep link.
 * Rejects mock/dev tokens so a stale mock token can never 401-loop
 * against the real backend — user is sent back to /login instead. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('ontrack_token')
  const location = useLocation()
  if (!token || token.startsWith('mock_')) {
    const redirectParam = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <GoalProvider>
        <BrowserRouter>
          {/* Render cold-start detection and keep-alive health pings */}
          <BackendWakeupBanner />

          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />

            {/* Core Authenticated App Flow */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardShell />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <PanelErrorBoundary panelName="Dashboard Overview">
                    <DashboardOverview />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="calendar"
                element={
                  <PanelErrorBoundary panelName="Calendar">
                    <CalendarPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="activity"
                element={
                  <PanelErrorBoundary panelName="Activity">
                    <ActivityPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="goals"
                element={
                  <PanelErrorBoundary panelName="Goal Management">
                    <ManagePanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="program"
                element={
                  <PanelErrorBoundary panelName="Program">
                    <ProgramPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="reports"
                element={
                  <PanelErrorBoundary panelName="Reports">
                    <ReportsPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="community"
                element={
                  <PanelErrorBoundary panelName="Community">
                    <CommunityPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="integrations"
                element={
                  <PanelErrorBoundary panelName="Integrations">
                    <IntegrationsPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="account"
                element={
                  <PanelErrorBoundary panelName="Account">
                    <AccountPanel />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="chat"
                element={
                  <PanelErrorBoundary panelName="Chat">
                    <Chat />
                  </PanelErrorBoundary>
                }
              />
              <Route
                path="goal/:id"
                element={
                  <PanelErrorBoundary panelName="Goal Workspace">
                    <GoalWorkspace />
                  </PanelErrorBoundary>
                }
              />
            </Route>

            {/* Shortcuts and deep links */}
            <Route path="/settings" element={<Navigate to="/dashboard/integrations" replace />} />
            <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
            <Route path="/goals" element={<Navigate to="/dashboard/goals" replace />} />
            <Route path="/goals/:id" element={<GoalIdRedirect />} />
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
