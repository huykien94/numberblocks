export const STORAGE_KEY = 'numberblocks-v1';
export const ROUND_SIZE = 5;
export const operations = ['add', 'subtract', 'multiply', 'divide'];
const MAX_COUNT = 1_000_000;
const isCount = value => Number.isSafeInteger(value) && value >= 0 && value <= MAX_COUNT;
const count = value => isCount(value) ? value : 0;
const breakdownKeys = ['withoutDemo', 'withDemo', 'withoutRetry', 'afterRetry'];
const emptyBreakdown = () => Object.fromEntries(breakdownKeys.map(key => [key, 0]));

function normalizeBreakdown(value, completed) {
  if (!breakdownKeys.every(key => isCount(value?.[key]))) return emptyBreakdown();
  const demoTotal = value.withoutDemo + value.withDemo;
  const retryTotal = value.withoutRetry + value.afterRetry;
  // Hai chiều mô tả cùng số bài; phần còn lại chưa có dữ liệu phân loại.
  if (demoTotal !== retryTotal || demoTotal > completed) return emptyBreakdown();
  return Object.fromEntries(breakdownKeys.map(key => [key, value[key]]));
}

function normalize(value) {
  const data = value?.version === 1 ? value : {};
  const completed = Object.fromEntries(operations.map(mode => [mode, count(data.completed?.[mode])]));
  return {
    version: 1,
    preferences: {
      lang: data.preferences?.lang === 'en' ? 'en' : 'vi',
      range: [5, 10, 20].includes(data.preferences?.range) ? data.preferences.range : 5,
      sound: typeof data.preferences?.sound === 'boolean' ? data.preferences.sound : true,
      music: typeof data.preferences?.music === 'boolean' ? data.preferences.music : true,
    },
    completed,
    breakdown: Object.fromEntries(operations.map(mode => [mode, normalizeBreakdown(data.breakdown?.[mode], completed[mode])])),
  };
}

// Storage can be blocked or full. Learning must still work in memory.
export function createProgressStore(getStorage = () => globalThis.localStorage) {
  let data = normalize(null);
  let available = true;
  try { data = normalize(JSON.parse(getStorage().getItem(STORAGE_KEY))); }
  catch { available = false; }
  function save() {
    try { getStorage().setItem(STORAGE_KEY, JSON.stringify(data)); available = true; }
    catch { available = false; }
  }
  return {
    get data() { return structuredClone(data); },
    get available() { return available; },
    get total() { return Object.values(data.completed).reduce((sum, n) => sum + n, 0); },
    preferences(patch) { data = normalize({...data, preferences: {...data.preferences, ...patch}}); save(); },
    complete(mode, attempt) {
      if (!operations.includes(mode) || data.completed[mode] >= MAX_COUNT) return;
      data.completed[mode] += 1;
      if (typeof attempt?.usedDemo === 'boolean' && typeof attempt?.retried === 'boolean') {
        data.breakdown[mode][attempt.usedDemo ? 'withDemo' : 'withoutDemo'] += 1;
        data.breakdown[mode][attempt.retried ? 'afterRetry' : 'withoutRetry'] += 1;
      }
      save();
    },
  };
}

export function createRound() {
  const completed = new Set();
  return {
    get count() { return completed.size; },
    get finished() { return completed.size >= ROUND_SIZE; },
    credit(puzzleId) {
      if (completed.has(puzzleId) || completed.size >= ROUND_SIZE) return false;
      completed.add(puzzleId);
      return true;
    },
  };
}
