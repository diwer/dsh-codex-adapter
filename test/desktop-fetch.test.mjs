import test from 'node:test';
import assert from 'node:assert/strict';
import {createDesktopFetch} from '../src/desktop-fetch.mjs';

test('desktop TLS uses OS and Node roots with certificate checks and a private dispatcher',async()=>{
  let options,request,closes=0;
  class Agent{constructor(value){options=value;}async close(){closes++;}}
  const transport=createDesktopFetch({getCertificates:type=>type==='default'?['NODE_ROOT','SHARED_ROOT']:['OS_ROOT','SHARED_ROOT'],AgentClass:Agent,fetchImpl:async(url,init)=>{request={url,init};return Response.json({});}});
  assert.deepEqual(options.connect.ca,['NODE_ROOT','SHARED_ROOT','OS_ROOT']);assert.equal(options.connect.rejectUnauthorized,true);
  await transport.fetch('https://api.openai.com/v1/models',{redirect:'follow',credentials:'include',dispatcher:'UNTRUSTED_DISPATCHER'});
  assert.ok(request.init.dispatcher instanceof Agent);assert.equal(request.init.redirect,'error');assert.equal(request.init.credentials,'omit');
  await transport.close();await transport.close();assert.equal(closes,1);await assert.rejects(()=>transport.fetch('https://api.openai.com/v1/models'),/closed/);
});
test('desktop TLS never sends a request to an unofficial or non-HTTPS destination',async()=>{
  let requests=0;
  class Agent{async close(){}}
  const transport=createDesktopFetch({getCertificates:()=>[],AgentClass:Agent,fetchImpl:async()=>{requests++;return Response.json({});}});
  for(const url of ['http://api.openai.com/v1/models','https://example.invalid/v1/models','https://user:password@api.openai.com/v1/models','https://api.openai.com:444/v1/models'])await assert.rejects(()=>transport.fetch(url),/official HTTPS/);
  assert.equal(requests,0);await transport.close();
});
