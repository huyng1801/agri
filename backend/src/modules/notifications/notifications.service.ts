import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateNotificationDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.NotificationWhereInput = {};
    if (!isSuperAdmin(user)) {
      where.OR = [{ userId: user.id }, { cooperativeId: requireTenant(user) }];
    } else if (query.cooperativeId) {
      where.cooperativeId = String(query.cooperativeId);
    }
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.notification.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async create(user: AuthUser, dto: CreateNotificationDto) {
    if (!isSuperAdmin(user) && dto.cooperativeId && dto.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không được gửi thông báo sang HTX khác');
    }
    return this.prisma.notification.create({
      data: {
        cooperativeId: dto.cooperativeId ?? user.cooperativeId,
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type ?? 'SYSTEM'
      }
    });
  }

  async markRead(user: AuthUser, id: string) {
    const found = await this.prisma.notification.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy thông báo');
    if (!isSuperAdmin(user) && found.userId && found.userId !== user.id) {
      throw new ForbiddenException('Không được cập nhật thông báo của người khác');
    }
    return this.prisma.notification.update({ where: { id }, data: { status: 'READ' } });
  }
}
