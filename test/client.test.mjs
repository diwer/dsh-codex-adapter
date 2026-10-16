import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../lib/client.js',import.meta.url),'utf8');
const ready=()=>({phase:'ready',selectedAccountId:'a',defaultGptEnabled:true,accounts:[{accountId:'a',email:'demo@example.test',signedIn:true,planUsageEnabled:true}]});

// Dependency-free component harness. It exercises the shipped module and effects,
// not a duplicate template, without accessing any live account or browser session.
async function mount(initial,handlers={}){
  let status=initial,tree,Settings,cursor=0,dirty=true,interval;
  const hooks=[],effects=[],calls=[];
  const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
  const React={
    createElement:(type,props,...children)=>({type,props:props??{},children:children.flat(Infinity).filter(value=>value!==null&&value!==undefined&&value!==false)}),
    useState(value){const index=cursor++;if(!(index in hooks))hooks[index]=value;return [hooks[index],next=>{const value=typeof next==='function'?next(hooks[index]):next;if(!Object.is(value,hooks[index])){hooks[index]=value;dirty=true;}}];},
    useRef(value){const index=cursor++;return hooks[index]??(hooks[index]={current:value});},
    useCallback(fn,deps){const index=cursor++;if(!same(hooks[index]?.deps,deps))hooks[index]={fn,deps};return hooks[index].fn;},
    useEffect(fn,deps){const index=cursor++;if(!same(hooks[index]?.deps,deps)){const previous=hooks[index];hooks[index]={deps,cleanup:previous?.cleanup};effects.push(()=>{previous?.cleanup?.();hooks[index].cleanup=fn();});}},
  };
  const context={window:{__ModuleLoader__:{load({factory}){const plugin=factory(id=>{assert.equal(id,'react');return React;});plugin.apply({slots:{inject(slot,register){assert.ok(['settings.section','shell.overlay'].includes(slot));register();},register(metadata,component){if(metadata.name==='settings.section'){assert.equal(metadata.id,'chatgpt-plan');Settings=component;}}}});}}},
    fetch:async(url,init)=>{const action=url.split('/').at(-1);const body=init.body?JSON.parse(init.body):undefined;calls.push({action,body,init});const value=handlers[action]?await handlers[action](body):action==='status'?status:action==='models'?[]:undefined;return {ok:true,json:async()=>({value})};},
    navigator:{clipboard:{writeText:async value=>{calls.push({action:'clipboard',value});}}},
    document:{getElementById:id=>({focus(){calls.push({action:'focus',id});}})},
    setInterval(fn){interval=fn;return 1;},clearInterval(){interval=undefined;},
  };
  vm.runInNewContext(source,context,{filename:'lib/client.js'});
  async function flush(){for(let i=0;i<10;i++){if(dirty){cursor=0;dirty=false;tree=Settings();while(effects.length)effects.shift()();}await new Promise(resolve=>setImmediate(resolve));if(!dirty)return;}throw Error('Component did not settle.');}
  await flush();
  return {get tree(){return tree;},calls,flush,setStatus(value){status=value;},async poll(){await interval();await flush();},async key(node,key){let prevented=false;node.props.onKeyDown({key,preventDefault(){prevented=true;}});await flush();return prevented;},async change(node,value){assert.ok(node);assert.ok(!node.props.disabled);node.props.onChange({target:{value}});await flush();},async click(node){assert.ok(node,'Control should exist');assert.ok(!node.props.disabled,'Control should be enabled');await node.props.onClick();await flush();},unmount(){for(const hook of hooks)hook?.cleanup?.();}};
}
function nodes(tree,predicate,includeHidden=false){if(!tree||typeof tree!=='object'||(tree.props.hidden&&!includeHidden))return [];return [...(predicate(tree)?[tree]:[]),...tree.children.flatMap(child=>nodes(child,predicate,includeHidden))];}
function text(tree){if(typeof tree==='string'||typeof tree==='number')return String(tree);return tree&&tree.type!=='style'&&!tree.props.hidden?tree.children.map(text).join(''):'';}
function button(ui,label){return nodes(ui.tree,node=>node.type==='button'&&text(node)===label)[0];}
function field(ui,id){return nodes(ui.tree,node=>node.props.id===id)[0];}

