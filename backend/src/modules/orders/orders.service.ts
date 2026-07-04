import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { CreateOrderDto, PublicCreateOrderDto, UpdateOrderDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const cooperativeId = isSuperAdmin(user) ? (query.cooperativeId ? String(query.cooperativeId) : undefined) : requireTenant(user, query.cooperativeId ? String(query.cooperativeId) : undefined);
    const where: Prisma.OrderWhereInput = cooperativeId
      ? {
          OR: [{ cooperativeId }, { items: { some: { cooperativeId } } }]
        }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            where: cooperativeId && !isSuperAdmin(user) ? { cooperativeId } : undefined,
            include: { product: true }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.order.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async create(user: AuthUser, dto: CreateOrderDto) {
    const productIds = Array.from(new Set(dto.items?.map((item) => item.productId) ?? []));
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, cooperativeId: true, price: true }
        })
      : [];
    if (productIds.length && products.length !== productIds.length) {
      throw new BadRequestException('Sản phẩm trong đơn không hợp lệ');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const firstItemCooperativeId = products[0]?.cooperativeId;
    const cooperativeId = isSuperAdmin(user) ? (dto.cooperativeId ?? firstItemCooperativeId) : requireTenant(user, dto.cooperativeId ?? firstItemCooperativeId);
    if (!cooperativeId) throw new BadRequestException('Thiếu HTX của đơn hàng');

    const itemData =
      dto.items?.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) throw new BadRequestException('Sản phẩm trong đơn không hợp lệ');
        if (!isSuperAdmin(user) && product.cooperativeId !== cooperativeId) {
          throw new ForbiddenException('Không thể tạo đơn chứa sản phẩm HTX khác');
        }
        return {
          productId: item.productId,
          cooperativeId: product.cooperativeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? product.price
        };
      }) ?? [];
    const totalAmount = dto.totalAmount ?? itemData.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

    return this.prisma.order.create({
      data: {
        cooperativeId,
        buyerId: dto.buyerId,
        orderCode: dto.orderCode ?? `ORD-${nanoid(8).toUpperCase()}`,
        status: dto.status ?? 'NEW',
        totalAmount,
        buyerName: dto.buyerName,
        buyerPhone: dto.buyerPhone,
        buyerEmail: dto.buyerEmail,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        address: dto.address,
        paymentMethod: dto.paymentMethod ?? 'COD',
        note: dto.note,
        items: itemData.length ? { create: itemData } : undefined
      },
      include: { items: true, payments: true }
    });
  }

  async createPublic(dto: PublicCreateOrderDto) {
    if (!dto.items.length) throw new BadRequestException('Giỏ hàng không được rỗng');
    const productIds = Array.from(new Set(dto.items.map((item) => item.productId)));
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        name: true,
        cooperativeId: true,
        price: true,
        unit: true,
        cooperative: { select: { id: true, name: true, code: true, phone: true } }
      }
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Một số sản phẩm không còn public hoặc không tồn tại');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const itemData = dto.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new BadRequestException('Sản phẩm trong giỏ hàng không hợp lệ');
      return {
        productId: product.id,
        cooperativeId: product.cooperativeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? product.price
      };
    });
    const totalAmount = itemData.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

    return this.prisma.order.create({
      data: {
        cooperativeId: itemData[0].cooperativeId,
        orderCode: `ORD-${nanoid(8).toUpperCase()}`,
        status: 'NEW',
        totalAmount,
        buyerName: dto.buyerName,
        buyerPhone: dto.buyerPhone,
        buyerEmail: dto.buyerEmail,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        address: dto.address,
        paymentMethod: 'COD',
        note: dto.note,
        items: { create: itemData }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                unit: true,
                cooperative: { select: { id: true, name: true, code: true, phone: true } }
              }
            }
          }
        }
      }
    });
  }

  async lookupPublic(orderCode: string, phone: string) {
    if (!orderCode || !phone) throw new BadRequestException('Nhập mã đơn hàng và số điện thoại');
    const order = await this.prisma.order.findFirst({
      where: {
        orderCode,
        buyerPhone: phone
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                unit: true,
                cooperative: { select: { id: true, name: true, code: true, phone: true } }
              }
            }
          }
        }
      }
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async update(user: AuthUser, id: string, dto: UpdateOrderDto) {
    const found = await this.prisma.order.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy đơn hàng');
    requireTenant(user, found.cooperativeId);
    return this.prisma.order.update({ where: { id }, data: dto });
  }
}
