import { RoleSlug } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  cooperativeId: string | null;
  roles: RoleSlug[];
  permissions: string[];
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
