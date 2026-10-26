import { DomainError } from '../../../shared/domain/domain-error';

export class InvalidSearchTermError extends DomainError {
  readonly code = 'INVALID_SEARCH_TERM';
}

const MAX_LENGTH = 100;

/**
 * Value Object for the search text. It normalizes whitespace so that
 * " Bad Bunny " and "Bad Bunny" count as the same search in the history.
 */
export class SearchTerm {
  private constructor(readonly value: string) {}

  static create(raw: string): SearchTerm {
    const value = raw.trim().replace(/\s+/g, ' ');
    if (value.length === 0 || value.length > MAX_LENGTH) {
      throw new InvalidSearchTermError(`The search must be between 1 and ${MAX_LENGTH} characters long`);
    }
    return new SearchTerm(value);
  }

  /** Key used to deduplicate the history case-insensitively. */
  get key(): string {
    return this.value.toLocaleLowerCase();
  }
}
