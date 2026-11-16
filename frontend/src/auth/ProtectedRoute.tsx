import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../types'
import { homePath, useAuth } from './AuthContext'

export default function ProtectedRoute({ role }: { role?: Role }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={homePath(user.role)} replace />
  return <Outlet />
}