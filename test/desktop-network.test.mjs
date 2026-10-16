import test from 'node:test';
import assert from 'node:assert/strict';
import {MemoryCredentialStore} from '../src/auth/store.mjs';
import {createDesktopNetwork} from '../src/desktop-network.mjs';

function transports(fetchImpl=async()=>Response.json({})){
  const entries=[];
  const createTransport=config=>{
    const entry={config,requests:[],closes:0};entries.push(entry);
    return {fetch:async(url,init)=>{entry.requests.push({url,init});return fetchImpl(url,init,entry);},close:async()=>{entry.closes++;}};
  };
  return {entries,createTransport};
}

test('proxy settings persist privately across launches and override only this plugin configuration',async()=>{
  const store=new MemoryCredentialStore(),f=transports();let changes=0;
  const network=await createDesktopNetwork({store,proxyUrl:'http://old.invalid:7890',createTransport:f.createTransport,onChange:()=>changes++});
  assert.equal(network.status().mode,'proxy');
  await network.save({mode:'proxy',proxyUrl:'http://127.0.0.1:8080'});
  await network.fetch('https://api.openai.com/v1/models');
  await network.fetch('https://auth.openai.com/.well-known/openid-configuration');
  assert.deepEqual(f.entries[1].requests.map(r=>new URL(r.url).hostname),['api.openai.com','auth.openai.com']);
  assert.equal(changes,1);await network.close();
  const restarted=await createDesktopNetwork({store,proxyUrl:'http://old.invalid:7890',createTransport:f.createTransport});
  assert.deepEqual(restarted.status(),{mode:'proxy',proxyUrl:'http://127.0.0.1:8080'});await restarted.close();
});

test('changing a proxy reroutes new requests while allowing the old request to complete',async()=>{
  let release;
  const pending=new Promise(resolve=>{release=resolve;});
  const f=transports(async(url,init,entry)=>entry===f.entries[0]?pending:Response.json({fresh:true}));
  const network=await createDesktopNetwork({store:new MemoryCredentialStore(),createTransport:f.createTransport});
  const old=network.fetch('https://api.openai.com/v1/responses');
  await network.save({mode:'direct',proxyUrl:''});
  assert.equal((await network.fetch('https://api.openai.com/v1/models')).status,200);
  assert.deepEqual(f.entries[1].config,{proxyMode:'direct',proxyUrl:''});
  release(Response.json({old:true}));assert.deepEqual(await(await old).json(),{old:true});await network.close();
});

test('failed persistence leaves the working proxy in place and closes the unused replacement',async()=>{
  const memory=new MemoryCredentialStore(),f=transports();let writes=0;
  const store={transaction:operation=>++writes===2?Promise.reject(Error('DISK_FAILURE')):memory.transaction(operation)};
  const network=await createDesktopNetwork({store,createTransport:f.createTransport});
  await assert.rejects(network.save({mode:'proxy',proxyUrl:'http://127.0.0.1:8080'}),/DISK_FAILURE/);
  await network.fetch('https://api.openai.com/v1/models');assert.equal(f.entries[0].requests.length,1);
  assert.equal(network.status().mode,'environment');await network.close();assert.equal(f.entries[1].closes,1);
});

test('connectivity tests use the unsaved draft, send no credentials and do not change the active proxy',async()=>{
  const store=new MemoryCredentialStore(),f=transports(async url=>new Response(null,{status:new URL(url).hostname==='api.openai.com'?401:200}));let changes=0;
  const network=await createDesktopNetwork({store,createTransport:f.createTransport,onChange:()=>changes++});
  const result=await network.test({mode:'proxy',proxyUrl:'http://127.0.0.1:8080'});
  assert.equal(result.ok,true);assert.deepEqual(result.checks.map(c=>c.status),[200,401]);
  assert.equal(network.status().mode,'environment');assert.equal(await store.transaction(state=>state.network),undefined);assert.equal(changes,0);
  assert.equal(f.entries[1].requests.length,2);for(const request of f.entries[1].requests){assert.equal(request.init.headers,undefined);assert.equal(request.init.method,'GET');}
  assert.equal(f.entries[1].closes,1);await network.close();
});

test('connectivity failures retain safe status and guidance without disclosing proxy passwords or native causes',async()=>{
  const f=transports(async url=>{
    if(new URL(url).hostname==='api.openai.com')return new Response('SECRET_PROVIDER_BODY',{status:403});
    throw new TypeError('SECRET_PROXY_PASSWORD',{cause:{code:'ECONNREFUSED'}});
  });
  const network=await createDesktopNetwork({store:new MemoryCredentialStore(),createTransport:f.createTransport});
  const result=await network.test({mode:'proxy',proxyUrl:'http://user:SECRET_PROXY_PASSWORD@127.0.0.1:8080'});
  assert.equal(result.ok,false);assert.match(result.checks[0].message,/连接被拒绝/);assert.equal(result.checks[1].status,403);
  assert.doesNotMatch(JSON.stringify(result),/SECRET|user:|cause|stack/);await network.close();
});

test('invalid proxy modes and non-HTTP proxy URLs never change settings or contact a service',async()=>{
  const f=transports(),network=await createDesktopNetwork({store:new MemoryCredentialStore(),createTransport:f.createTransport});
  for(const value of [{mode:'proxy',proxyUrl:''},{mode:'proxy',proxyUrl:'socks5://127.0.0.1:1080'},{mode:'proxy',proxyUrl:'http://proxy.invalid/path?SECRET=1'},{mode:'direct',proxyUrl:'http://proxy.invalid'},{mode:'unknown',proxyUrl:''}]){
    await assert.rejects(network.save(value),error=>{assert.doesNotMatch(error.message,/SECRET|socks5/);return error.code==='invalid_proxy'||error.code==='invalid_settings';});
  }
  assert.equal(f.entries.length,1);await network.close();
});

test('disposal aborts connectivity probes, drains their transports and rejects later changes',async()=>{
  const f=transports(async(url,{signal})=>new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(signal.reason),{once:true});}));
  const network=await createDesktopNetwork({store:new MemoryCredentialStore(),createTransport:f.createTransport});
  const checking=network.test({mode:'direct',proxyUrl:''});const rejected=assert.rejects(checking,error=>error.code==='closed');
  await network.close();await rejected;assert.equal(f.entries[1].closes,1);
  await assert.rejects(network.fetch('https://api.openai.com/v1/models'),error=>error.code==='closed');
  await assert.rejects(network.save({mode:'direct',proxyUrl:''}),error=>error.code==='closed');
});
