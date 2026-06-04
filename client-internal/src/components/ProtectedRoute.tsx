import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="empty">
        <span className="material-symbols-outlined">hourglass_empty</span>
        Loading...
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
