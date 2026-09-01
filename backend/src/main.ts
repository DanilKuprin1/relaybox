import { ClerkClient, clerkMiddleware } from '@clerk/express';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module.js';
import { CLERK_CLIENT } from './auth/clerk.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Relaybox').setVersion('1.0').build(),
  );

  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc));
  app.use(clerkMiddleware({ clerkClient: app.get<ClerkClient>(CLERK_CLIENT) }));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
