import {createDesktopFetch} from './desktop-fetch.mjs';

const MESSAGES={invalid_settings:'请选择有效的代理方式。',invalid_proxy:'代理地址必须为完整的 HTTP(S) 地址，例如 http://127.0.0.1:7890。',closed:'插件已停用，请重新打开设置。'};
export class NetworkSettingsError extends Error{
  constructor(code){super(MESSAGES[code]);this.name='NetworkSettingsError';this.code=code;}
}

function settings(value){
  if(!value||!['environment','direct','proxy'].includes(value.mode)||typeof value.proxyUrl!=='string'||Object.keys(value).some(key=>!['mode','proxyUrl'].includes(key)))throw new NetworkSettingsError('invalid_settings');
  const proxyUrl=value.proxyUrl.trim();
  if(value.mode==='proxy'){
    try{const url=new URL(proxyUrl);if(proxyUrl.length>2048||!['http:','https:'].includes(url.protocol)||!url.hostname||url.pathname!=='/'||url.search||url.hash)throw Error();}
    catch{throw new NetworkSettingsError('invalid_proxy');}
  }else if(proxyUrl)throw new NetworkSettingsError('invalid_settings');
  return {mode:value.mode,proxyUrl};
}

function connectionFailure(error){
  const causes=Array.isArray(error?.cause?.errors)?error.cause.errors:[];
  const codes=[error?.code,error?.cause?.code,...causes.map(value=>value?.code)];
  if(codes.includes('ECONNREFUSED'))return '连接被拒绝，请检查代理地址、端口及代理是否正在运行。';
  if(codes.includes('ENOTFOUND'))return '无法解析地址，请检查代理地址和 DNS。';
  if(error?.name==='TimeoutError'||codes.some(code=>['ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT'].includes(code)))return '连接超时，请检查网络和代理。';
  if(codes.some(code=>['UNABLE_TO_GET_ISSUER_CERT_LOCALLY','UNABLE_TO_VERIFY_LEAF_SIGNATURE','CERT_HAS_EXPIRED','DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN'].includes(code)))return 'TLS 证书校验失败，请检查代理证书配置。';
  return '无法连接服务，请检查网络和代理配置。';
}

/** One plugin-owned transport, shared by authorization, model discovery and inference. */
export async function createDesktopNetwork({store,proxyUrl='',createTransport=createDesktopFetch,onChange=()=>{}}){
  let current=settings(await store.transaction(state=>state.network)??{mode:proxyUrl?'proxy':'environment',proxyUrl});
  const make=value=>createTransport({proxyMode:value.mode,proxyUrl:value.proxyUrl});
  let transport=make(current),closed=false,queue=Promise.resolve();
  const retiring=new Set(),tests=new Set();
  const retire=owned=>{const closing=Promise.resolve().then(()=>owned.close()).catch(()=>{}).finally(()=>retiring.delete(closing));retiring.add(closing);};
  const status=()=>({...current});
  const checkOpen=()=>{if(closed)throw new NetworkSettingsError('closed');};
  return {
    status,
    async fetch(url,init){checkOpen();return transport.fetch(url,init);},
    save(value){
      const result=queue.then(async()=>{
        checkOpen();const next=settings(value),candidate=make(next);
        try{await store.transaction(state=>{state.network=next;});checkOpen();}
        catch(error){retire(candidate);throw error;}
        const previous=transport;transport=candidate;current=next;retire(previous);
        try{Promise.resolve(onChange()).catch(()=>{});}catch{}
        return status();
      });
      queue=result.catch(()=>{});return result;
    },
    test(value){
      checkOpen();const candidate=make(settings(value)),controller=new AbortController();
      const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(10000)]);
      const probes=[['authorization','https://auth.openai.com/.well-known/openid-configuration'],['models','https://api.openai.com/v1/models']];
      let entry;
      const operation=(async()=>{
      try{
        const checks=await Promise.all(probes.map(async([service,url])=>{
          const started=Date.now();
          try{
            // Connectivity only: never send account credentials or consume inference quota.
            const response=await candidate.fetch(url,{method:'GET',signal});
            await response.body?.cancel();
            const ok=response.ok||(service==='models'&&response.status===401);
            return {service,ok,status:response.status,durationMs:Date.now()-started,...ok?{}:{message:`服务返回 HTTP ${response.status}，请检查网络出口与代理。`}};
          }catch(error){return {service,ok:false,durationMs:Date.now()-started,message:connectionFailure(error)};}
        }));
        checkOpen();return {ok:checks.every(check=>check.ok),checks};
      }finally{try{await candidate.close();}finally{tests.delete(entry);}}
      })();
      entry={controller,operation};tests.add(entry);return operation;
    },
    async close(){closed=true;for(const entry of tests)entry.controller.abort();await queue;await Promise.allSettled([transport.close(),...retiring,...[...tests].map(entry=>entry.operation)]);},
  };
}
