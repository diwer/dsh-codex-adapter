# Desktop checkpoint: 2026-10-14

- Target: installed DeepSeek Harness desktop 0.2.0-rc.2, Electron Node 24.18.1, Cordis 4.0.4 and Schemastery 3.18.4.
- Offline suite: **121 passed, 0 failed, 0 skipped**.
- npm rc.2 library integration: **7 passed, 0 failed, 0 skipped**.
- Installed desktop ASAR library integration using the app’s Electron executable: **7 passed, 0 failed, 0 skipped**.
- Syntax: 27 JavaScript modules plus the desktop client bundle checked separately.
- Standard DSH package installation into the actual desktop Profile succeeded. Native desktop UI shows v0.1.0-alpha.3 enabled, its one component running, and Settings → ChatGPT subscription → Continue with ChatGPT.
- Actual desktop button started its own OAuth callback listener. Authorization was opened in Chrome; user consent and live inference are pending.
- No claim of real model, tool, resumed-session or compaction success is made.

See [desktop acceptance](DESKTOP_ACCEPTANCE.md). The following record is the earlier isolated prototype checkpoint, retained for history.

---

# Development checkpoint: 2026-10-14

## Executed

- Node.js v24.19.0; native ESM and node:test; no installed project dependencies.
- `npm run verify`: JavaScript syntax checks plus the complete offline suite.
- `git diff --check` and staged whitespace validation.
- A separate implementation reviewer reran the complete suite and independently inspected request conversion, streaming, replay, errors and plugin lifecycle.

Final checkpoint results: **110 tests passed, 0 failed, 0 skipped**. Syntax validation covered **20 modules**. The tests comprise 45 authentication/storage cases and 65 adapter/stream/request/CLI cases.

## Coverage

- PKCE, one-time state, callback URI, OIDC nonce/issuer/audience/expiry/algorithm/signature/azp, granted scopes, separate registrations and renewal.
- Concurrent token refresh, atomic rotation, terminal versus transient refresh failures, failed remote revocation, cancellation during exchange, timeout preventing late credential writes.
- Protected POSIX store, link/permission rejection, lock timeout and six operating-system processes completing 72 serialized state updates.
- Official API destinations, attribution, namespaced tools, multiple interleaved calls, tool results, subscription-limit errors, no billing fallback or automatic replay.
- Full assistant output replay including encrypted reasoning and assistant phase, block-aligned pruning, mutation detection and explicit thousand-message input histories.
- Byte-split UTF-8 SSE, CR/LF framing, multiline data, incomplete JSON/events, missing completion, failed/incomplete terminal states, bounded events/replay, cancellation and plugin disposal.
- Credential redaction from reflected provider codes/parameters/request IDs; streaming request IDs remain available for safe diagnostics.

The independent review found and the implementation corrected cancellation between buffered chunks, empty-data SSE limit accounting and known-bearer reflection in machine metadata. Additional replay-size and in-progress-item retention hardening was added.

## Not executed

- The separate `npm run test:runtime` suite against installed DSH packages. Five tests are prepared; installation permission is pending. These are not counted as passed or skipped above.
- TypeScript type checking. No TypeScript compiler is installed; `node --check` is syntax validation only.
- Full Web/Headless Profile startup or the user's installed DSH version.
- Actual OpenAI OAuth consent, account token creation/storage, subscription inference, real tool execution or real long-session compaction.
- macOS/Windows runtime matrix. Windows credential storage deliberately fails closed.

No user credentials were read or used, no real API calls were made beyond public read-only documentation/metadata, and no software was installed, published or pushed during this checkpoint.
