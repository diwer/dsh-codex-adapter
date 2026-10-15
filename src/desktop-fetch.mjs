import {getCACertificates} from 'node:tls';
import {EnvHttpProxyAgent,fetch} from 'undici';
import {AuthError} from './auth/errors.mjs';

/** Per-plugin TLS trust: Node roots plus OS-trusted certificates; no global dispatcher changes. */
export function createDesktopFetch({proxyUrl='',getCertificates=getCACertificates,AgentClass=EnvHttpProxyAgent,fetchImpl=fetch}={}){
  if(typeof proxyUrl!=='string')throw new AuthError('invalid_options');
  if(proxyUrl){
    try{const proxy=new URL(proxyUrl);if(!['http:','https:'].includes(proxy.protocol)||!proxy.hostname||proxy.pathname!=='/'||proxy.search||proxy.hash)throw new Error();}
    catch{throw new AuthError('invalid_options');}
  }
  const ca=[...new Set([...getCertificates('default'),...getCertificates('system')])];
  const tls={ca,rejectUnauthorized:true};
  // Explicit configuration supports GUI launches without proxy environment variables.
  // EnvHttpProxyAgent retains HTTP(S)_PROXY / NO_PROXY semantics, including lowercase.
  const allProxy=process.env.all_proxy??process.env.ALL_PROXY;
  const fallback=/^https?:\/\//i.test(allProxy??'')?allProxy:undefined;
  const dispatcher=new AgentClass({connect:tls,requestTls:tls,proxyTls:tls,
    ...(proxyUrl?{httpProxy:proxyUrl,httpsProxy:proxyUrl,noProxy:''}:{
      httpProxy:process.env.http_proxy??process.env.HTTP_PROXY??fallback,
      httpsProxy:process.env.https_proxy??process.env.HTTPS_PROXY??process.env.http_proxy??process.env.HTTP_PROXY??fallback,
    })});
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
