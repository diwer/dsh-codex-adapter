import test from 'node:test';
import assert from 'node:assert/strict';
import {Context} from '@deepseek-ai/cordis';
import {LlmRuntime, LlmAdapter, LlmError, BlockAssembler} from '@deepseek-ai/dsh-llm';
import {ChatGPTPlanAdapter, Config, apply} from '../src/plugin.mjs';
import * as plugin from '../src/plugin.mjs';
import {PROVIDER} from '../src/adapter.mjs';
import {options, complete, textItem, toolItem, response, collect} from '../test/helpers.mjs';

const catalog={models:[{slug:'test-model',display_name:'Test model',visibility:'list'}]};
const transport=async url=>url.endsWith('/models')?Response.json(catalog):response([complete([textItem()])]);
const session={async accessToken(){return 'FAKE_ACCESS_TOKEN';}};

test('real Cordis plugin disposal aborts the adapter and withdraws its route',async()=>{
  const ctx=new Context();const runtime=ctx.plugin(LlmRuntime);
  await runtime.await();
  let captured;
  const register=ctx.llm.registerAdapter;
  ctx.llm.registerAdapter=function(providers,adapter){captured=adapter;return register.call(this,providers,adapter);};
  const fiber=ctx.plugin(plugin,{credentialDirectory:'/private/tmp/dsh-unused-disposal-test',accountId:'a'.repeat(43)});
  try {
    await fiber.await();
    assert.ok(captured instanceof LlmAdapter);
    assert.equal(captured.lifetime.signal.aborted,false);
    await fiber.dispose();
    assert.equal(captured.lifetime.signal.aborted,true);
    const chunks=await collect(ctx.llm.stream(options()));
    assert.equal(chunks.at(-1).reason.kind,'error');
    assert.equal(chunks.at(-1).reason.failure.code,'NO_ADAPTER');
  } finally {await fiber.dispose();await runtime.dispose();}
});

test('installed DSH adapter and BlockAssembler accept real exported chunks',async()=>{
  const adapter=new ChatGPTPlanAdapter({session,fetchImpl:transport});
  assert.ok(adapter instanceof LlmAdapter);
  const assembler=new BlockAssembler();
  for await (const chunk of adapter.stream(options())) assembler.push(chunk);
  assert.deepEqual(assembler.blocks(),[{type:'text',text:'Hello'}]);
  assert.equal(assembler.finish.kind,'stop');
  assert.equal(assembler.replayState.blocks[0].item.phase,'final_answer');
});
test('installed DSH LlmError receives typed transport failures',async()=>{
  const adapter=new ChatGPTPlanAdapter({session,fetchImpl:async()=>new Response('{}',{status:403})});
  await assert.rejects(()=>collect(adapter.stream(options())),error=>error instanceof LlmError && error.code==='PERMISSION_DENIED' && error.failure.status===403);
});
test('installed schema validates plugin config and registration owns a dedicated route',()=>{
  const accountId='a'.repeat(43);
  const config=Config({credentialDirectory:'/tmp/dsh-unused-runtime-test',accountId});
  assert.equal(config.requestTimeoutMs,300000);
  let captured;let dispose;
  apply({llm:{registerAdapter(providers,adapter){captured={providers,adapter};}},effect(factory){dispose=factory();}},config);
  assert.deepEqual(captured.providers,[PROVIDER]);assert.ok(captured.adapter instanceof LlmAdapter);
  dispose();assert.equal(captured.adapter.lifetime.signal.aborted,true);
});
test('real DSH runtime routes a text request and normalizes completion',async()=>{
  const ctx=new Context();
  const runtime=ctx.plugin(LlmRuntime);
  const adapter=new ChatGPTPlanAdapter({session,fetchImpl:transport});
  try {
    await runtime.await();
    ctx.llm.registerAdapter([PROVIDER],adapter);
    const chunks=await collect(ctx.llm.stream(options()));
    assert.equal(chunks.at(-1).reason.kind,'stop');
    assert.equal(chunks.find(x=>x.type==='block-end').block.text,'Hello');
  } finally {adapter.dispose();await runtime.dispose();}
});
test('real DSH runtime handles two model turns with one tool result and replay',async()=>{
  const ctx=new Context();const runtime=ctx.plugin(LlmRuntime);
  let turn=0;const bodies=[];
  const adapter=new ChatGPTPlanAdapter({session,fetchImpl:async(url,init)=>{
    if(url.endsWith('/models'))return Response.json(catalog);
    bodies.push(JSON.parse(init.body));
    return response([complete(turn++===0?[toolItem()]:[textItem('File checked')])]);
  }});
  try {
    await runtime.await();ctx.llm.registerAdapter([PROVIDER],adapter);
    const tools=[{name:'read_file',description:'Read file',parameters:{type:'object',properties:{path:{type:'string'}}}}];
    const first=new BlockAssembler();for await(const chunk of ctx.llm.stream(options({tools})))first.push(chunk);
    assert.equal(first.finish.kind,'tool-calls');
    const assistant=first.message({provider:PROVIDER,model:'test-model',replayState:first.replayState});
    const second=await collect(ctx.llm.stream(options({tools,messages:[...options().messages,assistant,{id:'tool-result-1',role:'tool',toolCallId:'call_1',source:{kind:'tool',callId:'call_1'},content:[{type:'text',text:'File contents'}]}]})));
    assert.equal(second.at(-1).reason.kind,'stop');
    assert.equal(bodies[1].input[1].type,'function_call');assert.equal(bodies[1].input[1].call_id,'call_1');assert.equal(bodies[1].input[2].type,'function_call_output');
  } finally {adapter.dispose();await runtime.dispose();}
});
