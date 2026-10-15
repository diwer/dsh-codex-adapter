# Sources verified on 2026-10-14

## OpenAI

- [Sign in with ChatGPT overview](https://developers.openai.com/siwc/token-sharing-open-source): open-source/local-host eligibility and stable host identifiers.
- [Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in): dynamic registration, loopback callback, PKCE, identity and scope validation.
- [Accounts and sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions): account isolation, refresh rotation, revocation, protected credentials.
- [Models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference): account-specific catalog, public Responses endpoint and completed-stream requirement.
- [Preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations): required request flags, unsupported parameters and tools, explicit HTTP history.
- [Errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery): subscription limits, permission and refresh errors.
- [Function calling](https://developers.openai.com/api/docs/guides/function-calling): namespaces and function call/result objects.
- [Responses streaming reference](https://developers.openai.com/api/reference/resources/responses/streaming-events): output lifecycle and terminal events.
- [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create): namespace field and replayable items.
- [Reasoning](https://developers.openai.com/api/docs/guides/reasoning): encrypted reasoning in stateless responses, assistant phase preservation.
- [Codex app-server integration](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server): evaluated alternative. This project implements the DSH main-model Provider instead of delegating an entire independent Codex agent.
- [Public OIDC metadata](https://auth.openai.com/.well-known/openid-configuration): unauthenticated discovery was fetched; issuer, authorization, token, JWKS and revocation URLs plus RS256 match the documented implementation.

## DeepSeek Harness

Authoritative upstream: [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness).

Pinned source revision: `d743267388641bc76f17c45ce8b4c231aed1d32c`.

- [LLM adapter guide](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/docs/user/develop/practice/llm-adapter.md)
- [Runtime and LlmAdapter](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/llm/llm/src/index.ts)
- [GenerateOptions, StreamChunk and ReplayEnvelope](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/llm/llm/src/types.ts)
- [Message source/replay metadata](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/llm/llm/src/message.ts)
- [Assembler](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/llm/llm/src/assembler.ts)
- [Tool/file/image projection](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/llm/llm/src/content.ts)
- [Application attribution](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/llm/llm/src/attribution.ts)

Source was inspected read-only in a separate ignored reference directory. No upstream code was modified. Community plugins were identified for context but were not copied or installed, and their endpoint/credential practices are not treated as authority.

## Installed desktop target

Desktop adaptation was inspected against `/Applications/DeepSeek Harness.app` 0.2.0-rc.2 and its shipped ASAR modules, not inferred from the newer pinned upstream revision above. The package’s LLM/Cordis/Schemastery peers match the shipped versions. `npm run test:desktop` resolves those modules from the actual application and executes with its Electron Node 24.18.1.

The installed app's `Contents/Info.plist` registers the `dsh` URL scheme. Its `app.asar/lib/main.js` handles exactly `dsh://open` and `dsh://open/` by focusing the primary window; the desktop OAuth success page uses the former without parameters.
