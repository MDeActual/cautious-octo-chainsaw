import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const clientId = import.meta.env['VITE_ENTRA_CLIENT_ID'];

async function bootstrap(): Promise<void> {
  if (clientId) {
    // Production mode: full MSAL auth
    const { MsalProvider } = await import('@azure/msal-react');
    const { PublicClientApplication } = await import('@azure/msal-browser');
    const { msalConfig } = await import('./auth/msalConfig');
    const { default: App } = await import('./App');

    const msalInstance = new PublicClientApplication(msalConfig);

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </React.StrictMode>,
    );
  } else {
    // Dev mode: skip MSAL, show dashboard directly
    const { default: DevApp } = await import('./DevApp');

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <DevApp />
      </React.StrictMode>,
    );
  }
}

void bootstrap();
