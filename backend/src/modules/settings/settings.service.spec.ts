import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns default public site profile when settings are missing', async () => {
    const service = new SettingsService(
      {
        setting: {
          findUnique: jest.fn().mockResolvedValue(null)
        }
      } as never,
      { record: jest.fn() } as never,
      { testConnection: jest.fn() } as never
    );

    const profile = await service.publicSiteProfile();

    expect(profile.appName).toBe('HTXONLINE');
    expect(profile.hotline).toBe('0907001200');
    expect(profile.supportEmail).toBe('Agripassport@gmail.com');
    expect(profile.faqs.length).toBeGreaterThan(0);
  });

  it('merges configured public site profile values', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce({
        key: 'public.siteProfile',
        value: {
          appName: 'HTXONLINE Premium',
          hotline: '0988000111',
          hotlineDisplay: '0988 000 111',
          supportEmail: 'care@htxonline.vn',
          address: 'Can Tho',
          zaloUrl: 'https://zalo.me/0988000111',
          faqs: [{ question: 'Q1', answer: 'A1' }]
        }
      })
      .mockResolvedValueOnce({
        key: 'system.profile',
        value: {
          supportEmail: 'fallback@htxonline.vn'
        }
      });
    const service = new SettingsService(
      {
        setting: {
          findUnique
        }
      } as never,
      { record: jest.fn() } as never,
      { testConnection: jest.fn() } as never
    );

    const profile = await service.publicSiteProfile();

    expect(profile).toMatchObject({
      appName: 'HTXONLINE Premium',
      hotline: '0988000111',
      hotlineDisplay: '0988 000 111',
      supportEmail: 'care@htxonline.vn',
      address: 'Can Tho',
      zaloUrl: 'https://zalo.me/0988000111'
    });
    expect(profile.faqs).toEqual([{ question: 'Q1', answer: 'A1' }]);
  });

  it('normalizes legacy public copy in configured values', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce({
        key: 'public.siteProfile',
        value: {
          address: 'Số 130, Tổ 8',
          faqs: [{ question: 'Người mua có cần đăng nhập để xem QR?', answer: 'Không. QR Passport public được mở trực tiếp.' }],
          pageContent: {
            homeDescription: 'Công khai sản phẩm và publish QR Passport public cho người mua.'
          }
        }
      })
      .mockResolvedValueOnce(null);
    const service = new SettingsService(
      {
        setting: {
          findUnique
        }
      } as never,
      { record: jest.fn() } as never,
      { testConnection: jest.fn() } as never
    );

    const profile = await service.publicSiteProfile();

    expect(profile.faqs[0]?.answer).toBe('Không. QR Passport công khai được mở trực tiếp.');
    expect(profile.pageContent.homeDescription).toContain('đăng công khai QR Passport công khai');
  });
});
