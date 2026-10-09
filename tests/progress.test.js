import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgressStore, createRound, STORAGE_KEY, ROUND_SIZE, operations} from '../src/progress.js';

const emptyBreakdown = {withoutDemo:0,withDemo:0,withoutRetry:0,afterRetry:0};
const preferences = {lang:'en',range:20,sound:false,music:false};

function storage(initial = null) {
  let value = initial;
  return {getItem: key => key === STORAGE_KEY ? value : null, setItem: (key, data) => { assert.equal(key, STORAGE_KEY); value = data; }};
}

test('preferences and operation counts survive reopening, without recording personal or answer data', () => {
  const disk=storage();
  const first=createProgressStore(()=>disk);
  first.preferences(preferences);
  first.complete('add');first.complete('subtract');first.complete('add');
  const next=createProgressStore(()=>disk);
  assert.deepEqual(next.data.preferences,preferences);
  assert.deepEqual(next.data.completed,{add:2,subtract:1,multiply:0,divide:0});
  assert.equal(next.total,3);
  const saved=JSON.parse(disk.getItem(STORAGE_KEY));
  assert.deepEqual(Object.keys(saved).sort(),['breakdown','completed','preferences','version']);
  assert.equal(saved.version,1);
  for(const mode of operations)assert.deepEqual(saved.breakdown[mode],emptyBreakdown);
});

test('giữ tổng và cài đặt cũ, chỉ phân loại bài hoàn thành sau khi nâng cấp', () => {
  const disk=storage(JSON.stringify({version:1,preferences,completed:{add:12,subtract:3,multiply:2,divide:1}}));
  const store=createProgressStore(()=>disk);
  assert.deepEqual(store.data.preferences,preferences);
  assert.equal(store.total,18);
  for(const mode of operations)assert.deepEqual(store.data.breakdown[mode],emptyBreakdown);
  store.complete('add',{usedDemo:true,retried:false});
  store.preferences({range:10});
  const reopened=createProgressStore(()=>disk);
  assert.equal(reopened.total,19);
  assert.deepEqual(reopened.data.completed,{add:13,subtract:3,multiply:2,divide:1});
  assert.deepEqual(reopened.data.preferences,{...preferences,range:10});
  assert.deepEqual(reopened.data.breakdown.add,{withoutDemo:0,withDemo:1,withoutRetry:1,afterRetry:0});
  const {withoutDemo,withDemo}=reopened.data.breakdown.add;
  assert.equal(reopened.data.completed.add-withoutDemo-withDemo,12);
});

test('phân loại đủ bốn tổ hợp làm mẫu và thử lại, mỗi chiều cùng tổng bài', () => {
  const disk=storage();
  const store=createProgressStore(()=>disk);
  for(const mode of operations) {
    for(const usedDemo of [false,true])for(const retried of [false,true]) {
      const before=store.data;
      store.complete(mode,{usedDemo,retried});
      const after=store.data;
      assert.equal(after.completed[mode],before.completed[mode]+1);
      const keys=[usedDemo?'withDemo':'withoutDemo',retried?'afterRetry':'withoutRetry'];
      for(const key of Object.keys(emptyBreakdown))assert.equal(after.breakdown[mode][key],before.breakdown[mode][key]+Number(keys.includes(key)));
    }
  }
  const reopened=createProgressStore(()=>disk);
  assert.equal(reopened.total,16);
  for(const mode of operations) {
    assert.equal(reopened.data.completed[mode],4);
    assert.deepEqual(reopened.data.breakdown[mode],{withoutDemo:2,withDemo:2,withoutRetry:2,afterRetry:2});
  }
});

test('thiếu hoặc sai kiểu thông tin thao tác vẫn cộng tổng, không suy đoán phân loại', () => {
  const store=createProgressStore(()=>storage());
  const attempts=[undefined,null,{},false,{usedDemo:false},{retried:true},{usedDemo:1,retried:true},{usedDemo:false,retried:'false'}];
  for(const attempt of attempts)store.complete('subtract',attempt);
  assert.equal(store.data.completed.subtract,attempts.length);
  assert.deepEqual(store.data.breakdown.subtract,emptyBreakdown);
  const before=store.data;
  for(const mode of ['unknown','__proto__',null,undefined,1])store.complete(mode,{usedDemo:false,retried:false});
  assert.deepEqual(store.data,before);
});

test('không lưu dữ liệu nhận dạng hoặc lịch sử đáp án từ tham số ngoài hợp đồng', () => {
  const disk=storage();
  const store=createProgressStore(()=>disk);
  store.complete('divide',{usedDemo:true,retried:true,name:'test-child',answer:3,puzzleId:'test-puzzle',timestamp:123});
  store.preferences({...preferences,name:'test-child'});
  const saved=JSON.parse(disk.getItem(STORAGE_KEY));
  assert.deepEqual(saved,{
    version:1,
    preferences,
    completed:{add:0,subtract:0,multiply:0,divide:1},
    breakdown:{add:emptyBreakdown,subtract:emptyBreakdown,multiply:emptyBreakdown,divide:{withoutDemo:0,withDemo:1,withoutRetry:0,afterRetry:1}},
  });
});

test('corrupted, unsupported and malformed stored values recover to safe defaults', () => {
  for(const raw of ['{broken', 'null', JSON.stringify({version:99}), JSON.stringify({version:1,preferences:{lang:'<script>',range:999,sound:'false'},completed:{add:-1,subtract:1.5,multiply:Infinity,divide:'3'}})]) {
    const store=createProgressStore(()=>storage(raw));
    assert.deepEqual(store.data.preferences,{lang:'vi',range:5,sound:true,music:true});
    assert.equal(store.total,0);
  }
});

