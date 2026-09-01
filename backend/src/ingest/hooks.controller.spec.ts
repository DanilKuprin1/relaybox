import { describe, expect, it, vi } from 'vitest';
import { HooksController } from './hooks.controller.js';
import { IngestService } from './ingest.service.js';
import type { RawRequest } from './ingest.types.js';

describe('HooksController', () => {
  function setup() {
    const service = { capture: vi.fn() };
    return {
      controller: new HooksController(service as unknown as IngestService),
      service,
    };
  }

  it('forwards the ingest key and raw request to the service', async () => {
    const { controller, service } = setup();
    const result = { received: true, id: 'req_abc' };
    service.capture.mockResolvedValue(result);
    const req = { method: 'POST' } as RawRequest;

    await expect(controller.capture('key_abc', req)).resolves.toBe(result);
    expect(service.capture).toHaveBeenCalledWith('key_abc', req);
  });
});
