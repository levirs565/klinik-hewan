import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddPetPage } from './pages/AddPetPage';
import { PetsPage } from './pages/PetsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { RemindersPage } from './pages/RemindersPage';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">
              hourglass_empty
            </span>
          </div>
          <p className="text-body-md text-on-surface">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-pet"
        element={
          <ProtectedRoute>
            <AddPetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pets"
        element={
          <ProtectedRoute>
            <PetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pets/:id"
        element={
          <ProtectedRoute>
            <PetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/new"
        element={
          <ProtectedRoute>
            <BookingFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <RemindersPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
