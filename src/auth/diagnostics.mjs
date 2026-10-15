import {constants} from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {AuthError} from './errors.mjs';

const EVENTS=new Set(['runtime_started','login_started','listener_ready','authorization_ready','callback_received','callback_validated','request_started','request_succeeded','request_failed','token_response_received','token_response_validated','id_token_validated','credentials_saved','login_succeeded','login_failed','listener_closed']);
const STAGES=new Set(['discovery','token','jwks','revocation','callback','token_response','id_token','credential_store']);

/** Allowlisted metadata only: never serialize provider bodies, URLs, identities or tokens. */
export function diagnosticRecord(value){
  if(!EVENTS.has(value?.event))return null;
  const record={time:new Date().toISOString(),event:value.event};
  if(STAGES.has(value.stage))record.stage=value.stage;
  if(typeof value.flow==='string'&&/^[a-f0-9]{16}$/.test(value.flow))record.flow=value.flow;
  if(typeof value.code==='string')record.code=new AuthError(value.code).code;
  if(Number.isInteger(value.status)&&value.status>=100&&value.status<=599)record.status=value.status;
  if(Number.isInteger(value.port)&&value.port>0&&value.port<=65535)record.port=value.port;
  if(Number.isSafeInteger(value.durationMs)&&value.durationMs>=0)record.durationMs=value.durationMs;
  if(Number.isSafeInteger(value.expiresIn)&&value.expiresIn>=0)record.expiresIn=value.expiresIn;
  for(const key of ['hasAccessToken','hasRefreshToken','hasIdToken'])if(typeof value[key]==='boolean')record[key]=value[key];
  if(['explicit','environment','direct'].includes(value.proxyMode))record.proxyMode=value.proxyMode;
  if(typeof value.version==='string'&&/^\d+\.\d+\.\d+$/.test(value.version))record.version=value.version;
  if(['access_token','refresh_token','id_token','token_type','expires_in','scope','earliest_refresh_at'].includes(value.field))record.field=value.field;
  return record;
}

export function createDiagnosticLog({directory}){
  const file=path.join(directory,'auth-diagnostics.jsonl');
  let tail=Promise.resolve(),writeFailed=false;
  function record(value){
    const safe=diagnosticRecord(value);if(!safe)return;
    tail=tail.then(async()=>{
      await fs.mkdir(directory,{recursive:true,mode:0o700});
      const stat=await fs.lstat(directory);
      if(!stat.isDirectory()||stat.isSymbolicLink()||stat.uid!==process.getuid()||(stat.mode&0o077)||await fs.realpath(directory)!==path.resolve(directory))throw Error();
      let handle=await fs.open(file,constants.O_WRONLY|constants.O_APPEND|constants.O_CREAT|constants.O_NOFOLLOW,0o600);
      try{
        const info=await handle.stat();
        if(!info.isFile()||info.uid!==process.getuid()||(info.mode&0o077)||info.nlink!==1)throw Error();
        if(info.size>=524288){await handle.close();handle=null;await fs.rename(file,file+'.1');handle=await fs.open(file,constants.O_WRONLY|constants.O_APPEND|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);}
        await handle.writeFile(JSON.stringify(safe)+'\n');writeFailed=false;
      }finally{await handle?.close();}
    }).catch(()=>{writeFailed=true;});
  }
  return {record,flush:()=>tail,status:()=>({path:file,writeFailed})};
}
