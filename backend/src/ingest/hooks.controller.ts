import { All, Controller, HttpCode, Param, Req } from '@nestjs/common';
import { Public } from '../auth/public.decorator.js';
import { IngestService } from './ingest.service.js';
import type { RawRequest } from './ingest.types.js';

@Public()
@Controller('hooks')
export class HooksController {
  constructor(private readonly ingestService: IngestService) {}

  @All(':ingestKey')
  @HttpCode(200)
  capture(@Param('ingestKey') ingestKey: string, @Req() req: RawRequest) {
    return this.ingestService.capture(ingestKey, req);
  }
}
