import type { Request as ExpressRequest } from 'express';
import { DefaultModelRow } from '@prisma/orm-postgres/orm-client';
import { Contract } from '../prisma/contract.js';

export type DbUser = DefaultModelRow<Contract, 'User', 'public'>;

export type AuthenticatedUser = {
  clerkUserId: string;
};

export type AuthenticatedRequest = ExpressRequest & {
  user?: AuthenticatedUser;
  dbUser?: DbUser;
};
