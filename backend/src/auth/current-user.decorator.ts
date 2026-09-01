import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { AuthenticatedRequest, DbUser } from './auth.types.js';

const logger = new Logger('CurrentUser');

export const currentUserFactory = (
  _: unknown,
  ctx: ExecutionContext,
): DbUser => {
  const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!req.dbUser) {
    logger.error('CurrentUser used without AuthInterceptor');
    throw new Error('CurrentUser used without AuthInterceptor');
  }
  return req.dbUser;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
