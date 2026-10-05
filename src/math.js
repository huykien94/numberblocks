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
export function problemPool(mode, previous = [], maxQuantity = 20) {
  const pool = [];
  const maxA = mode === 'divide' ? 16 : mode === 'subtract' ? 10 : 5;
  const maxB = mode === 'subtract' ? 10 : mode === 'add' ? 5 : 4;
  for (let a = mode === 'subtract' ? 2 : 1; a <= maxA; a++) {
    for (let b = 1; b <= maxB; b++) {
      if (valid(mode, a, b) && a <= maxQuantity && b <= maxQuantity && result(mode,a,b) <= maxQuantity && (mode !== 'divide' || a / b <= 4) &&
          (a !== previous[0] || b !== previous[1])) pool.push([a, b]);
    }
  }
  return pool;
}

export function makeProblem(mode, random = Math.random, previous = [], maxQuantity = 20) {
  const pool=problemPool(mode,previous,maxQuantity);
  return pool[Math.floor(random()*pool.length)];
}
export function answerChoices(answer, random = Math.random, maxQuantity = Infinity) {
  const distractors=[answer-1,answer+1,answer-2,answer+2].filter(n=>n>=0&&n<=maxQuantity).slice(0,2);
  const choices=[answer,...distractors];
  for(let i=choices.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [choices[i],choices[j]]=[choices[j],choices[i]];
  }
  return choices;
}
