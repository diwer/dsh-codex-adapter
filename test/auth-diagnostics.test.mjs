import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createDiagnosticLog,diagnosticRecord} from '../src/auth/diagnostics.mjs';

test('diagnostics write only safe allowlisted metadata with private permissions',async t=>{
  const directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'dsh-diagnostics-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const logger=createDiagnosticLog({directory});
  logger.record({event:'listener_ready',port:12345,flow:'1234567890abcdef',url:'SECRET_CALLBACK',state:'SECRET_STATE'});
  logger.record({event:'login_failed',stage:'token_response',field:'expires_in',code:'invalid_response',accessToken:'SECRET_ACCESS',error:new Error('SECRET_CAUSE')});
  await logger.flush();const text=await fs.readFile(logger.status().path,'utf8');const records=text.trim().split('\n').map(JSON.parse);
  assert.deepEqual(records.map(r=>r.event),['listener_ready','login_failed']);assert.equal(records[0].port,12345);assert.equal(records[1].field,'expires_in');
  assert.doesNotMatch(text,/SECRET|accessToken|error|url/);assert.equal((await fs.stat(logger.status().path)).mode&0o777,0o600);assert.equal(logger.status().writeFailed,false);
  assert.equal(diagnosticRecord({event:'SECRET'}),null);
  assert.deepEqual(Object.keys(diagnosticRecord({event:'login_failed',stage:'SECRET',field:'SECRET',code:'SECRET'})),['time','event','code']);
});

test('diagnostics cannot follow a symlink or write through a hardlinked log',async t=>{
  const directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'dsh-diagnostics-link-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const outside=path.join(directory,'unchanged');await fs.writeFile(outside,'ORIGINAL',{mode:0o600});
  const logger=createDiagnosticLog({directory});const file=logger.status().path;
  await fs.symlink(outside,file);logger.record({event:'login_started'});await logger.flush();assert.equal(logger.status().writeFailed,true);assert.equal(await fs.readFile(outside,'utf8'),'ORIGINAL');
  await fs.unlink(file);await fs.link(outside,file);logger.record({event:'login_started'});await logger.flush();assert.equal(logger.status().writeFailed,true);assert.equal(await fs.readFile(outside,'utf8'),'ORIGINAL');
});

test('diagnostics rotate bounded logs while retaining the latest event',async t=>{
  const directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'dsh-diagnostics-size-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const logger=createDiagnosticLog({directory});await fs.writeFile(logger.status().path,'x'.repeat(524288),{mode:0o600});
  logger.record({event:'runtime_started',version:'0.1.4',proxyMode:'explicit'});await logger.flush();
  assert.equal((await fs.stat(logger.status().path+'.1')).size,524288);assert.equal(JSON.parse(await fs.readFile(logger.status().path,'utf8')).event,'runtime_started');
});
