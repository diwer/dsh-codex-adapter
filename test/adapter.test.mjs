import test from 'node:test';
import assert from 'node:assert/strict';
import {PROVIDER, API_ORIGIN} from '../src/adapter.mjs';
import {Adapter, options, textItem, toolItem, reasonItem, complete, response, collect, makeAdapter} from './helpers.mjs';
import {usageFromResponse} from '../src/stream.mjs';

const tool={name:'read_file',description:'Read file',parameters:{type:'object',properties:{path:{type:'string'}}}};
const events=[
  {type:'response.created'},
  {type:'response.output_item.added',output_index:0,item:{...textItem(),status:'in_progress',content:[]}},
  {type:'response.output_text.delta',output_index:0,item_id:'msg_1',content_index:0,delta:'Hel'},
  {type:'response.output_text.delta',output_index:0,item_id:'msg_1',content_index:0,delta:'lo'},
  {type:'response.output_item.done',output_index:0,item:textItem()},
  complete([textItem()],{usage:{input_tokens:100,output_tokens:20,input_tokens_details:{cached_tokens:30,cache_write_tokens:5},output_tokens_details:{reasoning_tokens:4}}}),
];
test('streams paired blocks, attribution and usage before a terminal finish',async()=>{
  const {adapter,calls}=makeAdapter(events);const chunks=await collect(adapter.stream(options()));
  assert.deepEqual(chunks.map(x=>x.type),['block-start','text-delta','text-delta','block-end','usage','finish']);
  assert.deepEqual(chunks.at(-2).usage,{inputTokens:65,outputTokens:20,cacheReadTokens:30,cacheWriteTokens:5,totalTokens:120,reasoningTokens:4});
  assert.equal(chunks.at(-1).reason.kind,'stop');assert.equal(calls.length,1);
  assert.equal(calls[0].url,`${API_ORIGIN}/responses`);assert.equal(calls[0].init.redirect,'error');
  assert.match(calls[0].init.headers.get('user-agent'),/^deepseek-harness/);assert.equal(calls[0].init.headers.get('authorization'),'Bearer FAKE_ACCESS_TOKEN');
  const body=JSON.parse(calls[0].init.body);assert.equal(body.store,false);assert.equal(body.stream,true);assert.equal('previous_response_id' in body,false);
});
test('streams multiple interleaved tool calls and requests host execution only on completion',async()=>{
  const first=toolItem();const second=toolItem('read_file','{"path":"b.txt"}','fc_2','call_2');
  const {adapter}=makeAdapter([
    {type:'response.output_item.added',output_index:0,item:{...first,arguments:'',status:'in_progress'}},
    {type:'response.output_item.added',output_index:1,item:{...second,arguments:'',status:'in_progress'}},
    {type:'response.function_call_arguments.delta',output_index:0,item_id:'fc_1',delta:'{"path":'},
    {type:'response.function_call_arguments.delta',output_index:1,item_id:'fc_2',delta:'{"path":"b.txt"}'},
    {type:'response.function_call_arguments.delta',output_index:0,item_id:'fc_1',delta:'"a.txt"}'},
    {type:'response.output_item.done',output_index:1,item:second},
    {type:'response.output_item.done',output_index:0,item:first},complete([first,second]),
  ]);
  const chunks=await collect(adapter.stream(options({tools:[tool]})));
  assert.equal(chunks.at(-1).reason.kind,'tool-calls');assert.deepEqual(chunks.filter(x=>x.type==='block-end').map(x=>x.block.id),['call_2','call_1']);
  assert.deepEqual(chunks.at(-1).replayState.blocks.map(x=>x.item.call_id),['call_1','call_2']);
});
test('reasoning summary and encrypted final state round-trip',async()=>{
  const item=reasonItem();const {adapter}=makeAdapter([
    {type:'response.output_item.added',output_index:0,item:{...item,status:'in_progress',summary:[],encrypted_content:'incomplete'}},
    {type:'response.reasoning_summary_text.delta',output_index:0,item_id:'rs_1',summary_index:0,delta:'Checking'},
    {type:'response.output_item.done',output_index:0,item},complete([item]),
  ]);
  const chunks=await collect(adapter.stream(options()));assert.equal(chunks.at(-1).replayState.blocks[0].item.encrypted_content,item.encrypted_content);
  assert.equal(chunks.filter(x=>x.type==='reasoning-delta').map(x=>x.text).join(''),item.summary[0].text);
});
test('preserves refusal output as text',async()=>{
  const item={...textItem(),content:[{type:'refusal',refusal:'I cannot do that.'}]};const {adapter}=makeAdapter([complete([item])]);
  const chunks=await collect(adapter.stream(options()));assert.equal(chunks.find(x=>x.type==='block-end').block.text,'I cannot do that.');
});
for(const [label,last,code] of [
  ['failed stream',{type:'response.failed',response:{error:{code:'subscription_sharing_usage_limit_exceeded'}}},'SUBSCRIPTION_LIMIT'],
  ['incomplete stream',{type:'response.incomplete',response:{status:'incomplete'}},'PROTOCOL_ERROR'],
  ['explicit error',{type:'error',code:'subscription_sharing_unsupported_capability',param:'tools'},'UNSUPPORTED_CAPABILITY'],
]) test(`${label} cannot emit successful finish`,async()=>{
  const {adapter}=makeAdapter([...events.slice(0,4),last]);const seen=[];
  await assert.rejects(async()=>{for await(const chunk of adapter.stream(options()))seen.push(chunk);},{code});
  assert.equal(seen.some(x=>x.type==='finish'),false);
});
test('EOF after output without response.completed fails without replay',async()=>{
  const {adapter}=makeAdapter(events.slice(0,-1));await assert.rejects(()=>collect(adapter.stream(options())),{code:'STREAM_INTERRUPTED'});
});
test('HTTP errors preserve structured facts without leaking response tokens',async()=>{
  const adapter=new Adapter({session:{async accessToken(){return 'VERY_SECRET_TOKEN';}},fetchImpl:async()=>new Response(JSON.stringify({error:{code:'subscription_sharing_usage_limit_exceeded',message:'VERY_SECRET_TOKEN',param:'limit'}}),{status:429,headers:{'x-request-id':'req_123','retry-after':'2'}})});
  await assert.rejects(()=>collect(adapter.stream(options())),error=>{
    assert.equal(error.code,'SUBSCRIPTION_LIMIT');assert.equal(error.status,429);assert.equal(error.providerCode,'subscription_sharing_usage_limit_exceeded');assert.equal(error.providerRetryAfterMs,2000);assert.equal(error.requestId,'req_123');assert.equal(JSON.stringify(error).includes('VERY_SECRET_TOKEN'),false);return true;
  });
});
test('direct admission detail errors are not mistaken for standard API objects',async()=>{
  const adapter=new Adapter({session:{async accessToken(){return 'fake';}},fetchImpl:async()=>new Response(JSON.stringify({detail:'sensitive provider diagnostic'}),{status:403})});
  await assert.rejects(()=>collect(adapter.stream(options())),error=>error.code==='PERMISSION_DENIED'&&error.bodyKind==='detail'&&!error.message.includes('sensitive'));
});
test('no automatic retry or API-key fallback on subscription limits',async()=>{
  let calls=0;const adapter=new Adapter({session:{async accessToken(){return 'fake';}},fetchImpl:async()=>{calls++;return new Response('{}',{status:429});}});
  await assert.rejects(()=>collect(adapter.stream(options())),{code:'RATE_LIMIT'});assert.equal(calls,1);
});
test('model discovery preserves server order and filters hidden entries',async()=>{
  const calls=[];const adapter=new Adapter({session:{async accessToken(){return 'fake';}},fetchImpl:async(url,init)=>{calls.push({url,init});return Response.json({models:[{slug:'b',display_name:'B',visibility:'list'},{slug:'x',display_name:'X',visibility:'hide'},{slug:'a',display_name:'A',visibility:'list'}]});},modelCapabilities:{a:{contextWindow:10000,reasoningEfforts:['low','high']}}});
  assert.deepEqual((await adapter.listModels(PROVIDER)).map(x=>x.id),['b','a']);
  const model=await adapter.resolveModel(PROVIDER,'a');assert.equal(model.context.contextWindow,10000);assert.deepEqual(model.reasoning.efforts.map(x=>x.id),['low','high']);
  assert.equal(calls[0].url,`${API_ORIGIN}/models`);assert.equal(calls[0].init.redirect,'error');
  await assert.rejects(()=>adapter.resolveModel(PROVIDER,'missing'),{code:'MODEL_UNAVAILABLE'});
});
test('malformed model catalogs fail visibly',async()=>{
  const adapter=new Adapter({session:{async accessToken(){return 'fake';}},fetchImpl:async()=>Response.json({data:[{id:'model'}]})});
  await assert.rejects(()=>adapter.listModels(PROVIDER),{code:'PROTOCOL_ERROR'});
});
test('configured reasoning efforts are checked before any network call',async()=>{
  const {adapter,calls}=makeAdapter([complete()],{modelCapabilities:{'test-model':{reasoningEfforts:['low','high']}}});
  await assert.rejects(()=>collect(adapter.stream(options({reasoningEffort:'max'}))),{code:'UNSUPPORTED_CAPABILITY'});assert.equal(calls.length,0);
  await collect(adapter.stream(options({reasoningEffort:'high'})));assert.deepEqual(JSON.parse(calls[0].init.body).reasoning,{effort:'high'});
});
test('already-cancelled requests do not obtain credentials or send requests',async()=>{
  const abort=new AbortController();abort.abort();let tokenCalls=0;const {adapter,calls}=makeAdapter([complete()],{session:{async accessToken(){tokenCalls++;return 'fake';}}});
  await assert.rejects(()=>collect(adapter.stream(options({signal:abort.signal}))),{code:'ABORTED'});assert.equal(tokenCalls,0);assert.equal(calls.length,0);
});
test('unsupported DSH options fail before credentials or requests',async()=>{
  const {adapter,calls}=makeAdapter([complete()]);await assert.rejects(()=>collect(adapter.stream(options({temperature:0.1}))),{code:'UNSUPPORTED_CAPABILITY'});assert.equal(calls.length,0);
});
test('invalid credentials are not sent in HTTP headers',async()=>{
  const {adapter,calls}=makeAdapter([complete()],{session:{async accessToken(){return 'fake\r\ninjected: header';}}});
  await assert.rejects(()=>collect(adapter.stream(options())),{code:'AUTH'});assert.equal(calls.length,0);
});
test('non-SSE successful HTTP responses fail',async()=>{
  const {adapter}=makeAdapter([],{fetchImpl:async()=>Response.json({text:'no stream'})});await assert.rejects(()=>collect(adapter.stream(options())),{code:'PROTOCOL_ERROR'});
});
for(const [label, output] of [
  ['unknown output',[{id:'web1',type:'web_search_call',status:'completed'}]],
  ['unknown tool',[toolItem('undeclared')]],
  ['wrong tool namespace',[{...toolItem(),namespace:'other'}]],
  ['malformed tool arguments',[toolItem('read_file','{')]],
  ['unfinished tool',[{...toolItem(),status:'incomplete'}]],
  ['reasoning without ciphertext',[{...reasonItem(),encrypted_content:null}]],
])test(`rejects ${label}`,async()=>{
  const {adapter}=makeAdapter([complete(output)]);await assert.rejects(()=>collect(adapter.stream(options({tools:[tool]}))),{code:'PROTOCOL_ERROR'});
});
test('streamed text cannot be changed by completion',async()=>{
  const {adapter}=makeAdapter([...events.slice(0,4),{type:'response.output_item.done',output_index:0,item:textItem('Goodbye')}]);await assert.rejects(()=>collect(adapter.stream(options())),{code:'PROTOCOL_ERROR'});
});
test('duplicate output completion fails',async()=>{
  const {adapter}=makeAdapter([...events.slice(0,5),events[4],events[5]]);await assert.rejects(()=>collect(adapter.stream(options())),{code:'PROTOCOL_ERROR'});
});
test('usage cache counters are disjoint and invalid counters fail',()=>{
  assert.equal(usageFromResponse({input_tokens:10,output_tokens:3,input_tokens_details:{cached_tokens:10}}).inputTokens,0);
  assert.throws(()=>usageFromResponse({input_tokens:1,output_tokens:3,input_tokens_details:{cached_tokens:10}}),{code:'PROTOCOL_ERROR'});
});
test('disposing an adapter cancels stalled model discovery',async()=>{
  let cancelled=false;
  const adapter=new Adapter({session:{async accessToken(){return 'fake';}},fetchImpl:async()=>new Response(new ReadableStream({cancel(){cancelled=true;}}))});
  const pending=adapter.listModels(PROVIDER);await new Promise(resolve=>setImmediate(resolve));adapter.dispose();
  await assert.rejects(()=>pending,{code:'ABORTED'});assert.equal(cancelled,true);
});
test('provider retry policy disables host automatic replay',()=>{
  const {adapter}=makeAdapter([]);assert.equal(adapter.providerRetryPolicy(PROVIDER).maxRetries,0);
});
for (const how of ['dispose','caller']) test(`cancellation by ${how} between chunks cannot emit a successful finish`,async()=>{
  const controller=new AbortController();const {adapter}=makeAdapter([complete()]);
  const iterator=adapter.stream(options({signal:controller.signal}));
  assert.equal((await iterator.next()).value.type,'block-start');
  if (how==='dispose') adapter.dispose(); else controller.abort();
  await assert.rejects(()=>iterator.next(),{code:'ABORTED'});
});
test('encrypted replay is bounded independently of visible output length',async()=>{
  const item={...reasonItem(),summary:[],encrypted_content:'x'.repeat(1000)};
  const {adapter}=makeAdapter([complete([item])],{maxOutputChars:1,maxReplayBytes:100});
  await assert.rejects(()=>collect(adapter.stream(options())),{code:'PROTOCOL_ERROR'});
});
for(const path of ['http','stream','catalog']) test(`${path} errors redact bearer reflected in machine metadata`,async()=>{
  const token='FAKE_BEARER_SECRET';
  const fetchImpl=async()=>path==='stream'
    ? response([{type:'response.failed',response:{error:{code:token,param:token}}}],{headers:{'x-request-id':token}})
    : new Response(JSON.stringify({error:{code:token,param:token}}),{status:401,headers:{'x-request-id':token}});
  const adapter=new Adapter({session:{async accessToken(){return token;}},fetchImpl});
  await assert.rejects(()=>path==='catalog'?adapter.listModels(PROVIDER):collect(adapter.stream(options())),error=>{assert.equal(JSON.stringify(error).includes(token),false);assert.equal(error.message.includes(token),false);return true;});
});
test('stream failures retain the successful HTTP request ID',async()=>{
  const {adapter}=makeAdapter([],{fetchImpl:async()=>response([{type:'response.failed',response:{error:{code:'subscription_sharing_usage_limit_exceeded'}}}],{headers:{'x-request-id':'req_stream_123'}})});
  await assert.rejects(()=>collect(adapter.stream(options())),error=>error.requestId==='req_stream_123'&&error.providerCode==='subscription_sharing_usage_limit_exceeded');
});
test('in-progress items do not retain unneeded encrypted metadata',async()=>{
  const {ResponseStream}=await import('../src/stream.mjs');const stream=new ResponseStream({model:'test-model'});
  stream.accept({type:'response.output_item.added',output_index:0,item:{...reasonItem(),status:'in_progress',encrypted_content:'x'.repeat(100000)}});
  assert.equal('encrypted_content' in stream.states.get(0).initial,false);
});

