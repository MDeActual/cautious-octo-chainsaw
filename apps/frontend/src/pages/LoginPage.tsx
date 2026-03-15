import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/msal-config';

export function LoginPage(): React.ReactElement {
  const { instance } = useMsal();

  const handleLogin = (): void => {
    void instance.loginRedirect(loginRequest);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">CloudMatrix</h1>
        <p className="text-secondary-500 mb-8">AI-Native MSSP Platform</p>
        <button
          onClick={handleLogin}
          className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Sign in with Microsoft
        </button>
        <p className="mt-4 text-sm text-secondary-500">
          Secure authentication powered by Microsoft Entra ID
        </p>
      </div>
    </div>
  );
}
