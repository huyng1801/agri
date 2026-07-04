import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NewsStatus, Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { CreateNewsArticleDto, CreateNewsCategoryDto, UpdateNewsArticleDto, UpdateNewsCategoryDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slugify';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SCHEMA_TYPE = 'NewsArticle';
const ALLOWED_SCHEMA_TYPES = new Set(['Article', 'NewsArticle', 'BlogPosting']);
type NormalizedNewsArticleCreate = Omit<Prisma.NewsArticleUncheckedCreateInput, 'slug' | 'authorId'>;

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async categories(query: Record<string, unknown>) {
    const where: Prisma.NewsCategoryWhereInput = {};
    if (query.search) where.name = { contains: String(query.search), mode: 'insensitive' };
    if (query.isActive !== undefined) where.isActive = String(query.isActive) === 'true';
    return this.prisma.newsCategory.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async publicCategories() {
    return this.prisma.newsCategory.findMany({
      where: {
        isActive: true,
        articles: { some: this.publicWhere() }
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
  }

  async createCategory(user: AuthUser, dto: CreateNewsCategoryDto) {
    const slug = await this.uniqueCategorySlug(dto.slug || dto.name);
    const created = await this.prisma.newsCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      }
    });
    await this.audit.record({ user, action: 'news_categories.create', entity: 'NewsCategory', entityId: created.id });
    return created;
  }

  async updateCategory(user: AuthUser, id: string, dto: UpdateNewsCategoryDto) {
    const existing = await this.prisma.newsCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy danh mục tin tức');
    const updated = await this.prisma.newsCategory.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug ? await this.uniqueCategorySlug(dto.slug, id) : undefined,
        description: dto.description,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive
      }
    });
    await this.audit.record({ user, action: 'news_categories.update', entity: 'NewsCategory', entityId: id });
    return updated;
  }

  async list(query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.NewsArticleWhereInput = {};
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (query.status) where.status = String(query.status) as NewsStatus;
    if (query.categoryId) where.categoryId = String(query.categoryId);

    const [data, total] = await Promise.all([
      this.prisma.newsArticle.findMany({
        where,
        include: this.articleIncludes(),
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.newsArticle.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async publicList(query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.NewsArticleWhereInput = this.publicWhere();
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (query.category) where.category = { slug: String(query.category), isActive: true };
    if (query.featured !== undefined) where.isFeatured = String(query.featured) === 'true';
    if (query.home !== undefined) where.showOnHome = String(query.home) === 'true';

    const [data, total] = await Promise.all([
      this.prisma.newsArticle.findMany({
        where,
        include: this.articleIncludes(),
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      this.prisma.newsArticle.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(id: string) {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id },
      include: this.articleIncludes()
    });
    if (!article) throw new NotFoundException('Không tìm thấy bài viết');
    return article;
  }

  async publicDetail(slug: string) {
    const article = await this.prisma.newsArticle.findFirst({
      where: {
        slug,
        ...this.publicWhere()
      },
      include: this.articleIncludes()
    });
    if (!article) throw new NotFoundException('Không tìm thấy bài viết public');
    await this.prisma.newsArticle.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });
    return article;
  }

  async create(user: AuthUser, dto: CreateNewsArticleDto) {
    await this.assertCategory(dto.categoryId);
    const normalized = this.normalizeArticle(dto);
    const slug = await this.uniqueArticleSlug(dto.slug || dto.title);
    const created = await this.prisma.newsArticle.create({
      data: {
        ...normalized,
        slug,
        authorId: user.id
      },
      include: this.articleIncludes()
    });
    await this.audit.record({
      user,
      action: created.status === NewsStatus.PUBLISHED ? 'news.publish' : 'news.create',
      entity: 'NewsArticle',
      entityId: created.id,
      metadata: { status: created.status }
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateNewsArticleDto) {
    const existing = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy bài viết');
    await this.assertCategory(dto.categoryId);
    const normalized = this.normalizeArticle(dto, existing);
    const updated = await this.prisma.newsArticle.update({
      where: { id },
      data: {
        ...normalized,
        slug: dto.slug ? await this.uniqueArticleSlug(dto.slug, id) : undefined
      },
      include: this.articleIncludes()
    });
    await this.audit.record({
      user,
      action: updated.status === NewsStatus.PUBLISHED && existing.status !== NewsStatus.PUBLISHED ? 'news.publish' : 'news.update',
      entity: 'NewsArticle',
      entityId: id,
      metadata: { status: updated.status }
    });
    return updated;
  }

  async archive(user: AuthUser, id: string) {
    const existing = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy bài viết');
    const updated = await this.prisma.newsArticle.update({
      where: { id },
      data: { status: NewsStatus.ARCHIVED },
      include: this.articleIncludes()
    });
    await this.audit.record({ user, action: 'news.archive', entity: 'NewsArticle', entityId: id });
    return updated;
  }

  private normalizeArticle(dto: CreateNewsArticleDto): NormalizedNewsArticleCreate;
  private normalizeArticle(
    dto: UpdateNewsArticleDto,
    existing: { status: NewsStatus; publishedAt: Date | null }
  ): Prisma.NewsArticleUncheckedUpdateInput;
  private normalizeArticle(
    dto: CreateNewsArticleDto | UpdateNewsArticleDto,
    existing?: { status: NewsStatus; publishedAt: Date | null }
  ): NormalizedNewsArticleCreate | Prisma.NewsArticleUncheckedUpdateInput {
    const status = dto.status;
    const title = dto.title;
    const bodyHtml = dto.bodyHtml === undefined ? undefined : cleanNewsHtml(dto.bodyHtml);
    const seoScore = this.seoScore({
      title: dto.title,
      slug: dto.slug,
      seoTitle: dto.seoTitle ?? (status === NewsStatus.PUBLISHED ? dto.title : undefined),
      seoDescription: dto.seoDescription,
      focusKeyword: dto.focusKeyword,
      bodyHtml: dto.bodyHtml,
      coverImageAlt: dto.coverImageAlt
    });
    if (!existing && (!title || !bodyHtml)) {
      throw new BadRequestException('Tiêu đề và nội dung bài viết không được để trống');
    }
    if (dto.bodyHtml !== undefined && !bodyHtml) {
      throw new BadRequestException('Nội dung bài viết không được để trống sau khi lọc HTML');
    }

    const data = {
      categoryId: dto.categoryId,
      title,
      excerpt: dto.excerpt,
      bodyHtml,
      coverImageUrl: dto.coverImageUrl,
      coverImageAlt: dto.coverImageAlt,
      status,
      isFeatured: dto.isFeatured,
      showOnHome: dto.showOnHome,
      focusKeyword: dto.focusKeyword,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      canonicalUrl: dto.canonicalUrl,
      robotsNoIndex: dto.robotsNoIndex,
      robotsNoFollow: dto.robotsNoFollow,
      ogTitle: dto.ogTitle,
      ogDescription: dto.ogDescription,
      ogImageUrl: dto.ogImageUrl,
      twitterTitle: dto.twitterTitle,
      twitterDescription: dto.twitterDescription,
      twitterImageUrl: dto.twitterImageUrl,
      tagsJson: dto.tags ? dto.tags : undefined,
      seoScore: Object.values(dto).some((value) => value !== undefined) ? seoScore : undefined,
      readabilityScore: bodyHtml ? this.readabilityScore(bodyHtml) : undefined,
      publishedAt:
        dto.publishedAt ??
        (status === NewsStatus.PUBLISHED && !existing?.publishedAt ? new Date() : undefined),
      scheduledAt: dto.scheduledAt,
      schemaType: dto.schemaType && ALLOWED_SCHEMA_TYPES.has(dto.schemaType) ? dto.schemaType : DEFAULT_SCHEMA_TYPE
    };
    if (!existing) {
      return {
        ...data,
        title: title!,
        bodyHtml: bodyHtml!
      } satisfies NormalizedNewsArticleCreate;
    }
    return data satisfies Prisma.NewsArticleUncheckedUpdateInput;
  }

  private articleIncludes() {
    return {
      category: true,
      author: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      }
    } as const;
  }

  private publicWhere(): Prisma.NewsArticleWhereInput {
    const now = new Date();
    return {
      status: NewsStatus.PUBLISHED,
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
        { OR: [{ categoryId: null }, { category: { isActive: true } }] }
      ]
    };
  }

  private async assertCategory(categoryId?: string) {
    if (!categoryId) return;
    const category = await this.prisma.newsCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Danh mục tin tức không tồn tại');
  }

  private async uniqueArticleSlug(input: string, ignoreId?: string) {
    return this.uniqueSlug(input, async (slug) => {
      const found = await this.prisma.newsArticle.findUnique({ where: { slug } });
      return !found || found.id === ignoreId;
    });
  }

  private async uniqueCategorySlug(input: string, ignoreId?: string) {
    return this.uniqueSlug(input, async (slug) => {
      const found = await this.prisma.newsCategory.findUnique({ where: { slug } });
      return !found || found.id === ignoreId;
    });
  }

  private async uniqueSlug(input: string, isAvailable: (slug: string) => Promise<boolean>) {
    const base = slugify(input) || 'bai-viet';
    for (let index = 0; index < 1000; index += 1) {
      const candidate = index === 0 ? base : `${base}-${index + 1}`;
      if (await isAvailable(candidate)) return candidate;
    }
    throw new BadRequestException('Không thể tạo slug không trùng');
  }

  private seoScore(input: {
    title?: string;
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
    bodyHtml?: string;
    coverImageAlt?: string;
  }) {
    let score = 0;
    const keyword = input.focusKeyword?.trim().toLowerCase();
    const seoTitleLength = input.seoTitle?.trim().length ?? 0;
    const descriptionLength = input.seoDescription?.trim().length ?? 0;
    if (seoTitleLength >= 30 && seoTitleLength <= 70) score += 20;
    else if (seoTitleLength) score += 8;
    if (descriptionLength >= 120 && descriptionLength <= 170) score += 20;
    else if (descriptionLength) score += 8;
    if (keyword) {
      const title = `${input.title ?? ''} ${input.seoTitle ?? ''}`.toLowerCase();
      const slug = (input.slug ?? slugify(input.title ?? '')).toLowerCase();
      const description = (input.seoDescription ?? '').toLowerCase();
      const body = stripHtml(input.bodyHtml ?? '').toLowerCase();
      if (title.includes(keyword)) score += 15;
      if (slug.includes(slugify(keyword))) score += 15;
      if (description.includes(keyword)) score += 15;
      if (body.includes(keyword)) score += 10;
    }
    if (input.coverImageAlt?.trim()) score += 5;
    return Math.min(score, 100);
  }

  private readabilityScore(bodyHtml: string) {
    const text = stripHtml(bodyHtml);
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = Math.max(text.split(/[.!?]+/).filter(Boolean).length, 1);
    if (!words) return 0;
    const avgWords = words / sentences;
    if (avgWords <= 18) return 90;
    if (avgWords <= 28) return 75;
    if (avgWords <= 40) return 55;
    return 35;
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanNewsHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      'p',
      'br',
      'h2',
      'h3',
      'h4',
      'strong',
      'b',
      'em',
      'i',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'figure',
      'figcaption',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'loading', 'width', 'height'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true)
    }
  }).trim();
}
