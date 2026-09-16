import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '@/lib/api';

describe('authenticated API session handling', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('refreshes an expired access token and retries the original request with the new token', async () => {
    window.localStorage.setItem('agri_access_token', 'expired-access');
    window.localStorage.setItem('agri_refresh_token', 'valid-refresh');
    const fetchMock = vi.spyOn(window, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: 'Access token không hợp lệ hoặc đã hết hạn' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { accessToken: 'new-access', refreshToken: 'new-refresh', user: { id: 'u1' } } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 }));

    await expect(apiFetch<{ ok: boolean }>('/trees')).resolves.toMatchObject({ data: { ok: true } });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: expect.any(Headers) });
    expect((fetchMock.mock.calls[0][1]?.headers as Headers).get('Authorization')).toBe('Bearer expired-access');
    expect((fetchMock.mock.calls[0][1]?.headers as Headers).get('X-Client-Portal')).toBe('AGRIPASSPORT');
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ refreshToken: 'valid-refresh' });
    expect((fetchMock.mock.calls[2][1]?.headers as Headers).get('Authorization')).toBe('Bearer new-access');
    expect(window.localStorage.getItem('agri_access_token')).toBe('new-access');
    expect(window.localStorage.getItem('agri_refresh_token')).toBe('new-refresh');
  });

  it('can refresh from the httpOnly cookie when the dashboard crossed a subdomain', async () => {
    const fetchMock = vi.spyOn(window, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: 'Access token không hợp lệ hoặc đã hết hạn' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { accessToken: 'cookie-access', refreshToken: 'cookie-refresh', user: { id: 'u1' } } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 }));

    await expect(apiFetch<{ ok: boolean }>('/trees')).resolves.toMatchObject({ data: { ok: true } });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({});
    expect((fetchMock.mock.calls[1][1]?.headers as Headers).get('X-Client-Portal')).toBe('AGRIPASSPORT');
  });

  it('keeps the browser multipart boundary for FormData uploads', async () => {
    const fetchMock = vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { id: 'file-1', publicUrl: 'https://cdn.example/file.webp' } }), { status: 200 })
    );
    const body = new FormData();
    body.append('file', new Blob(['image-data'], { type: 'image/webp' }), 'cover.webp');

    await expect(apiFetch('/files/upload', { method: 'POST', body })).resolves.toMatchObject({ data: { id: 'file-1' } });

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get('Content-Type')).toBeNull();
    expect(fetchMock.mock.calls[0][1]?.body).toBe(body);
  });
});
