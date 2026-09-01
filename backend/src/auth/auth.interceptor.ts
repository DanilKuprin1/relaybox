import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { DbService } from '../prisma/db.service.js';
import { AuthenticatedRequest } from './auth.types.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    private dbService: DbService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.clerkUserId;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const dbUser = await this.dbService.dbConnection.orm.public.User.upsert({
      create: { clerkId: userId },
      update: {},
      conflictOn: { clerkId: userId },
    });
    request.dbUser = dbUser;
    return next.handle();
  }
}
