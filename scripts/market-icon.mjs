import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

export const MARKET_ICON=Object.freeze(JSON.parse(await readFile(new URL('../market/icon.json',import.meta.url),'utf8')));

export async function validateIcon(root='.') {
  const icon=JSON.parse(await readFile(path.join(root,'market/icon.json'),'utf8'));
  if(!/^https:\/\/raw\.githubusercontent\.com\/diwer\/dsh-codex-adapter\/[a-f0-9]{40}\/lib\/assets\/big-fish-codex\.png$/.test(icon.url))throw Error('市场 icon 必须是固定公开 commit 的直接图片地址');
  if(icon.file!=='lib/assets/big-fish-codex.png'||icon.mimeType!=='image/png')throw Error('市场 icon 来源或类型不符');
  const bytes=await readFile(path.join(root,icon.file));
  if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes.readUInt32BE(16)!==icon.width||bytes.readUInt32BE(20)!==icon.height||icon.width!==icon.height)throw Error('市场 icon PNG 格式或尺寸不符');
  if(bytes.length!==icon.bytes||createHash('sha256').update(bytes).digest('hex')!==icon.sha256)throw Error('市场 icon 与已核对图片不一致');
  if(!icon.alt?.zh||!icon.alt?.en)throw Error('市场 icon 缺少替代文本');
  return {url:icon.url,width:icon.width,height:icon.height};
}
