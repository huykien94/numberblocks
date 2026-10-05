import test from 'node:test';
import assert from 'node:assert/strict';
import {questionText,createNarrator} from '../src/narration.js';
test('spoken puzzles use number words and all four operators in both languages',()=>{
 assert.equal(questionText('vi','add',1,1),'Một cộng một bằng mấy?');
 assert.equal(questionText('vi','multiply',2,2),'Hai nhân hai bằng mấy?');
 assert.equal(questionText('vi','subtract',10,5),'Mười trừ năm bằng mấy?');
 assert.equal(questionText('vi','divide',16,4),'Mười sáu chia bốn bằng mấy?');
 assert.equal(questionText('en','add',1,1),'What is one plus one?');
 assert.equal(questionText('en','subtract',3,2),'What is three minus two?');
 assert.equal(questionText('en','multiply',2,2),'What is two times two?');
 assert.equal(questionText('en','divide',12,3),'What is twelve divided by three?');
});
test('voice matches language, new speech cancels old, stale events cannot unduck music',()=>{
 const queued=[],speaking=[];let cancelled=0;
 const synthesis={cancel(){cancelled++;},getVoices:()=>[{lang:'en-US'},{lang:'vi-VN'}],speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{constructor(text){this.text=text;}},onSpeaking:v=>speaking.push(v)});
 narrator.speak('Một cộng một bằng mấy?','vi');assert.equal(queued[0].voice.lang,'vi-VN');queued[0].onstart();assert.equal(speaking.at(-1),true);
 narrator.speak('What is two plus two?','en');queued[1].onstart();queued[0].onend();assert.equal(speaking.at(-1),true);assert.equal(cancelled,1);
 narrator.cancel();queued[1].onstart();assert.equal(speaking.at(-1),false);
});
test('incomplete Android voice lists still submit a language and report actual engine errors',()=>{
 let unavailable=0;const queued=[];
 const synthesis={cancel(){},getVoices:()=>[{lang:'en-US'}],speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{},onUnavailable:()=>unavailable++});
 narrator.speak('Một cộng một','vi');assert.equal(unavailable,0);assert.equal(queued[0].lang,'vi-VN');assert.equal(queued[0].voice,undefined);assert.equal(queued[0].pitch,1);
 queued[0].onerror({error:'language-unavailable'});assert.equal(unavailable,1);
 narrator.speak('One plus one','en');queued[1].onerror({error:'synthesis-failed'});assert.equal(queued.length,3);assert.equal(queued[2].voice,undefined);
 queued[2].onerror({error:'synthesis-failed'});assert.equal(unavailable,2);
 narrator.cancel();queued[2].onerror({error:'interrupted'});assert.equal(unavailable,2);
});
test('warming voices and reading after completion do not reset an idle speech engine',async()=>{
 let resets=0,voiceReads=0;const queued=[];
 const synthesis={cancel(){resets++;},getVoices(){voiceReads++;return [{lang:'vi-VN'}];},speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{}});
 narrator.warmup();assert.ok(voiceReads>=2);const first=narrator.speak('một','vi');queued[0].onend();await first;
 narrator.speak('hai','vi');assert.equal(resets,0);narrator.cancel();assert.equal(resets,1);
});

function clock(){let id=0;const jobs=new Map();return {jobs,setTimeout(fn){jobs.set(++id,fn);return id;},clearTimeout(i){jobs.delete(i);},fire(){const [id,fn]=jobs.entries().next().value;jobs.delete(id);fn();}};}
test('late Android voices restart only an unstarted current utterance',()=>{
 let voices=[],listener;const queued=[],timers=clock();
 const synthesis={cancel(){},getVoices:()=>voices,speak:u=>queued.push(u),addEventListener(name,fn){listener=fn;},removeEventListener(){listener=undefined;}};
 const narrator=createNarrator({synthesis,Utterance:class{},timers});narrator.speak('một','vi');
 voices=[{lang:'vi_VN'}];listener();assert.equal(queued.length,2);assert.equal(queued[1].voice.lang,'vi_VN');
 queued[1].onstart();listener();assert.equal(queued.length,2);narrator.cancel();assert.equal(listener,undefined);assert.equal(timers.jobs.size,0);
});
test('silent engines retry once then report a start timeout instead of hanging',async()=>{
 const timers=clock(),queued=[],errors=[];const synthesis={cancel(){},getVoices:()=>[{lang:'vi-VN'}],speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{},timers,onUnavailable:e=>errors.push(e)});
 const done=narrator.speak('một','vi');timers.fire();assert.equal(queued.length,2);timers.fire();assert.equal(await done,false);assert.deepEqual(errors,['start-timeout']);assert.equal(timers.jobs.size,0);
});
test('cancel prevents watchdog retries and blocked speech does not retry automatically',()=>{
 const timers=clock(),queued=[],errors=[];const synthesis={cancel(){},getVoices:()=>[],speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{},timers,onUnavailable:e=>errors.push(e)});
 narrator.speak('một','vi');narrator.cancel();assert.equal(timers.jobs.size,0);
 narrator.speak('hai','vi');queued[1].onerror({error:'not-allowed'});assert.equal(queued.length,2);assert.deepEqual(errors,['not-allowed']);assert.equal(timers.jobs.size,0);
});
