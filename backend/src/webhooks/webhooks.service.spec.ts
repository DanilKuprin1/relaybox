import { describe, expect, it, vi } from 'vitest';
import type { DbUser } from '../auth/auth.types.js';
import { DbService } from '../prisma/db.service.js';
import { WebhooksService } from './webhooks.service.js';

vi.mock('../config/nanoid.js', () => ({
  generateId: vi.fn(() => 'GENERATED_ID'),
}));

const user: DbUser = { id: 7, clerkId: 'user_test_123' };

function setup() {
  const create = vi.fn();
  const all = vi.fn();
  const first = vi.fn();
  const del = vi.fn();

  const orderBy = vi.fn((cb: (w: never) => unknown) => {
    cb({ createdAt: { desc: () => undefined } } as never);
    return { all, first };
  });
  const where = vi.fn(() => ({ orderBy, delete: del }));

  const db = {
    dbConnection: { orm: { public: { Webhook: { create, where } } } },
  } as unknown as DbService;

  return {
    service: new WebhooksService(db),
    create,
    where,
    orderBy,
    all,
    first,
    del,
  };
}

describe('WebhooksService', () => {
  describe('create', () => {
    it('creates a webhook owned by the user with generated ids', async () => {
      const { service, create } = setup();
      const row = { id: 1n, name: 'Stripe' };
      create.mockResolvedValue(row);

      const result = await service.create(user, {
        name: 'Stripe',
      });

      expect(create).toHaveBeenCalledWith({
        name: 'Stripe',
        publicId: 'web_GENERATED_ID',
        ingestKey: 'GENERATED_ID',
        userId: 7,
      });
      expect(result).toBe(row);
    });

    it('prefixes publicId with web_ but leaves ingestKey unprefixed', async () => {
      const { service, create } = setup();
      create.mockResolvedValue({});

      await service.create(user, { name: 'GitHub' });

      const arg = create.mock.calls[0][0] as {
        publicId: string;
        ingestKey: string;
      };
      expect(arg.publicId.startsWith('web_')).toBe(true);
      expect(arg.ingestKey.startsWith('web_')).toBe(false);
    });
  });

  describe('findAll', () => {
    it('returns the user webhooks newest first, wrapped in data', async () => {
      const { service, where, orderBy, all } = setup();
      const rows = [{ id: 1n }, { id: 2n }];
      all.mockResolvedValue(rows);

      const result = await service.findAll(user);

      expect(where).toHaveBeenCalledWith({ userId: 7 });
      expect(orderBy).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: rows });
    });
  });

  describe('findOne', () => {
    it('looks the webhook up by publicId', async () => {
      const { service, where, first } = setup();
      const row = { id: 1n, publicId: 'web_abc' };
      first.mockResolvedValue(row);

      const result = await service.findOne(user, 'web_abc');

      expect(where).toHaveBeenCalledWith({ userId: 7, publicId: 'web_abc' });
      expect(result).toBe(row);
    });

    it('resolves undefined when no webhook matches', async () => {
      const { service, first } = setup();
      first.mockResolvedValue(undefined);

      await expect(
        service.findOne(user, 'web_missing'),
      ).resolves.toBeUndefined();
    });
  });

  describe('remove', () => {
    it('deletes by publicId and resolves with nothing', async () => {
      const { service, where, del } = setup();
      del.mockResolvedValue(undefined);

      await expect(service.remove(user, 'web_abc')).resolves.toBeUndefined();
      expect(where).toHaveBeenCalledWith({ userId: 7, publicId: 'web_abc' });
      expect(del).toHaveBeenCalledOnce();
    });
  });
});
