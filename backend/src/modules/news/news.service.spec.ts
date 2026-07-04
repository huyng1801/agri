import { NewsStatus, RoleSlug } from '@prisma/client';
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
});
