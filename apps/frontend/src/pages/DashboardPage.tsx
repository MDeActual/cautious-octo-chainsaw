import { useEffect, useState } from 'react';
import type { SecurityAssessment } from '@cloudmatrix/shared-types';
import AppShell from '../layouts/AppShell';
import SecureScoreCard from '../components/SecureScoreCard';
import RecommendationsPanel from '../components/RecommendationsPanel';
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
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">
            Real-time view of your Microsoft 365 security posture
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SecureScoreCard
            assessment={assessment}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Opportunity Score</p>
                <p className="text-2xl font-bold text-blue-400">
                  {assessment?.opportunity_score.toFixed(1) ?? '—'}%
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Security Level</p>
                <p className="text-2xl font-bold text-white">
                  {assessment?.security_percentage.toFixed(0) ?? '—'}%
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Current Tier</p>
                <p className="text-lg font-semibold text-green-400">Free</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">CIS Controls</p>
                <p className="text-lg font-semibold text-white">
                  {assessment?.cis_controls?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <RecommendationsPanel
            recommendations={mockRecommendations}
            isLoading={isLoading}
            maxDisplay={5}
          />
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready for automated remediation?
              </h3>
              <p className="text-gray-400 text-sm">
                Upgrade to Core tier for automated security improvements and continuous monitoring
              </p>
            </div>
            <a
              href="/upgrade"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
