import { AuthSessionStorage } from '../../../../src/features/auth/domain/repositories/AuthSessionStorage';
import { createLogout } from '../../../../src/features/auth/domain/usecases/Logout';

describe('createLogout', () => {
  it('clears the persisted session', async () => {
    const sessionStorage: AuthSessionStorage = {
      save: jest.fn(),
      load: jest.fn(),
      clear: jest.fn(),
    };

    await createLogout(sessionStorage)();

    expect(sessionStorage.clear).toHaveBeenCalledTimes(1);
  });
});
