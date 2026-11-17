import { Navigate, Route, Routes } from 'react-router-dom'
import { homePath, useAuth } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AttendanceHistoryPage from './pages/AttendanceHistoryPage'
import AttendanceMonitorPage from './pages/AttendanceMonitorPage'
import AttendancePage from './pages/AttendancePage'
import EmployeesPage from './pages/EmployeesPage'
import LoginPage from './pages/LoginPage'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? homePath(user.role) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute role="HRD" />}>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/monitoring" element={<AttendanceMonitorPage />} />
      </Route>
      <Route element={<ProtectedRoute role="EMPLOYEE" />}>
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/history" element={<AttendanceHistoryPage />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}