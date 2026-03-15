import { PublicClientApplication, Configuration, LogLevel } from '@azure/msal-browser';

const clientId = import.meta.env['VITE_ENTRA_CLIENT_ID'];
const tenantId = import.meta.env['VITE_ENTRA_TENANT_ID'];

if (!clientId) throw new Error('VITE_ENTRA_CLIENT_ID is required');
if (!tenantId) throw new Error('VITE_ENTRA_TENANT_ID is required');

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: import.meta.env['VITE_ENTRA_REDIRECT_URI'] ?? window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, hasPii) => {
        if (hasPii) return;
        if (import.meta.env['DEV']) {
          // eslint-disable-next-line no-console
          console.log(`[MSAL] ${LogLevel[level]}: ${message}`);
        }
      },
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};
