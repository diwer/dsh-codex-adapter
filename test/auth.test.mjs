import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createAuthClient, MemoryCredentialStore, FileCredentialStore, AuthError, REQUESTED_SCOPES } from '../src/auth/index.mjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const { privateKey: wrongKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-only-key', alg: 'RS256', use: 'sig' };
const URLS = {
  issuer: 'https://auth.openai.com',
  discovery: 'https://auth.openai.com/.well-known/openid-configuration',
  token: 'https://auth.openai.com/api/accounts/oauth/token',
  revoke: 'https://auth.openai.com/api/accounts/oauth/revoke',
  jwks: 'https://auth.openai.com/.well-known/jwks.json',
};
const discovery = {
  issuer: URLS.issuer,
  authorization_endpoint: 'https://auth.openai.com/api/accounts/authorize',
  token_endpoint: URLS.token,
  revocation_endpoint: URLS.revoke,
  jwks_uri: URLS.jwks,
  id_token_signing_alg_values_supported: ['RS256'],
};
const seconds = 1_790_000_000;
function jwt(claims, key = privateKey, header = {}) {
  const encode = object => Buffer.from(JSON.stringify(object)).toString('base64url');
  const input = `${encode({ alg: 'RS256', kid: jwk.kid, ...header })}.${encode({ iss: URLS.issuer, aud: 'oaiapp_fake', sub: 'fake-subject', email: 'fake@example.invalid', iat: seconds, exp: seconds + 3600, ...claims })}`;
  return `${input}.${sign('RSA-SHA256', Buffer.from(input), key).toString('base64url')}`;
}
function fixture({ store = new MemoryCredentialStore(), claims = {}, signingKey, header, token = {}, fetchOverride, subject = 'fake-subject' } = {}) {
  let time = seconds * 1000;
  let currentNonce;
  let refreshCount = 0;
  let refreshFailure;
  let revokeFailure;
  const calls = [];
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
  const fetchImpl = async (url, options) => {
    calls.push({ url, ...options });
    assert.equal(options.redirect, 'error');
    assert.equal(options.credentials, 'omit');
    if (fetchOverride) {
      const response = await fetchOverride(url, options, json);
      if (response) return response;
    }
    if (url === URLS.discovery) return json(discovery);
    if (url === URLS.jwks) return json({ keys: [jwk] });
    if (url === URLS.token) {
      const form = new URLSearchParams(options.body);
      assert.equal(form.get('resource'), 'https://api.openai.com/v1');
      assert.equal(form.has('client_secret'), false);
      if (form.get('grant_type') === 'refresh_token') {
        refreshCount++;
        assert.equal(form.has('scope'), false);
        if (refreshFailure) return json({ error: refreshFailure, error_description: 'DO-NOT-LEAK-SECRET' }, 400);
        return json({ access_token: `fake-access-${refreshCount}`, refresh_token: `fake-refresh-${refreshCount}`, token_type: 'Bearer', expires_in: 3600, scope: REQUESTED_SCOPES.join(' ') });
      }
      return json({ access_token: 'fake-access-initial', refresh_token: 'fake-refresh-initial', id_token: jwt({ sub: subject, nonce: currentNonce, ...claims }, signingKey, header), token_type: 'Bearer', expires_in: 3600, scope: REQUESTED_SCOPES.join(' '), ...token });
    }
    if (url === URLS.revoke) {
      if (revokeFailure) throw new Error('DO-NOT-LEAK-SECRET');
      return new Response(null, { status: 200 });
    }
    throw new Error('Unexpected URL');
  };
  const auth = createAuthClient({ store, fetchImpl, now: () => time });
  const begin = async (options = {}) => {
    const attempt = await auth.beginAuthorization({ redirectUri: 'http://127.0.0.1:54321/auth/callback', ...options });
    const parsed = new URL(attempt.authorizeUrl);
    currentNonce = parsed.searchParams.get('nonce');
    const callback = new URL(parsed.searchParams.get('redirect_uri'));
    callback.search = new URLSearchParams({ code: 'fake-code', state: parsed.searchParams.get('state'), client_id: 'oaiapp_fake' }).toString();
    return { attempt, callback, authorize: parsed };
  };
  return { auth, store, begin, calls, fetchImpl, advance: ms => { time += ms; }, setNonce: nonce => { currentNonce = nonce; }, refreshCount: () => refreshCount, failRefresh: code => { refreshFailure = code; }, failRevoke: () => { revokeFailure = true; } };
}
const codeIs = expected => error => { assert.ok(error instanceof AuthError); assert.equal(error.code, expected); assert.doesNotMatch(JSON.stringify(error) + error.message, /DO-NOT-LEAK|fake-access|fake-refresh|fake-code/); return true; };
async function signedIn(f) { const { attempt, callback } = await f.begin(); return attempt.complete(callback.href); }

