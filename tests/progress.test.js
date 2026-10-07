import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgressStore, createRound, STORAGE_KEY, ROUND_SIZE} from '../src/progress.js';

function storage(initial = null) {
  let value = initial;
  return {getItem: key => key === STORAGE_KEY ? value : null, setItem: (key, data) => { assert.equal(key, STORAGE_KEY); value = data; }};
}

test('preferences and operation counts survive reopening, without recording personal or answer data', () => {
  const disk=storage();
  const first=createProgressStore(()=>disk);
  first.preferences({lang:'en',range:20,sound:false,music:false});
  first.complete('add');first.complete('subtract');first.complete('add');
  const next=createProgressStore(()=>disk);
  assert.deepEqual(next.data.preferences,{lang:'en',range:20,sound:false,music:false});
  assert.deepEqual(next.data.completed,{add:2,subtract:1,multiply:0,divide:0});
  assert.equal(next.total,3);
  assert.deepEqual(Object.keys(JSON.parse(disk.getItem(STORAGE_KEY))).sort(),['completed','preferences','version']);
});

test('corrupted, unsupported and malformed stored values recover to safe defaults', () => {
  for(const raw of ['{broken', 'null', JSON.stringify({version:99}), JSON.stringify({version:1,preferences:{lang:'<script>',range:999,sound:'false'},completed:{add:-1,subtract:1.5,multiply:Infinity,divide:'3'}})]) {
    const store=createProgressStore(()=>storage(raw));
    assert.deepEqual(store.data.preferences,{lang:'vi',range:5,sound:true,music:true});
    assert.equal(store.total,0);
  }
});

test('unavailable or full storage does not stop play or lose in-memory progress', () => {
  const unavailable=createProgressStore(()=>{throw new Error('blocked');});
  unavailable.complete('multiply');unavailable.preferences({sound:false});
  assert.equal(unavailable.total,1);assert.equal(unavailable.available,false);
  assert.equal(unavailable.data.preferences.sound,false);
  const full=createProgressStore(()=>({getItem:()=>null,setItem:()=>{throw new Error('quota');}}));
  full.complete('divide');assert.equal(full.total,1);assert.equal(full.available,false);
});

test('a five-puzzle round counts correct puzzles once, regardless of reset/retry', () => {
  const round=createRound();
  const store=createProgressStore(()=>storage());
  const answer=id=>{if(round.credit(id))store.complete('add');};
  answer('first');answer('first');answer('first');
  assert.equal(round.count,1);assert.equal(store.total,1);assert.equal(round.finished,false);
  for(let i=1;i<ROUND_SIZE;i++)answer(`puzzle-${i}`);
  answer('extra');
  assert.equal(round.finished,true);assert.equal(round.count,5);assert.equal(store.total,5);
  const next=createRound();assert.equal(next.count,0);assert.equal(next.credit('first'),true);
});
