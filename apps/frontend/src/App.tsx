import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { loginRequest } from './auth/msalConfig';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App(): React.ReactElement {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  const handleLogin = (): void => {
    void instance.loginRedirect(loginRequest);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/*"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
