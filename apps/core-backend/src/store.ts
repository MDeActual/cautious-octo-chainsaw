import type { SecurityAssessment } from '@cloudmatrix/shared-types';

/**
 * In-memory assessment store for Phase 1 development.
 * When POSTGRES_URL is not set, all assessments are stored here.
 */
const store = new Map<string, SecurityAssessment[]>();

export const assessmentStore = {
  add(assessment: SecurityAssessment): void {
    const existing = store.get(assessment.tenant_id) ?? [];
    store.set(assessment.tenant_id, [...existing, assessment]);
  },

  getHistory(tenantId: string): SecurityAssessment[] {
    return store.get(tenantId) ?? [];
  },

  getLatest(tenantId: string): SecurityAssessment | null {
    const history = store.get(tenantId) ?? [];
    return history.length > 0 ? (history[history.length - 1] ?? null) : null;
  },
};
