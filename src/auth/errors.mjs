const MESSAGES = Object.freeze({
  cancelled: 'Authentication was cancelled.',
  network_error: 'The authentication service could not be reached. Try again.',
  invalid_response: 'The authentication service returned an invalid response.',
  invalid_discovery: 'The authentication service configuration was not accepted.',
  invalid_id_token: 'The ID token could not be verified. Sign in again.',
  invalid_callback: 'The sign-in callback was not accepted. Start a new sign-in.',
  invalid_state: 'The sign-in state did not match. Start a new sign-in.',
  expired_attempt: 'This sign-in attempt has ended. Start a new sign-in.',
  access_denied: 'ChatGPT authorization was declined.',
  invalid_grant: 'The authorization grant is no longer usable. Sign in again.',
  invalid_client: 'The registered client was not accepted.',
  reauthentication_required: 'This account must sign in again.',
  account_mismatch: 'The sign-in identity did not match the selected account.',
  plan_permission_missing: 'ChatGPT plan usage is not enabled for this account.',
  not_signed_in: 'This account is not signed in.',
  store_error: 'The protected credential store could not be used.',
  insecure_store: 'The credential store requires a private, owner-controlled POSIX directory.',
  store_busy: 'The credential store is busy. Try again after the other operation completes.',
  unsupported_platform: 'The file credential store requires POSIX permissions. Supply a secure platform store.',
  invalid_options: 'The authentication options were not accepted.',
  refresh_not_ready: 'The token cannot be refreshed yet. Try again later.',
  callback_unavailable: 'The local sign-in callback could not be started.',
});

/** Intentionally excludes provider response bodies, tokens, URLs, and native causes. */
export class AuthError extends Error {
  constructor(code, { status } = {}) {
    super(MESSAGES[code] ?? MESSAGES.invalid_response);
    this.name = 'AuthError';
    this.code = Object.hasOwn(MESSAGES, code) ? code : 'invalid_response';
    if (Number.isInteger(status) && status >= 100 && status <= 599) this.status = status;
  }
}

export function safeError(error, fallback = 'invalid_response') {
  return error instanceof AuthError ? error : new AuthError(fallback);
}
