// src/auth/clerk.ts
import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import type { Provider } from '@nestjs/common';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

export const clerkClientProvider: Provider = {
  provide: CLERK_CLIENT,
  useFactory: (config: ConfigService): ClerkClient =>
    createClerkClient({
      publishableKey: config.getOrThrow<string>('CLERK_PUBLISHABLE_KEY'),
      secretKey: config.getOrThrow<string>('CLERK_SECRET_KEY'),
    }),
  inject: [ConfigService],
};