test('the current account offers the official subscription usage page next to its identity without making quota requests',async()=>{
  const status=ready();
  status.accounts.push({accountId:'b',email:'other@example.test',signedIn:true,planUsageEnabled:true});
  const ui=await mount(status);
  try{
    const usageLink=()=>nodes(ui.tree,node=>node.type==='a'&&text(node)==='查看订阅额度与用量 ↗');
    assert.equal(usageLink().length,1);
    assert.equal(usageLink()[0].props.href,'https://chatgpt.com/settings/usage');
    assert.equal(usageLink()[0].props.target,'_blank');assert.equal(usageLink()[0].props.rel,'noreferrer noopener');
    assert.match(usageLink()[0].props.title,/当前登录的账户/);
    const accountWithLink=()=>nodes(ui.tree,node=>node.props.className==='cgp-account-info'&&nodes(node,item=>item===usageLink()[0]).length)[0];
    assert.match(text(accountWithLink()),/demo@example.test当前账户 · 订阅已授权/);
    const footer=nodes(ui.tree,node=>node.props.className==='cgp-card-footer')[0];
    assert.equal(nodes(footer,node=>node.type==='a').length,0);
    assert.equal(ui.calls.some(call=>/usage|quota/.test(call.action)),false);
    await ui.click(button(ui,'配置代理'));assert.equal(usageLink().length,0);
    await ui.click(button(ui,'获取授权'));assert.equal(usageLink().length,1);
    ui.setStatus({...status,selectedAccountId:'b'});await ui.poll();
    assert.equal(usageLink().length,1);assert.match(text(accountWithLink()),/other@example.test当前账户 · 订阅已授权/);
  }finally{ui.unmount();}
});

test('disconnected accounts do not imply that subscription quota has been loaded',async()=>{
  const ui=await mount({phase:'not-signed-in',accounts:[]});
  try{
    assert.equal(nodes(ui.tree,node=>node.type==='a'&&node.props.href==='https://chatgpt.com/settings/usage').length,0);
    assert.doesNotMatch(text(ui.tree),/剩余|已用.*%|查看订阅额度与用量/);
  }finally{ui.unmount();}
});

test('settings default to authorization and keep the plugin icon visible on both tabs',async()=>{
  const ui=await mount(ready());
  try{
    assert.equal(button(ui,'获取授权').props['aria-selected'],true);assert.equal(button(ui,'配置代理').props.tabIndex,-1);
    assert.ok(button(ui,'退出'));assert.equal(field(ui,'cgp-network-mode'),undefined);
    const icon=()=>nodes(ui.tree,node=>node.type==='header')[0].children.find(child=>child.type==='img');
    assert.equal(icon().props.src,'/api/dsh-chatgpt-plan/icon');
    await ui.click(button(ui,'配置代理'));
    assert.ok(field(ui,'cgp-network-mode'));assert.equal(button(ui,'退出'),undefined);assert.equal(icon().props.src,'/api/dsh-chatgpt-plan/icon');
    const panels=nodes(ui.tree,node=>node.props.role==='tabpanel');assert.equal(panels.length,1);assert.equal(panels[0].props['aria-labelledby'],button(ui,'配置代理').props.id);assert.equal(button(ui,'配置代理').props['aria-controls'],panels[0].props.id);
  }finally{ui.unmount();}
});

test('settings tabs support arrow keys, Home and End with matching keyboard focus',async()=>{
  const ui=await mount(ready());
  try{
    assert.equal(await ui.key(button(ui,'获取授权'),'ArrowRight'),true);assert.equal(button(ui,'配置代理').props['aria-selected'],true);
    assert.equal(ui.calls.at(-1).id,'cgp-tab-proxy');
    await ui.key(button(ui,'配置代理'),'ArrowRight');assert.equal(button(ui,'获取授权').props['aria-selected'],true);
    await ui.key(button(ui,'获取授权'),'ArrowLeft');assert.equal(button(ui,'配置代理').props['aria-selected'],true);
    await ui.key(button(ui,'配置代理'),'Home');assert.equal(button(ui,'获取授权').props['aria-selected'],true);
    await ui.key(button(ui,'获取授权'),'End');assert.equal(button(ui,'配置代理').props['aria-selected'],true);
    assert.equal(await ui.key(button(ui,'配置代理'),'ArrowDown'),false);
  }finally{ui.unmount();}
});

