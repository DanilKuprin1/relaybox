import { describe, expect, it, vi } from 'vitest';
import { EventsService } from './events.service.js';
import type { RequestReceivedEvent } from './events.types.js';

const event = (id: string): RequestReceivedEvent => ({
  type: 'request.received',
  webhookPublicId: 'web_1',
  requestPublicId: id,
  method: 'POST',
  path: '/hooks/key',
  status: 200,
  receivedAt: '2026-01-01T00:00:00.000Z',
});

describe('EventsService', () => {
  it('delivers events to the owning user', () => {
    const service = new EventsService();
    const seen = vi.fn();
    service.streamFor(7).subscribe(seen);

    service.publish(7, event('req_1'));

    expect(seen).toHaveBeenCalledWith(event('req_1'));
  });

  it('does not leak events to other users', () => {
    const service = new EventsService();
    const seen = vi.fn();
    service.streamFor(7).subscribe(seen);

    service.publish(99, event('req_1'));

    expect(seen).not.toHaveBeenCalled();
  });

  it('fans one publish out to every subscriber of that user', () => {
    const service = new EventsService();
    const a = vi.fn();
    const b = vi.fn();
    service.streamFor(7).subscribe(a);
    service.streamFor(7).subscribe(b);

    service.publish(7, event('req_1'));

    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });
});
