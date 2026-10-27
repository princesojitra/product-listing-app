import { AuthRepository } from '../../../../src/features/auth/domain/repositories/AuthRepository';
import { AuthSessionStorage } from '../../../../src/features/auth/domain/repositories/AuthSessionStorage';
import { AuthSession } from '../../../../src/features/auth/domain/models/AuthSession';
import { createRestoreSession } from '../../../../src/features/auth/domain/usecases/RestoreSession';

const storedSession: AuthSession = {
  accessToken: 'stale-access',
  refreshToken: 'stored-refresh',
  user: {
    id: '1',
    username: 'emilys',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@x.dummyjson.com',
    imageUrl: 'https://dummyjson.com/icon/emilys/128',
  },
};

function fakeRepository(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    refresh: jest.fn(),
    ...overrides,
  };
}

function fakeStorage(overrides: Partial<AuthSessionStorage> = {}): AuthSessionStorage {
  return {
    save: jest.fn(),
    load: jest.fn(),
    clear: jest.fn(),
    ...overrides,
  };
}

describe('createRestoreSession', () => {
  it('returns null without calling the API when nothing is stored', async () => {
    const repository = fakeRepository();
    const storage = fakeStorage({ load: jest.fn().mockResolvedValue(null) });
    const restoreSession = createRestoreSession(repository, storage, jest.fn());

    await expect(restoreSession()).resolves.toBeNull();
    expect(repository.getCurrentUser).not.toHaveBeenCalled();
  });

  it('returns the session with a freshly fetched user when the access token is still valid', async () => {
    const freshUser = { ...storedSession.user, firstName: 'Updated' };
    const repository = fakeRepository({
      getCurrentUser: jest.fn().mockResolvedValue(freshUser),
    });
    const storage = fakeStorage({ load: jest.fn().mockResolvedValue(storedSession) });
    const refreshSession = jest.fn();
    const restoreSession = createRestoreSession(repository, storage, refreshSession);

    const result = await restoreSession();

    expect(repository.getCurrentUser).toHaveBeenCalledWith(storedSession.accessToken, undefined);
    expect(refreshSession).not.toHaveBeenCalled();
    expect(result).toEqual({ ...storedSession, user: freshUser });
  });

  it('refreshes once and retries when the access token has expired', async () => {
    const repository = fakeRepository({
      getCurrentUser: jest
        .fn()
        .mockRejectedValueOnce(new Error('Request failed with status 401.'))
        .mockResolvedValueOnce(storedSession.user),
    });
    const storage = fakeStorage({ load: jest.fn().mockResolvedValue(storedSession) });
    const refreshSession = jest
      .fn()
      .mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    const restoreSession = createRestoreSession(repository, storage, refreshSession);

    const result = await restoreSession();

    expect(refreshSession).toHaveBeenCalledWith(storedSession.refreshToken, undefined);
    expect(repository.getCurrentUser).toHaveBeenLastCalledWith('new-access', undefined);
    expect(storage.save).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: storedSession.user,
    });
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: storedSession.user,
    });
  });

  it('clears the stored session and returns null when both validation and refresh fail', async () => {
    const repository = fakeRepository({
      getCurrentUser: jest.fn().mockRejectedValue(new Error('Request failed with status 401.')),
    });
    const storage = fakeStorage({ load: jest.fn().mockResolvedValue(storedSession) });
    const refreshSession = jest.fn().mockRejectedValue(new Error('Invalid refresh token'));
    const restoreSession = createRestoreSession(repository, storage, refreshSession);

    const result = await restoreSession();

    expect(storage.clear).toHaveBeenCalled();
    expect(storage.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('propagates cancellation instead of treating it as a failed restore', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const repository = fakeRepository({
      getCurrentUser: jest.fn().mockRejectedValue(abortError),
    });
    const storage = fakeStorage({ load: jest.fn().mockResolvedValue(storedSession) });
    const restoreSession = createRestoreSession(repository, storage, jest.fn());

    await expect(restoreSession()).rejects.toBe(abortError);
    expect(storage.clear).not.toHaveBeenCalled();
  });
});
