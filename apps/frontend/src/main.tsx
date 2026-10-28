import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { selectedAccount } from './auth/selectedAccount';

async function bootstrap(): Promise<void> {
  const clientId = import.meta.env['VITE_ENTRA_CLIENT_ID'];

  if (import.meta.env.DEV && import.meta.env['VITE_ENABLE_DEMO'] === 'true') {
    const { default: DevApp } = await import('./DevApp');
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <DevApp />
      </React.StrictMode>,
    );
    return;
  }

  if (!clientId || !import.meta.env['VITE_API_SCOPE']) {
    document.getElementById('root')!.textContent = 'SecurePulse sign-in is not configured.';
    return;
  }

  const [{ MsalProvider }, { msalInstance }, { default: App }] =
    await Promise.all([
      import('@azure/msal-react'),
      import('./auth/msalInstance'),
      import('./App'),
    ]);

  await msalInstance.initialize();
  const signIn = await msalInstance.handleRedirectPromise();
  msalInstance.setActiveAccount(signIn?.account ?? selectedAccount(msalInstance));

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>,
  );
}

void bootstrap().catch(() => {
  document.getElementById('root')!.textContent = 'SecurePulse sign-in could not be initialized.';
});
