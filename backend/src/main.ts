import { clerkMiddleware } from '@clerk/express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(clerkMiddleware());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
