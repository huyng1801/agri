import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleSlug } from '@prisma/client';
import { nanoid } from 'nanoid';
import { CreateInvoiceDto, MarkPaidDto, UpdateInvoiceDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { buildUnicodePdf } from '../../common/utils/unicode-pdf';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService,
    private readonly payments: PaymentsService
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
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { invoiceCode: { contains: search, mode: 'insensitive' } },
        { cooperative: { name: { contains: search, mode: 'insensitive' } } },
        { cooperative: { code: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (query.fromDate || query.toDate) {
      where.dueDate = {
        ...(query.fromDate ? { gte: new Date(String(query.fromDate)) } : {}),
        ...(query.toDate ? { lte: new Date(String(query.toDate)) } : {})
      };
    }
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
    if (dto.subscriptionId) {
      const subscription = await this.prisma.cooperativeSubscription.findUnique({ where: { id: dto.subscriptionId } });
      if (!subscription || subscription.cooperativeId !== dto.cooperativeId) {
        throw new BadRequestException('Gói đã gán không thuộc HTX của hóa đơn');
      }
    }
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
    await this.payments.createForInvoice(id, Number(updated.amount), dto.paymentMethod ?? 'manual');
    return updated;
  }

  async markUnpaid(user: AuthUser, id: string) {
    if (!isSuperAdmin(user)) throw new ForbiddenException('Chỉ Super Admin được mark unpaid');
    const invoice = await this.get(user, id);
    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Không thể chuyển hóa đơn đã hủy về chưa thanh toán');
    }
    const updated = await this.prisma.subscriptionInvoice.update({
      where: { id },
      data: {
        status: 'UNPAID',
        paidAt: null,
        paymentMethod: null
      }
    });
    await this.audit.record({
      user,
      action: 'invoices.mark_unpaid',
      entity: 'SubscriptionInvoice',
      entityId: id,
      cooperativeId: updated.cooperativeId
    });
    return updated;
  }

  async cancel(user: AuthUser, id: string) {
    if (!isSuperAdmin(user)) throw new ForbiddenException('Chỉ Super Admin được hủy hóa đơn');
    const invoice = await this.get(user, id);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Không thể hủy hóa đơn đã thanh toán');
    }
    const updated = await this.prisma.subscriptionInvoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paidAt: null
      }
    });
    await this.audit.record({
      user,
      action: 'invoices.cancel',
      entity: 'SubscriptionInvoice',
      entityId: id,
      cooperativeId: updated.cooperativeId
    });
    return updated;
  }

  async pdf(user: AuthUser, id: string) {
    const invoice = await this.get(user, id);
    const lines = [
      'HTXONLINE - Hóa đơn dịch vụ SaaS',
      `Mã hóa đơn: ${invoice.invoiceCode}`,
      `Hợp tác xã: ${invoice.cooperative.name} (${invoice.cooperative.code})`,
      `Gói dịch vụ: ${invoice.subscription?.plan?.name ?? 'Chưa gắn gói'}`,
      `Số tiền: ${this.formatCurrency(invoice.amount, invoice.currency)}`,
      `Trạng thái: ${this.invoiceStatusLabel(invoice.status)}`,
      `Hạn thanh toán: ${this.date(invoice.dueDate)}`,
      `Ngày thanh toán: ${this.date(invoice.paidAt)}`,
      `Phương thức: ${invoice.paymentMethod ?? 'Thủ công'}`,
      `Ghi chú: ${invoice.note ?? '-'}`
    ];
    return {
      fileName: `${invoice.invoiceCode}.pdf`,
      buffer: await buildUnicodePdf(lines)
    };
  }

  private invoiceStatusLabel(status: string) {
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      UNPAID: 'Chưa thanh toán',
      PAID: 'Đã thanh toán',
      OVERDUE: 'Quá hạn',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] ?? status;
  }

  private formatCurrency(amount: unknown, currency: string) {
    return `${Number(amount ?? 0).toLocaleString('vi-VN')} ${currency}`;
  }

  private date(value?: Date | null) {
    return value ? value.toISOString().slice(0, 10) : '-';
  }
}