test('TLS failures preserve an actionable certificate code without provider secrets',async()=>{
  const adapter=new Adapter({session:{async accessToken(){return 'VERY_SECRET_TOKEN';}},fetchImpl:async()=>{throw new TypeError('VERY_SECRET_TOKEN',{cause:{code:'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',message:'VERY_SECRET_TOKEN'}});}});
  await assert.rejects(()=>adapter.listModels(PROVIDER),error=>{assert.equal(error.code,'TLS_ERROR');assert.match(error.message,/UNABLE_TO_GET_ISSUER_CERT_LOCALLY/);assert.doesNotMatch(error.message+JSON.stringify(error),/VERY_SECRET_TOKEN/);return true;});
});

test('missing Content-Type still requires a valid, completed SSE response',async()=>{
  const {adapter}=makeAdapter([complete([textItem('Headerless SSE')])],{fetchImpl:async()=>{const r=response([complete([textItem('Headerless SSE')])]);r.headers.delete('content-type');return r;}});
  const chunks=await collect(adapter.stream(options()));assert.equal(chunks.at(-1).reason.kind,'stop');assert.equal(chunks.find(x=>x.type==='block-end').block.text,'Headerless SSE');
  const invalid=new Adapter({session:{async accessToken(){return 'fake';}},fetchImpl:async()=>new Response(new TextEncoder().encode('not an SSE response'))});
  await assert.rejects(()=>collect(invalid.stream(options())),{code:'PROTOCOL_ERROR'});
});

