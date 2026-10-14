import { isDeepStrictEqual } from 'node:util';
import { protocol, providerError } from './errors.mjs';
import { digest, itemToBlock, REPLAY_VERSION, TOOL_NAMESPACE } from './request.mjs';

/** One response stream translated into paired DSH blocks and lossless replay entries. */
export class ResponseStream {
  constructor({model, toolNames = [], maxOutputChars = 32 * 1024 * 1024, maxReplayBytes = 32 * 1024 * 1024, headers = new Headers()}) {
    this.model = model;
    this.headers = headers;
    this.toolNames = new Set(toolNames);
    this.states = new Map();
    this.maxOutputChars = maxOutputChars;
    this.outputChars = 0;
    this.maxReplayBytes = maxReplayBytes;
    this.replayBytes = 0;
    this.completed = false;
  }
  account(text) {
    this.outputChars += text.length;
    if (this.outputChars > this.maxOutputChars) throw protocol('The response exceeded the configured output size limit.');
  }
  add(index, item) {
    if (!Number.isSafeInteger(index) || index < 0 || index !== this.states.size || this.states.has(index)) throw protocol('Provider output items arrived out of order.');
    const blockType = {message:'text', reasoning:'reasoning', function_call:'tool-call'}[item?.type];
    if (!blockType || typeof item.id !== 'string' || !item.id) throw protocol('An unsupported or unidentified output item was received.');
    if (item.type === 'function_call' && (!this.toolNames.has(item.name) || typeof item.call_id !== 'string' || !item.call_id || (item.namespace !== undefined && item.namespace !== TOOL_NAMESPACE))) throw protocol('The provider requested an undeclared tool.');
    const state = {index, id:item.id, kind:item.type, blockType, initial:{call_id:item.call_id, name:item.name}, text:'', lastPart:-1, closed:false};
    this.states.set(index, state);
    return [{type:'block-start', index, blockType}];
  }
  state(event) {
    const state = this.states.get(event.output_index);
    if (!state || state.closed || (event.item_id !== undefined && event.item_id !== state.id)) throw protocol('The provider event referenced an unknown or completed output item.');
    return state;
  }
  delta(event, kind) {
    const state = this.state(event);
    if (state.blockType !== kind || typeof event.delta !== 'string') throw protocol();
    const part = event.content_index ?? event.summary_index;
    if (part !== undefined) {
      if (!Number.isSafeInteger(part) || part < state.lastPart) throw protocol('Content parts arrived out of order.');
      state.lastPart = part;
    }
    this.account(event.delta);
    state.text += event.delta;
    if (kind === 'tool-call') return [{type:'tool-call-delta', index:state.index, id:state.initial.call_id, name:state.initial.name, argumentsDelta:event.delta}];
    return [{type:kind === 'text' ? 'text-delta' : 'reasoning-delta', index:state.index, text:event.delta}];
  }
  done(index, item) {
    const state = this.states.get(index);
    if (!state || state.closed || item?.id !== state.id || item.type !== state.kind) throw protocol('Output completion did not match the open item.');
    const block = itemToBlock(item);
    if (block.type === 'tool-call' && (!this.toolNames.has(block.name) || item.call_id !== state.initial.call_id || item.name !== state.initial.name)) throw protocol('The provider changed a tool identity during streaming.');
    const finalText = block.type === 'tool-call' ? block.arguments : block.text;
    if (!finalText.startsWith(state.text)) throw protocol('Completed output did not match streamed output.');
    const remaining = finalText.slice(state.text.length);
    const chunks = [];
    if (remaining) chunks.push(...this.delta({output_index:index, delta:remaining}, state.blockType));
    this.replayBytes += Buffer.byteLength(JSON.stringify(item));
    if (this.replayBytes > this.maxReplayBytes) throw protocol('The response exceeded the configured replay size limit.');
    state.closed = true;
    state.item = structuredClone(item);
    state.block = block;
    chunks.push({type:'block-end', index, block});
    return chunks;
  }
  accept(event) {
    if (this.completed) throw protocol('Events arrived after response completion.');
    switch (event.type) {
      case 'response.output_item.added': return this.add(event.output_index, event.item);
      case 'response.output_text.delta':
      case 'response.refusal.delta': return this.delta(event, 'text');
      case 'response.reasoning_summary_text.delta': return this.delta(event, 'reasoning');
      case 'response.function_call_arguments.delta': return this.delta(event, 'tool-call');
      case 'response.output_item.done': return this.done(event.output_index, event.item);
      case 'response.failed': throw providerError(undefined, event.response, this.headers);
      case 'error': throw providerError(undefined, event, this.headers);
      case 'response.incomplete': throw protocol('The provider marked the response incomplete; tools were not accepted as a successful turn.');
      case 'response.completed': return this.finish(event.response);
      case 'transport.done': throw protocol('The stream ended before response.completed.');
      default:
        // Lifecycle and part-completion events carry no additional model-visible content.
        if (/^response\.(created|in_progress|queued)$/.test(event.type) || /^response\.(content_part|reasoning_summary_part)\.(added|done)$/.test(event.type) || /^response\.(output_text|refusal|reasoning_summary_text|function_call_arguments)\.done$/.test(event.type)) return [];
        throw protocol('An unsupported provider event was received.');
    }
  }
  finish(response) {
    if (response?.status !== 'completed' || !Array.isArray(response.output)) throw protocol('The terminal response was not completed.');
    if (this.states.size > response.output.length) throw protocol('The terminal response omitted streamed output.');
    const chunks = [];
    response.output.forEach((item, index) => {
      if (!this.states.has(index)) chunks.push(...this.add(index, item));
      const state = this.states.get(index);
      if (!state.closed) chunks.push(...this.done(index, item));
      else if (!isDeepStrictEqual(state.item, item)) throw protocol('The terminal response changed completed output.');
    });
    const usage = usageFromResponse(response.usage);
    if (usage) chunks.push({type:'usage', usage});
    const states = [...this.states.values()];
    chunks.push({type:'finish', reason:{kind:states.some(state => state.kind === 'function_call') ? 'tool-calls' : 'stop'}, replayState:{
      response:{version:REPLAY_VERSION, model:this.model},
      blocks:states.map(state => ({outputIndex:state.index, digest:digest(state.block), item:state.item})),
    }});
    this.completed = true;
    return chunks;
  }
}

export function usageFromResponse(usage) {
  if (usage === undefined || usage === null) return;
  const input = usage.input_tokens, output = usage.output_tokens;
  const read = usage.input_tokens_details?.cached_tokens ?? 0;
  const write = usage.input_tokens_details?.cache_write_tokens ?? 0;
  if (![input, output, read, write].every(value => Number.isSafeInteger(value) && value >= 0) || read + write > input) throw protocol('Provider token accounting was inconsistent.');
  const result = {inputTokens:input - read - write, outputTokens:output, cacheReadTokens:read, cacheWriteTokens:write, totalTokens:input + output};
  const reasoning = usage.output_tokens_details?.reasoning_tokens;
  if (reasoning !== undefined) {
    if (!Number.isSafeInteger(reasoning) || reasoning < 0 || reasoning > output) throw protocol('Provider reasoning token accounting was inconsistent.');
    result.reasoningTokens = reasoning;
  }
  return result;
}