test('new dynamic registration uses PKCE, stable host, exact redirect and issued client', async () => {
  const f = fixture();
  const { attempt, callback, authorize } = await f.begin();
  assert.equal(authorize.searchParams.get('client_id'), 'dynamic_agent_client');
  assert.equal(authorize.searchParams.get('agent_name_hint'), 'DSH Codex Adapter');
  assert.equal(authorize.searchParams.get('code_challenge_method'), 'S256');
  assert.match(authorize.searchParams.get('ext_agent_host_id'), /^urn:uuid:/);
  assert.equal(authorize.searchParams.has('id_token_hint'), false);
  const account = await attempt.complete(callback.href);
  assert.equal(account.signedIn, true);
  assert.equal(account.planUsageEnabled, true);
  assert.equal(await f.auth.session(account.accountId).accessToken(), 'fake-access-initial');
  assert.doesNotMatch(JSON.stringify(account), /fake-access|fake-refresh|idToken/);
  const exchange = new URLSearchParams(f.calls.find(call => call.url === URLS.token).body);
  assert.equal(exchange.get('client_id'), 'oaiapp_fake');
  assert.equal(exchange.get('redirect_uri'), 'http://127.0.0.1:54321/auth/callback');
  assert.match(exchange.get('code_verifier'), /^[A-Za-z0-9_-]{43}$/);
  const returning = await f.begin({ accountId: account.accountId });
  assert.equal(returning.authorize.searchParams.get('client_id'), 'oaiapp_fake');
  assert.equal(returning.authorize.searchParams.has('agent_name_hint'), false);
  assert.equal(returning.authorize.searchParams.get('ext_agent_host_id'), authorize.searchParams.get('ext_agent_host_id'));
  returning.callback.searchParams.delete('client_id');
  assert.equal((await returning.attempt.complete(returning.callback.href)).accountId, account.accountId);
});

test('bad state is rejected before code exchange and callback is one-time', async () => {
  const f = fixture();
  const { attempt, callback } = await f.begin();
  callback.searchParams.set('state', 'wrong');
  await assert.rejects(attempt.complete(callback.href), codeIs('invalid_state'));
  assert.equal(f.calls.length, 0);
  await assert.rejects(attempt.complete(callback.href), codeIs('expired_attempt'));
});

test('access_denied callback validates state and never exchanges', async () => {
  const f = fixture();
  const { attempt, callback } = await f.begin();
  callback.searchParams.set('error', 'access_denied');
  await assert.rejects(attempt.complete(callback.href), codeIs('access_denied'));
  assert.equal(f.calls.length, 0);
});

for (const [name, options] of [
  ['nonce', { claims: { nonce: 'wrong-nonce' } }],
  ['audience', { claims: { aud: 'oaiapp_other' } }],
  ['issuer', { claims: { iss: 'https://untrusted.invalid' } }],
  ['signature', { signingKey: wrongKey }],
  ['expiration', { claims: { exp: seconds - 10 } }],
  ['missing subject', { claims: { sub: '' } }],
  ['future issuance', { claims: { iat: seconds + 30 } }],
  ['multiple audiences without azp', { claims: { aud: ['oaiapp_fake', 'oaiapp_other'] } }],
  ['wrong azp', { claims: { azp: 'oaiapp_other' } }],
  ['algorithm', { header: { alg: 'HS256' } }],
  ['external JWKS header', { header: { jku: 'https://untrusted.invalid/jwks' } }],
]) test(`ID token rejects ${name}`, async () => {
  const f = fixture(options);
  await assert.rejects(signedIn(f), codeIs('invalid_id_token'));
  assert.deepEqual(await f.auth.accounts(), []);
  assert.ok(f.calls.every(call => call.url.startsWith('https://auth.openai.com/')));
});

