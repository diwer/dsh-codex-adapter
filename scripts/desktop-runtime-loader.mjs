import {registerHooks,createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const host=createRequire('/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/package.json');
const resolved=new Map(['@deepseek-ai/dsh-llm','@deepseek-ai/cordis','@deepseek-ai/schemastery'].map(name=>[name,pathToFileURL(host.resolve(name)).href]));
registerHooks({resolve(specifier,context,next){
  if(resolved.has(specifier))return {url:resolved.get(specifier),shortCircuit:true};
  return next(specifier,context);
}});
