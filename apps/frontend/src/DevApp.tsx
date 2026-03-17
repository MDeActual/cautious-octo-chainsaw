import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DevDashboard from './pages/DevDashboard';

export default function DevApp(): React.ReactElement {
  return (
    <BrowserRouter>
      <div className="bg-yellow-500 text-black text-center text-sm py-1 font-medium">
        ⚠️ Dev Mode — MSAL auth bypassed. Set VITE_ENTRA_CLIENT_ID and VITE_ENTRA_TENANT_ID to enable
        authentication.
      </div>
      <Routes>
        <Route path="/*" element={<DevDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
