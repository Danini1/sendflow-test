import { createContext } from 'react';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export type AuthContextValue = {
  user: AuthUser | null;
  /** true até o Firebase informar o estado inicial de autenticação. */
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
