import {AdapterError} from './errors.mjs';

const MAX_IMAGE_BYTES=8*1024*1024,MAX_TOTAL_ENCODED_BYTES=20*1024*1024,MAX_IMAGES=20;
/** Resolve only Harness-owned attachment references; never accept paths or fetch arbitrary URLs. */
export async function prepareImages(options,attachments,signal){
  const images=new Map();let count=0,total=0;
  const messages=[];
  for(const message of options.messages??[]){
    const content=[];
    for(const block of message.content){
      signal?.throwIfAborted();
      if(block.type!=='image'){content.push(block);continue;}
      if(!['user','developer','tool'].includes(message.role))throw new AdapterError('当前仅支持用户消息和工具结果中的图片。','UNSUPPORTED_CAPABILITY');
      const ref=block.attachment;
      if(block.offloaded===true){content.push({type:'text',text:`[此前图片已卸载：${ref?.name??ref?.attachmentId??'图片'}；需要视觉细节时请重新附图。]`});continue;}
      if(++count>MAX_IMAGES)throw new AdapterError('一次请求最多保留 20 张图片，请减少图片或压缩历史。','IMAGE_LIMIT');
      if(!attachments?.readImageRequest)throw new AdapterError('Harness 图片附件服务不可用，请重新打开桌面应用。','UNSUPPORTED_CAPABILITY');
      if(!ref||!Number.isSafeInteger(ref.width)||ref.width<1||!Number.isSafeInteger(ref.height)||ref.height<1)throw new AdapterError('图片附件尺寸无效。','INVALID_IMAGE');
      if(!images.has(ref.attachmentId)){
        const scale=Math.min(1,4096/Math.max(ref.width,ref.height));
        const version=await attachments.readImageRequest(ref,{width:Math.max(1,Math.round(ref.width*scale)),height:Math.max(1,Math.round(ref.height*scale)),maxBytes:MAX_IMAGE_BYTES},signal);
        signal?.throwIfAborted();
        if(!['image/png','image/jpeg','image/webp','image/gif'].includes(version.mediaType)||!(version.data instanceof Uint8Array)||!version.data.byteLength||version.data.byteLength>MAX_IMAGE_BYTES)throw new AdapterError('图片格式或大小超出请求限制。','INVALID_IMAGE');
        images.set(ref.attachmentId,`data:${version.mediaType};base64,${Buffer.from(version.data).toString('base64')}`);
      }
      total+=images.get(ref.attachmentId).length;
      if(total>MAX_TOTAL_ENCODED_BYTES)throw new AdapterError('图片请求总大小超过 20 MiB，请减少图片或压缩历史。','IMAGE_LIMIT');
      content.push(block);
    }
    messages.push({...message,content});
  }
  return {options:{...options,messages},images};
}
