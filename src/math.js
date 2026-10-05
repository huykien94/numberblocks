export const limits = { add: [0, 10, 0, 10], subtract: [0, 10, 0, 10], multiply: [1, 5, 1, 4], divide: [1, 20, 1, 5] };
export function result(mode, a, b) {
  if (mode === 'add') return a + b;
  if (mode === 'subtract') return a - b;
  if (mode === 'multiply') return a * b;
  return a / b;
}
export function valid(mode, a, b) {
  const [minA, maxA, minB, maxB] = limits[mode];
  return Number.isInteger(a) && Number.isInteger(b) && a >= minA && a <= maxA && b >= minB && b <= maxB && (mode !== 'subtract' || a >= b) && (mode !== 'divide' || a % b === 0);
}
export function nextValue(mode, a, b, operand, direction) {
  let value = operand === 'a' ? a : b;
  for (let i = 0; i < 20; i++) {
    value += direction;
    const x = operand === 'a' ? value : a, y = operand === 'b' ? value : b;
    if (valid(mode, x, y)) return value;
  }
  return operand === 'a' ? a : b;
}
export function progressTotal(mode, a, b) { return mode === 'add' || mode === 'divide' ? (mode === 'add' ? a + b : a) : b; }
export function makeProblem(mode, random = Math.random) {
  const pick = n => 1 + Math.floor(random() * n);
  if (mode === 'add') return [pick(5), pick(5)];
  if (mode === 'subtract') { const a = pick(9) + 1; return [a, pick(a)]; }
  if (mode === 'multiply') return [pick(5), pick(4)];
  const b = pick(4); return [b * pick(4), b];
}
