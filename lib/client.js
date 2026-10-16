window.__ModuleLoader__.load({id:'dsh-codex-official-adapter',factory:(require)=>{
  const React=require('react');
  const h=React.createElement;
  const name='dsh-codex-official-adapter';
  const inject=['slots'];
  async function request(action,body){
    const response=await fetch('/api/dsh-chatgpt-plan/'+action,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
    const data=await response.json();if(!response.ok||data.error){const error=new Error(data.error?.message||'请求失败，请稍后重试。');error.code=data.error?.code;throw error;}return data.value;
  }
  // All rules are scoped to the settings section; never restyle the host dialog.
  const css=`
.cgp{--cgp-text:light-dark(#202123,#ececf1);--cgp-muted:light-dark(#72747a,#a2a4ad);--cgp-line:light-dark(#e8e9ed,#35363d);--cgp-surface:light-dark(#fff,#202126);--cgp-soft:light-dark(#f7f8fa,#282930);--cgp-hover:light-dark(#f0f1f5,#32333c);--cgp-blue:light-dark(#4166d5,#91aaff);--cgp-blue-bg:light-dark(#edf2ff,#283551);--cgp-green:light-dark(#28794b,#8bcca5);--cgp-green-bg:light-dark(#eff8f2,#24392d);--cgp-danger:light-dark(#b33d36,#f4a29d);box-sizing:border-box;width:100%;max-width:752px;padding:24px 28px 32px;color:var(--cgp-text);font-family:inherit;font-size:14px;line-height:1.5;text-align:left}
.cgp *{box-sizing:border-box}.cgp h2,.cgp h3,.cgp p{margin:0}.cgp h2{font-size:20px;font-weight:600;line-height:1.4;letter-spacing:-.3px}.cgp h3{font-size:14px;font-weight:600;line-height:1.5}
.cgp .cgp-heading{display:flex;align-items:flex-start;gap:12px}.cgp .cgp-plugin-icon{flex:0 0 44px;width:44px;height:44px;border-radius:10px;object-fit:cover}
.cgp .cgp-usage-link{display:inline-block;margin-top:4px;color:var(--cgp-blue);font-size:12px;text-decoration:none}.cgp .cgp-usage-link:hover{text-decoration:underline}
.cgp .cgp-intro{margin-top:6px;color:var(--cgp-muted);font-size:13px;line-height:1.6}.cgp .cgp-card{margin-top:24px;border:1px solid var(--cgp-line);border-radius:12px;background:var(--cgp-surface);overflow:hidden}.cgp .cgp-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--cgp-line)}
.cgp .cgp-badge{display:inline-flex;align-items:center;gap:6px;flex-shrink:0;padding:3px 8px;border-radius:6px;background:var(--cgp-soft);color:var(--cgp-muted);font-size:11px;font-weight:500;white-space:nowrap}.cgp .cgp-badge[data-tone=ready]{background:var(--cgp-green-bg);color:var(--cgp-green)}.cgp .cgp-badge[data-tone=waiting]{background:var(--cgp-blue-bg);color:var(--cgp-blue)}.cgp .cgp-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.cgp .cgp-account{display:flex;align-items:center;gap:12px;padding:16px 18px}.cgp .cgp-account+.cgp-account{border-top:1px solid var(--cgp-line)}.cgp .cgp-avatar{display:flex;align-items:center;justify-content:center;flex:0 0 36px;height:36px;border-radius:10px;background:var(--cgp-soft);color:var(--cgp-muted);font-size:14px;font-weight:600}.cgp .cgp-account-info{flex:1;min-width:0}.cgp .cgp-email{font-size:13px;font-weight:500;overflow-wrap:anywhere}.cgp .cgp-caption{margin-top:3px;color:var(--cgp-muted);font-size:12px;line-height:1.6}.cgp .cgp-empty{padding:24px 18px}.cgp .cgp-empty-title{font-size:14px;font-weight:500}.cgp .cgp-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.cgp .cgp-card-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:12px 18px;border-top:1px solid var(--cgp-line);background:var(--cgp-soft)}
.cgp .cgp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:6px 11px;margin:0;border:1px solid var(--cgp-line);border-radius:8px;background:var(--cgp-surface);color:var(--cgp-text);font:inherit;font-size:12px;font-weight:500;line-height:18px;text-decoration:none;white-space:nowrap;cursor:pointer;transition:background .15s,border-color .15s}.cgp .cgp-btn:hover:not(:disabled){background:var(--cgp-hover)}.cgp .cgp-btn-primary{background:var(--cgp-blue);color:light-dark(#fff,#192340);border-color:transparent}.cgp .cgp-btn-primary:hover:not(:disabled){background:var(--cgp-blue);filter:brightness(.95)}.cgp .cgp-btn-quiet{background:transparent;border-color:transparent;color:var(--cgp-muted)}.cgp .cgp-btn-danger:hover:not(:disabled){color:var(--cgp-danger)}.cgp button:disabled{opacity:.45;cursor:not-allowed}.cgp button:focus-visible,.cgp a:focus-visible,.cgp summary:focus-visible{outline:2px solid var(--cgp-blue);outline-offset:3px}
.cgp .cgp-auth{padding:16px 18px;border-top:1px solid var(--cgp-line);background:var(--cgp-blue-bg)}.cgp .cgp-auth p{font-size:13px}.cgp .cgp-auth .cgp-actions{margin-top:12px}.cgp .cgp-countdown{font-variant-numeric:tabular-nums;font-size:12px;color:var(--cgp-muted);margin-top:8px}
.cgp .cgp-section{margin-top:24px}.cgp .cgp-preference{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0;border-bottom:1px solid var(--cgp-line)}.cgp .cgp-setting-title{font-size:13px;font-weight:500}.cgp .cgp-switch{position:relative;flex:0 0 34px;width:34px;height:20px;padding:0;border:0;border-radius:12px;background:light-dark(#cbced6,#50535e);cursor:pointer;transition:background .15s}.cgp .cgp-switch[aria-checked=true]{background:var(--cgp-blue)}.cgp .cgp-switch-thumb{display:block;width:16px;height:16px;margin-left:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0002;transition:transform .15s}.cgp .cgp-switch[aria-checked=true] .cgp-switch-thumb{transform:translateX(14px)}
.cgp .cgp-model-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.cgp .cgp-model-list{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:12px 0 0;padding:0}.cgp .cgp-model{max-width:100%;padding:5px 9px;border:1px solid var(--cgp-line);border-radius:6px;font-size:12px;overflow-wrap:anywhere}.cgp .cgp-model-id{color:var(--cgp-muted);font-size:11px}.cgp .cgp-notice{margin-top:20px;padding:12px 14px;border-radius:8px;background:var(--cgp-soft);color:var(--cgp-danger);font-size:12px;overflow-wrap:anywhere}.cgp .cgp-notice .cgp-btn{margin-top:8px}.cgp .cgp-details{margin-top:24px;color:var(--cgp-muted);font-size:12px;line-height:1.7}.cgp .cgp-details summary{width:fit-content;cursor:pointer}.cgp .cgp-details p{margin-top:8px}
.cgp .cgp-network{padding:16px 18px;border:1px solid var(--cgp-line);border-radius:12px;background:var(--cgp-surface)}.cgp .cgp-network label{display:block;margin:12px 0 5px;font-size:12px;font-weight:500}.cgp .cgp-network input,.cgp .cgp-network select{display:block;width:100%;min-height:36px;padding:7px 10px;border:1px solid var(--cgp-line);border-radius:8px;background:var(--cgp-soft);color:var(--cgp-text);font:inherit;font-size:13px}.cgp .cgp-network input:focus-visible,.cgp .cgp-network select:focus-visible{outline:2px solid var(--cgp-blue);outline-offset:2px}.cgp .cgp-network .cgp-actions{margin-top:14px}.cgp .cgp-network ul{list-style:none;padding:0;margin:8px 0 0;font-size:12px}.cgp .cgp-network [data-ok=false]{color:var(--cgp-danger)}
.cgp [hidden]{display:none!important}.cgp .cgp-tabs{display:flex;gap:4px;margin-top:20px;padding:4px;border:1px solid var(--cgp-line);border-radius:10px;background:var(--cgp-soft)}.cgp .cgp-tab{flex:1;min-height:36px;padding:7px 12px;border:0;border-radius:7px;background:transparent;color:var(--cgp-muted);font:inherit;font-size:13px;cursor:pointer}.cgp .cgp-tab:hover{color:var(--cgp-text)}.cgp .cgp-tab[aria-selected=true]{background:var(--cgp-surface);color:var(--cgp-text);font-weight:600;box-shadow:0 1px 4px #0002}
@media(prefers-color-scheme:dark){.cgp{color-scheme:dark}}:root[data-theme=light] .cgp,.light .cgp{color-scheme:light}:root[data-theme=dark] .cgp,.dark .cgp{color-scheme:dark}
@media(max-width:640px){.cgp{padding:20px 16px 28px}.cgp .cgp-account{flex-wrap:wrap}.cgp .cgp-account>.cgp-actions{width:100%;padding-left:48px}.cgp .cgp-card-head,.cgp .cgp-account,.cgp .cgp-card-footer,.cgp .cgp-auth{padding-left:14px;padding-right:14px}}
@media(prefers-reduced-motion:reduce){.cgp .cgp-btn,.cgp .cgp-switch,.cgp .cgp-switch-thumb{transition:none}}
`;
  function Settings(){
    const [activeTab,setActiveTab]=React.useState('auth');
    const [state,setState]=React.useState(null),[error,setError]=React.useState(''),[statusError,setStatusError]=React.useState(''),[busy,setBusy]=React.useState(false),[url,setUrl]=React.useState(''),[models,setModels]=React.useState(null),[modelError,setModelError]=React.useState(''),[modelsLoading,setModelsLoading]=React.useState(false),[copied,setCopied]=React.useState(false);
    const [networkMode,setNetworkMode]=React.useState('environment'),[proxyUrl,setProxyUrl]=React.useState(''),[networkBusy,setNetworkBusy]=React.useState(false),[networkMessage,setNetworkMessage]=React.useState(''),[networkError,setNetworkError]=React.useState(''),[networkTest,setNetworkTest]=React.useState(null);
    const mounted=React.useRef(true),generation=React.useRef(0),modelGeneration=React.useRef(0),modelScope=React.useRef(null),networkEdited=React.useRef(false),networkGeneration=React.useRef(0);
    const signing=state?.phase==='signing-in',ready=state?.phase==='ready';
    const accountId=ready?state.selectedAccountId:null;
    modelScope.current=accountId;
    const refresh=React.useCallback(async()=>{
      const current=++generation.current;
      try{const value=await request('status');if(mounted.current&&current===generation.current){setState(value);setStatusError('');setUrl(value.phase==='signing-in'?(value.authorizationUrl||''):'');if(value.network&&!networkEdited.current){setNetworkMode(value.network.mode);setProxyUrl(value.network.proxyUrl);}}}
      catch(e){if(mounted.current&&current===generation.current)setStatusError(e.message);}
    },[]);
    const loadModels=React.useCallback(async selected=>{
      const current=++modelGeneration.current;
      const active=()=>mounted.current&&current===modelGeneration.current&&modelScope.current===selected;
      setModelsLoading(true);setModelError('');
      try{const value=await request('models');if(!Array.isArray(value))throw Error('模型目录响应无效，请重试。');if(active())setModels(value);}
      catch(e){if(active()){setModels(null);setModelError(e.message);}}
      finally{if(active())setModelsLoading(false);}
    },[]);
    React.useEffect(()=>{mounted.current=true;void refresh();const timer=setInterval(refresh,2000);return()=>{mounted.current=false;generation.current++;modelGeneration.current++;networkGeneration.current++;clearInterval(timer);};},[refresh]);
    React.useEffect(()=>{
      setModels(null);setModelError('');setModelsLoading(false);
      if(accountId)void loadModels(accountId);
      return()=>{modelGeneration.current++;};
    },[accountId,loadModels]);
    React.useEffect(()=>{setCopied(false);},[url]);
    const act=async operation=>{setBusy(true);setError('');try{await operation();}catch(e){if(mounted.current)setError(e.message);}finally{await refresh();if(mounted.current)setBusy(false);}};
    const login=(newAccount=ready)=>act(async()=>{const value=await request('login',newAccount?{newAccount:true}:{});if(mounted.current)setUrl(value.url);});
    const restart=()=>act(async()=>{setUrl('');const value=await request('restart',{});if(mounted.current)setUrl(value.url);});
    const accounts=(state?.accounts??[]).filter(account=>account.signedIn);
    const hasSavedAccount=Boolean(state?.accounts?.length);
    const remaining=state?.expiresAt?Math.max(0,Math.ceil((state.expiresAt-Date.now())/1000)):0;
    const issue=error||statusError||state?.error?.message||state?.modelError?.message;
    const button=(label,onClick,variant='',disabled=busy)=>h('button',{type:'button',className:'cgp-btn '+variant,disabled,onClick},label);
    const status=!state?'读取中':signing?'等待授权':ready?'已连接':state.phase==='attention'?'需要处理':'未连接';
    const editNetwork=(mode,value)=>{networkEdited.current=true;networkGeneration.current++;setNetworkMode(mode);setProxyUrl(value);setNetworkMessage('');setNetworkError('');setNetworkTest(null);};
    const networkAction=async save=>{
      const current=++networkGeneration.current;const active=()=>mounted.current&&current===networkGeneration.current;
      setNetworkBusy(true);setNetworkMessage('');setNetworkError('');setNetworkTest(null);
      try{
        const value=await request(save?'network':'network-test',{mode:networkMode,proxyUrl:networkMode==='proxy'?proxyUrl.trim():''});
        if(active()){
          if(save){networkEdited.current=false;setNetworkMode(value.mode);setProxyUrl(value.proxyUrl);setNetworkMessage('已保存并立即生效。');if(accountId)void loadModels(accountId);await refresh();}
          else setNetworkTest(value);
        }
      }catch(error){if(active())setNetworkError(error.message);}
      finally{if(active())setNetworkBusy(false);}
    };
    const tabKey=(event,id)=>{
      const other=id==='auth'?'proxy':'auth';
      const next=event.key==='Home'?'auth':event.key==='End'?'proxy':['ArrowLeft','ArrowRight'].includes(event.key)?other:null;
      if(next){event.preventDefault();setActiveTab(next);document.getElementById('cgp-tab-'+next)?.focus();}
    };
    const settingsTab=(id,label)=>h('button',{id:'cgp-tab-'+id,className:'cgp-tab',type:'button',role:'tab','aria-selected':activeTab===id,'aria-controls':'cgp-panel-'+id,tabIndex:activeTab===id?0:-1,onClick:()=>setActiveTab(id),onKeyDown:event=>tabKey(event,id)},label);
    return h('section',{className:'cgp','aria-label':'ChatGPT 订阅设置','aria-busy':busy},
      h('style',null,css),
      h('header',{className:'cgp-heading'},h('img',{className:'cgp-plugin-icon',src:'/api/dsh-chatgpt-plan/icon',alt:'',width:44,height:44,'aria-hidden':true}),h('div',null,h('h2',null,'ChatGPT 订阅'),h('p',{className:'cgp-intro'},'用你的订阅，在 Harness 中使用 GPT、图片与内置工具。无需 API Key。'),state?.pluginVersion&&h('p',{className:'cgp-caption'},'运行版本 v'+state.pluginVersion+' · '+(state.diagnostics?.writeFailed?'诊断日志写入失败':'本地诊断日志已启用')))),
      h('div',{className:'cgp-tabs',role:'tablist','aria-label':'订阅设置'},settingsTab('auth','获取授权'),settingsTab('proxy','配置代理')),
      h('div',{id:'cgp-panel-auth',role:'tabpanel','aria-labelledby':'cgp-tab-auth',tabIndex:0,hidden:activeTab!=='auth'},
      h('section',{className:'cgp-card','aria-label':'账户连接'},
        h('div',{className:'cgp-card-head'},h('h3',null,'账户连接'),h('span',{className:'cgp-badge','data-tone':ready?'ready':signing?'waiting':'neutral',role:'status'},h('span',{className:'cgp-dot','aria-hidden':true}),status)),
        accounts.length?accounts.map(account=>h('div',{key:account.accountId,className:'cgp-account'},
          h('div',{className:'cgp-avatar','aria-hidden':true},(account.email||'G').slice(0,1).toUpperCase()),
          h('div',{className:'cgp-account-info'},h('p',{className:'cgp-email'},account.email||'ChatGPT 账户'),h('p',{className:'cgp-caption'},(account.accountId===state.selectedAccountId?'当前账户 · ':'')+(account.signedIn?(account.planUsageEnabled?'订阅已授权':'未授予订阅调用权限'):'已退出'))),
          h('div',{className:'cgp-actions'},
            account.accountId!==state.selectedAccountId&&account.signedIn&&account.planUsageEnabled&&button('切换账户',()=>act(()=>request('select',{accountId:account.accountId}))),
            account.signedIn&&button('退出',()=>act(async()=>{const result=await request('logout',{accountId:account.accountId});if(!result.remoteRevoked)throw Error('本机已退出，远程撤销尚未确认。请到 ChatGPT 设置中断开此应用。');}),'cgp-btn-quiet cgp-btn-danger')))):
          h('div',{className:'cgp-empty'},h('p',{className:'cgp-empty-title'},state?'连接账户，即可开始':'正在读取账户状态…'),h('p',{className:'cgp-caption'},'点击下方连接按钮，再打开 OpenAI 页面完成授权。')),
        signing&&h('div',{className:'cgp-auth'},h('p',null,remaining>0?'在 OpenAI 页面完成授权后，返回这里即可。连接状态与模型列表会自动更新。':'授权等待已结束，请重新发起授权。'),
          h('div',{className:'cgp-actions'},url&&remaining>0&&h('a',{className:'cgp-btn cgp-btn-primary',href:url,target:'_blank',rel:'noreferrer noopener'},'打开授权页面 ↗'),
            url&&remaining>0&&button(copied?'已复制链接':'复制链接',()=>act(async()=>{await navigator.clipboard.writeText(url);if(mounted.current)setCopied(true);})),
            button('重新授权',restart,'cgp-btn-quiet'),button('取消',()=>act(()=>request('cancel',{})),'cgp-btn-quiet')),
          remaining>0&&h('div',{className:'cgp-countdown'},'链接有效期 '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'))),
        !signing&&h('div',{className:'cgp-card-footer'},h('div',null,h('p',{className:'cgp-caption'},ready?'使用当前账户的订阅额度。':'授权自己的 ChatGPT 账户。'),ready&&h('a',{className:'cgp-usage-link',href:'https://chatgpt.com/settings/usage',target:'_blank',rel:'noreferrer noopener',title:'以 ChatGPT 官方页面当前登录的账户为准'},'查看订阅额度与用量 ↗')),h('div',{className:'cgp-actions'},button(ready?'添加账户':state?.error?.code==='expired_attempt'?'重新授权':'连接 ChatGPT',()=>login(),ready?'':'cgp-btn-primary',busy||!state),!ready&&!accounts.length&&hasSavedAccount&&button('使用其他账户',()=>login(true),'cgp-btn-quiet')))),
      ready&&h('section',{className:'cgp-section','aria-label':'可用模型','aria-busy':modelsLoading},h('div',{className:'cgp-model-head'},h('h3',null,'可用模型'),button(modelsLoading?'正在加载…':'刷新模型',()=>loadModels(accountId),'cgp-btn-quiet',busy||modelsLoading)),
        h('p',{className:'cgp-caption'},'新建会话，在「ChatGPT plan」中选择下方模型，即可开始。可随时切换 DeepSeek。'),
        modelError?h('div',{className:'cgp-notice',role:'alert'},h('p',null,'模型加载失败：'+modelError),button('重试加载模型',()=>loadModels(accountId),'cgp-btn-quiet',busy||modelsLoading)):
          h('div',{'aria-live':'polite'},modelsLoading?h('p',{className:'cgp-caption'},'正在获取当前账户的模型…'):models!==null&&(models.length?h('ul',{className:'cgp-model-list'},...models.map(model=>h('li',{key:model.id,className:'cgp-model',title:model.id},model.name))):h('p',{className:'cgp-caption'},'当前账户暂无可用模型。请确认订阅权限与额度，再刷新模型。')))),
      h('section',{className:'cgp-section','aria-label':'使用偏好'},
        h('h3',null,'使用偏好'),h('div',{className:'cgp-preference'},
          h('div',null,h('p',{id:'cgp-default-label',className:'cgp-setting-title'},'新会话默认使用 GPT'),h('p',{id:'cgp-default-help',className:'cgp-caption'},'关闭后恢复原默认模型，不影响已有会话。',state?.defaultModelUnavailable?' 当前暂不可修改。':'')),
          h('button',{type:'button',role:'switch',className:'cgp-switch','aria-checked':state?.defaultGptEnabled!==false,'aria-labelledby':'cgp-default-label','aria-describedby':'cgp-default-help',disabled:busy||!state||state.defaultModelUnavailable,onClick:()=>act(()=>request('preferences',{enabled:state?.defaultGptEnabled===false}))},h('span',{className:'cgp-switch-thumb','aria-hidden':true})))),
      issue&&h('div',{className:'cgp-notice',role:'alert'},h('p',null,issue),button('重试连接状态',()=>act(async()=>{}),'cgp-btn-quiet')),
      ),
      h('div',{id:'cgp-panel-proxy',role:'tabpanel','aria-labelledby':'cgp-tab-proxy',tabIndex:0,hidden:activeTab!=='proxy'},
      h('section',{className:'cgp-section cgp-network','aria-label':'独立代理','aria-busy':networkBusy},
        h('h3',null,'独立代理'),h('p',{className:'cgp-caption'},'仅影响此插件的授权、模型列表和对话请求。保存后立即生效。'),
        h('label',{htmlFor:'cgp-network-mode'},'连接方式'),
        h('select',{id:'cgp-network-mode',value:networkMode,disabled:networkBusy||!state,onChange:event=>editNetwork(event.target.value,proxyUrl)},h('option',{value:'environment'},'跟随环境变量'),h('option',{value:'direct'},'直连（不使用代理）'),h('option',{value:'proxy'},'自定义代理')),
        networkMode==='proxy'&&h('div',null,h('label',{htmlFor:'cgp-proxy-url'},'代理地址'),h('input',{id:'cgp-proxy-url',type:'url',value:proxyUrl,placeholder:'http://127.0.0.1:7890',autoComplete:'off',spellCheck:false,disabled:networkBusy,'aria-describedby':'cgp-proxy-hint',onChange:event=>editNetwork(networkMode,event.target.value)}),h('p',{id:'cgp-proxy-hint',className:'cgp-caption'},'支持 HTTP(S) 代理，请填写代理软件的 HTTP 或混合端口。')),
        networkMode==='environment'&&h('p',{className:'cgp-caption'},'读取 HTTP(S)_PROXY / NO_PROXY，不会自动读取系统或浏览器代理。'),
        h('div',{className:'cgp-actions'},button('保存并应用',()=>networkAction(true),'cgp-btn-primary',networkBusy||!state),button(networkBusy?'处理中…':'测试连接',()=>networkAction(false),'',networkBusy||!state)),
        h('p',{className:'cgp-caption'},'测试当前填写的配置，不会保存设置或消耗模型额度。'),
        networkMessage&&h('p',{className:'cgp-caption',role:'status'},networkMessage),networkError&&h('p',{className:'cgp-caption',role:'alert','data-ok':false},networkError),
        networkTest&&h('div',{role:networkTest.ok?'status':'alert','data-ok':networkTest.ok},h('p',{className:'cgp-caption'},networkTest.ok?'授权服务和模型服务均可连接。':'连接测试未通过。'),h('ul',null,...networkTest.checks.map(check=>h('li',{key:check.service,'data-ok':check.ok},(check.service==='authorization'?'授权服务':'模型服务')+'：'+(check.ok?'可达（'+check.durationMs+' ms）':check.message)))))),
      ),
      h('p',{className:'cgp-caption',style:{marginTop:'24px'}},'会话文本、图片和工具结果将发送至 OpenAI。模型能力与额度以当前账户为准。'),
      h('details',{className:'cgp-details'},h('summary',null,'隐私与使用说明'),h('p',null,'登录凭证仅保存在本机、仅本人可读的文件中，文件未加密。本插件不读取其他应用的登录信息。'),h('p',null,'图片需选择支持图片输入的模型；工具权限与审批由 Harness 管理。'),h('p',null,h('a',{href:'https://github.com/diwer/dsh-codex-adapter/blob/master/docs/PRIVACY.md',target:'_blank',rel:'noreferrer noopener'},'数据与隐私 ↗'),' · ',h('a',{href:'https://github.com/diwer/dsh-codex-adapter/blob/master/docs/INSTALLATION.md',target:'_blank',rel:'noreferrer noopener'},'使用帮助 ↗'))));
  }
  // Host-owned slot lifecycle removes the mascot when the plugin is disabled.
  function Mascot(){
    return h('div',{className:'cgp-mascot',role:'img','aria-label':'大肥鱼指挥 Codex',title:'大肥鱼指挥 Codex'},
      h('style',null,`.cgp-mascot{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));width:72px;height:72px;max-width:18vw;max-height:18vh;aspect-ratio:1;border-radius:18px;overflow:hidden;box-shadow:0 3px 14px #0003;pointer-events:none!important;user-select:none}.cgp-mascot img{display:block;width:100%;height:100%;object-fit:cover}`),
      h('img',{src:'/api/dsh-chatgpt-plan/icon',alt:'',width:72,height:72,draggable:false}));
  }
  function apply(ctx){ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'chatgpt-plan-mascot',order:15},Mascot));ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'chatgpt-plan',order:15,label:()=> 'ChatGPT 订阅'},Settings));}
  return {name,inject,apply};
}});
