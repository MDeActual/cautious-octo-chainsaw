import { Link, useLocation } from 'react-router-dom';
import type React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}

/**
 * AppShell layout component
 * Provides consistent header, navigation, and branding across the app
 */
export default function AppShell({ children, userName, onLogout }: AppShellProps): React.ReactElement {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-400">SecurePulse</span>
              <span className="text-xs text-gray-500">by CloudMatrix Business Solutions</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`text-sm transition-colors ${
                isActive('/dashboard')
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/upgrade"
              className={`text-sm transition-colors ${
                isActive('/upgrade')
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upgrade
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-gray-400 text-sm">{userName}</span>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          SecurePulse &copy; {new Date().getFullYear()} CloudMatrix Business Solutions
        </div>
      </footer>
    </div>
  );
}
