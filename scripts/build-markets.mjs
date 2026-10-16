import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {MARKET_ICON} from './market-icon.mjs';
import {awesomeEntry,repositoryIdentity,TOPICS} from './market-common.mjs';

export function marketArtifacts(pkg,{publicSource}={}) {
  const repo=repositoryIdentity(pkg.repository.url.replace(/^git\+/,''));
  const tarball=`${repo.url}/releases/download/v${pkg.version}/${pkg.name}-${pkg.version}.tgz`;
  const json=value=>JSON.stringify(value,null,2)+'\n';
  return {
    [`awesome-${repo.owner}__${repo.name}.yml`]:awesomeEntry(pkg,repo.url).replace('description:\n',`tarball: ${tarball}\ndescription:\n`),
    'dsh-plugin-shop.json':json({package:pkg.name,dsh:{catalog:pkg.dsh.catalog,compatibility:pkg.dsh.compatibility}}),
    'github-topics.json':json({repository:`${repo.owner}/${repo.name}`,topics:TOPICS}),
    'disclosure.json':json(pkg.disclosure),
    [`1024/catalog/plugins/${repo.owner.toLowerCase()}--${repo.name.toLowerCase()}.json`]:json({
      $schema:'../schema/plugin.schema.json',id:`${repo.owner}/${repo.name}`,name:repo.name,
      repository:repo.url,category:'model',description:pkg.dsh.catalog.summary,added:'2026-10-15',
    }),
    [`ydhrdh/registry/plugins/${pkg.name}/plugin.json`]:json({
      id:pkg.name,name:'DSH ChatGPT Adapter',version:pkg.version,description:pkg.dsh.catalog.summary.en,
      descriptionZh:pkg.dsh.catalog.summary.zh,author:{name:repo.owner,url:`https://github.com/${repo.owner}`},
      license:pkg.license,category:'integration',tags:pkg.keywords,
      compatibility:{dsh:pkg.dsh.compatibility.dsh,platforms:['macos'],profiles:['desktop']},
      install:{target:'npm',spec:`${pkg.name}@${pkg.version}`,command:`dsh plugin --profile {profile} add ${pkg.name}@${pkg.version} --registry=https://registry.npmjs.org/`},
      verified:false,repository:repo.url,docs:`${repo.url}/blob/main/docs/INSTALLATION.md`,
    }),
    [`dsh-plugins/plugins/${pkg.name}.json`]:json({id:pkg.name,name:'DSH ChatGPT Adapter',
      description:[{language:'en-US',content:pkg.dsh.catalog.summary.en},{language:'zh-CN',content:pkg.dsh.catalog.summary.zh}],
      support_versions:pkg.dsh.compatibility.dsh,urls:{homepage:pkg.homepage,repository:repo.url,issues:`${repo.url}/issues`}}),
    'cyber-moshen/catalog-entry.json':json({url:repo.url,tags:['ChatGPT','GPT','模型接入'],npm:pkg.name}),
    'radar/PLUGINS-row.md':`| ${repo.name} | [${repo.owner}/${repo.name}](${repo.url}) | ${pkg.dsh.catalog.summary.zh.replaceAll('|','／')}（desktop ${pkg.dsh.compatibility.dsh}；npm ${pkg.name}@${pkg.version}） | 待测 |\n`,
    'manual-submission.json':json({repository:repo.url,package:pkg.name,version:pkg.version,icon:MARKET_ICON.url,iconAlt:MARKET_ICON.alt,
      description:pkg.dsh.catalog.summary,license:pkg.license,compatibility:pkg.dsh.compatibility,
      install:`dsh plugin --profile desktop add ${pkg.name}@${pkg.version} --registry=https://registry.npmjs.org/`,
      tarball,privacy:`${repo.url}/blob/main/docs/PRIVACY.md`,submitted:false,reviewed:false}),
    ...(publicSource && publicSource.version===pkg.version?{'pinned-registry/registry-entry.json':json(pinnedEntry(pkg,repo,publicSource))}:{}),
    'pinned-registry/status.json':json({targetVersion:pkg.version,sourceVersion:publicSource?.version??null,ready:publicSource?.version===pkg.version,reason:publicSource?.version===pkg.version?'公开源码契约匹配；仍待市场维护者审核':'本地目标版本尚无匹配的公开 commit 证据；格式适配已实现，发布后重新核对。'}),
  };
}
export function pinnedEntry(pkg,repo,source) {
  if(source.repository!==repo.url || source.packageName!==pkg.name || source.version!==pkg.version || !/^[a-f0-9]{40}$/.test(source.commit) || source.sourceContractValidated!==true)
    throw new Error('固定源码条目缺少匹配版本的公开 commit 验证；更新 market/public-source.json 后重试');
  return {fullName:`${repo.owner}/${repo.name}`,name:pkg.name,title:'DSH ChatGPT Adapter',titleZh:'Harness ChatGPT 订阅模型',
    summary:pkg.dsh.catalog.summary.en,summaryZh:pkg.dsh.catalog.summary.zh,category:'model',tags:pkg.keywords,
    verified:{packageName:pkg.name,bundlePatch:source.bundlePatch,client:true,branch:'main',commit:source.commit}};
}
export async function syncMarkets({check=false}={}) {
  const publicSource=JSON.parse(await readFile('market/public-source.json','utf8'));
  const artifacts=marketArtifacts(JSON.parse(await readFile('package.json','utf8')),{publicSource});
  if(!check) {await mkdir('market/submissions',{recursive:true});if(!artifacts['pinned-registry/registry-entry.json'])await rm('market/submissions/pinned-registry/registry-entry.json',{force:true});}
  for(const [name,content] of Object.entries(artifacts)) {
    const file=`market/submissions/${name}`;
    if(check) {if(await readFile(file,'utf8')!==content) throw new Error(`市场材料过期：${file}；运行 npm run market:build`);}
    else {await mkdir(path.dirname(file),{recursive:true});await writeFile(file,content);}
  }
}
if(process.argv[1] && new URL(import.meta.url).pathname===process.argv[1]) {
  await syncMarkets({check:process.argv.includes('--check')});
  console.log('市场提交材料与当前包元数据一致。');
}
