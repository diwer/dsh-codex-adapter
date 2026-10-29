import { isDeepStrictEqual } from 'node:util';
import { AdapterError, protocol, providerError, safeCode } from './errors.mjs';
import { digest, itemToBlock, REPLAY_VERSION, TOOL_NAMESPACE } from './request.mjs';
import { eventPolicy } from './events.mjs';

/** One response stream translated into paired DSH blocks and lossless replay entries. */
export class ResponseStream {
  constructor({model, toolNames = [], maxOutputChars = 32 * 1024 * 1024, maxReplayBytes = 32 * 1024 * 1024, headers = new Headers()}) {
    this.model = model;
    this.headers = headers;
    this.toolNames = new Set(toolNames);
    this.states = new Map();
    this.itemIds = new Set();
    this.callIds = new Set();
    this.identityBytes = 0;
    this.partCount = 0;
    this.annotationCount = 0;
    this.annotationBytes = 0;
    this.maxOutputChars = maxOutputChars;
    this.outputChars = 0;
    this.reasoningChars = 0;
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
    if (this.itemIds.has(item.id) || (item.type === 'function_call' && this.callIds.has(item.call_id))) throw protocol('Provider output identities were not unique.');
    // Bound retained identities even if no output_item.done ever arrives.
    this.identityBytes += Buffer.byteLength(JSON.stringify([item.id,item.call_id,item.name]));
    if (this.states.size >= 4096 || this.identityBytes > this.maxReplayBytes) throw protocol('The response exceeded the configured retained output limit.');
    this.itemIds.add(item.id);
    if (item.type === 'function_call') this.callIds.add(item.call_id);
    const state = {index, id:item.id, kind:item.type, blockType, initial:{call_id:item.call_id, name:item.name}, text:'', lastPart:-1, closed:false, tracks:new Map()};
    this.states.set(index, state);
    return [{type:'block-start', index, blockType}];
  }
  state(event) {
    const state = this.states.get(event.output_index);
    if (!state || state.closed || (event.item_id !== undefined && event.item_id !== state.id)) throw protocol('The provider event referenced an unknown or completed output item.');
    return state;
  }
  track(event, kind, {ordered = false, requiredIndex = false} = {}) {
    const state = this.state(event);
    const expected = kind === 'summary' || kind === 'reasoning' ? 'reasoning' : kind === 'arguments' ? 'function_call' : 'message';
    if (state.kind !== expected) throw protocol('A content event referenced the wrong output kind.');
    const field = kind === 'summary' ? 'summary_index' : 'content_index';
    if ((kind === 'summary' && event.content_index !== undefined) || (kind !== 'summary' && event.summary_index !== undefined)) throw protocol('A content event used the wrong part index.');
    const index = kind === 'arguments' ? 0 : event[field] ?? (requiredIndex ? undefined : 0);
    if (!Number.isSafeInteger(index) || index < 0) throw protocol('Invalid content part index.');
    // Text and refusal occupy the same message content array, not separate slots.
    const trackName = expected === 'message' ? 'message' : kind;
    let parts = state.tracks.get(trackName);
    if (!parts) state.tracks.set(trackName, parts = new Map());
    let part = parts.get(index);
    if (!part) {
      if (++this.partCount > 4096) throw protocol('The response exceeded the retained part limit.');
      parts.set(index, part = {kind, text:'', added:false, doneText:undefined, closed:false});
    }
    if (part.kind !== kind) throw protocol('The provider changed a content part type.');
    if (ordered) {
      const last = state.lastTrackIndex?.[trackName] ?? -1;
      if (index < last) throw protocol('Content parts arrived out of order.');
      (state.lastTrackIndex ??= {})[trackName] = index;
    }
    return {state, part, index};
  }
  emit(state, text) {
    this.account(text);
    state.text += text;
    if (state.blockType === 'tool-call') return [{type:'tool-call-delta', index:state.index, id:state.initial.call_id, name:state.initial.name, argumentsDelta:text}];
    return [{type:state.blockType === 'text' ? 'text-delta' : 'reasoning-delta', index:state.index, text}];
  }
  delta(event, kind) {
    if (typeof event.delta !== 'string') throw protocol();
    const {state, part} = this.track(event, kind, {ordered:true});
    if (part.closed || part.doneText !== undefined) throw protocol('A delta arrived after content completion.');
    if (kind === 'reasoning') {
      this.reasoningChars += event.delta.length;
      if (this.reasoningChars > this.maxOutputChars) throw protocol('The response exceeded the configured output size limit.');
      part.text += event.delta;
      return [];
    }
    const chunks = this.emit(state, event.delta);
    part.text += event.delta;
    return chunks;
  }
  contentDone(event, kind, text, closePart = false) {
    const {part} = this.track(event, kind);
    if (typeof text !== 'string' || !text.startsWith(part.text) || part.closed || (!closePart && part.doneText !== undefined) || (part.doneText !== undefined && part.doneText !== text)) throw protocol('Content completion did not match streamed content.');
    if (text.length > this.maxOutputChars) throw protocol('The response exceeded the configured output size limit.');
    if (kind === 'arguments' && event.name !== undefined && event.name !== this.state(event).initial.name) throw protocol('The provider changed a tool identity during streaming.');
    const remaining = text.slice(part.text.length);
    const chunks = remaining ? this.delta({...event,delta:remaining},kind) : [];
    part.doneText = text;
    part.closed = closePart;
    return chunks;
  }
  partEvent(event, done) {
    const summary = event.type.startsWith('response.reasoning_summary_part.');
    const kind = summary ? 'summary' : {output_text:'text', refusal:'refusal', reasoning_text:'reasoning'}[event.part?.type];
    if (!kind || (summary && event.part?.type !== 'summary_text')) throw protocol('An unsupported content part was received.');
    const {state,part,index} = this.track(event, kind, {ordered:true, requiredIndex:true});
    const text = kind === 'refusal' ? event.part.refusal : event.part.text;
    if (typeof text !== 'string') throw protocol('Invalid content part.');
    if (kind === 'text' && event.part.annotations !== undefined) {
      const annotations = event.part.annotations;
      if (!Array.isArray(annotations)) throw protocol('Invalid content part annotations.');
      if (done && [...(state.annotations?.keys() ?? [])].some(key => {
        const [contentIndex,annotationIndex] = key.split(':').map(Number);
        return contentIndex === index && annotationIndex >= annotations.length;
      })) throw protocol('The completed part omitted streamed annotations.');
      annotations.forEach((annotation,annotationIndex) => this.annotation(state,index,annotationIndex,annotation,true));
      if (done) part.annotationCount = annotations.length;
    }
    if (done) return this.contentDone(event, kind, text, true);
    if (part.added || part.text || part.doneText !== undefined || part.closed) throw protocol('A content part was added more than once or out of order.');
    part.added = true;
    // A nonempty initial part is real content, not advisory metadata.
    return text ? this.delta({...event, delta:text},kind) : [];
  }
  annotation(state,index,annotationIndex,annotation,allowExisting = false) {
    if (!Number.isSafeInteger(annotationIndex) || annotationIndex < 0 || !annotation || typeof annotation !== 'object' || Array.isArray(annotation)) throw protocol('Invalid output annotation event.');
    state.annotations ??= new Map();
    const key = `${index}:${annotationIndex}`;
    if (state.annotations.has(key)) {
      if (allowExisting && isDeepStrictEqual(state.annotations.get(key),annotation)) return;
      throw protocol('A duplicate or changed output annotation was received.');
    }
    this.annotationBytes += Buffer.byteLength(JSON.stringify(annotation));
    if (++this.annotationCount > 4096 || this.annotationBytes > this.maxReplayBytes) throw protocol('The response exceeded the configured annotation limit.');
    state.annotations.set(key,structuredClone(annotation));
  }
  verifyTracks(state, item) {
    for (const [trackName, parts] of state.tracks) {
      for (const [index, part] of parts) {
        const final = trackName === 'arguments' ? {type:'arguments', arguments:item.arguments}
          : (trackName === 'summary' ? item.summary : item.content)?.[index];
        const type = {text:'output_text',refusal:'refusal',summary:'summary_text',reasoning:'reasoning_text',arguments:'arguments'}[part.kind];
        const text = part.kind === 'refusal' ? final?.refusal : part.kind === 'arguments' ? final?.arguments : final?.text;
        // Empty reasoning notifications need not create a visible final part.
        if (!final && part.kind === 'reasoning' && !part.text && !part.doneText) continue;
        if (final?.type !== type || typeof text !== 'string' || !text.startsWith(part.text) || (part.doneText !== undefined && part.doneText !== text)) throw protocol('The completed item changed streamed content parts.');
        if (part.annotationCount !== undefined && final.annotations?.length !== part.annotationCount) throw protocol('The completed item changed part annotations.');
      }
    }
  }
  lifecycle(event) {
    const response = event.response;
    if (response !== undefined) {
      if (!response || typeof response !== 'object') throw protocol('Invalid response lifecycle metadata.');
      if (response.id !== undefined) {
        if (typeof response.id !== 'string' || !response.id || (this.responseId && this.responseId !== response.id)) throw protocol('The provider changed the response identity.');
        this.responseId = response.id;
      }
      const allowed = event.type === 'response.created' ? ['queued','in_progress'] : [event.type.slice('response.'.length)];
      if (response.status !== undefined && !allowed.includes(response.status)) throw protocol('Invalid response lifecycle status.');
    }
    return [];
  }
  done(index, item) {
    const state = this.states.get(index);
    if (!state || state.closed || item?.id !== state.id || item.type !== state.kind) throw protocol('Output completion did not match the open item.');
    const block = itemToBlock(item);
    this.verifyTracks(state,item);
    for (const [key,annotation] of state.annotations ?? []) {
      const [contentIndex,annotationIndex] = key.split(':').map(Number);
      if (!isDeepStrictEqual(item.content?.[contentIndex]?.annotations?.[annotationIndex],annotation)) throw protocol('The completed item changed streamed annotations.');
    }
    if (block.type === 'tool-call' && (!this.toolNames.has(block.name) || item.call_id !== state.initial.call_id || item.name !== state.initial.name)) throw protocol('The provider changed a tool identity during streaming.');
    const finalText = block.type === 'tool-call' ? block.arguments : block.text;
    if (!finalText.startsWith(state.text)) throw protocol('Completed output did not match streamed output.');
    const remaining = finalText.slice(state.text.length);
    const chunks = [];
    if (remaining) chunks.push(...this.emit(state, remaining));
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
    if (!event || typeof event !== 'object' || typeof event.type !== 'string') throw protocol();
    const policy = eventPolicy(event.type);
    if (!policy || policy === 'unsupported') {
      const providerEvent = safeCode(event.type);
      const description = policy === 'unsupported' ? 'A known but unsupported provider capability event was received' : 'An unsupported provider event was received';
      throw new AdapterError(`${description}${providerEvent ? ` (${providerEvent})` : ''}.`, 'PROTOCOL_ERROR', {providerEvent,requestId:safeCode(this.headers.get('x-request-id'))});
    }
    if (policy === 'advisory') return [];
    if (policy === 'lifecycle') return this.lifecycle(event);
    switch (event.type) {
      case 'response.output_item.added': return this.add(event.output_index, event.item);
      case 'response.output_text.delta': return this.delta(event, 'text');
      case 'response.refusal.delta': return this.delta(event, 'refusal');
      case 'response.reasoning_summary_text.delta': return this.delta(event, 'summary');
      // Full reasoning is validated separately; only the summary is streamed.
      // The completed item projects full text only when no summary is available.
      case 'response.reasoning_text.delta': return this.delta(event, 'reasoning');
      case 'response.reasoning_text.done': return this.contentDone(event, 'reasoning', event.text);
      case 'response.output_text.done': return this.contentDone(event, 'text', event.text);
      case 'response.refusal.done': return this.contentDone(event, 'refusal', event.refusal);
      case 'response.reasoning_summary_text.done': return this.contentDone(event, 'summary', event.text);
      case 'response.function_call_arguments.done': return this.contentDone(event, 'arguments', event.arguments);
      case 'response.content_part.added':
      case 'response.reasoning_summary_part.added': return this.partEvent(event, false);
      case 'response.content_part.done':
      case 'response.reasoning_summary_part.done': return this.partEvent(event, true);
      case 'response.output_text.annotation.added': {
        const {state,part,index} = this.track(event, 'text', {requiredIndex:true});
        if (part.closed) throw protocol('An annotation arrived after content completion.');
        this.annotation(state,index,event.annotation_index,event.annotation);
        return [];
      }
      case 'response.function_call_arguments.delta': return this.delta(event, 'arguments');
      case 'response.output_item.done': return this.done(event.output_index, event.item);
      case 'response.failed': throw providerError(undefined, event.response, this.headers);
      case 'error': throw providerError(undefined, event, this.headers);
      case 'response.incomplete': throw protocol('The provider marked the response incomplete; tools were not accepted as a successful turn.');
      case 'response.completed': return this.finish(event.response);
      case 'transport.done': throw protocol('The stream ended before response.completed.');
      default: throw protocol('A classified event has no stream handler.');
    }
  }
  finish(response) {
    if (response?.status !== 'completed' || !Array.isArray(response.output)) throw protocol('The terminal response was not completed.');
    this.lifecycle({type:'response.completed',response});
    // Live ChatGPT-plan streams may send the terminal metadata with output: [].
    // Only independently completed output_item.done items can supply that snapshot.
    const output=response.output.length===0 && this.states.size>0 && [...this.states.values()].every(state=>state.closed)
      ? [...this.states.values()].map(state=>state.item) : response.output;
    if (this.states.size > output.length) throw protocol('The terminal response omitted streamed output.');
    const chunks = [];
    output.forEach((item, index) => {
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
