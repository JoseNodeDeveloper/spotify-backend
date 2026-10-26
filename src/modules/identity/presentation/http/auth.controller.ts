import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthenticateUserCommand } from '../../application/authenticate-user.command';
import { CurrentUserView, GetCurrentUserQuery } from '../../application/get-current-user.query';
import { RegisterUserCommand, RegisterUserResult } from '../../application/register-user.command';
import { AccessToken } from '../../domain/ports';
import { AuthenticatedUser } from '../../infrastructure/security/jwt.strategy';
import { CurrentUser, JwtAuthGuard } from './auth.guard';
import { LoginDto, RegisterUserDto } from './auth.dto';

/**
 * "Thin" controller: translates HTTP into commands/queries and nothing more.
 * It knows nothing about repositories or bcrypt; that is the responsibility of other layers.
 */
@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterUserDto): Promise<RegisterUserResult> {
    return this.commands.execute(new RegisterUserCommand(dto.username, dto.email, dto.password));
  }

  /** Strict limit: 5 attempts per minute per IP to guard against brute-force attacks. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() dto: LoginDto): Promise<AccessToken> {
    return this.commands.execute(new AuthenticateUserCommand(dto.email, dto.password));
  }

  /** Replaces the old POST /getUser, which handed out a token for any email without a password. */
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserView> {
    return this.queries.execute(new GetCurrentUserQuery(user.userId));
  }
}
