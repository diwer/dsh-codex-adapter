import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from '../src/cli.mjs';
const fakeStore=class {};
test('help is read-only and does not create a store',async()=>{let text='';await run(['--help'],{out:value=>text+=value,Store:class{constructor(){throw new Error('must not create');}}});assert.match(text,/POSIX only/);});
test('CLI reports remote revocation uncertainty',async()=>{const output=[];const code=await run(['logout','--state-dir','/unused','--account','example'],{out:text=>output.push(text),Store:fakeStore,createClient:()=>({session:()=>({logout:async()=>({remoteRevoked:false})})})});assert.equal(code,2);assert.match(output[0],/not confirmed/);});
test('CLI never prints token-bearing account fields after login',async()=>{const output=[];await run(['login','--state-dir','/unused'],{out:text=>output.push(text),Store:fakeStore,createClient:()=>({login:async()=>({accountId:'account',planUsageEnabled:true,accessToken:'SHOULD_NOT_PRINT'})})});assert.equal(output.join('\n').includes('SHOULD_NOT_PRINT'),false);});
test('CLI requires explicit logout account',async()=>{await assert.rejects(()=>run(['logout','--state-dir','/unused'],{Store:fakeStore}),/--account/);});
