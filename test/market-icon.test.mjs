import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {validateIcon,MARKET_ICON} from '../scripts/market-icon.mjs';
import {marketArtifacts} from '../scripts/build-markets.mjs';

test('Harness can resolve the package manifest and its declared icon within the host size limit',async()=>{
  const require=createRequire(import.meta.url);
  const manifestFile=require.resolve('dsh-codex-official-adapter/package.json');
  const pkg=JSON.parse(await readFile(manifestFile,'utf8'));
  const iconFile=require.resolve('dsh-codex-official-adapter/icon');
  assert.equal(iconFile,path.resolve(path.dirname(manifestFile),pkg.icon));
  const bytes=await readFile(iconFile);
  assert.ok(bytes.length<=256*1024,'Harness accepts at most 256 KiB');
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(bytes.readUInt32BE(16),256);assert.equal(bytes.readUInt32BE(20),256);
});

test('market handoff reuses the actual packaged PNG through a public immutable image URL',async()=>{
  const result=await validateIcon();
  assert.ok(result.width>0);assert.equal(result.width,result.height);
  const pkg=JSON.parse(await readFile('package.json','utf8'));
  const files=marketArtifacts(pkg);const manual=JSON.parse(files['manual-submission.json']);
  assert.equal(manual.icon,MARKET_ICON.url);assert.deepEqual(manual.iconAlt,MARKET_ICON.alt);
  assert.equal(JSON.parse(files[`1024/catalog/plugins/diwer--dsh-codex-adapter.json`]).icon,undefined);
  assert.equal(JSON.parse(files[`ydhrdh/registry/plugins/${pkg.name}/plugin.json`]).icon,undefined);
});
