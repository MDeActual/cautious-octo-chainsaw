export interface PreviewConversionMetrics {
  currentProtectionPct: number;
  estimatedRiskReductionPct: number;
  potentialAnnualImpactCad: number;
  protectionsToUnlock: number;
  shouldShowUpgradePrompt: boolean;
  shouldShowUnlockProtectionCta: boolean;
  targetProtectionPct: number;
  upgradeThresholdPct: number;
}

const UPGRADE_THRESHOLD_PCT = 75;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculatePreviewConversionMetrics(
  securityPercentage: number,
  recommendationsCount: number,
  opportunityScore: number
): PreviewConversionMetrics {
  const currentProtectionPct = clamp(Math.round(securityPercentage), 0, 100);
  const riskGapPct = 100 - currentProtectionPct;

  const estimatedRiskReductionPct = riskGapPct <= 0
    ? 0
    : clamp(Math.round(riskGapPct * 1.3), 12, 60);

  const potentialAnnualImpactCad = Math.round(
    (25000 + (opportunityScore * 900) + (riskGapPct * 1200)) / 1000
  ) * 1000;

  const protectionsToUnlock = clamp(
    Math.min(recommendationsCount, Math.ceil(riskGapPct / 6)),
    0,
    recommendationsCount
  );

  const targetProtectionPct = clamp(currentProtectionPct + estimatedRiskReductionPct, 0, 100);
  const shouldShowUpgradePrompt = currentProtectionPct < UPGRADE_THRESHOLD_PCT;
  const shouldShowUnlockProtectionCta = protectionsToUnlock > 0;

  return {
    currentProtectionPct,
    estimatedRiskReductionPct,
    potentialAnnualImpactCad,
    protectionsToUnlock,
    shouldShowUpgradePrompt,
    shouldShowUnlockProtectionCta,
    targetProtectionPct,
    upgradeThresholdPct: UPGRADE_THRESHOLD_PCT,
  };
}
