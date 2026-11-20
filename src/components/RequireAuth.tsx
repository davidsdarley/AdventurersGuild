// AI-assisted: see AI-ATTRIBUTION.md
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../data/auth'
import { decideProtectedRoute } from './authRedirect'
import { LoadingScreen } from './LoadingScreen'

export function RequireAuth() {
  const session = useSession()
  const location = useLocation()
  const decision = decideProtectedRoute(session, location)

  if (decision.kind === 'loading') return <LoadingScreen />
  if (decision.kind === 'redirect') {
    return <Navigate to={decision.to} state={decision.state} replace />
  }
  return <Outlet />
}
