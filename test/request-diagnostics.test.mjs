import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequestDiagnostics} from '../src/request-diagnostics.mjs';
import {diagnosticRecord} from '../src/auth/diagnostics.mjs';
import {options,makeAdapter,complete,collect} from './helpers.mjs';

test('diagnostics distinguish growing history from changed tools, instructions and model',()=>{
  const records=[],begin=createRequestDiagnostics(v=>records.push(diagnosticRecord(v)));
  const body={model:'model',input:[{role:'user',content:'PRIVATE_TEXT'}],tools:[],instructions:'PRIVATE_SYSTEM',prompt_cache_key:'PRIVATE_KEY'};
  const opts={sessionId:'PRIVATE_SESSION'};
  begin(body,opts);
  begin({...body,input:[...body.input,{role:'user',content:'next'}]},opts).usage({inputTokens:10,cacheReadTokens:90,cacheWriteTokens:0,outputTokens:2});
  assert.equal(records[1].samePreviousInputPrefix,true);assert.equal(records[1].samePreviousTools,true);
  assert.equal(records[2].inputTokens,100);assert.equal(records[2].cachedTokens,90);assert.equal(records[2].flow,records[1].flow);
  begin({...body,model:'other',input:[{role:'user',content:'changed'}],tools:[{name:'new'}],instructions:'changed'},opts);
  for(const name of ['samePreviousInputPrefix','samePreviousTools','samePreviousInstructions','samePreviousSettings'])assert.equal(records[3][name],false);
  assert.equal(JSON.stringify(records).includes('PRIVATE_'),false);
});
test('comparison state is isolated by session and purpose and bounded at 64 requests',()=>{
  const records=[],begin=createRequestDiagnostics(v=>records.push(v)),body={model:'m',input:[]};
  begin(body,{sessionId:'one'});begin(body,{sessionId:'one',purpose:'compaction'});begin(body,{});begin(body,{});
  for(const record of records)assert.equal(record.samePreviousInputPrefix,undefined);
  for(let i=0;i<65;i++)begin(body,{sessionId:`s${i}`});
  begin(body,{sessionId:'one'});assert.equal(records.at(-1).samePreviousInputPrefix,undefined);
});
test('diagnostic metadata rejects raw data, invalid counters and unsafe failure codes',()=>{
  const record=diagnosticRecord({event:'inference_failed',flow:'a'.repeat(16),failureCode:'SECRET',inputTokens:-1,cachedTokens:NaN,
    inputHash:'SECRET',message:'SECRET',authorization:'SECRET',sessionId:'SECRET',input:['SECRET']});
  assert.equal(JSON.stringify(record).includes('SECRET'),false);assert.equal(record.inputTokens,undefined);
});
test('wire diagnostics and observer failures never change inference or cause retries',async()=>{
  for(const failObserver of [false,true]){
    const records=[];
    const {adapter,calls}=makeAdapter([complete([],{usage:{input_tokens:100,output_tokens:2,input_tokens_details:{cached_tokens:90}}})],{
      onDiagnostic:value=>{if(failObserver)throw Error('observer unavailable');records.push(diagnosticRecord(value));}
    });
    const chunks=await collect(adapter.stream(options({sessionId:'private-session'})));
    assert.equal(chunks.at(-1).reason.kind,'stop');assert.equal(calls.length,1);
    if(!failObserver){assert.equal(records[0].event,'inference_request');assert.equal(records[1].event,'inference_usage');assert.equal(records[1].inputTokens,100);}
    adapter.dispose();
  }
});
test('adapter disposal is actionable and caller cancellation wins if it happened first',async()=>{
  const {adapter}=makeAdapter([]);adapter.dispose();
  await assert.rejects(()=>collect(adapter.stream(options())),e=>e.code==='ADAPTER_DISPOSED'&&e.message.includes('重新加载'));
  const second=makeAdapter([complete()]).adapter,controller=new AbortController();
  const iterator=second.stream(options({signal:controller.signal}));await iterator.next();controller.abort();second.dispose();
  await assert.rejects(()=>iterator.next(),{code:'ABORTED'});
});

test('subscription inference preserves opaque session affinity across history and adapter instances',async()=>{
  const sessionId='PRIVATE_HOST_SESSION';
  const first=makeAdapter([complete()]),second=makeAdapter([complete()]);
  await collect(first.adapter.stream(options({sessionId})));
  await collect(second.adapter.stream(options({sessionId,messages:[{role:'user',content:[{type:'text',text:'next'}]}]})));
  const requests=[first.calls[0].init,second.calls[0].init];
  const key=JSON.parse(requests[0].body).prompt_cache_key;
  assert.notEqual(key,sessionId);
  for(const request of requests){
    assert.equal(request.headers.get('session-id'),key);assert.equal(request.headers.get('thread-id'),key);
    assert.equal(request.headers.get('authorization'),'Bearer FAKE_ACCESS_TOKEN');
    assert.equal(JSON.stringify([...request.headers]).includes(sessionId),false);
    assert.equal(JSON.parse(request.body).prompt_cache_key,key);
  }
  await collect(first.adapter.stream(options()));
  assert.equal(first.calls[1].init.headers.has('session-id'),false);
  assert.equal(first.calls[1].init.headers.has('thread-id'),false);
  const catalogHeaders=await first.adapter.headers(new AbortController().signal);
  assert.equal(catalogHeaders.has('session-id'),false);assert.equal(catalogHeaders.has('thread-id'),false);
  await collect(first.adapter.stream(options({sessionId:'other-session'})));
  assert.notEqual(first.calls[2].init.headers.get('session-id'),key);
  first.adapter.dispose();second.adapter.dispose();
});
