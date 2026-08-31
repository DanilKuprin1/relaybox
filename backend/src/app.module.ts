import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.schema.js';
import { DbService } from './prisma/db.service.js';
import { DbModule } from './prisma/db.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    AuthModule,
    DbModule,
  ],
  controllers: [],
  providers: [DbService],
})
export class AppModule {}
