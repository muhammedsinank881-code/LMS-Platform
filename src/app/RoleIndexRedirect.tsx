import { Navigate } from 'react-router-dom'
import { getDefaultPathForRole } from '@/lib/redirect'
import { useAuthStore } from '@/store/auth-store'

export function RoleIndexRedirect() {
  const userRole = useAuthStore((state) => state.user?.role)
  const targetPath = getDefaultPathForRole(userRole)
  return <Navigate to={targetPath} replace />
}
