import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../domain/domain-error';

/**
 * Translates domain errors into HTTP responses in one place.
 * The domain does not know what an HTTP 409 is; this filter does.
 * A new unmapped code returns 422 instead of an opaque 500.
 */
const STATUS_BY_CODE: Record<string, HttpStatus> = {
  INVALID_EMAIL: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_USERNAME: HttpStatus.UNPROCESSABLE_ENTITY,
  WEAK_PASSWORD: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_SEARCH_TERM: HttpStatus.UNPROCESSABLE_ENTITY,
  EMAIL_ALREADY_IN_USE: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  CATALOG_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = STATUS_BY_CODE[error.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;
    response.status(status).json({ statusCode: status, code: error.code, message: error.message });
  }
}
