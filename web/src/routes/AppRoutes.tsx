import { Navigate, Route, Routes } from 'react-router';

import { AppLayout } from '../components/layout/AppLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import BroadcastsPage from '../features/broadcasts/pages/BroadcastsPage';
import ConnectionsPage from '../features/connections/pages/ConnectionsPage';
import ContactsPage from '../features/contacts/pages/ContactsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { DEFAULT_PRIVATE_ROUTE, ROUTES } from './paths';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.connections} element={<ConnectionsPage />} />
          <Route path={ROUTES.contacts} element={<ContactsPage />} />
          <Route path={ROUTES.broadcasts} element={<BroadcastsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={DEFAULT_PRIVATE_ROUTE} replace />} />
    </Routes>
  );
}
