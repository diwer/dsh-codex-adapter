import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {RESPONSE_EVENT_POLICY,eventPolicy} from '../src/events.mjs';
import {ResponseStream} from '../src/stream.mjs';
import {options,textItem,toolItem,reasonItem,complete,collect,makeAdapter,response,encodeEvents} from './helpers.mjs';

const fixture=JSON.parse(await readFile(new URL('./fixtures/responses-events-7.36.0.json',import.meta.url),'utf8'));
const legacy=JSON.parse(await readFile(new URL('./fixtures/responses-events-7.8.0.json',import.meta.url),'utf8'));
const official=JSON.parse(await readFile(new URL('./fixtures/responses-events-official.json',import.meta.url),'utf8'));
const steering=['response.steer.accepted','response.steer.failed','response.steer.pending'];
const advisoryTypes=['keepalive','rate_limits.updated','response.metadata','codex.response.metadata','responsesapi.websocket_timing'];
const extensions=[...advisoryTypes,...steering,'transport.done'];
const tool={name:'read_file',parameters:{type:'object',properties:{path:{type:'string'}}}};
const fail=events=>assert.rejects(()=>collect(makeAdapter(events).adapter.stream(options({tools:[tool]}))),{code:'PROTOCOL_ERROR'});
const added=(item,index=0)=>({type:'response.output_item.added',output_index:index,item:{...item,status:'in_progress',...(item.type==='message'?{content:[]}:item.type==='reasoning'?{summary:[],content:[]}: {arguments:''})}});
const scoped=(type,index,id,extra={})=>({type,output_index:index,item_id:id,...extra});

// This fixture is the complete discriminated union, not a list inferred from handlers.
test('every pinned public SDK stream event has an exact policy, with extensions kept separate',()=>{
  assert.equal(fixture.events.length,59);
  assert.equal(new Set(fixture.events).size,fixture.events.length);
  assert.deepEqual(official.events,fixture.events);
  for(const type of legacy.events) assert.ok(fixture.events.includes(type));
  assert.deepEqual(Object.keys(RESPONSE_EVENT_POLICY).filter(type=>!extensions.includes(type)).sort(),fixture.events);
  for(const type of ['toString','constructor','__proto__','response.future_content.delta','keepalive.delta','ping','response.create']) assert.equal(eventPolicy(type),undefined);
});

for(const type of [...fixture.events.filter(type=>eventPolicy(type)==='unsupported'),...steering]){
  test(`explicit capability rejection: ${type}`,async()=>{
    const {adapter,calls}=makeAdapter([{type,delta:'PRIVATE_EVENT_DATA',command:'PRIVATE_EVENT_DATA'}]);
    await assert.rejects(()=>collect(adapter.stream(options())),error=>error.code==='PROTOCOL_ERROR'&&error.providerEvent===type&&!JSON.stringify(error).includes('PRIVATE_EVENT_DATA'));
    assert.equal(calls.length,1);
  });
}

const reason={...reasonItem(),content:[{type:'reasoning_text',text:'Full reasoning.'}]};
const message={...textItem(),content:[{type:'output_text',text:'Hello',annotations:[{type:'url_citation',url:'https://example.test',title:'Example',start_index:0,end_index:5}]},{type:'refusal',refusal:'No'}]};
const call=toolItem();
const flow=[
  {type:'response.queued',response:{id:'resp_1',status:'queued'}},
  {type:'response.created',response:{id:'resp_1',status:'in_progress'}},
  {type:'response.in_progress',response:{id:'resp_1',status:'in_progress'}},
  added(reason),
  scoped('response.content_part.added',0,reason.id,{content_index:0,part:{type:'reasoning_text',text:''}}),
  scoped('response.reasoning_summary_part.added',0,reason.id,{summary_index:0,part:{type:'summary_text',text:''}}),
  scoped('response.reasoning_text.delta',0,reason.id,{content_index:0,delta:'Full'}),
  scoped('response.reasoning_summary_text.delta',0,reason.id,{summary_index:0,delta:'Checking'}),
  scoped('response.reasoning_text.done',0,reason.id,{content_index:0,text:'Full reasoning.'}),
  scoped('response.content_part.done',0,reason.id,{content_index:0,part:reason.content[0]}),
  scoped('response.reasoning_summary_text.done',0,reason.id,{summary_index:0,text:reason.summary[0].text}),
  scoped('response.reasoning_summary_part.done',0,reason.id,{summary_index:0,part:reason.summary[0]}),
  {type:'response.output_item.done',output_index:0,item:reason},
  added(message,1),
  scoped('response.content_part.added',1,message.id,{content_index:0,part:{type:'output_text',text:'H',annotations:[]}}),
  scoped('response.output_text.delta',1,message.id,{content_index:0,delta:'el'}),
  scoped('response.output_text.annotation.added',1,message.id,{content_index:0,annotation_index:0,annotation:message.content[0].annotations[0]}),
  scoped('response.output_text.done',1,message.id,{content_index:0,text:'Hello'}),
  scoped('response.content_part.done',1,message.id,{content_index:0,part:message.content[0]}),
  scoped('response.content_part.added',1,message.id,{content_index:1,part:{type:'refusal',refusal:''}}),
  scoped('response.refusal.delta',1,message.id,{content_index:1,delta:'N'}),
  scoped('response.refusal.done',1,message.id,{content_index:1,refusal:'No'}),
  scoped('response.content_part.done',1,message.id,{content_index:1,part:message.content[1]}),
  {type:'response.output_item.done',output_index:1,item:message},
  added(call,2),
  scoped('response.function_call_arguments.delta',2,call.id,{delta:'{"path":'}),
  scoped('response.function_call_arguments.done',2,call.id,{name:call.name,arguments:call.arguments}),
  {type:'response.output_item.done',output_index:2,item:call},
  complete([reason,message,call],{id:'resp_1',usage:{input_tokens:2,output_tokens:3}}),
];

