# Authentication module

This module implements the documented **Sign in with ChatGPT (SIWC) open-source token-sharing flow** for this independent adapter. It does not use Codex `auth.json`, browser cookies, private service endpoints, official-client impersonation, an API key, or a client secret. DSH integration is a separate adapter concern; the credential store here is this project's own interface, not a claimed DSH storage API.

## Public API

Import from `src/auth/index.mjs`:

- `createAuthClient({ store, fetchImpl = fetch, agentName = 'DSH Codex Adapter', now = Date.now })`
- `MemoryCredentialStore`
- `FileCredentialStore`
- `AuthError`
- `REQUESTED_SCOPES` (frozen scope array)

`now()` returns epoch milliseconds. `fetchImpl` is injectable for tests; production must use a trusted Fetch implementation with its normal TLS validation. Do not replace either dependency from untrusted configuration.

### Client

```js
import { createAuthClient, FileCredentialStore } from './src/auth/index.mjs';

const store = new FileCredentialStore({
  directory: '/absolute/app-owned/private/directory',
  lockTimeoutMs: 30_000,
});
const auth = createAuthClient({ store });

// This starts an actual user-authorized OAuth flow. Do not call during offline tests.
const account = await auth.login({
  onAuthorize: url => process.stdout.write(`${url}\n`),
  signal: abortController.signal,
  // accountId: previouslySavedAccountId, // Returning registration, if selected.
  // port: 0,                           // Default: ephemeral loopback port.
  // promptConsent: false,              // Default; true only on explicit reconsent.
});

const session = auth.session(account.accountId);
const accessToken = await session.accessToken(abortController.signal);
// Pass only to the documented official inference endpoint; never print it.
const status = await session.status();
const result = await session.logout({ signal: abortController.signal });
```

Do not automatically call `login()` just because a model request fails. The caller must obtain the user's authentication/consent authorization first. `onAuthorize` receives only the authorization URL; it does not receive a token, code verifier, login hint, or ID-token hint. The URL still carries a short-lived sign-in transaction and must not go to third-party telemetry. The module does not open a browser itself.

- `auth.accounts()` returns saved account metadata.
- `auth.login({ accountId?, onAuthorize, signal?, port = 0, promptConsent = false })` binds to `127.0.0.1`, starts its listener before emitting the URL, and returns validated account metadata. Callback path is always `/auth/callback`. The attempt expires after ten minutes. Cancellation closes the listener. One authorization-code `invalid_grant` can emit a fresh URL using the issued client ID; another failure ends the attempt.
- `auth.session(accountId).accessToken(signal?)` returns a string. It does not return a token without the direct-use and resource-invocation scopes. It refreshes close to expiry and stores the replacement access token, refresh token, scopes, and expiry together.
- `.status()` returns metadata without credentials.
- `.logout({ signal? })` attempts official refresh-token revocation, then removes that account's local tokens. It returns `{ accountId, signedOut: true, remoteRevoked }`. If `remoteRevoked` is false, tell the user remote revocation was not confirmed and that they can disconnect the app in [ChatGPT settings](https://chatgpt.com/settings). Local sign-out still completes; repeating logout preserves an earlier unconfirmed-revocation result. Network/5xx revocation failures get two bounded backoff retries. The caller must stop/cancel its own already-running inference requests before logout; previously returned bearer-token strings cannot be recalled.

Account metadata is `{ accountId, clientId, subject, email, signedIn, planUsageEnabled, expiresAt, needsSignIn, scopes }`. `expiresAt` is epoch milliseconds or null. `signedIn` means stored credentials exist, not that the current access token is unexpired or that the remote account has been probed. Account identity is keyed by the verified issuer, issued client ID, and subject. Equal emails do not merge records. A returning flow cannot replace a different selected identity. Signing out retains the client/account mapping and host ID.

### Lower-level callback integration

```js
const attempt = await auth.beginAuthorization({
  redirectUri: 'http://127.0.0.1:54321/auth/callback',
  accountId: selectedAccountId, // Optional; omit for new registration.
});
// An external caller must have already bound its matching loopback listener.
showAuthorizeUrl(attempt.authorizeUrl);
const account = await attempt.complete(actualCallbackUrl, { signal });
// attempt.cancel() invalidates the attempt and aborts in-flight network work.
```

`complete()` consumes the attempt exactly once, including on an invalid callback. Do not send callback URLs to logs. If an authorization-code exchange returns `AuthError.code === 'invalid_grant'`, `attempt.restart({ redirectUri? })` creates a new transaction with the issued registration ID retained and fresh state, nonce, and PKCE. Restart is unavailable after other failures, success, cancellation, or a previous restart. No unverified identity or incomplete token set is saved as an account.

## Protocol and security controls

