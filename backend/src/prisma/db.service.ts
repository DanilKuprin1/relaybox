import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import postgres, { PostgresClient } from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DbService.name);
  readonly dbConnection: PostgresClient<Contract>;

  constructor(private configService: ConfigService) {
    this.dbConnection = postgres<Contract>({
      contractJson,
      url: this.configService.getOrThrow<string>('DATABASE_URL'),
    });
  }

  async onModuleInit() {
    const startedAt = performance.now();
    this.logger.log('Connecting to PostgreSQL');
    try {
      await this.dbConnection.connect();
      this.logger.log(
        { durationMs: Math.round(performance.now() - startedAt) },
        'PostgreSQL connection established',
      );
    } catch (error) {
      this.logger.error(
        { err: error, durationMs: Math.round(performance.now() - startedAt) },
        'PostgreSQL connection failed',
      );
      throw error;
    }
  }

  async onApplicationShutdown() {
    this.logger.log('Closing PostgreSQL connection');
    try {
      await this.dbConnection.close();
      this.logger.log('PostgreSQL connection closed');
    } catch (error) {
      this.logger.error({ err: error }, 'PostgreSQL connection close failed');
      throw error;
    }
  }
}
