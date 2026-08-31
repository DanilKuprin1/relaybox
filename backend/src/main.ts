import { ClerkClient, clerkMiddleware } from '@clerk/express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { CLERK_CLIENT } from './auth/clerk.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(clerkMiddleware({ clerkClient: app.get<ClerkClient>(CLERK_CLIENT) }));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
