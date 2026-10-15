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
    setInterval(fn){interval=fn;return 1;},clearInterval(){interval=undefined;},
  };
  vm.runInNewContext(source,context,{filename:'lib/client.js'});
  async function flush(){for(let i=0;i<10;i++){if(dirty){cursor=0;dirty=false;tree=Settings();while(effects.length)effects.shift()();}await new Promise(resolve=>setImmediate(resolve));if(!dirty)return;}throw Error('Component did not settle.');}
  await flush();
  return {get tree(){return tree;},calls,flush,setStatus(value){status=value;},async poll(){await interval();await flush();},async click(node){assert.ok(node,'Control should exist');assert.ok(!node.props.disabled,'Control should be enabled');await node.props.onClick();await flush();},unmount(){for(const hook of hooks)hook?.cleanup?.();}};
}
function nodes(tree,predicate){if(!tree||typeof tree!=='object')return [];return [...(predicate(tree)?[tree]:[]),...tree.children.flatMap(child=>nodes(child,predicate))];}
function text(tree){if(typeof tree==='string'||typeof tree==='number')return String(tree);return tree&&tree.type!=='style'?tree.children.map(text).join(''):'';}
function button(ui,label){return nodes(ui.tree,node=>node.type==='button'&&text(node)===label)[0];}

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
