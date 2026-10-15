# Compatibility and acceptance

## Implemented development scope

This is a standalone main-model Provider, not a patch to the DSH agent loop. It uses the exported LlmAdapter registration API, streams paired DSH blocks, preserves provider replay data through ReplayEnvelope, and leaves tool execution to DSH. A dedicated route prevents accidental takeover of another plugin.

The core is dependency-injected for offline tests. The production plugin imports the actual DSH classes. A passing fake-runtime test does not establish installed-package compatibility.

## Acceptance stages

1. Offline protocol/security tests: required and runnable without dependencies, tokens or network inference.
2. Real DSH library integration: dependency installation is separately approved; test the real LlmAdapter, BlockAssembler, schema and plugin lifecycle using mock transport.
3. Actual local Profile startup: verify the user's chosen DSH version and Web/Headless configuration in an isolated Profile.
4. Real account consent: user completes official OAuth and approves storage on the target host. Never request tokens in chat.
5. Authorized live inference: complete one harmless text request, a tool-call/result round trip, cancellation and a resumed long session. Check account limits explicitly. No automatic API-key fallback.
6. Longer-session acceptance: use actual DSH context/compaction settings and account/model capacity. A synthetic long history is insufficient evidence.

Desktop update on 2026-10-14: stage 2 passed against the desktop app’s actual ASAR libraries and Electron (7 tests); stage 3 passed on the installed desktop 0.2.0-rc.2 Profile, including the enabled/running plugin entry and the ChatGPT subscription settings page. Stages 4–6 remain pending. This version is not production-certified.

## Supported and rejected fields

- Supported: leading system prompt, text user/developer messages, assistant text/refusal, function calls/results, explicit full history, authenticated model catalog, configured reasoning effort, cancellation.
- Replay: stateless requests explicitly include `reasoning.encrypted_content`. Final output items are aligned one-to-one with DSH blocks. Content digests prevent stale provider state from replaying after message edits; encrypted reasoning and assistant phase remain intact. Pruning a DSH block prunes the corresponding replay entry.
- Rejected: unsupported generation controls, undeclared/wrong-namespace tools, malformed JSON arguments, missing encrypted reasoning state, unsupported output kinds, incomplete/failed stream terminal events, ambiguous EOF.
- DSH's non-native tool-history bookkeeping can remain after runtime projection; the adapter uses the complete projected declarations and does not transmit that bookkeeping.
- The runtime preserves the account catalog input_modalities. Image-capable routes read normalized images through the mounted Harness attachment service and encode Responses input_image content. Offloaded images retain explicit text. Arbitrary file paths and remote URLs are not accepted as attachment inputs; non-image files keep the Harness text projection.
- Reasoning levels and defaults are read automatically from the selected account model catalog and filtered to the Responses API effort enum. Explicit reasoningEfforts configuration remains available as an override. Context size remains opt-in per model.
- Subscription discovery retains the account-specific `models` / `slug` / `display_name` / `visibility` contract. A standard API `data` / `id` catalog is not used to infer subscription eligibility.
- `maxEventBytes` bounds UTF-8 wire bytes between SSE blank dispatch lines, including field names, values, comments, unknown fields and their line endings. The blank dispatch delimiter is excluded; each new frame resets the budget.

## Safety and recovery

Only fixed official HTTPS API and auth destinations are used. Secret-bearing HTTP requests disable redirects. Failures retain safe machine code, HTTP status and request ID where available; raw provider bodies are not included in logs/errors. The application does not impersonate Codex CLI, import existing credentials or rotate accounts to evade limits.

The file credential store requires POSIX ownership and restrictive modes, refuses links and unsafe ancestors, serializes refresh across processes and writes by atomic rename. Credentials remain plaintext on disk and are not a system-keychain substitute. Windows needs a separately reviewed secure-store implementation.

The stream has configurable request/event/output limits and is cancelled when the caller aborts or the plugin is disposed. Host provider retry policy disables automatic replay. The adapter retries a clean premature EOF once, after 500 ms, only before any chunk is delivered to Harness; partial output, malformed streams, HTTP errors and cancellation are not retried by this path. A missing terminal event remains a STREAM_INTERRUPTED failure. Temporary authentication failures do not erase healthy credentials; terminal refresh failures require sign-in again.

## Known verification gaps

The desktop bundle includes a graphical subscription settings page and standard DSH bundle installation. Hosted tools, remote compaction call, remote multi-user service, live credential transfer, publishing workflow and a complete OS matrix remain outside scope. No unsupported API capability is silently fabricated.
