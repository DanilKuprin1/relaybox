import { ClerkClient, clerkMiddleware } from '@clerk/express';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { Logger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module.js';
import { CLERK_CLIENT } from './auth/clerk.js';
import { bootstrapLogger } from './config/logger.js';
import { MAX_CAPTURE_BYTES } from './ingest/ingest.types.js';
import './instrument.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  app.use(
    '/hooks',
    express.raw({ type: () => true, limit: MAX_CAPTURE_BYTES }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Relaybox').setVersion('1.0').build(),
  );

  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc));
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });
  app.use(clerkMiddleware({ clerkClient: app.get<ClerkClient>(CLERK_CLIENT) }));
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  app.get(Logger).log(`Relaybox backend listening on ${port}`);
}

bootstrap().catch((error: unknown) => {
  bootstrapLogger.fatal({ err: error }, 'Backend startup failed');
  process.exitCode = 1;
});