test('switching tabs preserves a proxy draft and an in-flight connectivity test',async()=>{
  let finish;const result=new Promise(resolve=>{finish=resolve;});
  const ui=await mount({...ready(),network:{mode:'environment',proxyUrl:''}},{'network-test':()=>result});
  try{
    await ui.click(button(ui,'配置代理'));await ui.change(field(ui,'cgp-network-mode'),'proxy');await ui.change(field(ui,'cgp-proxy-url'),'http://127.0.0.1:8080');
    const checking=ui.click(button(ui,'测试连接'));await ui.flush();
    await ui.click(button(ui,'获取授权'));await ui.poll();assert.ok(button(ui,'退出'));
    finish({ok:true,checks:[{service:'authorization',ok:true,durationMs:1},{service:'models',ok:true,durationMs:2}]});await checking;
    await ui.click(button(ui,'配置代理'));assert.equal(field(ui,'cgp-proxy-url').props.value,'http://127.0.0.1:8080');assert.match(text(ui.tree),/均可连接/);
    assert.equal(ui.calls.filter(call=>call.action==='network-test').length,1);assert.equal(ui.calls.some(call=>call.action==='network'),false);
  }finally{ui.unmount();}
});

test('authorization continues in the background without switching the selected proxy tab',async()=>{
  const authorizationUrl='https://auth.openai.com/api/accounts/authorize?test=1';
  const ui=await mount({phase:'signing-in',accounts:[],authorizationUrl,expiresAt:Date.now()+60000});
  try{
    await ui.click(button(ui,'配置代理'));ui.setStatus(ready());await ui.poll();
    assert.equal(button(ui,'配置代理').props['aria-selected'],true);assert.equal(button(ui,'退出'),undefined);
    await ui.click(button(ui,'获取授权'));assert.ok(button(ui,'退出'));assert.match(text(ui.tree),/当前账户 · 订阅已授权/);assert.equal(button(ui,'重新授权'),undefined);
    assert.equal(ui.calls.some(call=>['login','restart','cancel'].includes(call.action)),false);
  }finally{ui.unmount();}
});

test('independent proxy drafts survive status polling and save immediately refreshes model discovery',async()=>{
  const status={...ready(),network:{mode:'environment',proxyUrl:''}};
  const ui=await mount(status,{network:async value=>{status.network=value;return value;}});
  try{
    await ui.click(button(ui,'配置代理'));
    await ui.change(field(ui,'cgp-network-mode'),'proxy');
    await ui.change(field(ui,'cgp-proxy-url'),'http://127.0.0.1:8080');
    await ui.poll();assert.equal(field(ui,'cgp-proxy-url').props.value,'http://127.0.0.1:8080');
    await ui.click(button(ui,'保存并应用'));
    assert.deepEqual(ui.calls.find(call=>call.action==='network').body,{mode:'proxy',proxyUrl:'http://127.0.0.1:8080'});
    assert.match(text(ui.tree),/已保存并立即生效/);
    assert.equal(ui.calls.filter(call=>call.action==='models').length,2);
  }finally{ui.unmount();}
});

test('proxy connection tests use the current draft without saving it',async()=>{
  const ui=await mount({phase:'not-signed-in',accounts:[],network:{mode:'environment',proxyUrl:''}},{'network-test':async()=>({ok:true,checks:[{service:'authorization',ok:true,durationMs:10},{service:'models',ok:true,durationMs:20}]})});
  try{
    await ui.click(button(ui,'配置代理'));
    await ui.change(field(ui,'cgp-network-mode'),'proxy');await ui.change(field(ui,'cgp-proxy-url'),'http://127.0.0.1:8080');
    await ui.click(button(ui,'测试连接'));
    assert.deepEqual(ui.calls.find(call=>call.action==='network-test').body,{mode:'proxy',proxyUrl:'http://127.0.0.1:8080'});
    assert.equal(ui.calls.some(call=>call.action==='network'),false);assert.match(text(ui.tree),/授权服务和模型服务均可连接/);
  }finally{ui.unmount();}
});

test('switching to direct mode clears the saved proxy URL',async()=>{
  const status={...ready(),network:{mode:'proxy',proxyUrl:'http://127.0.0.1:8080'}};
  const ui=await mount(status,{network:async value=>{status.network=value;return value;}});
  try{
    await ui.click(button(ui,'配置代理'));
    await ui.change(field(ui,'cgp-network-mode'),'direct');assert.equal(field(ui,'cgp-proxy-url'),undefined);
    await ui.click(button(ui,'保存并应用'));assert.deepEqual(ui.calls.find(call=>call.action==='network').body,{mode:'direct',proxyUrl:''});
  }finally{ui.unmount();}
});

