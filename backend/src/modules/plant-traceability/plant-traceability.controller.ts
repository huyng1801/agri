import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
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
import { PlantTraceabilityService } from './plant-traceability.service';

const READ_ROLES = [
  RoleSlug.SUPER_ADMIN,
  RoleSlug.ADMIN_HTX,
  RoleSlug.MEMBER_HTX,
  RoleSlug.FARMER,
  RoleSlug.ENTERPRISE,
  RoleSlug.AUTHORITY
] as RoleSlug[];
const WRITE_ROLES = [RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER];

@ApiTags('plant-traceability')
@ApiBearerAuth()
@Controller()
export class PlantTraceabilityController {
  constructor(private readonly traceability: PlantTraceabilityService) {}

  @Get('crop-types')
  @Roles(...READ_ROLES)
  @Permissions('crop_types.read')
  cropTypes(@Query() query: Record<string, unknown>) {
    return this.traceability.listCropTypes(query);
  }

  @Post('crop-types')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('crop_types.create')
  createCropType(@Body() dto: CreateCropTypeDto) {
    return this.traceability.createCropType(dto);
  }

  @Patch('crop-types/:id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('crop_types.update')
  updateCropType(@Param('id') id: string, @Body() dto: UpdateCropTypeDto) {
    return this.traceability.updateCropType(id, dto);
  }

  @Get('seasons')
  @Roles(...READ_ROLES)
  @Permissions('seasons.read')
  seasons(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.traceability.listSeasons(user, query);
  }

  @Post('seasons')
  @Roles(...WRITE_ROLES)
  @Permissions('seasons.create')
  createSeason(@CurrentUser() user: AuthUser, @Body() dto: CreateSeasonDto) {
    return this.traceability.createSeason(user, dto);
  }

  @Patch('seasons/:id')
  @Roles(...WRITE_ROLES)
  @Permissions('seasons.update')
  updateSeason(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.traceability.updateSeason(user, id, dto);
  }

  @Get('trees')
  @Roles(...READ_ROLES)
  @Permissions('trees.read')
  trees(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.traceability.listTrees(user, query);
  }

  @Get('trees/:id')
  @Roles(...READ_ROLES)
  @Permissions('trees.read')
  tree(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.traceability.getTree(user, id);
  }

  @Post('trees')
  @Roles(...WRITE_ROLES)
  @Permissions('trees.create')
  createTree(@CurrentUser() user: AuthUser, @Body() dto: CreateTreeDto) {
    return this.traceability.createTree(user, dto);
  }

  @Patch('trees/:id')
  @Roles(...WRITE_ROLES)
  @Permissions('trees.update')
  updateTree(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTreeDto) {
    return this.traceability.updateTree(user, id, dto);
  }

  @Delete('trees/:id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('trees.delete')
  archiveTree(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.traceability.archiveTree(user, id);
  }

  @Get('trees/:id/events')
  @Roles(...READ_ROLES)
  @Permissions('tree_events.read')
  treeEvents(@CurrentUser() user: AuthUser, @Param('id') treeId: string, @Query() query: Record<string, unknown>) {
    return this.traceability.listTreeEvents(user, treeId, query);
  }

  @Post('trees/:id/events')
  @Roles(...WRITE_ROLES)
  @Permissions('tree_events.create')
  createTreeEvent(@CurrentUser() user: AuthUser, @Param('id') treeId: string, @Body() dto: CreateTreeEventDto) {
    return this.traceability.createTreeEvent(user, treeId, dto);
  }

  @Patch('trees/:id/events/:eventId')
  @Roles(...WRITE_ROLES)
  @Permissions('tree_events.update')
  updateTreeEvent(@CurrentUser() user: AuthUser, @Param('eventId') eventId: string, @Body() dto: UpdateTreeEventDto) {
    return this.traceability.updateTreeEvent(user, eventId, dto);
  }

  @Delete('trees/:id/events/:eventId')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('tree_events.delete')
  archiveTreeEvent(@CurrentUser() user: AuthUser, @Param('eventId') eventId: string) {
    return this.traceability.archiveTreeEvent(user, eventId);
  }

  @Get('harvests')
  @Roles(...READ_ROLES)
  @Permissions('harvests.read')
  harvests(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.traceability.listHarvests(user, query);
  }

  @Post('trees/:id/harvests')
  @Roles(...WRITE_ROLES)
  @Permissions('harvests.create')
  createHarvest(@CurrentUser() user: AuthUser, @Param('id') treeId: string, @Body() dto: CreateHarvestDto) {
    return this.traceability.createHarvest(user, treeId, dto);
  }

  @Get('lots')
  @Roles(...READ_ROLES)
  @Permissions('lots.read')
  lots(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.traceability.listLots(user, query);
  }

  @Get('lots/:id')
  @Roles(...READ_ROLES)
  @Permissions('lots.read')
  lot(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.traceability.getLot(user, id);
  }

  @Post('lots')
  @Roles(...WRITE_ROLES)
  @Permissions('lots.create')
  createLot(@CurrentUser() user: AuthUser, @Body() dto: CreateLotDto) {
    return this.traceability.createLot(user, dto);
  }

  @Patch('lots/:id')
  @Roles(...WRITE_ROLES)
  @Permissions('lots.update')
  updateLot(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateLotDto) {
    return this.traceability.updateLot(user, id, dto);
  }

  @Delete('lots/:id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('lots.delete')
  archiveLot(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.traceability.archiveLot(user, id);
  }

  @Post('lots/:id/trees')
  @Roles(...WRITE_ROLES)
  @Permissions('lots.update')
  allocateLotTree(@CurrentUser() user: AuthUser, @Param('id') lotId: string, @Body() dto: AllocateLotTreeDto) {
    return this.traceability.allocateLotTree(user, lotId, dto);
  }

  @Get('product-batches')
  @Roles(...READ_ROLES)
  @Permissions('product_batches.read')
  productBatches(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.traceability.listProductBatches(user, query);
  }

  @Post('product-batches')
  @Roles(...WRITE_ROLES)
  @Permissions('product_batches.create')
  createProductBatch(@CurrentUser() user: AuthUser, @Body() dto: CreateProductBatchDto) {
    return this.traceability.createProductBatch(user, dto);
  }

  @Patch('product-batches/:id')
  @Roles(...WRITE_ROLES)
  @Permissions('product_batches.update')
  updateProductBatch(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductBatchDto) {
    return this.traceability.updateProductBatch(user, id, dto);
  }

  @Delete('product-batches/:id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('product_batches.delete')
  archiveProductBatch(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.traceability.archiveProductBatch(user, id);
  }

  @Get('traceability-codes')
  @Roles(...READ_ROLES)
  @Permissions('traceability_codes.read')
  traceabilityCodes(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.traceability.listTraceabilityCodes(user, query);
  }

  @Post('traceability-codes')
  @Roles(...WRITE_ROLES)
  @Permissions('traceability_codes.create')
  createTraceabilityCode(@CurrentUser() user: AuthUser, @Body() dto: CreateTraceabilityCodeDto) {
    return this.traceability.createTraceabilityCode(user, dto);
  }

  @Patch('traceability-codes/:id')
  @Roles(...WRITE_ROLES)
  @Permissions('traceability_codes.update')
  updateTraceabilityCode(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTraceabilityCodeDto) {
    return this.traceability.updateTraceabilityCode(user, id, dto);
  }

  @Delete('traceability-codes/:id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('traceability_codes.delete')
  hideTraceabilityCode(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.traceability.hideTraceabilityCode(user, id);
  }

  @Public()
  @Get('public/trees/:treeCode')
  publicTree(@Param('treeCode') treeCode: string) {
    return this.traceability.publicTree(treeCode);
  }

  @Public()
  @Get('public/trace/products/:productCode')
  publicProduct(@Param('productCode') productCode: string) {
    return this.traceability.publicProduct(productCode);
  }
}