test('metadata-only completed terminal preserves already completed output and replay',async()=>{
  const item=textItem('Completed stream item');
  const {adapter}=makeAdapter([{type:'response.output_item.added',output_index:0,item:{...item,status:'in_progress',content:[]}},{type:'response.output_text.delta',output_index:0,item_id:item.id,content_index:0,delta:'Completed stream item'},{type:'response.output_item.done',output_index:0,item},complete([])]);
  const chunks=await collect(adapter.stream(options()));const final=chunks.at(-1);assert.equal(final.reason.kind,'stop');assert.equal(final.replayState.blocks.length,1);assert.deepEqual(final.replayState.blocks[0].item,item);
  const open=makeAdapter([{type:'response.output_item.added',output_index:0,item:{...item,status:'in_progress',content:[]}},{type:'response.output_text.delta',output_index:0,item_id:item.id,content_index:0,delta:'unfinished'},complete([])]).adapter;
  await assert.rejects(()=>collect(open.stream(options())),{code:'PROTOCOL_ERROR'});
});

test('account-advertised image modalities survive list and resolution',async()=>{
 const adapter=new Adapter({session:{accessToken:async()=> 'FAKE'},fetchImpl:async()=>Response.json({models:[{slug:'vision-model',display_name:'Vision',visibility:'list',input_modalities:['text','image']}]})});
 assert.deepEqual((await adapter.listModels(PROVIDER))[0].inputModalities,['text','image']);assert.deepEqual((await adapter.resolveModel(PROVIDER,'vision-model')).inputModalities,['text','image']);
});

