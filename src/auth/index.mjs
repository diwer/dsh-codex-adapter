import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';
import { AuthError, safeError, formatAuthError } from './errors.mjs';
import { createOfficialTransport, createOidcValidator, ENDPOINTS, equalSecret } from './oidc.mjs';
import { harnessSuccessPage } from './callback-page.mjs';
export { AuthError } from './errors.mjs';
export { MemoryCredentialStore, FileCredentialStore } from './store.mjs';

export const REQUESTED_SCOPES = Object.freeze(['openid', 'profile', 'email', 'offline_access', 'resource.invoke', 'chatgpt.tokens.use.direct']);
export const LOGIN_TIMEOUT_MS = 600_000;
const REQUIRED_USAGE = ['resource.invoke', 'chatgpt.tokens.use.direct'];
const DYNAMIC_CLIENT = 'dynamic_agent_client';
const validClient = value => typeof value === 'string' && value !== DYNAMIC_CLIENT && /^[A-Za-z0-9._~:-]{1,256}$/.test(value);
const validAccountId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
const tokenString = value => typeof value === 'string' && value.length > 0 && value.length <= 65_536 && !/[\r\n\0]/.test(value);
const accountKey = (client, subject) => createHash('sha256').update(JSON.stringify([ENDPOINTS.issuer, client, subject])).digest('base64url');
const planEnabled = record => REQUIRED_USAGE.every(scope => record.scopes?.includes(scope));

function publicAccount(accountId, record) {
  return {
    accountId, clientId: record.clientId, subject: record.subject, email: record.email ?? null,
    signedIn: Boolean(record.accessToken), planUsageEnabled: Boolean(record.accessToken && planEnabled(record)),
    expiresAt: record.expiresAt ?? null, needsSignIn: !record.accessToken,
    scopes: Array.isArray(record.scopes) ? [...record.scopes] : [],
  };
}
function clearTokens(record) {
  for (const key of ['accessToken', 'refreshToken', 'idToken', 'expiresAt', 'earliestRefreshAt', 'savedAt', 'tokenType', 'scopes']) delete record[key];
}
function requireRecord(state, accountId) {
  const record = validAccountId(accountId) ? state.accounts[accountId] : undefined;
  if (!record || record.issuer !== ENDPOINTS.issuer || !validClient(record.clientId)
    || typeof record.subject !== 'string' || accountKey(record.clientId, record.subject) !== accountId) throw new AuthError('not_signed_in');
  return record;
}
function callbackUri(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.pathname !== '/auth/callback'
      || url.username || url.password || url.search || url.hash || url.href !== value) throw new Error();
    return url;
  } catch { throw new AuthError('invalid_options'); }
}
function tokenFields(data, now, oldRecord) {
  const checks={access_token:tokenString(data.access_token),refresh_token:tokenString(data.refresh_token),
    token_type:typeof data.token_type==='string'&&data.token_type.toLowerCase()==='bearer',
    expires_in:Number.isSafeInteger(data.expires_in)&&data.expires_in>0&&data.expires_in<=86_400,
    scope:typeof data.scope==='string'&&data.scope.length<=4096,
    id_token:(oldRecord&&data.id_token===undefined)||tokenString(data.id_token)};
  for(const [field,valid]of Object.entries(checks))if(!valid)throw new AuthError('invalid_response',{stage:'token_response',field});
  const scopes = [...new Set(data.scope.split(/\s+/).filter(Boolean))];
  let earliestRefreshAt = null;
  if (data.earliest_refresh_at !== undefined && data.earliest_refresh_at !== null) {
    if (Number.isSafeInteger(data.earliest_refresh_at) && data.earliest_refresh_at >= 0) earliestRefreshAt = data.earliest_refresh_at * 1000;
    else if (typeof data.earliest_refresh_at === 'string' && /^\d{4}-\d\d-\d\dT/.test(data.earliest_refresh_at)) earliestRefreshAt = Date.parse(data.earliest_refresh_at);
    else throw new AuthError('invalid_response',{stage:'token_response',field:'earliest_refresh_at'});
    if (!Number.isFinite(earliestRefreshAt)) throw new AuthError('invalid_response',{stage:'token_response',field:'earliest_refresh_at'});
  }
  return {
    accessToken: data.access_token, refreshToken: data.refresh_token, idToken: data.id_token ?? oldRecord?.idToken,
    tokenType: 'Bearer', scopes, expiresAt: now + data.expires_in * 1000,
    earliestRefreshAt, savedAt: now,
  };
}

