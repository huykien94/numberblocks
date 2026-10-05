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
test('missing language voice and playback errors gracefully report unavailable narration',()=>{
 let unavailable=0;const queued=[];
 const synthesis={cancel(){},getVoices:()=>[{lang:'en-US'}],speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{},onUnavailable:()=>unavailable++});
 narrator.speak('Một cộng một','vi');assert.equal(unavailable,1);assert.equal(queued.length,0);
 narrator.speak('One plus one','en');queued[0].onerror({error:'synthesis-failed'});assert.equal(unavailable,2);
 narrator.cancel();queued[0].onerror({error:'interrupted'});assert.equal(unavailable,2);
});
test('warming voices and reading after completion do not reset an idle speech engine',async()=>{
 let resets=0,voiceReads=0;const queued=[];
 const synthesis={cancel(){resets++;},getVoices(){voiceReads++;return [{lang:'vi-VN'}];},speak:u=>queued.push(u)};
 const narrator=createNarrator({synthesis,Utterance:class{}});
 narrator.warmup();assert.ok(voiceReads>=2);const first=narrator.speak('một','vi');queued[0].onend();await first;
 narrator.speak('hai','vi');assert.equal(resets,0);narrator.cancel();assert.equal(resets,1);
});