test('scope denial retains identity but cannot return an inference token', async () => {
  const f = fixture({ token: { scope: 'openid profile email offline_access' } });
  const account = await signedIn(f);
  assert.equal(account.signedIn, true);
  assert.equal(account.planUsageEnabled, false);
  await assert.rejects(f.auth.session(account.accountId).accessToken(), codeIs('plan_permission_missing'));
});

test('parallel refreshes rotate once; all waiters use the replacement', async () => {
  const f = fixture();
  const account = await signedIn(f);
  f.advance(3_550_000);
  const tokens = await Promise.all(Array.from({ length: 20 }, () => f.auth.session(account.accountId).accessToken()));
  assert.deepEqual(new Set(tokens), new Set(['fake-access-1']));
  assert.equal(f.refreshCount(), 1);
  f.advance(3_550_000);
  assert.equal(await f.auth.session(account.accountId).accessToken(), 'fake-access-2');
  const refreshCalls = f.calls.filter(call => call.url === URLS.token && new URLSearchParams(call.body).get('grant_type') === 'refresh_token');
  assert.equal(new URLSearchParams(refreshCalls[1].body).get('refresh_token'), 'fake-refresh-1');
});

for (const code of ['invalid_grant', 'invalid_refresh_token', 'token_expired', 'refresh_token_expired', 'refresh_token_invalidated', 'refresh_token_reused']) test(`terminal refresh ${code} clears tokens but retains client mapping`, async () => {
  const f = fixture();
  const account = await signedIn(f);
  f.advance(3_600_000); f.failRefresh(code);
  await assert.rejects(f.auth.session(account.accountId).accessToken(), codeIs('reauthentication_required'));
  const status = await f.auth.session(account.accountId).status();
  assert.equal(status.clientId, 'oaiapp_fake');
  assert.equal(status.signedIn, false);
  const returning = await f.begin({ accountId: account.accountId });
  assert.equal(returning.authorize.searchParams.get('client_id'), 'oaiapp_fake');
});

test('network refresh failure preserves stored credentials and emits safe error', async () => {
  let fail = false;
  const f = fixture({ fetchOverride: async (url, options) => {
    if (fail && url === URLS.token) throw new Error(`DO-NOT-LEAK-SECRET ${options.body}`);
  } });
  const account = await signedIn(f);
  f.advance(3_600_000); fail = true;
  await assert.rejects(f.auth.session(account.accountId).accessToken(), codeIs('network_error'));
  assert.equal((await f.auth.session(account.accountId).status()).signedIn, true);
});

test('malicious discovery and HTTP redirects are rejected before secrets leave', async () => {
  const f = fixture({ fetchOverride: async (url, options, json) => url === URLS.discovery ? json({ ...discovery, token_endpoint: 'https://evil.invalid/token' }) : undefined });
  await assert.rejects(signedIn(f), codeIs('invalid_discovery'));
  assert.equal(f.calls.length, 1);
  const redirect = fixture({ fetchOverride: async url => url === URLS.token ? new Response(null, { status: 307, headers: { location: 'https://evil.invalid' } }) : undefined });
  await assert.rejects(signedIn(redirect), codeIs('invalid_response'));
  assert.ok(redirect.calls.every(call => call.redirect === 'error'));
});

test('returning client mismatch is rejected before network and identity mismatch cannot replace account', async () => {
  const f = fixture();
  const account = await signedIn(f);
  const originalCount = f.calls.length;
  const retry = await f.begin({ accountId: account.accountId });
  retry.callback.searchParams.set('client_id', 'oaiapp_wrong');
  await assert.rejects(retry.attempt.complete(retry.callback.href), codeIs('invalid_callback'));
  assert.equal(f.calls.length, originalCount);
  const other = fixture({ store: f.store, subject: 'other-subject' });
  const attempt = await other.begin({ accountId: account.accountId });
  await assert.rejects(attempt.attempt.complete(attempt.callback.href), codeIs('account_mismatch'));
  assert.equal((await f.auth.accounts()).length, 1);
});

test('account registrations with same email stay isolated', async () => {
  const f = fixture();
  const first = await signedIn(f);
  const other = fixture({ store: f.store, subject: 'second-subject' });
  const second = await signedIn(other);
  assert.notEqual(first.accountId, second.accountId);
  assert.equal(first.email, second.email);
  assert.equal((await f.auth.accounts()).length, 2);
});

