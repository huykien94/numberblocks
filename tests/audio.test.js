import test from 'node:test';
import assert from 'node:assert/strict';
import { createSoundPlayer } from '../src/audio.js';
function fakeContext(state='running') {
  const voices=[];
  return { state, voices, currentTime:0, destination:{}, resume:async()=>{},
    createOscillator() { const voice={frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){this.started=true;},stop(){this.stops=(this.stops||0)+1;}};voices.push(voice);return voice; },
    createGain() { return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}; },
  };
}
test('audio initializes only on interaction; mute stops current and future notes', async()=>{
  let calls=0;const context=fakeContext();const player=createSoundPlayer(()=>{calls++;return context;});
  assert.equal(calls,0);await player.play('correct');assert.equal(context.voices.length,4);
  player.setEnabled(false);assert.ok(context.voices.every(v=>v.stops===2));
  await player.play('tap');assert.equal(context.voices.length,4);
  player.setEnabled(true);await player.play('tap');assert.equal(context.voices.length,6);assert.equal(calls,1);
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
