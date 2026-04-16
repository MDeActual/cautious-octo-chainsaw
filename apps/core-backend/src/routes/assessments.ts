import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { buildAssessment } from '../services/scoring.js';
import type { ApiResponse, SecurityAssessment } from '@cloudmatrix/shared-types';

export const assessmentsRouter: ExpressRouter = Router();

// In-memory store for Phase 1 development
const assessmentStore = new Map<string, SecurityAssessment[]>();

const TriggerAssessmentSchema = z.object({
  tenant_id: z.string().uuid(),
  current_score: z.number().min(0),
  max_score: z.number().min(1),
});

/**
 * POST /assessments — trigger a new assessment
 * In production, this calls graph-proxy for the real Secure Score.
 */
assessmentsRouter.post('/', (req, res) => {
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

  const existing = assessmentStore.get(parse.data.tenant_id) ?? [];
  assessmentStore.set(parse.data.tenant_id, [...existing, assessment]);

  const response: ApiResponse<SecurityAssessment> = { data: assessment, error: null };
  res.status(201).json(response);
});

/**
 * GET /assessments/:tenantId — get assessment history for a tenant
 */
assessmentsRouter.get('/:tenantId', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const history = assessmentStore.get(tenantId) ?? [];
  const response: ApiResponse<SecurityAssessment[]> = {
    data: history,
    error: null,
    meta: { tenant_id: tenantId, count: history.length },
  };
  res.json(response);
});