test('logout revokes and clears credentials while retaining registration and host', async () => {
  const f = fixture();
  const account = await signedIn(f);
  const result = await f.auth.session(account.accountId).logout();
  assert.equal(result.remoteRevoked, true);
  await assert.rejects(f.auth.session(account.accountId).accessToken(), codeIs('not_signed_in'));
  assert.equal((await f.auth.accounts())[0].clientId, 'oaiapp_fake');
  const revocation = new URLSearchParams(f.calls.find(call => call.url === URLS.revoke).body);
  assert.equal(revocation.get('token'), 'fake-refresh-initial');
  assert.equal(revocation.get('token_type_hint'), 'refresh_token');
});

test('failed remote revocation is explicit; local credentials are still removed', async () => {
  const f = fixture();
  const account = await signedIn(f); f.failRevoke();
  assert.equal((await f.auth.session(account.accountId).logout()).remoteRevoked, false);
  assert.equal((await f.auth.session(account.accountId).status()).signedIn, false);
  assert.equal(f.calls.filter(call => call.url === URLS.revoke).length, 3);
});

test('callback destination, duplicate state, expiry, and cancellation fail closed', async () => {
  const f = fixture();
  for (const uri of ['http://localhost:1455/auth/callback', 'https://127.0.0.1:1455/auth/callback', 'http://127.0.0.1:1455/callback', 'http://127.0.0.1:1455/auth/callback?x=1']) {
    await assert.rejects(f.auth.beginAuthorization({ redirectUri: uri }), codeIs('invalid_options'));
  }
  const duplicate = await f.begin();
  duplicate.callback.searchParams.append('state', 'other');
  await assert.rejects(duplicate.attempt.complete(duplicate.callback.href), codeIs('invalid_callback'));
  const expired = await f.begin(); f.advance(600_001);
  await assert.rejects(expired.attempt.complete(expired.callback.href), codeIs('expired_attempt'));
  const cancelled = await f.begin(); cancelled.attempt.cancel();
  await assert.rejects(cancelled.attempt.complete(cancelled.callback.href), codeIs('expired_attempt'));
});

test('loopback login emits only authorize URL and closes listener after callback', async () => {
  const f = fixture();
  let emitted;
  const account = await f.auth.login({ onAuthorize: async url => {
    emitted = new URL(url);
    f.setNonce(emitted.searchParams.get('nonce'));
    const callback = new URL(emitted.searchParams.get('redirect_uri'));
    callback.search = new URLSearchParams({ state: emitted.searchParams.get('state'), code: 'fake-code', client_id: 'oaiapp_fake' }).toString();
    const response = await fetch(callback);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(await response.text(), /fake-access|fake-refresh|fake-code/);
  } });
  assert.equal(account.signedIn, true);
  assert.doesNotMatch(emitted.href, /id_token_hint|fake-refresh|fake-access/);
  await assert.rejects(fetch(emitted.searchParams.get('redirect_uri')));
});

test('already-aborted signals never start login or expose a token', async () => {
  const f = fixture();
  const account = await signedIn(f);
  const signal = AbortSignal.abort();
  await assert.rejects(f.auth.login({ signal, onAuthorize() { assert.fail('must not emit'); } }), codeIs('cancelled'));
  await assert.rejects(f.auth.session(account.accountId).accessToken(signal), codeIs('cancelled'));
});

test('file store uses owner-only atomic files and serializes separate clients', async t => {
  const directory = await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()), 'dsh-auth-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const f = fixture({ store: new FileCredentialStore({ directory }) });
  const account = await signedIn(f);
  assert.equal((await fs.stat(path.join(directory, 'credentials.json'))).mode & 0o777, 0o600);
  assert.equal((await fs.stat(directory)).mode & 0o777, 0o700);
  f.advance(3_600_000);
  const second = createAuthClient({ store: new FileCredentialStore({ directory }), fetchImpl: f.fetchImpl, now: () => (seconds + 3600) * 1000 });
  const tokens = await Promise.all([f.auth.session(account.accountId).accessToken(), second.session(account.accountId).accessToken()]);
  assert.deepEqual(tokens, ['fake-access-1', 'fake-access-1']);
  assert.equal(f.refreshCount(), 1);
  assert.deepEqual((await fs.readdir(directory)).sort(), ['credentials.json']);
});

