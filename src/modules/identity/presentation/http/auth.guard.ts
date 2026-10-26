import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthenticatedUser } from '../../infrastructure/security/jwt.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * `@CurrentUser()` in a controller returns the user from the token.
 * Identity always comes from the verified token, never from request body input.
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
  return request.user;
});
