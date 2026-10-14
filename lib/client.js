window.__ModuleLoader__.load({id:'dsh-codex-official-adapter',factory:(require)=>{
  const React=require('react');
  const h=React.createElement;
  const name='dsh-codex-official-adapter';
  const inject=['slots'];
  async function request(action,body){
    const response=await fetch('/api/dsh-chatgpt-plan/'+action,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
    const data=await response.json();if(!response.ok||data.error)throw new Error(data.error?.message||'请求失败。');return data.value;
  }
  const style={padding:'24px',maxWidth:'760px',lineHeight:1.65};
  const buttonStyle={padding:'8px 14px',border:'1px solid var(--dsw-color-border,#bbb)',borderRadius:'8px',cursor:'pointer',background:'transparent',color:'inherit',marginRight:'8px'};
  function Settings(){
    const [state,setState]=React.useState(null),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false),[url,setUrl]=React.useState(''),[models,setModels]=React.useState([]);
    const mounted=React.useRef(true);
    const refresh=React.useCallback(async()=>{try{const value=await request('status');if(mounted.current){setState(value);if(value.authorizationUrl)setUrl(value.authorizationUrl);if(value.phase!=='signing-in')setUrl('');}}catch(e){if(mounted.current)setError(e.message);}},[]);
    React.useEffect(()=>{mounted.current=true;void refresh();const timer=setInterval(refresh,2000);return()=>{mounted.current=false;clearInterval(timer);};},[refresh]);
    const act=async operation=>{setBusy(true);setError('');try{await operation();await refresh();}catch(e){if(mounted.current)setError(e.message);}finally{if(mounted.current)setBusy(false);}};
    const login=()=>act(async()=>{const value=await request('login',{});setUrl(value.url);});
    const selected=state?.accounts.find(a=>a.accountId===state.selectedAccountId);
    const remaining=state?.expiresAt?Math.max(0,Math.ceil((state.expiresAt-Date.now())/1000)):0;
    return h('section',{style},
      h('h2',null,'ChatGPT 订阅'),
      h('p',null,'在 DeepSeek Harness 中使用你的 ChatGPT 订阅模型。登录与授权由 OpenAI 提供。'),
      h('label',{style:{display:'block',marginBottom:'12px'}},h('input',{type:'checkbox',checked:state?.defaultGptEnabled!==false,disabled:busy||!state||state.defaultModelUnavailable,onChange:event=>{const enabled=event.target.checked;void act(()=>request('preferences',{enabled}));}}),' 新会话默认使用 GPT（可关闭）'),
      h('p',{style:{fontSize:'13px',opacity:.75}},'开启后，授权就绪时将 GPT 设为新会话默认模型；关闭后恢复原默认模型。已有会话保持当前模型，DeepSeek 和 GPT 均可在模型选择器中手动切换。'),
      h('p',null,state?.phase==='ready'?'已登录'+(selected?.email?'：'+selected.email:''):state?.phase==='signing-in'?'等待你在浏览器完成授权…':'尚未连接 ChatGPT 订阅。'),
      h('p',{style:{fontSize:'13px',opacity:.75}},'授权后，本插件会将登录凭证保存在本机仅本人可读的文件中；文件未加密。真实请求使用 ChatGPT 订阅额度。'),
      h('div',null,h('button',{style:buttonStyle,disabled:busy,onClick:login},state?.phase==='signing-in'?'显示授权链接':state?.error?.code==='expired_attempt'?'重新发起授权':'Continue with ChatGPT'),
        state?.phase==='signing-in'&&h('button',{style:buttonStyle,disabled:busy,onClick:()=>act(async()=>{setUrl('');const value=await request('restart',{});setUrl(value.url);})},'重新发起授权'),
        state?.phase==='signing-in'&&h('button',{style:buttonStyle,disabled:busy,onClick:()=>act(()=>request('cancel',{}))},'取消授权')),
      state?.phase==='signing-in'&&h('p',null,'授权剩余时间：'+Math.floor(remaining/60)+' 分 '+remaining%60+' 秒。请在倒计时结束前完成浏览器授权；超时后需重新发起。'),
      url&&state?.phase==='signing-in'&&remaining>0&&h('div',{style:{marginTop:'16px'}},h('p',null,'请在浏览器中打开授权链接并完成登录：'),
        h('button',{style:buttonStyle,onClick:()=>act(()=>navigator.clipboard.writeText(url))},'复制授权链接'),
        h('a',{href:url,target:'_blank',rel:'noreferrer noopener'},'打开 OpenAI 授权页')),
      state?.accounts.length>0&&h('div',{style:{marginTop:'20px'}},h('h3',null,'本插件的账户'),...state.accounts.map(account=>h('div',{key:account.accountId,style:{marginBottom:'12px'}},
        h('span',null,(account.email||'ChatGPT 账户')+' · '+(account.signedIn?(account.planUsageEnabled?'订阅已授权':'未授予订阅调用权限'):'已退出')),
        account.accountId!==state.selectedAccountId&&account.signedIn&&account.planUsageEnabled&&h('button',{style:buttonStyle,disabled:busy,onClick:()=>act(()=>request('select',{accountId:account.accountId}))},'使用此账户'),
        account.signedIn&&h('button',{style:buttonStyle,disabled:busy,onClick:()=>act(async()=>{const result=await request('logout',{accountId:account.accountId});setModels([]);if(!result.remoteRevoked)throw Error('本机已退出，但远程撤销未确认。请到 ChatGPT 设置中断开此应用。');})},'退出')))),
      state?.phase==='ready'&&h('div',{style:{marginTop:'20px'}},h('button',{style:buttonStyle,disabled:busy,onClick:()=>act(async()=>setModels(await request('models')))},'刷新可用模型'),
        h('p',null,'在新建会话的模型选择器中选择 “ChatGPT plan (Sign in with ChatGPT)” 下的模型。'),
        models.length>0&&h('ul',null,...models.map(model=>h('li',{key:model.id},model.name+' · '+model.id)))),
      (error||state?.error?.message||state?.modelError?.message)&&h('p',{role:'alert',style:{color:'#b42318'}},error||state?.error?.message||state?.modelError?.message));
  }
  function apply(ctx){ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'chatgpt-plan',order:15,label:()=> 'ChatGPT 订阅'},Settings));}
  return {name,inject,apply};
}});
