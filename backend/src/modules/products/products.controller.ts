import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCategoryDto, CreateProductDto, UpdateProductDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get('public')
  publicList(@Query() query: Record<string, unknown>) {
    return this.products.publicList(query);
  }

  @Get('categories')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  @Permissions('product_categories.read')
  categories(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.products.categories(user, query);
  }

  @Post('categories')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('product_categories.create')
  createCategory(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.products.createCategory(user, dto);
  }

  @Get()
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  @Permissions('products.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.products.list(user, query);
  }

  @Get(':id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  @Permissions('products.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.products.get(user, id);
  }

  @Post()
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('products.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.products.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('products.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.ADMIN_HTX)
  @Permissions('products.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.products.remove(user, id);
  }
}