/** Uses only app-owned credentials. No Codex credential file or browser-cookie access. */
export function createAuthClient({ store, fetchImpl = globalThis.fetch, agentName = 'DSH Codex Adapter', now = Date.now, authorizationTimeoutMs = LOGIN_TIMEOUT_MS, onDiagnostic=()=>{} } = {}) {
  if (typeof store?.transaction !== 'function' || typeof fetchImpl !== 'function' || typeof now !== 'function'
    || typeof agentName !== 'string' || !agentName.trim() || agentName.length > 100 || /[\x00-\x1f]/.test(agentName)
    || !Number.isSafeInteger(authorizationTimeoutMs) || authorizationTimeoutMs < 60_000 || authorizationTimeoutMs > 3_600_000) throw new AuthError('invalid_options');
  const diagnostic=value=>{try{Promise.resolve(onDiagnostic(value)).catch(()=>{});}catch{}};
  const request = createOfficialTransport(fetchImpl,diagnostic);
  const oidc = createOidcValidator({ request, now });
  // A store must serialize across every client/process sharing the same credentials.
  const transact = async operation => {
    try { return await store.transaction(operation); }
    catch (error) { throw safeError(error, 'store_error'); }
  };

  async function accounts() {
    return transact(state => Object.entries(state.accounts).map(([id]) => publicAccount(id, requireRecord(state, id))));
  }

  async function startAuthorization({ redirectUri, accountId, promptConsent = false } = {}, retainedClientId) {
    callbackUri(redirectUri);
    const selected = await transact(state => {
      state.hostId ??= `urn:uuid:${randomUUID()}`;
      if (typeof state.hostId !== 'string' || !/^urn:uuid:[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(state.hostId)) throw new AuthError('store_error');
      const account = accountId === undefined ? null : requireRecord(state, accountId);
      return { hostId: state.hostId, clientId: account?.clientId ?? retainedClientId ?? DYNAMIC_CLIENT, subject: account?.subject, generation: account?.generation ?? 0 };
    });
    const state = randomBytes(32).toString('base64url');
    const nonce = randomBytes(32).toString('base64url');
    let verifier = randomBytes(32).toString('base64url');
    const createdAt = now();
    let consumed = false;
    const attemptController = new AbortController();
    let restartClientId;
    const authorize = new URL(ENDPOINTS.authorization);
    authorize.search = new URLSearchParams({
      client_id: selected.clientId,
      ...(selected.clientId === DYNAMIC_CLIENT ? { agent_name_hint: agentName } : {}),
      ext_agent_host_id: selected.hostId, response_type: 'code', redirect_uri: redirectUri,
      scope: REQUESTED_SCOPES.join(' '), resource: ENDPOINTS.resource, state, nonce,
      code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      ...(promptConsent === true ? { prompt: 'consent' } : {}),
    }).toString();

    function cancel() { consumed = true; verifier = ''; restartClientId = undefined; attemptController.abort(); }
    async function restart({ redirectUri: nextRedirect = redirectUri } = {}) {
      if (!restartClientId) throw new AuthError('expired_attempt');
      const retained = restartClientId;
      restartClientId = undefined;
      return startAuthorization({ redirectUri: nextRedirect, accountId, promptConsent }, retained);
    }
    async function complete(callbackUrl, { signal } = {}) {
      if (consumed || now() - createdAt > authorizationTimeoutMs || now() < createdAt) { cancel(); throw new AuthError('expired_attempt'); }
      consumed = true;
      signal = signal ? AbortSignal.any([signal, attemptController.signal]) : attemptController.signal;
      const savedVerifier = verifier;
      verifier = '';
      try {
        const url = new URL(callbackUrl);
        const expected = new URL(redirectUri);
        if (url.origin !== expected.origin || url.pathname !== expected.pathname || url.username || url.password || url.hash) throw new AuthError('invalid_callback');
        for (const key of ['state', 'code', 'client_id', 'error', 'iss']) if (url.searchParams.getAll(key).length > 1) throw new AuthError('invalid_callback');
        if (!equalSecret(url.searchParams.get('state'), state)) throw new AuthError('invalid_state');
        if (url.searchParams.has('iss') && url.searchParams.get('iss') !== ENDPOINTS.issuer) throw new AuthError('invalid_callback');
        if (url.searchParams.has('error')) throw new AuthError(url.searchParams.get('error') === 'access_denied' ? 'access_denied' : 'invalid_callback');
        const callbackClient = url.searchParams.get('client_id');
        const clientId = selected.clientId === DYNAMIC_CLIENT ? callbackClient : selected.clientId;
        if (!validClient(clientId) || (selected.clientId !== DYNAMIC_CLIENT && callbackClient !== null && callbackClient !== selected.clientId)) throw new AuthError('invalid_callback');
        const code = url.searchParams.get('code');
        if (!tokenString(code)) throw new AuthError('invalid_callback');
        diagnostic({event:'callback_validated',stage:'callback'});
        await oidc.configuration(signal);
        let data;
        try {
          data = await request(ENDPOINTS.token, { signal, form: { grant_type: 'authorization_code', client_id: clientId, code, code_verifier: savedVerifier, redirect_uri: redirectUri, resource: ENDPOINTS.resource } });
        } catch (error) {
          if (error.code === 'invalid_grant') restartClientId = clientId;
          throw error;
        }
        diagnostic({event:'token_response_received',stage:'token_response',expiresIn:data.expires_in,hasAccessToken:tokenString(data.access_token),hasRefreshToken:tokenString(data.refresh_token),hasIdToken:tokenString(data.id_token)});
        const fields = tokenFields(data, now());
        diagnostic({event:'token_response_validated',stage:'token_response'});
        const identity = await oidc.validate(fields.idToken, { clientId, nonce, signal });
        diagnostic({event:'id_token_validated',stage:'id_token'});
        if (selected.subject !== undefined && identity.subject !== selected.subject) throw new AuthError('account_mismatch');
        const id = accountKey(clientId, identity.subject);
        if (accountId !== undefined && id !== accountId) throw new AuthError('account_mismatch');
        return await transact(database => {
          if (signal.aborted) throw new AuthError('cancelled');
          // No pending or failed attempt can replace another registration.
          if (accountId !== undefined && (requireRecord(database, accountId).generation ?? 0) !== selected.generation) throw new AuthError('expired_attempt');
          database.accounts[id] = { generation: selected.generation + 1, issuer: identity.issuer, clientId, subject: identity.subject, email: identity.email, hostId: selected.hostId, ...fields };
          return publicAccount(id, database.accounts[id]);
        });
      } catch (error) { throw safeError(error, 'invalid_callback'); }
    }
    return Object.freeze({ authorizeUrl: authorize.href, expiresAt:createdAt+authorizationTimeoutMs, complete, cancel, restart });
  }

  const beginAuthorization = options => startAuthorization(options);

  function session(accountId) {
    if (!validAccountId(accountId)) throw new AuthError('invalid_options');
    async function status() { return transact(state => publicAccount(accountId, requireRecord(state, accountId))); }
    async function accessToken(signal) {
      if (signal?.aborted) throw new AuthError('cancelled');
      const result = await transact(async state => {
        if (signal?.aborted) throw new AuthError('cancelled');
        const record = requireRecord(state, accountId);
        if (!tokenString(record.accessToken) || !Number.isFinite(record.expiresAt)) throw new AuthError('not_signed_in');
        if (!planEnabled(record)) throw new AuthError('plan_permission_missing');
        if (now() < record.expiresAt - 60_000 || (record.earliestRefreshAt && now() < record.earliestRefreshAt && now() < record.expiresAt)) return { token: record.accessToken };
        if (record.earliestRefreshAt && now() < record.earliestRefreshAt) throw new AuthError('refresh_not_ready');
        if (!tokenString(record.refreshToken)) throw new AuthError('reauthentication_required');
        try {
          await oidc.configuration(signal);
          const data = await request(ENDPOINTS.token, { signal, form: { grant_type: 'refresh_token', client_id: record.clientId, refresh_token: record.refreshToken, resource: ENDPOINTS.resource } });
          const fields = tokenFields(data, now(), record);
          if (data.id_token !== undefined) await oidc.validate(fields.idToken, { clientId: record.clientId, subject: record.subject, signal });
          Object.assign(record, fields);
          return planEnabled(record) ? { token: record.accessToken } : { error: new AuthError('plan_permission_missing') };
        } catch (error) {
          if (error instanceof AuthError && error.code === 'invalid_grant') {
            clearTokens(record);
            return { error: new AuthError('reauthentication_required') };
          }
          throw error;
        }
      });
      if (result.error) throw result.error;
      return result.token;
    }
    async function logout({ signal } = {}) {
      return transact(async state => {
        const record = requireRecord(state, accountId);
        let remoteRevoked = !record.refreshToken && record.remoteRevocationConfirmed === true;
        if (record.refreshToken) {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const config = await oidc.configuration(signal);
              await request(config.revocation_endpoint, { signal, emptySuccess: true, form: { token: record.refreshToken, token_type_hint: 'refresh_token', client_id: record.clientId } });
              remoteRevoked = true;
              break;
            } catch (error) {
              if (signal?.aborted || !(error.code === 'network_error' || error.status >= 500) || attempt === 2) break;
              try { await sleep(100 * 2 ** attempt, undefined, { signal }); } catch { break; }
            }
          }
        }
        clearTokens(record);
        record.remoteRevocationConfirmed = remoteRevoked;
        record.generation = (record.generation ?? 0) + 1;
        return { accountId, signedOut: true, remoteRevoked };
      });
    }
    return Object.freeze({ accessToken, status, logout });
  }

  async function login({ accountId, onAuthorize, signal, port = 0, promptConsent = false, returnToHarness = false } = {}) {
    if (typeof onAuthorize !== 'function' || !Number.isInteger(port) || port < 0 || port > 65535 || typeof returnToHarness !== 'boolean') throw new AuthError('invalid_options');
    if (signal?.aborted) throw new AuthError('cancelled');
    const flowController = new AbortController();
    signal = signal ? AbortSignal.any([signal, flowController.signal]) : flowController.signal;
    let attempt;
    let finish;
    let settled = false;
    let handlingCallback = false;
    let codeRestarts = 0;
    const flow=randomBytes(8).toString('hex');
    const log=value=>diagnostic({...value,flow});
    log({event:'login_started'});
    const expiresAt=now()+authorizationTimeoutMs;
    const outcome = new Promise(resolve => { finish = resolve; });
    const end = result => { if (!settled) { settled = true; finish(result); } };
    const server = createServer(async (req, res) => {
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      res.setHeader('referrer-policy', 'no-referrer');
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('content-security-policy', "default-src 'none'; frame-ancestors 'none'");
      if (!attempt || settled || handlingCallback || req.method !== 'GET' || !req.url?.startsWith('/auth/callback?') || req.url.length > 16_384) { res.writeHead(404); res.end('Not found.'); return; }
      const redirectUri = `http://127.0.0.1:${server.address().port}/auth/callback`;
      if (req.headers.host !== new URL(redirectUri).host) { res.writeHead(400); res.end('Invalid callback.'); return; }
      log({event:'callback_received',stage:'callback'});
      handlingCallback = true;
      try {
        const account = await attempt.complete(`${new URL(redirectUri).origin}${req.url}`, { signal });
        log({event:'credentials_saved',stage:'credential_store'});
        if (returnToHarness) {
          const page = harnessSuccessPage();
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.setHeader('content-security-policy', page.contentSecurityPolicy);
          res.end(page.html);
        } else res.end('Sign-in complete. You can close this window.');
        end({ account });
      } catch (error) {
        res.writeHead(400); res.end(`Sign-in failed. ${formatAuthError(error)}\nReturn to the application and start a new sign-in. Do not refresh this callback page.`);
        if (error.code === 'invalid_grant' && codeRestarts++ === 0 && !signal?.aborted) {
          try {
            attempt = await attempt.restart();
            handlingCallback = false;
            await onAuthorize(attempt.authorizeUrl,{expiresAt});
          } catch (retryError) { end({ error: safeError(retryError) }); }
        } else end({ error: safeError(error) });
      }
    });
    server.requestTimeout = 10_000;
    server.headersTimeout = 5_000;
    const abort = () => end({ error: new AuthError('cancelled') });
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => {
      end({ error: new AuthError('expired_attempt') });
      flowController.abort();
    }, authorizationTimeoutMs);
    timer.unref();
    try {
      await new Promise((resolve, reject) => {
        server.once('error', () => reject(new AuthError('callback_unavailable')));
        server.listen({ port, host: '127.0.0.1', exclusive: true }, resolve);
      });
      log({event:'listener_ready',port:server.address().port});
      if (signal?.aborted) throw new AuthError('cancelled');
      attempt = await beginAuthorization({ accountId, promptConsent, redirectUri: `http://127.0.0.1:${server.address().port}/auth/callback` });
      log({event:'authorization_ready'});
      Promise.resolve().then(() => onAuthorize(attempt.authorizeUrl,{expiresAt}))
        .catch(error => end({ error: safeError(error) }));
      const result = await outcome;
      if (result.error) throw result.error;
      log({event:'login_succeeded'});
      return result.account;
    } catch (error) { const safe=safeError(error);log({event:'login_failed',code:safe.code,stage:safe.stage,status:safe.status,field:safe.field});throw safe; }
    finally {
      flowController.abort();
      attempt?.cancel();
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      server.closeAllConnections();
      if (server.listening) await new Promise(resolve => server.close(resolve));
      log({event:'listener_closed'});
    }
  }
  return Object.freeze({ accounts, beginAuthorization, session, login });
}
