import { Navigate, Outlet } from 'react-router';

import { FullPageLoader } from '../components/common/FullPageLoader';
import { useAuth } from '../features/auth/hooks/useAuth';
import { DEFAULT_PRIVATE_ROUTE } from './paths';

/** Telas de login/cadastro: usuários já autenticados são redirecionados. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to={DEFAULT_PRIVATE_ROUTE} replace />;
  }

  return <Outlet />;
}
