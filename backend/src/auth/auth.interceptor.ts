import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedRequest } from './auth.types.js';
import { DbService } from '../prisma/db.service.js';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private dbService: DbService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.clerkUserId;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const dbUser = await this.dbService.dbConnection.orm.public.User.upsert({
      create: { clerkId: userId },
      update: {},
    });
    request.dbUser = dbUser;
    return next.handle();
  }
}
