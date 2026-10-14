import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRequest } from '../src/request.mjs';
import { ResponseStream } from '../src/stream.mjs';
import { options, textItem, reasonItem, toolItem, complete } from './helpers.mjs';

test('subscription request uses array input and no stored-response continuation',()=>{
  const request=buildRequest(options({system:'Be helpful.'}));
  assert.deepEqual(request,{model:'test-model',input:[{role:'user',content:'Hello'}],store:false,stream:true,instructions:'Be helpful.'});
});
test('leading DSH system prompt maps to instructions, never system items',()=>{
  const request=buildRequest(options({messages:[{role:'system',content:[{type:'text',text:'S'}]},{role:'developer',content:[{type:'text',text:'D'}]},{role:'user',content:[{type:'text',text:'U'}]}]}));
  assert.equal(request.instructions,'S'); assert.deepEqual(request.input.map(x=>x.role),['developer','user']);
});
for(const [key,value] of [['temperature',0],['maxTokens',200],['stop',[]]]) test(`rejects unsupported ${key} instead of dropping it`,()=>assert.throws(()=>buildRequest(options({[key]:value})),{code:'UNSUPPORTED_CAPABILITY'}));
test('functions are namespaced and schemas remain unchanged',()=>{
  const tools=[{name:'read_file',description:'Read file',parameters:{type:'object',properties:{path:{type:'string'}}}}];
  const original=structuredClone(tools);const body=buildRequest(options({tools}));
  assert.equal(body.tools[0].type,'namespace');assert.equal(body.tools[0].name,'dsh');assert.equal(body.tools[0].tools[0].strict,false);assert.deepEqual(tools,original);
});
test('deferred and duplicate tools fail',()=>{
  const tool={name:'read_file',description:'read',parameters:{type:'object'}};
  assert.throws(()=>buildRequest(options({tools:[{...tool,deferLoading:true}]})),{code:'UNSUPPORTED_CAPABILITY'});
  assert.throws(()=>buildRequest(options({tools:[tool,tool]})),{code:'INVALID_TOOL'});
});
test('tool results preserve call IDs and failed tool text',()=>{
  const request=buildRequest(options({messages:[{role:'tool',toolCallId:'call_1',isError:true,content:[{type:'text',text:'File not found'}]}]}));
  assert.deepEqual(request.input,[{type:'function_call_output',call_id:'call_1',output:'File not found'}]);
});
test('assistant replay round-trips reasoning ciphertext, phase and tool identity',()=>{
  const output=[reasonItem(),textItem('Checking','msg_1','commentary'),toolItem()];
  const stream=new ResponseStream({model:'test-model',toolNames:['read_file']});
  const chunks=stream.accept(complete(output));const blocks=chunks.filter(x=>x.type==='block-end').map(x=>x.block);const replayState=chunks.at(-1).replayState;
  const message={role:'assistant',content:blocks,source:{provider:'openai-chatgpt-plan',replayState}};
  const request=buildRequest(options({messages:[message,{role:'tool',toolCallId:'call_1',content:[{type:'text',text:'contents'}]}]}));
  assert.deepEqual(request.input.slice(0,3),output);assert.equal(request.input[1].phase,'commentary');assert.equal(request.input[0].encrypted_content,reasonItem().encrypted_content);
});
test('mutated stored content cannot replay stale or hidden output',()=>{
  const chunks=new ResponseStream({model:'test-model'}).accept(complete());
  const message={role:'assistant',content:[{type:'text',text:'edited'}],source:{provider:'openai-chatgpt-plan',replayState:chunks.at(-1).replayState}};
  assert.throws(()=>buildRequest(options({messages:[message]})),{code:'PROTOCOL_ERROR'});
});
test('pruned blocks retain only corresponding replay items',()=>{
  const chunks=new ResponseStream({model:'test-model',toolNames:['read_file']}).accept(complete([textItem(),toolItem()]));
  const replayState=structuredClone(chunks.at(-1).replayState);replayState.blocks.splice(1,1);
  const request=buildRequest(options({messages:[{role:'assistant',content:[{type:'text',text:'Hello'}],source:{provider:'openai-chatgpt-plan',replayState}}]}));
  assert.equal(request.input.length,1);assert.equal(request.input[0].type,'message');
});
test('model switches project visible history without foreign opaque metadata',()=>{
  const chunks=new ResponseStream({model:'other-model'}).accept(complete());
  const message={role:'assistant',content:[{type:'text',text:'Hello'}],source:{provider:'openai-chatgpt-plan',replayState:chunks.at(-1).replayState}};
  const request=buildRequest(options({messages:[message]}));assert.equal(request.input[0].content[0].text,'Hello');assert.equal(request.input[0].id,undefined);
});
test('rejects missing encrypted reasoning replay and unsupported media',()=>{
  for(const block of [{type:'reasoning',text:'Reasoning'},{type:'image',attachment:{}}]) assert.throws(()=>buildRequest(options({messages:[{role:'assistant',content:[block]}]})),{code:'UNSUPPORTED_CAPABILITY'});
  assert.throws(()=>buildRequest(options({messages:[{role:'user',content:[{type:'image',attachment:{}}]}]})),{code:'UNSUPPORTED_CAPABILITY'});
});
test('rejects mid-history system replacement',()=>assert.throws(()=>buildRequest(options({messages:[{role:'user',content:[]},{role:'system',content:[]}]})),{code:'UNSUPPORTED_CAPABILITY'}));
test('long histories remain explicit and input is not mutated',()=>{
  const messages=Array.from({length:1000},(_,i)=>({role:'user',content:[{type:'text',text:`turn ${i}`}]}));
  const original=structuredClone(messages);const request=buildRequest(options({messages}));
  assert.equal(request.input.length,1000);assert.deepEqual(messages,original);assert.equal('previous_response_id' in request,false);
});

