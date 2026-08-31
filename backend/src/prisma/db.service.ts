import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import postgres, { PostgresClient } from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbService implements OnModuleInit, OnApplicationShutdown {
  readonly dbConnection: PostgresClient<Contract>;

  constructor(private configService: ConfigService) {
    this.dbConnection = postgres<Contract>({
      contractJson,
      url: this.configService.getOrThrow<string>('DATABASE_URL'),
    });
  }

  async onModuleInit() {
    await this.dbConnection.connect();
  }

  async onApplicationShutdown() {
    await this.dbConnection.close();
  }
}
