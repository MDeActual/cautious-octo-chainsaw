import { Link } from 'react-router-dom';
import type React from 'react';
import type { SecurityAssessment, SecureScoreRecommendation } from '@cloudmatrix/shared-types';
import { SecurePulseLogo } from '../components/SecurePulseLogo';
import SecureScoreCard from '../components/SecureScoreCard';
import RecommendationsPanel from '../components/RecommendationsPanel';
import ScoreTrendChart from '../components/ScoreTrendChart';
import ComplianceProgressChart from '../components/ComplianceProgressChart';
import ROICalculator from '../components/ROICalculator';
import RemediationCTA from '../components/RemediationCTA';
import { calculatePreviewConversionMetrics } from './previewConversion';

// Mock data for preview mode
const mockAssessment: SecurityAssessment = {
  id: 'demo-assessment',
  tenant_id: 'demo-tenant',
  secure_score_raw: 204,
  secure_score_max: 300,
  security_percentage: 68,
  risk_level: 'Medium',
  opportunity_score: 96,
  lead_rank: 'Warm',
  assessed_at: new Date().toISOString(),
};

const mockRecommendations: SecureScoreRecommendation[] = [
  {
    id: '1',
    category: 'Identity',
    title: 'Enable MFA for all users',
    implementation_cost: 'Low',
    user_impact: 'Medium',
    threats: ['Account Compromise', 'Phishing Attacks', 'Unauthorized Access'],
    score_in_percentage: 10,
    remediation_impact: 45,
  },
  {
    id: '2',
    category: 'Identity',
    title: 'Configure Conditional Access policies',
    implementation_cost: 'Medium',
    user_impact: 'Low',
    threats: ['Compromised Credentials', 'Device-based Attacks', 'Location-based Threats'],
    score_in_percentage: 8,
    remediation_impact: 38,
  },
  {
    id: '3',
    category: 'Data Protection',
    title: 'Enable Microsoft Defender for Office 365',
    implementation_cost: 'Medium',
    user_impact: 'Low',
    threats: ['Phishing', 'Business Email Compromise', 'Malware'],
    score_in_percentage: 9,
    remediation_impact: 42,
  },
];

/**
 * PreviewDashboard - Public demo dashboard with mock data
 * Allows prospects to explore the UI without authentication
 */
export default function PreviewDashboard(): React.ReactElement {
  const conversionMetrics = calculatePreviewConversionMetrics(
    mockAssessment.security_percentage,
    mockRecommendations.length,
    mockAssessment.opportunity_score
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Branding */}
          <Link to="/" className="flex items-center">
            <SecurePulseLogo size={32} showText={true} />
          </Link>

          {/* Demo mode badge */}
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-lg border border-yellow-500/30">
              DEMO MODE
            </span>
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Sign in with Microsoft
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Demo notice */}
          <div className="mb-6 bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-blue-300 font-medium mb-1">Preview Mode</h3>
                <p className="text-gray-400 text-sm">
                  You're viewing sample data. Sign in with your Microsoft account to see your actual Secure Score and security recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-900/40 to-indigo-900/20 p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Conversion Preview
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  You&apos;re {conversionMetrics.currentProtectionPct}% protected. Activating Advanced could reduce breach risk by ~{conversionMetrics.estimatedRiskReductionPct}%.
                </h2>
                <p className="mt-2 text-sm text-blue-100/90">
                  Estimated annual risk exposure: CA${conversionMetrics.potentialAnnualImpactCad.toLocaleString('en-CA')}. Connect your tenant to generate your full security report.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex min-w-[240px] items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Connect Microsoft Tenant
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-w-[240px] items-center justify-center rounded-lg border border-blue-300/50 bg-blue-100/10 px-6 py-3 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-100/20"
                >
                  Get Full Security Report
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                <p className="text-xs text-gray-400">Current Protection</p>
                <p className="text-2xl font-bold text-white">{conversionMetrics.currentProtectionPct}%</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                <p className="text-xs text-gray-400">Estimated Risk Reduction</p>
                <p className="text-2xl font-bold text-green-400">~{conversionMetrics.estimatedRiskReductionPct}%</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                <p className="text-xs text-gray-400">Potential Financial Impact</p>
                <p className="text-2xl font-bold text-amber-300">CA${conversionMetrics.potentialAnnualImpactCad.toLocaleString('en-CA')}</p>
              </div>
            </div>
          </div>

          {(conversionMetrics.shouldShowUpgradePrompt || conversionMetrics.shouldShowUnlockProtectionCta) && (
            <div className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              {conversionMetrics.shouldShowUpgradePrompt && (
                <p className="text-sm text-amber-100">
                  Activating Advanced can move your protection from {conversionMetrics.currentProtectionPct}% to about {conversionMetrics.targetProtectionPct}% and clear key high-impact risks.
                </p>
              )}
              {conversionMetrics.shouldShowUnlockProtectionCta && (
                <p className="mt-2 text-sm text-amber-100">
                  {conversionMetrics.protectionsToUnlock} protections are currently locked in preview mode.
                  {' '}
                  <Link to="/login" className="font-semibold text-white underline underline-offset-2 hover:text-amber-200">
                    Connect Microsoft Tenant
                  </Link>
                  {' '}
                  to unlock protection workflows.
                </p>
              )}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">SecurePulse Dashboard</h1>
            <p className="text-gray-400">
              Real-time intelligence for your Microsoft 365 security posture
            </p>
          </div>

          {/* Top row: Secure Score + ROI Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <SecureScoreCard
                assessment={mockAssessment}
                isLoading={false}
                onRefresh={() => {}}
              />
            </div>
            <div>
              <ROICalculator
                currentScore={mockAssessment.secure_score_raw}
                maxScore={mockAssessment.secure_score_max}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mb-6">
            <RemediationCTA riskLevel={mockAssessment.risk_level} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ScoreTrendChart
              currentScore={mockAssessment.secure_score_raw}
              maxScore={mockAssessment.secure_score_max}
            />
            <ComplianceProgressChart
              cisControlsCount={12}
              cisControlsTotal={18}
            />
          </div>

          {/* Recommendations */}
          <div data-recommendations>
            <RecommendationsPanel recommendations={mockRecommendations} isLoading={false} />
          </div>

          <div className="mt-6 rounded-xl border border-blue-700/50 bg-blue-900/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-blue-100">
                Ready to move from preview to action? Connect your tenant for live data, then generate your full report to start paid onboarding.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Connect Microsoft Tenant
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-blue-300/50 bg-transparent px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-100/10"
                >
                  Get Full Security Report
                </Link>
              </div>
            </div>
          </div>
        </div>
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
