import { createPublicKey, verify, timingSafeEqual } from 'node:crypto';
import { AuthError } from './errors.mjs';

export const ENDPOINTS = Object.freeze({
  issuer: 'https://auth.openai.com',
  discovery: 'https://auth.openai.com/.well-known/openid-configuration',
  authorization: 'https://auth.openai.com/api/accounts/authorize',
  token: 'https://auth.openai.com/api/accounts/oauth/token',
  revocation: 'https://auth.openai.com/api/accounts/oauth/revoke',
  jwks: 'https://auth.openai.com/.well-known/jwks.json',
  resource: 'https://api.openai.com/v1',
});
const READ_ENDPOINTS = new Set([ENDPOINTS.discovery, ENDPOINTS.jwks]);
const WRITE_ENDPOINTS = new Set([ENDPOINTS.token, ENDPOINTS.revocation]);
const TERMINAL_REFRESH = new Set(['invalid_grant', 'invalid_refresh_token', 'token_expired', 'refresh_token_expired', 'refresh_token_invalidated', 'refresh_token_reused']);
export const isTerminalRefresh = code => TERMINAL_REFRESH.has(code);

export function equalSecret(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readJson(response) {
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > 262_144) throw new AuthError('invalid_response');
  if (!response.body) throw new AuthError('invalid_response');
  const reader = response.body.getReader();
  let bytes = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 262_144) { await reader.cancel(); throw new AuthError('invalid_response'); }
      chunks.push(Buffer.from(value));
    }
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new AuthError('invalid_response');
    return result;
  } catch (error) { throw error instanceof AuthError ? error : new AuthError('invalid_response'); }
  finally { reader.releaseLock(); }
}

export function createOfficialTransport(fetchImpl) {
  return async function request(url, { form, signal, emptySuccess = false } = {}) {
    if (!(form ? WRITE_ENDPOINTS : READ_ENDPOINTS).has(url)) throw new AuthError('invalid_options');
    if (signal?.aborted) throw new AuthError('cancelled');
    const timeout = AbortSignal.timeout(15_000);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response;
    try {
      response = await fetchImpl(url, {
        method: form ? 'POST' : 'GET',
        headers: form ? { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' } : { accept: 'application/json' },
        ...(form ? { body: new URLSearchParams(form).toString() } : {}),
        redirect: 'error', signal: combined, credentials: 'omit', cache: 'no-store',
      });
      if (response.redirected || (response.url && response.url !== url) || (response.status >= 300 && response.status < 400)) throw new AuthError('invalid_response');
      if (emptySuccess && response.status === 200) {
        await response.body?.cancel();
        return {};
      }
      const data = await readJson(response);
      if (response.status !== 200) {
        const code = typeof data.error === 'string' ? data.error : data.error?.code;
        // Exact machine codes only; never retain provider text, raw bodies, or causes.
        const error = new AuthError(isTerminalRefresh(code) ? 'invalid_grant' : code === 'invalid_client' ? 'invalid_client' : 'invalid_response', { status: response.status });
        throw error;
      }
      return data;
    } catch (error) {
      if (signal?.aborted) throw new AuthError('cancelled');
      throw error instanceof AuthError ? error : new AuthError('network_error');
    }
  };
}

export function createOidcValidator({ request, now }) {
  let discovery;
  let keys;
  let keysAt = 0;
  async function configuration(signal) {
    if (!discovery) {
      const value = await request(ENDPOINTS.discovery, { signal });
      if (value.issuer !== ENDPOINTS.issuer || value.authorization_endpoint !== ENDPOINTS.authorization
        || value.token_endpoint !== ENDPOINTS.token || value.jwks_uri !== ENDPOINTS.jwks
        || value.revocation_endpoint !== ENDPOINTS.revocation
        || !value.id_token_signing_alg_values_supported?.includes('RS256')) throw new AuthError('invalid_discovery');
      discovery = value;
    }
    return discovery;
  }
  async function loadKeys(signal) {
    const value = await request(ENDPOINTS.jwks, { signal });
    if (!Array.isArray(value.keys) || value.keys.length > 100) throw new AuthError('invalid_id_token');
    keys = value.keys;
    keysAt = now();
  }
  async function validate(idToken, { clientId, nonce, subject, signal }) {
    try {
      if (typeof idToken !== 'string' || idToken.length > 32_768) throw new AuthError('invalid_id_token');
      const segments = idToken.split('.');
      if (segments.length !== 3 || segments.some(value => !/^[A-Za-z0-9_-]+$/.test(value))) throw new AuthError('invalid_id_token');
      const header = JSON.parse(Buffer.from(segments[0], 'base64url').toString('utf8'));
      const claims = JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8'));
      if (!header || header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid || header.kid.length > 200
        || header.crit !== undefined || header.b64 !== undefined || header.jku !== undefined || header.jwk !== undefined || header.x5u !== undefined) throw new AuthError('invalid_id_token');
      await configuration(signal);
      const hadFreshKeys = keys && now() - keysAt < 300_000;
      if (!hadFreshKeys) await loadKeys(signal);
      let matching = keys.filter(key => key.kid === header.kid);
      if (!matching.length && hadFreshKeys) { await loadKeys(signal); matching = keys.filter(key => key.kid === header.kid); }
      if (matching.length !== 1) throw new AuthError('invalid_id_token');
      const jwk = matching[0];
      if (jwk.kty !== 'RSA' || (jwk.use && jwk.use !== 'sig') || (jwk.alg && jwk.alg !== 'RS256')
        || (jwk.key_ops && (!Array.isArray(jwk.key_ops) || !jwk.key_ops.includes('verify'))) || jwk.d !== undefined) throw new AuthError('invalid_id_token');
      const key = createPublicKey({ key: jwk, format: 'jwk' });
      if ((key.asymmetricKeyDetails?.modulusLength ?? 0) < 2048
        || !verify('RSA-SHA256', Buffer.from(`${segments[0]}.${segments[1]}`), key, Buffer.from(segments[2], 'base64url'))) throw new AuthError('invalid_id_token');
      const second = now() / 1000;
      const audience = claims.aud;
      const validAudience = audience === clientId || (Array.isArray(audience) && audience.length > 0 && audience.every(a => typeof a === 'string') && audience.includes(clientId));
      if (claims.iss !== ENDPOINTS.issuer || !validAudience
        || (Array.isArray(audience) && audience.length > 1 && claims.azp !== clientId)
        || (claims.azp !== undefined && claims.azp !== clientId)
        || !Number.isSafeInteger(claims.exp) || claims.exp <= second - 5
        || !Number.isSafeInteger(claims.iat) || claims.iat > second + 5 || claims.iat >= claims.exp
        || (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || claims.nbf > second + 5))
        || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 1000
        || (nonce !== undefined && !equalSecret(claims.nonce, nonce))
        || (subject !== undefined && claims.sub !== subject)) throw new AuthError('invalid_id_token');
      return { issuer: claims.iss, subject: claims.sub, email: typeof claims.email === 'string' && claims.email.length <= 320 ? claims.email : null };
    } catch (error) {
      if (error instanceof AuthError && ['cancelled', 'network_error', 'invalid_discovery'].includes(error.code)) throw error;
      throw new AuthError('invalid_id_token');
    }
  }
  return { configuration, validate };
}
