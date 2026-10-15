import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {marketArtifacts,syncMarkets} from '../scripts/build-markets.mjs';
const pkg=JSON.parse(await readFile('package.json','utf8'));
const base='https://diwer.github.io/dsh-codex-adapter/';
test('market submissions follow package version, descriptions and credentials disclosure',async()=>{
  await syncMarkets({check:true});
  const changed=structuredClone(pkg);changed.version='9.8.7';
  const files=marketArtifacts(changed);
  assert.match(files['awesome-diwer__dsh-codex-adapter.yml'],/v9\.8\.7\/.*-9\.8\.7\.tgz/);
  assert.deepEqual(JSON.parse(files['disclosure.json']),pkg.disclosure);
});
test('public documentation has reciprocal languages, canonical URLs and current structured release',async()=>{
  for(const file of ['index.html','en.html']) {
    const html=await readFile(`site/${file}`,'utf8');
    assert.ok(html.includes(`rel="canonical" href="${base}${file==='index.html'?'':file}"`));
    for(const [lang,href] of [['zh-CN',base],['en',base+'en.html'],['x-default',base]]) assert.ok(html.includes(`hreflang="${lang}" href="${href}"`));
    const data=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(data.softwareVersion,pkg.version);assert.ok(data.downloadUrl.includes(`/v${pkg.version}/`));
    for(const [,href] of html.matchAll(/href="([^"]+)"/g)) {
      if(/^(https?:|#)/.test(href)) continue;
      await access(path.join('site',href));
    }
  }
  const sitemap=await readFile('site/sitemap.xml','utf8');assert.ok(sitemap.includes(`<loc>${base}en.html</loc>`));
  const catalog=JSON.parse(await readFile('site/market/plugins.json','utf8'));
  assert.equal(catalog.count,catalog.plugins.length);assert.equal(catalog.plugins[0].version,pkg.version);
  assert.ok(catalog.plugins[0].tarball.includes(`/v${pkg.version}/`));
});
