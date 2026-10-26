import { DomainError } from '../../../shared/domain/domain-error';

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
}

export class InvalidUsernameError extends DomainError {
  readonly code = 'INVALID_USERNAME';
}

export class WeakPasswordError extends DomainError {
  readonly code = 'WEAK_PASSWORD';
}

export class EmailAlreadyInUseError extends DomainError {
  readonly code = 'EMAIL_ALREADY_IN_USE';
}

/**
 * A single error for both "email not found" and "wrong password":
 * this prevents attackers from enumerating registered emails.
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password');
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
}
