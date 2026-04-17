import type { SecurityAssessment, RiskLevel } from '@cloudmatrix/shared-types';
import type React from 'react';

interface SecureScoreCardProps {
  assessment: SecurityAssessment | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * Displays Secure Score and risk level
 */
export default function SecureScoreCard({
  assessment,
  isLoading = false,
  onRefresh,
}: SecureScoreCardProps): React.ReactElement {
  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case 'Low':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskBgColor = (risk: RiskLevel): string => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/10 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'High':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Secure Score</h3>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No assessment data available</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Run Assessment
            </button>
          )}
        </div>
      </div>
    );
  }

  const scorePercentage = (assessment.secure_score_raw / assessment.secure_score_max) * 100;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-300">Secure Score</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            title="Refresh assessment"
          >
            ↻ Refresh
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-bold text-white">
            {assessment.secure_score_raw}
          </span>
          <span className="text-2xl text-gray-400">/ {assessment.secure_score_max}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {assessment.security_percentage.toFixed(1)}% secure
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-lg p-4 border ${getRiskBgColor(assessment.risk_level)}`}>
          <p className="text-xs text-gray-400 mb-1">Risk Level</p>
          <p className={`text-xl font-semibold ${getRiskColor(assessment.risk_level)}`}>
            {assessment.risk_level}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Lead Rank</p>
          <p className="text-xl font-semibold text-blue-400">{assessment.lead_rank}</p>
        </div>
      </div>

      {assessment.assessed_at && (
        <p className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(assessment.assessed_at).toLocaleString()}
        </p>
      )}

      {(assessment.user_count || assessment.device_count) && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700">
          {assessment.user_count && (
            <div className="text-sm">
              <span className="text-gray-400">Users: </span>
              <span className="text-white font-medium">{assessment.user_count}</span>
            </div>
          )}
          {assessment.device_count && (
            <div className="text-sm">
              <span className="text-gray-400">Devices: </span>
              <span className="text-white font-medium">{assessment.device_count}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
