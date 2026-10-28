import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from './msalInstance';
import { apiScope } from './msalConfig';

let interaction: Promise<void> | undefined;
export async function acquireApiAccessToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  const account = msalInstance.getActiveAccount() ?? (accounts.length === 1 ? accounts[0] : undefined);
  if (!account) throw new Error('Sign in to SecurePulse before requesting an assessment');
  const request = { account, scopes: [apiScope] };
  try {
    const result = await msalInstance.acquireTokenSilent(request);
    if (!result.accessToken) throw new Error('Application access token unavailable');
    return result.accessToken; // Never use result.idToken or a Graph token fallback.
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      interaction ??= msalInstance.acquireTokenRedirect(request).finally(() => { interaction = undefined; });
      await interaction;
    }
    throw new Error('SecurePulse API authorization is required; sign in again');
  }
}
