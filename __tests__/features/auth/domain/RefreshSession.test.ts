import { AuthRepository } from '../../../../src/features/auth/domain/repositories/AuthRepository';
import { createRefreshSession } from '../../../../src/features/auth/domain/usecases/RefreshSession';

function fakeRepository(refresh: jest.Mock): AuthRepository {
  return {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    refresh,
  };
}

describe('createRefreshSession (single-flight)', () => {
  it('shares one in-flight repository call across concurrent callers', async () => {
    let resolveRefresh!: (tokens: { accessToken: string; refreshToken: string }) => void;
    const refresh = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolveRefresh = resolve;
      }),
    );
    const refreshSession = createRefreshSession(fakeRepository(refresh));

    const first = refreshSession('refresh-token');
    const second = refreshSession('refresh-token');

    expect(refresh).toHaveBeenCalledTimes(1);

    resolveRefresh({ accessToken: 'new-access', refreshToken: 'new-refresh' });

    await expect(first).resolves.toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    await expect(second).resolves.toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
  });

  it('issues a fresh request once the previous one has settled', async () => {
    const refresh = jest
      .fn()
      .mockResolvedValueOnce({ accessToken: 'first-access', refreshToken: 'first-refresh' })
      .mockResolvedValueOnce({ accessToken: 'second-access', refreshToken: 'second-refresh' });
    const refreshSession = createRefreshSession(fakeRepository(refresh));

    await refreshSession('refresh-token');
    await refreshSession('refresh-token');

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('lets a later call retry after a failed refresh', async () => {
    const refresh = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    const refreshSession = createRefreshSession(fakeRepository(refresh));

    await expect(refreshSession('refresh-token')).rejects.toThrow('boom');
    await expect(refreshSession('refresh-token')).resolves.toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
