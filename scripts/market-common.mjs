import {lstat, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';

export const PUBLIC_ROOTS = ['src','lib','test','test-runtime','scripts','market','site','.github','examples',
  'package.json','package-lock.json','cordis.patch.yml','README.md','README.en.md','RELEASE_NOTES.md','LICENSE','.gitignore',
  'docs/AUTH.md','docs/COMPATIBILITY.md','docs/SOURCES.md','docs/PRIVACY.md','docs/MARKET_PUBLISHING.md'];
export const TOPICS = ['dsh-plugin','deepseek-harness','dsh','cordis-plugin','chatgpt','codex','llm-provider'];
export function repositoryIdentity(value) {
  const match = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]*))\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(value ?? '');
  if (!match || ['.','..'].includes(match[2])) throw new Error('需要真实的 GitHub 仓库根地址：https://github.com/OWNER/REPOSITORY');
  return {owner:match[1],name:match[2],url:`https://github.com/${match[1]}/${match[2]}`};
}
export function localPath(value) {
  if (typeof value !== 'string' || value.includes('\\') || path.isAbsolute(value)) throw new Error('发布路径必须是相对路径');
  const result = value.replace(/^\.\//,'');
  if (!result || result.split('/').some(part=>!part || part==='.' || part==='..')) throw new Error('发布路径不能越过项目边界');
  return result;
}
export async function publicFiles(root) {
  const files=[];
  async function walk(relative) {
    const absolute=path.join(root,localPath(relative));
    const info=await lstat(absolute);
    if (info.isSymbolicLink()) throw new Error(`发布文件不能是符号链接：${relative}`);
    if (info.isDirectory()) for (const entry of (await readdir(absolute)).sort()) await walk(`${relative}/${entry}`);
    else if (info.isFile()) files.push(relative);
    else throw new Error(`不支持的发布文件：${relative}`);
  }
  for (const relative of PUBLIC_ROOTS) await walk(relative);
  return files.sort();
}
export async function validateMarket(root) {
  const manifest=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  const errors=[]; const warnings=[];
  const check=(condition,message)=>{if(!condition) errors.push(message);};
  check(manifest.license==='MIT','需要明确的 MIT 许可证');
  check(manifest.private!==true,'private:true 会阻止 npm 分发');
  check(manifest.keywords?.includes('dsh-plugin') && manifest.keywords?.includes('deepseek-harness'),'缺少市场搜索关键词');
  check(manifest.dsh?.catalog?.category==='provider','分类应为 provider');
  for (const language of ['en','zh']) check(typeof manifest.dsh?.catalog?.summary?.[language]==='string' && manifest.dsh.catalog.summary[language].length>0 && manifest.dsh.catalog.summary[language].length<=200,`缺少或超长的 ${language} 简介`);
  const caps=manifest.dsh?.catalog?.capabilities;
  check(Array.isArray(caps) && caps.length<=20 && caps.every(x=>typeof x==='string' && x.length>0 && x.length<=64),'能力说明格式不正确');
  check(manifest.dsh?.compatibility?.dsh==='0.2.0-rc.2' && manifest.dsh.compatibility.profiles?.includes('desktop'),'兼容声明需限定已验证桌面宿主');
  for (const name of Object.keys({...manifest.dependencies,...manifest.optionalDependencies})) check(!name.startsWith('@deepseek-ai/'),`宿主接口必须为 peerDependency：${name}`);
  for (const field of ['preinstall','install','postinstall','prepare','prepublishOnly']) check(!manifest.scripts?.[field],`不应在安装或打包时执行生命周期脚本：${field}`);
  const files=await publicFiles(root);
  const published=new Set(files);
  for (const target of [manifest.main,...Object.values(manifest.exports ?? {}),manifest.dsh?.bundle?.patch]) {
    try { check(published.has(localPath(target)),`发布范围缺少入口：${target}`); } catch { errors.push('入口或 bundle patch 路径非法'); }
  }
  const patch=await readFile(path.join(root,localPath(manifest.dsh.bundle.patch)),'utf8');
  check(patch.includes(`name: ${manifest.name}`) && /- insert:/.test(patch),'bundle 未插入当前包');
  const forbidden=[[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,'私钥'],[/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/,'GitHub 凭证'],[/sk-(?:proj-)?[A-Za-z0-9_-]{25,}/,'API 凭证'],[/\/Users\/[A-Za-z0-9._-]+\/|[A-Za-z0-9._+-]+@(?:gmail|meituan)\.com/,'本机个人标识']];
  for (const relative of files) {
    const value=await readFile(path.join(root,relative),'utf8');
    for (const [pattern,label] of forbidden) check(!pattern.test(value),`公开范围发现${label}：${relative}`);
  }
  if (!manifest.repository) warnings.push('尚未绑定实际公开仓库；GitHub 发布、topic 和在线收录均待完成');
  else { try { repositoryIdentity(typeof manifest.repository==='string'?manifest.repository:manifest.repository.url.replace(/^git\+/,'')); } catch { errors.push('repository 不是有效 GitHub 根地址'); } }
  return {manifest,files,errors,warnings};
}

export function awesomeEntry(manifest, repository) {
  const repo=repositoryIdentity(repository);
  return `url: ${repo.url}\nname: ${repo.owner}/${repo.name}\ncategory: model\ndescription:\n  en: ${JSON.stringify(manifest.dsh.catalog.summary.en)}\n  zh: ${JSON.stringify(manifest.dsh.catalog.summary.zh)}\n`;
}
