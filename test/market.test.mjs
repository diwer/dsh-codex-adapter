import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {realpath} from 'node:fs/promises';
import path from 'node:path';
import {repositoryIdentity,localPath,awesomeEntry,publicFiles,PUBLIC_ROOTS} from '../scripts/market-common.mjs';

test('market identity only accepts a GitHub repository root without credentials or query',()=>{
  assert.deepEqual(repositoryIdentity('https://github.com/example/dsh-adapter.git'),{owner:'example',name:'dsh-adapter',url:'https://github.com/example/dsh-adapter'});
  for(const value of ['https://github.com/example/repo/tree/main','https://example.com/a/b','https://user:password@github.com/a/b','https://github.com/a/b?token=value','https://github.com/a/..']) assert.throws(()=>repositoryIdentity(value));
});
test('publish paths reject traversal and absolute paths',()=>{
  assert.equal(localPath('./src/adapter.mjs'),'src/adapter.mjs');
  for(const value of ['../auth','src/../auth','/tmp/auth','src\\auth','','src//auth']) assert.throws(()=>localPath(value));
});
test('community YAML escapes descriptions and keeps category separate from shop schema',()=>{
  const text=awesomeEntry({dsh:{catalog:{summary:{en:'GPT: tools.\nline',zh:'模型。'}}}},'https://github.com/example/adapter');
  assert.match(text,/category: model\n/);assert.ok(text.includes('"GPT: tools.\\nline"'));
  assert.equal(text.split('\n').length,7);
});
test('public snapshots reject symlinks before copying outside the release boundary',async()=>{
  const root=await mkdtemp(path.join(await realpath(tmpdir()),'market-boundary-'));
  try {
    for(const item of PUBLIC_ROOTS) {await mkdir(path.dirname(path.join(root,item)),{recursive:true});await writeFile(path.join(root,item),'fixture');}
    await rm(path.join(root,'src'));await symlink(path.join(root,'package.json'),path.join(root,'src'));
    await assert.rejects(publicFiles(root),/符号链接/);
  } finally {await rm(root,{recursive:true,force:true});}
});
