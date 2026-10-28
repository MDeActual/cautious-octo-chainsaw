const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const http = require('node:http');
const { createRequire } = require('node:module');
const auth = require('@cloudmatrix/auth-utils');
const jwt = createRequire(require.resolve('@cloudmatrix/auth-utils'))('jsonwebtoken');
const { createApp } = require('../dist/app.js');
const { assessmentStore } = require('../dist/store.js');
const { GraphProxyClient } = require('../dist/clients/graph-proxy.client.js');

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const OID = '33333333-3333-4333-8333-333333333333';
const AUD = '44444444-4444-4444-8444-444444444444';
const template = 'https://login.microsoftonline.com/{tenantid}/v2.0';
const issuer = tid => template.replace('{tenantid}', tid);
const config = { audience: AUD, tenantIssuer: template, requiredScope: 'user_impersonation' };
// Ephemeral local signing fixtures; never use a production tenant or signing key.
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const wrongKeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...keys.publicKey.export({ format: 'jwk' }), kid: 'local-key', use: 'sig', alg: 'RS256', issuer: template };
let keyFetches = 0;
const resolve = auth.createSigningKeyResolver(async url => {
  assert.equal(url, 'https://login.microsoftonline.com/organizations/discovery/v2.0/keys');
  keyFetches++;
  return { keys: [jwk] };
});
const validate = auth.createTokenValidator(config, resolve);
function token(tid = A, overrides = {}, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const claims = { ver: '2.0', tid, oid: OID, iss: issuer(tid), aud: AUD,
    iat: now - 10, nbf: now - 10, exp: now + 600, scp: 'user_impersonation', ...overrides };
  for (const key of Object.keys(claims)) if (claims[key] === undefined) delete claims[key];
  return jwt.sign(claims, options.key ?? keys.privateKey, { algorithm: 'RS256', keyid: options.kid ?? 'local-key' });
}

