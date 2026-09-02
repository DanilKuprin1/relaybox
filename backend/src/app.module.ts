import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module.js';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { envSchema } from './config/env.schema.js';
import { loggerModuleOptions } from './config/logger.js';
import { EventsModule } from './events/events.module.js';
import { IngestModule } from './ingest/ingest.module.js';
import { DbModule } from './prisma/db.module.js';
import { DbService } from './prisma/db.service.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [
    SentryModule.forRoot(),
    LoggerModule.forRoot(loggerModuleOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    AuthModule,
    DbModule,
    EventsModule,
    WebhooksModule,
    IngestModule,
  ],
  controllers: [],
  providers: [
    DbService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