test('all supported nonfailure public events run together without duplicate text, reasoning or tools',async()=>{
  const expectedTypes=fixture.events.filter(type=>!['unsupported','failure'].includes(eventPolicy(type)));
  assert.deepEqual([...new Set(flow.map(event=>event.type))].sort(),expectedTypes.sort());
  const {adapter,calls}=makeAdapter(flow);
  const chunks=await collect(adapter.stream(options({tools:[tool]})));
  assert.equal(calls.length,1);
  assert.equal(chunks.filter(chunk=>chunk.type==='text-delta').map(chunk=>chunk.text).join(''),'HelloNo');
  assert.equal(chunks.filter(chunk=>chunk.type==='reasoning-delta').map(chunk=>chunk.text).join(''),reason.summary[0].text);
  assert.equal(chunks.filter(chunk=>chunk.type==='tool-call-delta').map(chunk=>chunk.argumentsDelta).join(''),call.arguments);
  assert.deepEqual(chunks.at(-1).replayState.blocks.map(block=>block.item),[reason,message,call]);
  assert.equal(chunks.filter(chunk=>chunk.type==='finish').length,1);
  assert.equal(chunks.at(-2).usage.totalTokens,5);
});

for(const terminalOnly of [false,true]) test(`parts/done support terminal snapshots and metadata-only terminal: ${terminalOnly}`,async()=>{
  const selected=terminalOnly?flow.filter(event=>event.type!=='response.output_item.done'):flow;
  const final=terminalOnly?selected:[...selected.slice(0,-1),complete([],{id:'resp_1',usage:{input_tokens:2,output_tokens:3}})];
  const chunks=await collect(makeAdapter(final).adapter.stream(options({tools:[tool]})));
  assert.deepEqual(chunks.at(-1).replayState.blocks.map(block=>block.item),[reason,message,call]);
});

for(const type of advisoryTypes) test(`${type} remains advisory at every boundary, including tools`,async()=>{
  const baseline=await collect(makeAdapter(flow).adapter.stream(options({tools:[tool]})));
  const advisory={type,delta:'DO_NOT_EMIT',response:{status:'completed',output:[toolItem('undeclared')]},usage:{input_tokens:999,output_tokens:999}};
  const chunks=await collect(makeAdapter(flow.flatMap(event=>[advisory,event])).adapter.stream(options({tools:[tool]})));
  assert.deepEqual(chunks,baseline);
});

for(const [event,code] of [
  [{type:'response.failed',response:{error:{code:'server_error'}}},'PROVIDER_HTTP_ERROR'],
  [{type:'error',code:'server_error',message:'Failure'},'PROVIDER_HTTP_ERROR'],
  [{type:'response.incomplete',response:{status:'incomplete'}},'PROTOCOL_ERROR'],
]) test(`terminal failure remains a failure: ${event.type}`,async()=>{
  const {adapter,calls}=makeAdapter([{type:'keepalive'},event]);
  await assert.rejects(()=>collect(adapter.stream(options())),{code});assert.equal(calls.length,1);
});

const simple=textItem();
const delta=scoped('response.output_text.delta',0,simple.id,{content_index:0,delta:'Hel'});
const done=scoped('response.output_text.done',0,simple.id,{content_index:0,text:'Hello'});
for(const [name,extra] of [
  ['unknown output index',{output_index:99}],['wrong item identity',{item_id:'wrong'}],
  ['negative part index',{content_index:-1}],['fractional part index',{content_index:0.5}],
  ['wrong index track',{summary_index:0}],['conflicting completion text',{text:'Changed'}],
]) test(`done event validation: ${name}`,()=>fail([added(simple),delta,{...done,...extra},complete([simple])]));

