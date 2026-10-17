import test from 'node:test';
import assert from 'node:assert/strict';
import {readSse,parseEvent} from '../src/sse.mjs';
import {response,collect} from './helpers.mjs';

test('SSE parses byte-split UTF-8, CRLF, comments and multiline data',async()=>{
  const wire=': ping\r\nevent: greeting\r\ndata: {"type":"greeting",\r\ndata: "text":"你好 🐱"}\r\n\r\n';
  const frames=await collect(readSse(response([],{text:wire,split:1}).body));
  assert.deepEqual(parseEvent(frames[0]),{type:'greeting',text:'你好 🐱'});
});
test('SSE accepts CR line endings',async()=>{
  const frames=await collect(readSse(response([],{text:'data: {"type":"ping"}\r\r',split:1}).body));
  assert.equal(parseEvent(frames[0]).type,'ping');
});
test('SSE rejects truncated events and malformed JSON',async()=>{
  await assert.rejects(()=>collect(readSse(response([],{text:'data: {}'}).body)),{code:'PROTOCOL_ERROR'});
  assert.throws(()=>parseEvent({data:'{secret bad json',event:''}),{code:'PROTOCOL_ERROR'});
});
test('SSE rejects event/data type mismatch',()=>assert.throws(()=>parseEvent({data:'{"type":"a"}',event:'b'}),{code:'PROTOCOL_ERROR'}));
test('SSE sentinel accepts only unnamed or message envelopes and cannot mask an event type',()=>{
  for(const event of ['',undefined,'message']) assert.deepEqual(parseEvent({event,data:'[DONE]'}),{type:'transport.done'});
  for(const event of ['keepalive','response.completed','response.failed']) assert.throws(()=>parseEvent({event,data:'[DONE]'}),{code:'PROTOCOL_ERROR'});
});
test('SSE limits frame size before buffering arbitrary provider input',async()=>{
  await assert.rejects(()=>collect(readSse(response([],{text:'data: '+'a'.repeat(50)}).body,{maxEventBytes:10})),{code:'PROTOCOL_ERROR'});
});
test('cancellation interrupts a pending stream read',async()=>{
  const controller=new AbortController();let cancelled=false;
  const body=new ReadableStream({cancel(){cancelled=true;}});
  const result=collect(readSse(body,{signal:controller.signal}));controller.abort();
  await assert.rejects(()=>result,{code:'ABORTED'});assert.equal(cancelled,true);
});
test('early generator close cancels the underlying stream',async()=>{
  let cancelled=false;const bytes=new TextEncoder().encode('data: {"type":"a"}\n\n');
  const body=new ReadableStream({start(c){c.enqueue(bytes);},cancel(){cancelled=true;}});
  for await(const frame of readSse(body)){assert.equal(parseEvent(frame).type,'a');break;}
  assert.equal(cancelled,true);
});
test('SSE bounds repeated empty data lines including delimiter memory',async()=>{
  await assert.rejects(()=>collect(readSse(response([],{text:'data:\ndata:\ndata:\ndata:\ndata:\n\n'}).body,{maxEventBytes:1})),{code:'PROTOCOL_ERROR'});
});

for (const field of ['event: ', ': ', 'unknown: ', 'data: ']) {
  for (const split of [0, 1]) test(`SSE bounds complete ${field.trim()} lines with chunk size ${split}`,async()=>{
    await assert.rejects(()=>collect(readSse(response([],{text:field+'猫'.repeat(20)+'\n\n',split}).body,{maxEventBytes:32})),{code:'PROTOCOL_ERROR'});
  });
}
for (const ending of ['\n','\r','\r\n']) {
  for (const split of [0, 1]) test(`SSE wire-byte boundary is exact for ${JSON.stringify(ending)} with chunk size ${split}`,async()=>{
    const event=[': ping','event: greeting','unknown: ignored','data: 你好 🐱'].join(ending)+ending;
    const text=event+ending;
    const limit=Buffer.byteLength(event);
    assert.deepEqual(await collect(readSse(response([],{text,split}).body,{maxEventBytes:limit})),[{event:'greeting',data:'你好 🐱'}]);
    await assert.rejects(()=>collect(readSse(response([],{text,split}).body,{maxEventBytes:limit-1})),{code:'PROTOCOL_ERROR'});
  });
}
test('SSE accounts repeated event names and ignored fields within one frame',async()=>{
  for (const line of ['event: a\n',': ping\n','unknown: a\n']) {
    await assert.rejects(()=>collect(readSse(response([],{text:line.repeat(10)+'data: {}\n\n'}).body,{maxEventBytes:32})),{code:'PROTOCOL_ERROR'});
  }
});
test('SSE resets its wire-byte budget between events in one chunk',async()=>{
  const event='event: ping\ndata: {"type":"ping"}\n';
  const frames=await collect(readSse(response([],{text:(event+'\n').repeat(10)}).body,{maxEventBytes:Buffer.byteLength(event)}));
  assert.equal(frames.length,10);
  assert.ok(frames.every(frame=>parseEvent(frame).type==='ping'));
});
test('SSE limit failures cancel the reader and release its lock',async()=>{
  let cancelled=false;
  const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('event: '+'x'.repeat(100)+'\n'));},cancel(){cancelled=true;}});
  await assert.rejects(()=>collect(readSse(body,{maxEventBytes:32})),{code:'PROTOCOL_ERROR'});
  assert.equal(cancelled,true);
  assert.equal(body.locked,false);
});
