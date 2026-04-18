import type { SecurityAssessment, RiskLevel } from '@cloudmatrix/shared-types';
import type React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SecureScoreCardProps {
  assessment: SecurityAssessment | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * Displays Secure Score and risk level with enhanced visuals
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

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return '#10B981'; // green
    if (percentage >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
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
  const scoreColor = getScoreColor(scorePercentage);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Secure Score Overview</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            title="Refresh assessment"
          >
            <span className="text-lg">↻</span> Refresh
          </button>
        )}
      </div>

      {/* Main Score Display with Circular Progress */}
      <div className="flex items-center gap-6 mb-6">
        <div className="w-32 h-32">
          <CircularProgressbar
            value={scorePercentage}
            text={`${Math.round(scorePercentage)}%`}
            styles={buildStyles({
              textSize: '20px',
              pathColor: scoreColor,
              textColor: '#FFFFFF',
              trailColor: '#374151',
              pathTransitionDuration: 0.5,
            })}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-white">
              {assessment.secure_score_raw}
            </span>
            <span className="text-3xl text-gray-400">/ {assessment.secure_score_max}</span>
          </div>
          <p className="text-gray-400 mb-3">Microsoft Secure Score</p>

          {/* Visual bar for additional context */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Current Position</span>
              <span className="font-semibold" style={{ color: scoreColor }}>
                {scorePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                style={{
                  width: `${scorePercentage}%`,
                  backgroundColor: scoreColor,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
              </div>
              {/* Target marker at 85% */}
              <div
                className="absolute top-0 h-full w-0.5 bg-yellow-400"
                style={{ left: '85%' }}
                title="Target: 85%"
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="text-yellow-400">Target: 85%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`rounded-lg p-3 border ${getRiskBgColor(assessment.risk_level)}`}>
          <p className="text-xs text-gray-400 mb-1">Risk Level</p>
          <p className={`text-2xl font-bold ${getRiskColor(assessment.risk_level)}`}>
            {assessment.risk_level}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Lead Rank</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-400">{assessment.lead_rank}</p>
            {assessment.lead_rank === 'Hot' && <span className="text-xl">🔥</span>}
            {assessment.lead_rank === 'Warm' && <span className="text-xl">☀️</span>}
            {assessment.lead_rank === 'Cold' && <span className="text-xl">❄️</span>}
          </div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Opportunity</p>
          <p className="text-2xl font-bold text-purple-400">
            {assessment.opportunity_score.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Environment Info */}
      {(assessment.user_count || assessment.device_count) && (
        <div className="flex gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          {assessment.user_count && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-blue-400 text-xl">👥</span>
              <div>
                <p className="text-xs text-gray-400">Users</p>
                <p className="text-lg font-semibold text-white">{assessment.user_count}</p>
              </div>
            </div>
          )}
          {assessment.device_count && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-green-400 text-xl">💻</span>
              <div>
                <p className="text-xs text-gray-400">Devices</p>
                <p className="text-lg font-semibold text-white">{assessment.device_count}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {assessment.assessed_at && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Last updated: {new Date(assessment.assessed_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