test('file store rejects permissive directories, permissive files, and symlinks', async t => {
  const directory = await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()), 'dsh-auth-perms-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const store = new FileCredentialStore({ directory });
  await fs.chmod(directory, 0o755);
  await assert.rejects(store.transaction(() => {}), codeIs('insecure_store'));
  await fs.chmod(directory, 0o700);
  await fs.writeFile(path.join(directory, 'credentials.json'), '{}', { mode: 0o644 });
  await assert.rejects(store.transaction(() => {}), codeIs('insecure_store'));
  await fs.unlink(path.join(directory, 'credentials.json'));
  await fs.symlink('/dev/null', path.join(directory, 'credentials.json'));
  await assert.rejects(store.transaction(() => {}), codeIs('store_error'));
});

test('file lock timeout does not steal another process lock', async t => {
  const directory = await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()), 'dsh-auth-lock-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const lock = path.join(directory, 'credentials.lock');
  await fs.writeFile(lock, 'fake-process', { mode: 0o600 });
  const store = new FileCredentialStore({ directory, lockTimeoutMs: 0 });
  await assert.rejects(store.transaction(() => {}), codeIs('store_busy'));
  assert.equal(await fs.readFile(lock, 'utf8'), 'fake-process');
});

test('invalid code can restart once with the issued client and fresh PKCE/state', async () => {
  let failed = false;
  const f = fixture({ fetchOverride: async (url, options, json) => {
    if (url === URLS.token && !failed) { failed = true; return json({ error: 'invalid_grant', error_description: 'DO-NOT-LEAK-SECRET' }, 400); }
  } });
  const first = await f.begin();
  await assert.rejects(first.attempt.complete(first.callback.href), codeIs('invalid_grant'));
  const retry = await first.attempt.restart();
  const authorization = new URL(retry.authorizeUrl);
  assert.equal(authorization.searchParams.get('client_id'), 'oaiapp_fake');
  assert.equal(authorization.searchParams.has('agent_name_hint'), false);
  assert.notEqual(authorization.searchParams.get('state'), first.authorize.searchParams.get('state'));
  assert.notEqual(authorization.searchParams.get('code_challenge'), first.authorize.searchParams.get('code_challenge'));
  f.setNonce(authorization.searchParams.get('nonce'));
  const callback = new URL(authorization.searchParams.get('redirect_uri'));
  callback.search = new URLSearchParams({ state: authorization.searchParams.get('state'), code: 'new-fake-code' }).toString();
  assert.equal((await retry.complete(callback.href)).clientId, 'oaiapp_fake');
  await assert.rejects(first.attempt.restart(), codeIs('expired_attempt'));
});

test('logout invalidates already-pending returning sign-in attempts', async () => {
  const f = fixture();
  const account = await signedIn(f);
  const pending = await f.begin({ accountId: account.accountId });
  await f.auth.session(account.accountId).logout();
  await assert.rejects(pending.attempt.complete(pending.callback.href), codeIs('expired_attempt'));
  assert.equal((await f.auth.session(account.accountId).status()).signedIn, false);
});

test('earliest_refresh_at prevents premature refresh', async () => {
  const f = fixture({ token: { earliest_refresh_at: seconds + 3580 } });
  const account = await signedIn(f);
  f.advance(3_550_000);
  assert.equal(await f.auth.session(account.accountId).accessToken(), 'fake-access-initial');
  assert.equal(f.refreshCount(), 0);
  f.advance(40_000);
  assert.equal(await f.auth.session(account.accountId).accessToken(), 'fake-access-1');
});

test('rotated ID tokens must preserve the signed-in identity', async () => {
  let refresh = false;
  const f = fixture({ fetchOverride: async (url, options, json) => {
    if (refresh && url === URLS.token) return json({ access_token: 'fake-access-evil', refresh_token: 'fake-refresh-evil', token_type: 'Bearer', expires_in: 3600, scope: REQUESTED_SCOPES.join(' '), id_token: jwt({ sub: 'another-subject', iat: seconds + 3550, exp: seconds + 7150 }) });
  } });
  const account = await signedIn(f); f.advance(3_550_000); refresh = true;
  await assert.rejects(f.auth.session(account.accountId).accessToken(), codeIs('invalid_id_token'));
  assert.equal((await f.auth.session(account.accountId).status()).subject, 'fake-subject');
});

