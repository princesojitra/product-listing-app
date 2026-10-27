import * as Keychain from 'react-native-keychain';
import { createSecureSessionStorage } from '../../../../src/features/auth/data/storage/SecureSessionStorage';
import { AuthSession } from '../../../../src/features/auth/domain/models/AuthSession';

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

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

describe('SecureSessionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves the session to the Keychain as JSON, never in plain AsyncStorage', async () => {
    const storage = createSecureSessionStorage();

    await storage.save(sampleSession);

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'emilys',
      JSON.stringify(sampleSession),
      expect.objectContaining({ service: expect.any(String) }),
    );
  });

  it('loads a previously saved session', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'emilys',
      password: JSON.stringify(sampleSession),
    });

    const storage = createSecureSessionStorage();

    await expect(storage.load()).resolves.toEqual(sampleSession);
  });

  it('returns null when nothing is stored', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

    const storage = createSecureSessionStorage();

    await expect(storage.load()).resolves.toBeNull();
  });

  it('returns null instead of throwing on corrupted stored data', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'emilys',
      password: 'not valid json{{',
    });

    const storage = createSecureSessionStorage();

    await expect(storage.load()).resolves.toBeNull();
  });

  it('clears the stored session', async () => {
    const storage = createSecureSessionStorage();

    await storage.clear();

    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
  });
});
