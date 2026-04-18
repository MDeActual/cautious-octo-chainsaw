import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UpgradePage from './pages/UpgradePage';
import Login from './pages/Login';

function DevAppContent(): React.ReactElement {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const navigate = useNavigate();

  const handleLogin = (): void => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleLogout = (): void => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
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
    </>
  );
}

export default function DevApp(): React.ReactElement {
  return (
    <BrowserRouter>
      <DevAppContent />
    </BrowserRouter>
  );
}
