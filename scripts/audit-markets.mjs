import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

export function readmeSource(value) {
  const u=new URL(value);
  if(u.origin!=='https://github.com'||u.username||u.password||u.search||u.hash)throw Error('只读取公开 GitHub 仓库源码');
  const parts=u.pathname.replace(/\/$/,'').slice(1).split('/');
  if(parts.length!==2 && !(parts.length>=5&&parts[2]==='tree'))throw Error('仓库或子包路径无效');
  if(parts.some(p=>!p||p==='.'||p==='..'||!/^[-\w.]+$/.test(p)))throw Error('仓库路径含非法字符');
  return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.length===2?'HEAD':parts[3]}/${parts.length===2?'':parts.slice(4).join('/')+'/'}README.md`;
}
export function catalogMarkets(catalog) {
  if(!Array.isArray(catalog.plugins)||catalog.count!==catalog.plugins.length)throw Error('目录条数不一致');
  return catalog.plugins.filter(row=>row.category==='market').map(row=>({name:row.name,url:row.url}));
}
export async function auditMarketSources(rows,{fetchImpl=fetch}={}) {
  const entries=[];let index=0;
  async function worker(){while(index<rows.length){const row=rows[index++];let source;
    try{
      source=readmeSource(row.url);
      const response=await fetchImpl(source,{signal:AbortSignal.timeout(25000)});
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      const chunks=[];let size=0;
      for await(const chunk of response.body){size+=chunk.length;if(size>512*1024)throw Error('README 超过 512 KiB');chunks.push(chunk);}
      const raw=Buffer.concat(chunks);const text=raw.toString('utf8');
      entries.push({...row,source,read:true,sha256:createHash('sha256').update(raw).digest('hex'),
        // Signals are discovery evidence, never an automatic compatibility verdict.
        signals:text.split('\n').map((text,line)=>({line:line+1,text})).filter(x=>/topic:|数据源|plugins\.json|registry\/plugins|提交插件|收录插件|npm.*搜索|search.*npm/i.test(x.text)).slice(0,6).map(x=>({...x,text:x.text.slice(0,350)}))});
    }catch(error){entries.push({...row,source,read:false,error:error.message});}
  }}
  await Promise.all(Array.from({length:6},worker));return entries.sort((a,b)=>a.url.localeCompare(b.url));
}
async function main(){
  const discovered=JSON.parse(await readFile('outputs/market/discovered-market-plugins.json','utf8'));
  if(discovered.marketCount!==discovered.plugins.length)throw Error('发现快照不完整');
  const coverage=JSON.parse(await readFile('market/coverage.json','utf8'));
  const rows=[...new Map([...discovered.plugins,...coverage.entries.filter(x=>x.url.startsWith('https://github.com/'))].map(x=>[x.url,{name:x.name,url:x.url}])).values()];
  const entries=await auditMarketSources(rows);
  await mkdir('outputs/market',{recursive:true});
  await writeFile('outputs/market/source-audit-current.json',JSON.stringify({retrievedAt:new Date().toISOString(),source:discovered.source,sourceSha256:discovered.sha256,total:entries.length,read:entries.filter(x=>x.read).length,entries},null,2)+'\n');
  console.log(`已读取 ${entries.filter(x=>x.read).length}/${entries.length} 个源码说明；失败与哈希见 outputs/market/source-audit-current.json。`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
