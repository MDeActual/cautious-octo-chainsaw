import { describe, expect, it } from 'vitest';
import { calculatePreviewConversionMetrics } from './previewConversion';

describe('calculatePreviewConversionMetrics', () => {
  it('returns deterministic conversion values for preview baseline', () => {
    const metrics = calculatePreviewConversionMetrics(68, 3, 96);

    expect(metrics.currentProtectionPct).toBe(68);
    expect(metrics.estimatedRiskReductionPct).toBe(42);
    expect(metrics.potentialAnnualImpactCad).toBe(150000);
    expect(metrics.protectionsToUnlock).toBe(3);
    expect(metrics.shouldShowUpgradePrompt).toBe(true);
    expect(metrics.shouldShowUnlockProtectionCta).toBe(true);
    expect(metrics.targetProtectionPct).toBe(100);
  });

  it('suppresses upgrade and unlock triggers for fully protected tenants', () => {
    const metrics = calculatePreviewConversionMetrics(100, 0, 20);

    expect(metrics.estimatedRiskReductionPct).toBe(0);
    expect(metrics.shouldShowUpgradePrompt).toBe(false);
    expect(metrics.shouldShowUnlockProtectionCta).toBe(false);
    expect(metrics.targetProtectionPct).toBe(100);
  });
});