test('scope loss on refresh is atomically stored with replacement tokens', async () => {
  let refresh = false;
  const f = fixture({ fetchOverride: async (url, options, json) => {
    if (refresh && url === URLS.token) return json({ access_token: 'fake-access-reduced', refresh_token: 'fake-refresh-reduced', token_type: 'Bearer', expires_in: 3600, scope: 'openid profile email offline_access' });
  } });
  const account = await signedIn(f); f.advance(3_550_000); refresh = true;
  await assert.rejects(f.auth.session(account.accountId).accessToken(), codeIs('plan_permission_missing'));
  const saved = await f.store.transaction(state => structuredClone(state.accounts[account.accountId]));
  assert.equal(saved.refreshToken, 'fake-refresh-reduced');
  assert.equal(saved.accessToken, 'fake-access-reduced');
  assert.equal((await f.auth.session(account.accountId).status()).planUsageEnabled, false);
});

test('cancel during a deferred exchange cannot commit a credential record', async () => {
  let release;
  let entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const pending = new Promise(resolve => { release = resolve; });
  const f = fixture({ fetchOverride: async (url, options) => {
    if (url === URLS.token) {
      entered();
      // Intentionally simulate an uncooperative transport that ignores abort.
      await pending;
    }
  } });
  const { attempt, callback } = await f.begin();
  const complete = attempt.complete(callback.href);
  await ready;
  attempt.cancel(); release();
  await assert.rejects(complete, codeIs('cancelled'));
  assert.deepEqual(await f.auth.accounts(), []);
});

test('login abort closes even when authorize callback never resolves', async () => {
  const f = fixture();
  const controller = new AbortController();
  let callbackUri;
  const login = f.auth.login({ signal: controller.signal, onAuthorize: async url => {
    callbackUri = new URL(url).searchParams.get('redirect_uri');
    controller.abort();
    await new Promise(() => {});
  } });
  await assert.rejects(login, codeIs('cancelled'));
  await assert.rejects(fetch(callbackUri));
  assert.deepEqual(await f.auth.accounts(), []);
});

test('issued client identifiers are opaque and do not require an oaiapp prefix', async () => {
  const clientId = 'issued-client:fake-v2';
  let nonce;
  const f = fixture({ fetchOverride: async (url, options, json) => {
    if (url === URLS.token) return json({ access_token: 'fake-access-opaque', refresh_token: 'fake-refresh-opaque', token_type: 'Bearer', expires_in: 3600, scope: REQUESTED_SCOPES.join(' '), id_token: jwt({ aud: clientId, nonce }) });
  } });
  const attempt = await f.auth.beginAuthorization({ redirectUri: 'http://127.0.0.1:54321/auth/callback' });
  const url = new URL(attempt.authorizeUrl); nonce = url.searchParams.get('nonce');
  const callback = new URL(url.searchParams.get('redirect_uri'));
  callback.search = new URLSearchParams({ state: url.searchParams.get('state'), code: 'fake-code', client_id: clientId }).toString();
  const account = await attempt.complete(callback.href);
  assert.equal(account.clientId, clientId);
  assert.equal(await f.auth.session(account.accountId).accessToken(), 'fake-access-opaque');
});

test('login timeout aborts a pending callback and forbids late credentials', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let release;
  let entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const pending = new Promise(resolve => { release = resolve; });
  const f = fixture({ fetchOverride: async url => {
    if (url === URLS.token) { entered(); await pending; }
  } });
  let callbackRequest;
  const login = f.auth.login({ onAuthorize: url => {
    const auth = new URL(url);
    f.setNonce(auth.searchParams.get('nonce'));
    const callback = new URL(auth.searchParams.get('redirect_uri'));
    callback.search = new URLSearchParams({ state: auth.searchParams.get('state'), code: 'fake-code', client_id: 'oaiapp_fake' }).toString();
    callbackRequest = fetch(callback).then(response => response.text()).catch(() => undefined);
  } });
  const rejected = assert.rejects(login, codeIs('expired_attempt'));
  await ready;
  t.mock.timers.tick(600_000);
  release();
  await rejected;
  await callbackRequest;
  assert.deepEqual(await f.auth.accounts(), []);
});

test('repeated local logout never upgrades unconfirmed revocation to confirmed', async () => {
  const f = fixture();
  const account = await signedIn(f); f.failRevoke();
  const session = f.auth.session(account.accountId);
  assert.equal((await session.logout()).remoteRevoked, false);
  assert.equal((await session.logout()).remoteRevoked, false);
  assert.equal(f.calls.filter(call => call.url === URLS.revoke).length, 3);
});
