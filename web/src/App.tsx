import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Catch-all: redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