test('DSH projected tool-history bookkeeping is not sent to the provider',()=>{
 const request=buildRequest(options({toolHistory:{tools:[],updates:[]}}));
 assert.equal('toolHistory' in request,false);assert.deepEqual(request.input,[{role:'user',content:'Hello'}]);
});

test('DeepSeek to GPT preserves text and tools while excluding provider-private reasoning',()=>{
 const messages=[{role:'assistant',source:{provider:'deepseek-account',model:'deepseek-flash'},content:[{type:'reasoning',text:'private thought'},{type:'text',text:'previous answer'},{type:'tool-call',id:'c1',name:'read_file',arguments:'{}'}]},{role:'tool',toolCallId:'c1',content:[{type:'text',text:'file contents'}]}];
 const original=structuredClone(messages),request=buildRequest(options({messages}));assert.equal(request.input.length,3);assert.equal(request.input[0].content[0].text,'previous answer');assert.equal(request.input[1].call_id,'c1');assert.equal(request.input[2].output,'file contents');assert.deepEqual(messages,original);assert.equal(JSON.stringify(request).includes('private thought'),false);
});
test('GPT model switches validate replay before projecting answers and tools',()=>{
 const output=[reasonItem(),textItem('answer'),toolItem()];const chunks=new ResponseStream({model:'old-model',toolNames:['read_file']}).accept(complete(output));const message={role:'assistant',source:{provider:'openai-chatgpt-plan',replayState:chunks.at(-1).replayState},content:chunks.filter(x=>x.type==='block-end').map(x=>x.block)};
 const request=buildRequest(options({messages:[message]}));assert.equal(request.input.length,2);assert.equal(request.input[0].content[0].text,'answer');assert.equal(request.input[1].call_id,'call_1');assert.equal(JSON.stringify(request).includes('encrypted_content'),false);message.content[1].text='modified';assert.throws(()=>buildRequest(options({messages:[message]})),{code:'PROTOCOL_ERROR'});
});
