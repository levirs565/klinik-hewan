import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ServiceRequestProvider } from './context/ServiceRequestContext'
import { AddStaffPage, DashboardPage, LoginPage, MedicalRecordPage, PetDetailPage, ServiceDetailPage, StaffDetailPage, StaffDirectoryPage } from './pages'

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
        path="/requests/:id/pet"
        element={
          <ProtectedRoute>
            <PetDetailPage />
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
      <Route
        path="/staff/new"
        element={
          <ProtectedRoute>
            <AddStaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:id"
        element={
          <ProtectedRoute>
            <StaffDetailPage />
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
