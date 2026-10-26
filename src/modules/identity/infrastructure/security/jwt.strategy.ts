import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from '../../../../config/env';
import { asUserId, UserId } from '../../domain/user';
import { JwtClaims } from './jwt-token-issuer';

/** What is available on `request.user` after the token is validated. */
export interface AuthenticatedUser {
  readonly userId: UserId;
  readonly email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
      algorithms: ['HS256'],
    });
  }

  /**
   * Passport has already checked the signature and expiration. The database is not queried
   * on every request: the token lasts 15 minutes, which is enough for this project.
   */
  validate(claims: JwtClaims): AuthenticatedUser {
    return { userId: asUserId(claims.sub), email: claims.email };
  }
}
