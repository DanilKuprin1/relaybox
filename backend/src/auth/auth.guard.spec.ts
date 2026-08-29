import { getAuth, SessionAuthObject } from '@clerk/express';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth.guard.js';

vi.mock('@clerk/express', async () => {
  const actual =
    await vi.importActual<typeof import('@clerk/express')>('@clerk/express');
  return { ...actual, getAuth: vi.fn() };
});

type AuthenticatedRequest = {
  user?: { clerkUserId: string };
};

const ctx = (request: AuthenticatedRequest) => {
  return {
    switchToHttp: vi
      .fn()
      .mockReturnValue({ getRequest: vi.fn().mockReturnValue(request) }),
  };
};

describe('AuthGuard', () => {
  const authGuard = new AuthGuard();

  afterEach(() => vi.clearAllMocks());

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('returns true and attaches user when authenticated', () => {
    vi.mocked(getAuth).mockReturnValue({
      isAuthenticated: true,
      userId: '4',
    } as SessionAuthObject);
    const request: AuthenticatedRequest = {};
    const result = authGuard.canActivate(
      ctx(request) as unknown as ExecutionContext,
    );
    expect(result).toEqual(true);
    expect(request.user).toEqual({ clerkUserId: '4' });
  });

  it('throws UnauthorizedException when not authenticated', () => {
    vi.mocked(getAuth).mockReturnValue({
      isAuthenticated: false,
      userId: null,
    } as SessionAuthObject);
    const request: AuthenticatedRequest = {};
    expect(() => {
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext);
    }).toThrow(UnauthorizedException);
  });

  it('throws when authenticated but userId missing', () => {
    vi.mocked(getAuth).mockReturnValue({
      isAuthenticated: true,
    } as SessionAuthObject);
    const request: AuthenticatedRequest = {};
    expect(() => {
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext);
    }).toThrow(UnauthorizedException);
  });
});
