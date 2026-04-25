import type React from 'react';

interface SecurePulseLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

/**
 * SecurePulse logo with shield and pulse/heartbeat design
 * Adapted from dutch-ai-canvas branding
 */
export function SecurePulseLogo({
  className = '',
  size = 32,
  showText = true
}: SecurePulseLogoProps): React.ReactElement {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Shield outline */}
        <path
          d="M24 4L6 12v12c0 11.1 7.7 21.4 18 24 10.3-2.6 18-12.9 18-24V12L24 4z"
          fill="rgba(59, 130, 246, 0.12)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Inner shield */}
        <path
          d="M24 10L12 16v8c0 7.4 5.1 14.3 12 16 6.9-1.7 12-8.6 12-16v-8L24 10z"
          fill="rgba(59, 130, 246, 0.08)"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Pulse/heartbeat line */}
        <path
          d="M10 26h6l3-6 4 12 4-10 3 4h8"
          fill="none"
          stroke="rgb(168, 85, 247)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pulse glow */}
        <path
          d="M10 26h6l3-6 4 12 4-10 3 4h8"
          fill="none"
          stroke="rgba(168, 85, 247, 0.3)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lock keyhole at top */}
        <circle cx="24" cy="18" r="2.5" fill="rgb(59, 130, 246)" />
        <rect x="23" y="18" width="2" height="4" rx="1" fill="rgb(59, 130, 246)" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold text-white tracking-tight">
            Secure<span className="text-purple-400">Pulse</span>
          </span>
          <span className="text-[9px] text-gray-500 tracking-widest uppercase">
            by CloudMatrix
          </span>
        </div>
      )}
    </div>
  );
}
