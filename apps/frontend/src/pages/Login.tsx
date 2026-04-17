interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SecurePulse</h1>
          <p className="text-gray-400 text-sm mb-1">by CloudMatrix Business Solutions</p>
          <div className="h-1 w-24 bg-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-3">
            Microsoft 365 Security Assessment
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Get instant visibility into your Microsoft 365 security posture with free Secure Score analysis.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">What you'll get:</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>Real-time Secure Score from Microsoft Graph</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>Risk level assessment and CIS Controls mapping</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>Prioritized security recommendations</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/50"
        >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
            <path d="M10 0H0v10h10V0z" fill="#F25022" />
            <path d="M21 0H11v10h10V0z" fill="#7FBA00" />
            <path d="M10 11H0v10h10V11z" fill="#00A4EF" />
            <path d="M21 11H11v10h10V11z" fill="#FFB900" />
          </svg>
          Sign in with Microsoft
        </button>

        <p className="text-gray-500 text-xs text-center mt-6">
          Free tier: Read-only access · No changes to your tenant
        </p>
      </div>
    </div>
  );
}
