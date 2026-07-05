import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactInquiryStatus, Prisma, RoleSlug } from '@prisma/client';
import { CreateContactInquiryDto, UpdateContactInquiryDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.ContactInquiryWhereInput = {};
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (query.status) {
      where.status = String(query.status) as ContactInquiryStatus;
    }

    const [data, total] = await Promise.all([
      this.prisma.contactInquiry.findMany({
        where,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      this.prisma.contactInquiry.count({ where })
    ]);

    return paginated(data, total, page, limit);
  }

  createPublic(dto: CreateContactInquiryDto) {
    return this.prisma.contactInquiry.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || undefined,
        message: dto.message.trim(),
        sourcePath: dto.sourcePath?.trim() || '/lien-he',
        status: 'NEW'
      }
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateContactInquiryDto) {
    const existing = await this.prisma.contactInquiry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy liên hệ');

    const updated = await this.prisma.contactInquiry.update({
      where: { id },
      data: {
        status: dto.status,
        note: dto.note
      }
    });

    await this.audit.record({
      user,
      action: 'contacts.update',
      entity: 'ContactInquiry',
      entityId: id
    });

    return updated;
  }
}