- Initial registration uses `dynamic_agent_client`, the actual app name, and a persisted UUIDv4 `urn:uuid:` host identifier. Returning accounts reuse their issued opaque client ID and the same host ID.
- Uses authorization code, PKCE S256, 256-bit random state/nonce/verifier, exact callback matching, constant-time state/nonce equality, one-time transaction consumption, and a ten-minute attempt lifetime. The listener accepts only a matching `127.0.0.1` Host header and callback route. It never echoes query parameters or tokens in HTML/text.
- Discovers the issuer, token, authorization, JWKS, and revocation endpoints from the official discovery document, and pins each to its documented exact HTTPS production URL. Token/revocation requests have `redirect: 'error'`; no secret-bearing URL parameters or alternate origins are accepted. Reads are bounded to 256 KiB; requests have 15-second deadlines. Fetch error details and provider response bodies are not attached to errors.
- ID tokens are cryptographically verified with Node's `crypto` against the official JWKS. Current production discovery declares RS256; this MVP supports only RS256 RSA keys of at least 2048 bits. It rejects alternate algorithms, ambiguous/unknown keys, external key-location headers, and unsupported critical headers. It checks issuer, issued-client audience, authorized party when needed, subject, expiry, issuance/not-before times, and the pending nonce. Clock tolerance is five seconds. JWKS is cached five minutes and refreshed once on a fresh-cache key miss. Future provider algorithms require a reviewed implementation change.
- Refresh ID tokens, when present, must also be signed and match the stored subject/client. Access-token internals and OpenAI authentication metadata remain opaque. They are never treated as verified identity claims.
- Missing plan scopes retain the validated sign-in with `planUsageEnabled: false`, while denying inference. A refresh scope reduction is saved atomically with the rotating credentials and then blocks inference. Explicit reconsent uses the complete scope set with supported `prompt=consent`; there is no default forced-consent loop or unconfirmed `force_reconsent` flag.
- The token response's `earliest_refresh_at`, if present, is accepted as Unix seconds or an ISO timestamp and prevents early renewal. Its precise wire representation is not specified in the reviewed prose documentation; unknown representations fail closed and need live-contract verification before release. Tokens otherwise refresh within 60 seconds of expiry.
- Terminal refresh codes documented by OpenAI clear unusable tokens while preserving the registration. Transport/infrastructure failures preserve the stored credentials and produce a safe error; no automatic OAuth or alternate billing is initiated.
- Pending returning sign-ins cannot reactivate an account after local logout. Returned status objects never contain access, refresh, or ID tokens.

This is a dependency-free MVP with focused fake-service tests, not a claim of security certification. Before production release, independently audit the OAuth/OIDC implementation and verify the real integration with a deliberately authorized test account.

## Credential storage contract

An injected store exposes exactly `transaction(async draft => result)`. It must:

1. Load the latest state and provide an isolated mutable draft.
2. Hold exclusive access through the entire asynchronous callback, including refresh/revocation HTTP requests, across every process sharing the credentials.
3. Persist the whole updated draft atomically before returning the result.
4. Roll back mutations when the callback throws; release the lock in every case.
5. Keep secrets confidential and never log drafts, tokens, callback URLs, fetch bodies, or exception causes.

State starts as `{ version: 1, hostId: null, accounts: {} }`. The format is private to this module and may change in a future major version. This is not a DSH credential schema. A platform keychain-backed implementation can implement the contract, but is not supplied here.

`MemoryCredentialStore` serializes callers sharing the same instance; it is nonpersistent and does not coordinate separate processes.

`FileCredentialStore({ directory, lockTimeoutMs = 30000 })` is an explicit opt-in plaintext POSIX store:

- Requires an absolute, owner-controlled directory; creates missing private directories with mode 0700. Refuses symlink components, writable untrusted ancestors, non-root/non-owner ancestors, and an existing leaf with group/other permission bits. Root-owned sticky temporary roots are permitted.
- Requires ordinary, single-link, owner-owned credential files with no group/other permission bits. Uses no-follow exclusive opens. Writes a random mode-0600 temporary file, fsyncs it, atomically renames it, and fsyncs the directory.
- Serializes transactions across store instances/processes using exclusive `credentials.lock` creation, including the whole network refresh. It does not guess that a timed-out lock is stale or steal it. A crashed process can leave a lock; after independently confirming that no app process is using the store, the owner must remove that one stale lock. Never remove a lock merely because it looks old.
- Rejects Windows rather than presenting Unix mode bits as an ACL guarantee. Supply a reviewed native store there.
- Uses owner permissions, not encryption. It does not defend against the same OS user, root, a compromised runtime, malicious injected fetch/storage implementations, insecure backups, or hostile/unreliable network filesystems. Use a local filesystem with working exclusive creation, atomic rename, and directory fsync.

No client can make remote refresh-token rotation and local file persistence one atomic transaction. A crash or disk failure after the server rotates but before local commit can require reauthentication. Do not restore old credential snapshots or run independent stores against a copied refresh token. No actual credential directory was read or created during development; tests use temporary directories with fake tokens only.

## Errors and tests

`AuthError` has a fixed safe `message`, a stable local `code`, and optionally an HTTP `status`. Do not attach raw provider errors or credentials when displaying it. Relevant codes include `plan_permission_missing`, `reauthentication_required`, `not_signed_in`, `invalid_client`, `invalid_grant`, `invalid_id_token`, `invalid_callback`, `invalid_state`, `expired_attempt`, `account_mismatch`, `network_error`, `store_busy`, `insecure_store`, and `cancelled`.

Run `node --test test/auth*.test.mjs`. Tests generate an ephemeral RSA keypair, use fake service responses, and use only a local fake callback. They cover successful/returning registration, rejected cryptographic/claim checks, state/nonce/replay, scope denial/reduction, account identity isolation, rotation serialization, documented terminal refresh errors, cancellation, reauthorization/logout races, revocation uncertainty, endpoint redirects, POSIX modes/symlinks, lock contention, and 72 serialized updates from six independent OS processes. Live account login, consent, issuance, plan eligibility, live refresh/revocation, and real inference are intentionally not run.

## Official sources reviewed

Reviewed 2026-10-14:

- [Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)
- [Accounts and sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions)
- [Token reference](https://developers.openai.com/siwc/token-sharing-open-source/token-reference)
- [Errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery)
- [Website OIDC validation guidance](https://developers.openai.com/siwc/website)
- [Production discovery document](https://auth.openai.com/.well-known/openid-configuration)

Production discovery was read without credentials to verify public endpoint and signing-algorithm values. Documentation availability does not establish that any particular account or deployment is eligible for plan sharing.
