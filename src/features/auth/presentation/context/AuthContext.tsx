import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { AuthUser } from '../../domain/models/AuthUser';
import { Login } from '../../domain/usecases/Login';
import { Logout } from '../../domain/usecases/Logout';
import { RestoreSession } from '../../domain/usecases/RestoreSession';
import { AuthSessionStorage } from '../../domain/repositories/AuthSessionStorage';

export type AuthState =
  | { status: 'checking' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: AuthUser };

interface AuthContextValue {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Single source of truth for auth state, shared by the login screen and the
 * root navigator. Starts in `checking` while it validates/refreshes any
 * persisted session, then settles into `signedOut` or `signedIn`. Owns
 * persisting the session on login and clearing it on logout so no other
 * call site has to remember to.
 */
export function AuthProvider({
  login: loginUseCase,
  logout: logoutUseCase,
  restoreSession,
  sessionStorage,
  children,
}: {
  login: Login;
  logout: Logout;
  restoreSession: RestoreSession;
  sessionStorage: AuthSessionStorage;
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthState>({ status: 'checking' });

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    restoreSession(controller.signal)
      .then(session => {
        if (!isActive) {
          return;
        }
        // Only settle a still-pending check — a login that already
        // completed while this was in flight must not be clobbered.
        setState(current =>
          current.status === 'checking'
            ? session
              ? { status: 'signedIn', user: session.user }
              : { status: 'signedOut' }
            : current,
        );
      })
      .catch(error => {
        if (!isActive || isAbortError(error)) {
          return;
        }
        setState(current => (current.status === 'checking' ? { status: 'signedOut' } : current));
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [restoreSession]);

  async function login(username: string, password: string) {
    const session = await loginUseCase(username, password);
    await sessionStorage.save(session);
    setState({ status: 'signedIn', user: session.user });
  }

  async function logout() {
    await logoutUseCase();
    setState({ status: 'signedOut' });
  }

  return <AuthContext.Provider value={{ state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
