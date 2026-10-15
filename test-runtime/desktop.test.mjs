import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Context,Service} from '@deepseek-ai/cordis';
import {LlmRuntime} from '@deepseek-ai/dsh-llm';
import * as desktop from '../src/desktop-plugin.mjs';
import {PROVIDER} from '../src/adapter.mjs';

class Connection extends Service {
  routes=new Map();
  constructor(ctx){super(ctx,'connection');}
  registerFetchRoute(owner,route){owner.effect(()=>{this.routes.set(route.path,route);return()=>this.routes.delete(route.path);});}
}
test('desktop bundle mounts without an account, owns authenticated routes, and cancels login on unload',async()=>{
  const directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'dsh-desktop-'));
  const ctx=new Context();const llm=ctx.plugin(LlmRuntime),connection=ctx.plugin(Connection);await Promise.all([llm.await(),connection.await()]);
  const fiber=ctx.plugin(desktop,{credentialDirectory:directory});
  try{
    await fiber.await();assert.equal(ctx.connection.routes.size,8);assert.deepEqual(await ctx.llm.listModels(PROVIDER),[]);
    const route=action=>ctx.connection.routes.get('/api/dsh-chatgpt-plan/'+action);
    const call=(action,body)=>route(action).fetch(new Request('http://127.0.0.1/api/dsh-chatgpt-plan/'+action,{method:body===undefined?'GET':'POST',...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})}));
    assert.equal((await(await call('status')).json()).value.phase,'not-signed-in');
    const malformed=await route('login').fetch(new Request('http://127.0.0.1/api/dsh-chatgpt-plan/login',{method:'POST',body:'{}'}));assert.equal(malformed.status,415);
    const invalid=await call('login',{unexpected:true});assert.equal(invalid.status,400);
    const authorization=(await(await call('login',{})).json()).value;const parsed=new URL(authorization.url);assert.equal(parsed.origin,'https://auth.openai.com');assert.equal(parsed.searchParams.get('client_id'),'dynamic_agent_client');
    const status=(await(await call('status')).json()).value;assert.equal(status.phase,'signing-in');assert.ok(status.expiresAt-Date.now()>1790000 && status.expiresAt-Date.now()<=1800000);
    const callback=parsed.searchParams.get('redirect_uri');
    await fiber.dispose();assert.equal(ctx.connection.routes.size,0);await assert.rejects(()=>fetch(callback),TypeError);
  }finally{await fiber.dispose();await connection.dispose();await llm.dispose();await fs.rm(directory,{recursive:true,force:true});}
});