test('số liệu phân loại lỗi không làm mất tổng, cài đặt hay số liệu phép tính khác', () => {
  const valid={withoutDemo:2,withDemo:1,withoutRetry:1,afterRetry:2};
  const invalid=[
    null, {}, {withoutDemo:2,withDemo:1,withoutRetry:1},
    {...valid,withoutDemo:-1}, {...valid,withDemo:1.5}, {...valid,afterRetry:'2'},
    {...valid,withoutRetry:1_000_001}, {...valid,withoutDemo:Number.MAX_SAFE_INTEGER+1},
    {withoutDemo:4,withDemo:0,withoutRetry:2,afterRetry:2},
    {withoutDemo:2,withDemo:1,withoutRetry:0,afterRetry:2},
  ];
  for(const breakdown of invalid) {
    const disk=storage(JSON.stringify({version:1,preferences,completed:{add:3,subtract:3},breakdown:{add:breakdown,subtract:valid}}));
    const store=createProgressStore(()=>disk);
    assert.equal(store.total,6);
    assert.deepEqual(store.data.preferences,preferences);
    assert.deepEqual(store.data.breakdown.add,emptyBreakdown);
    assert.deepEqual(store.data.breakdown.subtract,valid);
    store.complete('add',{usedDemo:false,retried:true});
    const reopened=createProgressStore(()=>disk);
    assert.equal(reopened.total,7);
    assert.deepEqual(reopened.data.breakdown.add,{withoutDemo:1,withDemo:0,withoutRetry:0,afterRetry:1});
    assert.deepEqual(reopened.data.breakdown.subtract,valid);
  }
});

test('không đọc nhầm dữ liệu có phiên bản chưa hỗ trợ', () => {
  const store=createProgressStore(()=>storage(JSON.stringify({
    version:2,preferences,completed:{add:20},
    breakdown:{add:{withoutDemo:10,withDemo:10,withoutRetry:10,afterRetry:10}},
  })));
  assert.equal(store.total,0);
  assert.deepEqual(store.data.preferences,{lang:'vi',range:5,sound:true,music:true});
  for(const mode of operations)assert.deepEqual(store.data.breakdown[mode],emptyBreakdown);
});

test('giới hạn tổng một triệu không để thống kê phân loại tăng vượt tổng', () => {
  const disk=storage(JSON.stringify({version:1,completed:{add:999_999},breakdown:{add:{withoutDemo:999_999,withDemo:0,withoutRetry:0,afterRetry:999_999}}}));
  const store=createProgressStore(()=>disk);
  store.complete('add',{usedDemo:true,retried:false});
  store.complete('add',{usedDemo:true,retried:false});
  store.complete('add');
  const reopened=createProgressStore(()=>disk);
  assert.equal(reopened.data.completed.add,1_000_000);
  assert.deepEqual(reopened.data.breakdown.add,{withoutDemo:999_999,withDemo:1,withoutRetry:1,afterRetry:999_999});
});

test('thay đổi bản sao dữ liệu không tác động tổng hoặc phân loại bên trong', () => {
  const store=createProgressStore(()=>storage());
  store.complete('multiply',{usedDemo:false,retried:true});
  const snapshot=store.data;
  snapshot.completed.multiply=999;
  snapshot.preferences.range=20;
  snapshot.breakdown.multiply.withDemo=999;
  assert.equal(store.total,1);
  assert.equal(store.data.preferences.range,5);
  assert.deepEqual(store.data.breakdown.multiply,{withoutDemo:1,withDemo:0,withoutRetry:0,afterRetry:1});
});

test('unavailable or full storage does not stop play or lose in-memory progress', () => {
  const unavailable=createProgressStore(()=>{throw new Error('blocked');});
  unavailable.complete('multiply',{usedDemo:true,retried:false});unavailable.preferences({sound:false});
  assert.equal(unavailable.total,1);assert.equal(unavailable.available,false);
  assert.equal(unavailable.data.preferences.sound,false);
  assert.deepEqual(unavailable.data.breakdown.multiply,{withoutDemo:0,withDemo:1,withoutRetry:1,afterRetry:0});
  const full=createProgressStore(()=>({getItem:()=>null,setItem:()=>{throw new Error('quota');}}));
  full.complete('divide',{usedDemo:false,retried:true});assert.equal(full.total,1);assert.equal(full.available,false);
  assert.deepEqual(full.data.breakdown.divide,{withoutDemo:1,withDemo:0,withoutRetry:0,afterRetry:1});
});

test('lưu lại được sau lỗi bộ nhớ sẽ giữ cả số liệu chỉ có trong phiên hiện tại', () => {
  const disk=storage();
  let blocked=true;
  const store=createProgressStore(()=>({getItem:disk.getItem,setItem:(key,value)=>{
    if(blocked)throw new Error('quota');
    disk.setItem(key,value);
  }}));
  store.complete('add',{usedDemo:true,retried:true});
  assert.equal(store.available,false);
  blocked=false;
  store.preferences(preferences);
  assert.equal(store.available,true);
  const reopened=createProgressStore(()=>disk);
  assert.equal(reopened.total,1);
  assert.deepEqual(reopened.data.preferences,preferences);
  assert.deepEqual(reopened.data.breakdown.add,{withoutDemo:0,withDemo:1,withoutRetry:0,afterRetry:1});
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
