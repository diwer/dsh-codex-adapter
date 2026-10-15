import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const files = [];
async function walk(dir) { for (const entry of await readdir(dir, {withFileTypes:true})) { const path = `${dir}/${entry.name}`; if (entry.isDirectory()) await walk(path); else if (/\.(?:mjs|js)$/.test(path)) files.push(path); } }
for (const dir of ['src','lib','test','test-runtime','scripts']) await walk(dir);
for (const path of files) { const result = spawnSync(process.execPath, ['--check',path], {stdio:'inherit'}); if (result.status !== 0) process.exit(result.status ?? 1); }
console.log(`Syntax checked ${files.length} JavaScript modules.`);
