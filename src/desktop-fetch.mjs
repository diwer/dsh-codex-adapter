import {getCACertificates} from 'node:tls';
import {Agent,fetch} from 'undici';

/** Per-plugin TLS trust: Node roots plus OS-trusted certificates; no global dispatcher changes. */
export function createDesktopFetch({getCertificates=getCACertificates,AgentClass=Agent,fetchImpl=fetch}={}){
  const ca=[...new Set([...getCertificates('default'),...getCertificates('system')])];
  const dispatcher=new AgentClass({connect:{ca,rejectUnauthorized:true}});
  let closed=false;
  return {
    async fetch(url,init={}){
      if(closed)throw new Error('The desktop transport is closed.');
      const target=new URL(url);
      if(target.protocol!=='https:'||!['api.openai.com','auth.openai.com'].includes(target.hostname)||target.username||target.password||target.port)throw new Error('The desktop transport accepts only official HTTPS destinations.');
      return fetchImpl(url,{...init,dispatcher,redirect:'error',credentials:'omit'});
    },
    async close(){if(!closed){closed=true;await dispatcher.close();}}
  };
}
