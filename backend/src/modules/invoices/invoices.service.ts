import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleSlug } from '@prisma/client';
import { nanoid } from 'nanoid';
import { CreateInvoiceDto, MarkPaidDto, UpdateInvoiceDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.SubscriptionInvoiceWhereInput = {};
    if (!isSuperAdmin(user)) {
      where.cooperativeId = requireTenant(user, query.cooperativeId ? String(query.cooperativeId) : undefined);
    } else if (query.cooperativeId) {
      where.cooperativeId = String(query.cooperativeId);
    }
    if (query.status) where.status = String(query.status) as Prisma.EnumInvoiceStatusFilter;
    const [data, total] = await Promise.all([
      this.prisma.subscriptionInvoice.findMany({
        where,
        include: { cooperative: true, subscription: { include: { plan: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.subscriptionInvoice.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const invoice = await this.prisma.subscriptionInvoice.findUnique({
      where: { id },
      include: { cooperative: true, subscription: { include: { plan: true } } }
    });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');
    if (!isSuperAdmin(user) && invoice.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem hóa đơn HTX khác');
    }
    return invoice;
  }

  async create(user: AuthUser, dto: CreateInvoiceDto) {
    if (!user.roles.includes(RoleSlug.SUPER_ADMIN)) {
      throw new ForbiddenException('Chỉ Super Admin được tạo hóa đơn');
    }
    const cooperative = await this.prisma.cooperative.findUnique({ where: { id: dto.cooperativeId } });
    if (!cooperative) throw new NotFoundException('Không tìm thấy HTX');
    const invoice = await this.prisma.subscriptionInvoice.create({
      data: {
        cooperativeId: dto.cooperativeId,
        subscriptionId: dto.subscriptionId,
        invoiceCode: dto.invoiceCode ?? `INV-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`,
        amount: dto.amount,
        currency: dto.currency ?? 'VND',
        status: dto.status ?? 'UNPAID',
        dueDate: dto.dueDate,
        paymentMethod: dto.paymentMethod,
        note: dto.note
      }
    });
    await this.audit.record({
      user,
      action: 'invoices.create',
      entity: 'SubscriptionInvoice',
      entityId: invoice.id,
      cooperativeId: invoice.cooperativeId
    });
    return invoice;
  }

  async update(user: AuthUser, id: string, dto: UpdateInvoiceDto) {
    await this.get(user, id);
    if (!isSuperAdmin(user)) throw new ForbiddenException('Chỉ Super Admin được cập nhật hóa đơn');
    const updated = await this.prisma.subscriptionInvoice.update({ where: { id }, data: dto });
    await this.audit.record({
      user,
      action: 'invoices.update',
      entity: 'SubscriptionInvoice',
      entityId: id,
      cooperativeId: updated.cooperativeId
    });
    return updated;
  }

  async markPaid(user: AuthUser, id: string, dto: MarkPaidDto) {
    if (!isSuperAdmin(user)) throw new ForbiddenException('Chỉ Super Admin được mark paid');
    const invoice = await this.get(user, id);
    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Không thể thanh toán hóa đơn đã hủy');
    }
    const updated = await this.prisma.subscriptionInvoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod: dto.paymentMethod ?? invoice.paymentMethod ?? 'manual'
      }
    });
    await this.audit.record({
      user,
      action: 'invoices.mark_paid',
      entity: 'SubscriptionInvoice',
      entityId: id,
      cooperativeId: updated.cooperativeId
    });
    return updated;
  }
}
