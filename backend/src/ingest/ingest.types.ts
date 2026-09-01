import type { Request as ExpressRequest } from 'express';

export type RawRequest = ExpressRequest & { rawBody?: Buffer };

export const MAX_BODY_BYTES = 1_000_000;
