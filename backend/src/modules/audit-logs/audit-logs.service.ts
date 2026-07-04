import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../../common/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    user?: AuthUser | null;
    action: string;
    entity: string;
    entityId?: string | null;
    cooperativeId?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: input.user?.id,
          cooperativeId: input.cooperativeId ?? input.user?.cooperativeId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          metadataJson: input.metadata ?? {}
        }
      });
    } catch {
      // Audit logging must never break the user-facing operation.
    }
  }

  async list(query: Record<string, unknown>) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.cooperativeId) where.cooperativeId = String(query.cooperativeId);
    if (query.actorId) where.actorId = String(query.actorId);
    if (query.action) where.action = { contains: String(query.action), mode: 'insensitive' };
    return this.prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            email: true,
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
  }
}
