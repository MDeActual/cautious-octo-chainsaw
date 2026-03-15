import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App(): React.ReactElement {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();

  if (inProgress !== 'none') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-secondary-500">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<Navigate to="/" replace />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
