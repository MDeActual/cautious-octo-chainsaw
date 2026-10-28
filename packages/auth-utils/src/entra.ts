import { createPublicKey, type JsonWebKey } from 'node:crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { VerifiedPrincipal } from '@cloudmatrix/shared-types';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const AUTHORITY = 'https://login.microsoftonline.com';
const CONSUMERS = '9188040d-6c67-4c5b-b112-36a304b66dad';
const GRAPH_AUDIENCE = '00000003-0000-0000-c000-000000000000';
export interface JwtValidationConfig {
  tenantIssuer: string;
  audience: string;
  requiredScope: string;
}

export function assertAuthConfig(config: JwtValidationConfig): void {
  const tenant = config.tenantIssuer?.match(/^https:\/\/login\.microsoftonline\.com\/([^/]+)\/v2\.0$/)?.[1];
  if (!tenant || (tenant !== '{tenantid}' && !GUID.test(tenant)) || tenant === CONSUMERS
      || !GUID.test(config.audience ?? '') || config.audience === GRAPH_AUDIENCE
      || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(config.requiredScope ?? '')) {
    throw new Error('Invalid SecurePulse API identity configuration');
  }
}

export function loadAuthConfig(env: NodeJS.ProcessEnv = process.env): JwtValidationConfig {
  if (env['ALLOW_AUTH_BYPASS'] && env['ALLOW_AUTH_BYPASS'] !== 'false') {
    throw new Error('Authentication bypass is not supported');
  }
  const config = {
    tenantIssuer: env['TENANT_ISSUER'] ?? '',
    audience: env['API_AUDIENCE'] ?? '',
    requiredScope: env['API_REQUIRED_SCOPE'] ?? '',
  };
  assertAuthConfig(config);
  return Object.freeze(config);
}

export interface IssuerSigningKey extends jwksClient.CertSigningKey { issuer: string; }
export type SigningKeyResolver = (kid: string) => Promise<IssuerSigningKey>;
export type TokenValidator = (token: string) => Promise<VerifiedPrincipal>;

/** Preserve Entra's issuer extension on the same key jwks-rsa caches/rate-limits.
 * Its default SigningKey conversion drops that extension. Node imports the JWK;
 * cryptographic JWT verification remains in the existing jsonwebtoken library.
 */
class EntraJwksClient extends jwksClient.JwksClient {
  override async getSigningKeys(): Promise<IssuerSigningKey[]> {
    const keys = await this.getKeys();
    if (!Array.isArray(keys)) throw new Error('Invalid signing keys');
    return keys.flatMap((value: unknown) => {
      if (!value || typeof value !== 'object') return [];
      const key = value as Record<string, unknown>;
      if (key['kty'] !== 'RSA' || key['use'] !== 'sig'
          || (key['alg'] !== undefined && key['alg'] !== 'RS256')
          || typeof key['kid'] !== 'string' || typeof key['issuer'] !== 'string') return [];
      const publicKey = createPublicKey({ key: key as JsonWebKey, format: 'jwk' })
        .export({ format: 'pem', type: 'spki' }).toString();
      return [{ kid: key['kid'], alg: 'RS256', issuer: key['issuer'], publicKey,
        getPublicKey: () => publicKey }];
    });
  }
}

export function createSigningKeyResolver(fetcher?: jwksClient.Options['fetcher']): SigningKeyResolver {
  const client = new EntraJwksClient({
    // No token-supplied jku, x5u, issuer URL or network destination is followed.
    jwksUri: `${AUTHORITY}/organizations/discovery/v2.0/keys`,
    cache: true, cacheMaxEntries: 5, cacheMaxAge: 600_000,
    rateLimit: true, jwksRequestsPerMinute: 10, timeout: 5_000,
    ...(fetcher ? { fetcher } : {}),
  });
  return async (kid) => await client.getSigningKey(kid) as IssuerSigningKey;
}

export class ApiScopeError extends Error {
  constructor() { super('Required API scope missing'); }
}

/** PR-01 accepts delegated v2 workforce access tokens only.
 * The resolver is an in-process test seam, never an environment bypass mode.
 */
export function createTokenValidator(
  config: JwtValidationConfig,
  resolveKey: SigningKeyResolver = createSigningKeyResolver(),
): TokenValidator {
  assertAuthConfig(config);
  const trusted = Object.freeze({ ...config });
  return async (token) => {
    if (token.length > 16_384) throw new Error('Invalid token');
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded.payload === 'string' || decoded.header.alg !== 'RS256'
        || typeof decoded.header.kid !== 'string' || !decoded.header.kid
        || decoded.header.kid.length > 256) throw new Error('Invalid token');
    // Untrusted tid selects an expected issuer string only. Verify before using it.
    const tid: unknown = decoded.payload['tid'];
    if (typeof tid !== 'string' || !GUID.test(tid) || tid === CONSUMERS) throw new Error('Invalid tenant');
    const issuer = `${AUTHORITY}/${tid}/v2.0`;
    if (trusted.tenantIssuer.replace('{tenantid}', tid) !== issuer) throw new Error('Invalid issuer');
    const key = await resolveKey(decoded.header.kid);
    if (key.kid !== decoded.header.kid || key.alg !== 'RS256'
        || typeof key.issuer !== 'string'
        || key.issuer.replace('{tenantid}', tid) !== issuer) throw new Error('Invalid key issuer');
    const claims = jwt.verify(token, key.getPublicKey(), {
      algorithms: ['RS256'], audience: trusted.audience, issuer, clockTolerance: 0,
    });
    if (typeof claims === 'string') throw new Error('Invalid claims');
    const now = Math.floor(Date.now() / 1000);
    if (claims['ver'] !== '2.0' || claims['tid'] !== tid
        || typeof claims['oid'] !== 'string' || !GUID.test(claims['oid'])
        || claims.aud !== trusted.audience
        || !Number.isFinite(claims.exp) || !Number.isFinite(claims.nbf) || !Number.isFinite(claims.iat)
        || claims.iat! > now || claims.exp! <= claims.iat! || claims.exp! <= claims.nbf!
        || claims['idtyp'] === 'app') throw new Error('Invalid claims');
    // ID tokens lack delegated API scopes. Role-only and app-only tokens are denied.
    if (typeof claims['scp'] !== 'string' || !claims['scp'].split(' ').includes(trusted.requiredScope)) {
      throw new ApiScopeError();
    }
    return Object.freeze({
      tid, oid: claims['oid'], issuer, audience: trusted.audience, expiresAt: claims.exp!,
      scopes: Object.freeze(claims['scp'].split(' ')),
      roles: Object.freeze(Array.isArray(claims['roles'])
        ? claims['roles'].filter((role: unknown): role is string => typeof role === 'string') : []),
    });
  };
}

export function extractBearerToken(header: string | undefined): string | null {
  return header?.match(/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i)?.[1] ?? null;
}
