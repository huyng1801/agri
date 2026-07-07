import { ForbiddenException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { AuthUser } from '../../common/types';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';

type DateRange = { from?: Date; to?: Date };

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = this.resolveCooperativeId(user, query);
    const tenant = cooperativeId ? { cooperativeId } : {};
    const range = this.parseDateRange(query);
    const dateFilter = this.dateWhere(range);

    const [cooperatives, users, products, zones, logs, passports, unpaidInvoices, contacts, revenue, orders] = await Promise.all([
      isSuperAdmin(user) ? this.prisma.cooperative.count() : Promise.resolve(1),
      this.prisma.user.count({ where: { ...tenant, ...dateFilter } }),
      this.prisma.product.count({ where: tenant }),
      this.prisma.zone.count({ where: tenant }),
      this.prisma.farmingLog.count({ where: { ...tenant, ...dateFilter } }),
      this.prisma.traceabilityPassport.count({ where: tenant }),
      this.prisma.subscriptionInvoice.count({ where: { ...tenant, status: { in: ['UNPAID', 'OVERDUE'] } } }),
      isSuperAdmin(user) ? this.prisma.contactInquiry.count({ where: { status: 'NEW' } }) : Promise.resolve(0),
      this.prisma.subscriptionInvoice.aggregate({
        where: { ...tenant, status: 'PAID', ...(range.from || range.to ? { paidAt: dateFilter.createdAt } : {}) },
        _sum: { amount: true }
      }),
      this.prisma.order.count({ where: { ...tenant, ...dateFilter } })
    ]);

    const metrics = [
      ...(isSuperAdmin(user) ? [{ key: 'cooperatives', label: 'HTX', value: cooperatives }] : []),
      { key: 'users', label: 'Thành viên', value: users },
      { key: 'products', label: 'Sản phẩm', value: products },
      { key: 'zones', label: 'Vùng trồng', value: zones },
      { key: 'logs', label: 'Nhật ký canh tác', value: logs },
      { key: 'passports', label: 'QR Passport', value: passports },
      { key: 'orders', label: 'Đơn hàng COD', value: orders },
      { key: 'unpaidInvoices', label: 'Hóa đơn chưa thu', value: unpaidInvoices },
      ...(isSuperAdmin(user) ? [{ key: 'contacts', label: 'Liên hệ mới', value: contacts }] : []),
      { key: 'revenue', label: 'Doanh thu SaaS', value: Number(revenue._sum.amount ?? 0), isCurrency: true }
    ];

    return { metrics, range };
  }

  async production(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = this.resolveCooperativeId(user, query);
    const range = this.parseDateRange(query);
    const where: Prisma.FarmingLogWhereInput = {
      ...(cooperativeId ? { cooperativeId } : {}),
      ...this.dateWhere(range)
    };
    const [grouped, logs] = await Promise.all([
      this.prisma.farmingLog.groupBy({
        by: ['activityType'],
        where,
        _count: { _all: true },
        orderBy: { _count: { activityType: 'desc' } }
      }),
      this.prisma.farmingLog.findMany({
        where,
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);
    const dailyMap = new Map<string, number>();
    for (const log of logs) {
      const day = log.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
    return {
      total: grouped.reduce((sum, item) => sum + item._count._all, 0),
      byActivity: grouped.map((item) => ({ activityType: item.activityType, count: item._count._all })),
      daily: Array.from(dailyMap.entries()).map(([day, count]) => ({ day, count }))
    };
  }

  async traceability(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = this.resolveCooperativeId(user, query);
    const where: Prisma.TraceabilityPassportWhereInput = cooperativeId ? { cooperativeId } : {};
    const passports = await this.prisma.traceabilityPassport.findMany({
      where,
      select: { id: true, passportCode: true, viewCount: true, product: { select: { name: true } } },
      orderBy: { viewCount: 'desc' },
      take: 20
    });
    const totalViews = await this.prisma.traceabilityPassport.aggregate({
      where,
      _sum: { viewCount: true }
    });
    return {
      totalViews: totalViews._sum.viewCount ?? 0,
      topPassports: passports.map((item) => ({
        code: item.passportCode,
        productName: item.product?.name ?? '—',
        views: item.viewCount
      }))
    };
  }

  async quality(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = this.resolveCooperativeId(user, query);
    const where: Prisma.CertificationWhereInput = cooperativeId ? { cooperativeId } : {};
    const now = new Date();
    const [total, active, expired] = await Promise.all([
      this.prisma.certification.count({ where }),
      this.prisma.certification.count({ where: { ...where, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
      this.prisma.certification.count({ where: { ...where, expiresAt: { lte: now } } })
    ]);
    return { total, active, expired, passRate: total ? Math.round((active / total) * 100) : 0 };
  }

  async listSnapshots(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = this.resolveCooperativeId(user, query);
    const where: Prisma.ReportSnapshotWhereInput = cooperativeId ? { cooperativeId } : {};
    return this.prisma.reportSnapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async downloadSnapshot(user: AuthUser, id: string) {
    const snapshot = await this.prisma.reportSnapshot.findUnique({ where: { id } });
    if (!snapshot) throw new NotFoundException('Không tìm thấy snapshot');
    if (!isSuperAdmin(user) && snapshot.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền tải snapshot HTX khác');
    }
    return snapshot;
  }

  async revenue(user: AuthUser, query: Record<string, unknown>) {
    const where: Prisma.SubscriptionInvoiceWhereInput = { status: 'PAID' };
    if (!isSuperAdmin(user)) where.cooperativeId = requireTenant(user);
    if (query.cooperativeId && isSuperAdmin(user)) where.cooperativeId = String(query.cooperativeId);
    const invoices = await this.prisma.subscriptionInvoice.findMany({
      where,
      include: { cooperative: true },
      orderBy: { paidAt: 'desc' },
      take: 200
    });
    return {
      total: invoices.reduce((sum, item) => sum + Number(item.amount), 0),
      invoices
    };
  }

  async exportSnapshot(user: AuthUser, type: string, query: Record<string, unknown>) {
    const overview = await this.overview(user, query);
    return this.prisma.reportSnapshot.create({
      data: {
        cooperativeId: isSuperAdmin(user) ? (query.cooperativeId ? String(query.cooperativeId) : undefined) : user.cooperativeId,
        type,
        payloadJson: overview
      }
    });
  }

  async exportFile(user: AuthUser, type: string, query: Record<string, unknown>) {
    const overview = await this.overview(user, query);
    const production = await this.production(user, query);
    if (type === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Bao cao');
      sheet.addRow(['Chi so', 'Gia tri']);
      for (const metric of overview.metrics) {
        sheet.addRow([metric.label, metric.isCurrency ? Number(metric.value) : metric.value]);
      }
      sheet.addRow([]);
      sheet.addRow(['Nhat ky theo hoat dong', 'So luong']);
      for (const row of production.byActivity) {
        sheet.addRow([row.activityType, row.count]);
      }
      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
      return new StreamableFile(buffer, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: `attachment; filename="bao-cao-${Date.now()}.xlsx"`
      });
    }

    const lines = [
      'HTXONLINE - BAO CAO TONG HOP',
      ...overview.metrics.map((metric) => `${metric.label}: ${metric.isCurrency ? Number(metric.value).toLocaleString('vi-VN') : metric.value}`)
    ];
    const buffer = this.simplePdf(lines);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="bao-cao-${Date.now()}.pdf"`
    });
  }

  private resolveCooperativeId(user: AuthUser, query: Record<string, unknown>) {
    return isSuperAdmin(user)
      ? query.cooperativeId
        ? String(query.cooperativeId)
        : undefined
      : requireTenant(user);
  }

  private parseDateRange(query: Record<string, unknown>): DateRange {
    const range = query.range ? String(query.range) : '30d';
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = new Date(now);
    if (range === 'today') {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      from = new Date(now);
      from.setDate(from.getDate() - 7);
    } else if (range === '30d') {
      from = new Date(now);
      from.setDate(from.getDate() - 30);
    }
    if (query.from) from = new Date(String(query.from));
    if (query.to) to = new Date(String(query.to));
    return { from, to };
  }

  private dateWhere(range: DateRange): { createdAt?: Prisma.DateTimeFilter } {
    if (!range.from && !range.to) return {};
    return {
      createdAt: {
        ...(range.from ? { gte: range.from } : {}),
        ...(range.to ? { lte: range.to } : {})
      }
    };
  }

  private simplePdf(lines: string[]) {
    const safeLines = lines.map((line) =>
      line
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/[()\\]/g, (char) => `\\${char}`)
    );
    const content = ['BT', '/F1 18 Tf', '72 760 Td', `(${safeLines[0]}) Tj`, '/F1 11 Tf', ...safeLines.slice(1).flatMap((line) => ['0 -28 Td', `(${line}) Tj`]), 'ET'].join('\n');
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, 'ascii'));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = Buffer.byteLength(pdf, 'ascii');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return Buffer.from(pdf, 'ascii');
  }
}
