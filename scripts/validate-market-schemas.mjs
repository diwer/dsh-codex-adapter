import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';

export async function validateSchemas(root='.') {
  const read=async file=>JSON.parse(await readFile(`${root}/${file}`,'utf8'));
  const provenance=await read('market/schemas/sources.json');
  for(const item of provenance) {
    const actual=createHash('sha256').update(await readFile(`${root}/market/schemas/${item.file}`)).digest('hex');
    if(actual!==item.sha256)throw Error(`上游 schema 快照校验失败：${item.file}`);
  }
  const pkg=await read('package.json');
  const check=async(name,value,modern=true)=>{
    const validator=new (modern?Ajv2020:Ajv)({allErrors:true,strict:false});
    validator.addFormat('date',{type:'string',validate:value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value});
    const validate=validator.compile(await read(`market/schemas/${name}.schema.json`));
    if(!validate(value))throw Error(`市场 ${name} schema 不兼容：${JSON.stringify(validate.errors)}`);
  };
  await check('shop',pkg.dsh.catalog);
  await check('1024',await read('market/submissions/1024/catalog/plugins/diwer--dsh-codex-adapter.json'));
  const staticEntry=await read(`market/submissions/ydhrdh/registry/plugins/${pkg.name}/plugin.json`);
  await check('ydhrdh',staticEntry,false);
  if(staticEntry.verified!==false||staticEntry.install.spec!==`${pkg.name}@${pkg.version}`||staticEntry.compatibility.profiles.join(',')!=='desktop')throw Error('静态市场条目必须保留审核状态、精确版本和桌面范围');
  return {schemas:3};
}
