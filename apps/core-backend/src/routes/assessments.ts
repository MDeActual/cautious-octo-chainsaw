import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { buildAssessment } from '../scoring.js';
import { query, getPool } from '../db.js';
import type { ApiResponse, SecurityAssessment } from '@cloudmatrix/shared-types';

export const assessmentsRouter: ExpressRouter = Router();

// In-memory store — used as fallback when POSTGRES_URL is not set
const assessmentStore = new Map<string, SecurityAssessment[]>();

const useDb = !!process.env['POSTGRES_URL'];

const TriggerAssessmentSchema = z.object({
  tenant_id: z.string().uuid(),
  current_score: z.number().min(0),
  max_score: z.number().min(1),
});

/**
 * POST /assessments — trigger a new assessment
 * In production, this calls graph-proxy for the real Secure Score.
 */
assessmentsRouter.post('/', async (req, res) => {
  const parse = TriggerAssessmentSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  const assessment = buildAssessment({
    tenant_id: parse.data.tenant_id,
    current_score: parse.data.current_score,
    max_score: parse.data.max_score,
    average_comparative_score: 50,
    created_at: new Date().toISOString(),
  });

  if (useDb) {
    await query(
      `INSERT INTO assessments
        (id, tenant_id, secure_score_raw, secure_score_max, security_percentage, risk_level, opportunity_score, lead_rank, assessed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        assessment.id,
        assessment.tenant_id,
        assessment.secure_score_raw,
        assessment.secure_score_max,
        assessment.security_percentage,
        assessment.risk_level,
        assessment.opportunity_score,
        assessment.lead_rank,
        assessment.assessed_at,
      ],
    );
  } else {
    const existing = assessmentStore.get(parse.data.tenant_id) ?? [];
    assessmentStore.set(parse.data.tenant_id, [...existing, assessment]);
  }

  const response: ApiResponse<SecurityAssessment> = { data: assessment, error: null };
  res.status(201).json(response);
});

/**
 * GET /assessments/:tenantId — get assessment history for a tenant
 */
assessmentsRouter.get('/:tenantId', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';

  let history: SecurityAssessment[];

  if (useDb) {
    const result = await query<SecurityAssessment>(
      `SELECT id, tenant_id, secure_score_raw, secure_score_max, security_percentage,
              risk_level, opportunity_score, lead_rank, assessed_at
       FROM assessments
       WHERE tenant_id = $1
       ORDER BY assessed_at DESC`,
      [tenantId],
    );
    history = result.rows;
  } else {
    history = assessmentStore.get(tenantId) ?? [];
  }

  const response: ApiResponse<SecurityAssessment[]> = {
    data: history,
    error: null,
    meta: { tenant_id: tenantId, count: history.length },
  };
  res.json(response);
});
