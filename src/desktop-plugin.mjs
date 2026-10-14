import path from 'node:path';
import {homedir} from 'node:os';
import Schema from '@deepseek-ai/schemastery';
import {ChatGPTPlanAdapter} from './plugin.mjs';
import {PROVIDER} from './adapter.mjs';
import {createAuthClient,FileCredentialStore,AuthError} from './auth/index.mjs';
import {DesktopAccountController} from './desktop-controller.mjs';

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
  const auth=createAuthClient({store,authorizationTimeoutMs:config.authorizationTimeoutMs});
  const controller=new DesktopAccountController({auth,store,onChange:()=>ctx.emit('llm/adapters-updated')});
  const adapter=new ChatGPTPlanAdapter({...config,session:controller});
  const listModels=adapter.listModels.bind(adapter);
  adapter.listModels=async provider=>{
    try{return await listModels(provider);}catch(error){if(['not_signed_in','account_mismatch','plan_permission_missing','reauthentication_required'].includes(error.code))return [];throw error;}
  };
  ctx.llm.registerAdapter([PROVIDER],adapter);
  const routes={
    status:{method:'GET',run:()=>controller.status()},
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
          if(Object.keys(body).some(key=>key!=='accountId') || (!['select','logout'].includes(action)&&Object.keys(body).length))throw new AuthError('invalid_options');
        }
        return Response.json({value:await run(body)},{headers});
      }catch(error){
        const safe=error instanceof AuthError?error:new AuthError('invalid_response');
        return Response.json({error:{code:safe.code,message:safe.message}},{status:400,headers});
      }
    }});
  }
  ctx.effect(()=>()=>{adapter.dispose();return controller.dispose();});
}
