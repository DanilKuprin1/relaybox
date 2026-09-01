import { Module } from '@nestjs/common';
import { HooksController } from './hooks.controller.js';
import { IngestService } from './ingest.service.js';

@Module({
  controllers: [HooksController],
  providers: [IngestService],
})
export class IngestModule {}
