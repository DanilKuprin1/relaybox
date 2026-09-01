import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { EventsService } from '../events/events.service.js';
import { DbService } from '../prisma/db.service.js';
import { IngestService } from './ingest.service.js';
import { MAX_BODY_BYTES, type RawRequest } from './ingest.types.js';

vi.mock('../config/nanoid.js', () => ({
  generateId: vi.fn(() => 'GENERATED_ID'),
}));

type CapturedRow = Record<string, unknown>;

const webhook = {
  id: 42n,
  publicId: 'web_abc',
  userId: 7,
  enabled: true,
};

function setup(found: unknown = webhook) {
  const first = vi.fn().mockResolvedValue(found);
  const where = vi.fn(() => ({ first }));
  const create = vi.fn().mockResolvedValue({});
  const publish = vi.fn();

  const db = {
    dbConnection: {
      orm: { public: { Webhook: { where }, Request: { create } } },
    },
  } as unknown as DbService;

  const service = new IngestService(db, {
    publish,
  } as unknown as EventsService);

  /** create() is a bare mock, so narrow its recorded argument in one place. */
  const row = () => create.mock.calls[0][0] as CapturedRow;

  return { service, where, create, publish, row };
}

function request(overrides: Partial<RawRequest> = {}): RawRequest {
  return {
    method: 'POST',
    path: '/hooks/key_abc',
    originalUrl: '/hooks/key_abc?source=stripe',
    httpVersion: '1.1',
    ip: '54.187.174.169',
    query: { source: 'stripe' },
    headers: {
      'content-type': 'application/json',
      'content-length': '18',
      'user-agent': 'Stripe/1.0',
    },
    rawBody: Buffer.from('{"type":"ping"}'),
    ...overrides,
  } as RawRequest;
}

describe('IngestService', () => {
  it('rejects an unknown ingest key', async () => {
    const { service, create } = setup(null);

    await expect(service.capture('nope', request())).rejects.toThrow(
      NotFoundException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('acknowledges but stores nothing for a disabled webhook', async () => {
    const { service, create, publish } = setup({ ...webhook, enabled: false });

    await expect(service.capture('key_abc', request())).resolves.toEqual({
      received: false,
    });
    expect(create).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it('persists the captured request', async () => {
    const { service, where, row } = setup();

    const result = await service.capture('key_abc', request());

    expect(where).toHaveBeenCalledWith({ ingestKey: 'key_abc' });
    expect(result).toEqual({ received: true, id: 'req_GENERATED_ID' });
    expect(row()).toMatchObject({
      publicId: 'req_GENERATED_ID',
      webhookId: 42n,
      method: 'POST',
      path: '/hooks/key_abc',
      rawQuery: 'source=stripe',
      query: { source: 'stripe' },
      protocol: 'HTTP/1.1',
      contentType: 'application/json',
      contentLength: 18,
      bodySize: 15,
      bodyTruncated: false,
      body: { type: 'ping' },
      status: 200,
      sourceIp: '54.187.174.169',
      userAgent: 'Stripe/1.0',
    });
  });

  it('records an empty rawQuery when the url has no query string', async () => {
    const { service, row } = setup();

    await service.capture(
      'key_abc',
      request({ originalUrl: '/hooks/key_abc', query: {} }),
    );

    expect(row().rawQuery).toBe('');
  });

  it('stores a null body for a non-JSON content type', async () => {
    const { service, row } = setup();

    await service.capture(
      'key_abc',
      request({
        headers: { 'content-type': 'application/xml' },
        rawBody: Buffer.from('<a/>'),
      }),
    );

    expect(row().body).toBeNull();
  });

  it('stores a null body when JSON is malformed', async () => {
    const { service, row } = setup();

    await service.capture(
      'key_abc',
      request({ rawBody: Buffer.from('{not json') }),
    );

    expect(row().body).toBeNull();
  });

  it('handles a request with no body at all', async () => {
    const { service, row } = setup();

    await service.capture('key_abc', request({ rawBody: undefined }));

    expect(row()).toMatchObject({ bodySize: 0, body: null });
  });

  it('truncates an oversized body and flags it', async () => {
    const { service, row } = setup();
    const oversized = Buffer.alloc(MAX_BODY_BYTES + 500, 0x61);

    await service.capture('key_abc', request({ rawBody: oversized }));

    expect(row()).toMatchObject({
      bodyTruncated: true,
      bodySize: MAX_BODY_BYTES + 500,
      // A partial payload can't be parsed, and half-parsed JSON would mislead.
      body: null,
    });
    expect((row().rawBody as Buffer).length).toBe(MAX_BODY_BYTES);
  });

  it('truncates method and protocol to the varchar(10) column width', async () => {
    const { service, row } = setup();

    await service.capture(
      'key_abc',
      request({ method: 'PROPFINDVERYLONG', httpVersion: '1.1000000000' }),
    );

    expect(row()).toMatchObject({
      method: 'PROPFINDVE',
      protocol: 'HTTP/1.100',
    });
  });

  it('publishes an event to the owning user', async () => {
    const { service, publish } = setup();

    await service.capture('key_abc', request());

    const [userId, event] = publish.mock.calls[0] as [
      number,
      Record<string, unknown>,
    ];
    expect(userId).toBe(7);
    expect(event).toMatchObject({
      type: 'request.received',
      webhookPublicId: 'web_abc',
      requestPublicId: 'req_GENERATED_ID',
      method: 'POST',
      path: '/hooks/key_abc',
      status: 200,
    });
    expect(typeof event.receivedAt).toBe('string');
  });
});
