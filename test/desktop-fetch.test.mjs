import test from 'node:test';
import assert from 'node:assert/strict';
import {createDesktopFetch} from '../src/desktop-fetch.mjs';
import {createServer} from 'node:http';

test('desktop TLS uses OS and Node roots with certificate checks and a private dispatcher',async()=>{
  let options,request,closes=0;
  class Agent{constructor(value){options=value;}async close(){closes++;}}
  const transport=createDesktopFetch({getCertificates:type=>type==='default'?['NODE_ROOT','SHARED_ROOT']:['OS_ROOT','SHARED_ROOT'],AgentClass:Agent,fetchImpl:async(url,init)=>{request={url,init};return Response.json({});}});
  assert.deepEqual(options.connect.ca,['NODE_ROOT','SHARED_ROOT','OS_ROOT']);assert.equal(options.connect.rejectUnauthorized,true);
  assert.deepEqual(options.requestTls,options.connect);assert.deepEqual(options.proxyTls,options.connect);
  await transport.fetch('https://api.openai.com/v1/models',{redirect:'follow',credentials:'include',dispatcher:'UNTRUSTED_DISPATCHER'});
  assert.ok(request.init.dispatcher instanceof Agent);assert.equal(request.init.redirect,'error');assert.equal(request.init.credentials,'omit');
  await transport.close();await transport.close();assert.equal(closes,1);await assert.rejects(()=>transport.fetch('https://api.openai.com/v1/models'),/closed/);
});

test('desktop explicit proxy overrides environment bypass and keeps TLS validation',async()=>{
  let options;
  class Agent{constructor(value){options=value;}async close(){}}
  const transport=createDesktopFetch({proxyUrl:'http://127.0.0.1:7890',getCertificates:()=>[],AgentClass:Agent});
  assert.equal(options.httpProxy,'http://127.0.0.1:7890');assert.equal(options.httpsProxy,options.httpProxy);assert.equal(options.noProxy,'');
  assert.equal(options.requestTls.rejectUnauthorized,true);assert.equal(options.proxyTls.rejectUnauthorized,true);
  await transport.close();
  for(const proxyUrl of ['socks5://127.0.0.1:1080','https://proxy.invalid/path','http://proxy.invalid?secret=1','http://proxy.invalid/#fragment',42])assert.throws(()=>createDesktopFetch({proxyUrl}),error=>error.code==='invalid_options');
});

test('desktop HTTPS requests actually reach an environment proxy',async t=>{
  const proxy=createServer();const targets=[];
  proxy.on('connect',(request,socket)=>{targets.push(request.url);socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');});
  await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
  const keys=['https_proxy','HTTPS_PROXY','no_proxy','NO_PROXY'];
  const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  process.env.https_proxy=`http://127.0.0.1:${proxy.address().port}`;process.env.no_proxy='';
  const transport=createDesktopFetch();
  t.after(async()=>{await transport.close();await new Promise(resolve=>proxy.close(resolve));for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}});
  await assert.rejects(()=>transport.fetch('https://auth.openai.com/.well-known/openid-configuration',{signal:AbortSignal.timeout(3000)}));
  assert.deepEqual(targets,['auth.openai.com:443']);
});
test('desktop TLS never sends a request to an unofficial or non-HTTPS destination',async()=>{
  let requests=0;
  class Agent{async close(){}}
  const transport=createDesktopFetch({getCertificates:()=>[],AgentClass:Agent,fetchImpl:async()=>{requests++;return Response.json({});}});
  for(const url of ['http://api.openai.com/v1/models','https://example.invalid/v1/models','https://user:password@api.openai.com/v1/models','https://api.openai.com:444/v1/models'])await assert.rejects(()=>transport.fetch(url),/official HTTPS/);
  assert.equal(requests,0);await transport.close();
});
