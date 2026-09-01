import { getAuth } from '@clerk/express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './auth.types.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
      this.logger.warn(
        {
          isAuthenticated,
          reason: !isAuthenticated ? 'no_active_session' : 'missing_user_id',
        },
        'Authentication rejected',
      );
      throw new UnauthorizedException();
    }
    req.user = {
      clerkUserId: userId,
    };
    this.logger.debug('Authentication accepted');

    return true;
  }
}
