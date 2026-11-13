import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Context} from '@deepseek-ai/cordis';
import {LlmRuntime} from '@deepseek-ai/dsh-llm';
import * as desktop from '../src/desktop-plugin.mjs';

const host=createRequire(path.join(process.env.DSH_DESKTOP_RESOURCES??'/Applications/DeepSeek Harness.app/Contents/Resources','app.asar/dsh/package.json'));
const {satisfies}=host('semver');
const {HostConnectionService}=await import(pathToFileURL(host.resolve('@deepseek-ai/dsh-client-connection')));

test('installed desktop satisfies package peers and supplies every declared client dependency',async()=>{
  const pkg=JSON.parse(await fs.readFile(new URL('../package.json',import.meta.url),'utf8'));
  for(const [name,range] of Object.entries(pkg.peerDependencies)){
    const installed=host(name+'/package.json');
    assert.ok(satisfies(installed.version,range,{includePrerelease:true}),`${name} ${installed.version} must satisfy ${range}`);
  }
  for(const name of pkg.dsh.client.inject){
    const installed=host(name+'/package.json');
    assert.equal(installed.dsh?.client?.platform,'web',`${name} must provide a browser module`);
    host.resolve(name+'/client');
  }
});

test('desktop settings routes mount in the real host Connection, retain its admission fence and unload',async()=>{
  const directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'dsh-connection-'));
  const ctx=new Context();
  const llm=ctx.plugin(LlmRuntime);
  // Synthetic unauthenticated browser admission; no existing browser or account data.
  const connection=ctx.plugin(owner=>{new HostConnectionService(owner,[],{isAuthenticated:()=>false,authenticateApi:()=>undefined});});
  let plugin,peer;
  try{
    await Promise.all([llm.await(),connection.await()]);
    plugin=ctx.plugin(desktop,{credentialDirectory:directory});await plugin.await();
    const incoming={url:'/api/dsh-chatgpt-plan/status',headers:{host:'127.0.0.1:3080'},socket:{}};
    assert.equal(ctx.connection.requestRejection(incoming),401);
    assert.equal(ctx.connection.requestRejection({...incoming,headers:{host:'example.test',origin:'https://example.test'}}),403);
    peer=ctx.connection.createPeer({principal:{kind:'owner'}});
    const handler=ctx.connection.createSharedFetchHandler('/api');
    const request=action=>new Request('http://127.0.0.1:3080/api/dsh-chatgpt-plan/'+action);
    const status=await handler.fetch(request('status'),peer);
    assert.equal(status.status,200);assert.equal((await status.json()).value.phase,'not-signed-in');
    const icon=await handler.fetch(request('icon'),peer);
    assert.equal(icon.status,200);assert.equal(icon.headers.get('content-type'),'image/png');
    const wrongMethod=await handler.fetch(new Request(request('status'),{method:'POST'}),peer);
    assert.equal(wrongMethod.status,404);
    await plugin.dispose();
    assert.equal((await handler.fetch(request('status'),peer)).status,404);
  }finally{await plugin?.dispose();await peer?.dispose();await connection.dispose();await llm.dispose();await fs.rm(directory,{recursive:true,force:true});}
});
