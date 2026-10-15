import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const repo='https://github.com/diwer/dsh-codex-adapter';
const base='https://diwer.github.io/dsh-codex-adapter/';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const sourceLink=target=>target.startsWith('#')?target:/^https:\/\//.test(target)?target:`${repo}/blob/main/${target}`;

// Only the small Markdown subset used by the public README. Escape raw HTML first;
// links are restricted to HTTPS, repository paths and local heading anchors.
export function renderMarkdown(markdown){
  const inline=value=>{
    const code=[];
    let result=escape(value).replace(/`([^`]+)`/g,(_,text)=>{code.push(`<code>${text}</code>`);return `\u0000${code.length-1}\u0000`;});
    result=result.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g,(_,label,target)=>/^(?:https:\/\/|#|[\w.-]+(?:\/|$))/.test(target)&&!target.includes(':')||target.startsWith('https://')?`<a href="${sourceLink(target)}">${label}</a>`:label);
    return result.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\u0000(\d+)\u0000/g,(_,index)=>code[Number(index)]);
  };
  const blocks=markdown.trim().split(/\n\s*\n/);
  return blocks.map(block=>{
    if(block.startsWith('```'))return `<pre><code>${escape(block.replace(/^```[^\n]*\n/,'').replace(/\n```$/,''))}</code></pre>`;
    if(/^#{1,3} /.test(block)){const [,marks,title]=/^(#{1,3}) (.*)$/.exec(block);return `<h${marks.length}>${inline(title)}</h${marks.length}>`;}
    if(block.startsWith('- '))return `<ul>${block.split('\n').map(row=>`<li>${inline(row.replace(/^- /,''))}</li>`).join('')}</ul>`;
    if(/^\d+\. /.test(block))return `<ol>${block.split('\n').map(row=>`<li>${inline(row.replace(/^\d+\. /,''))}</li>`).join('')}</ol>`;
    if(block.startsWith('> '))return `<aside>${inline(block.replace(/^> /gm,''))}</aside>`;
    return `<p>${inline(block.replaceAll('\n',' '))}</p>`;
  }).join('\n');
}

export async function buildDocs(root=process.cwd()){
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  const readme=await readFile(path.join(root,'README.md'),'utf8');
  const english=await readFile(path.join(root,'README.en.md'),'utf8');
  const installSpec=`${pkg.name}@${pkg.version}`;
  const download=`${repo}/releases/download/v${pkg.version}/${pkg.name}-${pkg.version}.tgz`;
  const release=`${repo}/releases/tag/v${pkg.version}`;
  const section=heading=>{
    const text=readme.split(`## ${heading}\n`)[1];
    if(!text)throw new Error(`README 缺少用户说明：${heading}`);
    return text.split('\n## ')[0].trim();
  };
  if(!readme.includes(installSpec))throw new Error('README 安装版本与 package.json 不一致。');
  const links=[['快速开始',`${repo}#快速开始`],['安装与排错',`${repo}/blob/main/docs/INSTALLATION.md`],['兼容范围',`${repo}/blob/main/docs/COMPATIBILITY.md`],['数据与隐私',`${repo}/blob/main/docs/PRIVACY.md`],['版本说明',release],['源码',repo]];
  const title='DSH ChatGPT Adapter · 把 ChatGPT 订阅带进 Harness';
  const description=pkg.dsh.catalog.summary.zh;
  const structured={'@context':'https://schema.org','@type':['SoftwareApplication','SoftwareSourceCode'],name:'DSH ChatGPT Adapter',alternateName:pkg.name,url:base,description,applicationCategory:'DeveloperApplication',operatingSystem:'macOS with DeepSeek Harness desktop 0.2.0-rc.2',softwareVersion:pkg.version,license:`${repo}/blob/main/LICENSE`,codeRepository:repo,programmingLanguage:'JavaScript',downloadUrl:download,isAccessibleForFree:true};
  const llms=`# DSH ChatGPT Adapter

> Use your ChatGPT subscription in DeepSeek Harness. No API key required.

- Package: ${installSpec}
- Supported host: DeepSeek Harness desktop 0.2.0-rc.2 on macOS.
- Install: Plugins → Add plugin → ${installSpec}; select https://registry.npmjs.org/; click Install; fully quit and reopen Harness.
- Connect: Settings → ChatGPT 订阅 → 连接 ChatGPT → 打开授权页面. Complete OpenAI sign-in and consent. Models load automatically.
- Use: choose an account model under ChatGPT plan (Sign in with ChatGPT).
- Features: GPT/DeepSeek switching, image-capable models, host tools, multiple accounts, optional GPT default for new conversations.
- Requirements: an eligible ChatGPT account; models and usage limits depend on that account.
- Data: conversation text, selected images and tool results go to OpenAI. Credentials are unencrypted local files restricted to the current user. Independent MIT community project; not affiliated with OpenAI or DeepSeek.

## Documentation

${links.map(([name,url])=>`- [${name}](${url})`).join('\n')}
- [Full documentation](${base}llms-full.txt)
`;
  const site=path.join(root,'site');await mkdir(path.join(site,'market'),{recursive:true});
  await writeFile(path.join(site,'llms.txt'),llms);
  await writeFile(path.join(site,'llms-full.txt'),readme.replace(/\]\(([^)]+)\)/g,(_,target)=>`](${sourceLink(target)})`));
  await writeFile(path.join(site,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}</loc></url><url><loc>${base}en.html</loc></url></urlset>\n`);
  await writeFile(path.join(site,'.nojekyll'),'');
  const plugin={name:pkg.name,owner:'diwer',url:repo,category:'model',description:pkg.dsh.catalog.summary,version:pkg.version,tarball:download,
    install:`dsh plugin --profile desktop add ${installSpec} --ignore-scripts --registry=https://registry.npmjs.org/`,added:'2026-10-15',
    dshPeers:Object.fromEntries(Object.entries(pkg.peerDependencies).filter(([name])=>name.startsWith('@deepseek-ai/dsh-')))};
  await writeFile(path.join(site,'market/plugins.json'),JSON.stringify({name:'DSH ChatGPT Adapter author catalog',url:base,source:repo,notice:'Author catalog; not a third-party endorsement.',count:1,categories:{model:{en:'Models & Providers',zh:'模型与账号接入'}},plugins:[plugin]},null,2)+'\n');
  const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${base}"><link rel="alternate" hreflang="zh-CN" href="${base}"><link rel="alternate" hreflang="en" href="${base}en.html"><link rel="alternate" hreflang="x-default" href="${base}"><link rel="alternate" type="text/plain" href="${base}llms.txt" title="LLM documentation">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${base}"><meta property="og:locale" content="zh_CN">
