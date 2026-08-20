import { getAuth } from '@clerk/express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedUser {
  clerkUserId: string;
}

type AuthenticatedRequest = ExpressRequest & {
  user?: AuthenticatedUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
      throw new UnauthorizedException();
    }
    req.user = {
      clerkUserId: userId,
    };

    return true;
  }
}
