import type { SecurityAssessment, TrendResult } from '@cloudmatrix/shared-types';

/**
 * Analyzes historical assessment data to determine the security posture trend.
 */
export class TrendAnalysisService {
  /**
   * Calculates the trend across a set of historical assessments.
   * Requires at least 2 data points; returns 'stable' with zero change otherwise.
   *
   * @param assessments - Array of SecurityAssessment records (any order)
   * @returns TrendResult with direction, percentage_change, and period_days
   */
  analyzeTrend(assessments: SecurityAssessment[]): TrendResult {
    if (assessments.length < 2) {
      return { direction: 'stable', percentage_change: 0, period_days: 0 };
    }

    const sorted = [...assessments].sort(
      (a, b) => new Date(a.assessed_at).getTime() - new Date(b.assessed_at).getTime(),
    );

    const oldest = sorted[0]!;
    const newest = sorted[sorted.length - 1]!;

    const percentageChange =
      Math.round((newest.security_percentage - oldest.security_percentage) * 100) / 100;

    const oldestMs = new Date(oldest.assessed_at).getTime();
    const newestMs = new Date(newest.assessed_at).getTime();
    const periodDays = Math.round((newestMs - oldestMs) / (1000 * 60 * 60 * 24));

    let direction: TrendResult['direction'];
    if (percentageChange > 2) {
      direction = 'improving';
    } else if (percentageChange < -2) {
      direction = 'declining';
    } else {
      direction = 'stable';
    }

    return {
      direction,
      percentage_change: percentageChange,
      period_days: periodDays,
    };
  }
}
