import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { PERMISSION_CATALOG, PERMISSION_KEYS, hasPermission, wildcardPermissions } from '../../common/permissions';
import { UpdateRoleDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_REQUIRED = ['roles.read', 'roles.update', 'permissions.read', 'users.read'];

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list() {
    const roles = await this.prisma.role.findMany({ orderBy: { slug: 'asc' } });
    return roles.map((role) => ({
      ...role,
      permissions: this.normalizePermissions(role.permissions as string[])
    }));
  }

  permissions() {
    return {
      permissions: PERMISSION_CATALOG,
      wildcard: wildcardPermissions()
    };
  }

  async update(user: AuthUser, slug: RoleSlug, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { slug } });
    if (!role) throw new NotFoundException('Không tìm thấy vai trò');

    const permissions = dto.permissions ? this.validatePermissions(dto.permissions) : undefined;
    if (slug === RoleSlug.SUPER_ADMIN && permissions) {
      const missing = SUPER_ADMIN_REQUIRED.filter((permission) => !hasPermission(permissions, permission));
      if (missing.length) {
        throw new BadRequestException(`Super Admin phải giữ quyền: ${missing.join(', ')}`);
      }
    }

    const updated = await this.prisma.role.update({
      where: { slug },
      data: {
        name: dto.name,
        description: dto.description,
        permissions
      }
    });
    await this.audit.record({
      user,
      action: 'roles.update',
      entity: 'Role',
      entityId: updated.id,
      metadata: { slug, permissions: permissions ?? role.permissions }
    });
    return {
      ...updated,
      permissions: this.normalizePermissions(updated.permissions as string[])
    };
  }

  private validatePermissions(permissions: string[]) {
    const valid = new Set([...PERMISSION_KEYS, ...wildcardPermissions(), '*']);
    const unique = Array.from(new Set(permissions));
    const invalid = unique.filter((permission) => !valid.has(permission));
    if (invalid.length) {
      throw new BadRequestException(`Quyền không hợp lệ: ${invalid.join(', ')}`);
    }
    return unique.sort();
  }

  private normalizePermissions(permissions: string[]) {
    return Array.isArray(permissions) ? permissions : [];
  }
}
