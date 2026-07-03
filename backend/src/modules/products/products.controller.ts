import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
  categories(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.products.categories(user, query);
  }

  @Post('categories')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  createCategory(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.products.createCategory(user, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.products.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.products.get(user, id);
  }

  @Post()
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.products.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.products.remove(user, id);
  }
}
