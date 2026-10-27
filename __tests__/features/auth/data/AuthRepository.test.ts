import { HttpClient } from '../../../../src/core/network/HttpClient';
import { createAuthRemoteDataSource } from '../../../../src/features/auth/data/datasources/AuthRemoteDataSource';
import { createAuthRepository } from '../../../../src/features/auth/data/repositories/AuthRepositoryImpl';

function mockHttpClient(
  response: Partial<Response> & { json?: () => Promise<unknown> },
): HttpClient {
  return { fetch: jest.fn().mockResolvedValue(response as Response) };
}

function repositoryFor(httpClient: HttpClient) {
  return createAuthRepository(createAuthRemoteDataSource(httpClient));
}

const sampleLoginResponseDto = {
  id: 1,
  username: 'emilys',
  email: 'emily.johnson@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://dummyjson.com/icon/emilys/128',
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
};

describe('AuthRepository.login (data source + mapper)', () => {
  it('sends credentials and maps a successful response into an AuthSession', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => sampleLoginResponseDto,
    });

    const session = await repositoryFor(httpClient).login('emilys', 'emilyspass');

    expect(httpClient.fetch).toHaveBeenCalledWith(
      'https://dummyjson.com/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          username: 'emilys',
          password: 'emilyspass',
          expiresInMins: 30,
        }),
      }),
    );
    expect(session).toEqual({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      user: {
        id: '1',
        username: 'emilys',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@x.dummyjson.com',
        imageUrl: 'https://dummyjson.com/icon/emilys/128',
      },
    });
  });

  it('throws a user-facing message on invalid credentials (401)', async () => {
    const httpClient = mockHttpClient({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    await expect(repositoryFor(httpClient).login('emilys', 'wrong')).rejects.toThrow(
      /invalid username or password/i,
    );
  });

  it('throws on other HTTP errors', async () => {
    const httpClient = mockHttpClient({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(repositoryFor(httpClient).login('emilys', 'emilyspass')).rejects.toThrow(/500/);
  });

  it('throws on a malformed response body', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'only-this' }),
    });

    await expect(repositoryFor(httpClient).login('emilys', 'emilyspass')).rejects.toThrow(
      /unexpected response format/i,
    );
  });

  it('wraps a network failure in a user-facing error', async () => {
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    };

    await expect(repositoryFor(httpClient).login('emilys', 'emilyspass')).rejects.toThrow(
      /could not reach the server/i,
    );
  });

  it('preserves cancellation errors instead of wrapping them', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(abortError),
    };

    await expect(repositoryFor(httpClient).login('emilys', 'emilyspass')).rejects.toBe(
      abortError,
    );
  });
});
