import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert, Text } from 'react-native';
import { AuthProvider } from '../../../../src/features/auth/presentation/context/AuthContext';
import { AccountScreen } from '../../../../src/features/auth/presentation/screens/AccountScreen';
import { AuthSessionStorage } from '../../../../src/features/auth/domain/repositories/AuthSessionStorage';
import { AuthSession } from '../../../../src/features/auth/domain/models/AuthSession';
import { ToastProvider } from '../../../../src/core/ui/Toast';

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

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

async function renderAccountScreen(logout: jest.Mock) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ToastProvider>
        <AuthProvider
          login={jest.fn()}
          logout={logout}
          restoreSession={jest.fn().mockResolvedValue(sampleSession)}
          sessionStorage={fakeSessionStorage()}>
          <AccountScreen />
        </AuthProvider>
      </ToastProvider>,
    );
  });
  return renderer;
}

describe('AccountScreen', () => {
  it("shows the signed-in user's profile", async () => {
    const renderer = await renderAccountScreen(jest.fn());

    const texts = findAllText(renderer);
    expect(texts).toEqual(
      expect.arrayContaining(['Emily', 'Johnson', 'emily.johnson@x.dummyjson.com']),
    );
    expect(texts.join('')).toContain('@emilys');
  });

  it('asks for confirmation before logging out, then logs out and shows a toast', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find(button => button.text === 'Log Out')?.onPress?.();
    });
    const renderer = await renderAccountScreen(logout);

    await act(async () => {
      renderer.root.findByProps({ accessibilityLabel: 'Log out' }).props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Log Out',
      'Are you sure you want to log out?',
      expect.any(Array),
    );
    expect(logout).toHaveBeenCalledTimes(1);
    expect(findAllText(renderer)).toContain('Logged out successfully');

    // Unmount to clear the toast's pending auto-hide timer, rather than
    // leaving it to fire after the test has finished.
    act(() => {
      renderer.unmount();
    });
    alertSpy.mockRestore();
  });

  it('does not log out when the confirmation is cancelled', async () => {
    const logout = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find(button => button.text === 'Cancel')?.onPress?.();
    });
    const renderer = await renderAccountScreen(logout);

    await act(async () => {
      renderer.root.findByProps({ accessibilityLabel: 'Log out' }).props.onPress();
    });

    expect(logout).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
