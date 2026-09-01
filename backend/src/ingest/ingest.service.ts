import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  JsonValue,
  Varchar,
} from '@prisma/orm-postgres/target/codec-types';
import { generateId } from '../config/nanoid.js';
import { EventsService } from '../events/events.service.js';
import { DbService } from '../prisma/db.service.js';
import { MAX_BODY_BYTES, type RawRequest } from './ingest.types.js';

@Injectable()
export class IngestService {
  constructor(
    private db: DbService,
    private events: EventsService,
  ) {}

  async capture(ingestKey: string, req: RawRequest) {
    const webhook = await this.db.dbConnection.orm.public.Webhook.where({
      ingestKey,
    }).first();

    if (!webhook) {
      throw new NotFoundException('Unknown ingest key');
    }

    // A disabled endpoint still answers 200 so the sender doesn't retry, but
    // nothing is recorded.
    if (!webhook.enabled) {
      return { received: false };
    }

    const raw = req.rawBody ?? Buffer.alloc(0);
    const bodyTruncated = raw.length > MAX_BODY_BYTES;
    const stored = bodyTruncated ? raw.subarray(0, MAX_BODY_BYTES) : raw;

    const publicId = 'req_' + generateId();
    const contentType = req.headers['content-type'] ?? null;
    const declaredLength = req.headers['content-length'];

    const receivedAt = new Date().toISOString();

    await this.db.dbConnection.orm.public.Request.create({
      publicId,
      webhookId: webhook.id,
      method: req.method.slice(0, 10) as Varchar<10>,
      path: req.path,
      rawQuery: this.rawQueryOf(req),
      // Express types the query/header bags loosely; round-trip to plain JSON.
      query: JSON.parse(JSON.stringify(req.query)) as JsonValue,
      protocol: `HTTP/${req.httpVersion}`.slice(0, 10) as Varchar<10>,
      headers: JSON.parse(JSON.stringify(req.headers)) as JsonValue,
      rawBody: stored,
      body: this.parseJson(stored, contentType, bodyTruncated),
      contentType,
      contentLength: declaredLength ? Number(declaredLength) : null,
      bodySize: raw.length,
      bodyTruncated,
      status: 200,
      sourceIp: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
      receivedAt,
    });

    this.events.publish(webhook.userId, {
      type: 'request.received',
      webhookPublicId: webhook.publicId,
      requestPublicId: publicId,
      method: req.method,
      path: req.path,
      status: 200,
      receivedAt,
    });

    return { received: true, id: publicId };
  }

  private rawQueryOf(req: RawRequest): string {
    const i = req.originalUrl.indexOf('?');
    return i === -1 ? '' : req.originalUrl.slice(i + 1);
  }

  private parseJson(
    body: Buffer,
    contentType: string | null,
    truncated: boolean,
  ): JsonValue | null {
    if (truncated || body.length === 0) return null;
    if (!contentType?.includes('json')) return null;
    try {
      return JSON.parse(body.toString('utf8')) as JsonValue;
    } catch {
      return null;
    }
  }
}
