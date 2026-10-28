import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const fixture = vi.hoisted(() => ({
  scope: 'api://44444444-4444-4444-8444-444444444444/user_impersonation',
  account: { homeAccountId: 'local-test-account', tenantId: '11111111-1111-4111-8111-111111111111' },
  getAllAccounts: vi.fn(), getActiveAccount: vi.fn(), acquireTokenSilent: vi.fn(), acquireTokenRedirect: vi.fn(),
}));
vi.mock('./msalInstance', () => ({ msalInstance: fixture }));
vi.mock('./msalConfig', () => ({ apiScope: fixture.scope }));
import { acquireApiAccessToken } from './apiToken';

describe('application API access-token acquisition', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fixture.getAllAccounts.mockReturnValue([fixture.account]);
    fixture.getActiveAccount.mockReturnValue(null);
  });
  it('requests only the application scope and returns accessToken, never idToken', async () => {
    fixture.acquireTokenSilent.mockResolvedValue({ accessToken: 'local-api-access-token', idToken: 'local-id-token' });
    expect(await acquireApiAccessToken()).toBe('local-api-access-token');
    expect(fixture.acquireTokenSilent).toHaveBeenCalledWith({ account: fixture.account, scopes: [fixture.scope] });
  });
  it('does not fall back to an ID token when the access token is missing', async () => {
    fixture.acquireTokenSilent.mockResolvedValue({ accessToken: '', idToken: 'local-id-token' });
    await expect(acquireApiAccessToken()).rejects.toThrow();
  });
  it('fails closed when there is no account or an ambiguous account selection', async () => {
    for (const accounts of [[], [fixture.account, { ...fixture.account, homeAccountId: 'other' }]]) {
      fixture.getAllAccounts.mockReturnValue(accounts);
      await expect(acquireApiAccessToken()).rejects.toThrow();
    }
    expect(fixture.acquireTokenSilent).not.toHaveBeenCalled();
  });
  it('starts one application-scope interaction when required, never a Graph fallback', async () => {
    fixture.acquireTokenSilent.mockRejectedValue(new InteractionRequiredAuthError('interaction_required'));
    fixture.acquireTokenRedirect.mockResolvedValue(undefined);
    await expect(acquireApiAccessToken()).rejects.toThrow();
    expect(fixture.acquireTokenRedirect).toHaveBeenCalledWith({ account: fixture.account, scopes: [fixture.scope] });
  });
  it('does not start consent on unrelated acquisition errors', async () => {
    fixture.acquireTokenSilent.mockRejectedValue(new Error('offline test fixture'));
    await expect(acquireApiAccessToken()).rejects.toThrow();
    expect(fixture.acquireTokenRedirect).not.toHaveBeenCalled();
  });
});
