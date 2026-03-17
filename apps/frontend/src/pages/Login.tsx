interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CloudMatrix</h1>
          <p className="text-gray-400">MSSP Security Platform</p>
        </div>
        <button
          onClick={onLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
            <path d="M10 0H0v10h10V0z" fill="#F25022" />
            <path d="M21 0H11v10h10V0z" fill="#7FBA00" />
            <path d="M10 11H0v10h10V11z" fill="#00A4EF" />
            <path d="M21 11H11v10h10V11z" fill="#FFB900" />
          </svg>
          Sign in with Microsoft
        </button>
        <p className="text-gray-500 text-sm text-center mt-6">
          Internal use only · CloudMatrix team members only
        </p>
      </div>
    </div>
  );
}
