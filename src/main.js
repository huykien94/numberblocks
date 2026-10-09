import './style.css';
import './family.css';
import { FAMILY_ACTIVITIES, createFamilySession, renderFamily, renderFamilyCatalog, renderFamilyParentPreview, handleFamilyAction } from './family.js';
import { result, progressTotal, makeProblem, answerChoices, rangeFor } from './math.js';
import { createSoundPlayer } from './audio.js';
import { createNarrator, questionText, numberText } from './narration.js';
import { createBlockMotion } from './motion.js';
import { createProgressStore, createRound, ROUND_SIZE } from './progress.js';
import { createAppInstall } from './pwa.js';
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
Object.assign(copy.vi, {
 upToTwenty:'Trong phạm vi 20', twentyNote:'Mức 20 dành cho cộng, trừ. Nhân và chia vẫn trong phạm vi 10.', smallSteps:'Trong phạm vi 5', exploreMore:'Trong phạm vi 10', rangeLabel:'Phạm vi số',
 removed:'Khay bớt đi', removedEmpty:'Chạm một khối để chuyển sang khay này.', remaining:'Còn lại',
 joinTray:'Khay đếm chung', groupTray:'Các nhóm bằng nhau', shareTray:'Chia đều cho từng bạn', friend:'Bạn',
 pieces:'khối', eachGroup:'Mỗi nhóm', groupsOf:'nhóm, mỗi nhóm',
 askAdd:'Có tất cả bao nhiêu khối?', askSubtract:'Còn lại bao nhiêu khối?', askMultiply:'Tất cả các nhóm có mấy khối?', askDivide:'Mỗi bạn được mấy khối?', hintAdd:'Gộp hai nhóm vào cùng một khay. Chạm một khối và đếm một lần.',
 hintSubtract:'Chuyển từng khối sang khay bớt đi. Đếm những khối còn lại ở trên.',
 hintMultiply:'Các nhóm có cùng số khối. Chạm từng nhóm rồi đếm tất cả.',
 hintDivide:'Mỗi lượt cho một bạn một khối. Khi chia xong, đếm số khối của một bạn.',
 checkTogether:'Cùng đếm lại', learningTitle:'Cùng bé hiểu lượng và phép tính',
 learningNote:'Bắt đầu với phạm vi 1–5. Mời con chỉ vào mỗi khối và đếm một lần. Khay có các hàng 5 ô giúp con nhận ra lượng. Khi trừ, quan sát cả phần còn lại và phần đã bớt; khi nhân, đếm các nhóm bằng nhau; khi chia, lần lượt chia cho từng bạn. Hãy để con tự thao tác trước khi dùng nút làm mẫu. Có thể dùng thêm hạt, que hoặc khối thật ngoài màn hình. Đây là hoạt động lấy cảm hứng từ Montessori, không thay thế giáo cụ và hướng dẫn trực tiếp.',
});
Object.assign(copy.en, {
 upToTwenty:'Numbers up to 20', twentyNote:'Up to 20 for addition and subtraction. Multiplication and division stay within 10.', smallSteps:'Numbers up to 5', exploreMore:'Numbers up to 10', rangeLabel:'Number range',
 removed:'Taken-away tray', removedEmpty:'Tap a block to move it into this tray.', remaining:'Remaining',
 joinTray:'Our counting tray', groupTray:'Equal groups', shareTray:'Share equally with each friend', friend:'Friend',
 pieces:'blocks', eachGroup:'Each group', groupsOf:'groups of',
 askAdd:'How many blocks altogether?', askSubtract:'How many blocks are left?', askMultiply:'How many blocks in all the groups?', askDivide:'How many blocks does each friend get?', hintAdd:'Bring both groups into one tray. Touch one block and count once.',
 hintSubtract:'Move blocks into the taken-away tray. Count the blocks left above.',
 hintMultiply:'Every group has the same number of blocks. Tap each group and count them all.',
 hintDivide:'Give each friend one block in turn. When finished, count one friend’s blocks.',
 checkTogether:'Count together', learningTitle:'Explore quantities and operations together',
 learningNote:'Start with numbers 1–5. Invite your child to point at each block and count once. Rows of five help children see quantities. For subtraction, notice both what remains and what was removed; for multiplication, count equal groups; for division, share one at a time. Let your child move blocks before using the demonstration button. Try the same activity with real beads, sticks or blocks. These activities are Montessori-inspired and do not replace physical materials or adult guidance.',
});
Object.assign(copy.vi, {
 roundHint:'Một lượt 5 bài · Không giới hạn thời gian', roundProgress:'Bài đã khám phá', finishRound:'Xem thành quả',
 roundTitle:'Một lượt khám phá thật vui!', roundNote:'Bé đã hoàn thành 5 bài. Cùng nghỉ mắt, vươn vai và thử đếm vài đồ vật quanh mình nhé!',
 rest:'Nghỉ một chút', playAgain:'Chơi lượt mới', progressTitle:'Những bài bé đã khám phá', progressNote:'Tổng số bài đã trả lời đúng trên trình duyệt này, kể cả bài có trợ giúp. Đây không phải đánh giá năng lực của bé.',
 savedHere:'Tiến độ và cài đặt được lưu trên thiết bị này. Không đồng bộ giữa các máy; xóa dữ liệu trình duyệt sẽ xóa tiến độ.', storageUnavailable:'Trình duyệt chưa lưu được dữ liệu. Bé vẫn chơi được, nhưng tiến độ có thể mất khi đóng trang.',
 parentText:'Mỗi lượt có 5 bài hoàn thành. Bắt đầu ở phạm vi 5 và tăng lên 10 hoặc 20 khi con sẵn sàng. Cho con chạm, đếm và tự chọn đáp án; có thể cùng đếm lại khi cần.',
 parentNote:'Không giới hạn thời gian, không tài khoản, không quảng cáo. Chỉ lưu cài đặt và số bài đã hoàn thành theo từng nhóm trên thiết bị; không gửi tiến độ lên máy chủ. Giọng đọc tùy thuộc trình duyệt và giọng đã cài trên máy.',
 breakdownTitle:'Xem cách hoàn thành bài', breakdownNote:'Ghi nhận đến lần trả lời đúng đầu tiên của mỗi bài. Hai cách phân loại bên dưới cùng mô tả những bài đã hoàn thành, không cộng thành một tổng mới.',
 demoAxis:'Làm mẫu trong game', retryAxis:'Chọn đáp án', withoutDemo:'Chưa dùng làm mẫu', withDemo:'Đã dùng làm mẫu', withoutRetry:'Chưa chọn sai', afterRetry:'Sau khi chọn sai', unclassified:'Chưa có dữ liệu phân loại',
 demoNote:'Làm mẫu là dùng nút gộp, bớt, tạo nhóm, chia đều hoặc Cùng đếm lại trước khi trả lời đúng. Tự chạm khối và phần minh họa sau đáp án đúng không tính là làm mẫu.',
 unclassifiedNote:'Bài từ bản cũ hoặc thiếu dữ liệu vẫn được giữ trong tổng, không suy đoán cách hoàn thành. Game không biết bé có được người lớn trợ giúp hay không; số liệu có thể gồm nhiều bé dùng chung trình duyệt.',
 appTitle:'Mang sân chơi lên tablet', appShortcut:'Cài lên màn hình chính', install:'Cài game', installed:'Game đang mở như ứng dụng',
 installHelp:'Trên Chrome Android: mở menu ⋮ → Cài đặt ứng dụng hoặc Thêm vào màn hình chính. Trên iPad: Safari → Chia sẻ → Thêm vào MH chính. Tên mục có thể khác tùy máy.',
 offlineReady:'✓ Đã sẵn sàng chơi ngoại tuyến', offlinePreparing:'Mở game khi có mạng để chuẩn bị chơi ngoại tuyến.', offlineFailed:'Chưa tải được bản ngoại tuyến. Hãy mở lại game khi có mạng.',
 offlineNote:'Các bài toán, khối và nhạc dùng được khi mất mạng sau khi tải xong. Giọng đọc ngoại tuyến phụ thuộc giọng đã cài trên máy. Trình duyệt có thể xóa dữ liệu khi thiếu dung lượng.',
 updateReady:'Có phiên bản game mới.', update:'Cập nhật và mở lại', updateNote:'Bài đang chơi sẽ bắt đầu lại. Tiến độ đã lưu vẫn được giữ.',
});
Object.assign(copy.en, {
 roundHint:'5 puzzles per round · No time limit', roundProgress:'Puzzles explored', finishRound:'See your progress',
 roundTitle:'A lovely round of discovery!', roundNote:'You completed 5 puzzles. Rest your eyes, stretch, and try counting some things around you!',
 rest:'Take a little break', playAgain:'Play a new round', progressTitle:'Puzzles your child has explored', progressNote:'Puzzles answered correctly in this browser, including those with help. These counts are not an assessment of ability.',
 savedHere:'Progress and settings stay on this device. They do not sync to other devices; clearing browser data erases progress.', storageUnavailable:'This browser could not save progress. Play still works, but progress may be lost when you close the page.',
 parentText:'Each round has 5 completed puzzles. Start with numbers up to 5 and explore 10 or 20 when your child is ready. Invite them to touch, count and choose an answer, counting together whenever needed.',
 parentNote:'No timers, accounts or ads. Only settings and grouped counts of completed puzzles are saved on this device; progress is not sent to a server. Speech depends on the browser and installed voices.',
 breakdownTitle:'How puzzles were completed', breakdownNote:'Recorded up to the first correct answer for each puzzle. The two views below describe the same completed puzzles; do not add them into a new total.',
 demoAxis:'In-game demonstration', retryAxis:'Answer choices', withoutDemo:'Without demonstration', withDemo:'With demonstration', withoutRetry:'No incorrect answer', afterRetry:'After an incorrect answer', unclassified:'No classification data',
 demoNote:'Demonstration means using the bring, take, group, share or Count together button before answering correctly. Moving blocks by hand and the animation after a correct answer do not count.',
 unclassifiedNote:'Puzzles from older versions or with missing data remain in the total without guessing how they were completed. The game cannot tell whether an adult helped; these counts may include children sharing this browser.',
 appTitle:'Bring the playground to your tablet', appShortcut:'Add to home screen', install:'Install game', installed:'Game is open as an app',
 installHelp:'On Android Chrome: open the ⋮ menu → Install app or Add to Home screen. On iPad: Safari → Share → Add to Home Screen. Menu names vary by device.',
 offlineReady:'✓ Ready to play offline', offlinePreparing:'Open the game online to prepare for offline play.', offlineFailed:'Offline play could not be prepared. Reopen the game when connected.',
 offlineNote:'Puzzles, blocks and music work offline once downloaded. Offline speech depends on installed voices. Browsers may clear saved files when storage is low.',
 updateReady:'A new game version is available.', update:'Update and reopen', updateNote:'The current puzzle will restart. Saved progress will be kept.',
});
Object.assign(copy.vi, {brand:'Vườn Số', club:'GIEO NIỀM VUI, ĐẾM KHÁM PHÁ', hero:'Gieo một hạt nhỏ.', hero2:'Khám phá điều thật to!', intro:'Cùng những người bạn Mầm chạm, đếm và chơi với các khối số. Mỗi ngày một khám phá, theo nhịp của bé.', family:'Cùng ba mẹ khám phá', familyIntro:'Ba hoạt động mới và phiếu in để mang niềm vui học toán ra ngoài màn hình.', familyTry:'Khám phá cùng nhau', familyFree:'Bản dùng thử miễn phí', familySessionNote:'Hoạt động gia đình chỉ ghi nhận trong lượt đang chơi; không cộng vào tổng bốn phép tính.'});
Object.assign(copy.en, {brand:'Number Garden', club:'SMALL SEEDS, BIG DISCOVERIES', hero:'Plant a little seed.', hero2:'Grow a big discovery!', intro:'Tap, count and play with number blocks and your little Sprout friends. Explore at your child’s own pace.', family:'Explore as a family', familyIntro:'Three new activities and printable pages to bring math play beyond the screen.', familyTry:'Explore together', familyFree:'Free preview', familySessionNote:'Family activities track this session only; they do not add to the four-operation totals.'});
let familySession=null;
const progress=createProgressStore();
const preferences=progress.data.preferences;
let round=createRound(), puzzleId=0, attempt={usedDemo:false,retried:false};
let screen='welcome', lang=preferences.lang, maxQuantity=preferences.range, mode='add', moved=0, sound=preferences.sound, music=preferences.music, audioNotice=false, feedback='', won=false;
sounds.setEnabled(sound);sounds.setMusicEnabled(music);
const appInstall=createAppInstall(updateAppPanel);
function savePreferences(){progress.preferences({lang,range:maxQuantity,sound,music});}
function freshPuzzle(previous=[]){
 [a,b]=makeProblem(mode,Math.random,previous,maxQuantity);
 choices=answerChoices(result(mode,a,b),Math.random,rangeFor(mode,maxQuantity));
 puzzleId++;attempt={usedDemo:false,retried:false};clear();
}

