import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { loginRequest } from './auth/msalConfig';
import { selectedAccount } from './auth/selectedAccount';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import UpgradePage from './pages/UpgradePage';
import PreviewDashboard from './pages/PreviewDashboard';

export default function App(): React.ReactElement {
  const hasAuthenticatedAccount = useIsAuthenticated();
  const { instance } = useMsal();
  const account = selectedAccount(instance);
  const isAuthenticated = hasAuthenticatedAccount && account !== null;

  const handleLogin = (): void => {
    void instance.loginRedirect(loginRequest);
  };

  const handleLogout = (): void => {
    void instance.logoutRedirect();
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route path="/preview" element={<PreviewDashboard />} />

        {/* Protected routes */}
        {isAuthenticated ? (
          <>
            <Route
              path="/app/dashboard"
              element={
                <DashboardPage
                  userName={account?.username}
                  tenantId={account?.tenantId}
                  onLogout={handleLogout}
                  useMockData={false}
                />
              }
            />
            <Route
              path="/app/upgrade"
              element={
                <UpgradePage
                  userName={account?.username}
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
          </>
        ) : (
          <Route path="/app/*" element={<Navigate to="/login" replace />} />
        )}

        {/* Fallback */}
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
