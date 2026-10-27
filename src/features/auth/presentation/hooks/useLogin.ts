import { useState } from 'react';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { useAuth } from '../context/AuthContext';

export type LoginFormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string };

/** Guards against duplicate submissions and surfaces a user-facing error message. */
export function useLogin() {
  const { login } = useAuth();
  const [state, setState] = useState<LoginFormState>({ status: 'idle' });

  async function submit(username: string, password: string) {
    if (state.status === 'loading') {
      return;
    }
    setState({ status: 'loading' });
    try {
      await login(username, password);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setState({ status: 'error', message });
    }
  }

  return { state, submit };
}
