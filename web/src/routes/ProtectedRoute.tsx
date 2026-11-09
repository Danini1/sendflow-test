import { Navigate, Outlet, useLocation } from 'react-router';

import { FullPageLoader } from '../components/common/FullPageLoader';
import { useAuth } from '../features/auth/hooks/useAuth';

/** Só renderiza as rotas filhas para usuários autenticados. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
