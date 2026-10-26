import { InvalidEmailError } from './errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 100;

/**
 * Value Object: an email is always normalized and valid.
 * If an Email instance exists, nobody else has to validate it again.
 */
export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length > MAX_LENGTH || !EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError('The email format is not valid');
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
