import { createHash } from 'node:crypto';
import { AdapterError, protocol } from './errors.mjs';

export const TOOL_NAMESPACE = 'dsh';
export const REPLAY_VERSION = 'dsh-siwc-responses-v1';
export const digest = block => createHash('sha256').update(JSON.stringify(block)).digest('hex');

function unsupported(message) { throw new AdapterError(message, 'UNSUPPORTED_CAPABILITY'); }
function textOnly(blocks) {
  if (!Array.isArray(blocks)) throw protocol('The message content is not an array.');
  return blocks.map(block => {
    if (block.type !== 'text' || typeof block.text !== 'string') unsupported('This adapter currently accepts text content only for input messages.');
    return block.text;
  }).join('\n');
}


/** Other models' private reasoning cannot be replayed; retain visible answers and tool identities. */
function projectAssistant(content,input,switching){
  for(const block of content){
    if(block.type==='text')input.push({type:'message',role:'assistant',content:[{type:'output_text',text:block.text,annotations:[]}]});
    else if(block.type==='tool-call')input.push({type:'function_call',call_id:block.id,name:block.name,namespace:TOOL_NAMESPACE,arguments:block.arguments});
    else if(block.type==='reasoning'){if(!switching)unsupported('Assistant reasoning requires its original replay metadata; refusing lossy history.');}
    else unsupported('Unsupported assistant content block.');
  }
}

function inputContent(blocks,images){
  if(!blocks.some(block=>block.type==='image'))return textOnly(blocks);
  return blocks.map(block=>{
    if(block.type==='text'&&typeof block.text==='string')return {type:'input_text',text:block.text};
    if(block.type==='image'){
      const url=images.get(block.attachment?.attachmentId);
      if(!url)unsupported('Image input requires a prepared Harness attachment.');
      return {type:'input_image',image_url:url,detail:'auto'};
    }
    unsupported('Unsupported image message content.');
  });
}

/** Convert supported DSH requests; never silently discard generation controls. */
export function buildRequest(options,{images=new Map()}={}) {
  for (const key of ['temperature', 'maxTokens', 'stop']) {
    if (options[key] !== undefined) unsupported(`The ChatGPT plan route cannot honor GenerateOptions.${key}; remove that setting.`);
  }
  // DSH projects tool history to the complete tools list when toolUpdate is absent.
  // Historical bookkeeping may remain on options; never send it to Responses.
  if (typeof options.model !== 'string' || !options.model) throw new AdapterError('A model from the account model catalog is required.', 'INVALID_CONFIG');
  const input = [], instructions = [];
  if (options.system !== undefined) {
    if (typeof options.system !== 'string') throw protocol('The system prompt must be text.');
    if (options.system) instructions.push(options.system);
  }
  let nonSystemSeen = false;
  for (const message of options.messages ?? []) {
    if (message.role === 'system') {
      if (nonSystemSeen) unsupported('Mid-conversation system replacement is not supported by this adapter.');
      instructions.push(textOnly(message.content));
      continue;
    }
    nonSystemSeen = true;
    if (message.role === 'tool') {
      const callId = message.toolCallId ?? message.source?.callId;
      if (typeof callId !== 'string' || !callId) throw protocol('Tool results require the original call ID.');
      input.push({type:'function_call_output', call_id:callId, output:inputContent(message.content,images)});
    } else if (message.role === 'assistant') {
      const replay = message.source?.replayState;
      if (message.source?.provider === options.provider && replay?.response?.version === REPLAY_VERSION) {
        if (!Array.isArray(replay.blocks) || replay.blocks.length !== message.content.length) throw protocol('Stored replay metadata does not match the assistant message.');
        const entries = replay.blocks.map((entry, index) => {
          if (!entry || entry.digest !== digest(message.content[index])) throw protocol('Stored replay content differs from the assistant message.');
          const block = itemToBlock(entry.item);
          if (digest(block) !== entry.digest) throw protocol('Stored replay item differs from the assistant message.');
          return entry;
        });
        if(replay.response.model===options.model){
          for (const entry of entries.sort((a,b) => a.outputIndex - b.outputIndex)) input.push(structuredClone(entry.item));
        }else projectAssistant(message.content,input,true);
      } else {
        const foreign=typeof message.source?.provider==='string'&&message.source.provider!==options.provider;
        projectAssistant(message.content,input,foreign);
      }
    } else if (message.role === 'user' || message.role === 'developer') {
      input.push({role:message.role, content:inputContent(message.content,images)});
    } else unsupported('Unsupported message role.');
  }
  // Stateless reasoning must return the ciphertext required by itemToBlock/replay.
  const body = {model:options.model, input, store:false, stream:true, include:['reasoning.encrypted_content']};
  if (instructions.length) body.instructions = instructions.join('\n\n');
  if (options.reasoningEffort !== undefined) body.reasoning = {effort:options.reasoningEffort};
  if (options.tools?.length) {
    const names = new Set();
    body.tools = [{type:'namespace', name:TOOL_NAMESPACE, description:'Tools executed and permission-checked by DeepSeek Harness.', tools:options.tools.map(tool => {
      if (tool.deferLoading) unsupported('Deferred tool loading is not supported on the subscription route.');
      if (typeof tool.name !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(tool.name) || names.has(tool.name)) throw new AdapterError('Tool names must be unique and use 1–64 letters, digits, underscores or hyphens.', 'INVALID_TOOL');
      names.add(tool.name);
      return {type:'function', name:tool.name, description:tool.description, parameters:structuredClone(tool.parameters), strict:false};
    })}];
  }
  return body;
}

/** Project completed wire items to one DSH block per provider item for aligned replay. */
export function itemToBlock(item) {
  if (!item || typeof item !== 'object') throw protocol();
  if (item.status !== undefined && item.status !== 'completed') throw protocol('A completed response contained an unfinished output item.');
  switch (item.type) {
    case 'message': {
      if (item.role !== 'assistant' || !Array.isArray(item.content)) throw protocol();
      const text = item.content.map(part => {
        if (part.type === 'output_text' && typeof part.text === 'string') return part.text;
        if (part.type === 'refusal' && typeof part.refusal === 'string') return part.refusal;
        throw protocol('An unsupported assistant content part was received.');
      }).join('');
      return {type:'text', text};
    }
    case 'reasoning': {
      if (!Array.isArray(item.summary)) throw protocol();
      if (typeof item.encrypted_content !== 'string' || !item.encrypted_content) throw protocol('Stateless reasoning is missing replayable encrypted content.');
      const summary = item.summary.map(part => {
        if (part.type !== 'summary_text' || typeof part.text !== 'string') throw protocol();
        return part.text;
      }).join('');
      if (item.content !== undefined && (!Array.isArray(item.content) || item.content.some(part => part?.type !== 'reasoning_text' || typeof part.text !== 'string'))) throw protocol('Invalid completed reasoning content.');
      return {type:'reasoning', text:summary || (item.content ?? []).map(part => part.text).join('')};
    }
    case 'function_call':
      if (item.namespace !== TOOL_NAMESPACE || typeof item.call_id !== 'string' || !item.call_id || typeof item.name !== 'string' || !item.name || typeof item.arguments !== 'string') throw protocol('The provider returned an invalid or unexpected tool call.');
      try { JSON.parse(item.arguments); } catch { throw protocol('The provider returned incomplete tool arguments.'); }
      return {type:'tool-call', id:item.call_id, name:item.name, arguments:item.arguments};
    default: throw protocol('An unsupported output item was received; replay was not discarded.');
  }
}
