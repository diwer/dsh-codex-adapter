import {setTimeout as sleep} from 'node:timers/promises';
import {prepareImages} from './images.mjs';
import {catalogReasoning,resolvedReasoning,isResponsesEffort} from './model-capabilities.mjs';
import { AdapterError, protocol, providerError, safeCode } from './errors.mjs';
import { buildRequest } from './request.mjs';
import { readSse, parseEvent } from './sse.mjs';
import { ResponseStream } from './stream.mjs';

export const PROVIDER = 'openai-chatgpt-plan';
export const API_ORIGIN = 'https://api.openai.com/v1';

async function readJson(response, signal, maxBytes = 2 * 1024 * 1024) {
  const reader = response.body?.getReader();
  if (!reader) throw protocol('The provider response body is missing.');
  const buffers = []; let size = 0;
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', abort, {once:true});
  try {
    signal?.throwIfAborted();
    while (true) {
      const {value, done} = await reader.read();
      signal?.throwIfAborted();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw protocol('The provider response exceeded the size limit.');
      buffers.push(value);
    }
    try { return JSON.parse(Buffer.concat(buffers).toString('utf8')); } catch { return null; }
  } finally { signal?.removeEventListener('abort', abort); await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

function limits(value, fallback, name) {
  const chosen = value ?? fallback;
  if (!Number.isSafeInteger(chosen) || chosen <= 0) throw new AdapterError(`${name} must be a positive integer.`, 'INVALID_CONFIG');
  return chosen;
}

/** Bind the testable transport to the real, installed DSH runtime classes. */
export function createAdapterClass({LlmAdapter, LlmError, attributionHeaders}) {
  if (typeof LlmAdapter !== 'function' || typeof LlmError !== 'function' || typeof attributionHeaders !== 'function') throw new TypeError('DSH runtime exports are required.');
  return class ChatGPTPlanAdapter extends LlmAdapter {
    constructor({session, fetchImpl = globalThis.fetch, requestTimeoutMs, maxEventBytes, maxOutputChars, maxReplayBytes, modelCapabilities = {}, attachments}) {
      super();
      if (typeof session?.accessToken !== 'function') throw new AdapterError('An authenticated account session is required.', 'INVALID_CONFIG');
      this.lifetime = new AbortController();
      this.session = session;
      this.fetchImpl = fetchImpl;
      this.requestTimeoutMs = limits(requestTimeoutMs, 300000, 'requestTimeoutMs');
      this.maxEventBytes = limits(maxEventBytes, 8 * 1024 * 1024, 'maxEventBytes');
      this.maxOutputChars = limits(maxOutputChars, 32 * 1024 * 1024, 'maxOutputChars');
      this.maxReplayBytes = limits(maxReplayBytes, 32 * 1024 * 1024, 'maxReplayBytes');
      this.capabilities = structuredClone(modelCapabilities);
      this.attachments = attachments;
      for (const value of Object.values(this.capabilities)) {
        if (value.contextWindow !== undefined) limits(value.contextWindow, undefined, 'contextWindow');
        if (value.reasoningEfforts !== undefined && (!Array.isArray(value.reasoningEfforts) || !value.reasoningEfforts.length || value.reasoningEfforts.some(e => !isResponsesEffort(e)) || new Set(value.reasoningEfforts).size !== value.reasoningEfforts.length)) throw new AdapterError('reasoningEfforts must be unique supported Responses effort identifiers.', 'INVALID_CONFIG');
      }
    }
    providerInfo(provider) { this.route(provider); return {id:PROVIDER, name:'ChatGPT plan (Sign in with ChatGPT)'}; }
    route(provider) { if (provider !== PROVIDER) throw new AdapterError('This adapter does not own the requested provider route.', 'NO_ADAPTER'); }
    scope(signal) { return AbortSignal.any([this.lifetime.signal, ...(signal ? [signal] : []), AbortSignal.timeout(this.requestTimeoutMs)]); }
    dispose() { this.lifetime.abort(); }
    providerRetryPolicy(provider) { this.route(provider); return {mode:'normal', maxRetries:0, retryableCodes:['TRANSPORT_ERROR','TIMEOUT'], initialDelayMs:500, maxDelayMs:10000, jitterRatio:0.1}; }
    async headers(signal) {
      signal.throwIfAborted();
      const token = await this.session.accessToken(signal);
      signal.throwIfAborted();
      if (typeof token !== 'string' || !token || /[\s\x00-\x1f\x7f]/.test(token)) throw new AdapterError('The selected account has no usable access token.', 'AUTH');
      const attribution = attributionHeaders();
      const headers = new Headers(attribution);
      if (!headers.get('user-agent')) throw new AdapterError('DSH attributionHeaders() did not provide an application identity.', 'INVALID_CONFIG');
      headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
    wrap(error, signal, secret) {
      let failure;
      if (signal?.aborted) failure = new AdapterError(signal.reason?.name === 'TimeoutError' ? 'The provider request timed out.' : 'The request was cancelled.', signal.reason?.name === 'TimeoutError' ? 'TIMEOUT' : 'ABORTED');
      else if (error instanceof AdapterError) failure = error;
      else if (error?.name === 'AuthError') failure = new AdapterError('The selected ChatGPT account needs attention. Check its sign-in status.', safeCode(error.code) ?? 'AUTH');
      else if (['UNABLE_TO_GET_ISSUER_CERT_LOCALLY','UNABLE_TO_VERIFY_LEAF_SIGNATURE','CERT_HAS_EXPIRED','DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN'].includes(error?.cause?.code)) failure = new AdapterError(`TLS certificate validation failed (${error.cause.code}).`, 'TLS_ERROR');
      else failure = new AdapterError('The provider request could not be completed.', 'TRANSPORT_ERROR');
      const safeFact = value => typeof value === 'string' && secret && value.includes(secret) ? undefined : value;
      const result = new LlmError(failure.message, failure.code, {status:failure.status, requestId:safeFact(failure.requestId), providerRetryAfterMs:failure.providerRetryAfterMs});
      for (const key of ['providerCode','providerParam','bodyKind']) if (safeFact(failure[key]) !== undefined) result[key] = safeFact(failure[key]);
      return result;
    }
    async catalog(signal) {
      const scoped = this.scope(signal);
      let secret;
      try {
        const headers = await this.headers(scoped);
        secret = headers.get('authorization').slice(7);
        const response = await this.fetchImpl(`${API_ORIGIN}/models`, {method:'GET', headers, signal:scoped, redirect:'error'});
        const body = await readJson(response, scoped);
        if (!response.ok) throw providerError(response.status, body, response.headers);
        if (!Array.isArray(body?.models)) throw protocol('The account model catalog did not contain a models array.');
        return body.models.map(model => {
          if (typeof model?.slug !== 'string' || !model.slug || typeof model.display_name !== 'string') throw protocol('The account model catalog contained an invalid entry.');
          const modalities=model.input_modalities??['text'];
          if(!Array.isArray(modalities)||!modalities.length||modalities.some(value=>!['text','image'].includes(value))||new Set(modalities).size!==modalities.length)throw protocol('The account model catalog contained invalid input modalities.');
          const reasoning=catalogReasoning(model);
          return {provider:PROVIDER, id:model.slug, name:model.display_name, inputModalities:[...modalities], visibility:model.visibility,...reasoning?{reasoning}:{}};
        });
      } catch (error) { throw this.wrap(error, scoped, secret); }
    }
    async listModels(provider) {
      this.route(provider);
      return (await this.catalog()).filter(model => model.visibility === 'list').map(({visibility, ...model}) => model);
    }
    async resolveModel(provider, model, signal) {
      this.route(provider);
      const catalog = await this.catalog(signal);
      const found = catalog.find(entry => entry.id === model);
      if (!found) throw this.wrap(new AdapterError('The model is not in the selected ChatGPT account catalog.', 'MODEL_UNAVAILABLE'));
      const {visibility, ...result} = found;
      const configured = this.capabilities[model];
      if (configured?.contextWindow) result.context = {contextWindow:configured.contextWindow};
      const reasoning=resolvedReasoning(result.reasoning,configured);
      if(reasoning)result.reasoning=reasoning;
      return result;
    }
    async *stream(options) {
      const signal = this.scope(options.signal);
      let secret;
      try {
        this.route(options.provider);
        if (options.reasoningEffort !== undefined) {
          const configured=this.capabilities[options.model]?.reasoningEfforts;
          const efforts=configured??(await this.resolveModel(options.provider,options.model,signal)).reasoning?.efforts.map(effort=>effort.id);
          if(!efforts?.includes(options.reasoningEffort))throw new AdapterError('The selected model does not support this reasoning effort. Choose a level offered by the model picker.', 'UNSUPPORTED_CAPABILITY');
        }
        const prepared=await prepareImages(options,typeof this.attachments==='function'?this.attachments():this.attachments,signal);
        const body = buildRequest(prepared.options,{images:prepared.images});
        const headers = await this.headers(signal);
        secret = headers.get('authorization').slice(7);
        headers.set('content-type','application/json');
        headers.set('accept','text/event-stream');
        // A stateless request can be repeated only before any chunk reaches Harness.
        // Keep the host retry policy disabled so partial tool work is never replayed.
        for(let attempt=0;attempt<2;attempt++){
          const response = await this.fetchImpl(`${API_ORIGIN}/responses`, {method:'POST', headers, body:JSON.stringify(body), signal, redirect:'error'});
          if (!response.ok) throw providerError(response.status, await readJson(response, signal), response.headers);
          const contentType=response.headers.get('content-type');
          // The live ChatGPT-plan endpoint can omit Content-Type while sending SSE.
          // Framing, event schemas and the completed terminal event remain mandatory.
          if (contentType && !/^text\/event-stream(?:\s*;|$)/i.test(contentType)) throw protocol('The provider declared an unsupported response content type.');
          const stream = new ResponseStream({model:options.model, toolNames:(options.tools ?? []).map(tool => tool.name), maxOutputChars:this.maxOutputChars, maxReplayBytes:this.maxReplayBytes, headers:response.headers});
          let emitted=false;
          for await (const frame of readSse(response.body, {signal, maxEventBytes:this.maxEventBytes})) {
            for (const chunk of stream.accept(parseEvent(frame))) {
              signal.throwIfAborted();
              emitted=true;
              yield chunk;
            }
            signal.throwIfAborted();
            if (stream.completed) return;
          }
          if(!emitted&&attempt===0){await sleep(500,undefined,{signal});continue;}
          throw new AdapterError('OpenAI 响应连接提前结束，未收到完整结束事件。请重试本轮；已收到的片段不视为完整回复。','STREAM_INTERRUPTED',{status:response.status,requestId:safeCode(response.headers.get('x-request-id')),bodyKind:emitted?'sse_partial_output':'sse_no_output'});
        }
      } catch (error) { throw this.wrap(error, signal, secret); }
    }
  };
}
