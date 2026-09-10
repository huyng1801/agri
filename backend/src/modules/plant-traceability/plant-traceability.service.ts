import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  HarvestStatus,
  LotStatus,
  Prisma,
  ProductBatchStatus,
  SeasonStatus,
  TraceabilityCodeStatus,
  TraceabilityCodeType,
  TreeEventStatus,
  TreeEventType,
  TreeStatus
} from '@prisma/client';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import {
  AllocateLotTreeDto,
  CreateCropTypeDto,
  CreateHarvestDto,
  CreateLotDto,
  CreateProductBatchDto,
  CreateSeasonDto,
  CreateTraceabilityCodeDto,
  CreateTreeDto,
  CreateTreeEventDto,
  UpdateCropTypeDto,
  UpdateLotDto,
  UpdateProductBatchDto,
  UpdateSeasonDto,
  UpdateTraceabilityCodeDto,
  UpdateTreeDto,
  UpdateTreeEventDto
} from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const TREE_INCLUDE = {
  cooperative: true,
  zone: true,
  cropType: true,
  traceabilityCode: true,
  _count: { select: { events: true, harvests: true, lotTrees: true } }
} as const;

const TREE_DETAIL_INCLUDE = {
  cooperative: true,
  zone: true,
  cropType: true,
  traceabilityCode: true,
  events: {
    where: { status: { not: TreeEventStatus.ARCHIVED } },
    orderBy: { eventDate: 'desc' as const },
    include: { inputs: true, actor: { select: { id: true, fullName: true } }, season: true }
  },
  harvests: {
    where: { status: { not: HarvestStatus.ARCHIVED } },
    orderBy: { harvestDate: 'desc' as const },
    include: { season: true, lotTrees: { include: { lot: true } } }
  }
} as const;

