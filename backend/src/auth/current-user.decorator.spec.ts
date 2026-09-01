import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest, DbUser } from './auth.types.js';
import { currentUserFactory } from './current-user.decorator.js';

const ctx = (request: Partial<AuthenticatedRequest>) =>
  ({
    switchToHttp: vi
      .fn()
      .mockReturnValue({ getRequest: vi.fn().mockReturnValue(request) }),
  }) as unknown as ExecutionContext;

describe('currentUserFactory', () => {
  it('returns the dbUser the interceptor attached', () => {
    const dbUser: DbUser = { id: 7, clerkId: 'user_test_123' };

    expect(currentUserFactory(undefined, ctx({ dbUser }))).toBe(dbUser);
  });

  it('throws when the interceptor did not run', () => {
    expect(() => currentUserFactory(undefined, ctx({}))).toThrow(
      'CurrentUser used without AuthInterceptor',
    );
  });
});
