import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';

type AccountCache = Pick<IPublicClientApplication, 'getAllAccounts' | 'getActiveAccount'>;

/** Dashboard tenant and API token acquisition must use the same selection.
 * Multiple cached accounts without a selection require interactive sign-in.
 */
export function selectedAccount(instance: AccountCache): AccountInfo | null {
  const accounts = instance.getAllAccounts();
  const active = instance.getActiveAccount();
  if (active) {
    return accounts.find(account => account.homeAccountId === active.homeAccountId
      && account.localAccountId === active.localAccountId && account.tenantId === active.tenantId) ?? null;
  }
  return accounts.length === 1 ? accounts[0] : null;
}