@Injectable()
export class PlantTraceabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async listCropTypes(query: Record<string, unknown>) {
    return this.prisma.cropType.findMany({
      where: query.includeInactive === 'true' ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
  }

  async createCropType(dto: CreateCropTypeDto) {
    return this.prisma.cropType.create({
      data: {
        code: this.normalizeCode(dto.code),
        name: dto.name.trim(),
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      }
    });
  }

  async updateCropType(id: string, dto: UpdateCropTypeDto) {
    await this.assertCropType(id);
    return this.prisma.cropType.update({
      where: { id },
      data: {
        code: dto.code === undefined ? undefined : this.normalizeCode(dto.code),
        name: dto.name?.trim(),
        description: dto.description,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive
      }
    });
  }

  async listSeasons(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.ProductionSeasonWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined),
      ...(query.status ? { status: String(query.status) as SeasonStatus } : {})
    };
    const [data, total] = await Promise.all([
      this.prisma.productionSeason.findMany({ where, orderBy: { startDate: 'desc' }, skip, take }),
      this.prisma.productionSeason.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async createSeason(user: AuthUser, dto: CreateSeasonDto) {
    const cooperativeId = this.requireCooperative(user, dto.cooperativeId);
    this.assertDateRange(dto.startDate, dto.endDate);
    const created = await this.prisma.productionSeason.create({
      data: { cooperativeId, code: this.normalizeCode(dto.code), name: dto.name.trim(), startDate: dto.startDate, endDate: dto.endDate, status: dto.status ?? SeasonStatus.PLANNING }
    });
    await this.audit.record({ user, action: 'seasons.create', entity: 'ProductionSeason', entityId: created.id, cooperativeId });
    return created;
  }

  async updateSeason(user: AuthUser, id: string, dto: UpdateSeasonDto) {
    const existing = await this.assertSeason(user, id);
    this.assertDateRange(dto.startDate, dto.endDate);
    const updated = await this.prisma.productionSeason.update({
      where: { id },
      data: { code: dto.code === undefined ? undefined : this.normalizeCode(dto.code), name: dto.name?.trim(), startDate: dto.startDate, endDate: dto.endDate, status: dto.status }
    });
    await this.audit.record({ user, action: 'seasons.update', entity: 'ProductionSeason', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async listTrees(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.TreeWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined),
      ...(query.zoneId ? { zoneId: String(query.zoneId) } : {}),
      ...(query.cropTypeId ? { cropTypeId: String(query.cropTypeId) } : {}),
      ...(query.status ? { status: String(query.status) as TreeStatus } : {})
    };
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { treeCode: { contains: search, mode: 'insensitive' } },
        { variety: { contains: search, mode: 'insensitive' } },
        { zone: { name: { contains: search, mode: 'insensitive' } } },
        { cropType: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (user.roles.includes('FARMER')) {
      const assigned = await this.assignedZoneIds(user);
      where.zoneId = { in: assigned };
    }
    const [data, total] = await Promise.all([
      this.prisma.tree.findMany({ where, include: TREE_INCLUDE, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.tree.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async getTree(user: AuthUser, id: string) {
    const tree = await this.prisma.tree.findUnique({ where: { id }, include: TREE_DETAIL_INCLUDE });
    if (!tree) throw new NotFoundException('Không tìm thấy hồ sơ cây');
    await this.assertTenantTree(user, tree.cooperativeId, tree.zoneId);
    return tree;
  }

  async createTree(user: AuthUser, dto: CreateTreeDto) {
    const cooperativeId = this.requireCooperative(user, dto.cooperativeId);
    const zone = await this.assertZone(cooperativeId, dto.zoneId);
    const cropType = await this.assertCropType(dto.cropTypeId);
    await this.assertFarmerZone(user, zone.id);
    this.assertNotFuture(dto.plantedDate, 'Ngày trồng không được ở tương lai');
    const treeCode = dto.treeCode ? this.normalizeCode(dto.treeCode) : await this.nextTreeCode(cropType.code, zone.code);
    if (await this.prisma.tree.findUnique({ where: { treeCode } })) throw new BadRequestException('Mã cây đã tồn tại');
    try {
      const created = await this.prisma.tree.create({
        data: {
          cooperativeId,
          zoneId: zone.id,
          cropTypeId: cropType.id,
          treeCode,
          variety: dto.variety,
          latitude: dto.latitude,
          longitude: dto.longitude,
          plantedDate: dto.plantedDate,
          status: dto.status ?? TreeStatus.ACTIVE,
          publicVerified: dto.publicVerified ?? false,
          imagesJson: this.json(dto.imagesJson),
          note: dto.note,
          createdById: user.id
        },
        include: TREE_INCLUDE
      });
      await this.audit.record({ user, action: 'trees.create', entity: 'Tree', entityId: created.id, cooperativeId, metadata: { treeCode } });
      return created;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) throw new BadRequestException('Mã cây đã tồn tại');
      throw error;
    }
  }

  async updateTree(user: AuthUser, id: string, dto: UpdateTreeDto) {
    const existing = await this.getTree(user, id);
    if (dto.treeCode && this.normalizeCode(dto.treeCode) !== existing.treeCode) {
      throw new BadRequestException('Mã cây đã cấp là bất biến và không thể thay đổi');
    }
    const zone = dto.zoneId ? await this.assertZone(existing.cooperativeId, dto.zoneId) : null;
    const cropType = dto.cropTypeId ? await this.assertCropType(dto.cropTypeId) : null;
    if (zone) await this.assertFarmerZone(user, zone.id);
    this.assertNotFuture(dto.plantedDate, 'Ngày trồng không được ở tương lai');
    const updated = await this.prisma.tree.update({
      where: { id },
      data: {
        zoneId: zone?.id,
        cropTypeId: cropType?.id,
        variety: dto.variety,
        latitude: dto.latitude,
        longitude: dto.longitude,
        plantedDate: dto.plantedDate,
        status: dto.status,
        publicVerified: dto.publicVerified,
        imagesJson: dto.imagesJson === undefined ? undefined : this.json(dto.imagesJson),
        note: dto.note
      },
      include: TREE_INCLUDE
    });
    await this.audit.record({ user, action: 'trees.update', entity: 'Tree', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async archiveTree(user: AuthUser, id: string) {
    const existing = await this.getTree(user, id);
    const updated = await this.prisma.tree.update({ where: { id }, data: { status: TreeStatus.INACTIVE } });
    await this.audit.record({ user, action: 'trees.archive', entity: 'Tree', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async listTreeEvents(user: AuthUser, treeId: string, query: Record<string, unknown>) {
    const tree = await this.assertTree(user, treeId);
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.TreeEventWhereInput = { cooperativeId: tree.cooperativeId, treeId, ...(query.status ? { status: String(query.status) as TreeEventStatus } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.treeEvent.findMany({ where, include: { inputs: true, actor: { select: { id: true, fullName: true } }, season: true }, orderBy: { eventDate: 'desc' }, skip, take }),
      this.prisma.treeEvent.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async createTreeEvent(user: AuthUser, treeId: string, dto: CreateTreeEventDto) {
    const tree = await this.assertTree(user, treeId);
    this.assertNotFuture(dto.eventDate, 'Ngày ghi nhận không được ở tương lai');
    if (dto.seasonId) await this.assertSeasonBelongs(tree.cooperativeId, dto.seasonId);
    const created = await this.prisma.$transaction(async (tx) => {
      const event = await tx.treeEvent.create({
        data: {
          cooperativeId: tree.cooperativeId,
          treeId,
          seasonId: dto.seasonId,
          actorId: user.id,
          eventDate: dto.eventDate,
          eventType: dto.eventType,
          description: dto.description.trim(),
          imagesJson: this.json(dto.imagesJson),
          status: dto.status ?? TreeEventStatus.PUBLISHED,
          metadataJson: this.json(dto.metadataJson ?? {}),
          inputs: dto.inputs?.length ? { create: dto.inputs.map((input) => ({ materialType: input.materialType, materialName: input.materialName.trim(), quantity: input.quantity, unit: input.unit, note: input.note })) } : undefined
        },
        include: { inputs: true }
      });
      const nextStatus = dto.eventType === TreeEventType.PEST_CONTROL ? TreeStatus.NEEDS_ATTENTION : dto.eventType === TreeEventType.HARVESTING ? TreeStatus.HARVESTED : undefined;
      if (nextStatus) await tx.tree.update({ where: { id: treeId }, data: { status: nextStatus } });
      return event;
    });
    await this.audit.record({ user, action: 'tree_events.create', entity: 'TreeEvent', entityId: created.id, cooperativeId: tree.cooperativeId });
    return created;
  }

  async updateTreeEvent(user: AuthUser, eventId: string, dto: UpdateTreeEventDto) {
    const existing = await this.assertEvent(user, eventId);
    this.assertNotFuture(dto.eventDate, 'Ngày ghi nhận không được ở tương lai');
    if (dto.seasonId) await this.assertSeasonBelongs(existing.cooperativeId, dto.seasonId);
    const updated = await this.prisma.treeEvent.update({
      where: { id: eventId },
      data: {
        seasonId: dto.seasonId,
        eventDate: dto.eventDate,
        eventType: dto.eventType,
        description: dto.description?.trim(),
        imagesJson: dto.imagesJson === undefined ? undefined : this.json(dto.imagesJson),
        status: dto.status,
        metadataJson: dto.metadataJson === undefined ? undefined : this.json(dto.metadataJson)
      },
      include: { inputs: true }
    });
    await this.audit.record({ user, action: 'tree_events.update', entity: 'TreeEvent', entityId: eventId, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async archiveTreeEvent(user: AuthUser, eventId: string) {
    const existing = await this.assertEvent(user, eventId);
    const updated = await this.prisma.treeEvent.update({ where: { id: eventId }, data: { status: TreeEventStatus.ARCHIVED } });
    await this.audit.record({ user, action: 'tree_events.archive', entity: 'TreeEvent', entityId: eventId, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async listHarvests(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.HarvestWhereInput = { ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined), ...(query.treeId ? { treeId: String(query.treeId) } : {}) };
    if (user.roles.includes('FARMER')) {
      where.tree = { zoneId: { in: await this.assignedZoneIds(user) } };
    }
    const [data, total] = await Promise.all([
      this.prisma.harvest.findMany({ where, include: { tree: { include: { cropType: true, zone: true } }, season: true, lotTrees: { include: { lot: true } } }, orderBy: { harvestDate: 'desc' }, skip, take }),
      this.prisma.harvest.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async createHarvest(user: AuthUser, treeId: string, dto: CreateHarvestDto) {
    const tree = await this.assertTree(user, treeId);
    this.assertNotFuture(dto.harvestDate, 'Ngày thu hoạch không được ở tương lai');
    if (dto.seasonId) await this.assertSeasonBelongs(tree.cooperativeId, dto.seasonId);
    const created = await this.prisma.$transaction(async (tx) => {
      const harvest = await tx.harvest.create({ data: { cooperativeId: tree.cooperativeId, treeId, seasonId: dto.seasonId, harvestDate: dto.harvestDate, quantity: dto.quantity, unit: dto.unit.trim(), status: dto.status ?? HarvestStatus.RECORDED, note: dto.note, recordedById: user.id } });
      await tx.tree.update({ where: { id: treeId }, data: { status: TreeStatus.HARVESTED } });
      await tx.treeEvent.create({ data: { cooperativeId: tree.cooperativeId, treeId, seasonId: dto.seasonId, actorId: user.id, eventDate: dto.harvestDate, eventType: TreeEventType.HARVESTING, description: `Thu hoạch ${dto.quantity} ${dto.unit}`, status: TreeEventStatus.PUBLISHED, metadataJson: { harvestId: harvest.id } } });
      return harvest;
    });
    await this.audit.record({ user, action: 'harvests.create', entity: 'Harvest', entityId: created.id, cooperativeId: tree.cooperativeId });
    return created;
  }

  async listLots(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.LotWhereInput = { ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined), ...(query.status ? { status: String(query.status) as LotStatus } : {}) };
    if (user.roles.includes('FARMER')) {
      where.zoneId = { in: await this.assignedZoneIds(user) };
    }
    const [data, total] = await Promise.all([
      this.prisma.lot.findMany({ where, include: { zone: true, cropType: true, lotTrees: { include: { tree: { select: { treeCode: true } }, harvest: true } }, productBatches: true }, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.lot.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async getLot(user: AuthUser, id: string) {
    const lot = await this.prisma.lot.findUnique({ where: { id }, include: { zone: true, cropType: true, lotTrees: { include: { tree: { include: { cropType: true, zone: true } }, harvest: true } }, productBatches: { include: { product: true, traceabilityCode: true } } } });
    if (!lot) throw new NotFoundException('Không tìm thấy lô sản phẩm');
    await this.assertTenant(user, lot.cooperativeId);
    await this.assertFarmerZone(user, lot.zoneId);
    return lot;
  }

  async createLot(user: AuthUser, dto: CreateLotDto) {
    const cooperativeId = this.requireCooperative(user, dto.cooperativeId);
    if (dto.harvestDate) this.assertNotFuture(dto.harvestDate, 'Ngày thu hoạch không được ở tương lai');
    if (dto.packagingDate) this.assertNotFuture(dto.packagingDate, 'Ngày đóng gói không được ở tương lai');
    this.assertChronology(dto.harvestDate, dto.packagingDate, 'Ngày đóng gói phải sau hoặc bằng ngày thu hoạch');
    if (user.roles.includes('FARMER') && !dto.zoneId) throw new ForbiddenException('Nông hộ phải chọn vùng được phân quyền khi tạo lô');
    const zone = dto.zoneId ? await this.assertZone(cooperativeId, dto.zoneId) : null;
    if (zone) await this.assertFarmerZone(user, zone.id);
    const cropType = dto.cropTypeId ? await this.assertCropType(dto.cropTypeId) : null;
    const lotCode = dto.lotCode ? this.normalizeCode(dto.lotCode) : await this.nextLotCode(cooperativeId, dto.harvestDate);
    try {
      const created = await this.prisma.lot.create({ data: { cooperativeId, zoneId: zone?.id, cropTypeId: cropType?.id, lotCode, harvestDate: dto.harvestDate, totalQuantity: dto.totalQuantity ?? 0, unit: dto.unit.trim(), packagingDate: dto.packagingDate, status: dto.status ?? LotStatus.DRAFT, note: dto.note } });
      await this.audit.record({ user, action: 'lots.create', entity: 'Lot', entityId: created.id, cooperativeId });
      return created;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) throw new BadRequestException('Mã lô đã tồn tại');
      throw error;
    }
  }

  async updateLot(user: AuthUser, id: string, dto: UpdateLotDto) {
    const existing = await this.getLot(user, id);
    if (dto.harvestDate) this.assertNotFuture(dto.harvestDate, 'Ngày thu hoạch không được ở tương lai');
    if (dto.packagingDate) this.assertNotFuture(dto.packagingDate, 'Ngày đóng gói không được ở tương lai');
    this.assertChronology(dto.harvestDate ?? existing.harvestDate, dto.packagingDate ?? existing.packagingDate, 'Ngày đóng gói phải sau hoặc bằng ngày thu hoạch');
    const zone = dto.zoneId ? await this.assertZone(existing.cooperativeId, dto.zoneId) : null;
    const cropType = dto.cropTypeId ? await this.assertCropType(dto.cropTypeId) : null;
    if (zone) await this.assertFarmerZone(user, zone.id);
    const updated = await this.prisma.lot.update({ where: { id }, data: { zoneId: zone?.id, cropTypeId: cropType?.id, lotCode: dto.lotCode === undefined ? undefined : this.normalizeCode(dto.lotCode), harvestDate: dto.harvestDate, unit: dto.unit, packagingDate: dto.packagingDate, status: dto.status, note: dto.note } });
    await this.audit.record({ user, action: 'lots.update', entity: 'Lot', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async archiveLot(user: AuthUser, id: string) {
    const existing = await this.getLot(user, id);
    const updated = await this.prisma.lot.update({ where: { id }, data: { status: LotStatus.ARCHIVED } });
    await this.audit.record({ user, action: 'lots.archive', entity: 'Lot', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async allocateLotTree(user: AuthUser, lotId: string, dto: AllocateLotTreeDto) {
    const lot = await this.getLot(user, lotId);
    const harvest = await this.prisma.harvest.findUnique({ where: { id: dto.harvestId }, include: { tree: true } });
    if (!harvest || harvest.cooperativeId !== lot.cooperativeId) throw new BadRequestException('Lần thu hoạch không thuộc HTX hoặc không tồn tại');
    if (harvest.unit !== dto.unit || lot.unit !== dto.unit) throw new BadRequestException('Đơn vị của thu hoạch và lô phải giống nhau');
    if (harvest.tree.cooperativeId !== lot.cooperativeId) throw new BadRequestException('Cây thu hoạch không thuộc HTX của lô');
    await this.assertFarmerZone(user, harvest.tree.zoneId);
    if (lot.zoneId && lot.zoneId !== harvest.tree.zoneId) throw new BadRequestException('Cây không thuộc vùng của lô');
    if (lot.cropTypeId && lot.cropTypeId !== harvest.tree.cropTypeId) throw new BadRequestException('Cây không thuộc loại cây của lô');
    const allocated = await this.prisma.lotTree.aggregate({ where: { harvestId: dto.harvestId }, _sum: { quantity: true } });
    const alreadyAllocated = Number(allocated._sum.quantity ?? 0);
    if (alreadyAllocated + dto.quantity > Number(harvest.quantity)) throw new BadRequestException('Sản lượng phân bổ vượt quá sản lượng thu hoạch');
    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.lotTree.create({ data: { lotId, treeId: harvest.treeId, harvestId: harvest.id, quantity: dto.quantity, unit: dto.unit } });
      await tx.lot.update({ where: { id: lotId }, data: { totalQuantity: { increment: dto.quantity }, status: LotStatus.OPEN } });
      if (alreadyAllocated + dto.quantity >= Number(harvest.quantity)) await tx.harvest.update({ where: { id: harvest.id }, data: { status: HarvestStatus.ALLOCATED } });
      return row;
    });
    await this.audit.record({ user, action: 'lots.allocate_tree', entity: 'LotTree', entityId: created.id, cooperativeId: lot.cooperativeId, metadata: { lotId, treeId: harvest.treeId, harvestId: harvest.id } });
    return this.getLot(user, lotId);
  }

  async listProductBatches(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.ProductBatchWhereInput = { ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined), ...(query.status ? { status: String(query.status) as ProductBatchStatus } : {}) };
    if (user.roles.includes('FARMER')) {
      where.lot = { zoneId: { in: await this.assignedZoneIds(user) } };
    }
    const [data, total] = await Promise.all([
      this.prisma.productBatch.findMany({ where, include: { product: true, lot: { include: { zone: true, cropType: true, _count: { select: { lotTrees: true } } } }, traceabilityCode: true }, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.productBatch.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async createProductBatch(user: AuthUser, dto: CreateProductBatchDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Không tìm thấy SKU sản phẩm');
    const lot = await this.prisma.lot.findUnique({ where: { id: dto.lotId }, include: { lotTrees: true } });
    if (!lot) throw new NotFoundException('Không tìm thấy lô sản phẩm');
    const cooperativeId = this.requireCooperative(user, dto.cooperativeId ?? product.cooperativeId);
    if (product.cooperativeId !== cooperativeId || lot.cooperativeId !== cooperativeId) throw new BadRequestException('SKU hoặc lô không thuộc HTX');
    await this.assertFarmerZone(user, lot.zoneId);
    if (!lot.lotTrees.length) throw new BadRequestException('Lô phải có ít nhất một lần thu hoạch của cây trước khi tạo sản phẩm');
    if (lot.unit !== dto.unit) throw new BadRequestException('Đơn vị của ProductBatch và lô phải giống nhau');
    if (dto.harvestDate) this.assertNotFuture(dto.harvestDate, 'Ngày thu hoạch không được ở tương lai');
    if (dto.packagingDate) this.assertNotFuture(dto.packagingDate, 'Ngày đóng gói không được ở tương lai');
    this.assertChronology(dto.harvestDate ?? lot.harvestDate, dto.packagingDate, 'Ngày đóng gói phải sau hoặc bằng ngày thu hoạch');
    const existing = await this.prisma.productBatch.aggregate({ where: { lotId: lot.id, status: { not: ProductBatchStatus.ARCHIVED } }, _sum: { quantity: true } });
    if (Number(existing._sum.quantity ?? 0) + dto.quantity > Number(lot.totalQuantity)) throw new BadRequestException('Khối lượng ProductBatch vượt quá khối lượng còn lại của lô');
    const productCode = dto.productCode ? this.normalizeCode(dto.productCode) : await this.nextProductCode(cooperativeId, dto.packagingDate);
    try {
      const created = await this.prisma.productBatch.create({ data: { cooperativeId, productId: product.id, lotId: lot.id, productCode, quantity: dto.quantity, unit: dto.unit.trim(), harvestDate: dto.harvestDate ?? lot.harvestDate, packagingDate: dto.packagingDate, status: dto.status ?? ProductBatchStatus.DRAFT, publicVerified: dto.publicVerified ?? false, note: dto.note }, include: { product: true, lot: true } });
      await this.audit.record({ user, action: 'product_batches.create', entity: 'ProductBatch', entityId: created.id, cooperativeId });
      return created;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) throw new BadRequestException('Mã sản phẩm truy xuất đã tồn tại');
      throw error;
    }
  }

  async updateProductBatch(user: AuthUser, id: string, dto: UpdateProductBatchDto) {
    const existing = await this.prisma.productBatch.findUnique({ where: { id }, include: { lot: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm truy xuất');
    await this.assertTenant(user, existing.cooperativeId);
    if (dto.productCode && this.normalizeCode(dto.productCode) !== existing.productCode) throw new BadRequestException('Mã sản phẩm truy xuất đã cấp là bất biến và không thể thay đổi');
    const lotId = dto.lotId ?? existing.lotId;
    const productId = dto.productId ?? existing.productId;
    const lot = await this.prisma.lot.findUnique({ where: { id: lotId }, include: { lotTrees: { include: { tree: { select: { publicVerified: true, status: true } } } } } });
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!lot || lot.cooperativeId !== existing.cooperativeId || !product || product.cooperativeId !== existing.cooperativeId) throw new BadRequestException('SKU hoặc lô không thuộc HTX');
    await this.assertFarmerZone(user, lot.zoneId);
    const unit = dto.unit ?? existing.unit;
    if (lot.unit !== unit) throw new BadRequestException('Đơn vị của ProductBatch và lô phải giống nhau');
    const quantity = dto.quantity ?? Number(existing.quantity);
    if (dto.harvestDate) this.assertNotFuture(dto.harvestDate, 'Ngày thu hoạch không được ở tương lai');
    if (dto.packagingDate) this.assertNotFuture(dto.packagingDate, 'Ngày đóng gói không được ở tương lai');
    this.assertChronology(dto.harvestDate ?? existing.harvestDate ?? lot.harvestDate, dto.packagingDate ?? existing.packagingDate, 'Ngày đóng gói phải sau hoặc bằng ngày thu hoạch');
    const others = await this.prisma.productBatch.aggregate({ where: { lotId, id: { not: id }, status: { not: ProductBatchStatus.ARCHIVED } }, _sum: { quantity: true } });
    if (Number(others._sum.quantity ?? 0) + quantity > Number(lot.totalQuantity)) throw new BadRequestException('Khối lượng ProductBatch vượt quá khối lượng của lô');
    const status = dto.status ?? existing.status;
    const publicVerified = dto.publicVerified ?? existing.publicVerified;
    if (status === ProductBatchStatus.PUBLISHED && publicVerified) {
      await this.assertPublicReady(TraceabilityCodeType.PRODUCT_BATCH, { type: TraceabilityCodeType.PRODUCT_BATCH, cooperativeId: existing.cooperativeId, batch: { ...existing, product, lot } });
    }
    const updated = await this.prisma.productBatch.update({ where: { id }, data: { productId, lotId, quantity: dto.quantity, unit: dto.unit, harvestDate: dto.harvestDate, packagingDate: dto.packagingDate, status: dto.status, publicVerified: dto.publicVerified, note: dto.note } });
    await this.audit.record({ user, action: 'product_batches.update', entity: 'ProductBatch', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async archiveProductBatch(user: AuthUser, id: string) {
    const existing = await this.getProductBatch(user, id);
    const updated = await this.prisma.productBatch.update({ where: { id }, data: { status: ProductBatchStatus.ARCHIVED } });
    await this.audit.record({ user, action: 'product_batches.archive', entity: 'ProductBatch', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async listTraceabilityCodes(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.TraceabilityCodeWhereInput = { ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined), ...(query.codeType ? { codeType: String(query.codeType) as TraceabilityCodeType } : {}) };
    if (user.roles.includes('FARMER')) {
      const assigned = await this.assignedZoneIds(user);
      where.AND = [{ OR: [{ tree: { zoneId: { in: assigned } } }, { productBatch: { lot: { zoneId: { in: assigned } } } }] }];
    }
    const [data, total] = await Promise.all([
      this.prisma.traceabilityCode.findMany({ where, include: { tree: { select: { treeCode: true } }, productBatch: { select: { productCode: true } } }, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.traceabilityCode.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async createTraceabilityCode(user: AuthUser, dto: CreateTraceabilityCodeDto) {
    const target = await this.resolveCodeTarget(user, dto);
    const published = dto.status === TraceabilityCodeStatus.PUBLISHED;
    if (published) await this.assertPublicReady(dto.codeType, target);
    const publicKey = target.type === TraceabilityCodeType.TREE ? target.tree!.treeCode : target.batch!.productCode;
    const publicUrl = this.publicUrl(dto.codeType, publicKey);
    const created = await this.prisma.traceabilityCode.create({
      data: {
        cooperativeId: target.cooperativeId,
        code: `${dto.codeType === TraceabilityCodeType.TREE ? 'TREE' : 'BATCH'}-${nanoid(12).toUpperCase()}`,
        publicSlug: `${publicKey.toLowerCase()}-${nanoid(8).toLowerCase()}`,
        codeType: dto.codeType,
        treeId: target.type === TraceabilityCodeType.TREE ? target.tree!.id : undefined,
        productBatchId: target.type === TraceabilityCodeType.PRODUCT_BATCH ? target.batch!.id : undefined,
        qrDataUrl: await QRCode.toDataURL(publicUrl, { errorCorrectionLevel: 'M', margin: 1, width: 512 }),
        status: dto.status ?? TraceabilityCodeStatus.DRAFT,
        publishedAt: published ? new Date() : null,
        expiredAt: dto.expiredAt
      }
    });
    await this.audit.record({ user, action: 'traceability_codes.create', entity: 'TraceabilityCode', entityId: created.id, cooperativeId: target.cooperativeId, metadata: { codeType: dto.codeType, publicUrl } });
    return { ...created, publicUrl };
  }

  async updateTraceabilityCode(user: AuthUser, id: string, dto: UpdateTraceabilityCodeDto) {
    const existing = await this.prisma.traceabilityCode.findUnique({ where: { id }, include: { tree: true, productBatch: { include: { lot: { include: { lotTrees: { include: { tree: { select: { publicVerified: true, status: true } } } } } }, product: true } } } });
    if (!existing) throw new NotFoundException('Không tìm thấy mã truy xuất');
    await this.assertTenant(user, existing.cooperativeId);
    if (existing.tree) await this.assertFarmerZone(user, existing.tree.zoneId);
    if (existing.productBatch) await this.assertFarmerZone(user, existing.productBatch.lot.zoneId);
    if (dto.status === TraceabilityCodeStatus.PUBLISHED) await this.assertPublicReady(existing.codeType, existing.tree ? { type: TraceabilityCodeType.TREE, cooperativeId: existing.cooperativeId, tree: existing.tree } : { type: TraceabilityCodeType.PRODUCT_BATCH, cooperativeId: existing.cooperativeId, batch: existing.productBatch! });
    const updated = await this.prisma.traceabilityCode.update({ where: { id }, data: { status: dto.status, expiredAt: dto.expiredAt, publishedAt: dto.status === TraceabilityCodeStatus.PUBLISHED && existing.status !== TraceabilityCodeStatus.PUBLISHED ? new Date() : undefined } });
    await this.audit.record({ user, action: 'traceability_codes.update', entity: 'TraceabilityCode', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async hideTraceabilityCode(user: AuthUser, id: string) {
    const existing = await this.prisma.traceabilityCode.findUnique({ where: { id }, include: { tree: true, productBatch: { include: { lot: true } } } });
    if (!existing) throw new NotFoundException('Không tìm thấy mã truy xuất');
    await this.assertTenant(user, existing.cooperativeId);
    if (existing.tree) await this.assertFarmerZone(user, existing.tree.zoneId);
    if (existing.productBatch) await this.assertFarmerZone(user, existing.productBatch.lot.zoneId);
    const updated = await this.prisma.traceabilityCode.update({ where: { id }, data: { status: TraceabilityCodeStatus.HIDDEN } });
    await this.audit.record({ user, action: 'traceability_codes.hide', entity: 'TraceabilityCode', entityId: id, cooperativeId: existing.cooperativeId });
    return updated;
  }

  async publicTree(treeCode: string) {
    const code = await this.prisma.traceabilityCode.findFirst({
      where: { codeType: TraceabilityCodeType.TREE, status: TraceabilityCodeStatus.PUBLISHED, OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }], tree: { treeCode, publicVerified: true, status: { not: TreeStatus.INACTIVE } } },
      include: { tree: { include: { cropType: true, zone: true, cooperative: true, events: { where: { status: TreeEventStatus.PUBLISHED }, orderBy: { eventDate: 'asc' }, include: { inputs: true } }, harvests: { where: { status: { not: HarvestStatus.ARCHIVED } }, orderBy: { harvestDate: 'asc' }, include: { lotTrees: { include: { lot: { include: { productBatches: true } } } } } } } } }
    });
    if (!code?.tree) throw new NotFoundException('Hồ sơ cây không tồn tại hoặc chưa được công khai');
    await this.prisma.traceabilityCode.update({ where: { id: code.id }, data: { viewCount: { increment: 1 } } });
    return { verified: true, traceability: { code: code.code, publicUrl: this.publicUrl(TraceabilityCodeType.TREE, treeCode) }, tree: this.publicTreePayload(code.tree) };
  }

  async publicProduct(productCode: string) {
    const code = await this.prisma.traceabilityCode.findFirst({
      where: { codeType: TraceabilityCodeType.PRODUCT_BATCH, status: TraceabilityCodeStatus.PUBLISHED, OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }], productBatch: { productCode, status: ProductBatchStatus.PUBLISHED, publicVerified: true, lot: { status: { not: LotStatus.ARCHIVED }, lotTrees: { some: {}, every: { tree: { publicVerified: true, status: { not: TreeStatus.INACTIVE } } } } }, product: { status: 'PUBLISHED', publicVerified: true } } },
      include: {
        productBatch: {
          include: {
            product: { include: { category: true } },
            lot: {
              include: {
                zone: true,
                cropType: true,
                lotTrees: {
                  include: {
                    tree: {
                      include: {
                        cropType: true,
                        zone: true,
                        events: { where: { status: TreeEventStatus.PUBLISHED }, orderBy: { eventDate: 'asc' } }
                      }
                    },
                    harvest: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!code?.productBatch) throw new NotFoundException('Sản phẩm truy xuất không tồn tại hoặc chưa được công khai');
    await this.prisma.traceabilityCode.update({ where: { id: code.id }, data: { viewCount: { increment: 1 } } });
    const batch = code.productBatch;
    return {
      verified: true,
      traceability: { code: code.code, publicUrl: this.publicUrl(TraceabilityCodeType.PRODUCT_BATCH, batch.productCode) },
      product: { name: batch.product.name, code: batch.product.code, description: batch.product.description, unit: batch.unit, price: batch.product.price, category: this.publicCategory(batch.product.category), quantity: batch.quantity, productCode: batch.productCode, packagingDate: batch.packagingDate, lotCode: batch.lot.lotCode, harvestDate: batch.harvestDate ?? batch.lot.harvestDate, treeCount: batch.lot.lotTrees.length },
      lot: { lotCode: batch.lot.lotCode, zone: this.publicZone(batch.lot.zone), cropType: this.publicCropType(batch.lot.cropType), harvestDate: batch.lot.harvestDate, totalQuantity: batch.lot.totalQuantity },
      trees: batch.lot.lotTrees.map((row) => ({ ...this.publicTreePayload({ ...row.tree, harvests: row.harvest ? [row.harvest] : [] }), allocatedQuantity: row.quantity, allocatedUnit: row.unit }))
    };
  }

  private async assertTree(user: AuthUser, id: string) {
    const tree = await this.prisma.tree.findUnique({ where: { id }, include: { zone: true, cropType: true } });
    if (!tree) throw new NotFoundException('Không tìm thấy hồ sơ cây');
    await this.assertTenantTree(user, tree.cooperativeId, tree.zoneId);
    return tree;
  }

  private async assertEvent(user: AuthUser, eventId: string) {
    const event = await this.prisma.treeEvent.findUnique({ where: { id: eventId }, include: { tree: { select: { zoneId: true } } } });
    if (!event) throw new NotFoundException('Không tìm thấy nhật ký cây');
    await this.assertTenant(user, event.cooperativeId);
    await this.assertFarmerZone(user, event.tree.zoneId);
    return event;
  }

  private async getProductBatch(user: AuthUser, id: string) {
    const batch = await this.prisma.productBatch.findUnique({ where: { id }, include: { lot: true } });
    if (!batch) throw new NotFoundException('Không tìm thấy sản phẩm truy xuất');
    await this.assertTenant(user, batch.cooperativeId);
    await this.assertFarmerZone(user, batch.lot.zoneId);
    return batch;
  }

  private async assertSeason(user: AuthUser, id: string) {
    const season = await this.prisma.productionSeason.findUnique({ where: { id } });
    if (!season) throw new NotFoundException('Không tìm thấy mùa vụ');
    await this.assertTenant(user, season.cooperativeId);
    return season;
  }

  private async assertSeasonBelongs(cooperativeId: string, id: string) {
    const season = await this.prisma.productionSeason.findUnique({ where: { id } });
    if (!season || season.cooperativeId !== cooperativeId) throw new BadRequestException('Mùa vụ không thuộc HTX');
    return season;
  }

  private async assertZone(cooperativeId: string, id: string) {
    const zone = await this.prisma.zone.findUnique({ where: { id } });
    if (!zone || zone.cooperativeId !== cooperativeId) throw new BadRequestException('Vùng trồng không thuộc HTX');
    return zone;
  }

  private async assertCropType(id: string) {
    const cropType = await this.prisma.cropType.findUnique({ where: { id } });
    if (!cropType || !cropType.isActive) throw new BadRequestException('Loại cây không tồn tại hoặc đang tắt');
    return cropType;
  }

  private async assertTenant(user: AuthUser, cooperativeId: string) {
    if (!isSuperAdmin(user) && cooperativeId !== user.cooperativeId) throw new ForbiddenException('Không có quyền truy cập dữ liệu HTX khác');
  }

  private async assertTenantTree(user: AuthUser, cooperativeId: string, zoneId: string) {
    await this.assertTenant(user, cooperativeId);
    await this.assertFarmerZone(user, zoneId);
  }

  private async assertFarmerZone(user: AuthUser, zoneId: string | null) {
    if (!user.roles.includes('FARMER')) return;
    const profile = await this.prisma.farmerProfile.findUnique({ where: { userId: user.id } });
    const assigned = Array.isArray(profile?.assignedZones) ? profile?.assignedZones.filter((item): item is string => typeof item === 'string') : [];
    if (!zoneId || !assigned.includes(zoneId)) throw new ForbiddenException('Dữ liệu nằm ngoài vùng được phân quyền của nông hộ');
  }

  private async assignedZoneIds(user: AuthUser) {
    const profile = await this.prisma.farmerProfile.findUnique({ where: { userId: user.id } });
    return Array.isArray(profile?.assignedZones) ? profile.assignedZones.filter((item): item is string => typeof item === 'string') : [];
  }

  private async assertPublicReady(type: TraceabilityCodeType, target: CodeTarget) {
    if (type === TraceabilityCodeType.TREE) {
      if (target.type !== TraceabilityCodeType.TREE || !target.tree?.publicVerified || target.tree?.status === TreeStatus.INACTIVE) throw new BadRequestException('Cây chưa được xác minh để công khai');
      return;
    }
    if (target.type !== TraceabilityCodeType.PRODUCT_BATCH || !target.batch?.publicVerified || target.batch?.status !== ProductBatchStatus.PUBLISHED || target.batch?.lot.status === LotStatus.ARCHIVED || target.batch?.product.status !== 'PUBLISHED' || !target.batch?.product.publicVerified || !target.batch?.lot.lotTrees.length || target.batch.lot.lotTrees.some((row: any) => !row.tree || !row.tree.publicVerified || row.tree.status === TreeStatus.INACTIVE)) throw new BadRequestException('Sản phẩm chưa đủ dữ liệu cây, lô và phê duyệt để công khai');
  }

  private async resolveCodeTarget(user: AuthUser, dto: CreateTraceabilityCodeDto): Promise<CodeTarget> {
    const hasTree = Boolean(dto.treeId);
    const hasBatch = Boolean(dto.productBatchId);
    if ((dto.codeType === TraceabilityCodeType.TREE && !hasTree) || (dto.codeType === TraceabilityCodeType.PRODUCT_BATCH && !hasBatch) || (hasTree && hasBatch)) throw new BadRequestException('Loại mã phải có đúng một đối tượng đích');
    if (dto.treeId) {
      const tree = await this.prisma.tree.findUnique({ where: { id: dto.treeId }, include: { zone: true } });
      if (!tree) throw new NotFoundException('Không tìm thấy cây');
      await this.assertTenantTree(user, tree.cooperativeId, tree.zoneId);
      if (await this.prisma.traceabilityCode.findUnique({ where: { treeId: tree.id } })) throw new BadRequestException('Cây đã có mã truy xuất');
      return { type: TraceabilityCodeType.TREE, cooperativeId: tree.cooperativeId, tree };
    }
    const batch = await this.prisma.productBatch.findUnique({ where: { id: dto.productBatchId }, include: { product: true, lot: { include: { lotTrees: { include: { tree: { select: { publicVerified: true, status: true } } } } } } } });
    if (!batch) throw new NotFoundException('Không tìm thấy ProductBatch');
    await this.assertTenant(user, batch.cooperativeId);
    await this.assertFarmerZone(user, batch.lot.zoneId);
    if (await this.prisma.traceabilityCode.findUnique({ where: { productBatchId: batch.id } })) throw new BadRequestException('ProductBatch đã có mã truy xuất');
    return { type: TraceabilityCodeType.PRODUCT_BATCH, cooperativeId: batch.cooperativeId, batch };
  }

  private publicTreePayload(tree: any) {
    return {
      treeCode: tree.treeCode,
      cropType: this.publicCropType(tree.cropType),
      variety: tree.variety,
      plantedDate: tree.plantedDate,
      status: tree.status,
      publicUrl: this.publicUrl(TraceabilityCodeType.TREE, tree.treeCode),
      zone: this.publicZone(tree.zone),
      events: (tree.events ?? []).map((event: any) => ({ id: event.id, eventDate: event.eventDate, eventType: event.eventType, description: event.description, inputs: (event.inputs ?? []).map((input: any) => ({ materialType: input.materialType, materialName: input.materialName, quantity: input.quantity, unit: input.unit, note: input.note })) })),
      harvests: (tree.harvests ?? []).map((harvest: any) => ({ id: harvest.id, harvestDate: harvest.harvestDate, quantity: harvest.quantity, unit: harvest.unit, lots: (harvest.lotTrees ?? []).map((row: any) => ({ lotCode: row.lot?.lotCode, quantity: row.quantity, unit: row.unit })) }))
    };
  }

  private publicZone(zone: any) {
    if (!zone || zone.isPublic === false) return null;
    return { name: zone.name, address: zone.address, latitude: this.roundCoordinate(zone.latitude), longitude: this.roundCoordinate(zone.longitude) };
  }

  private publicCropType(cropType: any) {
    if (!cropType) return null;
    return { code: cropType.code, name: cropType.name, description: cropType.description };
  }

  private publicCategory(category: any) {
    if (!category) return null;
    return { name: category.name, slug: category.slug, description: category.description };
  }

  private roundCoordinate(value: unknown) {
    if (value === null || value === undefined) return null;
    return Math.round(Number(value) * 100) / 100;
  }

  private publicUrl(type: TraceabilityCodeType, key: string) {
    const base = (process.env.PASSPORT_PUBLIC_URL || process.env.FRONTEND_URL || 'https://hochieunongnghiep.com').replace(/\/+$/, '');
    return `${base}/${type === TraceabilityCodeType.TREE ? 'cay' : 'truy-xuat'}/${encodeURIComponent(key)}`;
  }

  private async nextTreeCode(cropCode: string, zoneCode: string) {
    const prefix = `${this.normalizeCode(cropCode)}-${this.normalizeCode(zoneCode)}`;
    const last = await this.prisma.tree.findFirst({ where: { treeCode: { startsWith: `${prefix}-` } }, orderBy: { treeCode: 'desc' }, select: { treeCode: true } });
    const lastNumber = Number(last?.treeCode.split('-').at(-1));
    return `${prefix}-${String(Number.isFinite(lastNumber) ? lastNumber + 1 : 1).padStart(6, '0')}`;
  }

  private async nextLotCode(cooperativeId: string, date?: Date) {
    const year = (date ?? new Date()).getFullYear();
    const count = await this.prisma.lot.count({ where: { cooperativeId, lotCode: { startsWith: `LO-${year}-` } } });
    return `LO-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private async nextProductCode(cooperativeId: string, date?: Date) {
    const year = (date ?? new Date()).getFullYear();
    const count = await this.prisma.productBatch.count({ where: { productCode: { startsWith: `SP-${year}-` } } });
    return `SP-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private requireCooperative(user: AuthUser, requested?: string) {
    const id = requireTenant(user, requested);
    if (!id) throw new ForbiddenException('Super Admin cần chọn HTX để thao tác dữ liệu');
    return id;
  }

  private assertNotFuture(date: Date | undefined, message: string) {
    if (date && date > new Date()) throw new BadRequestException(message);
  }

  private assertChronology(before: Date | null | undefined, after: Date | null | undefined, message: string) {
    if (before && after && after < before) throw new BadRequestException(message);
  }

  private assertDateRange(start?: Date, end?: Date) {
    this.assertNotFuture(start, 'Ngày bắt đầu không được ở tương lai');
    this.assertNotFuture(end, 'Ngày kết thúc không được ở tương lai');
    if (start && end && start > end) throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
  }

  private normalizeCode(value: string) {
    const code = value.trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_').replace(/^[_-]+|[_-]+$/g, '');
    if (!code) throw new BadRequestException('Mã không được để trống');
    return code;
  }

  private isUniqueConstraintError(error: unknown): error is { code: 'P2002' } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }

  private json(value: unknown): Prisma.InputJsonValue {
    return (value ?? {}) as Prisma.InputJsonValue;
  }
}

type CodeTarget = { type: TraceabilityCodeType; cooperativeId: string; tree?: any; batch?: any };
