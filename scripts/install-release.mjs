import {createHash, randomUUID} from 'node:crypto';
import {mkdir, readFile, writeFile, rename, rm, lstat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const RELEASE = Object.freeze({
  version:'0.1.4',
  filename:'dsh-codex-official-adapter-0.1.4.tgz',
  url:'https://github.com/diwer/dsh-codex-adapter/releases/download/v0.1.4/dsh-codex-official-adapter-0.1.4.tgz',
  checksumUrl:'https://github.com/diwer/dsh-codex-adapter/releases/download/v0.1.4/SHA256SUMS',
});

export function verifyDigest(bytes, expected) {
  if(!/^[a-f0-9]{64}$/.test(expected??''))throw new Error('缺少有效的 SHA-256 校验值；已停止。');
  const actual=createHash('sha256').update(bytes).digest('hex');
  if(actual!==expected) throw new Error('安装包 SHA-256 不匹配；已停止，不调用安装器。');
  return actual;
}

export function parseArgs(args) {
  const options={dsh:'dsh',profile:'desktop',cacheDir:path.join(os.homedir(),'.cache','dsh-codex-adapter',RELEASE.version)};
  const fields={'--dsh':'dsh','--profile':'profile','--cache-dir':'cacheDir','--archive':'archive','--sha256':'sha256'};
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--help') return {...options,help:true};
    const key=fields[args[i]];
    if(!key || !args[i+1] || args[i+1].startsWith('--')) throw new Error('参数错误；运行 node scripts/install-release.mjs --help 查看用法。');
    options[key]=args[++i];
  }
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(options.profile)) throw new Error('Profile 名称格式不正确。');
  if(options.sha256&&!/^[a-f0-9]{64}$/.test(options.sha256))throw new Error('SHA-256 格式不正确。');
  return options;
}

export async function releaseDigest(options,{fetchImpl=fetch}={}) {
  if(options.sha256)return options.sha256;
  const response=await fetchImpl(RELEASE.checksumUrl,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`发行校验文件下载失败：HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length>8192)throw new Error('SHA-256 校验文件大小异常。');
  const entries=bytes.toString('utf8').split(/\r?\n/).map(line=>/^([a-f0-9]{64})  (.+)$/.exec(line)).filter(Boolean).filter(match=>match[2]===RELEASE.filename);
  if(entries.length!==1)throw new Error('SHA-256 校验文件缺少唯一的目标安装包。');
  return entries[0][1];
}

export async function obtainArchive(options,{fetchImpl=fetch}={}) {
  const expected=await releaseDigest(options,{fetchImpl});
  if(options.archive) {
    const file=path.resolve(options.archive);
    verifyDigest(await readFile(file),expected);
    return file;
  }
  await mkdir(options.cacheDir,{recursive:true,mode:0o700});
  const file=path.resolve(options.cacheDir,RELEASE.filename);
  const info=await lstat(file).catch(error=>{if(error.code!=='ENOENT') throw error;});
  if(info) {
    if(!info.isFile() || info.isSymbolicLink()) throw new Error('缓存路径不是普通文件。');
    verifyDigest(await readFile(file),expected);
    return file;
  }
  const response=await fetchImpl(RELEASE.url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok) throw new Error(`GitHub 安装包下载失败：HTTP ${response.status}`);
  const chunks=[]; let size=0;
  for await(const chunk of response.body) {
    size+=chunk.length;
    if(size>8*1024*1024) throw new Error('安装包大小异常；已停止。');
    chunks.push(chunk);
  }
  const bytes=Buffer.concat(chunks);
  verifyDigest(bytes,expected);
  const temporary=`${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary,bytes,{mode:0o600,flag:'wx'});
    await rename(temporary,file);
  } finally { await rm(temporary,{force:true}); }
  return file;
}

export async function installRelease(options,{executor,fetchImpl}={}) {
  const sha256=await releaseDigest(options,{fetchImpl});
  const file=await obtainArchive({...options,sha256},{fetchImpl});
  const args=['plugin','--profile',options.profile,'add',file,'--ignore-scripts','--registry=https://registry.npmjs.org/'];
  const execute=executor ?? ((command,argv)=>new Promise((resolve,reject)=>{
    const child=spawn(command,argv,{stdio:'inherit',shell:false});
    child.once('error',reject);
    child.once('exit',(code,signal)=>signal?reject(new Error(`安装进程被 ${signal} 终止`)):resolve(code??1));
  }));
  const code=await execute(options.dsh,args);
  if(code!==0) throw new Error(`官方插件安装器返回 ${code}；保留宿主诊断，不修改锁文件或完整性策略。`);
  console.log(`v${RELEASE.version} 安装完成，SHA-256 校验通过。请在当前任务结束后完全退出并重新打开对应 Harness。`);
  return {version:RELEASE.version,file,sha256};
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options=parseArgs(process.argv.slice(2));
    if(options.help) console.log('用法：node scripts/install-release.mjs [--dsh 官方CLI路径] [--profile desktop] [--cache-dir 缓存目录] [--archive 已下载的tgz] [--sha256 已核实的SHA256]\n下载 v0.1.4、按发行页 SHA-256 校验，再通过官方 CLI 安装本地包。需要 Node >=22.19。不会重启应用或读取登录凭证。');
    else await installRelease(options);
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