const narrator=createNarrator({onSpeaking:value=>sounds.setDucked(value),onUnavailable:reason=>{audioNotice=reason==='unsupported'?'voiceUnsupported':reason==='language-unavailable'?'voiceMissing':reason==='not-allowed'?'voiceBlocked':'soundUnavailable';updateSpeechNotice();}});
let used = new Set();
const symbols={add:'+',subtract:'−',multiply:'×',divide:'÷'};
let [a,b] = makeProblem(mode,Math.random,[],maxQuantity);
let choices=answerChoices(result(mode,a,b),Math.random,rangeFor(mode,maxQuantity));
const t = key => copy[lang][key];
function character(n, extra='') {
 return `<div class="character garden-friend ${extra}" aria-hidden="true"><span class="sprout-leaves"><i></i><i></i></span><div class="sprout-pot"><span class="sprout-eyes"><i></i><i></i></span><span class="sprout-smile"></span><span class="sprout-seeds">${Array.from({length:n},()=>'<i></i>').join('')}</span></div><span class="sprout-label">${n}</span></div>`;
}
function block(id, color, active=true) {return `<button class="unit ${color} ${used.has(id)?'used':''}" data-block="${id}" ${!active||used.has(id)||moving||grouping?'disabled':''} aria-label="${t('block')} ${Number(id.split('-').pop())+1}"><span class="mini-eyes">••</span></button>`;}
function units(n,color='coral') {return Array.from({length:n},(_,i)=>`<span class="unit result-unit ${color}" style="--delay:${i%5*35}ms"><span class="mini-eyes">••</span></span>`).join('');}
function stage() {
 if(mode==='add')return `<div class="source-group coral-tray"><span class="group-caption">${a} ${t('pieces')}</span>${Array.from({length:a},(_,i)=>block('a-'+i,'coral')).join('')}</div><span class="stage-symbol">+</span><div class="source-group gold-tray"><span class="group-caption">${b} ${t('pieces')}</span>${Array.from({length:b},(_,i)=>block('b-'+i,'gold')).join('')}</div>`;
 if(mode==='subtract')return `<div class="source-group coral-tray wide subtraction-source"><span class="group-caption">${t('remaining')}: ${a-moved}</span>${Array.from({length:a},(_,i)=>block('a-'+i,'coral',moved<b)).join('')}</div>`;
 if(mode==='multiply')return Array.from({length:b},(_,i)=>`<button class="multiply-group ${used.has('g-'+i)?'used':''}" data-block="g-${i}" ${used.has('g-'+i)||moving||grouping?'disabled':''} aria-label="${t('group')} ${i+1}: ${a} ${t('pieces')}"><span class="group-caption">${a} ${t('pieces')}</span>${units(a,'coral')}</button>`).join('');
 return `<div class="source-group coral-tray wide"><span class="group-caption">${a} ${t('pieces')}</span>${Array.from({length:a},(_,i)=>block('a-'+i,'coral')).join('')}</div>`;
}
function countingTray(contents){
 const frames=maxQuantity===20?[10,10]:[maxQuantity];
 return `<div class="counting-frames">${frames.map((size,frame)=>`<div class="counting-tray" aria-label="${size} ${lang==='vi'?'ô đếm':'counting spaces'}">${Array.from({length:size},(_,i)=>`<span class="counting-space">${contents[frame*10+i]||''}</span>`).join('')}</div>`).join('')}</div>`;
}
function basket() {
 if(mode==='divide')return Array.from({length:b},(_,i)=>{
  const n=Math.floor(moved/b)+(i<moved%b?1:0);
  return `<div class="share-group"><span class="friend-label"><i aria-hidden="true">☺</i>${t('friend')} ${i+1}</span><div>${units(n,'coral')}</div><small>${n} ${t('pieces')}</small></div>`;
 }).join('');
 if(mode==='multiply')return Array.from({length:b},(_,i)=>`<div class="result-equal-group"><span>${t('group')} ${i+1}</span><div>${used.has('g-'+i)?units(a):Array.from({length:a},()=>'<i class="group-space"></i>').join('')}</div></div>`).join('');
 if(mode==='subtract')return moved?`<div class="removed-blocks">${units(moved,'coral')}</div><span class="removed-count">${moved} ${t('pieces')}</span>`:`<span class="empty-basket">${t('removedEmpty')}</span>`;
 return countingTray(Array.from(used).map(id=>units(1,id.startsWith('b-')?'gold':'coral')));
}
function trayLabel(){return t(mode==='add'?'joinTray':mode==='subtract'?'removed':mode==='multiply'?'groupTray':'shareTray');}
function learningHint(){return t({add:'hintAdd',subtract:'hintSubtract',multiply:'hintMultiply',divide:'hintDivide'}[mode]);}
function operationStory(){
 if(lang==='vi')return {add:`${a} khối và ${b} khối.`,subtract:`Có ${a} khối. Bớt đi ${b} khối.`,multiply:`${b} nhóm, mỗi nhóm ${a} khối.`,divide:`Chia ${a} khối đều cho ${b} bạn.`}[mode];
 return {add:`${a} blocks and ${b} blocks.`,subtract:`Start with ${a} blocks. Take away ${b}.`,multiply:`${b} groups with ${a} blocks in each.`,divide:`Share ${a} blocks equally among ${b} friends.`}[mode];
}
function options() {
 const answer=result(mode,a,b);
 return choices.map(n=>`<button class="answer-option ${won&&n===answer?'right-answer':''}" data-answer="${n}" ${won?'disabled':''} aria-label="${t('choose')}: ${n}">${n}${won&&n===answer?'<span aria-hidden="true">✓</span>':''}</button>`).join('');
}
function header() {
 return `<header class="topbar"><button class="brand" data-home aria-label="${t('home')}"><img class="garden-logo" src="${import.meta.env.BASE_URL}icons/garden.svg" alt="" aria-hidden="true"><span>${t('brand')}<small>${t('club')}</small></span></button><div class="header-actions"><button class="parents-link" data-parent aria-label="${t('parent')}"><span aria-hidden="true">♡</span><span class="parents-text">${t('parent')}</span></button><div class="language" aria-label="Language"><button data-lang="vi" class="${lang==='vi'?'selected':''}" aria-pressed="${lang==='vi'}">VI</button><button data-lang="en" class="${lang==='en'?'selected':''}" aria-pressed="${lang==='en'}">EN</button></div><button class="music-button ${music?'enabled':''}" data-music aria-label="${t('music')}: ${music?t('on'):t('off')}" aria-pressed="${music}" title="${t('music')}"><span aria-hidden="true">♫</span><small>${t('music')}</small>${music?'':'<span class="muted-slash" aria-hidden="true">╱</span>'}</button><button class="sound-button ${sound?'enabled':''}" data-sound aria-label="${t('sound')}: ${sound?t('on'):t('off')}" aria-pressed="${sound}"><span aria-hidden="true">${sound?'🔊':'🔇'}</span></button></div></header>`;
}
function welcome() {
 return `<main class="welcome-screen"><section class="welcome-content"><div class="welcome-copy"><div class="eyebrow">✦ ${t('badge')}</div><h1 tabindex="-1">${t('hero')}<br><span>${t('hero2')}</span></h1><p>${t('intro')}</p><button class="start-button" data-start><span class="start-icon" aria-hidden="true">▶</span> ${t('start')} <span aria-hidden="true">→</span></button><div class="welcome-note">${t('soundTip')}</div><button class="app-shortcut" data-parent>▦ ${t('appShortcut')}</button></div><div class="hero-art" aria-hidden="true"><div class="art-orbit"></div><span class="doodle d1">✧</span><span class="doodle d2">✦</span><span class="doodle d3">+</span><span class="doodle d4">∿</span><span class="hello">${lang==='vi'?'Chào bé!':'Hello there!'}</span>${character(1,'hero-one')}${character(3,'hero-three')}${character(2,'hero-two')}<div class="ground"></div></div></section><div class="welcome-footer"><span>✦ ${t('ages')}</span><span>♡ ${t('safe')}</span><span>VI / EN</span></div></main>`;
}
function selection() {
 return `<main class="selection-screen"><div class="screen-toolbar"><button class="back-button" data-home>← ${t('home')}</button><span class="little-caption">✦ ${t('ready')}</span></div><div class="selection-heading"><h1 tabindex="-1">${t('pickTitle')}</h1><p>${t('pickSubtitle')}</p><p class="round-hint">${t('roundHint')}</p></div><div class="number-range" role="group" aria-label="${t('rangeLabel')}"><button data-range="5" aria-pressed="${maxQuantity===5}">${t('smallSteps')}</button><button data-range="10" aria-pressed="${maxQuantity===10}">${t('exploreMore')}</button><button data-range="20" aria-pressed="${maxQuantity===20}">${t('upToTwenty')}</button></div>${maxQuantity===20?`<p class="range-note">${t('twentyNote')}</p>`:''}<nav class="operation-grid" aria-label="${t('change')}">${Object.keys(symbols).map((m,i)=>`<button data-mode="${m}" class="operation-card operation-${m}"><div class="operation-top"><span class="operation-symbol">${symbols[m]}</span><span class="operation-arrow" aria-hidden="true">→</span></div><div class="operation-bottom"><div><strong>${t(m)}</strong><small>${t('sub'+m)}</small></div><div class="card-friend" aria-hidden="true">${character(i===0?2:i===1?1:i===2?3:4)}</div></div></button>`).join('')}</nav><section class="family-entry"><div><span class="family-preview-badge">${t('familyFree')}</span><h2>${t('family')}</h2><p>${t('familyIntro')}</p></div><button class="back-button" data-family-catalog>${t('familyTry')} →</button></section></main>`;
}
function game() {
 const done=moved>=progressTotal(mode,a,b);
 return `<main class="game-screen"><div class="screen-toolbar"><button class="back-button" data-choose>← ${t('change')}</button><h1 tabindex="-1"><span class="heading-symbol">${symbols[mode]}</span> ${t('title'+mode)}</h1><div class="round-progress" aria-label="${t('roundProgress')}: ${round.count} / ${ROUND_SIZE}"><span>${t('roundProgress')} <b>${round.count} / ${ROUND_SIZE}</b></span><div aria-hidden="true">${Array.from({length:ROUND_SIZE},(_,i)=>`<i class="${i<round.count?'filled':''}">${i<round.count?'★':'○'}</i>`).join('')}</div></div></div><div class="game-board">
 <aside class="answer-panel ${done?'answer-ready':''} ${won?'answer-won':''}" aria-labelledby="answer-heading"><div class="eyebrow">✦ ${t('yourPuzzle')}</div><div class="equation" aria-label="${a} ${symbols[mode]} ${b} = ${won?result(mode,a,b):'?'}"><span>${a}</span><i>${symbols[mode]}</i><span>${b}</span><i>=</i><strong>${won?result(mode,a,b):'?'}</strong></div><div class="answer-mascot" aria-hidden="true">${character(4)}<span>${won?'★':'?'}</span></div><h2 id="answer-heading">${t({add:'askAdd',subtract:'askSubtract',multiply:'askMultiply',divide:'askDivide'}[mode])}</h2><p class="answer-hint">${operationStory()}</p><div class="answer-options" role="group" aria-label="${t('choose')}">${options()}</div><div class="feedback ${won?'success':''}" role="status" aria-live="polite">${feedback?t(feedback):done?t('done'):''}</div><button class="next-button ${won?'celebrate':''}" data-new>${t(round.finished?'finishRound':won?'nextPuzzle':'new')} <span aria-hidden="true">→</span></button></aside>
 <section class="play-area" aria-label="${t('explore')}"><div class="play-label"><span class="section-label">${t('play')}</span><button class="reset-button" data-reset>↺ ${t('reset')}</button></div><div class="play-instruction"><p class="tap-hint">${learningHint()}</p><button class="listen-button" data-listen aria-label="${t('help')}" title="${t('help')}">♬</button></div><div class="source-stage">${stage()}</div><div class="direction-arrow" aria-hidden="true">${counting===null?'↓':`<span class="count-bubble">${counting}</span>`}</div><div class="basket basket-${mode} ${mode==='divide'?'divided':''}"><div class="basket-label">${trayLabel()}</div><div class="basket-content">${basket()}</div></div><div class="play-bottom"><span class="count-progress">${t('count')} <b>${moved}</b> / ${progressTotal(mode,a,b)}</span><button class="primary-button" data-all ${done||moving||grouping?'disabled':''}>${done?'✓ '+t('completed'):t('action'+mode)+' <span aria-hidden="true">→</span>'}</button></div></section></div></main>`;
}
function retryScreen() {
 return `<main class="retry-screen"><section class="retry-card"><div class="retry-friend" aria-hidden="true">${character(1)}<span>♡</span></div><h1 tabindex="-1">${t('wrongTitle')}</h1><p>${t('wrongNote')}</p><div class="equation"><span>${a}</span><i>${symbols[mode]}</i><span>${b}</span><i>=</i><strong>?</strong></div><button class="start-button" data-replay>↺ ${t('replay')}</button><button class="back-button" data-count-together>☝ ${t('checkTogether')}</button><button class="back-button" data-choose>← ${t('change')}</button></section></main>`;
}
function summaryScreen(){
 return `<main class="round-summary"><section class="summary-card"><div class="summary-stars" aria-hidden="true">★ ★ ★ ★ ★</div><h1 tabindex="-1">${t('roundTitle')}</h1><p>${t('roundNote')}</p><div class="summary-quantity"><b>5</b><span>${t('completed')} · ${t(mode)}</span></div><button class="start-button" data-home>♡ ${t('rest')}</button><button class="back-button" data-choose>${t('playAgain')} →</button></section></main>`;
}
function progressPanel(){
 const data=progress.data;
 const breakdown=Object.keys(symbols).map(key=>{
  const stats=data.breakdown[key];
  const unclassified=data.completed[key]-stats.withoutDemo-stats.withDemo;
  const rows=keys=>keys.map(name=>`<div><dt>${t(name)}</dt><dd>${stats[name]}</dd></div>`).join('');
  return `<section class="progress-operation" data-progress-mode="${key}"><h4>${symbols[key]} ${t(key)}</h4><h5>${t('demoAxis')}</h5><dl>${rows(['withoutDemo','withDemo'])}</dl><h5>${t('retryAxis')}</h5><dl>${rows(['withoutRetry','afterRetry'])}</dl>${unclassified?`<p class="unclassified">${t('unclassified')}: <strong>${unclassified}</strong></p>`:''}</section>`;
 }).join('');
 return `<section class="parent-progress"><h3>${t('progressTitle')}</h3><p>${t('progressNote')}</p><div class="progress-grid">${Object.keys(symbols).map(key=>`<div><span>${symbols[key]} ${t(key)}</span><strong>${data.completed[key]}</strong></div>`).join('')}</div><details class="progress-breakdown"><summary>${t('breakdownTitle')}</summary><p>${t('breakdownNote')}</p><div class="progress-details-grid">${breakdown}</div><p>${t('demoNote')}</p><p>${t('unclassifiedNote')}</p></details><p class="storage-note">${t(progress.available?'savedHere':'storageUnavailable')}</p></section>`;
}
function appPanel(){
 return `<h3>${t('appTitle')}</h3><p class="offline-status" role="status">${t(appInstall.ready?'offlineReady':appInstall.failed?'offlineFailed':'offlinePreparing')}</p>${appInstall.installed?`<p>${t('installed')}</p>`:appInstall.canInstall?`<button class="back-button" data-install>${t('install')} ↓</button>`:`<p>${t('installHelp')}</p>`}<p>${t('offlineNote')}</p>${appInstall.updateAvailable?`<div class="app-update"><strong>${t('updateReady')}</strong><p>${t('updateNote')}</p><button class="back-button" data-update>${t('update')}</button></div>`:''}`;
}
function bindAppPanel(){
 document.querySelector('[data-install]')?.addEventListener('click',()=>appInstall.install());
 document.querySelector('[data-update]')?.addEventListener('click',()=>appInstall.update());
}
function updateAppPanel(){
 const panel=document.querySelector('.app-help');
 if(panel){panel.innerHTML=appPanel();bindAppPanel();}
}
function render(focusHeading=false) {
 const dialogWasOpen=!!document.querySelector('dialog[open]');
 const breakdownWasOpen=!!document.querySelector('.progress-breakdown[open]');
 const active=document.activeElement;
 const focusedAttributes=active?.getAttributeNames().filter(name=>name.startsWith('data-'))||[];
 const focused=focusedAttributes[0];
 const values=focusedAttributes.map(name=>[name,active.getAttribute(name)]);
 document.documentElement.lang=lang;
 document.title=t('brand')+' · '+(lang==='vi'?'Chơi và khám phá toán học':'Play and explore math');
 document.body.dataset.screen=screen;
 document.querySelector('#app').innerHTML=header()+`<p class="speech-notice" role="status" ${audioNotice?'':'hidden'}>${audioNotice?t(audioNotice):''} <button class="speech-help-button" data-parent>${t('voiceHelp')}</button></p>`+(screen==='welcome'?welcome():screen==='choose'?selection():screen==='retry'?retryScreen():screen==='summary'?summaryScreen():screen==='family'?renderFamilyCatalog(lang):screen==='family-play'?renderFamily(familySession,lang):game())+`<dialog><button class="dialog-x" data-close aria-label="${t('close')}">×</button><span class="dialog-icon">♡</span><h2>${t('parentTitle')}</h2><p>${t('parentText')}</p><p>${t('parentNote')}</p>${renderFamilyParentPreview(lang)}<p class="family-session-note">${t('familySessionNote')}</p>${progressPanel()}<section class="app-help">${appPanel()}</section><section class="learning-help"><h3>${t('learningTitle')}</h3><p>${t('learningNote')}</p></section><section class="voice-help"><h3>${t('voiceTitle')}</h3><p>${t('voiceInstructions')}</p><button class="back-button" data-test-voice>♬ ${t('testVoice')}</button><p class="voice-test-status" role="status">${audioNotice?t(audioNotice):''}</p></section><button class="primary-button" data-close>${t('close')}</button></dialog>`;
 bind();
 if(breakdownWasOpen)document.querySelector('.progress-breakdown').open=true;
 if(dialogWasOpen)document.querySelector('dialog').showModal();
 if(focusHeading) document.querySelector('h1')?.focus({preventScroll:true});
 else if(focused) {
  const target=Array.from(document.querySelectorAll(`[${focused}]`)).find(el=>values.every(([name,value])=>el.getAttribute(name)===value)&&!el.disabled);
  (target || (focused==='data-family-action'?document.querySelector('[data-family-action=next]'):focused==='data-block'||focused==='data-all'?document.querySelector('[data-block]:not(:disabled), [data-answer]:not(:disabled)'):null))?.focus({preventScroll:true});
 }
}
// Giữ dấu làm mẫu/chọn sai khi chơi lại cùng bài; chỉ freshPuzzle tạo dấu mới.
function clear() { cancelActivity();moved=0; used.clear(); feedback=''; won=false; narrator.cancel(); }
function navigate(next) {
 cancelActivity();
 const hash=next==='family-play'?`#family/${familySession.activityId}`:next==='play'||next==='retry'?`#${next}/${mode}`:`#${next}`;
 if(location.hash!==hash)history.pushState(null,'',hash);
 screen=next;render(true);window.scrollTo(0,0);
}
function readRoute() {
 cancelActivity();
 const route=location.hash.slice(1).split('/');
 if(route[0]==='family'){
  const id=route[1];
  if(FAMILY_ACTIVITIES.includes(id)){
   if(familySession?.activityId!==id)familySession=createFamilySession(id);
   screen='family-play';
  }else screen='family';
 } else if((route[0]==='play'||route[0]==='retry')&&Object.hasOwn(symbols,route[1])){
  if(mode!==route[1]){mode=route[1];round=createRound();freshPuzzle();}
  screen=route[0];
 } else screen=route[0]==='summary'&&round.finished?'summary':route[0]==='choose'?'choose':'welcome';
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
function readFamily(explicit=false){
 if(screen!=='family-play'||familySession?.completed)return;
 const text=document.querySelector('.family-question h2')?.textContent;
 if(text)speak(text,explicit);
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
 const destination=mode==='divide'?document.querySelectorAll('.share-group')[moved%b]:mode==='add'?document.querySelectorAll('.counting-space')[moved]:mode==='multiply'?document.querySelectorAll('.result-equal-group')[Number(id.split('-')[1])]:document.querySelector('.basket-content');
 await motion.fly(source,destination);
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
 if(!celebrate&&!won&&pendingIds().length)attempt.usedDemo=true;
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
 on('[data-mode]',el=>{const previous=mode===el.dataset.mode?[a,b]:[];mode=el.dataset.mode;round=createRound();freshPuzzle(previous);navigate('play');sounds.play('next');readPuzzle();});
 on('[data-lang]',el=>{cancelActivity();lang=el.dataset.lang;savePreferences();audioNotice=false;render();if(screen==='play')readPuzzle();else if(screen==='retry')speak(t('wrongNote'));else if(screen==='family-play')readFamily();});
 on('[data-range]',el=>{maxQuantity=Number(el.dataset.range);round=createRound();freshPuzzle();savePreferences();render();sounds.play('toggle');});
 on('[data-count-together]',async()=>{clear();navigate('play');await runAll();});
 on('[data-block]',el=>move(el.dataset.block));
 on('[data-all]',()=>{void runAll();});
 on('[data-reset]',()=>{clear();render();sounds.play('reset');readPuzzle();});
 on('[data-music]',()=>{music=!music;savePreferences();sounds.setMusicEnabled(music);render();});
 on('[data-sound]',()=>{cancelActivity();sound=!sound;savePreferences();sounds.setEnabled(sound);if(sound)sounds.play('toggle');else narrator.cancel();render();if(sound&&screen==='play')readPuzzle();else if(sound&&screen==='family-play')readFamily();});
 on('[data-listen]',()=>{cancelActivity();render();if(screen==='family-play')readFamily(true);else readPuzzle(true);});
 on('[data-test-voice]',()=>{const status=document.querySelector('.voice-test-status');if(status)status.textContent='';speak(questionText(lang,'add',1,1),true);});
 on('[data-answer]',async el=>{
  if(won)return;
  if(Number(el.dataset.answer)===result(mode,a,b)){
   cancelActivity();won=true;if(round.credit(puzzleId))progress.complete(mode,attempt);feedback='correct';
   await runAll({celebrate:true});
  }else{
   attempt.retried=true;clear();sounds.play('retry');navigate('retry');speak(t('wrongNote'));
  }
 });
 on('[data-replay]',()=>{clear();navigate('play');sounds.play('reset');readPuzzle();});
 on('[data-new]',()=>{if(round.finished){navigate('summary');sounds.play('merge');return;}freshPuzzle([a,b]);render();sounds.play('next');readPuzzle();});
 bindAppPanel();
 on('[data-family-catalog]',()=>{document.querySelector('dialog')?.close();navigate('family');sounds.play('next');});
 on('[data-family-start]',el=>{cancelActivity();familySession=createFamilySession(el.dataset.familyStart);document.querySelector('dialog')?.close();navigate('family-play');sounds.play('next');readFamily();});
 on('[data-family-print]',()=>{cancelActivity();window.location.assign(`${import.meta.env.BASE_URL}family-activities.html?lang=${lang}`);});
 on('[data-family-action]',el=>{
  if(!familySession)return;
  cancelActivity();
  const event=handleFamilyAction(familySession,el.dataset.familyAction,el.dataset.familyValue);
  if(event.type==='ignored')return;
  sounds.play(event.type==='correct'?'correct':event.type==='wrong'?'retry':event.type==='move'?'tap':'next');
  render(event.type==='next'||event.type==='completed');
  if(event.type==='correct')speak(t('correct'));
  else if(event.type==='wrong')speak(lang==='vi'?'Mình cùng đếm lại nhé.':'Let’s count together and try again.');
  else if(event.type==='next')readFamily();
 });
 const dialog=document.querySelector('dialog');on('[data-parent]',()=>{cancelActivity();render();document.querySelector('dialog').showModal();});on('[data-close]',()=>dialog.close());dialog.onclick=e=>{if(e.target===dialog)dialog.close();};
}
function prepareAudio(){void sounds.start();narrator.warmup();}
document.addEventListener('pointerdown',prepareAudio,{capture:true,passive:true});
document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')prepareAudio();},{capture:true});
document.addEventListener('click',prepareAudio,{capture:true});
document.addEventListener('visibilitychange',()=>{sounds.setPaused(document.hidden);if(document.hidden){cancelActivity();render();}});
window.addEventListener('pagehide',()=>{sounds.setPaused(true);cancelActivity();});
window.addEventListener('pageshow',()=>sounds.setPaused(document.hidden));
window.addEventListener('popstate',()=>{readRoute();if(screen==='play')readPuzzle();else if(screen==='family-play')readFamily();});
readRoute();
