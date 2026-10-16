import {renderPage,theme} from './docs-page.mjs';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const repo='https://github.com/diwer/dsh-codex-adapter';
const base='https://diwer.github.io/dsh-codex-adapter/';
const iconPath='assets/big-fish-codex.png';
const iconUrl=base+iconPath;
// README uses GitHub-compatible sized HTML; the site supplies its own branding.
const withoutBranding=markdown=>markdown.replace(/<p align="center">\s*<img [^>]*big-fish-codex\.png[^>]*>\s*<\/p>\s*/g,'');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const sourceLink=target=>target.startsWith('#')?target:/^https:\/\//.test(target)?target:`${repo}/blob/master/${target}`;

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
  const links=[['快速开始',`${repo}#快速开始`],['安装与排错',`${repo}/blob/master/docs/INSTALLATION.md`],['兼容范围',`${repo}/blob/master/docs/COMPATIBILITY.md`],['数据与隐私',`${repo}/blob/master/docs/PRIVACY.md`],['版本说明',release],['源码',repo]];
  const title='DeepSeek Harness 的 ChatGPT 订阅插件 | DSH ChatGPT Adapter';
  const description='仅适用于 DeepSeek Harness 的 ChatGPT 订阅接入插件。无需 API Key，登录自己的 ChatGPT 账户即可使用 GPT，支持图片、内置工具与模型切换。提供中英文安装说明；支持 Harness 桌面版 ≥0.2.0-rc.2 / macOS；实测基线为 0.2.0-rc.2。';
  const structured={'@context':'https://schema.org','@type':['SoftwareApplication','SoftwareSourceCode'],name:'DSH ChatGPT Adapter',alternateName:pkg.name,url:base,image:iconUrl,description,applicationCategory:'DeveloperApplication',operatingSystem:'macOS with DeepSeek Harness desktop >=0.2.0-rc.2',softwareVersion:pkg.version,license:`${repo}/blob/master/LICENSE`,codeRepository:repo,programmingLanguage:'JavaScript',downloadUrl:download,isAccessibleForFree:true,softwareRequirements:'DeepSeek Harness desktop >=0.2.0-rc.2 on macOS; not the regular DeepSeek chat website, mobile app, or chat desktop client.',inLanguage:['zh-CN','en'],sameAs:[repo,'https://www.npmjs.com/package/'+pkg.name],keywords:['DeepSeek Harness','ChatGPT subscription plugin','DSH Codex Adapter',pkg.name]};
  const llms=`# DSH ChatGPT Adapter

> Use your ChatGPT subscription in DeepSeek Harness. No API key required.

- Package: ${installSpec}
- Product scope: ONLY DeepSeek Harness. Not for the regular DeepSeek chat website, mobile app, or regular chat desktop client.
- Supported host: DeepSeek Harness desktop >=0.2.0-rc.2 on macOS.
- Also known as: DSH Codex Adapter; DSH ChatGPT Adapter; dsh-codex-official-adapter.
- 中文用途：仅在 DeepSeek Harness 中接入自己的 ChatGPT 订阅；不是 DeepSeek 普通聊天客户端插件。
- npm: https://www.npmjs.com/package/${pkg.name}
- CLI install: dsh plugin --profile desktop add ${installSpec} --ignore-scripts --registry=https://registry.npmjs.org/
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
  await mkdir(path.join(site,'assets'),{recursive:true});
  await copyFile(path.join(root,'lib/assets/big-fish-codex.png'),path.join(site,iconPath));
  await writeFile(path.join(site,'llms.txt'),llms);
  await writeFile(path.join(site,'llms-full.txt'),(withoutBranding(readme)+'\n\n---\n\n'+withoutBranding(english)).replace(/\]\(([^)]+)\)/g,(_,target)=>`](${sourceLink(target)})`));
  await writeFile(path.join(site,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}</loc></url><url><loc>${base}en.html</loc></url></urlset>\n`);
  await writeFile(path.join(site,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`);
  await writeFile(path.join(site,'.nojekyll'),'');
  const plugin={name:pkg.name,owner:'diwer',url:repo,icon:iconUrl,category:'model',description:pkg.dsh.catalog.summary,version:pkg.version,tarball:download,
    install:`dsh plugin --profile desktop add ${installSpec} --ignore-scripts --registry=https://registry.npmjs.org/`,added:'2026-10-15',
    dshPeers:Object.fromEntries(Object.entries(pkg.peerDependencies).filter(([name])=>name.startsWith('@deepseek-ai/dsh-')))};
  await writeFile(path.join(site,'market/plugins.json'),JSON.stringify({name:'DSH ChatGPT Adapter author catalog',url:base,source:repo,notice:'Author catalog; not a third-party endorsement.',count:1,categories:{model:{en:'Models & Providers',zh:'模型与账号接入'}},plugins:[plugin]},null,2)+'\n');
  const makeHead=(lang)=>{
    const en=lang==='en',url=base+(en?'en.html':''),pageTitle=en?'ChatGPT subscription plugin for DeepSeek Harness | DSH ChatGPT Adapter':title;
    const desc=en?'A ChatGPT subscription plugin exclusively for DeepSeek Harness. Sign in without an API key, use GPT with images and built-in tools. Bilingual installation guide. Requires Harness desktop >=0.2.0-rc.2 on macOS; tested on 0.2.0-rc.2.':description;
    const faqMarkdown=en?englishSection('Common questions'):section('常见问题');
    const faqItems=[...faqMarkdown.matchAll(/\*\*([^*]+)\*\*\s*([^\n]+)/g)].map(([,question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/`/g,'').replace(/\*\*/g,'')}}));
    const faqData={'@context':'https://schema.org','@type':'FAQPage',inLanguage:en?'en':'zh-CN',mainEntity:faqItems};
    return `<!doctype html><html lang="${en?'en':'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(pageTitle)}</title><meta name="description" content="${escape(desc)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="zh-CN" href="${base}"><link rel="alternate" hreflang="en" href="${base}en.html"><link rel="alternate" hreflang="x-default" href="${base}"><link rel="alternate" type="text/plain" href="${base}llms.txt" title="LLM documentation"><link rel="icon" type="image/png" href="${iconPath}"><link rel="apple-touch-icon" href="${iconPath}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(pageTitle)}"><meta property="og:description" content="${escape(desc)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${en?'en_US':'zh_CN'}"><meta property="og:image" content="${iconUrl}"><meta property="og:image:alt" content="${en?'Big Fish directing Codex':'大肥鱼指挥 Codex'}"><meta name="twitter:card" content="summary"><meta name="twitter:image" content="${iconUrl}"><script type="application/ld+json">${JSON.stringify({...structured,url,description:desc}).replaceAll('<','\\u003c')}</script><script type="application/ld+json">${JSON.stringify(faqData).replaceAll('<','\\u003c')}</script><style>${theme}</style></head>`;
  };
  const englishSection=heading=>withoutBranding(english).split(`## ${heading}\n`)[1]?.split('\n## ')[0].split('\n[Compatibility]')[0].trim();
  for(const lang of ['zh','en']){
    const en=lang==='en';
    const html=renderPage({lang,head:makeHead(lang),pkg,features:renderMarkdown(en?englishSection('Why use it'):section('为什么使用')).replace(/<\/strong>(?:：| — )/g,'</strong>'),faq:renderMarkdown(en?englishSection('Common questions'):section('常见问题'))});
    await writeFile(path.join(site,en?'en.html':'index.html'),html);
  }
  return {version:pkg.version,installSpec};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){await buildDocs();console.log('已生成用户文档、静态首页与作者目录。');}
