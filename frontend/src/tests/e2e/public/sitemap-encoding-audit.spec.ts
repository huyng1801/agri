import { expect, test } from '@playwright/test';
import { baseUrls } from '../helpers/auth';

const mojibakePattern = /(?:\u00c3|\u00c2|\u00c4|\u00c5|\u00c6)[\u0080-\u00ff]|\ufffd/;
const disallowedPublicTestTokens = ['gao-smoke', 'gao-rbac', 'security-product', 'smoke-1783112209', 'rbac-1783134099', 'rbac-1783134144', 'sec-1783131525'];

test.describe('public sitemap encoding audit', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Sitemap audit runs once on desktop chromium');
  });

  test('all sitemap public urls keep Vietnamese text intact', async ({ page, request }) => {
    test.setTimeout(10 * 60 * 1000);

    const { publicUrl } = baseUrls();
    const sitemapUrl = joinUrl(publicUrl, '/sitemap.xml');
    const response = await request.get(sitemapUrl);
    expect(response.ok(), `sitemap should load: ${sitemapUrl}`).toBeTruthy();

    const xml = await response.text();
    const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1]).filter((url) =>
      url.startsWith(publicUrl.replace(/\/$/, ''))
    );

    expect(urls.length).toBeGreaterThan(0);
    const lowerCaseUrls = urls.map((url) => url.toLowerCase());

    for (const token of disallowedPublicTestTokens) {
      expect.soft(lowerCaseUrls, `sitemap should not expose test artifact token: ${token}`).not.toContainEqual(
        expect.stringContaining(token)
      );
    }

    for (const url of urls) {
      await gotoWithRetry(page, url);
      await page.waitForTimeout(150);

      const [html, text] = await Promise.all([page.content(), page.locator('body').innerText()]);
      expect.soft(html, `${url} html should not contain mojibake`).not.toMatch(mojibakePattern);
      expect.soft(text, `${url} text should not contain mojibake`).not.toMatch(mojibakePattern);

      const searchableContent = `${url}\n${text}`.toLowerCase();
      for (const token of disallowedPublicTestTokens) {
        expect.soft(searchableContent, `${url} should not expose test artifact token: ${token}`).not.toContain(token);
      }
    }
  });
});

async function gotoWithRetry(page: import('@playwright/test').Page, url: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // Third-party media and analytics should not hold a content audit open.
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(250 * (attempt + 1));
    }
  }
  throw lastError;
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}
