import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UpgradePage from './pages/UpgradePage';
import Login from './pages/Login';

export default function DevApp(): React.ReactElement {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = (): void => {
    setIsLoggedIn(true);
  };

  const handleLogout = (): void => {
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <div className="bg-yellow-500 text-black text-center text-sm py-1 font-medium">
        ⚠️ Dev Mode — MSAL auth bypassed. Set VITE_ENTRA_CLIENT_ID and VITE_ENTRA_TENANT_ID to enable
        authentication.
      </div>
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/*" element={<Login onLogin={handleLogin} />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  userName="dev@localhost"
                  tenantId="dev-tenant"
                  onLogout={handleLogout}
                  useMockData={true}
                />
              }
            />
            <Route
              path="/upgrade"
              element={
                <UpgradePage
                  userName="dev@localhost"
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="/*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
