import './style.css';
import { result, progressTotal, makeProblem, answerChoices } from './math.js';
import { createSoundPlayer } from './audio.js';
import { createNarrator, questionText, numberText } from './narration.js';
import { createBlockMotion } from './motion.js';
const motion=createBlockMotion();
let activity=0, moving=false, grouping=false, counting=null;
const sounds = createSoundPlayer();
const copy = {
 vi: {club:'CÂU LẠC BỘ TOÁN CỦA BÉ', badge:'CHƠI MÀ HỌC, HỌC MÀ VUI', hero:'Những khối nhỏ.', hero2:'Khám phá thật to!', intro:'Cùng những người bạn khối số chạm, đếm và khám phá thế giới toán học.', parent:'Dành cho ba mẹ', sound:'Âm thanh', on:'Bật', off:'Tắt', add:'Cộng', subtract:'Trừ', multiply:'Nhân', divide:'Chia', subadd:'Gộp lại nào', subsubtract:'Bớt đi nhé', submultiply:'Thêm từng nhóm', subdivide:'Chia đều thôi', titleadd:'Cùng nhau gộp khối!', titlesubtract:'Cùng nhau bớt khối!', titlemultiply:'Cùng nhau tạo nhóm!', titledivide:'Cùng nhau chia đều!', descadd:'Hai nhóm bạn nhỏ gặp nhau. Có tất cả bao nhiêu khối?', descsubtract:'Một vài bạn rời nhóm. Còn lại bao nhiêu khối?', descmultiply:'Mỗi nhóm có số khối bằng nhau. Có tất cả bao nhiêu khối?', descdivide:'Chia các khối vào từng nhóm. Mỗi nhóm có bao nhiêu khối?', step:'BÀI TOÁN BẤT NGỜ', groupA:'Nhóm thứ nhất', groupB:'Nhóm thứ hai', total:'Số khối ban đầu', remove:'Số khối bớt đi', each:'Khối mỗi nhóm', groups:'Số nhóm', tip:'Bấm + hoặc − để thay đổi số', play:'CHẠM VÀ KHÁM PHÁ', tap:'Chạm từng khối để gộp vào giỏ nhé!', tapSubtract:'Chạm từng khối để bớt đi nhé!', tapMultiply:'Chạm vào nhóm để thêm các khối nhé!', tapDivide:'Chạm từng khối để chia lần lượt nhé!', basket:'Chiếc giỏ kết quả', empty:'Các khối đang đợi bé!', actionadd:'Gộp tất cả', actionsubtract:'Bớt khối', actionmultiply:'Tạo các nhóm', actiondivide:'Chia đều', reset:'Làm lại', new:'Bài mới', answer:'Bé đếm được bao nhiêu?', correct:'Chính xác! Giỏi lắm!', retry:'Gần đúng rồi! Cùng đếm lại các khối nhé.', done:'Tuyệt vời! Cùng đếm kết quả nào.', help:'Nghe hướng dẫn', footer:'Mỗi khối nhỏ, một khám phá lớn.', footsub:'Một sân chơi toán học dành cho những trí tò mò nhỏ.', safe:'Không quảng cáo', ages:'Dành cho bé 3–6 tuổi', feature1:'Chạm để hiểu', feature1text:'Tự tay gộp khối, tự mình khám phá.', feature2:'Học theo nhịp của bé', feature2text:'Không đếm giờ. Không áp lực.', feature3:'Hai ngôn ngữ, thêm niềm vui', feature3text:'Khám phá bằng tiếng Việt và tiếng Anh.', stars:'Ngôi sao của bé', parentTitle:'Cùng bé khám phá toán học', parentText:'Mỗi bài có hai số ngẫu nhiên. Với phép cộng, mỗi nhóm có từ 1 đến 5 khối. Mời bé chạm từng khối và đếm thành tiếng, sau đó chọn đáp án. Bấm Bài mới để khám phá hai số khác, hoặc Làm lại để chơi lại bài hiện tại. Với phép nhân và chia, hãy cùng bé quan sát các nhóm bằng nhau.', parentNote:'Không giới hạn thời gian, không tài khoản và không thu thập thông tin của bé. Ngôi sao chỉ được lưu trong phiên chơi. Âm thanh vui nhộn bắt đầu khi bé chạm và có thể tắt bằng nút âm thanh. Giọng đọc tùy thuộc trình duyệt và giọng đã cài trên thiết bị.', close:'Đã hiểu', block:'khối', group:'Nhóm', choose:'Chọn đáp án', zero:'Không còn khối nào', count:'Đã chuyển', completed:'Đã hoàn thành', soundUnavailable:'Thiết bị chưa hỗ trợ giọng đọc. Bé vẫn có thể xem hướng dẫn trên màn hình.'},
 en: {club:'LITTLE MATH CLUB', badge:'A LITTLE PLAY. A LOT OF DISCOVERY.', hero:'Little blocks.', hero2:'Big discoveries!', intro:'Tap, count and explore a world of numbers with your little block friends.', parent:'For parents', sound:'Sound', on:'On', off:'Off', add:'Add', subtract:'Subtract', multiply:'Multiply', divide:'Divide', subadd:'Bring together', subsubtract:'Take some away', submultiply:'Make little groups', subdivide:'Share equally', titleadd:'Let’s bring blocks together!', titlesubtract:'Let’s take some blocks away!', titlemultiply:'Let’s make equal groups!', titledivide:'Let’s share the blocks!', descadd:'Two little groups meet. How many blocks are there altogether?', descsubtract:'Some friends leave the group. How many blocks are left?', descmultiply:'Every group has the same number of blocks. How many altogether?', descdivide:'Share the blocks equally. How many are in each group?', step:'A LITTLE NUMBER SURPRISE', groupA:'First group', groupB:'Second group', total:'Starting blocks', remove:'Blocks to take away', each:'Blocks in each group', groups:'Number of groups', tip:'Tap + or − to change the numbers', play:'TAP AND DISCOVER', tap:'Tap each block to put it in the basket!', tapSubtract:'Tap a block to take it away!', tapMultiply:'Tap a group to add its blocks!', tapDivide:'Tap each block to share them in turn!', basket:'Your answer basket', empty:'The blocks are waiting for you!', actionadd:'Bring all together', actionsubtract:'Take blocks away', actionmultiply:'Make all groups', actiondivide:'Share equally', reset:'Try again', new:'New puzzle', answer:'How many can you count?', correct:'Well done! You counted them all!', retry:'Almost! Let’s count the blocks again.', done:'Amazing! Let’s count the answer.', help:'Listen to instructions', footer:'A little block. A big discovery.', footsub:'A math playground for little curious minds.', safe:'Ad-free play', ages:'For ages 3–6', feature1:'Little hands, big ideas', feature1text:'Move the blocks. Discover for yourself.', feature2:'At your own little pace', feature2text:'No timers. No pressure.', feature3:'Two languages, twice the fun', feature3text:'Explore in Vietnamese and English.', stars:'Your stars', parentTitle:'Explore numbers together', parentText:'Each puzzle has two random numbers. Addition groups have 1 to 5 blocks each. Invite your child to tap and count each block out loud, then choose an answer. Choose New puzzle for different numbers, or Try again to replay the current puzzle. For multiplication and division, explore the equal groups together.', parentNote:'No time limits, accounts or collection of your child’s information. Stars last for this play session only. Playful sounds start on interaction and can be muted with the sound button. Speech depends on the browser and voices installed on your device.', close:'Got it', block:'blocks', group:'Group', choose:'Choose an answer', zero:'No blocks left', count:'Moved', completed:'Completed', soundUnavailable:'Speech is unavailable on this device. You can still read the instructions on screen.'}
};
Object.assign(copy.vi, {
 wrongTitle:'Chưa đúng rồi, bé ơi!', wrongNote:'Không sao cả! Mình cùng chơi lại và đếm thật kỹ nhé.', replay:'Chơi lại từ đầu', start:'Bắt đầu chơi', pickTitle:'Hôm nay bé muốn chơi gì?', pickSubtitle:'Chọn một phép tính để cùng các bạn khối số khám phá nhé!',
 back:'Quay lại', home:'Trang đầu', change:'Đổi phép tính', ready:'Bé sẵn sàng chưa?', waiting:'Bé có thể chọn đáp án ngay, hoặc chạm khối để đếm nhé!',
 chooseHint:'Chọn con số bé vừa đếm được', yourPuzzle:'BÀI TOÁN CỦA BÉ', wellDone:'Một ngôi sao cho bé!',
 nextPuzzle:'Chơi bài tiếp', explore:'Sân chơi của bé', soundTip:'Chạm để chơi · Bật tiếng để nghe niềm vui', voiceHelp:'Cách bật giọng đọc', testVoice:'Thử giọng đọc', voiceTitle:'Giọng đọc trên máy tính bảng', voiceInstructions:'Nếu có nhạc nhưng không có lời đọc: thử mở game bằng Chrome. Trên Samsung, vào Cài đặt → Quản lý chung → Chuyển văn bản thành giọng nói, chọn bộ đọc của Google nếu có và tải dữ liệu giọng tiếng Việt. Tên mục có thể khác theo phiên bản Android. Sau đó mở lại game và bấm Thử giọng đọc.', voiceUnsupported:'Trình duyệt chưa hỗ trợ giọng đọc. Hãy thử mở game bằng Chrome.', voiceMissing:'Bộ đọc chưa có giọng cho ngôn ngữ này. Hãy kiểm tra cài đặt giọng đọc trên máy.', voiceBlocked:'Trình duyệt chưa cho phát giọng đọc. Bấm Nghe bài toán để thử lại.', music:'Nhạc nền', help:'Nghe bài toán', soundUnavailable:'Chưa phát được giọng đọc. Bé có thể bấm Nghe bài toán để thử lại và vẫn chơi bình thường.',
});
Object.assign(copy.en, {
 wrongTitle:'Not quite, little friend!', wrongNote:'That’s okay! Let’s start again and count together.', replay:'Start again', start:'Let’s play', pickTitle:'What shall we play today?', pickSubtitle:'Choose an operation and explore with your little block friends!',
 back:'Go back', home:'Home', change:'Change game', ready:'Ready to play?', waiting:'Choose an answer now, or tap the blocks to help you count!',
 chooseHint:'Choose the number you just counted', yourPuzzle:'YOUR LITTLE PUZZLE', wellDone:'A little star for you!',
 nextPuzzle:'Next puzzle', explore:'Your playground', soundTip:'Tap to play · Sound on for a little joy', voiceHelp:'Speech help', testVoice:'Test voice', voiceTitle:'Speech on your tablet', voiceInstructions:'If music plays but speech does not, try opening the game in Chrome. On Samsung, open Settings → General management → Text-to-speech, choose the Google engine if available, and install voice data for the selected language. Menu names vary by Android version. Reopen the game and tap Test voice.', voiceUnsupported:'This browser does not support speech. Try opening the game in Chrome.', voiceMissing:'The speech engine does not have a voice for this language. Check the device’s text-to-speech settings.', voiceBlocked:'Speech playback is blocked. Tap Hear the puzzle to try again.', music:'Music', help:'Hear the puzzle', soundUnavailable:'Speech could not play. Tap Hear the puzzle to retry; you can still keep playing.',
});
let screen='welcome', lang='vi', mode='add', moved=0, stars=0, sound=true, music=true, audioNotice=false, feedback='', won=false;
const narrator=createNarrator({onSpeaking:value=>sounds.setDucked(value),onUnavailable:reason=>{audioNotice=reason==='unsupported'?'voiceUnsupported':reason==='language-unavailable'?'voiceMissing':reason==='not-allowed'?'voiceBlocked':'soundUnavailable';updateSpeechNotice();}});
let used = new Set();
const symbols={add:'+',subtract:'−',multiply:'×',divide:'÷'};
let [a,b] = makeProblem(mode);
let choices=answerChoices(result(mode,a,b));
const t = key => copy[lang][key];
function character(n, extra='') {
 const cols=n===4||n===6||n===8||n===10?2:n===9?3:1;
 return `<div class="character c${n} ${extra}" style="--cols:${cols};--rows:${Math.ceil(n/cols)}"><span class="character-number">${n}</span><div class="character-body">${Array.from({length:n},()=>'<i></i>').join('')}<div class="face"><div class="eyes">${n===1?'<b></b>':'<b></b><b></b>'}</div><div class="smile"></div></div>${n===3?'<div class="crown">♛</div>':''}</div><span class="leg left"></span><span class="leg right"></span><span class="arm left"></span><span class="arm right"></span></div>`;
}
function block(id, color, active=true) {return `<button class="unit ${color} ${used.has(id)?'used':''}" data-block="${id}" ${!active||used.has(id)||moving||grouping?'disabled':''} aria-label="${t('block')} ${Number(id.split('-').pop())+1}"><span class="mini-eyes">••</span></button>`;}
function units(n,color='coral') {return Array.from({length:n},(_,i)=>`<span class="unit result-unit ${color}" style="--delay:${i%5*35}ms"><span class="mini-eyes">••</span></span>`).join('');}
function stage() {
 if(mode==='add') return `<div class="source-group coral-tray">${Array.from({length:a},(_,i)=>block('a-'+i,'coral')).join('')||'<span>0</span>'}</div><span class="stage-symbol">+</span><div class="source-group gold-tray">${Array.from({length:b},(_,i)=>block('b-'+i,'gold')).join('')||'<span>0</span>'}</div>`;
 if(mode==='subtract') return `<div class="source-group coral-tray wide">${Array.from({length:a},(_,i)=>block('a-'+i,'coral',moved<b)).join('')||'<span>0</span>'}</div>`;
 if(mode==='multiply') return Array.from({length:b},(_,i)=>`<button class="multiply-group ${used.has('g-'+i)?'used':''}" data-block="g-${i}" ${used.has('g-'+i)||moving||grouping?'disabled':''} aria-label="${t('group')} ${i+1}">${units(a,i%2?'gold':'coral')}</button>`).join('');
 return `<div class="source-group coral-tray wide">${Array.from({length:a},(_,i)=>block('a-'+i,'coral')).join('')}</div>`;
}
function basket() {
 if(mode==='divide') return Array.from({length:b},(_,i)=>`<div class="share-group"><span>${t('group')} ${i+1}</span><div>${units(Math.floor(moved/b)+(i<moved%b?1:0),i%2?'gold':'coral')}</div></div>`).join('');
 const n=mode==='add'?moved:mode==='subtract'?a-moved:a*moved;
 return n?(mode==='add'?Array.from(used).map(id=>units(1,id.startsWith('b-')?'gold':'coral')).join(''):units(n)):`<span class="empty-basket">${mode==='subtract'?t('zero'):t('empty')}</span>`;
}
function options() {
 const answer=result(mode,a,b);
 return choices.map(n=>`<button class="answer-option ${won&&n===answer?'right-answer':''}" data-answer="${n}" ${won?'disabled':''} aria-label="${t('choose')}: ${n}">${n}${won&&n===answer?'<span aria-hidden="true">✓</span>':''}</button>`).join('');
}
function header() {
 return `<header class="topbar"><button class="brand" data-home aria-label="${t('home')}"><span class="brand-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>number<span class="brand-light">blocks</span><small>${t('club')}</small></span></button><div class="header-actions"><button class="parents-link" data-parent aria-label="${t('parent')}"><span aria-hidden="true">♡</span><span class="parents-text">${t('parent')}</span></button><div class="language" aria-label="Language"><button data-lang="vi" class="${lang==='vi'?'selected':''}" aria-pressed="${lang==='vi'}">VI</button><button data-lang="en" class="${lang==='en'?'selected':''}" aria-pressed="${lang==='en'}">EN</button></div><button class="music-button ${music?'enabled':''}" data-music aria-label="${t('music')}: ${music?t('on'):t('off')}" aria-pressed="${music}" title="${t('music')}"><span aria-hidden="true">♫</span><small>${t('music')}</small>${music?'':'<span class="muted-slash" aria-hidden="true">╱</span>'}</button><button class="sound-button ${sound?'enabled':''}" data-sound aria-label="${t('sound')}: ${sound?t('on'):t('off')}" aria-pressed="${sound}"><span aria-hidden="true">${sound?'🔊':'🔇'}</span></button></div></header>`;
}
function welcome() {
 return `<main class="welcome-screen"><section class="welcome-content"><div class="welcome-copy"><div class="eyebrow">✦ ${t('badge')}</div><h1 tabindex="-1">${t('hero')}<br><span>${t('hero2')}</span></h1><p>${t('intro')}</p><button class="start-button" data-start><span class="start-icon" aria-hidden="true">▶</span> ${t('start')} <span aria-hidden="true">→</span></button><div class="welcome-note">${t('soundTip')}</div></div><div class="hero-art" aria-hidden="true"><div class="art-orbit"></div><span class="doodle d1">✧</span><span class="doodle d2">✦</span><span class="doodle d3">+</span><span class="doodle d4">∿</span><span class="hello">${lang==='vi'?'Chào bé!':'Hello there!'}</span>${character(1,'hero-one')}${character(3,'hero-three')}${character(2,'hero-two')}<div class="ground"></div></div></section><div class="welcome-footer"><span>✦ ${t('ages')}</span><span>♡ ${t('safe')}</span><span>VI / EN</span></div></main>`;
}
function selection() {
 return `<main class="selection-screen"><div class="screen-toolbar"><button class="back-button" data-home>← ${t('home')}</button><span class="little-caption">✦ ${t('ready')}</span></div><div class="selection-heading"><h1 tabindex="-1">${t('pickTitle')}</h1><p>${t('pickSubtitle')}</p></div><nav class="operation-grid" aria-label="${t('change')}">${Object.keys(symbols).map((m,i)=>`<button data-mode="${m}" class="operation-card operation-${m}"><div class="operation-top"><span class="operation-symbol">${symbols[m]}</span><span class="operation-arrow" aria-hidden="true">→</span></div><div class="operation-bottom"><div><strong>${t(m)}</strong><small>${t('sub'+m)}</small></div><div class="card-friend" aria-hidden="true">${character(i===0?2:i===1?1:i===2?3:4)}</div></div></button>`).join('')}</nav></main>`;
}
function game() {
 const done=moved>=progressTotal(mode,a,b);
 return `<main class="game-screen"><div class="screen-toolbar"><button class="back-button" data-choose>← ${t('change')}</button><h1 tabindex="-1"><span class="heading-symbol">${symbols[mode]}</span> ${t('title'+mode)}</h1><span class="star-badge" aria-label="${t('stars')}: ${stars}">★ <strong>${stars}</strong></span></div><div class="game-board">
 <aside class="answer-panel ${done?'answer-ready':''} ${won?'answer-won':''}" aria-labelledby="answer-heading"><div class="eyebrow">✦ ${t('yourPuzzle')}</div><div class="equation" aria-label="${a} ${symbols[mode]} ${b} = ${won?result(mode,a,b):'?'}"><span>${a}</span><i>${symbols[mode]}</i><span>${b}</span><i>=</i><strong>${won?result(mode,a,b):'?'}</strong></div><div class="answer-mascot" aria-hidden="true">${character(4)}<span>${won?'★':'?'}</span></div><h2 id="answer-heading">${t('answer')}</h2><p class="answer-hint">${t(done?'chooseHint':'waiting')}</p><div class="answer-options" role="group" aria-label="${t('choose')}">${options()}</div><div class="feedback ${won?'success':''}" role="status" aria-live="polite">${feedback?t(feedback):done?t('done'):''}</div><button class="next-button ${won?'celebrate':''}" data-new>${t(won?'nextPuzzle':'new')} <span aria-hidden="true">→</span></button></aside>
 <section class="play-area" aria-label="${t('explore')}"><div class="play-label"><span class="section-label">${t('play')}</span><button class="reset-button" data-reset>↺ ${t('reset')}</button></div><div class="play-instruction"><p class="tap-hint">${t(mode==='add'?'tap':mode==='subtract'?'tapSubtract':mode==='multiply'?'tapMultiply':'tapDivide')}</p><button class="listen-button" data-listen aria-label="${t('help')}" title="${t('help')}">♬</button></div><div class="source-stage">${stage()}</div><div class="direction-arrow" aria-hidden="true">${counting===null?'↓':`<span class="count-bubble">${counting}</span>`}</div><div class="basket ${mode==='divide'?'divided':''}"><div class="basket-label">${t('basket')}</div><div class="basket-content">${basket()}</div></div><div class="play-bottom"><span class="count-progress">${t('count')} <b>${moved}</b> / ${progressTotal(mode,a,b)}</span><button class="primary-button" data-all ${done||moving||grouping?'disabled':''}>${done?'✓ '+t('completed'):t('action'+mode)+' <span aria-hidden="true">→</span>'}</button></div></section></div></main>`;
}
function retryScreen() {
 return `<main class="retry-screen"><section class="retry-card"><div class="retry-friend" aria-hidden="true">${character(1)}<span>♡</span></div><h1 tabindex="-1">${t('wrongTitle')}</h1><p>${t('wrongNote')}</p><div class="equation"><span>${a}</span><i>${symbols[mode]}</i><span>${b}</span><i>=</i><strong>?</strong></div><button class="start-button" data-replay>↺ ${t('replay')}</button><button class="back-button" data-choose>← ${t('change')}</button></section></main>`;
}
function render(focusHeading=false) {
 const active=document.activeElement;
 const focused=active?.getAttributeNames().find(name=>name.startsWith('data-'));
 const value=focused?active.getAttribute(focused):null;
 document.documentElement.lang=lang;
 document.body.dataset.screen=screen;
 document.querySelector('#app').innerHTML=header()+`<p class="speech-notice" role="status" ${audioNotice?'':'hidden'}>${audioNotice?t(audioNotice):''} <button class="speech-help-button" data-parent>${t('voiceHelp')}</button></p>`+(screen==='welcome'?welcome():screen==='choose'?selection():screen==='retry'?retryScreen():game())+`<dialog><button class="dialog-x" data-close aria-label="${t('close')}">×</button><span class="dialog-icon">♡</span><h2>${t('parentTitle')}</h2><p>${t('parentText')}</p><p>${t('parentNote')}</p><section class="voice-help"><h3>${t('voiceTitle')}</h3><p>${t('voiceInstructions')}</p><button class="back-button" data-test-voice>♬ ${t('testVoice')}</button><p class="voice-test-status" role="status">${audioNotice?t(audioNotice):''}</p></section><button class="primary-button" data-close>${t('close')}</button></dialog>`;
 bind();
 if(focusHeading) document.querySelector('h1')?.focus({preventScroll:true});
 else if(focused) {
  const target=Array.from(document.querySelectorAll(`[${focused}]`)).find(el=>el.getAttribute(focused)===value&&!el.disabled);
  (target || (focused==='data-block'||focused==='data-all'?document.querySelector('[data-block]:not(:disabled), [data-answer]:not(:disabled)'):null))?.focus({preventScroll:true});
 }
}
function clear() { cancelActivity();moved=0; used.clear(); feedback=''; won=false; narrator.cancel(); }
function navigate(next) {
 cancelActivity();
 const hash=next==='play'||next==='retry'?`#${next}/${mode}`:`#${next}`;
 if(location.hash!==hash)history.pushState(null,'',hash);
 screen=next;render(true);window.scrollTo(0,0);
}
function readRoute() {
 cancelActivity();
 const route=location.hash.slice(1).split('/');
 if((route[0]==='play'||route[0]==='retry')&&Object.hasOwn(symbols,route[1])){
  if(mode!==route[1]){mode=route[1];[a,b]=makeProblem(mode);choices=answerChoices(result(mode,a,b));clear();}
  screen=route[0];
 } else screen=route[0]==='choose'?'choose':'welcome';
 render(true);
}
function updateSpeechNotice(){
 const notice=document.querySelector('.speech-notice');
 if(notice){notice.hidden=false;notice.firstChild.textContent=t(audioNotice)+' ';}
 const status=document.querySelector('.voice-test-status');if(status)status.textContent=t(audioNotice);
}
function speak(text, explicit=false) {
 if((!sound&&!explicit)||document.hidden)return;
 audioNotice=false;const notice=document.querySelector('.speech-notice');if(notice)notice.hidden=true;
 return narrator.speak(text,lang);
}
function readPuzzle(explicit=false){speak(questionText(lang,mode,a,b),explicit);}
function revealAnswers() {
 if(moved>=progressTotal(mode,a,b)&&window.matchMedia('(max-width: 700px)').matches)document.querySelector('.answer-panel')?.scrollIntoView({block:'start'});
}
function cancelActivity(){activity++;motion.cancel();narrator.cancel();moving=false;grouping=false;counting=null;}
function pendingIds(){
 if(mode==='add')return [...Array.from({length:a},(_,i)=>'a-'+i),...Array.from({length:b},(_,i)=>'b-'+i)].filter(id=>!used.has(id));
 if(mode==='multiply')return Array.from({length:b},(_,i)=>'g-'+i).filter(id=>!used.has(id));
 return Array.from({length:a},(_,i)=>'a-'+i).filter(id=>!used.has(id)).slice(0,progressTotal(mode,a,b)-moved);
}
async function stepMove(id,token,{announce=true}={}){
 if(token!==activity||used.has(id)||moved>=progressTotal(mode,a,b))return false;
 const nextCount=mode==='multiply'?a*(moved+1):mode==='subtract'?a-moved-1:moved+1;
 // Start feedback in the input event, not after the block arrives.
 let timeout;
 if(announce)sounds.play('tap');
 const speechCompletion=announce&&sound&&!document.hidden
  ? Promise.race([speak(numberText(lang,nextCount)),new Promise(resolve=>{timeout=setTimeout(resolve,2400);})])
  : Promise.resolve();
 moving=true;render();
 const source=document.querySelector(`[data-block="${id}"]`);
 const destination=mode==='divide'?document.querySelectorAll('.share-group')[moved%b]:document.querySelector(mode==='subtract'?'.direction-arrow':'.basket-content');
 await motion.fly(source,destination,{remove:mode==='subtract'});
 if(token!==activity){clearTimeout(timeout);return false;}
 used.add(id);moved++;moving=false;counting=nextCount;
 render();await speechCompletion;clearTimeout(timeout);
 return token===activity;
}
async function move(id){
 if(moving||grouping||used.has(id))return;
 cancelActivity();const token=activity;
 if(await stepMove(id,token)){if(moved>=progressTotal(mode,a,b))sounds.play('merge');revealAnswers();}
}
async function runAll({celebrate=false}={}){
 if(moving||grouping)return false;
 cancelActivity();const token=activity;grouping=true;
 if(celebrate){sounds.play('correct');speak(t('correct'));}
 render();
 for(const id of pendingIds())if(!await stepMove(id,token,{announce:!celebrate}))return false;
 if(token!==activity)return false;
 grouping=false;moving=false;render();revealAnswers();if(!celebrate)sounds.play('merge');return true;
}
function bind() {
 const on=(selector,handler)=>document.querySelectorAll(selector).forEach(el=>el.onclick=()=>handler(el));
 on('[data-home]',()=>{narrator.cancel();navigate('welcome');});
 on('[data-start], [data-choose]',()=>{narrator.cancel();navigate('choose');sounds.play('next');});
 on('[data-mode]',el=>{const previous=mode===el.dataset.mode?[a,b]:[];mode=el.dataset.mode;[a,b]=makeProblem(mode,Math.random,previous);choices=answerChoices(result(mode,a,b));clear();navigate('play');sounds.play('next');readPuzzle();});
 on('[data-lang]',el=>{cancelActivity();lang=el.dataset.lang;audioNotice=false;render();if(screen==='play')readPuzzle();else if(screen==='retry')speak(t('wrongNote'));});
 on('[data-block]',el=>move(el.dataset.block));
 on('[data-all]',()=>{void runAll();});
 on('[data-reset]',()=>{clear();render();sounds.play('reset');readPuzzle();});
 on('[data-music]',()=>{music=!music;sounds.setMusicEnabled(music);render();});
 on('[data-sound]',()=>{cancelActivity();sound=!sound;sounds.setEnabled(sound);if(sound)sounds.play('toggle');else narrator.cancel();render();if(sound&&screen==='play')readPuzzle();});
 on('[data-listen]',()=>{cancelActivity();render();readPuzzle(true);});
 on('[data-test-voice]',()=>{const status=document.querySelector('.voice-test-status');if(status)status.textContent='';speak(questionText(lang,'add',1,1),true);});
 on('[data-answer]',async el=>{
  if(won)return;
  if(Number(el.dataset.answer)===result(mode,a,b)){
   cancelActivity();won=true;stars++;feedback='correct';
   await runAll({celebrate:true});
  }else{
   clear();sounds.play('retry');navigate('retry');speak(t('wrongNote'));
  }
 });
 on('[data-replay]',()=>{clear();navigate('play');sounds.play('reset');readPuzzle();});
 on('[data-new]',()=>{[a,b]=makeProblem(mode,Math.random,[a,b]);choices=answerChoices(result(mode,a,b));clear();render();sounds.play('next');readPuzzle();});
 const dialog=document.querySelector('dialog');on('[data-parent]',()=>{cancelActivity();render();document.querySelector('dialog').showModal();});on('[data-close]',()=>dialog.close());dialog.onclick=e=>{if(e.target===dialog)dialog.close();};
}
function prepareAudio(){void sounds.start();narrator.warmup();}
document.addEventListener('pointerdown',prepareAudio,{capture:true,passive:true});
document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')prepareAudio();},{capture:true});
document.addEventListener('click',prepareAudio,{capture:true});
document.addEventListener('visibilitychange',()=>{sounds.setPaused(document.hidden);if(document.hidden){cancelActivity();render();}});
window.addEventListener('pagehide',()=>{sounds.setPaused(true);cancelActivity();});
window.addEventListener('pageshow',()=>sounds.setPaused(document.hidden));
window.addEventListener('popstate',()=>{readRoute();if(screen==='play')readPuzzle();});
readRoute();
