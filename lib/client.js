window.__ModuleLoader__.load({id:'dsh-codex-official-adapter',factory:(require)=>{
  const React=require('react');
  const h=React.createElement;
  const name='dsh-codex-official-adapter';
  const inject=['slots'];
  async function request(action,body){
    const response=await fetch('/api/dsh-chatgpt-plan/'+action,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
    const data=await response.json();if(!response.ok||data.error)throw new Error(data.error?.message||'请求失败，请稍后重试。');return data.value;
  }
  // All rules are scoped to the settings section; never restyle the host dialog.
  const css=`
.cgp{--cgp-text:light-dark(#202123,#ececf1);--cgp-muted:light-dark(#72747a,#a2a4ad);--cgp-line:light-dark(#e8e9ed,#35363d);--cgp-surface:light-dark(#fff,#202126);--cgp-soft:light-dark(#f7f8fa,#282930);--cgp-hover:light-dark(#f0f1f5,#32333c);--cgp-blue:light-dark(#4166d5,#91aaff);--cgp-blue-bg:light-dark(#edf2ff,#283551);--cgp-green:light-dark(#28794b,#8bcca5);--cgp-green-bg:light-dark(#eff8f2,#24392d);--cgp-danger:light-dark(#b33d36,#f4a29d);box-sizing:border-box;width:100%;max-width:752px;padding:24px 28px 32px;color:var(--cgp-text);font-family:inherit;font-size:14px;line-height:1.5;text-align:left}
.cgp *{box-sizing:border-box}.cgp h2,.cgp h3,.cgp p{margin:0}.cgp h2{font-size:20px;font-weight:600;line-height:1.4;letter-spacing:-.3px}.cgp h3{font-size:14px;font-weight:600;line-height:1.5}
.cgp .cgp-intro{margin-top:6px;color:var(--cgp-muted);font-size:13px;line-height:1.6}.cgp .cgp-card{margin-top:24px;border:1px solid var(--cgp-line);border-radius:12px;background:var(--cgp-surface);overflow:hidden}.cgp .cgp-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--cgp-line)}
.cgp .cgp-badge{display:inline-flex;align-items:center;gap:6px;flex-shrink:0;padding:3px 8px;border-radius:6px;background:var(--cgp-soft);color:var(--cgp-muted);font-size:11px;font-weight:500;white-space:nowrap}.cgp .cgp-badge[data-tone=ready]{background:var(--cgp-green-bg);color:var(--cgp-green)}.cgp .cgp-badge[data-tone=waiting]{background:var(--cgp-blue-bg);color:var(--cgp-blue)}.cgp .cgp-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.cgp .cgp-account{display:flex;align-items:center;gap:12px;padding:16px 18px}.cgp .cgp-account+.cgp-account{border-top:1px solid var(--cgp-line)}.cgp .cgp-avatar{display:flex;align-items:center;justify-content:center;flex:0 0 36px;height:36px;border-radius:10px;background:var(--cgp-soft);color:var(--cgp-muted);font-size:14px;font-weight:600}.cgp .cgp-account-info{flex:1;min-width:0}.cgp .cgp-email{font-size:13px;font-weight:500;overflow-wrap:anywhere}.cgp .cgp-caption{margin-top:3px;color:var(--cgp-muted);font-size:12px;line-height:1.6}.cgp .cgp-empty{padding:24px 18px}.cgp .cgp-empty-title{font-size:14px;font-weight:500}.cgp .cgp-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.cgp .cgp-card-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:12px 18px;border-top:1px solid var(--cgp-line);background:var(--cgp-soft)}
.cgp .cgp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:6px 11px;margin:0;border:1px solid var(--cgp-line);border-radius:8px;background:var(--cgp-surface);color:var(--cgp-text);font:inherit;font-size:12px;font-weight:500;line-height:18px;text-decoration:none;white-space:nowrap;cursor:pointer;transition:background .15s,border-color .15s}.cgp .cgp-btn:hover:not(:disabled){background:var(--cgp-hover)}.cgp .cgp-btn-primary{background:var(--cgp-blue);color:light-dark(#fff,#192340);border-color:transparent}.cgp .cgp-btn-primary:hover:not(:disabled){background:var(--cgp-blue);filter:brightness(.95)}.cgp .cgp-btn-quiet{background:transparent;border-color:transparent;color:var(--cgp-muted)}.cgp .cgp-btn-danger:hover:not(:disabled){color:var(--cgp-danger)}.cgp button:disabled{opacity:.45;cursor:not-allowed}.cgp button:focus-visible,.cgp a:focus-visible,.cgp summary:focus-visible{outline:2px solid var(--cgp-blue);outline-offset:3px}
.cgp .cgp-auth{padding:16px 18px;border-top:1px solid var(--cgp-line);background:var(--cgp-blue-bg)}.cgp .cgp-auth p{font-size:13px}.cgp .cgp-auth .cgp-actions{margin-top:12px}.cgp .cgp-countdown{font-variant-numeric:tabular-nums;font-size:12px;color:var(--cgp-muted);margin-top:8px}
.cgp .cgp-section{margin-top:24px}.cgp .cgp-preference{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0;border-bottom:1px solid var(--cgp-line)}.cgp .cgp-setting-title{font-size:13px;font-weight:500}.cgp .cgp-switch{position:relative;flex:0 0 34px;width:34px;height:20px;padding:0;border:0;border-radius:12px;background:light-dark(#cbced6,#50535e);cursor:pointer;transition:background .15s}.cgp .cgp-switch[aria-checked=true]{background:var(--cgp-blue)}.cgp .cgp-switch-thumb{display:block;width:16px;height:16px;margin-left:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0002;transition:transform .15s}.cgp .cgp-switch[aria-checked=true] .cgp-switch-thumb{transform:translateX(14px)}
.cgp .cgp-model-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.cgp .cgp-model-list{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:12px 0 0;padding:0}.cgp .cgp-model{max-width:100%;padding:5px 9px;border:1px solid var(--cgp-line);border-radius:6px;font-size:12px;overflow-wrap:anywhere}.cgp .cgp-model-id{color:var(--cgp-muted);font-size:11px}.cgp .cgp-notice{margin-top:20px;padding:12px 14px;border-radius:8px;background:var(--cgp-soft);color:var(--cgp-danger);font-size:12px;overflow-wrap:anywhere}.cgp .cgp-notice .cgp-btn{margin-top:8px}.cgp .cgp-details{margin-top:24px;color:var(--cgp-muted);font-size:12px;line-height:1.7}.cgp .cgp-details summary{width:fit-content;cursor:pointer}.cgp .cgp-details p{margin-top:8px}
@media(prefers-color-scheme:dark){.cgp{color-scheme:dark}}:root[data-theme=light] .cgp,.light .cgp{color-scheme:light}:root[data-theme=dark] .cgp,.dark .cgp{color-scheme:dark}
@media(max-width:640px){.cgp{padding:20px 16px 28px}.cgp .cgp-account{flex-wrap:wrap}.cgp .cgp-account>.cgp-actions{width:100%;padding-left:48px}.cgp .cgp-card-head,.cgp .cgp-account,.cgp .cgp-card-footer,.cgp .cgp-auth{padding-left:14px;padding-right:14px}}
@media(prefers-reduced-motion:reduce){.cgp .cgp-btn,.cgp .cgp-switch,.cgp .cgp-switch-thumb{transition:none}}
`;
  function Settings(){
    const [state,setState]=React.useState(null),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false),[url,setUrl]=React.useState(''),[models,setModels]=React.useState(null),[copied,setCopied]=React.useState(false);
    const mounted=React.useRef(true);
    const generation=React.useRef(0);
    const refresh=React.useCallback(async()=>{
      const current=++generation.current;
      try{const value=await request('status');if(mounted.current&&current===generation.current){setState(value);setUrl(value.phase==='signing-in'?(value.authorizationUrl||''):'');}}
      catch(e){if(mounted.current&&current===generation.current)setError(e.message);}
    },[]);
    React.useEffect(()=>{mounted.current=true;void refresh();const timer=setInterval(refresh,2000);return()=>{mounted.current=false;generation.current++;clearInterval(timer);};},[refresh]);
    React.useEffect(()=>{setModels(null);},[state?.selectedAccountId]);
    React.useEffect(()=>{setCopied(false);},[url]);
    const act=async operation=>{setBusy(true);setError('');try{await operation();await refresh();}catch(e){if(mounted.current)setError(e.message);}finally{if(mounted.current)setBusy(false);}};
    const login=()=>act(async()=>{const value=await request('login',{});if(mounted.current)setUrl(value.url);});
    const restart=()=>act(async()=>{setUrl('');const value=await request('restart',{});if(mounted.current)setUrl(value.url);});
    const signing=state?.phase==='signing-in',ready=state?.phase==='ready';
    const accounts=state?.accounts??[];
    const remaining=state?.expiresAt?Math.max(0,Math.ceil((state.expiresAt-Date.now())/1000)):0;
    const issue=error||state?.error?.message||state?.modelError?.message;
    const button=(label,onClick,variant='',disabled=busy)=>h('button',{type:'button',className:'cgp-btn '+variant,disabled,onClick},label);
    const status=!state?'读取中':signing?'等待授权':ready?'已连接':state.phase==='attention'?'需要处理':'未连接';
    return h('section',{className:'cgp','aria-label':'ChatGPT 订阅设置','aria-busy':busy},
      h('style',null,css),
      h('header',null,h('h2',null,'ChatGPT 订阅'),h('p',{className:'cgp-intro'},'连接你的 ChatGPT 账户，在 Harness 中使用订阅模型。')),
      h('section',{className:'cgp-card','aria-label':'账户连接'},
        h('div',{className:'cgp-card-head'},h('h3',null,'账户连接'),h('span',{className:'cgp-badge','data-tone':ready?'ready':signing?'waiting':'neutral',role:'status'},h('span',{className:'cgp-dot','aria-hidden':true}),status)),
        accounts.length?accounts.map(account=>h('div',{key:account.accountId,className:'cgp-account'},
          h('div',{className:'cgp-avatar','aria-hidden':true},(account.email||'G').slice(0,1).toUpperCase()),
          h('div',{className:'cgp-account-info'},h('p',{className:'cgp-email'},account.email||'ChatGPT 账户'),h('p',{className:'cgp-caption'},(account.accountId===state.selectedAccountId?'当前账户 · ':'')+(account.signedIn?(account.planUsageEnabled?'订阅已授权':'未授予订阅调用权限'):'已退出'))),
          h('div',{className:'cgp-actions'},
            account.accountId!==state.selectedAccountId&&account.signedIn&&account.planUsageEnabled&&button('切换账户',()=>act(()=>request('select',{accountId:account.accountId}))),
            account.signedIn&&button('退出',()=>act(async()=>{const result=await request('logout',{accountId:account.accountId});if(mounted.current)setModels(null);if(!result.remoteRevoked)throw Error('本机已退出，远程撤销尚未确认。请到 ChatGPT 设置中断开此应用。');}),'cgp-btn-quiet cgp-btn-danger')))):
          h('div',{className:'cgp-empty'},h('p',{className:'cgp-empty-title'},state?'尚未连接账户':'正在读取账户状态…'),h('p',{className:'cgp-caption'},'登录与授权由 OpenAI 提供，无需填写 API Key。')),
        signing&&h('div',{className:'cgp-auth'},h('p',null,remaining>0?'在浏览器中完成 OpenAI 授权，完成后将自动连接。':'授权等待已结束，请重新发起授权。'),
          h('div',{className:'cgp-actions'},url&&remaining>0&&h('a',{className:'cgp-btn cgp-btn-primary',href:url,target:'_blank',rel:'noreferrer noopener'},'打开授权页面 ↗'),
            url&&remaining>0&&button(copied?'已复制链接':'复制链接',()=>act(async()=>{await navigator.clipboard.writeText(url);if(mounted.current)setCopied(true);})),
            button('重新授权',restart,'cgp-btn-quiet'),button('取消',()=>act(()=>request('cancel',{})),'cgp-btn-quiet')),
          remaining>0&&h('div',{className:'cgp-countdown'},'链接有效期 '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'))),
        !signing&&h('div',{className:'cgp-card-footer'},h('p',{className:'cgp-caption'},ready?'请求使用当前账户的 ChatGPT 订阅额度。':'使用你自己的 ChatGPT 订阅。'),button(ready?'添加账户':state?.error?.code==='expired_attempt'?'重新授权':'连接 ChatGPT',login,ready?'':'cgp-btn-primary',busy||!state))),
      h('section',{className:'cgp-section','aria-label':'使用偏好'},
        h('h3',null,'使用偏好'),h('div',{className:'cgp-preference'},
          h('div',null,h('p',{id:'cgp-default-label',className:'cgp-setting-title'},'新会话默认使用 GPT'),h('p',{id:'cgp-default-help',className:'cgp-caption'},'关闭后恢复原默认模型，不影响已有会话。',state?.defaultModelUnavailable?' 当前暂不可修改。':'')),
          h('button',{type:'button',role:'switch',className:'cgp-switch','aria-checked':state?.defaultGptEnabled!==false,'aria-labelledby':'cgp-default-label','aria-describedby':'cgp-default-help',disabled:busy||!state||state.defaultModelUnavailable,onClick:()=>act(()=>request('preferences',{enabled:state?.defaultGptEnabled===false}))},h('span',{className:'cgp-switch-thumb','aria-hidden':true})))),
      ready&&h('section',{className:'cgp-section','aria-label':'可用模型'},h('div',{className:'cgp-model-head'},h('h3',null,'可用模型'),button('刷新模型',()=>act(async()=>{const value=await request('models');if(mounted.current)setModels(value);}),'cgp-btn-quiet')),
        h('p',{className:'cgp-caption'},'在模型选择器的「ChatGPT plan」中选择模型，可随时与 DeepSeek 切换。'),
        models!==null&&h('div',{'aria-live':'polite'},models.length?h('ul',{className:'cgp-model-list'},...models.map(model=>h('li',{key:model.id,className:'cgp-model'},model.name,h('span',{className:'cgp-model-id'},' · '+model.id)))):h('p',{className:'cgp-caption'},'当前账户暂无可用模型。'))),
      issue&&h('div',{className:'cgp-notice',role:'alert'},h('p',null,issue),button('重试连接状态',()=>act(refresh),'cgp-btn-quiet')),
      h('details',{className:'cgp-details'},h('summary',null,'隐私与使用说明'),h('p',null,'登录凭证仅保存在本机、仅本人可读的文件中，文件未加密。本插件不读取其他应用的登录信息。'),h('p',null,'已有会话保持当前模型；你可以在模型选择器中手动切换。订阅权限及可用额度以 OpenAI 账户为准。')));
  }
  function apply(ctx){ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'chatgpt-plan',order:15,label:()=> 'ChatGPT 订阅'},Settings));}
  return {name,inject,apply};
}});