for(const [name,sequence] of [
  ['duplicate text done',[done,done]],
  ['delta after text done',[done,delta]],
  ['part changed to refusal',[scoped('response.content_part.done',0,simple.id,{content_index:0,part:{type:'refusal',refusal:'Hello'}})]],
  ['done followed by conflicting final item',[done,{type:'response.output_item.done',output_index:0,item:textItem('Hello changed')}]],
  ['duplicate part added',[scoped('response.content_part.added',0,simple.id,{content_index:0,part:{type:'output_text',text:''}})]],
  ['unsupported part type',[scoped('response.content_part.added',0,simple.id,{content_index:1,part:{type:'output_audio',data:'hidden'}})]],
]) test(`part ordering and consistency: ${name}`,()=>fail([added(simple),delta,...sequence,complete([simple])]));

test('duplicate output and tool call identities are rejected before a second tool block',async()=>{
  for(const second of [toolItem('read_file','{}','fc_1','call_2'),toolItem('read_file','{}','fc_2','call_1')]){
    const {adapter}=makeAdapter([added(call),added(second,1)]);const seen=[];
    await assert.rejects(async()=>{for await(const chunk of adapter.stream(options({tools:[tool]})))seen.push(chunk);},{code:'PROTOCOL_ERROR'});
    assert.equal(seen.filter(chunk=>chunk.type==='block-start').length,1);
  }
});

test('full reasoning deltas, done and final items must agree independently of the summary',async()=>{
  const start=added(reason);
  const text=scoped('response.reasoning_text.delta',0,reason.id,{content_index:0,delta:'Full'});
  for(const sequence of [
    [start,text,scoped('response.reasoning_text.done',0,reason.id,{content_index:0,text:'Changed'})],
    [start,text,complete([{...reason,content:[{type:'reasoning_text',text:'Changed'}]}])],
    [start,text,complete([{...reason,content:[]}])],
  ]) await fail(sequence);
});

test('streamed annotations cannot disappear or change in the final replay',async()=>{
  const annotation=scoped('response.output_text.annotation.added',0,simple.id,{content_index:0,annotation_index:0,annotation:message.content[0].annotations[0]});
  await fail([added(simple),delta,annotation,complete([simple])]);
});

test('part snapshots retain annotations and must agree with annotation events and final output',async()=>{
  const item={...textItem(),content:[message.content[0]]};
  const annotation=scoped('response.output_text.annotation.added',0,item.id,{content_index:0,annotation_index:0,annotation:item.content[0].annotations[0]});
  const part=scoped('response.content_part.done',0,item.id,{content_index:0,part:item.content[0]});
  const chunks=await collect(makeAdapter([added(item),part,complete([item])]).adapter.stream(options()));
  assert.deepEqual(chunks.at(-1).replayState.blocks[0].item,item);
  await fail([added(item),part,complete([simple])]);
  await fail([added(item),annotation,{...part,part:simple.content[0]},complete([item])]);
  await fail([added(item),part,annotation,complete([item])]);
});

test('retained annotation bytes and part counts are bounded across the entire response',()=>{
  const stream=new ResponseStream({model:'test',maxReplayBytes:100});
  for(let index=0;index<2;index++){
    const item=textItem('',`msg_${index}`);stream.accept(added(item,index));
    const annotation=scoped('response.output_text.annotation.added',index,item.id,{content_index:0,annotation_index:0,annotation:{title:'x'.repeat(50)}});
    if(index===0)stream.accept(annotation);else assert.throws(()=>stream.accept(annotation),{code:'PROTOCOL_ERROR'});
  }
  const parts=new ResponseStream({model:'test'});
  parts.accept(added(simple));parts.accept(added(textItem('','msg_2'),1));
  for(let index=0;index<4096;index++)parts.accept(scoped('response.content_part.added',0,simple.id,{content_index:index,part:{type:'output_text',text:''}}));
  assert.throws(()=>parts.accept(scoped('response.content_part.added',1,'msg_2',{content_index:0,part:{type:'output_text',text:''}})),{code:'PROTOCOL_ERROR'});
});

test('lifecycle identity and declared status must agree with terminal completion',async()=>{
  await fail([{type:'response.created',response:{id:'one',status:'in_progress'}},complete([simple],{id:'two'})]);
  await fail([{type:'response.queued',response:{status:'completed'}}]);
});

test('completed streams reject any additional events in the state machine',()=>{
  const stream=new ResponseStream({model:'test'});stream.accept(complete([simple]));
  for(const type of ['keepalive','response.completed','response.output_text.delta']) assert.throws(()=>stream.accept({type}),{code:'PROTOCOL_ERROR'});
});

test('SSE comments, default message envelopes and matching event envelopes share the same stream semantics',async()=>{
  for(const split of [0,1]) for(const envelope of ['named','message','unnamed']){
    const text=': keepalive\n\n'+(envelope==='named'?encodeEvents(flow):flow.map(event=>(envelope==='message'?'event: message\n':'')+'data: '+JSON.stringify(event)+'\n\n').join(''));
    const adapter=makeAdapter([],{fetchImpl:async()=>response([],{text,split})}).adapter;
    const chunks=await collect(adapter.stream(options({tools:[tool]})));
    assert.deepEqual(chunks.at(-1).replayState.blocks.map(block=>block.item),[reason,message,call]);
  }
});
