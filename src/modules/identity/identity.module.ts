import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from '../../config/env';
import { CLOCK, SystemClock } from '../../shared/domain/clock';
import { AuthenticateUserHandler } from './application/authenticate-user.command';
import { GetCurrentUserHandler } from './application/get-current-user.query';
import { RegisterUserHandler } from './application/register-user.command';
import { PASSWORD_HASHER, TOKEN_ISSUER, USER_REPOSITORY } from './domain/ports';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtTokenIssuer } from './infrastructure/security/jwt-token-issuer';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { AuthController } from './presentation/http/auth.controller';

/**
 * This is where adapters are "plugged into" ports (dependency injection).
 * It is the only place in the module that knows the concrete implementations.
 */
@Module({
  imports: [
    CqrsModule,
    PassportModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    AuthenticateUserHandler,
    GetCurrentUserHandler,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuer },
    { provide: CLOCK, useClass: SystemClock },
  ],
})
export class IdentityModule {}
