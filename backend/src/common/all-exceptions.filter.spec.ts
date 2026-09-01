import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { PinoLogger } from 'nestjs-pino';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

function setup(headersSent = false) {
  const request = {
    id: 'request-123',
    method: 'POST',
    originalUrl: '/hooks/secret-ingest-key?token=secret',
  };
  const response = {};
  const reply = vi.fn();
  const end = vi.fn();
  const adapterHost = {
    httpAdapter: {
      isHeadersSent: vi.fn(() => headersSent),
      reply,
      end,
    },
  } as unknown as HttpAdapterHost;
  const logger = {
    setContext: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } as unknown as PinoLogger;
  const host = {
    switchToHttp: vi.fn(() => ({
      getRequest: vi.fn(() => request),
      getResponse: vi.fn(() => response),
    })),
  } as unknown as ArgumentsHost;

  return {
    filter: new AllExceptionsFilter(adapterHost, logger),
    logger,
    host,
    response,
    reply,
    end,
  };
}

describe('AllExceptionsFilter', () => {
  it('returns and logs the request ID for expected HTTP errors', () => {
    const { filter, logger, host, response, reply } = setup();

    filter.catch(new NotFoundException('Missing webhook'), host);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-123',
        path: '/hooks/[redacted]',
        statusCode: 404,
      }),
      'Request rejected',
    );
    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 404,
        message: 'Missing webhook',
        requestId: 'request-123',
      }),
      404,
    );
  });

  it('hides internal errors from the response while logging the exception', () => {
    const { filter, logger, host, response, reply } = setup();
    const error = new Error('database password leaked');

    filter.catch(error, host);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: error, statusCode: 500 }),
      'Request failed',
    );
    expect(reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: 500,
        message: 'Internal server error',
        requestId: 'request-123',
      },
      500,
    );
  });

  it('ends a response whose headers were already sent', () => {
    const { filter, host, response, reply, end } = setup(true);

    filter.catch(new Error('stream failed'), host);

    expect(reply).not.toHaveBeenCalled();
    expect(end).toHaveBeenCalledWith(response);
  });
});
