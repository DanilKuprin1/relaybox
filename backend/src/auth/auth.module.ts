import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth.guard.js';
import { AuthInterceptor } from './auth.interceptor.js';
import { clerkClientProvider } from './clerk.js';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
    clerkClientProvider,
  ],
})
export class AuthModule {}
