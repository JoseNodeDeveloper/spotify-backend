import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Env } from '../../../../config/env';
import { AccessToken, TokenIssuer } from '../../domain/ports';
import { UserId } from '../../domain/user';

/** Token payload. `sub` (subject) is the standard JWT claim for the user identifier. */
export interface JwtClaims {
  readonly sub: string;
  readonly email: string;
}

@Injectable()
export class JwtTokenIssuer implements TokenIssuer {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async issue(subject: { userId: UserId; email: string }): Promise<AccessToken> {
    const claims: JwtClaims = { sub: subject.userId, email: subject.email };
    const expiresIn = this.config.get('JWT_EXPIRES_IN', { infer: true });
    return {
      accessToken: await this.jwt.signAsync(claims, { expiresIn }),
      tokenType: 'Bearer',
      expiresIn,
    };
  }
}
