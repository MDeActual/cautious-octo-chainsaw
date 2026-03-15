import React from 'react';
import { useMsal, useAccount } from '@azure/msal-react';

export function DashboardPage(): React.ReactElement {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] ?? undefined);

  const handleLogout = (): void => {
    void instance.logoutRedirect();
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <nav className="bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary-900">CloudMatrix MSSP</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-secondary-500">{account?.name ?? account?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">Security Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide">Tenants</h3>
            <p className="text-3xl font-bold text-secondary-900 mt-2">—</p>
            <p className="text-sm text-secondary-500 mt-1">Connected tenants</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide">Avg Secure Score</h3>
            <p className="text-3xl font-bold text-secondary-900 mt-2">—</p>
            <p className="text-sm text-secondary-500 mt-1">Across all tenants</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide">Hot Leads</h3>
            <p className="text-3xl font-bold text-secondary-900 mt-2">—</p>
            <p className="text-sm text-secondary-500 mt-1">Require immediate attention</p>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <p className="text-secondary-500 text-center py-8">
            Connect your first Microsoft 365 tenant to see security insights
          </p>
        </div>
      </main>
    </div>
  );
}