test('proxy save and connectivity failures leave a repairable draft',async()=>{
  const ui=await mount({...ready(),network:{mode:'environment',proxyUrl:''}},{network:async()=>{throw Error('代理地址无效');},'network-test':async()=>({ok:false,checks:[{service:'authorization',ok:false,message:'连接被拒绝'}]})});
  try{
    await ui.click(button(ui,'配置代理'));
    await ui.change(field(ui,'cgp-network-mode'),'proxy');await ui.change(field(ui,'cgp-proxy-url'),'http://127.0.0.1:8080');
    await ui.click(button(ui,'保存并应用'));assert.match(text(ui.tree),/代理地址无效/);assert.equal(field(ui,'cgp-proxy-url').props.value,'http://127.0.0.1:8080');
    await ui.click(button(ui,'测试连接'));assert.match(text(ui.tree),/连接测试未通过/);assert.match(text(ui.tree),/连接被拒绝/);
    assert.equal(ui.calls.filter(call=>call.action==='models').length,1);
  }finally{ui.unmount();}
});

test('settings renders a compact connected account once and keeps privacy collapsed',async()=>{
  const ui=await mount(ready());
  try{
    assert.equal((text(ui.tree).match(/demo@example.test/g)||[]).length,1);
    assert.match(text(ui.tree),/当前账户 · 订阅已授权/);
    assert.ok(button(ui,'添加账户'));
    assert.equal(nodes(ui.tree,node=>node.type==='details')[0].props.open,undefined);
    assert.ok(nodes(ui.tree,node=>node.type==='style')[0].children[0].includes('.cgp .cgp-btn'));
    assert.equal(nodes(ui.tree,node=>node.props.role==='switch')[0].props['aria-checked'],true);
  }finally{ui.unmount();}
});
test('disconnected settings connects through the existing authenticated endpoint',async()=>{
  const ui=await mount({phase:'not-signed-in',accounts:[],defaultGptEnabled:false},{login:async()=>({url:'https://auth.openai.com/api/accounts/authorize?test=1'})});
  try{
    assert.ok(button(ui,'连接 ChatGPT'));
    assert.equal(button(ui,'刷新模型'),undefined);
    await ui.click(button(ui,'连接 ChatGPT'));
    const call=ui.calls.find(call=>call.action==='login');
    assert.deepEqual(call.body,{});assert.equal(call.init.credentials,'same-origin');assert.equal(call.init.cache,'no-store');
  }finally{ui.unmount();}
});
test('signed-out registration history does not duplicate the connected account',async()=>{
  const status=ready();status.accounts.unshift({accountId:'old-registration',email:'demo@example.test',signedIn:false,planUsageEnabled:false});
  const ui=await mount(status,{login:async()=>({url:'https://auth.openai.com/api/accounts/authorize?test=1'})});
  try{
    assert.equal((text(ui.tree).match(/demo@example.test/g)||[]).length,1);
    assert.doesNotMatch(text(ui.tree),/已退出/);
    assert.equal(nodes(ui.tree,node=>node.type==='button'&&text(node)==='退出').length,1);
    await ui.click(button(ui,'添加账户'));
    assert.deepEqual(ui.calls.find(call=>call.action==='login').body,{newAccount:true});
  }finally{ui.unmount();}
});
test('signed-out settings show a clean connection state and allow a different account',async()=>{
  const status={phase:'not-signed-in',accounts:[{accountId:'old',email:'old@example.test',signedIn:false,planUsageEnabled:false}]};
  const ui=await mount(status,{login:async()=>({url:'https://auth.openai.com/api/accounts/authorize?test=1'})});
  try{
    assert.doesNotMatch(text(ui.tree),/old@example.test|已退出/);
    assert.match(text(ui.tree),/连接账户，即可开始/);
    await ui.click(button(ui,'连接 ChatGPT'));assert.deepEqual(ui.calls.find(call=>call.action==='login').body,{});
    await ui.click(button(ui,'使用其他账户'));assert.deepEqual(ui.calls.filter(call=>call.action==='login').at(-1).body,{newAccount:true});
  }finally{ui.unmount();}
});
test('distinct signed-in registrations sharing an email remain separate accounts',async()=>{
  const status=ready();status.accounts.push({accountId:'b',email:'demo@example.test',signedIn:true,planUsageEnabled:true});
  const ui=await mount(status);
  try{
    assert.equal((text(ui.tree).match(/demo@example.test/g)||[]).length,2);
    assert.ok(button(ui,'切换账户'));
  }finally{ui.unmount();}
});
test('default GPT preference is an accessible switch and keeps the preference contract',async()=>{
  const status=ready();const ui=await mount(status,{preferences:async({enabled})=>{status.defaultGptEnabled=enabled;return {};}});
  try{
    await ui.click(nodes(ui.tree,node=>node.props.role==='switch')[0]);
    assert.deepEqual(ui.calls.find(call=>call.action==='preferences').body,{enabled:false});
    const toggle=nodes(ui.tree,node=>node.props.role==='switch')[0];
    assert.equal(toggle.props['aria-checked'],false);assert.equal(toggle.props['aria-labelledby'],'cgp-default-label');
  }finally{ui.unmount();}
});
test('unavailable default-model service disables its preference without hiding the reason',async()=>{
  const ui=await mount({...ready(),defaultModelUnavailable:true});
  try{assert.equal(nodes(ui.tree,node=>node.props.role==='switch')[0].props.disabled,true);assert.match(text(ui.tree),/当前暂不可修改/);}finally{ui.unmount();}
});
test('pending authorization offers a safe link, copy feedback, restart and cancellation',async()=>{
  const authorizationUrl='https://auth.openai.com/api/accounts/authorize?test=1';
  const ui=await mount({phase:'signing-in',accounts:[],authorizationUrl,expiresAt:Date.now()+60000},{restart:async()=>({url:authorizationUrl}),cancel:async()=>({})});
  try{
    const link=nodes(ui.tree,node=>node.type==='a')[0];assert.equal(link.props.href,authorizationUrl);assert.equal(link.props.rel,'noreferrer noopener');
    await ui.click(button(ui,'复制链接'));assert.ok(button(ui,'已复制链接'));assert.equal(ui.calls.find(call=>call.action==='clipboard').value,authorizationUrl);
    await ui.click(button(ui,'重新授权'));assert.ok(ui.calls.some(call=>call.action==='restart'));
    await ui.click(button(ui,'取消'));assert.ok(ui.calls.some(call=>call.action==='cancel'));
  }finally{ui.unmount();}
});
test('expired authorization never exposes the stale link',async()=>{
  const ui=await mount({phase:'signing-in',accounts:[],authorizationUrl:'https://auth.openai.com/api/accounts/authorize?expired=1',expiresAt:Date.now()-1000});
  try{assert.equal(nodes(ui.tree,node=>node.type==='a'&&node.props.href?.startsWith('https://auth.openai.com/')).length,0);assert.ok(button(ui,'重新授权'));assert.match(text(ui.tree),/授权等待已结束/);}finally{ui.unmount();}
});
test('model refresh has an explicit empty state and resets when the selected account changes',async()=>{
  let models=[];const ui=await mount(ready(),{models:async()=>models});
  try{
    await ui.click(button(ui,'刷新模型'));assert.match(text(ui.tree),/当前账户暂无可用模型/);
    models=[{id:'model-one',name:'Model One'}];await ui.click(button(ui,'刷新模型'));assert.match(text(ui.tree),/Model One/);
    models=[];models=[{id:'model-two',name:'Model Two'}];ui.setStatus({...ready(),selectedAccountId:'b'});await ui.poll();assert.doesNotMatch(text(ui.tree),/Model One/);assert.match(text(ui.tree),/Model Two/);
  }finally{ui.unmount();}
});
test('switching accounts and logout retain account IDs and remote-revocation warnings',async()=>{
  const status=ready();status.accounts.push({accountId:'b',email:'other@example.test',signedIn:true,planUsageEnabled:true});
  const ui=await mount(status,{select:async()=>({}),logout:async()=>({remoteRevoked:false})});
  try{
    await ui.click(button(ui,'切换账户'));assert.deepEqual(ui.calls.find(call=>call.action==='select').body,{accountId:'b'});
    await ui.click(button(ui,'退出'));assert.deepEqual(ui.calls.find(call=>call.action==='logout').body,{accountId:'a'});
    assert.match(text(nodes(ui.tree,node=>node.props.role==='alert')[0]),/远程撤销尚未确认/);
  }finally{ui.unmount();}
});
test('status failures expose an actionable error and allow retry',async()=>{
  let failed=true;const ui=await mount(null,{status:async()=>{if(failed)throw Error('连接暂不可用');return ready();}});
  try{
    assert.match(text(nodes(ui.tree,node=>node.props.role==='alert')[0]),/连接暂不可用/);
    failed=false;await ui.click(button(ui,'重试连接状态'));assert.equal(nodes(ui.tree,node=>node.props.role==='alert').length,0);assert.ok(button(ui,'添加账户'));
  }finally{ui.unmount();}
});

