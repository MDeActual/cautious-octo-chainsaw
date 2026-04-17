import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { loginRequest } from './auth/msalConfig';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import UpgradePage from './pages/UpgradePage';

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

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
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
          path="/upgrade"
          element={
            <UpgradePage
              userName={account?.username}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
