#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7073d2bfccd88e0e6ec9c2530ed8190abbb262f237e3ffe686998ea8971343ad/contract';
import endContract from '../../snapshots/7073d2bfccd88e0e6ec9c2530ed8190abbb262f237e3ffe686998ea8971343ad/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'request',
        columns: [
          col('body', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
          col('bodySize', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('bodyTruncated', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('contentLength', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('contentType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('headers', 'jsonb', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/jsonb@1' },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('method', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('protocol', 'character varying(10)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('publicId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('query', 'jsonb', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/jsonb@1' },
          }),
          col('rawBody', 'bytea', { codecRef: { codecId: 'pg/bytea@1' } }),
          col('rawQuery', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('receivedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('sourceIp', 'inet', { codecRef: { codecId: 'pg/inet@1' } }),
          col('status', 'int2', { notNull: true, codecRef: { codecId: 'pg/int2@1' } }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('webhookId', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('clerkId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'webhook',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('enabled', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('ingestKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('publicId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('retentionLimit', 'int4', {
            notNull: true,
            default: lit(100),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'request',
        constraint: 'request_publicId_key',
        columns: ['publicId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_clerkId_key',
        columns: ['clerkId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'webhook',
        constraint: 'webhook_publicId_key',
        columns: ['publicId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'webhook',
        constraint: 'webhook_ingestKey_key',
        columns: ['ingestKey'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'request',
        index: 'request_webhookId_idx_16330c4e',
        columns: ['webhookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'request',
        index: 'request_webhookId_receivedAt_idx_c8241a70',
        columns: ['webhookId', 'receivedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'webhook',
        index: 'webhook_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'request',
        foreignKey: {
          name: 'request_webhookId_fkey',
          columns: ['webhookId'],
          references: { schema: 'public', table: 'webhook', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'webhook',
        foreignKey: {
          name: 'webhook_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
