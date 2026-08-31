import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const webhookCreateResponseSchema = z.object({
  name: z.string(),
  publicId: z.string(),
  ingestKey: z.string(),
});

const webhooksListResponseSchema = z.object({
  data: z.array(webhookCreateResponseSchema),
});

export class WebhooksCreateResponseDto extends createZodDto(
  webhookCreateResponseSchema,
) {}

export class WebhooksListResponseDto extends createZodDto(
  webhooksListResponseSchema,
) {}
