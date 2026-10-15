import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {verifyDigest,parseArgs,obtainArchive,installRelease} from '../scripts/install-release.mjs';

test('release verifier rejects modified bytes',()=>{
  assert.equal(verifyDigest(Buffer.from('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.throws(()=>verifyDigest(Buffer.from('modified')),/SHA-256/);
});
test('installer rejects unknown options and preserves paths with spaces',()=>{
  const options=parseArgs(['--dsh','/Applications/Example Harness/bin/dsh','--profile','acceptance']);
  assert.equal(options.dsh,'/Applications/Example Harness/bin/dsh');
  assert.equal(options.profile,'acceptance');
  assert.throws(()=>parseArgs(['--force']),/参数错误/);
  assert.throws(()=>parseArgs(['--profile','../desktop']),/Profile/);
});
test('corrupt archive never invokes the host installer',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'adapter-release-'));
  try {
    const archive=path.join(directory,'package with spaces.tgz');
    await writeFile(archive,'not a release');
    let calls=0;
    await assert.rejects(installRelease({...parseArgs([]),archive},{executor:async()=>{calls++;return 0;}}),/SHA-256/);
    assert.equal(calls,0);
    assert.equal(await readFile(archive,'utf8'),'not a release');
  } finally {await rm(directory,{recursive:true,force:true});}
});
test('failed and invalid downloads cannot populate the cache',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'adapter-download-'));
  try {
    const options={...parseArgs([]),cacheDir:directory};
    await assert.rejects(obtainArchive(options,{fetchImpl:async()=>new Response('missing',{status:404})}),/HTTP 404/);
    await assert.rejects(obtainArchive(options,{fetchImpl:async()=>new Response('wrong archive')}),/SHA-256/);
  } finally {await rm(directory,{recursive:true,force:true});}
});
