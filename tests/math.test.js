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
