import {createHash, randomUUID} from 'node:crypto';
import {mkdir, readFile, writeFile, rename, rm, lstat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const RELEASE = Object.freeze({
  version:'0.1.0',
  filename:'dsh-codex-official-adapter-0.1.0.tgz',
  url:'https://github.com/diwer/dsh-codex-adapter/releases/download/v0.1.0/dsh-codex-official-adapter-0.1.0.tgz',
  sha256:'937000caa727e8dc26813bc304f255d913c1d621a32702ec58e12e04127c7c14',
});

export function verifyDigest(bytes, expected=RELEASE.sha256) {
  const actual=createHash('sha256').update(bytes).digest('hex');
  if(actual!==expected) throw new Error('安装包 SHA-256 不匹配；已停止，不调用安装器。');
  return actual;
}

export function parseArgs(args) {
  const options={dsh:'dsh',profile:'desktop',cacheDir:path.join(os.homedir(),'.cache','dsh-codex-adapter',RELEASE.version)};
  const fields={'--dsh':'dsh','--profile':'profile','--cache-dir':'cacheDir','--archive':'archive'};
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--help') return {...options,help:true};
    const key=fields[args[i]];
    if(!key || !args[i+1] || args[i+1].startsWith('--')) throw new Error('参数错误；运行 node scripts/install-release.mjs --help 查看用法。');
    options[key]=args[++i];
  }
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(options.profile)) throw new Error('Profile 名称格式不正确。');
  return options;
}

export async function obtainArchive(options,{fetchImpl=fetch}={}) {
  if(options.archive) {
    const file=path.resolve(options.archive);
    verifyDigest(await readFile(file));
    return file;
  }
  await mkdir(options.cacheDir,{recursive:true,mode:0o700});
  const file=path.resolve(options.cacheDir,RELEASE.filename);
  const info=await lstat(file).catch(error=>{if(error.code!=='ENOENT') throw error;});
  if(info) {
    if(!info.isFile() || info.isSymbolicLink()) throw new Error('缓存路径不是普通文件。');
    verifyDigest(await readFile(file));
    return file;
  }
  const response=await fetchImpl(RELEASE.url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok) throw new Error(`GitHub 安装包下载失败：HTTP ${response.status}`);
  const chunks=[]; let size=0;
  for await(const chunk of response.body) {
    size+=chunk.length;
    if(size>2*1024*1024) throw new Error('安装包大小异常；已停止。');
    chunks.push(chunk);
  }
  const bytes=Buffer.concat(chunks);
  verifyDigest(bytes);
  const temporary=`${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary,bytes,{mode:0o600,flag:'wx'});
    await rename(temporary,file);
  } finally { await rm(temporary,{force:true}); }
  return file;
}

export async function installRelease(options,{executor,fetchImpl}={}) {
  const file=await obtainArchive(options,{fetchImpl});
  const args=['plugin','--profile',options.profile,'add',file,'--ignore-scripts','--registry=https://registry.npmjs.org/'];
  const execute=executor ?? ((command,argv)=>new Promise((resolve,reject)=>{
    const child=spawn(command,argv,{stdio:'inherit',shell:false});
    child.once('error',reject);
    child.once('exit',(code,signal)=>signal?reject(new Error(`安装进程被 ${signal} 终止`)):resolve(code??1));
  }));
  const code=await execute(options.dsh,args);
  if(code!==0) throw new Error(`官方插件安装器返回 ${code}；保留宿主诊断，不修改锁文件或完整性策略。`);
  console.log(`v${RELEASE.version} 安装完成，SHA-256 校验通过。请在当前任务结束后完全退出并重新打开对应 Harness。`);
  return {version:RELEASE.version,file,sha256:RELEASE.sha256};
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options=parseArgs(process.argv.slice(2));
    if(options.help) console.log('用法：node scripts/install-release.mjs [--dsh 官方CLI路径] [--profile desktop] [--cache-dir 缓存目录] [--archive 已下载的tgz]\n下载固定 v0.1.0、校验固定 SHA-256，再通过官方 CLI 安装本地包。需要 Node >=22.19。不会重启应用或读取登录凭证。');
    else await installRelease(options);
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
