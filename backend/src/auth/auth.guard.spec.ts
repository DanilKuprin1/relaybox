import { getAuth, SessionAuthObject } from '@clerk/express';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

jest.mock('@clerk/express', () => {
  return {
    ...jest.requireActual<typeof import('@clerk/express')>('@clerk/express'),
    getAuth: jest.fn(),
  };
});

type AuthenticatedRequest = {
  user?: { clerkUserId: string };
};

const ctx = (request: AuthenticatedRequest) => {
  return {
    switchToHttp: jest
      .fn()
      .mockReturnValue({ getRequest: jest.fn().mockReturnValue(request) }),
  };
};

describe('AuthGuard', () => {
  const authGuard = new AuthGuard();

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('returns true and attaches user when authenticated', () => {
    jest.mocked(getAuth).mockReturnValue({
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
    jest.mocked(getAuth).mockReturnValue({
      isAuthenticated: false,
      userId: null,
    } as SessionAuthObject);
    const request: AuthenticatedRequest = {};
    expect(() => {
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext);
    }).toThrow(UnauthorizedException);
  });

  it('throws when authenticated but userId missing', () => {
    jest.mocked(getAuth).mockReturnValue({
      isAuthenticated: true,
    } as SessionAuthObject);
    const request: AuthenticatedRequest = {};
    expect(() => {
      authGuard.canActivate(ctx(request) as unknown as ExecutionContext);
    }).toThrow(UnauthorizedException);
  });
});
