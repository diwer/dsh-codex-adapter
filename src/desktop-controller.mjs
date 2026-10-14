import {AuthError} from './auth/index.mjs';

/** Account selection belongs to this plugin's protected store, never to another client. */
export class DesktopAccountController {
  constructor({auth,store,onChange=()=>{}}){this.auth=auth;this.store=store;this.onChange=onChange;this.pending=null;this.lastError=null;this.disposed=false;}
  async selectedAccount(){
    const accounts=await this.auth.accounts();
    const selected=await this.store.transaction(state=>state.selectedAccountId);
    const chosen=accounts.find(account=>account.accountId===selected);
    if(chosen){if(!chosen.signedIn)throw new AuthError('not_signed_in');if(!chosen.planUsageEnabled)throw new AuthError('plan_permission_missing');return selected;}
    const usable=accounts.filter(account=>account.signedIn && account.planUsageEnabled);
    if(usable.length===1)return usable[0].accountId;
    throw new AuthError(usable.length>1?'account_mismatch':'not_signed_in');
  }
  async accessToken(signal){signal?.throwIfAborted();return this.auth.session(await this.selectedAccount()).accessToken(signal);}
  async status(){
    const accounts=await this.auth.accounts();
    let selectedAccountId=null;try{selectedAccountId=await this.selectedAccount();}catch(error){if(!(error instanceof AuthError))throw error;}
    return {provider:'openai-chatgpt-plan',phase:this.pending?'signing-in':this.lastError?'attention':selectedAccountId?'ready':'not-signed-in',selectedAccountId,error:this.lastError,authorizationUrl:this.pending?.activeUrl??null,
      accounts:accounts.map(({accountId,email,signedIn,planUsageEnabled})=>({accountId,email,signedIn,planUsageEnabled}))};
  }
  async selectAccount(accountId){
    if(typeof accountId!=='string'||!await this.auth.accounts().then(accounts=>accounts.some(account=>account.accountId===accountId)))throw new AuthError('invalid_options');
    await this.store.transaction(state=>{state.selectedAccountId=accountId;});this.lastError=null;this.onChange();return this.status();
  }
  async beginLogin(){
    if(this.disposed)throw new AuthError('cancelled');
    if(this.pending)return {url:this.pending.activeUrl??await this.pending.url};
    this.lastError=null;
    const controller=new AbortController();
    let resolveUrl,rejectUrl;
    const url=new Promise((resolve,reject)=>{resolveUrl=resolve;rejectUrl=reject;});
    const pending={controller,url,task:null};this.pending=pending;
    pending.task=(async()=>{
      try{
        const account=await this.auth.login({signal:controller.signal,onAuthorize:value=>{
          const parsed=new URL(value);if(parsed.origin!=='https://auth.openai.com'||parsed.pathname!=='/api/accounts/authorize')throw new AuthError('invalid_options');
          pending.activeUrl=value;
          resolveUrl(value);
        }});
        if(this.disposed||controller.signal.aborted)throw new AuthError('cancelled');
        await this.store.transaction(state=>{if(this.disposed||controller.signal.aborted)throw new AuthError('cancelled');state.selectedAccountId=account.accountId;});
      }catch(error){
        const safe=error instanceof AuthError?error:new AuthError('invalid_response');
        if(!controller.signal.aborted)this.lastError={code:safe.code,message:safe.message};
        rejectUrl(safe);
      }finally{if(this.pending===pending)this.pending=null;this.onChange();}
    })();
    return {url:await url};
  }
  async cancelLogin(){const pending=this.pending;if(pending){pending.controller.abort();await pending.task;}return this.status();}
  async logout(accountId){await this.cancelLogin();const result=await this.auth.session(accountId).logout();this.lastError=null;this.onChange();return {remoteRevoked:result.remoteRevoked,...await this.status()};}
  async dispose(){this.disposed=true;const pending=this.pending;if(pending){pending.controller.abort();await pending.task;}}
}
