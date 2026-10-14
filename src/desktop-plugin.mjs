import path from 'node:path';
import {homedir} from 'node:os';
import Schema from '@deepseek-ai/schemastery';
import {LlmError} from '@deepseek-ai/dsh-llm';
import {ChatGPTPlanAdapter} from './plugin.mjs';
import {PROVIDER} from './adapter.mjs';
import {createAuthClient,FileCredentialStore,AuthError} from './auth/index.mjs';
import {DesktopAccountController} from './desktop-controller.mjs';
import {createDesktopFetch} from './desktop-fetch.mjs';
import {DesktopDefaultModel} from './desktop-default-model.mjs';

export const name='dsh-codex-official-adapter';
export const inject=['llm','connection'];
export const Config=Schema.object({
  credentialDirectory:Schema.string().default(path.join(homedir(),'.dsh','plugin-data',name,'auth')),
  authorizationTimeoutMs:Schema.number().step(1).min(60000).max(3600000).default(1800000),
  requestTimeoutMs:Schema.number().step(1).min(1).default(300000),
  maxEventBytes:Schema.number().step(1).min(1).default(8388608),
  maxOutputChars:Schema.number().step(1).min(1).default(33554432),
  maxReplayBytes:Schema.number().step(1).min(1).default(33554432),
  modelCapabilities:Schema.dict(Schema.object({contextWindow:Schema.number().step(1).min(1),reasoningEfforts:Schema.array(Schema.string())})).default({}),
});

/** Mounted in the desktop Profile with the desktop's authenticated Connection fence. */
export function apply(ctx,config){
  const store=new FileCredentialStore({directory:config.credentialDirectory});
  const transport=createDesktopFetch();
  const auth=createAuthClient({store,fetchImpl:transport.fetch,authorizationTimeoutMs:config.authorizationTimeoutMs});
  const controller=new DesktopAccountController({auth,store,onChange:()=>ctx.emit('llm/adapters-updated')});
  const adapter=new ChatGPTPlanAdapter({...config,session:controller,fetchImpl:transport.fetch,attachments:()=>ctx.get('attachments')});
  const listModels=adapter.listModels.bind(adapter);
  adapter.listModels=async provider=>{
    try{return await listModels(provider);}catch(error){if(['not_signed_in','account_mismatch','plan_permission_missing','reauthentication_required'].includes(error.code))return [];throw error;}
  };
  ctx.llm.registerAdapter([PROVIDER],adapter);
  let defaults;
  ctx.inject(['agentDefaultModel'],child=>{defaults=new DesktopDefaultModel({store,service:child.agentDefaultModel,listModels:()=>adapter.listModels(PROVIDER)});const owned=defaults;void owned.initialize().catch(()=>{});child.effect(()=>()=>{if(defaults===owned)defaults=undefined;});});
  const routes={
    status:{method:'GET',run:async()=>{const status=await controller.status();if(status.phase==='ready'&&defaults)try{await defaults.initialize();}catch(error){if(error instanceof LlmError)status.modelError={code:error.code,message:error.message};else throw error;}return {...status,...defaults?await defaults.status():{defaultGptEnabled:true,defaultModelUnavailable:true}};}},
    preferences:{method:'POST',run:body=>{if(!defaults)throw new AuthError('invalid_options');return defaults.setEnabled(body.enabled);}},
    login:{method:'POST',run:()=>controller.beginLogin()},
    restart:{method:'POST',run:()=>controller.restartLogin()},
    cancel:{method:'POST',run:()=>controller.cancelLogin()},
    select:{method:'POST',run:body=>controller.selectAccount(body.accountId)},
    logout:{method:'POST',run:body=>controller.logout(body.accountId)},
    models:{method:'GET',run:()=>adapter.listModels(PROVIDER)},
  };
  for(const [action,{method,run}] of Object.entries(routes)){
    ctx.connection.registerFetchRoute(ctx,{path:`/api/dsh-chatgpt-plan/${action}`,methods:[method],requestBody:'buffered',fetch:async request=>{
      const headers={'cache-control':'no-store','content-type':'application/json; charset=utf-8'};
      try{
        let body={};
        if(method==='POST'){
          if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return Response.json({error:{message:'请使用 JSON 请求。'}},{status:415,headers});
          const text=await request.text();if(text.length>4096)return Response.json({error:{message:'请求过大。'}},{status:413,headers});
          body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw new AuthError('invalid_options');
          const allowed=action==='preferences'?['enabled']:['select','logout'].includes(action)?['accountId']:[];
          if(Object.keys(body).some(key=>!allowed.includes(key))||(action==='preferences'&&typeof body.enabled!=='boolean'))throw new AuthError('invalid_options');
        }
        return Response.json({value:await run(body)},{headers});
      }catch(error){
        const safe=error instanceof AuthError||error instanceof LlmError?error:new AuthError('invalid_response');
        return Response.json({error:{code:safe.code,message:safe.message,...safe.failure?.status?{status:safe.failure.status}:{}}},{status:400,headers});
      }
    }});
  }
  ctx.effect(()=>async()=>{adapter.dispose();await controller.dispose();await transport.close();});
}
