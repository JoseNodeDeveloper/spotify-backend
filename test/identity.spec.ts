import { AuthenticateUserCommand, AuthenticateUserHandler } from '../src/modules/identity/application/authenticate-user.command';
import { RegisterUserCommand, RegisterUserHandler } from '../src/modules/identity/application/register-user.command';
import { EmailAlreadyInUseError, InvalidCredentialsError, WeakPasswordError } from '../src/modules/identity/domain/errors';
import { FakePasswordHasher, FakeTokenIssuer, FixedClock, InMemoryUserRepository } from './fakes';

describe('Identity', () => {
  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let register: RegisterUserHandler;
  let authenticate: AuthenticateUserHandler;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    register = new RegisterUserHandler(users, hasher, new FixedClock());
    authenticate = new AuthenticateUserHandler(users, hasher, new FakeTokenIssuer());
  });

  describe('registration', () => {
    it('saves the user with a normalized email and a hashed password', async () => {
      const { userId } = await register.execute(new RegisterUserCommand('jose', '  Jose@Example.com ', 'secure-pass-1'));

      const saved = users.users.get(userId);
      expect(saved?.email.value).toBe('jose@example.com');
      expect(saved?.passwordHash).not.toBe('secure-pass-1');
    });

    it('rejects an already registered email', async () => {
      await register.execute(new RegisterUserCommand('jose', 'jose@example.com', 'secure-pass-1'));

      await expect(
        register.execute(new RegisterUserCommand('other', 'JOSE@example.com', 'secure-pass-2')),
      ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
    });

    it('rejects weak passwords', async () => {
      await expect(register.execute(new RegisterUserCommand('jose', 'jose@example.com', '123456'))).rejects.toBeInstanceOf(
        WeakPasswordError,
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await register.execute(new RegisterUserCommand('jose', 'jose@example.com', 'secure-pass-1'));
    });

    it('issues a token for valid credentials', async () => {
      const token = await authenticate.execute(new AuthenticateUserCommand('jose@example.com', 'secure-pass-1'));
      expect(token.tokenType).toBe('Bearer');
    });

    it('responds the same whether the password is wrong or the email does not exist', async () => {
      await expect(
        authenticate.execute(new AuthenticateUserCommand('jose@example.com', 'wrong-pass-1')),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
      await expect(
        authenticate.execute(new AuthenticateUserCommand('nobody@example.com', 'wrong-pass-1')),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('still compares the password when the email does not exist (prevents timing attacks)', async () => {
      const before = hasher.verifyCalls;
      await authenticate.execute(new AuthenticateUserCommand('nobody@example.com', 'x')).catch(() => undefined);
      expect(hasher.verifyCalls).toBe(before + 1);
    });
  });
});
