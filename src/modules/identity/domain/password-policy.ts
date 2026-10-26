import { WeakPasswordError } from './errors';

const MIN_LENGTH = 10;
// bcrypt only uses the first 72 bytes; capping the length prevents passwords from being silently truncated.
const MAX_LENGTH = 72;

/**
 * Business rule for passwords, kept separate from the hashing algorithm.
 * Switching from bcrypt to argon2 should not require touching this rule, and vice versa.
 */
export function assertPasswordIsStrong(plain: string): void {
  if (plain.length < MIN_LENGTH || plain.length > MAX_LENGTH) {
    throw new WeakPasswordError(`The password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters long`);
  }
  const hasLetter = /[A-Za-z]/.test(plain);
  const hasDigit = /\d/.test(plain);
  if (!hasLetter || !hasDigit) {
    throw new WeakPasswordError('The password must contain both letters and numbers');
  }
}
