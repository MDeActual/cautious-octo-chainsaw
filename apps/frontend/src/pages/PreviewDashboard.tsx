import { Link } from 'react-router-dom';
import type React from 'react';
import { SecurePulseLogo } from '../components/SecurePulseLogo';
import SecureScoreCard from '../components/SecureScoreCard';
import RecommendationsPanel from '../components/RecommendationsPanel';
import ScoreTrendChart from '../components/ScoreTrendChart';
import ComplianceProgressChart from '../components/ComplianceProgressChart';
import ROICalculator from '../components/ROICalculator';
import RemediationCTA from '../components/RemediationCTA';

// Mock data for preview mode
const mockAssessment = {
  tenantId: 'demo-tenant',
  secureScore: 68,
  maxSecureScore: 100,
  riskLevel: 'Medium' as const,
  lastAssessmentDate: new Date().toISOString(),
  version: 1,
  complianceFrameworks: [
    { name: 'CIS Controls v8', score: 72, maxScore: 100 },
    { name: 'PIPEDA', score: 65, maxScore: 100 },
    { name: 'Microsoft Zero Trust', score: 70, maxScore: 100 },
  ],
};

const mockRecommendations = [
  {
    id: '1',
    title: 'Enable MFA for all users',
    description: 'Require multi-factor authentication for all user accounts to significantly reduce the risk of unauthorized access.',
    category: 'Identity',
    impact: 'High' as const,
    implementationCost: 'Low' as const,
    userImpact: 'Medium' as const,
    score: 10,
    actionUrl: 'https://portal.azure.com',
  },
  {
    id: '2',
    title: 'Configure Conditional Access policies',
    description: 'Implement Conditional Access policies to control access based on risk, device compliance, and location.',
    category: 'Identity',
    impact: 'High' as const,
    implementationCost: 'Medium' as const,
    userImpact: 'Low' as const,
    score: 8,
    actionUrl: 'https://portal.azure.com',
  },
  {
    id: '3',
    title: 'Enable Microsoft Defender for Office 365',
    description: 'Protect against advanced threats like phishing, business email compromise, and malicious attachments.',
    category: 'Data Protection',
    impact: 'High' as const,
    implementationCost: 'Medium' as const,
    userImpact: 'Low' as const,
    score: 9,
    actionUrl: 'https://security.microsoft.com',
  },
];

/**
 * PreviewDashboard - Public demo dashboard with mock data
 * Allows prospects to explore the UI without authentication
 */
export default function PreviewDashboard(): React.ReactElement {
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
                secureScore={mockAssessment.secureScore}
                maxSecureScore={mockAssessment.maxSecureScore}
                riskLevel={mockAssessment.riskLevel}
                lastAssessmentDate={mockAssessment.lastAssessmentDate}
                isLoading={false}
                onRefresh={() => {}}
              />
            </div>
            <div>
              <ROICalculator secureScore={mockAssessment.secureScore} />
            </div>
          </div>

          {/* CTA */}
          <div className="mb-6">
            <RemediationCTA riskLevel={mockAssessment.riskLevel} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ScoreTrendChart tenantId={mockAssessment.tenantId} useMockData={true} />
            <ComplianceProgressChart frameworks={mockAssessment.complianceFrameworks} />
          </div>

          {/* Recommendations */}
          <div>
            <RecommendationsPanel recommendations={mockRecommendations} isLoading={false} />
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
