import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const createWebhookSchema = z.object({
  name: z.string(),
});

export class CreateWebhookDto extends createZodDto(createWebhookSchema) {}
