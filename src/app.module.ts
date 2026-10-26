import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env, validateEnv } from './config/env';
import { IdentityModule } from './modules/identity/identity.module';
import { MusicModule } from './modules/music/music.module';
import { DomainExceptionFilter } from './shared/presentation/domain-exception.filter';

@Controller({ path: 'health', version: '1' })
class HealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),
    // Global per-IP limit; sensitive endpoints (login) have a stricter one.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'mysql',
        host: config.get('DB_HOST', { infer: true }),
        port: config.get('DB_PORT', { infer: true }),
        database: config.get('DB_NAME', { infer: true }),
        username: config.get('DB_USER', { infer: true }),
        password: config.get('DB_PASSWORD', { infer: true }),
        autoLoadEntities: true,
        // Never synchronize the schema automatically: changes go through versioned migrations.
        synchronize: false,
        logging: config.get('NODE_ENV', { infer: true }) === 'development' ? ['error', 'warn'] : ['error'],
        extra: { connectionLimit: 10 },
      }),
    }),
    IdentityModule,
    MusicModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
