import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { DbUser } from '../auth/auth.types.js';
import { generateId } from '../config/nanoid.js';
import { DbService } from '../prisma/db.service.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private db: DbService) {}

  async create(user: DbUser, createWebhookDto: CreateWebhookDto) {
    this.logger.debug({ userId: user.id }, 'Creating webhook');
    const webhook = await this.db.dbConnection.orm.public.Webhook.create({
      name: createWebhookDto.name,
      publicId: 'web_' + generateId(),
      ingestKey: generateId(),
      userId: user.id,
    });
    this.logger.log(
      { userId: user.id, webhookPublicId: webhook.publicId },
      'Webhook created',
    );
    return webhook;
  }

  async findAll(user: DbUser) {
    const webhooks = await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
    })
      .orderBy((w) => w.createdAt.desc())
      .all();
    this.logger.debug(
      { userId: user.id, webhookCount: webhooks.length },
      'Webhooks listed',
    );
    return { data: webhooks };
  }

  async findOne(user: DbUser, publicId: string) {
    const webhook = await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
      publicId: publicId,
    })
      .orderBy((w) => w.createdAt.desc())
      .first();
    if (!webhook) {
      this.logger.warn(
        { userId: user.id, webhookPublicId: publicId },
        'Webhook not found',
      );
    } else {
      this.logger.debug(
        { userId: user.id, webhookPublicId: publicId },
        'Webhook found',
      );
    }
    return webhook;
  }

  async findRequests(user: DbUser, publicId: string) {
    const webhook = await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
      publicId,
    }).first();

    if (!webhook) {
      this.logger.warn(
        { userId: user.id, webhookPublicId: publicId },
        'Cannot list requests for missing webhook',
      );
      throw new NotFoundException();
    }

    const requests = await this.db.dbConnection.orm.public.Request.where({
      webhookId: webhook.id,
    })
      .orderBy((r) => r.receivedAt.desc())
      .all();

    this.logger.debug(
      {
        userId: user.id,
        webhookPublicId: publicId,
        requestCount: requests.length,
      },
      'Webhook requests listed',
    );

    return {
      data: requests.map((request) => ({
        ...request,
        rawBody: request.rawBody ? Buffer.from(request.rawBody).toString() : '',
      })),
    };
  }

  async remove(user: DbUser, publicId: string) {
    this.logger.debug(
      { userId: user.id, webhookPublicId: publicId },
      'Deleting webhook',
    );
    await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
      publicId: publicId,
    }).delete();
    this.logger.log(
      { userId: user.id, webhookPublicId: publicId },
      'Webhook deleted',
    );
  }
}
