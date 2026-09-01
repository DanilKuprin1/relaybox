import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { DbUser } from '../auth/auth.types.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import type { RequestReceivedEvent } from './events.types.js';

const user: DbUser = { id: 7, clerkId: 'user_test_123' };

const event: RequestReceivedEvent = {
  type: 'request.received',
  webhookPublicId: 'web_1',
  requestPublicId: 'req_1',
  method: 'POST',
  path: '/hooks/key',
  status: 200,
  receivedAt: '2026-01-01T00:00:00.000Z',
};

describe('EventsController', () => {
  it('streams only the current user’s events, serialised for SSE', async () => {
    const events = new EventsService();
    const controller = new EventsController(events);

    const next = firstValueFrom(controller.stream(user));
    events.publish(7, event);

    await expect(next).resolves.toEqual({ data: JSON.stringify(event) });
  });

  it('subscribes the stream to the caller’s own id', () => {
    const streamFor = vi.fn().mockReturnValue({ pipe: vi.fn() });
    const controller = new EventsController({
      streamFor,
    } as unknown as EventsService);

    controller.stream(user);

    expect(streamFor).toHaveBeenCalledWith(7);
  });
});
