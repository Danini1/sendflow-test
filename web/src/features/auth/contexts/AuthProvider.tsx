import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';

import { auth } from '../../../lib/firebase/client';
import { AuthContext, type AuthUser } from './authContext';

type AuthProviderProps = {
  children: ReactNode;
};

function toAuthUser(user: User | null): AuthUser | null {
  return user
    ? { uid: user.uid, email: user.email, displayName: user.displayName }
    : null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onIdTokenChanged(auth, (currentUser) => {
      setUser(toAuthUser(currentUser));
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
