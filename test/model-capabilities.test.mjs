import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogReasoning,resolvedReasoning} from '../src/model-capabilities.mjs';

test('account reasoning levels retain order, descriptions and the actual default',()=>{
  const reasoning=catalogReasoning({supported_reasoning_levels:[{effort:'low',description:'Faster'},{effort:'max',description:'More work'}],default_reasoning_level:'low'});
  assert.deepEqual(reasoning,{efforts:[{id:'low',name:'低',description:'Faster'},{id:'max',name:'最大',description:'More work'}],defaultEffort:'low'});
});
test('models without declared reasoning never get invented levels or defaults',()=>{
  for(const model of [{},{supported_reasoning_levels:null},{supported_reasoning_levels:[]}])assert.equal(catalogReasoning(model),undefined);
  assert.equal(catalogReasoning({supported_reasoning_levels:[{effort:'high'}]}).defaultEffort,undefined);
});
test('catalog-only levels are excluded when the Responses endpoint cannot accept them',()=>{
  const result=catalogReasoning({supported_reasoning_levels:[{effort:'low'},{effort:'ultra'},{effort:'future_level'}],default_reasoning_level:'ultra'});
  assert.deepEqual(result.efforts.map(e=>e.id),['low']);assert.equal(result.defaultEffort,undefined);
  assert.equal(catalogReasoning({supported_reasoning_levels:[{effort:'ultra'}]}),undefined);
});
for(const model of [
  {supported_reasoning_levels:'high'},
  {supported_reasoning_levels:[{effort:''}]},
  {supported_reasoning_levels:[{effort:'high'},{effort:'high'}]},
  {supported_reasoning_levels:[{effort:'high',description:123}]},
  {supported_reasoning_levels:[{effort:'high'}],default_reasoning_level:'low'},
  {supported_reasoning_levels:[],default_reasoning_level:'high'},
])test('malformed catalog reasoning cannot advertise an unusable picker',()=>{
  assert.throws(()=>catalogReasoning(model),{code:'PROTOCOL_ERROR'});
});
test('explicit overrides retain their subset without carrying an unsupported default',()=>{
  const catalog=catalogReasoning({supported_reasoning_levels:[{effort:'low'},{effort:'high'}],default_reasoning_level:'low'});
  assert.equal(resolvedReasoning(catalog,{reasoningEfforts:['high']}).defaultEffort,undefined);
  assert.equal(resolvedReasoning(catalog,{reasoningEfforts:['low','high']}).defaultEffort,'low');
  assert.deepEqual(resolvedReasoning(undefined,{reasoningEfforts:['medium']}).efforts.map(e=>e.id),['medium']);
});
