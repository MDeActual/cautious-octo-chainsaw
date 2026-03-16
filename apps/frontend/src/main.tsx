import { MsalProvider } from '@azure/msal-react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { msalInstance } from './auth/msal-config';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
);
