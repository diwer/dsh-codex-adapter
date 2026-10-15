import path from 'node:path';
import {homedir} from 'node:os';
import {ChatGPTPlanAdapter} from '../src/plugin.mjs';
import {createAuthClient,FileCredentialStore} from '../src/auth/index.mjs';
import {DesktopAccountController} from '../src/desktop-controller.mjs';
import {PROVIDER} from '../src/adapter.mjs';
import {createDesktopFetch} from '../src/desktop-fetch.mjs';
const directory=process.argv[2]??path.join(homedir(),'.dsh','plugin-data','dsh-codex-official-adapter','auth');
const store=new FileCredentialStore({directory});
const transport=createDesktopFetch();
const controller=new DesktopAccountController({store,auth:createAuthClient({store,fetchImpl:transport.fetch})});
const adapter=new ChatGPTPlanAdapter({session:controller,fetchImpl:transport.fetch});
try{console.log(JSON.stringify({models:await adapter.listModels(PROVIDER)},null,2));}finally{adapter.dispose();await controller.dispose();await transport.close();}
