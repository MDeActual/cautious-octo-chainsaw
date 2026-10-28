import type { Configuration, RedirectRequest } from '@azure/msal-browser';
import { applicationScope } from './apiScope';

export const apiScope = applicationScope(import.meta.env['VITE_API_SCOPE']);

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env['VITE_ENTRA_CLIENT_ID'] ?? '',
    authority: `https://login.microsoftonline.com/${import.meta.env['VITE_ENTRA_TENANT_ID'] ?? 'organizations'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email', apiScope],
};
