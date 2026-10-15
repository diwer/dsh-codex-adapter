import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {buildDocs,renderMarkdown} from '../scripts/build-docs.mjs';

const project=new URL('../',import.meta.url);
test('generated installation entries share the package version and readable text',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'adapter-docs-'));
  try{
    for(const name of ['README.md','README.en.md','package.json'])await writeFile(path.join(root,name),await readFile(new URL(name,project)));
    await mkdir(path.join(root,'lib/assets'),{recursive:true});
    const artwork=await readFile(new URL('lib/assets/big-fish-codex.png',project));
    await writeFile(path.join(root,'lib/assets/big-fish-codex.png'),artwork);
    const {version,installSpec}=await buildDocs(root);
    assert.deepEqual(await readFile(path.join(root,'site/assets/big-fish-codex.png')),artwork);
    const html=await readFile(path.join(root,'site/index.html'),'utf8');
    const llms=await readFile(path.join(root,'site/llms.txt'),'utf8');
    const full=await readFile(path.join(root,'site/llms-full.txt'),'utf8');
    const catalog=JSON.parse(await readFile(path.join(root,'site/market/plugins.json'),'utf8'));
    assert.ok(html.includes(installSpec));assert.ok(llms.includes(installSpec));
    assert.ok(llms.includes('ONLY DeepSeek Harness'));
    assert.ok(full.includes('For DeepSeek Harness only'));
    assert.match(await readFile(path.join(root,'site/robots.txt'),'utf8'),/Sitemap: https:\/\/diwer.github.io\/dsh-codex-adapter\/sitemap.xml/);
    assert.ok(llms.includes('\n## Documentation\n'));assert.ok(!llms.includes('\\n'));
    assert.ok(full.includes('https://github.com/diwer/dsh-codex-adapter/blob/main/docs/INSTALLATION.md'));
    assert.equal(catalog.plugins[0].version,version);
    assert.equal(catalog.plugins[0].icon,'https://diwer.github.io/dsh-codex-adapter/assets/big-fish-codex.png');
    for(const file of ['index.html','en.html']){
      const page=await readFile(path.join(root,'site',file),'utf8');
      assert.ok(page.includes('rel="icon" type="image/png" href="assets/big-fish-codex.png"'));
      assert.ok(page.includes('property="og:image"'));
      assert.ok(page.includes('class="hero-icon"'));
      assert.ok(!page.includes('&lt;img'));
      assert.match(page,/DeepSeek Harness/);
      assert.ok(page.includes('max-snippet:-1'));
      const metadata=[...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match=>JSON.parse(match[1]));
      assert.match(metadata[0].softwareRequirements,/not the regular DeepSeek chat/);
      const faq=metadata.find(item=>item['@type']==='FAQPage');
      assert.equal(faq.mainEntity.length,6);
      assert.ok(faq.mainEntity.every(item=>item.acceptedAnswer.text.length>20));
      assert.equal((page.match(/class="steps"/g)||[]).length,1);
      assert.match(page,file==='en.html'?/For DeepSeek Harness only/:/仅适用于 DeepSeek Harness/);

    }
    assert.ok(catalog.plugins[0].install.includes(installSpec));
    assert.ok(catalog.plugins[0].install.includes('--registry=https://registry.npmjs.org/'));
    assert.ok(html.includes(`download/v${version}/`));
    assert.doesNotMatch(html,/172 项|验收|逐项台账|待发布|开发与证据/);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('documentation generation rejects an installation version that drifted from the manifest',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'adapter-docs-version-'));
  try{
    await writeFile(path.join(root,'package.json'),await readFile(new URL('package.json',project)));
    await writeFile(path.join(root,'README.en.md'),await readFile(new URL('README.en.md',project)));
    const readme=await readFile(new URL('README.md',project),'utf8');
    await writeFile(path.join(root,'README.md'),readme.replace(/dsh-codex-official-adapter@[\d.]+/g,'dsh-codex-official-adapter@0.0.0'));
    await assert.rejects(buildDocs(root),/版本/);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('README rendering escapes raw markup and blocks executable link schemes',()=>{
  const html=renderMarkdown('<img src=x onerror=alert(1)> [unsafe](javascript:alert) [docs](docs/INSTALLATION.md)');
  assert.ok(!html.includes('<img'));assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('href="https://github.com/diwer/dsh-codex-adapter/blob/main/docs/INSTALLATION.md"'));
  assert.ok(renderMarkdown('```text\n<a>\n```').includes('&lt;a&gt;'));
});
