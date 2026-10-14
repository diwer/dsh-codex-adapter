import { createAdapterClass, PROVIDER } from '../src/adapter.mjs';
export class FakeLlmError extends Error { constructor(message, code, options) { super(message); this.code = code; Object.assign(this, options); } }
export const Adapter = createAdapterClass({LlmAdapter:class {}, LlmError:FakeLlmError, attributionHeaders:() => ({'user-agent':'deepseek-harness/test (+https://github.com/deepseek-ai/deepseek-harness)'})});
export const options = extra => ({provider:PROVIDER, model:'test-model', messages:[{role:'user',content:[{type:'text',text:'Hello'}]}],...extra});
export const textItem = (text='Hello', id='msg_1', phase='final_answer') => ({id,type:'message',role:'assistant',status:'completed',phase,content:[{type:'output_text',text,annotations:[]}]});
export const toolItem = (name='read_file', args='{"path":"a.txt"}', id='fc_1', callId='call_1') => ({id,type:'function_call',call_id:callId,namespace:'dsh',name,arguments:args,status:'completed'});
export const reasonItem = () => ({id:'rs_1',type:'reasoning',status:'completed',summary:[{type:'summary_text',text:'Checking the file.'}],encrypted_content:'encrypted-not-a-credential'});
export const complete = (output=[textItem()], extra={}) => ({type:'response.completed',response:{status:'completed',output,...extra}});
export const encodeEvents = events => events.map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('');
export function response(events, {split=0, text, headers={}}={}) {
  const bytes = new TextEncoder().encode(text ?? encodeEvents(events));
  const chunks = split ? Array.from({length:Math.ceil(bytes.length / split)},(_,i) => bytes.slice(i*split,(i+1)*split)) : [bytes];
  return new Response(new ReadableStream({start(controller) { for (const chunk of chunks) controller.enqueue(chunk); controller.close(); }}), {headers:{'content-type':'text/event-stream',...headers}});
}
export const collect = async iterable => { const out=[]; for await (const value of iterable) out.push(value); return out; };
export function makeAdapter(events, config={}) {
  const calls=[];
  const adapter = new Adapter({session:{async accessToken(){return 'FAKE_ACCESS_TOKEN';}},fetchImpl:async(url, init) => {calls.push({url,init}); return response(events);},...config});
  return {adapter,calls};
}
