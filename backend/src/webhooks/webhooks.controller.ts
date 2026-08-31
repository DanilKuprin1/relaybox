import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import type { DbUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';
import {
  WebhooksCreateResponseDto,
  WebhooksListResponseDto,
} from './dto/webhook-response.dto.js';
import { WebhooksService } from './webhooks.service.js';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ZodSerializerDto(WebhooksCreateResponseDto)
  create(
    @CurrentUser() user: DbUser,
    @Body() createWebhookDto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(user, createWebhookDto);
  }

  @Get()
  @ZodSerializerDto(WebhooksListResponseDto)
  findAll(@CurrentUser() user: DbUser) {
    return this.webhooksService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: DbUser, @Param('id') id: string) {
    return this.webhooksService.findOne(user, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: DbUser, @Param('id') id: string) {
    return this.webhooksService.remove(user, id);
  }
}
