import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ServiceRequestProvider } from './context/ServiceRequestContext'
import { DashboardPage, LoginPage, MedicalRecordPage, ServiceDetailPage, StaffDirectoryPage } from './pages'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute>
            <ServiceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id/medical-record"
        element={
          <ProtectedRoute>
            <MedicalRecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffDirectoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ServiceRequestProvider>
          <AppRoutes />
        </ServiceRequestProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
