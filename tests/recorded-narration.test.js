import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {voiceCatalog} from '../src/voice-catalog.js';
import {createRecordedNarrator} from '../src/recorded-narration.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(overrides={}){
 const sources=[],speaking=[],requests=[];let fallbacks=0;
 const context={destination:{},decodeAudioData:async()=>({duration:.6}),createBufferSource(){const source={connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;this.onended?.();}};sources.push(source);return source;}};
 const player=createRecordedNarrator({getContext:async()=>context,baseUrl:'/numberblocks/',onSpeaking:v=>speaking.push(v),fetchClip:async url=>{requests.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};},fallback:{cancel(){},speak:async()=>{fallbacks++;return true;}},...overrides});
 return {player,sources,speaking,requests,get fallbacks(){return fallbacks;}};
}
test('every puzzle, count and feedback has a bundled MP3 for both languages',()=>{
 for(const [lang,entries] of Object.entries(voiceCatalog)){
  assert.equal(entries.length,138);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
  for(const {id} of entries){const data=readFileSync(new URL(`../public/audio/${lang}/${id}.mp3`,import.meta.url));assert.ok(data.length>1000);assert.equal(data.toString('ascii',0,3),'ID3');}
 }
});
test('recordings play without installed browser voices, use Pages base path and cached buffers',async()=>{
 const fixture=setup();let playing=fixture.player.speak('Một cộng một bằng mấy?','vi');await tick();
 assert.equal(fixture.requests[0],'/numberblocks/audio/vi/question-add-1-1.mp3');assert.equal(fixture.speaking.at(-1),true);
 fixture.sources[0].onended();assert.equal(await playing,true);assert.equal(fixture.speaking.at(-1),false);
 playing=fixture.player.speak('Một cộng một bằng mấy?','vi');await tick();assert.equal(fixture.requests.length,1);fixture.sources[1].onended();await playing;assert.equal(fixture.fallbacks,0);
});
test('cancel stops current clips and prevents delayed loads from speaking',async()=>{
 const fixture=setup();let playing=fixture.player.speak('hai','vi');await tick();fixture.player.cancel();assert.equal(await playing,false);assert.ok(fixture.sources[0].stopped);
 let release;const delayed=setup({fetchClip:()=>new Promise(resolve=>{release=()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});})});
 playing=delayed.player.speak('một','vi');await tick();delayed.player.cancel();release();assert.equal(await playing,false);assert.equal(delayed.sources.length,0);
});
test('failed downloads fall back to device speech without blocking gameplay',async()=>{
 const fixture=setup({fetchClip:async()=>({ok:false})});assert.equal(await fixture.player.speak('một','vi'),true);assert.equal(fixture.fallbacks,1);
});
