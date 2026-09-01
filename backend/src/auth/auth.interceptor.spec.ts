import {
  CallHandler,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../prisma/db.service.js';
import { Reflector } from '@nestjs/core';
import { AuthInterceptor } from './auth.interceptor.js';
import { AuthenticatedRequest, DbUser } from './auth.types.js';

describe('AuthInterceptor', () => {
  const fakeDbUser: DbUser = {
    id: 1,
    clerkId: 'user_test_123',
  };
  const upsert = vi.fn().mockResolvedValue(fakeDbUser);
  const dbService = {
    dbConnection: { orm: { public: { User: { upsert } } } },
  } as unknown as DbService;
  const reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
  const authInterceptor = new AuthInterceptor(dbService, reflector);
  const next: CallHandler = { handle: vi.fn() };

  const ctx = (request: AuthenticatedRequest) =>
    ({
      switchToHttp: vi
        .fn()
        .mockReturnValue({ getRequest: vi.fn().mockReturnValue(request) }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => vi.clearAllMocks());

  it('skips the user upsert for @Public() routes', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValueOnce(true);
    const request = {} as AuthenticatedRequest;

    await authInterceptor.intercept(ctx(request), next);

    expect(upsert).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledOnce();
  });

  it('throws UnauthorizedException when clerk userId is not present on the request object', async () => {
    const request = {} as AuthenticatedRequest;

    await expect(authInterceptor.intercept(ctx(request), next)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(upsert).not.toHaveBeenCalled();
    expect(next.handle).not.toHaveBeenCalled();
  });

  it('upserts the dbUser object to the request', async () => {
    const request = {
      user: { clerkUserId: 'user_test_123' },
    } as AuthenticatedRequest;

    await authInterceptor.intercept(ctx(request), next);

    expect(upsert).toHaveBeenCalledWith({
      create: { clerkId: 'user_test_123' },
      update: {},
      conflictOn: { clerkId: 'user_test_123' },
    });
    expect(request.dbUser).toEqual(fakeDbUser);
    expect(next.handle).toHaveBeenCalledOnce();
  });
});
