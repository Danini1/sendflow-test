export const ROUTES = {
  login: '/login',
  register: '/register',
  connections: '/connections',
  contacts: '/contacts',
  broadcasts: '/broadcasts',
} as const;

export const DEFAULT_PRIVATE_ROUTE = ROUTES.connections;
