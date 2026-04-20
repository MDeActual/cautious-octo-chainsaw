import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { loginRequest } from './auth/msalConfig';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import UpgradePage from './pages/UpgradePage';
import PreviewDashboard from './pages/PreviewDashboard';

export default function App(): React.ReactElement {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const account = accounts[0];

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
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
