import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

async function bootstrap(): Promise<void> {
  const clientId = import.meta.env['VITE_ENTRA_CLIENT_ID'];

  if (!clientId) {
    const { default: DevApp } = await import('./DevApp');
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <DevApp />
      </React.StrictMode>,
    );
    return;
  }

  const [{ MsalProvider }, { PublicClientApplication }, { default: App }, { msalConfig }] =
    await Promise.all([
      import('@azure/msal-react'),
      import('@azure/msal-browser'),
      import('./App'),
      import('./auth/msalConfig'),
    ]);

  const msalInstance = new PublicClientApplication(msalConfig);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
