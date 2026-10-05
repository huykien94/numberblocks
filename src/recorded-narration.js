import {voiceCatalog} from './voice-catalog.js';
import {createNarrator} from './narration.js';
const clipIds=Object.fromEntries(Object.entries(voiceCatalog).map(([lang,entries])=>[lang,new Map(entries.map(({text,id})=>[text,id]))]));
export function createRecordedNarrator({getContext,baseUrl='./',onSpeaking=()=>{},onUnavailable=()=>{},fetchClip=globalThis.fetch,fallback=createNarrator({onSpeaking,onUnavailable})}) {
 let generation=0,active,finish;
 const buffers=new Map(),pending=new Map();
 function cancel(){generation++;if(active){try{active.stop();}catch{}active.disconnect();active=undefined;}finish?.(false);finish=undefined;fallback.cancel();onSpeaking(false);}
 async function bufferFor(lang,id,context){
  const key=`${lang}/${id}`;
  if(buffers.has(key)){const buffer=buffers.get(key);buffers.delete(key);buffers.set(key,buffer);return buffer;}
  if(pending.has(key))return pending.get(key);
  const load=(async()=>{
   const response=await fetchClip(`${baseUrl}audio/${key}.mp3`);
   if(!response.ok)throw new Error('Voice clip unavailable');
   const buffer=await context.decodeAudioData(await response.arrayBuffer());
   buffers.set(key,buffer);
   if(buffers.size>48)buffers.delete(buffers.keys().next().value);
   return buffer;
  })();
  pending.set(key,load);
  try{return await load;}finally{pending.delete(key);}
 }
 async function speak(text,lang){
  cancel();const current=generation;const id=clipIds[lang]?.get(text);
  if(!id)return fallback.speak(text,lang);
  try{
   const context=await getContext();
   if(current!==generation)return false;
   const buffer=await bufferFor(lang,id,context);
   if(current!==generation)return false;
   return await new Promise((resolve,reject)=>{
    finish=resolve;const source=context.createBufferSource();active=source;
    source.buffer=buffer;source.connect(context.destination);
    source.onended=()=>{source.disconnect();if(current===generation){active=undefined;finish=undefined;onSpeaking(false);resolve(true);}};
    try{source.start();onSpeaking(true);}catch(error){active=undefined;source.disconnect();reject(error);}
   });
  }catch{
   if(current!==generation)return false;
   onSpeaking(false);return fallback.speak(text,lang);
  }
 }
 async function prepareNumbers(lang){
  try{const context=await getContext();await Promise.allSettled(Array.from({length:21},(_,i)=>bufferFor(lang,`number-${i}`,context)));}catch{}
 }
 return {speak,cancel,prepareNumbers};
}
