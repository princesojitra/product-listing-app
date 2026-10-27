import React, { createContext, ReactNode, useContext, useState } from 'react';
import { AuthUser } from '../../domain/models/AuthUser';
import { Login } from '../../domain/usecases/Login';
import { AuthSessionStorage } from '../../data/storage/SecureSessionStorage';

export type AuthState = { status: 'signedOut' } | { status: 'signedIn'; user: AuthUser };

interface AuthContextValue {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Single source of truth for auth state, shared by the login screen and the
 * root navigator. Owns persisting the session on a successful login so no
 * other call site has to remember to.
 */
export function AuthProvider({
  login: loginUseCase,
  sessionStorage,
  children,
}: {
  login: Login;
  sessionStorage: AuthSessionStorage;
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthState>({ status: 'signedOut' });

  async function login(username: string, password: string) {
    const session = await loginUseCase(username, password);
    await sessionStorage.save(session);
    setState({ status: 'signedIn', user: session.user });
  }

  return <AuthContext.Provider value={{ state, login }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
