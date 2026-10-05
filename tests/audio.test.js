import test from 'node:test';
import assert from 'node:assert/strict';
import { createSoundPlayer } from '../src/audio.js';
function fakeContext(state='running') {
  const voices=[];
  return { state, voices, currentTime:0, destination:{}, gains:[], resume:async()=>{},
    createOscillator() { const voice={frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){this.started=true;},stop(){this.stops=(this.stops||0)+1;}};voices.push(voice);return voice; },
    createGain() { const gain={setValueAtTime(value){this.value=value;},setTargetAtTime(value){this.value=value;},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};this.gains.push(gain);return {gain,connect(){},disconnect(){}}; },
  };
}
test('audio initializes only on interaction; mute stops current and future notes', async()=>{
  let calls=0;const context=fakeContext();const player=createSoundPlayer(()=>{calls++;return context;});
  assert.equal(calls,0);await player.play('correct');assert.equal(context.voices.length,6);
  player.setEnabled(false);assert.ok(context.voices.every(v=>v.stops===2));
  await player.play('tap');assert.equal(context.voices.length,6);
  player.setEnabled(true);await player.play('tap');assert.equal(context.voices.length,8);assert.equal(calls,1);
});
test('muting while audio resumes prevents delayed sounds', async()=>{
  const context=fakeContext('suspended');let resolve;
  context.resume=()=>new Promise(r=>{resolve=()=>{context.state='running';r();};});
  const player=createSoundPlayer(()=>context);const pending=player.play('merge');player.setEnabled(false);resolve();await pending;
  assert.equal(context.voices.length,0);
});
test('unsupported or blocked audio does not break gameplay', async()=>{
  await createSoundPlayer(()=>null).play('tap');
  await createSoundPlayer(()=>{throw new Error('blocked');}).play('tap');
});
function fakeTimers(){const jobs=new Map();let id=0;return {jobs,setTimeout(fn){jobs.set(++id,fn);return id;},clearTimeout(key){jobs.delete(key);}};}
test('music starts after interaction, loops once, ducks, and respects independent mute', async()=>{
 const context=fakeContext(), timers=fakeTimers(), player=createSoundPlayer(()=>context,timers);
 assert.equal(timers.jobs.size,0);await player.start();assert.equal(timers.jobs.size,1);const initial=context.voices.length;
 await player.start();assert.equal(timers.jobs.size,1);assert.equal(context.voices.length,initial);
 player.setDucked(true);assert.equal(context.gains[0].value,.18);player.setDucked(false);assert.equal(context.gains[0].value,1);
 player.setMusicEnabled(false);assert.equal(timers.jobs.size,0);assert.ok(context.voices.every(v=>v.stops===2));
 await player.play('tap');assert.ok(context.voices.length>initial);
 await player.setMusicEnabled(true);assert.equal(timers.jobs.size,1);
 player.setEnabled(false);assert.equal(timers.jobs.size,0);const muted=context.voices.length;await player.play('correct');assert.equal(context.voices.length,muted);
 await player.setEnabled(true);assert.equal(timers.jobs.size,1);player.setPaused(true);assert.equal(timers.jobs.size,0);
 await player.setPaused(false);assert.equal(timers.jobs.size,1);player.dispose();assert.equal(timers.jobs.size,0);
});
test('pending music cannot start after the tab is hidden', async()=>{
 const context=fakeContext('suspended'),timers=fakeTimers();let resume;
 context.resume=()=>new Promise(resolve=>{resume=()=>{context.state='running';resolve();};});
 const player=createSoundPlayer(()=>context,timers);const pending=player.start();player.setPaused(true);resume();await pending;
 assert.equal(context.voices.length,0);assert.equal(timers.jobs.size,0);
});
