import {PROVIDER} from './adapter.mjs';

/** Changes only the host's new-session default; existing session selections remain owned by Harness. */
export class DesktopDefaultModel {
  constructor({store,service,listModels}){this.store=store;this.service=service;this.listModels=listModels;this.queue=Promise.resolve();this.retryAfter=0;}
  serial(run){const result=this.queue.then(run);this.queue=result.catch(()=>{});return result;}
  async status(){return this.store.transaction(state=>({defaultGptEnabled:state.defaultGpt?.enabled!==false}));}
  initialize(){return this.serial(async()=>{
    const preference=await this.store.transaction(state=>state.defaultGpt);
    if(preference?.enabled===false||preference?.applied)return;
    if(Date.now()<this.retryAfter)return;
    try{await this.enable();}catch(error){this.retryAfter=Date.now()+30000;throw error;}
  });}
  async enable(){
    const models=await this.listModels();
    const model=models.find(model=>model.id==='gpt-6.1-sol')??models[0];
    if(!model){await this.store.transaction(state=>{state.defaultGpt={enabled:true};});return;}
    const current=this.service.currentSelection();
    const preference=await this.store.transaction(state=>state.defaultGpt);
    const previous=current.provider===preference?.applied?.provider&&current.model===preference?.applied?.model?preference.previous:current;
    const applied={provider:PROVIDER,model:model.id};
    await this.service.saveSelection(applied);
    await this.store.transaction(state=>{state.defaultGpt={enabled:true,previous,applied};});
  }
  setEnabled(enabled){return this.serial(async()=>{
    if(typeof enabled!=='boolean')throw new TypeError('enabled must be boolean');
    if(enabled)await this.enable();
    else {
      const preference=await this.store.transaction(state=>state.defaultGpt);
      const current=this.service.currentSelection();
      // A manual default change made elsewhere takes precedence over our restore.
      if(preference?.previous&&current.provider===preference.applied?.provider&&current.model===preference.applied?.model)
        await this.service.saveSelection(preference.previous);
      await this.store.transaction(state=>{state.defaultGpt={enabled:false};});
    }
    return this.status();
  });}
}
