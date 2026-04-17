import type { SecureScoreRecommendation } from '@cloudmatrix/shared-types';
import type React from 'react';

interface RecommendationsPanelProps {
  recommendations: SecureScoreRecommendation[];
  isLoading?: boolean;
  maxDisplay?: number;
}

/**
 * Displays prioritized security recommendations
 */
export default function RecommendationsPanel({
  recommendations,
  isLoading = false,
  maxDisplay = 5,
}: RecommendationsPanelProps): React.ReactElement {
  const getCostColor = (cost: string): string => {
    switch (cost.toLowerCase()) {
      case 'low':
        return 'text-green-400 bg-green-500/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'high':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getImpactColor = (impact: string): string => {
    switch (impact.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Top Recommendations</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayRecommendations = recommendations.slice(0, maxDisplay);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-medium text-gray-300 mb-4">Top Recommendations</h3>

      {displayRecommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No recommendations available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayRecommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-blue-400 font-bold text-lg">{index + 1}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{rec.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {rec.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getCostColor(rec.implementation_cost)}`}
                      >
                        {rec.implementation_cost} Cost
                      </span>
                      <span className={`text-xs ${getImpactColor(rec.user_impact)}`}>
                        User Impact: {rec.user_impact}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-blue-400">
                    +{rec.remediation_impact}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>

              {rec.threats && rec.threats.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Mitigates:</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.threats.map((threat, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400"
                      >
                        {threat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {recommendations.length > maxDisplay && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Showing {maxDisplay} of {recommendations.length} recommendations
          </p>
        </div>
      )}
    </div>
  );
}
