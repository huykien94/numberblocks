import test from 'node:test';
import assert from 'node:assert/strict';
import { result, valid, nextValue, makeProblem, problemPool, rangeFor, answerChoices } from '../src/math.js';

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
test('four operations including zero', () => {
  assert.equal(result('add', 3, 2), 5); assert.equal(result('subtract', 3, 3), 0);
  assert.equal(result('multiply', 3, 4), 12); assert.equal(result('divide', 12, 3), 4);
});
test('no negative subtraction, fractions, or division by zero', () => {
  assert.equal(valid('subtract', 2, 3), false); assert.equal(valid('divide', 5, 2), false);
  assert.equal(valid('divide', 6, 0), false); assert.equal(nextValue('divide', 6, 2, 'a', 1), 8);
  assert.equal(nextValue('subtract', 3, 3, 'b', 1), 3);
});
test('mọi bài được sinh phù hợp phép tính đã chọn, dùng seed cố định', () => {
  for (const mode of ['add', 'subtract', 'multiply', 'divide']) {
    const random=seededRandom(20261009);
    for (let i = 0; i < 100; i++) { const [a,b] = makeProblem(mode,random); assert.ok(valid(mode,a,b)); assert.ok(Number.isInteger(result(mode,a,b))); }
  }
});
test('phép cộng bao phủ mọi cặp số dương có tổng trong phạm vi 5, 10 và 20', () => {
  for (const max of [5,10,20]) {
    const pool=problemPool('add',[],max);
    const pairs=new Set(pool.map(pair=>pair.join(',')));
    assert.equal(pairs.size,max*(max-1)/2);
    assert.equal(pool.length,pairs.size);
    for(let a=1;a<max;a++)for(let b=1;b<=max-a;b++){
      assert.ok(pairs.has(`${a},${b}`),`Thiếu ${a}+${b} trong phạm vi ${max}`);
    }
    assert.ok(pool.every(([a,b])=>Number.isInteger(a)&&Number.isInteger(b)&&a>0&&b>0&&a+b<=max));
  }
  for(const pair of [[6,1],[1,6],[7,2],[2,7],[9,1],[1,9]]){
    assert.ok(problemPool('add',[],10).some(([a,b])=>a===pair[0]&&b===pair[1]));
    assert.equal(problemPool('add',pair,10).length,44);
    assert.ok(problemPool('add',pair,10).every(([a,b])=>a!==pair[0]||b!==pair[1]));
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
test('đáp án đúng có thể nhỏ nhất, ở giữa hoặc lớn nhất và xuất hiện ở cả ba vị trí nút', ()=>{
 for(const max of [5,10,20])for(let answer=2;answer<=max-2;answer++){
  const ranks=new Set(),positions=new Set(),sets=new Set();
  for(let seed=1;seed<=256;seed++){
   const choices=answerChoices(answer,seededRandom(seed),max);
   ranks.add(choices.filter(n=>n<answer).length);
   positions.add(choices.indexOf(answer));
   sets.add([...choices].sort((a,b)=>a-b).join(','));
  }
  assert.deepEqual([...ranks].sort(),[0,1,2],`Thứ hạng giá trị: đáp án ${answer}, phạm vi ${max}`);
  assert.deepEqual([...positions].sort(),[0,1,2],`Vị trí nút: đáp án ${answer}, phạm vi ${max}`);
  assert.ok(sets.size>1);
 }
});
test('ba lựa chọn luôn khác nhau, chỉ một đáp án đúng và nhiễu gần kết quả kể cả tại biên', ()=>{
 for(const max of [5,10,20])for(let answer=0;answer<=max;answer++){
  for(let seed=1;seed<=128;seed++){
   const choices=answerChoices(answer,seededRandom(seed),max);
   assert.equal(choices.length,3);
   assert.equal(new Set(choices).size,3);
   assert.equal(choices.filter(n=>n===answer).length,1);
   assert.ok(choices.every(n=>Number.isInteger(n)&&n>=0&&n<=max&&Math.abs(n-answer)<=2));
  }
 }
 for(const max of [5,10,20]){
  assert.deepEqual(answerChoices(0,()=>0,max).sort((a,b)=>a-b),[0,1,2]);
  assert.deepEqual(answerChoices(max,()=>.999,max).sort((a,b)=>a-b),[max-2,max-1,max]);
 }
});
test('mặc định Infinity và RNG trả một giá trị cố định vẫn tạo ba lựa chọn hữu hạn', ()=>{
 for(const answer of [0,1,5,19,20])for(const value of [0,.5,.999]){
  const choices=answerChoices(answer,()=>value);
  assert.equal(choices.length,3);
  assert.equal(new Set(choices).size,3);
  assert.equal(choices.filter(n=>n===answer).length,1);
  assert.ok(choices.every(n=>Number.isFinite(n)&&Number.isInteger(n)&&n>=0&&Math.abs(n-answer)<=2));
  assert.deepEqual(answerChoices(answer,seededRandom(42)),answerChoices(answer,seededRandom(42)));
 }
});
test('preschool ranges bound operands, results and answer choices in all operations', ()=>{
 for(const max of [5,10])for(const mode of ['add','subtract','multiply','divide']){
  const pool=problemPool(mode,[],max);assert.ok(pool.length>1);
  for(const [a,b] of pool){
   const answer=result(mode,a,b);assert.ok(a<=max&&b<=max&&answer>=0&&answer<=max);assert.ok(Number.isInteger(answer));
   const choices=answerChoices(answer,()=>.5,max);assert.equal(new Set(choices).size,3);assert.ok(choices.includes(answer));assert.ok(choices.every(n=>n>=0&&n<=max));
   assert.notDeepEqual(makeProblem(mode,()=>0,[a,b],max),[a,b]);
  }
 }
});
test('20 range includes larger addition/subtraction and keeps multiplication/division within 10',()=>{
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
