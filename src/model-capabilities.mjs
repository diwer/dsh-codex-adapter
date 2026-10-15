import {protocol} from './errors.mjs';

// Responses reasoning.effort enum; the account catalog can also contain levels
// for other clients (such as ultra) which this endpoint rejects with HTTP 400.
// https://developers.openai.com/api/docs/guides/reasoning
const labels=Object.freeze({none:'不思考',minimal:'最少',low:'低',medium:'中',high:'高',xhigh:'很高',max:'最大'});
export const isResponsesEffort=value=>typeof value==='string'&&Object.hasOwn(labels,value);
const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(value);
const effortName=id=>Object.hasOwn(labels,id)?labels[id]:id;

/** Account catalog metadata, never a guessed list based on a model name. */
export function catalogReasoning(model){
  const levels=model.supported_reasoning_levels;
  if(levels===undefined||levels===null)return undefined;
  if(!Array.isArray(levels))throw protocol('The account model catalog contained invalid reasoning levels.');
  const seen=new Set();
  const efforts=levels.map(level=>{
    if(!validId(level?.effort)||seen.has(level.effort)||(level.description!==undefined&&typeof level.description!=='string'))throw protocol('The account model catalog contained invalid reasoning levels.');
    seen.add(level.effort);
    return {id:level.effort,name:effortName(level.effort),...(level.description===undefined?{}:{description:level.description})};
  });
  const defaultEffort=model.default_reasoning_level;
  if(defaultEffort!==undefined&&defaultEffort!==null&&!seen.has(defaultEffort))throw protocol('The account model catalog contained an unsupported default reasoning level.');
  const supported=efforts.filter(effort=>isResponsesEffort(effort.id));
  if(!supported.length)return undefined;
  return {efforts:supported,...supported.some(effort=>effort.id===defaultEffort)?{defaultEffort}:{}};
}

/** Keep the existing explicit override for catalogs that do not declare levels. */
export function resolvedReasoning(catalog,configured){
  if(!configured?.reasoningEfforts)return catalog;
  const efforts=configured.reasoningEfforts.map(id=>({id,name:effortName(id)}));
  const defaultEffort=catalog?.defaultEffort;
  return {efforts,...defaultEffort!==undefined&&configured.reasoningEfforts.includes(defaultEffort)?{defaultEffort}:{}};
}
