import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import { AuthProvider, useAuth } from '../../../../src/features/auth/presentation/context/AuthContext';
import { LoginScreen } from '../../../../src/features/auth/presentation/screens/LoginScreen';
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

function fakeSessionStorage(): AuthSessionStorage {
  return { save: jest.fn(), load: jest.fn(), clear: jest.fn() };
}

/** Surfaces the shared `AuthState` as text so a test can assert on it. */
function AuthStateProbe() {
  const { state } = useAuth();
  return <Text testID="auth-state">{state.status}</Text>;
}

async function renderLoginScreen(login: jest.Mock, sessionStorage: AuthSessionStorage) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  // `KeyboardAvoidingView` sets state from `componentDidMount`, and
  // `AuthProvider` kicks off an async session-restore check on mount —
  // flushing both inside `act` here keeps every test starting from a
  // settled (`signedOut`) state instead of a dangling `checking` one.
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider
        login={login}
        logout={jest.fn()}
        restoreSession={jest.fn().mockResolvedValue(null)}
        sessionStorage={sessionStorage}>
        <LoginScreen />
        <AuthStateProbe />
      </AuthProvider>,
    );
  });
  return renderer;
}

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

function typeInto(input: ReactTestRenderer.ReactTestInstance, text: string) {
  act(() => {
    (input.props as { onChangeText: (value: string) => void }).onChangeText(text);
  });
}

describe('LoginScreen', () => {
  it('disables the login button until both fields are filled', async () => {
    const renderer = await renderLoginScreen(jest.fn(), fakeSessionStorage());

    const loginButton = renderer.root.findByProps({ accessibilityLabel: 'Login' });
    expect(loginButton.props.disabled).toBe(true);

    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Username' }), 'emilys');
    expect(renderer.root.findByProps({ accessibilityLabel: 'Login' }).props.disabled).toBe(true);

    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Password' }), 'emilyspass');
    expect(renderer.root.findByProps({ accessibilityLabel: 'Login' }).props.disabled).toBe(false);
  });

  it('toggles password visibility', async () => {
    const renderer = await renderLoginScreen(jest.fn(), fakeSessionStorage());

    expect(renderer.root.findByProps({ accessibilityLabel: 'Password' }).props.secureTextEntry).toBe(
      true,
    );

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: 'Show password' }).props.onPress();
    });

    expect(renderer.root.findByProps({ accessibilityLabel: 'Password' }).props.secureTextEntry).toBe(
      false,
    );
  });

  it('logs in, persists the session, and updates the shared auth state on success', async () => {
    const login = jest.fn().mockResolvedValue(sampleSession);
    const sessionStorage = fakeSessionStorage();
    const renderer = await renderLoginScreen(login, sessionStorage);

    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Username' }), 'emilys');
    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Password' }), 'emilyspass');

    await act(async () => {
      renderer.root.findByProps({ accessibilityLabel: 'Login' }).props.onPress();
    });
    await act(async () => {});

    expect(login).toHaveBeenCalledWith('emilys', 'emilyspass');
    expect(sessionStorage.save).toHaveBeenCalledWith(sampleSession);
    expect(renderer.root.findByProps({ testID: 'auth-state' }).props.children).toBe('signedIn');
  });

  it('shows a loading indicator while the request is in flight and blocks repeated submissions', async () => {
    let resolveLogin!: (session: AuthSession) => void;
    const login = jest.fn().mockReturnValue(
      new Promise<AuthSession>(resolve => {
        resolveLogin = resolve;
      }),
    );
    const renderer = await renderLoginScreen(login, fakeSessionStorage());

    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Username' }), 'emilys');
    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Password' }), 'emilyspass');

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: 'Login' }).props.onPress();
    });
    act(() => {
      renderer.root.findByProps({ accessibilityLabel: 'Login' }).props.onPress();
    });

    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(login).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLogin(sampleSession);
    });
  });

  it('shows an error message on invalid credentials without changing the auth state', async () => {
    const login = jest.fn().mockRejectedValue(new Error('Invalid username or password.'));
    const renderer = await renderLoginScreen(login, fakeSessionStorage());

    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Username' }), 'emilys');
    typeInto(renderer.root.findByProps({ accessibilityLabel: 'Password' }), 'wrong');

    await act(async () => {
      renderer.root.findByProps({ accessibilityLabel: 'Login' }).props.onPress();
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Invalid username or password.');
    expect(renderer.root.findByProps({ testID: 'auth-state' }).props.children).toBe('signedOut');
  });
});
