import { getAuth, SessionAuthObject } from '@clerk/express';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard.js';
import { AuthenticatedRequest } from './auth.types.js';

vi.mock('@clerk/express', async () => {
  const actual =
    await vi.importActual<typeof import('@clerk/express')>('@clerk/express');
  return { ...actual, getAuth: vi.fn() };
});

const ctx = (request: AuthenticatedRequest) => {
  return {
    switchToHttp: vi
      .fn()
      .mockReturnValue({ getRequest: vi.fn().mockReturnValue(request) }),
    getHandler: vi.fn(),
    getClass: vi.fn(),
  };
};

describe('AuthGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
  const authGuard = new AuthGuard(reflector);

  afterEach(() => vi.clearAllMocks());

  it('lets @Public() routes through without a Clerk session', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValueOnce(true);
    const request = {} as AuthenticatedRequest;

    expect(
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext),
    ).toBe(true);
    expect(getAuth).not.toHaveBeenCalled();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('returns true and attaches user when authenticated', () => {
    vi.mocked(getAuth).mockReturnValue({
      isAuthenticated: true,
      userId: '4',
    } as SessionAuthObject);
    const request = {} as AuthenticatedRequest;
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
    const request = {} as AuthenticatedRequest;
    expect(() => {
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext);
    }).toThrow(UnauthorizedException);
  });

  it('throws when authenticated but userId missing', () => {
    vi.mocked(getAuth).mockReturnValue({
      isAuthenticated: true,
    } as SessionAuthObject);
    const request = {} as AuthenticatedRequest;
    expect(() => {
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext);
    }).toThrow(UnauthorizedException);
  });
});
