import { Router, type RequestHandler } from 'express';
import { extractBearerToken } from '@cloudmatrix/auth-utils';
import { verifiedPrincipal, requireTenantConsistency } from '../auth.js';
import { EvidenceError, type EvidenceStore, type GraphCollector } from '../evidence.js';

export function createEvidenceRouter(store: EvidenceStore, collector: GraphCollector): Router {
  const router = Router();
  router.use('/:tenantId', requireTenantConsistency);
  const handle = (fn: RequestHandler): RequestHandler => (req, res, next) => {
    Promise.resolve().then(() => fn(req, res, next)).catch(error => {
      const known = error instanceof EvidenceError;
      res.status(known ? error.status : 502).json({ data: null, error: known ? error.message : 'Assessment operation failed',
        code: known ? error.code : 'ASSESSMENT_FAILED' });
    });
  };
  const requireConnected = (tenant: string, oid: string) => {
    if (!store.connection(tenant, oid).connected) throw new EvidenceError(409, 'CONNECTION_REQUIRED', 'Connect this account before accessing stored findings or collecting data');
  };
  router.get('/:tenantId/connection', handle((_req, res) => {
    const p = verifiedPrincipal(res);
    res.json({ data: { configured: collector.configured, storage_ready: store.ready,
      connected: store.ready && store.connection(p.tid, p.oid).connected }, error: null });
  }));
  router.get('/:tenantId/current', handle((_req, res) => {
    const p = verifiedPrincipal(res); requireConnected(p.tid, p.oid);
    const latest = store.history(p.tid).at(-1);
    res.status(latest ? 200 : 404).json({ data: latest ?? null, error: latest ? null : 'No assessment has been collected' });
  }));
  router.get('/:tenantId/history', handle((_req, res) => {
    const p = verifiedPrincipal(res); requireConnected(p.tid, p.oid);
    res.json({ data: store.history(p.tid), error: null });
  }));
  for (const action of ['connect', 'refresh']) {
    router.post(`/:tenantId/${action}`, handle(async (req, res) => {
      const p = verifiedPrincipal(res);
      if (!store.ready) throw new EvidenceError(503, 'STORAGE_UNAVAILABLE', 'Durable assessment storage is not configured');
      if (action === 'refresh') requireConnected(p.tid, p.oid);
      const before = store.connection(p.tid, p.oid);
      const evidence = await collector.collect(p.tid, extractBearerToken(req.headers.authorization)!);
      if (store.connection(p.tid, p.oid).revision !== before.revision) {
        throw new EvidenceError(409, 'CONNECTION_CHANGED', 'Connection changed during collection; results were discarded');
      }
      if (evidence.tenant_id !== p.tid) throw new EvidenceError(502, 'UPSTREAM_TENANT_MISMATCH', 'Unexpected tenant data');
      store.add(p.tid, evidence);
      if (action === 'connect') store.setConnection(p.tid, p.oid, true);
      res.status(201).json({ data: evidence, error: null });
    }));
  }
  router.post('/:tenantId/disconnect', handle((_req, res) => {
    const p = verifiedPrincipal(res); store.setConnection(p.tid, p.oid, false);
    res.json({ data: { connected: false, microsoft_consent_revoked: false,
      retained_findings: true, message: 'Collection and stored-result access are disabled for this account. Microsoft admin consent and retained findings are unchanged.' }, error: null });
  }));
  return router;
}
