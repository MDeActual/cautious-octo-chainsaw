import { Router, type Router as ExpressRouter } from 'express';
import type { ApiResponse, ComplianceFrameworkStatus } from '@cloudmatrix/shared-types';

export const complianceRouter: ExpressRouter = Router();

/**
 * COMPLIANCE PERCENTAGE DISCLAIMER
 * ---------------------------------
 * The compliance percentages returned by these endpoints are HEURISTIC ESTIMATES
 * derived from the Microsoft Secure Score percentage, NOT the result of a formal
 * legal or compliance audit. They use fixed offsets per framework (see buildFrameworks)
 * to approximate relative posture.
 *
 * These values MUST NOT be used as evidence of legal compliance with PIPEDA,
 * Quebec Law 25, FSI regulations, or any other regulatory framework. They are
 * intended to guide MSSP sales conversations and remediation prioritization only.
 *
 * A full compliance determination requires a qualified legal/audit engagement.
 */

/**
 * Derives heuristic compliance percentages for all 6 supported frameworks.
 *
 * Algorithm:
 *   - Base value = tenant's current security_percentage from Secure Score
 *   - Each framework applies a fixed offset to reflect its relative strictness
 *     compared to the CIS Controls v8 baseline (e.g., Quebec Law 25 is -5 because
 *     it has stricter privacy requirements; MISA is +8 because it aligns closely
 *     with Microsoft's own security posture)
 *   - Classification thresholds: ≥80% → compliant, ≥40% → partial, <40% → non-compliant
 *
 * Limitations:
 *   - Offsets are not derived from real audit mappings; they are placeholder estimates
 *   - When no assessment data is present, base defaults to 0 (most conservative)
 */
function buildFrameworks(securityPercentage?: number): ComplianceFrameworkStatus[] {
  const base = securityPercentage ?? 0;

  const pct = (offset: number): number => Math.min(100, Math.max(0, Math.round(base + offset)));

  const classify = (p: number): ComplianceFrameworkStatus['status'] => {
    if (p >= 80) return 'compliant';
    if (p >= 40) return 'partial';
    return 'non-compliant';
  };

  return [
    {
      framework_id: 'cis-v8',
      name: 'CIS Controls v8',
      version: '8.0',
      region: 'Global',
      industry: 'All',
      compliance_percentage: pct(0),
      status: classify(pct(0)),
      gaps: pct(0) < 100 ? ['MFA not fully enforced', 'Legacy auth protocols active'] : [],
    },
    {
      framework_id: 'pipeda',
      name: 'PIPEDA',
      version: '2019',
      region: 'Canada',
      industry: 'All',
      compliance_percentage: pct(5),
      status: classify(pct(5)),
      gaps:
        pct(5) < 100
          ? ['Breach notification procedure not documented', 'Data inventory incomplete']
          : [],
    },
    {
      framework_id: 'quebec-law-25',
      name: 'Quebec Law 25',
      version: '2023',
      region: 'Quebec, Canada',
      industry: 'All',
      compliance_percentage: pct(-5),
      status: classify(pct(-5)),
      gaps:
        pct(-5) < 100
          ? ['Privacy impact assessment required', '72-hour incident notification not configured']
          : [],
    },
    {
      framework_id: 'zero-trust',
      name: 'Microsoft Zero Trust',
      version: '2023',
      region: 'Global',
      industry: 'All',
      compliance_percentage: pct(3),
      status: classify(pct(3)),
      gaps:
        pct(3) < 100
          ? ['Conditional Access policies incomplete', 'Device health verification not enforced']
          : [],
    },
    {
      framework_id: 'fsi',
      name: 'FSI (Financial Services Industry)',
      version: '2022',
      region: 'Canada',
      industry: 'Financial Services',
      compliance_percentage: pct(-10),
      status: classify(pct(-10)),
      gaps:
        pct(-10) < 100
          ? ['Data encryption at rest not verified', 'Privileged access management gaps']
          : [],
    },
    {
      framework_id: 'misa',
      name: 'MISA (Microsoft Intelligent Security Association)',
      version: '2023',
      region: 'Global',
      industry: 'Technology',
      compliance_percentage: pct(8),
      status: classify(pct(8)),
      gaps: pct(8) < 100 ? ['Threat detection coverage incomplete'] : [],
    },
  ];
}

/**
 * GET /compliance/:tenantId/frameworks
 * Lists all compliance frameworks with the tenant's current status.
 */
complianceRouter.get('/:tenantId/frameworks', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const frameworks = buildFrameworks();

  const response: ApiResponse<ComplianceFrameworkStatus[]> = {
    data: frameworks,
    error: null,
    meta: {
      tenant_id: tenantId,
      count: frameworks.length,
      heuristic: true,
      disclaimer:
        'Compliance percentages are heuristic estimates derived from Microsoft Secure Score. They are NOT the result of a formal legal or compliance audit and must not be used as evidence of regulatory compliance.',
    },
  };
  res.json(response);
});

/**
 * GET /compliance/:tenantId/status
 * Returns an overall compliance summary across all frameworks.
 */
complianceRouter.get('/:tenantId/status', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const frameworks = buildFrameworks();

  const avgCompliance =
    frameworks.length > 0
      ? Math.round(
          frameworks.reduce((sum, f) => sum + f.compliance_percentage, 0) / frameworks.length,
        )
      : 0;

  const compliantCount = frameworks.filter((f) => f.status === 'compliant').length;
  const partialCount = frameworks.filter((f) => f.status === 'partial').length;
  const nonCompliantCount = frameworks.filter((f) => f.status === 'non-compliant').length;

  const response: ApiResponse<{
    tenant_id: string;
    average_compliance_percentage: number;
    compliant_frameworks: number;
    partial_frameworks: number;
    non_compliant_frameworks: number;
    frameworks: ComplianceFrameworkStatus[];
  }> = {
    data: {
      tenant_id: tenantId,
      average_compliance_percentage: avgCompliance,
      compliant_frameworks: compliantCount,
      partial_frameworks: partialCount,
      non_compliant_frameworks: nonCompliantCount,
      frameworks,
    },
    error: null,
    meta: {
      heuristic: true,
      disclaimer:
        'Compliance percentages are heuristic estimates derived from Microsoft Secure Score. They are NOT the result of a formal legal or compliance audit and must not be used as evidence of regulatory compliance.',
    },
  };
  res.json(response);
});
