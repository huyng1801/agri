import { NewsSite, NewsStatus, RoleSlug } from '@prisma/client';
import { NewsService } from './news.service';

describe('NewsService', () => {
  const user = {
    id: 'super-admin',
    email: 'admin@example.com',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['news.create']
  };

  it('sanitizes article HTML before saving public content', async () => {
    const create = jest.fn(({ data }) => ({
      id: 'article-1',
      ...data,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: null,
      author: { id: user.id, email: user.email, fullName: user.fullName }
    }));
    const service = new NewsService(
      {
        newsArticle: {
          findUnique: jest.fn().mockResolvedValue(null),
          create
        },
        newsCategory: {
          findUnique: jest.fn()
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.create(user, {
      title: 'Tin kiểm thử bảo mật',
      bodyHtml:
        '<p>Nội dung an toàn</p><script>alert(1)</script><img src="javascript:alert(1)" onerror="bad" /><a href="https://htxonline.vn" onclick="bad">HTXONLINE</a>',
      status: NewsStatus.PUBLISHED
    });

    const savedHtml = create.mock.calls[0][0].data.bodyHtml as string;
    expect(savedHtml).toContain('<p>Nội dung an toàn</p>');
    expect(savedHtml).toContain('rel="noopener noreferrer"');
    expect(savedHtml).not.toContain('<script>');
    expect(savedHtml).not.toContain('javascript:');
    expect(savedHtml).not.toContain('onerror');
    expect(savedHtml).not.toContain('onclick');
  });

  it('deletes an unused news category and audits the cleanup', async () => {
    const remove = jest.fn().mockResolvedValue({ id: 'category-1' });
    const record = jest.fn();
    const service = new NewsService(
      {
        newsCategory: {
          findUnique: jest.fn().mockResolvedValue({ id: 'category-1', _count: { articles: 0 } }),
          delete: remove
        }
      } as never,
      { record } as never
    );

    await service.removeCategory(user, 'category-1');

    expect(remove).toHaveBeenCalledWith({ where: { id: 'category-1' } });
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ action: 'news_categories.delete', entityId: 'category-1' }));
  });

  it('deactivates a news category that still has articles', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'category-1', isActive: false });
    const service = new NewsService(
      {
        newsCategory: {
          findUnique: jest.fn().mockResolvedValue({ id: 'category-1', _count: { articles: 2 } }),
          update
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.removeCategory(user, 'category-1');

    expect(update).toHaveBeenCalledWith({ where: { id: 'category-1' }, data: { isActive: false } });
  });

  it('scopes public news to the requested website', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const service = new NewsService(
      {
        newsArticle: { findMany, count }
      } as never,
      { record: jest.fn() } as never
    );

    await service.publicList({ siteKey: 'PASSPORT', limit: '12' });

    expect(findMany.mock.calls[0][0].where).toEqual(expect.objectContaining({ siteKey: NewsSite.PASSPORT }));
    expect(count.mock.calls[0][0].where).toEqual(expect.objectContaining({ siteKey: NewsSite.PASSPORT }));
  });

  it('rejects an unknown public website instead of falling back across sites', async () => {
    const service = new NewsService(
      { newsArticle: { findMany: jest.fn(), count: jest.fn() } } as never,
      { record: jest.fn() } as never
    );

    await expect(service.publicList({ siteKey: 'UNKNOWN' })).rejects.toThrow('Website tin tức không hợp lệ');
  });
});
