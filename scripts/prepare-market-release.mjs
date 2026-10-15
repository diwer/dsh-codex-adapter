import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {validateMarket,repositoryIdentity,awesomeEntry,TOPICS} from './market-common.mjs';

try {
  const args=process.argv.slice(2);
  if (args.length && (args.length!==2 || args[0]!=='--repository')) throw new Error('用法：npm run market:prepare -- [--repository https://github.com/OWNER/REPOSITORY]');
  const repo=args.length?repositoryIdentity(args[1]):null;
  const root=process.cwd();
  const {manifest,files,errors,warnings}=await validateMarket(root);
  if(errors.length) throw new Error(errors.join('；'));
  // A fresh, allowlisted snapshot: no original .git, author emails, auth files or run logs.
  const output=path.join(root,'outputs','market',`release-${manifest.version}-${Date.now()}`);
  const source=path.join(output,'source');
  await mkdir(source,{recursive:true});
  for(const file of files) { const target=path.join(source,file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target); }
  const packageFile=path.join(source,'package.json');
  if(repo) {
    manifest.repository={type:'git',url:`git+${repo.url}.git`};
    manifest.homepage=`${repo.url}#readme`;manifest.bugs={url:`${repo.url}/issues`};
    await writeFile(packageFile,JSON.stringify(manifest,null,2)+'\n');
    await writeFile(path.join(output,`${repo.owner}__${repo.name}.yml`),awesomeEntry(manifest,repo.url));
    const lock=JSON.parse(await readFile(path.join(source,'package-lock.json'),'utf8'));
    lock.packages[''].license=manifest.license;
    await writeFile(path.join(source,'package-lock.json'),JSON.stringify(lock,null,2)+'\n');
  }
  const packed=spawnSync('npm',['pack','--ignore-scripts','--json','--pack-destination',output],{cwd:source,encoding:'utf8',maxBuffer:8*1024*1024});
  await writeFile(path.join(output,'pack.log'),packed.stdout+packed.stderr,{mode:0o600});
  if(packed.status!==0) throw new Error('npm pack 未成功，参见输出目录 pack.log');
  const pack=JSON.parse(packed.stdout)[0];
  const tarball=path.join(output,pack.filename);
  const hashes=await Promise.all(files.map(async file=>({path:file,sha256:createHash('sha256').update(await readFile(path.join(source,file))).digest('hex')})));
  const report={version:manifest.version,preparedAt:new Date().toISOString(),repository:repo?.url??null,
    published:false,listed:false,topics:TOPICS,sourceFiles:hashes,tarball:pack.filename,
    tarballSha256:createHash('sha256').update(await readFile(tarball)).digest('hex'),
    packageFiles:pack.files.map(file=>file.path),warnings:repo?[]:warnings,
    pending:['GitHub 公开上传及 topics 设置','npm 发布（npm 抓取型目录需要）','社区目录提交和审核','各市场索引同步及真实搜索验收']};
  await writeFile(path.join(output,'release.json'),JSON.stringify(report,null,2)+'\n');
  await writeFile(path.join(output,'submission.json'),JSON.stringify({repository:repo?.url??null,name:manifest.name,category:'model',description:manifest.dsh.catalog.summary,compatibility:manifest.dsh.compatibility,topics:TOPICS,submitted:false},null,2)+'\n');
  await writeFile(path.join(output,'PUBLISHING.md'),`# 本地发布材料\n\n版本 ${manifest.version}，未上传、未提交市场。\n\n公开源代码在 source/；安装包为 ${pack.filename}；校验和与待办见 release.json。${repo?'已生成 awesome-dsh-plugin YAML 条目。':'尚缺真实 GitHub 仓库地址；再次使用 --repository 生成最终链接和目录条目。'}\n\n请以 source/ 作为首次公开仓库内容，不推送本地原始 Git 历史。GitHub Topics: ${TOPICS.join(', ')}。\n\n发布及各市场提交说明见 source/docs/MARKET_PUBLISHING.md。\n`);
  console.log(`本地市场材料已生成：${path.relative(root,output)}`);
  console.log(`安装包：${pack.filename}；${files.length} 个源文件；未执行上传或提交。`);
} catch(error) { console.error(`发布准备未完成：${error.message}`);process.exitCode=1; }
