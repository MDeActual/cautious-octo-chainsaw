import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SecurityAssessment, SecureScoreRecommendation } from '@cloudmatrix/shared-types';
import AppShell from '../layouts/AppShell';
import SecureScoreCard from '../components/SecureScoreCard';
import RecommendationsPanel from '../components/RecommendationsPanel';
import ScoreTrendChart from '../components/ScoreTrendChart';
import ComplianceProgressChart from '../components/ComplianceProgressChart';
import ROICalculator from '../components/ROICalculator';
import RemediationCTA from '../components/RemediationCTA';
import { assessmentApi, mockAssessmentApi, mockRecommendations } from '../services/api';

interface DashboardPageProps {
  userName?: string;
  tenantId?: string;
  onLogout?: () => void;
  useMockData?: boolean;
}

/**
 * Dashboard page - displays Secure Score and recommendations
 */
export default function DashboardPage({
  userName,
  tenantId = 'default-tenant',
  onLogout,
  useMockData = false,
}: DashboardPageProps): React.ReactElement {
  const [assessment, setAssessment] = useState<SecurityAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<SecureScoreRecommendation[]>(mockRecommendations);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useMockData ? mockAssessmentApi : assessmentApi;

  const loadAssessment = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const response = await api.getCurrent(tenantId);

    if (response.error) {
      setError(response.error);
      setAssessment(null);
    } else {
      setAssessment(response.data);
    }

    // Try to load recommendations from backend, fall back to mock if not available
    if (!useMockData) {
      const recommendationsResponse = await api.getRecommendations(tenantId);
      if (recommendationsResponse.data && recommendationsResponse.data.length > 0) {
        setRecommendations(recommendationsResponse.data);
      } else {
        // Backend returned no recommendations, use mock data
        setRecommendations(mockRecommendations);
      }
    } else {
      setRecommendations(mockRecommendations);
    }

    setIsLoading(false);
  };

  const handleRefresh = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const response = await api.refresh(tenantId);

    if (response.error) {
      setError(response.error);
    } else {
      setAssessment(response.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return (
    <AppShell userName={userName} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">SecurePulse Dashboard</h1>
          <p className="text-gray-400">
            Real-time intelligence for your Microsoft 365 security posture
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Main Score and Trend Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SecureScoreCard
            assessment={assessment}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />

          {assessment && (
            <ScoreTrendChart
              currentScore={assessment.secure_score_raw}
              maxScore={assessment.secure_score_max}
            />
          )}
        </div>

        {/* Compliance and ROI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {assessment && (
            <ComplianceProgressChart
              cisControlsCount={assessment.cis_controls?.length}
              cisControlsTotal={18}
            />
          )}

          {assessment && (
            <ROICalculator
              currentScore={assessment.secure_score_raw}
              maxScore={assessment.secure_score_max}
              opportunityScore={assessment.opportunity_score}
            />
          )}
        </div>

        {/* Recommendations Panel */}
        <div className="mb-6" data-recommendations>
          <RecommendationsPanel
            recommendations={recommendations}
            isLoading={isLoading}
            maxDisplay={5}
          />
        </div>

        {/* Remediation CTA */}
        {assessment && (
          <div className="mb-6">
            <RemediationCTA
              riskLevel={assessment.risk_level}
              topRecommendations={recommendations.length}
              opportunityScore={assessment.opportunity_score}
            />
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Opportunity Score</p>
            <p className="text-2xl font-bold text-blue-400">
              {assessment?.opportunity_score != null ? assessment.opportunity_score.toFixed(1) : '—'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenue potential</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Security Level</p>
            <p className="text-2xl font-bold text-white">
              {assessment?.security_percentage != null ? assessment.security_percentage.toFixed(0) : '—'}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Overall posture</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Current Tier</p>
            <p className="text-lg font-semibold text-green-400">Free</p>
            <Link to="/app/upgrade" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
              Upgrade →
            </Link>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">CIS Controls</p>
            <p className="text-2xl font-bold text-white">
              {assessment?.cis_controls?.length ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Implemented</p>
          </div>
        </div>

        {/* Value Proposition Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Ready to automate your security?
              </h3>
              <p className="text-gray-400 text-sm">
                Upgrade to Core tier for automated security improvements, continuous monitoring,
                and AI-powered insights
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/app/upgrade"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap shadow-lg"
              >
                View Plans
              </Link>
              <button
                onClick={() => window.open('https://calendly.com/cloudmatrix', '_blank', 'noopener,noreferrer')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
