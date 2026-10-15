import test from 'node:test';
import assert from 'node:assert/strict';
import {DesktopAccountController} from '../src/desktop-controller.mjs';
import {MemoryCredentialStore,AuthError} from '../src/auth/index.mjs';
const A='a'.repeat(43),B='b'.repeat(43);
function fixture(accounts=[]){
  const store=new MemoryCredentialStore();let finish,reject,loginCalls=0,changes=0;
  const auth={accounts:async()=>accounts,session:id=>({accessToken:async()=>{assert.equal(id,A);return 'FAKE_ACCESS_TOKEN';},logout:async()=>{accounts.find(x=>x.accountId===id).signedIn=false;return {remoteRevoked:true};}}),login:async({signal,onAuthorize})=>{
    loginCalls++;await onAuthorize('https://auth.openai.com/api/accounts/authorize?state=fake'+loginCalls,{expiresAt:Date.now()+600000});
    return new Promise((resolve,fail)=>{finish=account=>{accounts.push(account);resolve(account);};reject=fail;signal.addEventListener('abort',()=>fail(new AuthError('cancelled')),{once:true});if(signal.aborted)fail(new AuthError('cancelled'));});
  }};
  const controller=new DesktopAccountController({auth,store,onChange:()=>changes++});
  return {controller,store,finish:account=>finish(account),reject:error=>reject(error),loginCalls:()=>loginCalls,changes:()=>changes};
}
test('desktop unauthenticated account selection fails explicitly and never falls back',async()=>{
  const f=fixture();assert.equal((await f.controller.status()).phase,'not-signed-in');await assert.rejects(()=>f.controller.accessToken(),error=>error.code==='not_signed_in');
});
test('desktop authorization is single-flight and selects the returned account',async()=>{
  const f=fixture();const urls=await Promise.all([f.controller.beginLogin(),f.controller.beginLogin()]);assert.equal(f.loginCalls(),1);assert.equal(urls[0].url,urls[1].url);assert.equal((await f.controller.status()).phase,'signing-in');
  const task=f.controller.pending.task;f.finish({accountId:A,email:'fake@example.invalid',signedIn:true,planUsageEnabled:true});await task;
  assert.equal((await f.controller.status()).selectedAccountId,A);assert.equal(await f.controller.accessToken(),'FAKE_ACCESS_TOKEN');assert.equal(f.controller.pending,null);
});
test('desktop disposal cancels pending OAuth and does not select an account',async()=>{
  const f=fixture();await f.controller.beginLogin();await f.controller.dispose();assert.equal((await f.controller.status()).phase,'not-signed-in');await assert.rejects(()=>f.controller.beginLogin(),error=>error.code==='cancelled');
});
test('desktop OAuth failures report a safe error and permit a new attempt',async()=>{
  const f=fixture();await f.controller.beginLogin();const task=f.controller.pending.task;f.reject(new Error('FAKE_SECRET_MUST_NOT_LEAK'));await task;
  assert.doesNotMatch(JSON.stringify(await f.controller.status()),/FAKE_SECRET/);assert.equal((await f.controller.status()).phase,'attention');await f.controller.beginLogin();assert.equal(f.loginCalls(),2);await f.controller.cancelLogin();
});

test('desktop status retains safe failure stage and HTTP status for troubleshooting',async()=>{
  const f=fixture();await f.controller.beginLogin();const task=f.controller.pending.task;
  f.reject(new AuthError('http_error',{status:403,stage:'discovery'}));await task;
  const status=await f.controller.status();assert.equal(status.error.stage,'discovery');assert.equal(status.error.status,403);assert.match(status.error.message,/HTTP 403/);assert.match(status.error.message,/proxy/);
});
test('desktop multiple accounts require an explicit selection and reject unknown IDs',async()=>{
  const f=fixture([{accountId:A,signedIn:true,planUsageEnabled:true},{accountId:B,signedIn:true,planUsageEnabled:true}]);await assert.rejects(()=>f.controller.selectedAccount(),error=>error.code==='account_mismatch');
  await f.controller.selectAccount(A);assert.equal(await f.controller.selectedAccount(),A);await assert.rejects(()=>f.controller.selectAccount('c'.repeat(43)),error=>error.code==='invalid_options');
});
test('desktop logout cannot remain ready with a stale selected account',async()=>{
  const f=fixture([{accountId:A,signedIn:true,planUsageEnabled:true}]);await f.controller.selectAccount(A);await f.controller.logout(A);assert.equal((await f.controller.status()).phase,'not-signed-in');
});
test('desktop expired authorization clears its link and explains callback closure',async()=>{
  const f=fixture();await f.controller.beginLogin();const running=await f.controller.status();assert.ok(running.expiresAt>Date.now());
  const task=f.controller.pending.task;f.reject(new AuthError('expired_attempt'));await task;
  const expired=await f.controller.status();assert.equal(expired.authorizationUrl,null);assert.equal(expired.expiresAt,null);assert.equal(expired.error.code,'expired_attempt');assert.match(expired.error.message,/回调已关闭/);
  await f.controller.restartLogin();assert.equal(f.loginCalls(),2);assert.equal((await f.controller.status()).phase,'signing-in');await f.controller.cancelLogin();
});
test('desktop explicit restart cancels the old attempt and provides a new URL',async()=>{
  const f=fixture();const first=await f.controller.beginLogin();const old=f.controller.pending;const second=await f.controller.restartLogin();
  assert.equal(old.controller.signal.aborted,true);assert.notEqual(first.url,second.url);assert.equal(f.loginCalls(),2);assert.equal((await f.controller.status()).authorizationUrl,second.url);await f.controller.dispose();
});
