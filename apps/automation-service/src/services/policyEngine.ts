import type { RiskLevel, EntitlementTier, PolicyDecision } from '../types.js';

/**
 * Mock entitlement tier lookup
 * In Phase 2, this would query the database or identity-service
 */
function getEntitlementTier(tenantId: string): EntitlementTier {
  // Mock implementation - returns 'core' for most tenants
  // In production, this would query actual tenant entitlements
  if (tenantId.startsWith('free-')) return 'free';
  if (tenantId.startsWith('pro-')) return 'pro';
  if (tenantId.startsWith('elite-')) return 'elite';
  return 'core';
}

/**
 * Evaluates whether an action can be executed based on entitlement tier and risk level
 *
 * Rules:
 * - free: deny all execution
 * - core: allow low-risk only
 * - pro: allow low + medium
 * - elite: allow all, but high-risk requires approval
 *
 * @param tenantId - Tenant identifier
 * @param riskLevel - Risk level of the action
 * @returns PolicyDecision indicating if action is allowed and if approval is required
 */
export function evaluatePolicy(tenantId: string, riskLevel: RiskLevel): PolicyDecision {
  const tier = getEntitlementTier(tenantId);

  // Free tier: deny all execution
  if (tier === 'free') {
    return {
      allowed: false,
      requiresApproval: false,
      reason: 'Free tier does not support automated actions. Upgrade to Core or higher.',
    };
  }

  // Core tier: allow low-risk only
  if (tier === 'core') {
    if (riskLevel === 'low') {
      return { allowed: true, requiresApproval: false };
    }
    return {
      allowed: false,
      requiresApproval: false,
      reason: 'Core tier only supports low-risk actions. Upgrade to Pro for medium-risk actions.',
    };
  }

  // Pro tier: allow low + medium
  if (tier === 'pro') {
    if (riskLevel === 'low' || riskLevel === 'medium') {
      return { allowed: true, requiresApproval: false };
    }
    return {
      allowed: false,
      requiresApproval: false,
      reason: 'Pro tier does not support high-risk actions. Upgrade to Elite for full automation.',
    };
  }

  // Elite tier: allow all, but high-risk requires approval
  if (tier === 'elite') {
    if (riskLevel === 'high') {
      return {
        allowed: true,
        requiresApproval: true,
        reason: 'High-risk action requires admin approval before execution.',
      };
    }
    return { allowed: true, requiresApproval: false };
  }

  // Fallback: deny unknown tiers
  return {
    allowed: false,
    requiresApproval: false,
    reason: 'Unknown entitlement tier.',
  };
}
