import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, DbUser } from './auth.types.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): DbUser => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.dbUser)
      throw new Error('CurrentUser used without AuthInterceptor');
    return req.dbUser;
  },
);