test('clean EOF before any output retries once and preserves the successful finish',async()=>{
 let calls=0;const adapter=new Adapter({session:{accessToken:async()=> 'FAKE'},fetchImpl:async()=>++calls===1?response([{type:'response.created'}]):response([complete()])});
 const chunks=await collect(adapter.stream(options()));assert.equal(calls,2);assert.equal(chunks.at(-1).reason.kind,'stop');assert.equal(chunks.filter(x=>x.type==='text-delta').length,1);
});
test('two empty responses end as interruption with safe HTTP request facts',async()=>{
 let calls=0;const adapter=new Adapter({session:{accessToken:async()=> 'FAKE'},fetchImpl:async()=>{calls++;return response([],{headers:{'x-request-id':'req_empty'}});}});
 await assert.rejects(()=>collect(adapter.stream(options())),error=>error.code==='STREAM_INTERRUPTED'&&error.requestId==='req_empty'&&error.bodyKind==='sse_no_output');assert.equal(calls,2);
});
test('a partial tool block is never retried or accepted as complete',async()=>{
 let calls=0;const adapter=new Adapter({session:{accessToken:async()=> 'FAKE'},fetchImpl:async()=>{calls++;return response([{type:'response.output_item.added',output_index:0,item:{...toolItem(),arguments:'',status:'in_progress'}}]);}});
 const chunks=[];await assert.rejects(async()=>{for await(const chunk of adapter.stream(options({tools:[tool]})))chunks.push(chunk);},{code:'STREAM_INTERRUPTED'});assert.equal(calls,1);assert.equal(chunks.some(c=>c.type==='finish'),false);
});
test('cancellation during empty-stream retry wait prevents a second request',async()=>{
 let calls=0;const controller=new AbortController();const adapter=new Adapter({session:{accessToken:async()=> 'FAKE'},fetchImpl:async()=>{calls++;setTimeout(()=>controller.abort(),30);return response([]);}});
 await assert.rejects(()=>collect(adapter.stream(options({signal:controller.signal}))),{code:'ABORTED'});assert.equal(calls,1);
});
