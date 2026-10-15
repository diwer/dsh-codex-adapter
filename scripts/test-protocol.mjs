import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=process.argv.slice(2);
const selected=files.length?files:['test/adapter.test.mjs','test/request.test.mjs','test/sse.test.mjs'];
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...selected],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
const output=(result.stdout??'')+(result.stderr??'')+(result.error?`\n${result.error.message}\n`:'');
const directory=path.join(root,'outputs','test-reports');
mkdirSync(directory,{recursive:true});
const logPath=path.join(directory,`protocol-${new Date().toISOString().replace(/[:.]/g,'-')}-${process.pid}.log`);
writeFileSync(logPath,output,{mode:0o600});
const counters=Object.fromEntries([...output.matchAll(/^# (tests|pass|fail|cancelled|skipped) (\d+)\s*$/gm)].map(match=>[match[1],Number(match[2])]));
const hasSummary=['tests','pass','fail','cancelled'].every(key=>Number.isSafeInteger(counters[key]));
// Missing summaries, abnormal exits, and child failures must never become green results.
const passed=result.status===0&&hasSummary&&counters.fail===0&&counters.cancelled===0;
console.log(`协议回归：${passed?'通过':'失败'}；总数 ${counters.tests??'未知'}，通过 ${counters.pass??'未知'}，失败 ${counters.fail??'未知'}，取消 ${counters.cancelled??'未知'}。`);
if(!passed){
  const failures=output.split('\n').filter(line=>/^\s*not ok\b/.test(line));
  if(failures.length)console.log('失败项：\n'+failures.join('\n'));
  else console.log(output.split('\n').slice(-20).join('\n'));
}
console.log(`完整日志：${logPath}`);
process.exitCode=passed?0:result.status||1;
