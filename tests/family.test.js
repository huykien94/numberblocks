import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_ACTIVITIES, createFamilySession, getFamilyPuzzle, handleFamilyAction, renderFamily, renderFamilyCatalog, renderFamilyParentPreview } from '../src/family.js';

test('Each family activity contains three valid puzzles and three unique bounded answers', () => {
  for (const id of FAMILY_ACTIVITIES) {
    const session = createFamilySession(id, () => .25);
    for (let i=0;i<3;i++) {
      const p = getFamilyPuzzle(session), options = session.choices[i];
      assert.equal(options.length,3); assert.equal(new Set(options).size,3);
      assert.ok(options.includes(p.answer)); assert.ok(options.every(n => Number.isInteger(n) && n>=0 && n<=10));
      if(id==='make-ten') assert.equal(p.initial+p.answer,10);
      if(id==='missing-part') assert.equal(p.total-p.answer,p.remaining);
      if(id==='fair-share') assert.equal(p.groups*p.answer,p.total);
      assert.equal(handleFamilyAction(session,'answer',p.answer).type,'correct');
      assert.equal(handleFamilyAction(session,'next').type,i===2?'completed':'next');
    }
    assert.equal(session.credits,3); assert.equal(session.completed,true);
    assert.equal(handleFamilyAction(session,'next').type,'ignored');
    assert.equal(handleFamilyAction(session,'answer',3).type,'ignored');
  }
});
test('Wrong answers preserve the puzzle, manipulation and choices; correct answers earn credit once even after resetting', () => {
  const s = createFamilySession('make-ten'), p = getFamilyPuzzle(s), choices = [...s.choices[0]];
  handleFamilyAction(s,'seed',6);
  assert.equal(handleFamilyAction(s,'next').type,'ignored');
  assert.equal(handleFamilyAction(s,'answer',choices.find(n=>n!==p.answer)).type,'wrong');
  assert.equal(s.credits,0); assert.equal(s.index,0); assert.deepEqual(s.selected,[6]); assert.deepEqual(s.choices[0],choices);
  handleFamilyAction(s,'answer',p.answer); handleFamilyAction(s,'reset'); handleFamilyAction(s,'answer',p.answer);
  assert.equal(s.credits,1); assert.equal(s.solved,true);
  handleFamilyAction(s,'seed',6); assert.deepEqual(s.selected,[6]);
  handleFamilyAction(s,'next'); assert.equal(s.solved,false); assert.equal(s.index,1); assert.deepEqual(s.selected,[]);
});
test('Manipulations are reversible, constrained to the puzzle, and remain available after answering', () => {
  const add = createFamilySession('make-ten');
  for (const invalid of [-1,0,5,10,1.5,'bad']) assert.equal(handleFamilyAction(add,'seed',invalid).type,'ignored');
  handleFamilyAction(add,'seed',6); handleFamilyAction(add,'seed',6); assert.deepEqual(add.selected,[]);
  const sub = createFamilySession('missing-part'); handleFamilyAction(sub,'seed',0); assert.deepEqual(sub.selected,[0]); handleFamilyAction(sub,'seed',0); assert.deepEqual(sub.selected,[]);
  const share = createFamilySession('fair-share'); for(let i=0;i<6;i++) assert.equal(handleFamilyAction(share,'share').type,'move');
  assert.equal(handleFamilyAction(share,'share').type,'ignored'); assert.equal(share.shared,6);
  handleFamilyAction(share,'reset'); assert.equal(share.shared,0);
  assert.throws(()=>createFamilySession('unknown'),RangeError);
});
test('Language changes only presentation; both languages expose question, choices, interaction and completion', () => {
  for (const id of FAMILY_ACTIVITIES) {
    const s = createFamilySession(id), before=JSON.stringify(s);
    for(const lang of ['vi','en']) {
      const html=renderFamily(s,lang);
      assert.equal((html.match(/data-family-action="answer"/g)||[]).length,3);
      assert.ok(html.includes('tabindex="-1"')); assert.ok(html.includes('role="status"'));
      assert.ok(html.includes(id==='fair-share'?'data-family-action="share"':'data-family-action="seed"'));
    }
    assert.equal(JSON.stringify(s),before);
  }
  for(const lang of ['vi','en']) {
    assert.equal((renderFamilyCatalog(lang).match(/data-family-start=/g)||[]).length,3);
    assert.ok(renderFamilyParentPreview(lang).includes('data-family-print'));
  }
});

test('Correct answers illustrate the actual quantity before any manual move', () => {
  for (const id of FAMILY_ACTIVITIES) {
    const s = createFamilySession(id), p = getFamilyPuzzle(s);
    handleFamilyAction(s,'answer',p.answer);
    if(id==='fair-share') assert.equal(s.shared,p.total);
    else {
      assert.equal(s.selected.length,p.answer);
      if(id==='make-ten') assert.ok(s.selected.every(n => n>=p.initial && n<p.total));
      else assert.equal(p.total-s.selected.length,p.remaining);
    }
    handleFamilyAction(s,'reset');
    assert.equal(s.credits,1); assert.equal(s.solved,true);
  }
});
