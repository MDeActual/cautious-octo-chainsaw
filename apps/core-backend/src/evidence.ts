import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

export interface Evidence {
  id: string; tenant_id: string; collected_at: string; source: 'microsoft_graph';
  secure_score: { current: number; max: number; percentage: number; reported_at: string };
  controls: { id: string; title: string; category: string; description: string; action_url: string | null; observed_score: number | null; max_score: number | null; score_gap: number | null }[];
  limitations: string[];
}
export class EvidenceError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export interface EvidenceStore {
  ready: boolean;
  history(tenant: string): Evidence[];
  add(tenant: string, evidence: Evidence): void;
  connection(tenant: string, oid: string): { connected: boolean; revision: string };
  setConnection(tenant: string, oid: string, connected: boolean): void;
}
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** Pilot-only durable single-process store. Mount an encrypted, backed-up private volume.
 * Not a substitute for production Postgres/RLS or multi-instance transaction control. */
export class FileEvidenceStore implements EvidenceStore {
  readonly ready: boolean;
  private readonly directory: string;
  constructor(directory = process.env['ASSESSMENT_DATA_DIR'] ?? '') {
    this.ready = Boolean(directory); this.directory = directory ? resolve(directory) : '';
    if (this.ready) {
      mkdirSync(this.directory, { recursive: true, mode: 0o700 });
      if ((statSync(this.directory).mode & 0o077) !== 0) throw new Error('Assessment directory must be private (0700)');
    }
  }
  private path(tenant: string, suffix: string): string {
    if (!this.ready) throw new EvidenceError(503, 'STORAGE_UNAVAILABLE', 'Durable assessment storage is not configured');
    if (!GUID.test(tenant)) throw new Error('Invalid tenant');
    return join(this.directory, `${tenant}-${suffix}.json`);
  }
  private read<T>(path: string, fallback: T): T {
    if (!existsSync(path)) return fallback;
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  }
  private write(path: string, value: unknown): void {
    const temp = `${path}.${randomUUID()}.tmp`;
    writeFileSync(temp, JSON.stringify(value), { mode: 0o600, flag: 'wx' });
    renameSync(temp, path);
  }
  history(tenant: string): Evidence[] { return this.read(this.path(tenant, 'evidence'), []); }
  add(tenant: string, evidence: Evidence): void {
    if (evidence.tenant_id !== tenant) throw new Error('Evidence tenant mismatch');
    this.write(this.path(tenant, 'evidence'), [...this.history(tenant), evidence].slice(-30));
  }
  connection(tenant: string, oid: string): { connected: boolean; revision: string } {
    if (!GUID.test(oid)) throw new Error('Invalid principal');
    return this.read(this.path(tenant, `connection-${oid}`), { connected: false, revision: '' });
  }
  setConnection(tenant: string, oid: string, connected: boolean): void {
    if (!GUID.test(oid)) throw new Error('Invalid principal');
    this.write(this.path(tenant, `connection-${oid}`), { connected, revision: randomUUID() });
  }
}
export interface GraphCollector { readonly configured: boolean; collect(tenant: string, assertion: string): Promise<Evidence>; }
/** Fixed authority and Graph resources. Never accept a caller-supplied resource URL. */
export class DelegatedGraphCollector implements GraphCollector {
  readonly configured: boolean;
  constructor(private readonly clientId = process.env['API_AUDIENCE'] ?? '',
    private readonly secret = process.env['GRAPH_OBO_CLIENT_SECRET'] ?? '', private readonly fetcher: typeof fetch = fetch) {
    this.configured = GUID.test(clientId) && Boolean(secret);
  }
  async collect(tenant: string, assertion: string): Promise<Evidence> {
    if (!this.configured) throw new EvidenceError(503, 'GRAPH_UNAVAILABLE', 'Delegated Microsoft Graph access is not configured');
    if (!GUID.test(tenant) || !assertion) throw new EvidenceError(401, 'UNAUTHORIZED', 'Verified user token required');
    const tokenResponse = await this.fetcher(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: this.clientId, client_secret: this.secret,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', requested_token_use: 'on_behalf_of',
        assertion, scope: 'https://graph.microsoft.com/SecurityEvents.Read.All' }),
    });
    if (!tokenResponse.ok) throw new EvidenceError(403, 'GRAPH_CONSENT_OR_ROLE_REQUIRED', 'Microsoft consent, sign-in or security-role authorization is required');
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) throw new EvidenceError(502, 'UPSTREAM_INVALID', 'Microsoft returned an invalid token response');
    const read = async (path: string): Promise<{ value?: unknown[] }> => {
      const response = await this.fetcher(`https://graph.microsoft.com/v1.0/${path}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }, redirect: 'error', signal: AbortSignal.timeout(15000),
      });
      if (response.status === 401 || response.status === 403) throw new EvidenceError(403, 'GRAPH_ACCESS_DENIED', 'Microsoft Graph did not authorize this security read');
      if (!response.ok) throw new EvidenceError(502, 'GRAPH_READ_FAILED', 'Microsoft Graph could not return assessment data');
      return await response.json() as { value?: unknown[] };
    };
    const scores = await read('security/secureScores?$top=100');
    const raw = scores.value?.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .sort((a, b) => Date.parse(String(b['createdDateTime'])) - Date.parse(String(a['createdDateTime'])))[0];
    if (!raw) throw new EvidenceError(404, 'NO_GRAPH_DATA', 'Microsoft has not returned a Secure Score for this tenant');
    const current = raw['currentScore']; const max = raw['maxScore']; const reported = raw['createdDateTime'];
    if (typeof current !== 'number' || typeof max !== 'number' || !Number.isFinite(current) || !Number.isFinite(max)
        || max <= 0 || current < 0 || current > max || typeof reported !== 'string' || !Number.isFinite(Date.parse(reported))) {
      throw new EvidenceError(502, 'UPSTREAM_INVALID', 'Secure Score data is incomplete or invalid');
    }
    if (typeof raw['azureTenantId'] !== 'string' || raw['azureTenantId'].toLowerCase() !== tenant) throw new EvidenceError(502, 'UPSTREAM_TENANT_MISMATCH', 'Microsoft returned data for an unexpected tenant');
    const profiles = await read('security/secureScoreControlProfiles?$top=100');
    if (!Array.isArray(profiles.value)) throw new EvidenceError(502, 'UPSTREAM_INVALID', 'Control profile data is invalid');
    const observations = Array.isArray(raw['controlScores']) ? raw['controlScores'] : [];
    const controls = profiles.value.flatMap(item => {
      if (!item || typeof item !== 'object') return [];
      const p = item as Record<string, unknown>;
      if (typeof p['id'] !== 'string' || typeof p['title'] !== 'string') return [];
      const url = typeof p['actionUrl'] === 'string' ? p['actionUrl'] : '';
      let safeUrl: string | null = null;
      try { const parsed = new URL(url); if (parsed.protocol === 'https:') safeUrl = parsed.href; } catch { /* no link */ }
      const observation = observations.find(item => item && typeof item === 'object' && item['controlName'] === p['id']);
      const observed = observation?.['score']; const maximum = p['maxScore'];
      const known = typeof observed === 'number' && Number.isFinite(observed) && typeof maximum === 'number'
        && Number.isFinite(maximum) && maximum > 0 && observed >= 0 && observed <= maximum;
      return [{ observed_score: known ? observed : null, max_score: known ? maximum : null, score_gap: known ? maximum - observed : null, id: p['id'], title: p['title'], category: typeof p['controlCategory'] === 'string' ? p['controlCategory'] : 'Unspecified',
        description: typeof p['remediation'] === 'string' ? p['remediation'] : '', action_url: safeUrl }];
    }).sort((a, b) => (b.score_gap ?? -1) - (a.score_gap ?? -1));
    return { id: randomUUID(), tenant_id: tenant, collected_at: new Date().toISOString(), source: 'microsoft_graph',
      secure_score: { current, max, percentage: Math.round(current / max * 10000) / 100, reported_at: reported }, controls,
      limitations: ['Secure Score is a security-posture indicator, not a breach probability or compliance determination.',
        'Control guidance is prioritized by observed Secure Score point gap where matching telemetry exists. Unknown controls have null scores; posture points are not breach probability or financial impact.',
        'This pilot selects the newest returned score from up to 100 records and retrieves up to 100 control profiles; it does not collect users, devices, alerts, or calculate sales intent.'] };
  }
}
