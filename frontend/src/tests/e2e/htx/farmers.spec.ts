import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession } from '../helpers/auth';

test.describe('htx farmers dashboard', () => {
  test('@htx @form @crud farmer create edit lock and cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; body?: Record<string, unknown> }> = [];
    let farmer = {
      id: 'farmer-seed',
      email: 'farmer-seed@example.com',
      fullName: 'Nông dân mẫu',
      phone: '0907001200',
      status: 'ACTIVE',
      roles: ['FARMER'],
      cooperativeId: 'e2e-cooperative-id',
      farmerProfile: { assignedZoneIds: ['zone-1'] },
      farmerSummary: {
        assignedZoneCount: 1,
        areaM2: 12500,
        zonesWithArea: 1,
        treeCount: 7,
        varieties: [{ cropTypeName: 'Xoài', variety: 'Cát Chu', treeCount: 7 }],
        certifications: [{ id: 'cert-1', name: 'VietGAP', issuer: 'Tổ chức chứng nhận', issuedAt: '2026-02-01T00:00:00.000Z', expiresAt: '2027-02-01T00:00:00.000Z', isPublic: true, zoneName: 'Vườn mẫu' }],
        seasonalProduction: [{ seasonId: 'season-1', seasonName: 'Vụ 2026', harvestCount: 3, recordedMassKg: 2500, otherUnits: [] }]
      },
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    };

    await page.route('**/api/v1/zones**', async (route) => {
      await route.fulfill(jsonEnvelope([{ id: 'zone-1', code: 'V01', name: 'Vườn mẫu', areaM2: 12500, status: 'ACTIVE' }]));
    });

    await page.route('**/api/v1/public/farmers/farmer-seed', async (route) => {
      await route.fulfill(jsonEnvelope({
        publicUrl: 'https://hochieunongnghiep.com/nong-ho/farmer-seed',
        qrDataUrl: 'data:image/png;base64,cXItZGF0YQ==',
        farmer: { fullName: 'Nông dân mẫu', cooperative: { name: 'HTX mẫu', code: 'HTX-MAU' }, summary: farmer.farmerSummary }
      }));
    });

    await page.route('**/api/v1/users**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/roles') && method === 'GET') {
        await route.fulfill(jsonEnvelope([{ id: 'role-farmer', slug: 'FARMER', name: 'Nông dân' }]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [farmer], meta: { page: 1, limit: 100, total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, body });
      if (method === 'POST') farmer = { ...farmer, id: 'farmer-e2e', ...body, roles: ['FARMER'], farmerProfile: { assignedZoneIds: (body?.assignedZoneIds as string[]) ?? [] } } as typeof farmer;
      if (method === 'PATCH') farmer = { ...farmer, ...body, farmerProfile: { assignedZoneIds: (body?.assignedZoneIds as string[]) ?? farmer.farmerProfile.assignedZoneIds } } as typeof farmer;
      if (method === 'DELETE') farmer = { ...farmer, status: 'INACTIVE' };
      await route.fulfill(jsonEnvelope(farmer));
    });

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/farmers`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Nông dân', { timeout: 45_000 });
    await expect(page.getByTestId('farmer-production-summary')).toContainText('1,25 ha');
    await expect(page.getByTestId('farmer-production-summary')).toContainText('Xoài · Cát Chu');
    await expect(page.getByTestId('farmer-production-summary')).toContainText('2,5 t');
    await expect(page.getByTestId('farmer-production-summary')).toContainText('VietGAP');
    await page.getByTestId('farmer-qr-button-farmer-seed').click();
    await expect(page.getByRole('dialog')).toContainText('Nông dân mẫu');
    await expect(page.getByRole('img', { name: 'QR hồ sơ nông hộ Nông dân mẫu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mở hồ sơ' })).toHaveAttribute('href', 'https://hochieunongnghiep.com/nong-ho/farmer-seed');
    await page.getByRole('button', { name: 'Đóng mã QR cá nhân' }).click();
    await page.getByTestId('farmer-create-button').click();
    await page.getByTestId('farmer-name-input').fill('Nông dân E2E');
    await page.getByTestId('farmer-email-input').fill('farmer-e2e@example.com');
    await page.getByTestId('farmer-password-input').fill('StrongPass123!');
    await page.getByTestId('farmer-phone-input').fill('0912345678');
    await page.getByTestId('farmer-zone-checkbox-zone-1').check();
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    await page.getByTestId('farmer-name-input').fill('Nông dân E2E đã sửa');
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Khóa' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(2);
    await page.getByRole('button', { name: 'Ngừng' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'PATCH', 'DELETE']);
    expect(mutations[0].body).toMatchObject({ fullName: 'Nông dân E2E', email: 'farmer-e2e@example.com', role: 'FARMER', assignedZoneIds: ['zone-1'] });
    expect(mutations[1].body).toMatchObject({ fullName: 'Nông dân E2E đã sửa', assignedZoneIds: ['zone-1'] });
    expect(mutations[2].body).toMatchObject({ status: 'LOCKED' });
  });

  test('@htx farmer voice recording requires consent, can preview, upload, and playback saved notes', async ({ page }) => {
    const { htxUrl } = baseUrls();
    let savedRecordings: Array<Record<string, unknown>> = [];
    let uploadCount = 0;

    await page.addInitScript(() => {
      class FakeMediaRecorder {
        static isTypeSupported() { return true; }
        state: 'inactive' | 'recording' = 'inactive';
        mimeType = 'audio/webm';
        ondataavailable: ((event: { data: Blob }) => void) | null = null;
        onstop: (() => void) | null = null;
        onerror: (() => void) | null = null;
        start() { this.state = 'recording'; }
        stop() {
          this.state = 'inactive';
          this.ondataavailable?.({ data: new Blob(['test voice recording'], { type: this.mimeType }) });
          this.onstop?.();
        }
      }
      Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: FakeMediaRecorder });
      class FakeSpeechRecognition {
        lang = '';
        continuous = false;
        interimResults = false;
        onresult: ((event: unknown) => void) | null = null;
        onerror: ((event: unknown) => void) | null = null;
        onend: (() => void) | null = null;
        start() {
          this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'Nông dân muốn ghi nhật ký' } }] });
        }
        stop() {}
      }
      Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeSpeechRecognition });
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) }
      });
    });

    await page.route('**/api/v1/users/farmer-voice/voice-recordings**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill(jsonEnvelope(savedRecordings));
        return;
      }
      if (route.request().method() === 'POST') {
        const contentType = route.request().headers()['content-type'] || '';
        const multipart = route.request().postDataBuffer()?.toString() || '';
        expect(contentType).toContain('multipart/form-data');
        expect(multipart).toContain('consentConfirmed');
        expect(multipart).toContain('true');
        expect(multipart).toContain('Trao đổi kế hoạch vụ xoài');
        expect(multipart).toContain('Nông dân muốn ghi nhật ký');
        uploadCount += 1;
        savedRecordings = [{
          id: 'voice-note-1',
          title: 'Trao đổi kế hoạch vụ xoài',
          durationSeconds: 1,
          consentedAt: '2026-09-18T05:00:00.000Z',
          createdAt: '2026-09-18T05:00:00.000Z',
          transcript: 'Nông dân muốn ghi nhật ký',
          downloadUrl: 'https://storage.example.test/private-voice.webm?signature=test',
          recordedBy: { id: 'e2e-htx-admin', fullName: 'Admin HTX E2E' }
        }];
        await route.fulfill(jsonEnvelope(savedRecordings[0]));
        return;
      }
      await route.fulfill(jsonEnvelope({ deleted: true }));
    });

    await page.route('**/api/v1/users/roles', async (route) => {
      await route.fulfill(jsonEnvelope([{ id: 'role-farmer', slug: 'FARMER', name: 'Nông dân' }]));
    });
    await page.route('**/api/v1/users?**', async (route) => {
      await route.fulfill(jsonEnvelope({
        data: [{
          id: 'farmer-voice',
          email: 'farmer-voice@example.com',
          fullName: 'Nông dân ghi âm',
          phone: null,
          status: 'ACTIVE',
          roles: ['FARMER'],
          cooperativeId: 'e2e-cooperative-id',
          cooperative: { id: 'e2e-cooperative-id', name: 'HTX mẫu', code: 'HTX-MAU' },
          farmerProfile: { assignedZoneIds: [] },
          farmerSummary: null,
          createdAt: '2026-09-01T00:00:00.000Z',
          updatedAt: '2026-09-01T00:00:00.000Z'
        }],
        meta: { page: 1, limit: 100, total: 1 }
      }));
    });

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/farmers`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('farmer-record-button-farmer-voice')).toBeVisible({ timeout: 45_000 });
    await page.getByTestId('farmer-record-button-farmer-voice').click();
    await expect(page.getByRole('dialog')).toContainText('không xuất hiện trên QR cá nhân');
    await expect(page.getByTestId('farmer-recording-start')).toBeDisabled();
    await page.getByTestId('farmer-recording-consent').check();
    await expect(page.getByTestId('farmer-recording-start')).toBeEnabled();
    await page.getByTestId('farmer-recording-start').click();
    await expect(page.getByTestId('farmer-recording-stop')).toBeVisible();
    await page.getByTestId('farmer-recording-stop').click();
    await expect(page.getByLabel('Nghe thử bản ghi âm')).toBeVisible();
    await page.getByPlaceholder('Ví dụ: Trao đổi kế hoạch vụ xoài').fill('Trao đổi kế hoạch vụ xoài');
    await page.getByTestId('farmer-recording-transcript').fill('Nông dân muốn ghi nhật ký');
    await page.getByTestId('farmer-recording-save').click();
    await expect(page.getByText('Trao đổi kế hoạch vụ xoài')).toBeVisible();
    await expect.poll(() => uploadCount).toBe(1);
    await expect(page.getByLabel('Nghe Trao đổi kế hoạch vụ xoài')).toBeVisible();
    await expect(page.getByTestId('farmer-recording-transcript-voice-note-1')).toContainText('Nông dân muốn ghi nhật ký');
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
