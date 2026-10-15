import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Read-only discovery. Never installs a market or runs catalog content.
const source='https://awesome-dsh-plugin.com/plugins.json';
const args=process.argv.slice(2);
try {
  let raw;
  if(args.length) {
    if(args.length!==2 || args[0]!=='--file') throw new Error('用法：npm run market:discover -- [--file 已下载的完整目录.json]');
    raw=await readFile(args[1]);
  } else {
    const response=await fetch(source,{signal:AbortSignal.timeout(60000),redirect:'error'});
    if(!response.ok) throw new Error(`目录读取失败：HTTP ${response.status}`);
    const chunks=[];let bytes=0;
    for await(const chunk of response.body) { bytes+=chunk.length;if(bytes>32*1024*1024) throw new Error('目录超过 32 MiB 限制');chunks.push(chunk); }
    raw=Buffer.concat(chunks);
  }
  if(raw.length>32*1024*1024) throw new Error('目录超过 32 MiB 限制');
  const catalog=JSON.parse(raw.toString('utf8'));
  if(!Array.isArray(catalog.plugins) || catalog.count!==catalog.plugins.length) throw new Error('目录条数不一致，不将部分数据当作完整目录');
  const plugins=catalog.plugins.filter(row=>row.category==='market').map(row=>({name:row.name,url:row.url,...row.npm?{npm:row.npm}:{}}));
  const result={source,sourceUpdated:catalog.updated,retrievedAt:new Date().toISOString(),sha256:createHash('sha256').update(raw).digest('hex'),
    catalogCount:catalog.plugins.length,marketCount:plugins.length,scope:'社区目录 market 分类完整快照；不代表全互联网所有市场均已收录或支持本插件',plugins};
  await mkdir('outputs/market',{recursive:true});
  const output=path.resolve('outputs/market/discovered-market-plugins.json');
  await writeFile(output,JSON.stringify(result,null,2)+'\n');
  console.log(`完整目录 ${result.catalogCount} 条，市场与管理分类 ${plugins.length} 条。`);
  console.log(`发现结果：${path.relative(process.cwd(),output)}`);
} catch(error) {console.error(`目录发现未完成：${error.message}`);process.exitCode=1;}
