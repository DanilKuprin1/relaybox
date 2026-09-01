import { Injectable, NotFoundException } from '@nestjs/common';
import type { DbUser } from '../auth/auth.types.js';
import { generateId } from '../config/nanoid.js';
import { DbService } from '../prisma/db.service.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';

@Injectable()
export class WebhooksService {
  constructor(private db: DbService) {}

  async create(user: DbUser, createWebhookDto: CreateWebhookDto) {
    const newUser = await this.db.dbConnection.orm.public.Webhook.create({
      name: createWebhookDto.name,
      publicId: 'web_' + generateId(),
      ingestKey: generateId(),
      userId: user.id,
    });
    return newUser;
  }

  async findAll(user: DbUser) {
    const webhooks = await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
    })
      .orderBy((w) => w.createdAt.desc())
      .all();
    return { data: webhooks };
  }

  async findOne(user: DbUser, publicId: string) {
    const webhook = await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
      publicId: publicId,
    })
      .orderBy((w) => w.createdAt.desc())
      .first();
    return webhook;
  }

  async findRequests(user: DbUser, publicId: string) {
    const webhook = await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
      publicId,
    }).first();

    if (!webhook) {
      throw new NotFoundException();
    }

    const requests = await this.db.dbConnection.orm.public.Request.where({
      webhookId: webhook.id,
    })
      .orderBy((r) => r.receivedAt.desc())
      .all();

    return {
      data: requests.map((request) => ({
        ...request,
        rawBody: request.rawBody ? Buffer.from(request.rawBody).toString() : '',
      })),
    };
  }

  async remove(user: DbUser, publicId: string) {
    await this.db.dbConnection.orm.public.Webhook.where({
      userId: user.id,
      publicId: publicId,
    }).delete();
  }
}
