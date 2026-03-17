import { Router, type Router as ExpressRouter } from 'express';
import type { ApiResponse, ComplianceFrameworkStatus } from '@cloudmatrix/shared-types';

export const complianceRouter: ExpressRouter = Router();

/**
 * Returns mock compliance framework data for a given tenant.
 * Derives approximate compliance percentages based on available assessment data
 * or returns conservative defaults when no assessment data is present.
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
    meta: { tenant_id: tenantId, count: frameworks.length },
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
  };
  res.json(response);
});
