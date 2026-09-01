import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pino from 'pino';
import type { Params } from 'nestjs-pino';

type SerializedRequest = {
  id?: string | number;
  method?: string;
  url?: string;
  remoteAddress?: string;
};

const environment = process.env.NODE_ENV ?? 'development';
const level =
  process.env.LOG_LEVEL ?? (environment === 'production' ? 'info' : 'debug');

export function sanitizeRequestPath(url: string | undefined): string {
  const path = url?.split('?', 1)[0] ?? '/';
  return path.replace(/^\/hooks\/[^/]+/, '/hooks/[redacted]');
}

function requestId(req: IncomingMessage, res: ServerResponse): string {
  const suppliedId = req.headers['x-request-id'];
  const id =
    typeof suppliedId === 'string' && suppliedId.length <= 128
      ? suppliedId
      : randomUUID();

  res.setHeader('x-request-id', id);
  return id;
}

const transport =
  environment === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

const baseOptions: pino.LoggerOptions = {
  name: 'relaybox-backend',
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
};

export const loggerModuleOptions: Params = {
  pinoHttp: {
    ...baseOptions,
    genReqId: requestId,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        "res.headers['set-cookie']",
      ],
      censor: '[redacted]',
    },
    serializers: {
      req(req) {
        const request = req as SerializedRequest;
        return {
          id: request.id,
          method: request.method,
          path: sanitizeRequestPath(request.url),
          remoteAddress: request.remoteAddress,
        };
      },
    },
    customLogLevel(_req, res, error) {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage(req, res) {
      return `${req.method} ${sanitizeRequestPath(req.url)} completed with ${res.statusCode}`;
    },
    customErrorMessage(req, res) {
      return `${req.method} ${sanitizeRequestPath(req.url)} failed with ${res.statusCode}`;
    },
  },
};

export const bootstrapLogger = pino(baseOptions);
