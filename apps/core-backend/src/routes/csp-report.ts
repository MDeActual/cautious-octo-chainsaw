import { Router, type Router as ExpressRouter } from 'express';
import { createLogger } from '@cloudmatrix/logger';
import type { ApiResponse, CspMonthlyReport, CspUsageRecord } from '@cloudmatrix/shared-types';
import { assessmentStore } from '../store.js';

export const cspReportRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'core-backend' });

/**
 * GET /csp/monthly-report/:partnerTenantId
 *
 * Returns a monthly active usage report for all CSP-managed tenants associated
 * with a CloudMatrix partner tenant.
 *
 * This report supports Microsoft CPOR (Customer Product & User Relationship)
 * and PAL (Partner Admin Link) incentive claims by providing evidence of:
 *   - Tenants managed under the CSP agreement
 *   - Monthly active user counts per tenant
 *   - Number of assessments and AI summaries generated
 *
 * Query params:
 *   month  — report month in YYYY-MM format (defaults to current month)
 *
 * Note: Phase 1 implementation computes this from the in-memory assessment store.
 * In Phase 2, this will query the PostgreSQL assessments table with proper
 * tenant → CSP partner attribution.
 */
cspReportRouter.get('/:partnerTenantId', async (req, res) => {
  const partnerTenantId = req.params['partnerTenantId'] ?? '';
  const rawMonth = typeof req.query['month'] === 'string' ? req.query['month'] : undefined;

  const reportMonth = rawMonth ?? new Date().toISOString().slice(0, 7); // YYYY-MM

  logger.info('Generating CSP monthly report', { partner_tenant_id: partnerTenantId, month: reportMonth });

  // Phase 1: return a stub report from in-memory store.
  // Real implementation will filter by csp_partner_tenant_id in the DB.
  const allTenants = assessmentStore.getAllTenants();

  const tenantRecords: CspUsageRecord[] = allTenants.map((tenantId) => {
    const history = assessmentStore.getHistory(tenantId);
    const monthlyAssessments = history.filter((a) => a.assessed_at.startsWith(reportMonth));

    return {
      tenant_id: tenantId,
      tenant_name: tenantId,
      csp_partner_tenant_id: partnerTenantId,
      month: reportMonth,
      active_user_count: monthlyAssessments[0]?.user_count ?? 0,
      assessment_count: monthlyAssessments.length,
      ai_summary_count: 0,
      tier: 'Free',
    };
  });

  const report: CspMonthlyReport = {
    partner_tenant_id: partnerTenantId,
    report_month: reportMonth,
    generated_at: new Date().toISOString(),
    total_tenants: tenantRecords.length,
    total_active_users: tenantRecords.reduce((sum, t) => sum + t.active_user_count, 0),
    total_assessments: tenantRecords.reduce((sum, t) => sum + t.assessment_count, 0),
    tenants: tenantRecords,
  };

  const response: ApiResponse<CspMonthlyReport> = { data: report, error: null };
  res.json(response);
});
