import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateNewsArticleDto, CreateNewsCategoryDto, UpdateNewsArticleDto, UpdateNewsCategoryDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { NewsService } from './news.service';

@ApiTags('news')
@ApiBearerAuth()
@Controller('news')
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Public()
  @Get('public')
  publicList(@Query() query: Record<string, unknown>) {
    return this.news.publicList(query);
  }

  @Public()
  @Get('public/categories')
  publicCategories() {
    return this.news.publicCategories();
  }

  @Public()
  @Get('public/:slug')
  publicDetail(@Param('slug') slug: string) {
    return this.news.publicDetail(slug);
  }

  @Get('categories')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.read')
  categories(@Query() query: Record<string, unknown>) {
    return this.news.categories(query);
  }

  @Post('categories')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.create')
  createCategory(@CurrentUser() user: AuthUser, @Body() dto: CreateNewsCategoryDto) {
    return this.news.createCategory(user, dto);
  }

  @Patch('categories/:id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.update')
  updateCategory(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateNewsCategoryDto) {
    return this.news.updateCategory(user, id, dto);
  }

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.read')
  list(@Query() query: Record<string, unknown>) {
    return this.news.list(query);
  }

  @Get(':id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.read')
  get(@Param('id') id: string) {
    return this.news.get(id);
  }

  @Post()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateNewsArticleDto) {
    return this.news.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateNewsArticleDto) {
    return this.news.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('news.delete')
  archive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.news.archive(user, id);
  }
}
