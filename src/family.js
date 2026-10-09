import { answerChoices } from './math.js';

// These short sessions deliberately stay in memory and do not alter operation totals.
export const FAMILY_ACTIVITIES = Object.freeze(['make-ten', 'missing-part', 'fair-share']);
const puzzles = {
  'make-ten': [{ total: 10, initial: 6, answer: 4 }, { total: 10, initial: 3, answer: 7 }, { total: 10, initial: 8, answer: 2 }],
  'missing-part': [{ total: 5, remaining: 3, answer: 2 }, { total: 7, remaining: 4, answer: 3 }, { total: 9, remaining: 5, answer: 4 }],
  'fair-share': [{ total: 6, groups: 2, answer: 3 }, { total: 9, groups: 3, answer: 3 }, { total: 8, groups: 2, answer: 4 }],
};
const copy = {
  vi: {
    title: 'Cùng chăm Vườn Số', intro: 'Ba hoạt động miễn phí để bé chạm, đếm và khám phá cùng người lớn.',
    preview: 'Góc gia đình · Bản giới thiệu', previewText: 'Khám phá ba hoạt động mẫu miễn phí và phiếu chơi ngoài màn hình. Chưa mở bán, không cần tài khoản.',
    names: ['Ghép cho đủ 10', 'Tìm phần bị bớt', 'Chia đều hạt mầm'],
    goals: ['Nhìn số 10 được tạo từ hai phần.', 'Tìm số lượng đã lấy đi khi biết phần còn lại.', 'Chia lần lượt để mỗi bạn nhận bằng nhau.'],
    listen: 'Nghe câu hỏi', basic: 'Bốn phép tính', together: 'Chơi cùng người lớn · khoảng 3–5 phút', start: 'Khám phá', catalog: 'Chọn hoạt động', print: 'Phiếu chơi cùng bé',
    round: 'Bài', of: 'trong 3', correct: 'Đúng rồi! Cùng nhìn lại cách làm nhé.', wrong: 'Chưa đúng rồi. Bé thử đếm lại và chọn nhé!',
    next: 'Bài tiếp theo', finish: 'Hoàn thành lượt chơi', reset: 'Xếp lại hạt', choose: 'Bé chọn một đáp án nhé',
    add: 'Chạm ô trống để thêm hạt. Chạm hạt vừa thêm để lấy lại.', sub: 'Chạm hạt để lấy đi; chạm lại để trả về. Đếm phần còn lại.',
    share: 'Chạm nút chia từng hạt. Hạt lần lượt đến từng bạn.', distribute: 'Chia một hạt', moved: 'Đã thêm', removed: 'Đã lấy đi', left: 'Còn lại', each: 'Mỗi bạn', friend: 'Bạn', waiting: 'Chưa chia',
    done: 'Vườn nhỏ đã hoàn thành!', doneText: 'Bé đã khám phá 3 bài. Cùng nghỉ mắt và thử với đồ vật thật nhé.',
    offline: 'Cùng người lớn dùng đồ vật lớn, an toàn như khối đồ chơi: xếp đủ 10, lấy bớt một phần hoặc chia đều cho hai bạn.',
    note: 'Hoạt động mẫu không lưu tiến độ. Bé có thể chọn đáp án trước hoặc sau khi xếp hạt.',
    seed: 'Hạt', empty: 'Ô trống', questionAdd: n => `${n} thêm mấy để đủ 10?`, questionSub: (n,r) => `${n} bớt mấy thì còn ${r}?`, questionShare: (n,g) => `Chia đều ${n} hạt cho ${g} bạn. Mỗi bạn được mấy hạt?`,
  },
  en: {
    title: 'Grow our Number Garden', intro: 'Three free activities to touch, count and explore with a grown-up.',
    preview: 'Family corner · Preview', previewText: 'Explore three free sample activities and an offline play sheet. Not on sale yet. No account needed.',
    names: ['Make ten', 'Find the missing part', 'Share the seeds equally'],
    goals: ['See how two parts make ten.', 'Find how many were taken away from what is left.', 'Share one at a time so everyone gets the same amount.'],
    listen: 'Hear the question', basic: 'Four operations', together: 'With a grown-up · about 3–5 minutes', start: 'Explore', catalog: 'Choose an activity', print: 'Family play sheet',
    round: 'Puzzle', of: 'of 3', correct: 'That’s right! Look at how it works.', wrong: 'Not quite yet. Try counting again and choose!',
    next: 'Next puzzle', finish: 'Finish this round', reset: 'Reset the seeds', choose: 'Choose an answer',
    add: 'Tap an empty space to add a seed. Tap a new seed to take it back.', sub: 'Tap a seed to take it away; tap again to return it. Count what is left.',
    share: 'Tap to share one seed at a time. Each friend gets a turn.', distribute: 'Share one seed', moved: 'Added', removed: 'Taken away', left: 'Left', each: 'Each friend', friend: 'Friend', waiting: 'Not shared yet',
    done: 'Your little garden is complete!', doneText: 'You explored 3 puzzles. Rest your eyes and try with real objects.',
    offline: 'With a grown-up, use large, safe objects such as toy blocks: make ten, take some away or share equally between two friends.',
    note: 'Sample activities do not save progress. You can answer before or after moving seeds.',
    seed: 'Seed', empty: 'Empty space', questionAdd: n => `How many more does ${n} need to make 10?`, questionSub: (n,r) => `Take how many away from ${n} to leave ${r}?`, questionShare: (n,g) => `Share ${n} seeds equally between ${g} friends. How many does each friend get?`,
  },
};
const words = lang => copy[lang] || copy.vi;
export function createFamilySession(activityId, random = Math.random) {
  if (!FAMILY_ACTIVITIES.includes(activityId)) throw new RangeError('Unknown family activity');
  return { activityId, index: 0, credits: 0, solved: false, completed: false, selected: [], shared: 0, feedback: '', choices: puzzles[activityId].map(p => answerChoices(p.answer, random, 10)) };
}
export function getFamilyPuzzle(session) { return { ...puzzles[session.activityId][session.index] }; }
export function handleFamilyAction(session, action, value) {
  if (session.completed) return { type: 'ignored' };
  const puzzle = getFamilyPuzzle(session);
  if (action === 'answer') {
    const answer = Number(value);
    if (session.solved || !session.choices[session.index].includes(answer)) return { type: 'ignored' };
    session.feedback = answer === puzzle.answer ? 'correct' : 'wrong';
    if (answer !== puzzle.answer) return { type: 'wrong' };
    session.solved = true; session.credits++;
    if (session.activityId === 'fair-share') session.shared = puzzle.total;
    else session.selected = Array.from({length:puzzle.answer}, (_, i) => i + (session.activityId === 'make-ten' ? puzzle.initial : 0));
    return { type: 'correct' };
  }
  if (action === 'next') {
    if (!session.solved) return { type: 'ignored' };
    if (session.index === 2) { session.completed = true; return { type: 'completed' }; }
    session.index++; session.solved = false; session.selected = []; session.shared = 0; session.feedback = '';
    return { type: 'next' };
  }
  if (action === 'reset') { session.selected = []; session.shared = 0; if (!session.solved) session.feedback = ''; return { type: 'reset' }; }
  if (action === 'share' && session.activityId === 'fair-share' && session.shared < puzzle.total) {
    session.shared++; return { type: 'move' };
  }
  if (action === 'seed' && session.activityId !== 'fair-share') {
    const index = Number(value), start = session.activityId === 'make-ten' ? puzzle.initial : 0;
    if (!Number.isInteger(index) || index < start || index >= puzzle.total) return { type: 'ignored' };
    session.selected = session.selected.includes(index) ? session.selected.filter(n => n !== index) : [...session.selected, index];
    return { type: 'move' };
  }
  return { type: 'ignored' };
}
export function renderFamilyCatalog(lang) {
  const c = words(lang);
  return `<main class="family-page"><h1 tabindex="-1">${c.title}</h1><p>${c.intro}</p><div class="family-catalog">${FAMILY_ACTIVITIES.map((id,i) => `<article><span class="family-badge" aria-hidden="true">${['10','−','÷'][i]}</span><h2>${c.names[i]}</h2><p>${c.goals[i]}</p><small>${c.together}</small><button data-family-start="${id}">${c.start}</button></article>`).join('')}</div><p class="family-note">${c.note}</p><button data-family-print>${c.print}</button> <button data-choose>${c.basic}</button></main>`;
}
export function renderFamilyParentPreview(lang) {
  const c = words(lang);
  return `<section class="family-parent"><h3>${c.preview}</h3><p>${c.previewText}</p><button data-family-catalog>${c.catalog}</button><button data-family-print>${c.print}</button></section>`;
}
function renderSeeds(session, c, p) {
  if (session.activityId === 'fair-share') {
    return `<div class="family-groups">${Array.from({length:p.groups},(_,group) => { const amount = Math.floor(session.shared / p.groups) + (group < session.shared % p.groups ? 1 : 0); return `<section><h3>${c.friend} ${group+1}</h3><div class="family-shared-seeds">${Array.from({length:amount},() => '<span aria-hidden="true">●</span>').join('')}</div><strong>${amount}</strong></section>`; }).join('')}</div><p>${c.waiting}: <strong>${p.total-session.shared}</strong></p><button data-family-action="share" ${session.shared === p.total ? 'disabled' : ''}>${c.distribute}</button>`;
  }
  const adding = session.activityId === 'make-ten';
  return `<div class="family-seed-grid">${Array.from({length:p.total},(_,i) => {
    const fixed = adding && i < p.initial, selected = session.selected.includes(i), filled = adding ? fixed || selected : !selected;
    if (fixed) return `<span class="family-seed is-fixed" aria-label="${c.seed} ${i+1}"><span aria-hidden="true">●</span></span>`;
    return `<button class="family-seed ${filled ? 'is-filled' : 'is-empty'}" data-family-action="seed" data-family-value="${i}" aria-pressed="${selected}" aria-label="${filled ? c.seed : c.empty} ${i+1}"><span aria-hidden="true">${filled ? '●' : '+'}</span></button>`;
  }).join('')}</div><p>${adding ? c.moved : c.removed}: <strong>${session.selected.length}</strong>${adding ? '' : ` · ${c.left}: <strong>${p.total-session.selected.length}</strong>`}</p>`;
}
export function renderFamily(session, lang) {
  const c = words(lang), index = FAMILY_ACTIVITIES.indexOf(session.activityId), p = getFamilyPuzzle(session);
  if (session.completed) return `<main class="family-page family-complete"><h1 tabindex="-1">${c.done}</h1><p>${c.doneText}</p><p>${c.offline}</p><button data-family-print>${c.print}</button><button data-family-catalog>${c.catalog}</button></main>`;
  const question = index === 0 ? c.questionAdd(p.initial) : index === 1 ? c.questionSub(p.total,p.remaining) : c.questionShare(p.total,p.groups);
  const equation = index === 0 ? `${p.initial} + ${session.solved ? p.answer : '?'} = 10` : index === 1 ? `${p.total} − ${session.solved ? p.answer : '?'} = ${p.remaining}` : `${p.total} ÷ ${p.groups} = ${session.solved ? p.answer : '?'}`;
  return `<main class="family-page"><div class="family-toolbar"><button data-family-catalog>${c.catalog}</button><span>${c.round} ${session.index+1} ${c.of}</span></div><h1 tabindex="-1">${c.names[index]}</h1><div class="family-play"><section class="family-question"><h2>${question}</h2><div class="family-equation">${equation}</div><p>${c.choose}</p><div class="family-answers">${session.choices[session.index].map(n => `<button data-family-action="answer" data-family-value="${n}" ${session.solved ? 'disabled' : ''} class="${session.solved && n === p.answer ? 'is-correct' : ''}">${n}${session.solved && n === p.answer ? '<span aria-hidden="true"> ✓</span>' : ''}</button>`).join('')}</div><p class="family-feedback" role="status">${session.feedback ? c[session.feedback] : ''}</p>${session.solved ? `<button data-family-action="next">${session.index === 2 ? c.finish : c.next}</button>` : ''}</section><section class="family-manipulation"><button data-listen aria-label="${c.listen}">${c.listen}</button><p>${[c.add,c.sub,c.share][index]}</p>${renderSeeds(session,c,p)}<button class="family-reset" data-family-action="reset">${c.reset}</button></section></div></main>`;
}
