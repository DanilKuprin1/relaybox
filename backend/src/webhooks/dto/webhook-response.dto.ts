import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const webhookSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  ingestKey: z.string(),
  enabled: z.boolean(),
  createdAt: z.string(),
});

const webhooksListResponseSchema = z.object({
  data: z.array(webhookSchema),
});

const capturedRequestSchema = z.object({
  publicId: z.string(),
  method: z.string(),
  path: z.string(),
  status: z.number(),
  sourceIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  contentType: z.string().nullable(),
  contentLength: z.number().nullable(),
  protocol: z.string(),
  receivedAt: z.string(),
  rawQuery: z.string(),
  query: z.unknown(),
  headers: z.unknown(),
  body: z.unknown(),
  rawBody: z.string(),
  bodySize: z.number(),
  bodyTruncated: z.boolean(),
});

const requestsListResponseSchema = z.object({
  data: z.array(capturedRequestSchema),
});

export class WebhooksCreateResponseDto extends createZodDto(webhookSchema) {}

export class WebhooksListResponseDto extends createZodDto(
  webhooksListResponseSchema,
) {}

export class RequestsListResponseDto extends createZodDto(
  requestsListResponseSchema,
) {}
