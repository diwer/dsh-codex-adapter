import path from 'node:path';
import {homedir} from 'node:os';
import {ChatGPTPlanAdapter} from '../src/plugin.mjs';
import {createAuthClient,FileCredentialStore} from '../src/auth/index.mjs';
import {DesktopAccountController} from '../src/desktop-controller.mjs';
import {PROVIDER} from '../src/adapter.mjs';
const directory=process.argv[2]??path.join(homedir(),'.dsh','plugin-data','dsh-codex-official-adapter','auth');
const store=new FileCredentialStore({directory});
const controller=new DesktopAccountController({store,auth:createAuthClient({store})});
const adapter=new ChatGPTPlanAdapter({session:controller});
try{console.log(JSON.stringify({models:await adapter.listModels(PROVIDER)},null,2));}finally{adapter.dispose();await controller.dispose();}
