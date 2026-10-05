import test from 'node:test';
import assert from 'node:assert/strict';
import { result, valid, nextValue, makeProblem } from '../src/math.js';
test('four operations including zero', () => {
  assert.equal(result('add', 3, 2), 5); assert.equal(result('subtract', 3, 3), 0);
  assert.equal(result('multiply', 3, 4), 12); assert.equal(result('divide', 12, 3), 4);
});
test('no negative subtraction, fractions, or division by zero', () => {
  assert.equal(valid('subtract', 2, 3), false); assert.equal(valid('divide', 5, 2), false);
  assert.equal(valid('divide', 6, 0), false); assert.equal(nextValue('divide', 6, 2, 'a', 1), 8);
  assert.equal(nextValue('subtract', 3, 3, 'b', 1), 3);
});
test('all generated problems are suitable for the selected mode', () => {
  for (const mode of ['add', 'subtract', 'multiply', 'divide']) {
    for (let i = 0; i < 100; i++) { const [a,b] = makeProblem(mode); assert.ok(valid(mode,a,b)); assert.ok(Number.isInteger(result(mode,a,b))); }
  }
});
test('new puzzles exclude the current operands even with repeated random input', () => {
  for (const mode of ['add', 'subtract', 'multiply', 'divide']) {
    let previous = makeProblem(mode, () => 0);
    for (let i=0;i<30;i++) {
      const next = makeProblem(mode, () => 0, previous);
      assert.notDeepEqual(next, previous);
      assert.ok(valid(mode, ...next));
      previous = next;
    }
  }
});
test('answers are shuffled into all positions without duplicates or changing correctness', async()=>{
 const {answerChoices}=await import('../src/math.js');
 const positions=new Set();
 for(const random of [()=>0,()=>.4,()=>.99]){
  const choices=answerChoices(5,random);positions.add(choices.indexOf(5));
  assert.deepEqual([...choices].sort((a,b)=>a-b),[4,5,6]);
 }
 assert.equal(positions.size,3);
 assert.deepEqual(answerChoices(0,()=>.5).sort((a,b)=>a-b),[0,1,2]);
});
test('preschool ranges bound operands, results and answer choices in all operations', async()=>{
 const {problemPool,answerChoices}=await import('../src/math.js');
 for(const max of [5,10])for(const mode of ['add','subtract','multiply','divide']){
  const pool=problemPool(mode,[],max);assert.ok(pool.length>1);
  for(const [a,b] of pool){
   const answer=result(mode,a,b);assert.ok(a<=max&&b<=max&&answer>=0&&answer<=max);assert.ok(Number.isInteger(answer));
   const choices=answerChoices(answer,()=>.5,max);assert.equal(new Set(choices).size,3);assert.ok(choices.includes(answer));assert.ok(choices.every(n=>n>=0&&n<=max));
   assert.notDeepEqual(makeProblem(mode,()=>0,[a,b],max),[a,b]);
  }
 }
});
test('20 range includes larger addition/subtraction and keeps multiplication/division within 10',async()=>{
 const {problemPool,rangeFor,answerChoices}=await import('../src/math.js');
 assert.ok(problemPool('add',[],20).some(([a,b])=>a===12&&b===8));
 assert.ok(problemPool('subtract',[],20).some(([a,b])=>a===20&&b===7));
 assert.ok(problemPool('subtract',[],20).some(([a,b])=>a===20&&b===20));
 for(const mode of ['add','subtract','multiply','divide']){
  const cap=rangeFor(mode,20);for(const [a,b] of problemPool(mode,[],20)){
   const answer=result(mode,a,b);assert.ok(a<=cap&&b<=cap&&answer>=0&&answer<=cap);
   const choices=answerChoices(answer,()=>.5,cap);assert.equal(new Set(choices).size,3);assert.ok(choices.every(n=>n>=0&&n<=cap));
  }
 }
});
