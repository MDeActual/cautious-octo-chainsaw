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
