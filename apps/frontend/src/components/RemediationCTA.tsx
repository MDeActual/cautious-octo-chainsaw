import type React from 'react';
import { Link } from 'react-router-dom';

interface RemediationCTAProps {
  riskLevel?: 'Low' | 'Medium' | 'High';
  topRecommendations?: number;
  opportunityScore?: number;
}

/**
 * Remediation CTA - compelling call-to-action for security remediation
 * Investor-grade presentation with urgency indicators
 */
export default function RemediationCTA({
  riskLevel = 'Medium',
  topRecommendations = 5,
  opportunityScore = 45,
}: RemediationCTAProps): React.ReactElement {
  const getUrgencyConfig = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          badge: '🚨 URGENT ACTION REQUIRED',
          badgeColor: 'bg-red-600 text-white',
          bgGradient: 'from-red-900/30 to-red-800/20',
          borderColor: 'border-red-600/50',
          title: 'Critical Security Gaps Detected',
          message: 'Your organization is at HIGH RISK. Immediate action is required to prevent potential breaches.',
          urgencyIndicator: 'Within 24 hours',
          urgencyColor: 'text-red-400',
          icon: '⚠️',
        };
      case 'Medium':
        return {
          badge: '⚡ ACTION RECOMMENDED',
          badgeColor: 'bg-yellow-600 text-white',
          bgGradient: 'from-yellow-900/30 to-yellow-800/20',
          borderColor: 'border-yellow-600/50',
          title: 'Security Improvements Available',
          message: 'Your security posture can be significantly improved. Act now to reduce risk exposure.',
          urgencyIndicator: 'Within 7 days',
          urgencyColor: 'text-yellow-400',
          icon: '⚡',
        };
      default:
        return {
          badge: '✓ MAINTAIN & IMPROVE',
          badgeColor: 'bg-green-600 text-white',
          bgGradient: 'from-green-900/30 to-green-800/20',
          borderColor: 'border-green-600/50',
          title: 'Good Security Foundation',
          message: 'Keep building on your strong security posture with automated monitoring.',
          urgencyIndicator: 'Ongoing optimization',
          urgencyColor: 'text-green-400',
          icon: '✓',
        };
    }
  };

  const config = getUrgencyConfig(riskLevel);

  // Calculate potential impact
  const potentialImpact = Math.round(opportunityScore * 1.5);
  const estimatedDays = riskLevel === 'High' ? '2-3' : riskLevel === 'Medium' ? '5-7' : '10-14';

  return (
    <div className={`rounded-xl p-6 border ${config.borderColor} bg-gradient-to-br ${config.bgGradient} shadow-xl relative overflow-hidden`}>
      {/* Animated background effect for high urgency */}
      {riskLevel === 'High' && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent animate-pulse"></div>
      )}

      <div className="relative z-10">
        {/* Urgency Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`${config.badgeColor} text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide`}>
            {config.badge}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span>Respond {config.urgencyIndicator}</span>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-3xl">{config.icon}</span>
            {config.title}
          </h3>
          <p className="text-gray-300 text-base leading-relaxed">
            {config.message}
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Potential Impact</p>
            <p className="text-2xl font-bold text-blue-400">+{potentialImpact}</p>
            <p className="text-xs text-gray-500">points possible</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Quick Wins</p>
            <p className="text-2xl font-bold text-green-400">{topRecommendations}</p>
            <p className="text-xs text-gray-500">ready to deploy</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Time to Value</p>
            <p className="text-2xl font-bold text-purple-400">{estimatedDays}</p>
            <p className="text-xs text-gray-500">days with Core</p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">What You'll Get:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-sm mt-0.5">✓</span>
              <p className="text-sm text-gray-300">Automated security policy deployment</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-sm mt-0.5">✓</span>
              <p className="text-sm text-gray-300">One-click remediation for top issues</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-sm mt-0.5">✓</span>
              <p className="text-sm text-gray-300">24/7 continuous monitoring & alerts</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-sm mt-0.5">✓</span>
              <p className="text-sm text-gray-300">Compliance tracking & reporting</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/app/upgrade"
            className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            <span>Start Automated Remediation</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <button
            onClick={() => {
              // Scroll to recommendations
              const recommendationsSection = document.querySelector('[data-recommendations]');
              if (recommendationsSection) {
                recommendationsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-6 py-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-gray-600"
          >
            View Recommendations
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-green-400">✓</span>
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-green-400">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-green-400">✓</span>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-green-400">✓</span>
            <span>Enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
