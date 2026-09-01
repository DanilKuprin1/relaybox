import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, DbUser } from './auth.types.js';

export const currentUserFactory = (
  _: unknown,
  ctx: ExecutionContext,
): DbUser => {
  const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!req.dbUser) throw new Error('CurrentUser used without AuthInterceptor');
  return req.dbUser;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