<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>
<style>
:root{color-scheme:light;--ink:#142e30;--muted:#526866;--line:#dce5df;--accent:#086c57;--paper:#f8faf6}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.8 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--accent);text-underline-offset:4px}a:hover{text-decoration-thickness:2px}a:focus-visible,button:focus-visible{outline:3px solid #269b80;outline-offset:4px}main,nav,footer{max-width:1040px;margin:auto;padding-left:28px;padding-right:28px}nav{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:24px;padding-bottom:24px;border-bottom:1px solid var(--line)}nav a{font-size:14px}nav strong{letter-spacing:-.5px}header{padding:72px 0 44px;max-width:800px}.eyebrow{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent)}h1{font-size:clamp(36px,6vw,64px);line-height:1.16;letter-spacing:-2px;margin:18px 0 24px;font-weight:650}header>p{font-size:18px;color:var(--muted);max-width:680px}h2{font-size:26px;line-height:1.4;letter-spacing:-.6px;margin:0 0 20px}h3{font-size:18px;margin-top:30px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 18px;border:1px solid var(--line);border-radius:8px;text-decoration:none;font:inherit;font-size:14px;cursor:pointer;background:#fff;color:var(--ink)}.primary{background:var(--accent);border-color:var(--accent);color:#fff}.meta{font-size:13px;color:var(--muted);margin-top:20px}section{padding:36px 0;border-top:1px solid var(--line)}#features ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));list-style:none;padding:0;gap:14px}#features li{padding:22px;background:#fff;border:1px solid var(--line);border-radius:10px}#features li:last-child{grid-column:1/-1}#start{max-width:800px}#start pre{display:inline-block;margin:8px 8px 8px 0;vertical-align:middle}pre{padding:16px 18px;background:#edf2ee;border:1px solid var(--line);border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%}code{font:13px/1.7 ui-monospace,SFMono-Regular,monospace;overflow-wrap:anywhere}p code{background:#edf2ee;padding:2px 5px;border-radius:4px}aside{font-size:14px;border-left:3px solid #9dc9b9;padding:10px 16px;color:var(--muted)}#faq{max-width:800px}#faq p{margin:20px 0}#privacy{font-size:14px;color:var(--muted);max-width:800px}footer{display:flex;flex-wrap:wrap;gap:20px;border-top:1px solid var(--line);padding-top:22px;padding-bottom:32px;font-size:12px;color:var(--muted)}.skip{position:absolute;top:-80px;left:24px;background:white;padding:8px}.skip:focus{top:8px}@media(max-width:600px){main,nav,footer{padding-left:20px;padding-right:20px}header{padding-top:42px}#features ul{grid-template-columns:1fr}h1{letter-spacing:-1px}nav{align-items:flex-start}nav div{display:flex;gap:14px}.button{width:100%}#start pre{display:block;width:100%}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body><a class="skip" href="#start">跳到快速开始</a>
<nav aria-label="主导航"><strong>DSH ChatGPT Adapter</strong><div><a href="en.html" lang="en">English</a> · <a href="${repo}">GitHub ↗</a></div></nav>
<main><header><span class="eyebrow">Your subscription. Your workspace.</span><h1>把 ChatGPT 订阅<br>带进 Harness。</h1><p>登录账户，选择 GPT，即可开始工作。<br>无需 API Key，让图片理解与文件、搜索、终端工具一起为你工作。</p><div class="actions"><a class="button primary" href="#start">开始使用 →</a><a class="button" href="${download}">下载安装包 v${escape(pkg.version)}</a></div><p class="meta">Harness 桌面版 0.2.0-rc.2 · macOS · MIT 免费开源</p></header>
<section id="features"><h2>在熟悉的工作区，多一种选择。</h2>${renderMarkdown(section('为什么使用'))}</section>
<section id="start"><h2>三步，开始使用。</h2>${renderMarkdown(section('快速开始'))}<button class="button" type="button" id="copy-package" data-copy="${escape(installSpec)}" hidden>复制插件名称</button><p id="copy-feedback" role="status" aria-live="polite"></p></section>
<section id="faq"><h2>常见问题</h2>${renderMarkdown(section('常见问题'))}</section>
<section id="privacy"><h2>数据由你决定</h2><p>会话文本、所选图片和工具结果会发送至 OpenAI。登录凭证保存在本机未加密文件中，仅当前用户可读写。模型能力与额度以账户为准。</p><p>独立社区项目，不隶属于 OpenAI 或 DeepSeek。</p><p><a href="${repo}/blob/main/docs/PRIVACY.md">数据与隐私</a> · <a href="${repo}/blob/main/docs/COMPATIBILITY.md">兼容范围</a> · <a href="${repo}/blob/main/docs/INSTALLATION.md">安装与排错</a></p></section></main>
<footer><span>DSH ChatGPT Adapter · MIT</span><a href="${release}">版本说明</a><a href="${repo}/issues">反馈问题</a><a href="llms.txt">llms.txt</a><a href="llms-full.txt">完整文档</a></footer>
<script>const copyButton=document.getElementById('copy-package');const feedback=document.getElementById('copy-feedback');copyButton.hidden=false;copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(copyButton.dataset.copy);feedback.textContent='已复制，在 Add plugin 中粘贴即可。';}catch{feedback.textContent='请手动复制：'+copyButton.dataset.copy;}});const firstPackage=document.querySelector('#start pre');if(firstPackage)firstPackage.after(copyButton);</script>
</body></html>\n`;
  await writeFile(path.join(site,'index.html'),html);
  const englishDescription=pkg.description;
  const englishHead=html.slice(0,html.indexOf('<body>')).replace('lang="zh-CN"','lang="en"')
    .replace(escape(title),'DSH ChatGPT Adapter · Your subscription in Harness')
    .replaceAll(escape(description),escape(englishDescription))
    .replace(`rel="canonical" href="${base}"`,`rel="canonical" href="${base}en.html"`)
    .replace('content="zh_CN"','content="en_US"');
  const englishBody=english.replace(/^# .*\n/,'').replace(/^\[中文\].*$/m,'').replace(/^ {1,3}(```)/gm,'$1');
  const en=`${englishHead}<body><nav aria-label="Main navigation"><strong>DSH ChatGPT Adapter</strong><div><a href="./" lang="zh-CN">中文</a> · <a href="${repo}">GitHub ↗</a></div></nav><main><header><span class="eyebrow">Your subscription. Your workspace.</span><h1>ChatGPT, meet Harness.</h1><p>No API key. Your account, your models, your workspace.</p><div class="actions"><a class="button primary" href="${download}">Download v${escape(pkg.version)}</a><a class="button" href="${repo}/blob/main/docs/INSTALLATION.md">Installation help</a></div></header><section>${renderMarkdown(englishBody)}</section></main><footer>DSH ChatGPT Adapter · MIT · <a href="llms.txt">llms.txt</a></footer></body></html>\n`;
  await writeFile(path.join(site,'en.html'),en);
  return {version:pkg.version,installSpec};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){await buildDocs();console.log('已生成用户文档、静态首页与作者目录。');}