test('connected models load automatically once per selected account, not on every status poll',async()=>{
  const ui=await mount(ready(),{models:async()=>[{id:'auto',name:'Automatic Model'}]});
  try{
    assert.match(text(ui.tree),/Automatic Model/);
    assert.equal(ui.calls.filter(call=>call.action==='models').length,1);
    await ui.poll();await ui.poll();
    assert.equal(ui.calls.filter(call=>call.action==='models').length,1);
  }finally{ui.unmount();}
});
test('a recovered status poll clears its own error without clearing action failures',async()=>{
  let failed=true;
  const ui=await mount(null,{status:async()=>{if(failed)throw Error('暂时离线');return ready();},preferences:async()=>{throw Error('偏好保存失败');}});
  try{
    assert.match(text(ui.tree),/暂时离线/);failed=false;await ui.poll();
    assert.doesNotMatch(text(ui.tree),/暂时离线/);
    await ui.click(nodes(ui.tree,node=>node.props.role==='switch')[0]);await ui.poll();
    assert.match(text(ui.tree),/偏好保存失败/);
  }finally{ui.unmount();}
});
test('automatic model load failures provide a model retry that actually fetches models',async()=>{
  let failed=true;
  const ui=await mount(ready(),{models:async()=>{if(failed)throw Error('模型服务暂不可用');return [{id:'retry',name:'Recovered Model'}];}});
  try{
    assert.match(text(ui.tree),/模型加载失败/);failed=false;
    await ui.click(button(ui,'重试加载模型'));
    assert.match(text(ui.tree),/Recovered Model/);assert.doesNotMatch(text(ui.tree),/模型加载失败/);
  }finally{ui.unmount();}
});
test('an old account model response cannot replace the newly selected account catalog',async()=>{
  let finishOld;const old=new Promise(resolve=>{finishOld=resolve;});let requests=0;
  const ui=await mount(ready(),{models:async()=>++requests===1?old:[{id:'b-model',name:'Account B Model'}]});
  try{
    ui.setStatus({...ready(),selectedAccountId:'b'});await ui.poll();
    assert.match(text(ui.tree),/Account B Model/);
    finishOld([{id:'a-model',name:'Account A Model'}]);await ui.flush();
    assert.match(text(ui.tree),/Account B Model/);assert.doesNotMatch(text(ui.tree),/Account A Model/);
  }finally{finishOld([]);ui.unmount();}
});
test('logout refreshes account state even when remote revocation is not confirmed',async()=>{
  let status=ready();const ui=await mount(status,{status:async()=>status,logout:async()=>{status={phase:'not-signed-in',accounts:[],defaultGptEnabled:true};return {remoteRevoked:false};}});
  try{
    await ui.click(button(ui,'退出'));
    assert.ok(button(ui,'连接 ChatGPT'));assert.equal(button(ui,'刷新模型'),undefined);
    assert.match(text(ui.tree),/远程撤销尚未确认/);
  }finally{ui.unmount();}
});

test('mascot registers in the shell independently of account settings and never captures clicks',()=>{
  const registered=new Map(),owners=[];
  const React={createElement:(type,props,...children)=>({type,props:props??{},children:children.flat(Infinity)})};
  vm.runInNewContext(source,{window:{__ModuleLoader__:{load({factory}){
    factory(()=>React).apply({slots:{inject(slot,callback){owners.push(slot);callback();},register(options,component){registered.set(options.name,{options,component});}}});
  }}}});
  assert.deepEqual(owners,['shell.overlay','settings.section']);
  const {options,component}=registered.get('shell.overlay');
  assert.equal(options.id,'chatgpt-plan-mascot');
  const tree=component();
  assert.equal(tree.props['aria-label'],'大肥鱼指挥 Codex');
  const img=nodes(tree,node=>node.type==='img')[0];
  assert.equal(img.props.src,'/api/dsh-chatgpt-plan/icon');assert.equal(img.props.draggable,false);
  const css=nodes(tree,node=>node.type==='style')[0].children[0];
  assert.match(css,/position:fixed/);assert.match(css,/right:max\(16px/);assert.match(css,/bottom:max\(16px/);
  assert.match(css,/pointer-events:none!important/);
});
