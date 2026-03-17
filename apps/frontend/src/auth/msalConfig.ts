import type { Configuration, RedirectRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env['VITE_ENTRA_CLIENT_ID'] ?? '',
    authority: `https://login.microsoftonline.com/${import.meta.env['VITE_ENTRA_TENANT_ID'] ?? 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email', `api://${import.meta.env['VITE_ENTRA_CLIENT_ID'] ?? ''}/user_impersonation`],
};
