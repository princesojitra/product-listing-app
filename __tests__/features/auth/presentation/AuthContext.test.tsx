import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import {
  AuthProvider,
  useAuth,
} from '../../../../src/features/auth/presentation/context/AuthContext';
import { AuthSessionStorage } from '../../../../src/features/auth/domain/repositories/AuthSessionStorage';
import { AuthSession } from '../../../../src/features/auth/domain/models/AuthSession';

const sampleSession: AuthSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: '1',
    username: 'emilys',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@x.dummyjson.com',
    imageUrl: 'https://dummyjson.com/icon/emilys/128',
  },
};

function fakeSessionStorage(overrides: Partial<AuthSessionStorage> = {}): AuthSessionStorage {
  return { save: jest.fn(), load: jest.fn(), clear: jest.fn(), ...overrides };
}

function Probe() {
  const { state, logout } = useAuth();
  return (
    <>
      <Text testID="status">{state.status}</Text>
      <Text testID="logout" onPress={logout}>
        Log out
      </Text>
    </>
  );
}

async function renderAuthProvider({
  restoreSession,
  sessionStorage = fakeSessionStorage(),
}: {
  restoreSession: jest.Mock;
  sessionStorage?: AuthSessionStorage;
}) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider
        login={jest.fn()}
        logout={jest.fn()}
        restoreSession={restoreSession}
        sessionStorage={sessionStorage}>
        <Probe />
      </AuthProvider>,
    );
  });
  return renderer;
}

function status(renderer: ReactTestRenderer.ReactTestRenderer): string {
  return renderer.root.findByProps({ testID: 'status' }).props.children;
}

describe('AuthProvider session restoration', () => {
  it('starts in "checking" before settling', async () => {
    let resolveRestore!: (session: AuthSession | null) => void;
    const restoreSession = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolveRestore = resolve;
      }),
    );

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <AuthProvider
          login={jest.fn()}
          logout={jest.fn()}
          restoreSession={restoreSession}
          sessionStorage={fakeSessionStorage()}>
          <Probe />
        </AuthProvider>,
      );
    });

    expect(status(renderer)).toBe('checking');

    await act(async () => {
      resolveRestore(null);
    });
  });

  it('becomes "signedIn" when a session is restored', async () => {
    const restoreSession = jest.fn().mockResolvedValue(sampleSession);
    const renderer = await renderAuthProvider({ restoreSession });

    expect(status(renderer)).toBe('signedIn');
  });

  it('becomes "signedOut" when nothing can be restored', async () => {
    const restoreSession = jest.fn().mockResolvedValue(null);
    const renderer = await renderAuthProvider({ restoreSession });

    expect(status(renderer)).toBe('signedOut');
  });

  it('becomes "signedOut" instead of crashing if restoration rejects', async () => {
    const restoreSession = jest.fn().mockRejectedValue(new Error('boom'));
    const renderer = await renderAuthProvider({ restoreSession });

    expect(status(renderer)).toBe('signedOut');
  });

  it('logout clears the stored session and returns to "signedOut"', async () => {
    const restoreSession = jest.fn().mockResolvedValue(sampleSession);
    const sessionStorage = fakeSessionStorage();
    const renderer = await renderAuthProvider({ restoreSession, sessionStorage });

    expect(status(renderer)).toBe('signedIn');

    await act(async () => {
      renderer.root.findByProps({ testID: 'logout' }).props.onPress();
    });

    expect(status(renderer)).toBe('signedOut');
  });
});
