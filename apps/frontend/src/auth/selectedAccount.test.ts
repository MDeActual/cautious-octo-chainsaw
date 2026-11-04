import { describe, expect, it } from 'vitest';
import type { AccountInfo } from '@azure/msal-browser';
import { selectedAccount } from './selectedAccount';

const A = { homeAccountId: 'a', localAccountId: 'oid-a', tenantId: 'tenant-a' } as AccountInfo;
const B = { homeAccountId: 'b', localAccountId: 'oid-b', tenantId: 'tenant-b' } as AccountInfo;
const cache = (accounts: AccountInfo[], active: AccountInfo | null = null) => ({
  getAllAccounts: () => accounts, getActiveAccount: () => active,
});
describe('shared dashboard and API account selection', () => {
  it('requires sign-in for an empty or ambiguous cache', () => {
    expect(selectedAccount(cache([]))).toBeNull();
    expect(selectedAccount(cache([A, B]))).toBeNull();
  });
  it('uses the explicitly selected account even when it is not first', () => {
    expect(selectedAccount(cache([A, B], B))).toBe(B);
  });
  it('can resume a single cached account', () => {
    expect(selectedAccount(cache([A]))).toBe(A);
  });
  it('does not reuse a stale selection or another tenant profile for the same home account', () => {
    expect(selectedAccount(cache([A], B))).toBeNull();
    expect(selectedAccount(cache([A], { ...A, tenantId: 'different-tenant' }))).toBeNull();
  });
});
