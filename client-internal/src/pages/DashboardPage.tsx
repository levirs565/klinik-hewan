import { useAuth } from '../context/AuthContext'
import { DoctorDashboardPage } from './DoctorDashboardPage'
import { ManagerDashboardPage } from './ManagerDashboardPage'
import { ReceptionistDashboardPage } from './ReceptionistDashboardPage'

export function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'doctor') {
    return <DoctorDashboardPage />
  }

  if (user?.role === 'manager') {
    return <ManagerDashboardPage />
  }

  return <ReceptionistDashboardPage />
}
