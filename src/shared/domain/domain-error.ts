/**
 * Business error. The domain throws these errors without knowing anything about HTTP;
 * the presentation layer decides which status code maps to each `code`.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
