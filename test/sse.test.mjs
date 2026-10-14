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
