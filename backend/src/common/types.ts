import { RoleSlug } from '@prisma/client';
import type { AuthPortal } from './portal';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  cooperativeId: string | null;
  roles: RoleSlug[];
  permissions: string[];
  portal?: AuthPortal;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
