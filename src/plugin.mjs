import Schema from '@deepseek-ai/schemastery';
import { LlmAdapter, LlmError, attributionHeaders } from '@deepseek-ai/dsh-llm';
import { createAdapterClass, PROVIDER } from './adapter.mjs';
import { createAuthClient, FileCredentialStore } from './auth/index.mjs';

export const name = 'dsh-codex-official-adapter';
export const inject = ['llm'];
export const Config = Schema.object({
  credentialDirectory: Schema.string().required(),
  accountId: Schema.string().required(),
  requestTimeoutMs: Schema.number().step(1).min(1).default(300000),
  maxEventBytes: Schema.number().step(1).min(1).default(8388608),
  maxOutputChars: Schema.number().step(1).min(1).default(33554432),
  maxReplayBytes: Schema.number().step(1).min(1).default(33554432),
  modelCapabilities: Schema.dict(Schema.object({
    contextWindow: Schema.number().step(1).min(1),
    reasoningEfforts: Schema.array(Schema.string()),
  })).default({}),
});
export const ChatGPTPlanAdapter = createAdapterClass({LlmAdapter, LlmError, attributionHeaders});

/** Register a dedicated route; authentication remains an explicit human action. */
export function apply(ctx, config) {
  const store = new FileCredentialStore({directory:config.credentialDirectory});
  const auth = createAuthClient({store});
  const adapter = new ChatGPTPlanAdapter({...config, session:auth.session(config.accountId),attachments:()=>ctx.get('attachments')});
  ctx.llm.registerAdapter([PROVIDER], adapter);
  ctx.effect(() => () => adapter.dispose());
}
