import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';
import {ChatGPTPlanAdapter} from '../src/plugin.mjs';
import {createAuthClient, FileCredentialStore} from '../src/auth/index.mjs';
import {PROVIDER} from '../src/adapter.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [directory, requestedModel]=process.argv.slice(2);
if(!directory || !path.isAbsolute(directory)) throw new Error('Pass the absolute directory used by this app’s login.');
const auth=createAuthClient({store:new FileCredentialStore({directory})});
const accounts=(await auth.accounts()).filter(account=>account.planUsageEnabled && account.signedIn);
if(accounts.length!==1) throw new Error('Exactly one signed-in ChatGPT-plan account is required; complete this app’s OAuth first.');
const adapter=new ChatGPTPlanAdapter({session:auth.session(accounts[0].accountId)});
try {
  const models=await adapter.listModels(PROVIDER);
  if(!requestedModel){console.log(JSON.stringify({models},null,2));process.exitCode=0;}
  else {
    if(!models.some(model=>model.id===requestedModel)) throw new Error('Choose a model returned by this account’s catalog.');
    const patch=[{insert:[{id:'chatgpt-plan',name:path.join(root,'src/plugin.mjs'),config:{credentialDirectory:directory,accountId:accounts[0].accountId,modelCapabilities:{}}}]},
      {id:'agent-default-model',config:{provider:PROVIDER,model:requestedModel}},
      {id:'session-title-llm',disabled:true},{id:'llm-deepseek',disabled:true},{id:'llm-deepseek-account',disabled:true}];
    for(const profile of ['adapter-acceptance','adapter-web']){
      const target=path.join(root,'work/dsh-home/profiles',profile,'cordis.patch.yml');
      await fs.writeFile(target,yaml.dump(patch),{mode:0o600});
    }
    console.log('Both acceptance profiles are configured for the selected account model.');
  }
} finally {adapter.dispose();}
