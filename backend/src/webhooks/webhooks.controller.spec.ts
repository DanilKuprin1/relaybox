import { describe, expect, it, vi } from 'vitest';
import type { DbUser } from '../auth/auth.types.js';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';

const user: DbUser = { id: 7, clerkId: 'user_test_123' };

function setup() {
  const service = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };
  return {
    controller: new WebhooksController(service as unknown as WebhooksService),
    service,
  };
}

describe('WebhooksController', () => {
  describe('create', () => {
    it('forwards the user and body to the service', async () => {
      const { controller, service } = setup();
      const created = { publicId: 'web_abc' };
      service.create.mockResolvedValue(created);
      const dto = { name: 'Stripe' };

      await expect(controller.create(user, dto)).resolves.toBe(created);
      expect(service.create).toHaveBeenCalledWith(user, dto);
    });
  });

  describe('findAll', () => {
    it('forwards the user and returns the wrapped list', async () => {
      const { controller, service } = setup();
      const list = { data: [{ publicId: 'web_abc' }] };
      service.findAll.mockResolvedValue(list);

      await expect(controller.findAll(user)).resolves.toBe(list);
      expect(service.findAll).toHaveBeenCalledWith(user);
    });
  });

  describe('findOne', () => {
    it('scopes the lookup to the current user', async () => {
      const { controller, service } = setup();
      const webhook = { publicId: 'web_abc' };
      service.findOne.mockResolvedValue(webhook);

      await expect(controller.findOne(user, 'web_abc')).resolves.toBe(webhook);
      expect(service.findOne).toHaveBeenCalledWith(user, 'web_abc');
    });

    it('passes through undefined when nothing matches', async () => {
      const { controller, service } = setup();
      service.findOne.mockResolvedValue(undefined);

      await expect(
        controller.findOne(user, 'web_missing'),
      ).resolves.toBeUndefined();
    });
  });

  describe('remove', () => {
    it('scopes the delete to the current user', async () => {
      const { controller, service } = setup();
      service.remove.mockResolvedValue(undefined);

      await expect(controller.remove(user, 'web_abc')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(user, 'web_abc');
    });
  });
});
