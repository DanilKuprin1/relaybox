import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { HttpAdapterHost } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import type { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { sanitizeRequestPath } from '../config/logger.js';

type RequestWithId = Request & { id?: string };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<unknown>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = request.id;
    const zodError =
      exception instanceof ZodSerializationException
        ? exception.getZodError()
        : undefined;
    const logData = {
      err: exception,
      requestId,
      method: request.method,
      path: sanitizeRequestPath(request.originalUrl),
      statusCode,
      validationIssues:
        zodError instanceof ZodError ? zodError.issues : undefined,
    };

    if (statusCode >= 500) {
      this.logger.error(logData, 'Request failed');
    } else {
      this.logger.warn(logData, 'Request rejected');
    }

    const body = this.responseBody(exception, statusCode, requestId);
    const adapter = this.adapterHost.httpAdapter;

    if (adapter.isHeadersSent(response)) {
      adapter.end(response);
      return;
    }

    adapter.reply(response, body, statusCode);
  }

  private responseBody(
    exception: unknown,
    statusCode: number,
    requestId: string | undefined,
  ): Record<string, unknown> {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode,
        message: 'Internal server error',
        requestId,
      };
    }

    const response = exception.getResponse();
    const body =
      typeof response === 'string'
        ? { statusCode, message: response }
        : response;

    return { ...body, requestId };
  }
}
