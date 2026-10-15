import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import {readmeSource,catalogMarkets,auditMarketSources} from '../scripts/audit-markets.mjs';
import {marketArtifacts,pinnedEntry} from '../scripts/build-markets.mjs';
import {repositoryIdentity} from '../scripts/market-common.mjs';
import {validateSchemas} from '../scripts/validate-market-schemas.mjs';
import {renderMarketReport} from '../scripts/report-markets.mjs';
const read=async file=>JSON.parse(await readFile(file,'utf8'));

test('market source audit handles root and subpackage paths without arbitrary destinations',()=>{
  assert.equal(readmeSource('https://github.com/example/repo'),'https://raw.githubusercontent.com/example/repo/HEAD/README.md');
  assert.equal(readmeSource('https://github.com/example/repo/tree/main/packages/store'),'https://raw.githubusercontent.com/example/repo/main/packages/store/README.md');
  for(const value of ['https://example.com/a/b','https://user:pass@github.com/a/b','https://github.com/a/b?token=secret','https://github.com/a/b/issues','https://github.com/a/b#branch'])assert.throws(()=>readmeSource(value));
  assert.throws(()=>catalogMarkets({count:2,plugins:[]}),/条数/);
});
test('unavailable and oversized sources stay failed; one source failure does not hide other results',async()=>{
  const entries=await auditMarketSources([{name:'ok',url:'https://github.com/a/ok'},{name:'gone',url:'https://github.com/a/gone'},{name:'big',url:'https://github.com/a/big'}],{fetchImpl:async url=>url.includes('/gone/')?new Response('',{status:404}):new Response(url.includes('/big/')?'x'.repeat(512*1024+1):'GitHub topic:dsh-plugin')});
  assert.equal(entries.filter(x=>x.read).length,1);
  assert.match(entries.find(x=>x.name==='gone').error,/404/);
  assert.match(entries.find(x=>x.name==='big').error,/512 KiB/);
});
test('all discovery entries have one accountable assessment and generated report stays in sync',async()=>{
  const coverage=await read('market/coverage.json');const urls=coverage.entries.map(x=>x.url);
  assert.equal(new Set(urls).size,urls.length);
  assert.equal(coverage.entries.filter(x=>x.origin==='awesome-market').length,coverage.discovery.marketCount);
  for(const row of coverage.entries){assert.ok(['adapted','not-applicable','skipped'].includes(row.status));if(row.status==='adapted'){assert.ok(row.source.read);assert.ok(row.adapters.length);}}
  assert.equal(await readFile('docs/KNOWN_MARKETS.md','utf8'),renderMarketReport(coverage));
});
test('upstream schemas validate actual materials and refuse invalid categories or unknown fields',async()=>{
  assert.deepEqual(await validateSchemas(),{schemas:3});
  const pkg=await read('package.json');const artifacts=marketArtifacts(pkg);
  const shop=new Ajv2020({strict:false}).compile(await read('market/schemas/shop.schema.json'));
  assert.equal(shop({...pkg.dsh.catalog,verified:true}),false);
  const ydhrdh=new Ajv({strict:false}).compile(await read('market/schemas/ydhrdh.schema.json'));
  const entry=JSON.parse(artifacts[`ydhrdh/registry/plugins/${pkg.name}/plugin.json`]);
  assert.equal(ydhrdh({...entry,category:'provider'}),false);
  assert.equal(entry.verified,false);assert.deepEqual(entry.compatibility.profiles,['desktop']);
  assert.equal(entry.install.spec,`${pkg.name}@${pkg.version}`);
  assert.match(artifacts['radar/PLUGINS-row.md'],/待测/);
});
test('pinned registry cannot inherit verification from another repository, version or malformed commit',async()=>{
  const pkg=await read('package.json');const source=await read('market/public-source.json');const repo=repositoryIdentity(source.repository);
  const published={...pkg,version:source.version};
  assert.equal(pinnedEntry(published,repo,source).verified.commit,source.commit);
  for(const edit of [{commit:'main'},{version:'0.0.0'},{repository:'https://github.com/other/repo'},{sourceContractValidated:false}])assert.throws(()=>pinnedEntry(published,repo,{...source,...edit}),/公开 commit/);
});

test('additional independent catalogs keep their own field shapes and preserve compatibility',async()=>{
  const pkg=await read('package.json');const files=marketArtifacts(pkg);
  const descriptor=JSON.parse(files[`dsh-plugins/plugins/${pkg.name}.json`]);
  assert.equal(descriptor.id,pkg.name);assert.equal(descriptor.support_versions,pkg.dsh.compatibility.dsh);
  assert.deepEqual(descriptor.description.map(x=>x.language),['en-US','zh-CN']);
  const cyber=JSON.parse(files['cyber-moshen/catalog-entry.json']);
  assert.ok(cyber.tags.length<=5);assert.equal(cyber.npm,pkg.name);assert.equal(cyber.url,'https://github.com/diwer/dsh-codex-adapter');
  const source=await read('market/public-source.json');
  const pending=marketArtifacts({...pkg,version:'99.0.0'},{publicSource:source});
  assert.equal(pending['pinned-registry/registry-entry.json'],undefined);
  assert.equal(JSON.parse(pending['pinned-registry/status.json']).ready,false);
});
