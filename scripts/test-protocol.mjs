import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2);
const diagnostic=args.includes('--diagnostic');
const files=args.filter(value=>value!=='--diagnostic');
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
const resultPath=logPath.replace(/\.log$/,'.json');
writeFileSync(resultPath,JSON.stringify({version:1,mode:diagnostic?'diagnostic':'final',passed,counters,exitCode:result.status,signal:result.signal,logPath},null,2)+'\n',{mode:0o600});
if(diagnostic&&hasSummary&&result.status!==null){
  // The command acknowledges recording a diagnostic run, never a passing suite.
  // Its JSON result retains passed:false and the original test exit code.
  console.log('内部试跑已记录，结论以最终验收为准。');
  console.log(`结果文件：${resultPath}`);
  process.exitCode=0;
}else{
  console.log(`协议回归：${passed?'通过':'失败'}；总数 ${counters.tests??'未知'}，通过 ${counters.pass??'未知'}，失败 ${counters.fail??'未知'}，取消 ${counters.cancelled??'未知'}。`);
  console.log(`完整日志：${logPath}`);
  process.exitCode=passed?0:result.status||1;
}
