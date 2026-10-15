/** Safe, structured adapter errors never retain response bodies or credentials. */
export class AdapterError extends Error {
  constructor(message, code, facts = {}) {
    super(message);
    this.name = 'AdapterError';
    this.code = code;
    for (const key of ['status', 'providerCode', 'providerParam', 'requestId', 'providerRetryAfterMs', 'bodyKind']) {
      if (facts[key] !== undefined) this[key] = facts[key];
    }
  }
}

export function protocol(message = 'The provider stream did not match the expected protocol.') {
  return new AdapterError(message, 'PROTOCOL_ERROR');
}

export function safeCode(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_.\[\]-]{1,160}$/.test(value) ? value : undefined;
}

/** Preserve actionable error facts, without reflecting server-controlled text or tokens. */
export function providerError(status, body, headers = new Headers()) {
  const error = body?.error && typeof body.error === 'object' ? body.error : body;
  const providerCode = safeCode(error?.code);
  const providerParam = safeCode(error?.param);
  const requestId = safeCode(headers.get('x-request-id'));
  const seconds = Number(headers.get('retry-after'));
  const providerRetryAfterMs = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 3600000) : undefined;
  let code = status === 401 ? 'AUTH' : status === 403 ? 'PERMISSION_DENIED' : status === 429 ? 'RATE_LIMIT' : 'PROVIDER_HTTP_ERROR';
  let message = `OpenAI request failed${status ? ` (HTTP ${status})` : ''}.`;
  if (providerCode === 'subscription_sharing_usage_limit_exceeded') {
    code = 'SUBSCRIPTION_LIMIT';
    message = 'ChatGPT plan usage is limited for this app. Check https://chatgpt.com/settings/usage before retrying.';
  } else if (providerCode === 'subscription_sharing_unsupported_capability') {
    code = 'UNSUPPORTED_CAPABILITY';
    message = 'The ChatGPT plan route does not support this request capability.';
  } else if (providerCode === 'subscription_sharing_user_not_eligible') {
    code = 'SUBSCRIPTION_NOT_ELIGIBLE';
    message = 'The selected ChatGPT account or workspace is not eligible for this request.';
  }
  const bodyKind = body?.error ? 'error' : typeof body?.detail === 'string' ? 'detail' : typeof body;
  return new AdapterError(message, code, {status, providerCode, providerParam, requestId, providerRetryAfterMs, bodyKind});
}
