import {randomBytes} from 'node:crypto';
import {digest} from './request.mjs';

/** Bounded, metadata-only comparisons against the last attempted session request. */
export function createRequestDiagnostics(record) {
  const previous=new Map();
  const emit=value=>{try{record(value);}catch{ /* Diagnostics must never fail inference. */ }};
  return (body,options)=>{
    const flow=randomBytes(8).toString('hex');
    const key=typeof options.sessionId==='string'&&options.sessionId?digest([options.sessionId,options.purpose??'conversation']):null;
    const settingsHash=digest([body.model,body.reasoning??null]);
    const toolsHash=digest(body.tools??[]),instructionsHash=digest(body.instructions??'');
    const inputHash=digest(body.input),last=key?previous.get(key):undefined;
    emit({event:'inference_request',flow,inputItems:body.input.length,toolsHash,instructionsHash,inputHash,settingsHash,
      ...(last?{samePreviousInputPrefix:body.input.length>=last.items&&digest(body.input.slice(0,last.items))===last.inputHash,
        samePreviousTools:toolsHash===last.toolsHash,samePreviousInstructions:instructionsHash===last.instructionsHash,
        samePreviousSettings:settingsHash===last.settingsHash}:{}),
      ...(body.prompt_cache_key?{cacheKeyHash:digest(body.prompt_cache_key)}:{})});
    if(key){previous.delete(key);previous.set(key,{items:body.input.length,inputHash,toolsHash,instructionsHash,settingsHash});if(previous.size>64)previous.delete(previous.keys().next().value);}
    return {
      usage(usage){emit({event:'inference_usage',flow,inputTokens:usage.inputTokens+usage.cacheReadTokens+usage.cacheWriteTokens,
        cachedTokens:usage.cacheReadTokens,cacheWriteTokens:usage.cacheWriteTokens,outputTokens:usage.outputTokens});},
      failure(code){emit({event:'inference_failed',flow,failureCode:code});}
    };
  };
}