let server, port, businessCalls = 0, storageCalls = 0, graphCalls = 0;
const routes = [
  ['GET', '/assessments/:tenantId/current'], ['GET', '/assessments/:tenantId/history'],
  ['GET', '/assessments/:tenantId/trends'], ['POST', '/assessments/:tenantId/refresh'],
  ['GET', '/compliance/:tenantId/frameworks'], ['GET', '/compliance/:tenantId/status'],
  ['GET', '/leads/:tenantId/rank'],
];
// Instrument the real Express business handlers, not an imitation test endpoint.
for (const name of ['assessments', 'compliance', 'leads']) {
  const router = require(`../dist/routes/${name}.js`)[`${name}Router`];
  for (const layer of router.stack) {
    for (const handler of layer.route?.stack ?? []) {
      const original = handler.handle;
      handler.handle = function (...args) { businessCalls++; return original.apply(this, args); };
    }
  }
}
const originals = {};
for (const method of ['add', 'getLatest', 'getHistory']) {
  originals[method] = assessmentStore[method];
  assessmentStore[method] = (...args) => { storageCalls++; return originals[method](...args); };
}
const graphOriginals = {};
for (const method of ['getSecureScore', 'getRecommendations']) {
  graphOriginals[method] = GraphProxyClient.prototype[method];
  GraphProxyClient.prototype[method] = async tid => {
    graphCalls++;
    return method === 'getRecommendations' ? [] : {
      tenant_id: tid, current_score: 10, max_score: 100, average_comparative_score: 5, created_at: '2026-01-01T00:00:00Z',
    };
  };
}
const originalFetch = global.fetch;
// The event publisher is stubbed; any unexpected external call fails the test.
global.fetch = async (url, init) => {
  assert.equal(url, 'http://localhost:3004/events');
  assert.equal(init.method, 'POST');
  return { ok: true };
};
before(async () => {
  server = createApp(validate).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  port = server.address().port;
});
after(async () => {
  global.fetch = originalFetch;
  Object.assign(assessmentStore, originals);
  Object.assign(GraphProxyClient.prototype, graphOriginals);
  await new Promise(resolve => server.close(resolve));
});
beforeEach(() => { businessCalls = storageCalls = graphCalls = 0; });
function request(path, credential, method = 'GET', body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method, headers: {
      ...(credential === undefined ? {} : { Authorization: `Bearer ${credential}` }),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers,
    } }, res => {
      let text = ''; res.setEncoding('utf8'); res.on('data', chunk => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(text) }));
    });
    req.on('error', reject); req.end(body === undefined ? undefined : JSON.stringify(body));
  });
}
const failures = [
  ['no token', () => undefined, 401], ['malformed token', () => 'invalid', 401],
  ['invalid signature', () => token(A, {}, { key: wrongKeys.privateKey }), 401],
  ['expired token', () => token(A, { exp: 100 }), 401],
  ['wrong issuer', () => token(A, { iss: 'https://attacker.invalid/' }), 401],
  ['wrong audience', () => token(A, { aud: B }), 401],
  ['missing tid', () => token(A, { tid: undefined }), 401],
  ['missing oid', () => token(A, { oid: undefined }), 401],
  ['ID token with matching audience but no delegated scope', () => token(A, { scp: undefined, nonce: 'id-token-nonce' }), 403],
  ['Graph access token even with app scope', () => token(A, { aud: '00000003-0000-0000-c000-000000000000' }), 401],
  ['API token missing required scope', () => token(A, { scp: 'unrelated.scope' }), 403],
  ['issuer tenant disagrees with tid', () => token(A, { iss: issuer(B) }), 401],
  ['not-yet-valid token', () => token(A, { nbf: Math.floor(Date.now() / 1000) + 300 }), 401],
  ['missing expiry', () => token(A, { exp: undefined }), 401],
  ['invalid tenant identifier', () => token(A, { tid: 'tenant-A' }), 401],
  ['missing issued-at', () => jwt.sign({ tid: A, oid: OID, iss: issuer(A), aud: AUD, ver: '2.0', scp: 'user_impersonation', exp: 9999999999, nbf: 1 }, keys.privateKey, { algorithm: 'RS256', keyid: 'local-key', noTimestamp: true }), 401],
  ['app-only token', () => token(A, { idtyp: 'app', scp: undefined, roles: ['Admin'] }), 401],
  ['v1 token', () => token(A, { ver: '1.0' }), 401],
  ['consumer tenant', () => token('9188040d-6c67-4c5b-b112-36a304b66dad'), 401],
  ['unsigned token', () => jwt.sign({ tid: A }, '', { algorithm: 'none' }), 401],
  ['HMAC algorithm confusion', () => jwt.sign({ tid: A }, 'test-only-local-secret', { algorithm: 'HS256', keyid: 'local-key' }), 401],
];
for (const [name, credential, status] of failures) {
  test(`denies ${name} before every business handler or storage call`, async () => {
    const value = credential();
    for (const [method, path] of routes) {
      const result = await request(path.replace(':tenantId', A), value, method);
      assert.equal(result.status, status, path);
      assert.equal(result.body.data, null);
      if (value) assert.ok(!JSON.stringify(result.body).includes(value));
    }
    assert.equal(businessCalls, 0); assert.equal(storageCalls, 0); assert.equal(graphCalls, 0);
  });
}
for (const [own, other] of [[A, B], [B, A]]) {
  test(`denies cross-tenant path access from ${own} to ${other} on all routes`, async () => {
    for (const [method, path] of routes) assert.equal((await request(path.replace(':tenantId', other), token(own), method)).status, 403);
    assert.equal(businessCalls, 0); assert.equal(storageCalls, 0); assert.equal(graphCalls, 0);
  });
}
for (const [name, query, body, headers] of [
  ['body', '', { tenant_id: B }, {}], ['nested body', '', { input: { tid: B } }, {}],
  ['query', `?tenantId=${B}`, undefined, {}], ['duplicate query', `?tid=${A}&tid=${B}`, undefined, {}],
  ['structured query', `?tenant_id[value]=${A}`, undefined, {}],
  ['header', '', undefined, { 'x-tenant-id': B }], ['duplicate header', '', undefined, { 'x-tenant-id': [A, B] }],
  ['invalid body selector', '', { tenantId: null }, {}],
]) {
  test(`denies ${name} tenant mismatch before business logic`, async () => {
    const result = await request(`/assessments/${A}/refresh${query}`, token(), 'POST', body, headers);
    assert.equal(result.status, 403);
    assert.equal(businessCalls, 0); assert.equal(storageCalls, 0); assert.equal(graphCalls, 0);
  });
}
test('valid tenant requests use verified tid; mutable names cannot select tenant; two-tenant histories stay separate', async () => {
  for (const tid of [A, B]) {
    const result = await request(`/assessments/${tid}/refresh?tid=${tid}`, token(tid, { email: 'same@example.test', preferred_username: 'same@example.test' }), 'POST', { tenant_id: tid, email: 'other@example.test', DBA: B }, { 'x-tenant-id': tid });
    assert.equal(result.status, 201); assert.equal(result.body.data.tenant_id, tid);
    for (const [method, path] of routes.filter(([m]) => m === 'GET')) {
      const response = await request(path.replace(':tenantId', tid), token(tid), method);
      assert.equal(response.status, 200);
    }
    const history = await request(`/assessments/${tid}/history`, token(tid));
    assert.equal(history.body.data.length, 1);
    assert.equal(history.body.data[0].tenant_id, tid);
  }
  assert.ok(businessCalls > 0); assert.ok(storageCalls > 0); assert.equal(graphCalls, 4);
});
test('public health has no business access and unknown business routes remain protected', async () => {
  assert.equal((await request('/health')).status, 200);
  assert.equal((await request('/future-business-route')).status, 401);
  assert.equal(businessCalls, 0);
});
test('a mismatched upstream tenant cannot be persisted or published by a valid caller', async () => {
  const original = GraphProxyClient.prototype.getSecureScore;
  GraphProxyClient.prototype.getSecureScore = async () => ({ tenant_id: B, current_score: 10, max_score: 100 });
  try {
    const response = await request(`/assessments/${A}/refresh`, token(A), 'POST');
    assert.equal(response.status, 502);
    assert.equal(response.body.data, null);
    assert.equal(storageCalls, 0);
    assert.equal(graphCalls, 0, 'recommendations are not requested after mismatched data');
  } finally {
    GraphProxyClient.prototype.getSecureScore = original;
  }
});
test('principal contains immutable tid/oid, is frozen, and does not copy email or arbitrary claims', async () => {
  const p = await validate(token(A, { email: 'mutable@example.test', tenant_id: B }));
  assert.equal(p.tid, A); assert.equal(p.oid, OID); assert.ok(Object.isFrozen(p));
  assert.ok(Object.isFrozen(p.scopes)); assert.equal(p.email, undefined); assert.equal(p.tenant_id, undefined);
  assert.equal(keyFetches, 1, 'key and issuer are cached together');
});
test('key issuer must bind the exact signing key to the token tenant', async () => {
  for (const keyIssuer of [issuer(B), 'https://attacker.invalid/{tenantid}', undefined]) {
    const resolver = auth.createSigningKeyResolver(async () => ({ keys: [{ ...jwk, issuer: keyIssuer }] }));
    await assert.rejects(auth.createTokenValidator(config, resolver)(token(A)));
  }
  const scoped = auth.createSigningKeyResolver(async () => ({ keys: [{ ...jwk, issuer: issuer(A) }] }));
  assert.equal((await auth.createTokenValidator(config, scoped)(token(A))).tid, A);
  await assert.rejects(auth.createTokenValidator(config, scoped)(token(B)));
});
test('unknown key and JWKS unavailability fail closed', async () => {
  await assert.rejects(validate(token(A, {}, { kid: 'unknown' })));
  const unavailable = auth.createSigningKeyResolver(async () => { throw new Error('offline fixture'); });
  await assert.rejects(auth.createTokenValidator(config, unavailable)(token()));
});
test('rejects missing/unsafe configuration and bypass in production and development', () => {
  for (const env of [{}, { TENANT_ISSUER: template }, { TENANT_ISSUER: template, API_AUDIENCE: AUD }]) {
    assert.throws(() => auth.loadAuthConfig(env));
  }
  for (const mode of ['production', 'development', 'test']) {
    assert.throws(() => auth.loadAuthConfig({ TENANT_ISSUER: template, API_AUDIENCE: AUD, API_REQUIRED_SCOPE: 'user_impersonation', ALLOW_AUTH_BYPASS: 'true', NODE_ENV: mode }));
  }
  for (const override of [{ tenantIssuer: 'https://login.microsoftonline.com/common/v2.0' }, { audience: 'api://' + AUD }, { audience: '00000003-0000-0000-c000-000000000000' }, { requiredScope: '' }]) {
    assert.throws(() => auth.createTokenValidator({ ...config, ...override }, resolve));
  }
});
test('single-tenant configuration cannot accept another tenant', async () => {
  const single = auth.createTokenValidator({ ...config, tenantIssuer: issuer(A) }, resolve);
  await assert.rejects(single(token(B)));
  assert.equal((await single(token(A))).tid, A);
});
