import type { Request as ExpressRequest } from 'express';

export type RawRequest = ExpressRequest;

export const MAX_BODY_BYTES = 1_000_000;

export const MAX_CAPTURE_BYTES = 10_000_000;
