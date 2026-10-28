import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const acquire = vi.hoisted(() => vi.fn());
vi.mock('../auth/apiToken', () => ({ acquireApiAccessToken: acquire }));
import { assessmentApi } from './api';

describe('core API boundary', () => {
  const fetcher = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetcher);
    acquire.mockResolvedValue('local-application-access-token');
    fetcher.mockResolvedValue({ ok: true, json: async () => ({ data: [], error: null }) });
  });
  afterEach(() => { vi.unstubAllGlobals(); });
  it('attaches the application access token to each core request and refuses redirects', async () => {
    await assessmentApi.getHistory('tenant-A');
    expect(acquire).toHaveBeenCalledOnce();
    const [, init] = fetcher.mock.calls[0];
    expect(init.headers.get('Authorization')).toBe('Bearer local-application-access-token');
    expect(init.redirect).toBe('error');
  });
  it('makes no HTTP request if application authorization fails', async () => {
    acquire.mockRejectedValue(new Error('Application authorization required'));
    const result = await assessmentApi.refresh('tenant-A');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Application authorization required');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('surfaces denial without retrying anonymously or swapping credentials', async () => {
    fetcher.mockResolvedValue({ ok: false, status: 403, json: async () => ({ data: null, error: 'Forbidden' }) });
    expect((await assessmentApi.getCurrent('tenant-A')).error).toBe('Forbidden');
    expect(fetcher).toHaveBeenCalledOnce();
    expect(acquire).toHaveBeenCalledOnce();
  });
});
