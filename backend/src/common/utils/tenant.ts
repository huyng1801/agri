import { ForbiddenException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { AuthUser } from '../types';

export function isSuperAdmin(user: AuthUser) {
  return user.roles.includes(RoleSlug.SUPER_ADMIN);
}

export function requireTenant(user: AuthUser, requestedCooperativeId?: string | null) {
  if (isSuperAdmin(user)) {
    return requestedCooperativeId ?? undefined;
  }

  if (!user.cooperativeId) {
    throw new ForbiddenException('Tài khoản chưa được gán HTX');
  }

  if (requestedCooperativeId && requestedCooperativeId !== user.cooperativeId) {
    throw new ForbiddenException('Không có quyền truy cập dữ liệu HTX khác');
  }

  return user.cooperativeId;
}

export function tenantWhere(user: AuthUser, requestedCooperativeId?: string | null) {
  const cooperativeId = requireTenant(user, requestedCooperativeId);
  return cooperativeId ? { cooperativeId } : {};
}
