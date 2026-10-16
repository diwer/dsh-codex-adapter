import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateIcon,MARKET_ICON} from '../scripts/market-icon.mjs';
import {marketArtifacts} from '../scripts/build-markets.mjs';

test('market handoff reuses the actual packaged PNG through a public immutable image URL',async()=>{
  const result=await validateIcon();
  assert.ok(result.width>0);assert.equal(result.width,result.height);
  const pkg=JSON.parse(await readFile('package.json','utf8'));
  const files=marketArtifacts(pkg);const manual=JSON.parse(files['manual-submission.json']);
  assert.equal(manual.icon,MARKET_ICON.url);assert.deepEqual(manual.iconAlt,MARKET_ICON.alt);
  assert.equal(JSON.parse(files[`1024/catalog/plugins/diwer--dsh-codex-adapter.json`]).icon,undefined);
  assert.equal(JSON.parse(files[`ydhrdh/registry/plugins/${pkg.name}/plugin.json`]).icon,undefined);
});
