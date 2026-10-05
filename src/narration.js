const words = {
  vi: ['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín','mười','mười một','mười hai','mười ba','mười bốn','mười lăm','mười sáu','mười bảy','mười tám','mười chín','hai mươi'],
  en: ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'],
};
const operators={vi:{add:'cộng',subtract:'trừ',multiply:'nhân',divide:'chia'},en:{add:'plus',subtract:'minus',multiply:'times',divide:'divided by'}};
export function numberText(lang,value){return words[lang][value] ?? String(value);}
export function questionText(lang,mode,a,b) {
  const expression=`${words[lang][a] ?? a} ${operators[lang][mode]} ${words[lang][b] ?? b}`;
  return lang==='vi'?`${expression[0].toUpperCase()+expression.slice(1)} bằng mấy?`:`What is ${expression}?`;
}
export function createNarrator({synthesis=globalThis.speechSynthesis, Utterance=globalThis.SpeechSynthesisUtterance, onSpeaking=()=>{}, onUnavailable=()=>{}, timers=globalThis}={}) {
 let generation=0, finish, watchdog, voiceListener;
 function cleanup(){timers.clearTimeout(watchdog);watchdog=undefined;if(voiceListener)synthesis?.removeEventListener?.('voiceschanged',voiceListener);voiceListener=undefined;}
 function cancel(){generation++;cleanup();if(finish||synthesis?.speaking||synthesis?.pending)synthesis?.cancel();finish?.(false);finish=undefined;onSpeaking(false);}
 function warmup(){try{synthesis?.getVoices();}catch{}}
 function voiceFor(lang){
  const voices=synthesis.getVoices();const normalize=tag=>String(tag).toLowerCase().replaceAll('_','-');
  return voices.find(v=>normalize(v.lang)===(lang==='vi'?'vi-vn':'en-us')) || voices.find(v=>normalize(v.lang).split('-')[0]===lang);
 }
 function timer(callback,delay){watchdog=timers.setTimeout(callback,delay);watchdog?.unref?.();}
 warmup();
 function speak(text,lang){
  cancel();const current=generation;const completion=new Promise(resolve=>{finish=resolve;});
  function settle(ok,reason){if(current!==generation)return;cleanup();onSpeaking(false);const resolve=finish;finish=undefined;resolve?.(ok);if(reason)onUnavailable(reason);}
  if(!synthesis||!Utterance){settle(false,'unsupported');return completion;}
  let attempt=0,started=false;
  function launch(voice){
   if(current!==generation)return;
   const thisAttempt=++attempt;started=false;timers.clearTimeout(watchdog);
   const utterance=new Utterance(text);
   utterance.lang=lang==='vi'?'vi-VN':'en-US';if(voice)utterance.voice=voice;
   utterance.rate=lang==='vi'?.85:.8;utterance.pitch=1;utterance.volume=1;
   const active=()=>current===generation&&thisAttempt===attempt&&Boolean(finish);
   function retryOrFail(reason){
    if(!active())return;
    if(attempt<2 && !['not-allowed','language-unavailable'].includes(reason)){
     attempt++;synthesis.cancel();launch();
    }else{attempt++;synthesis.cancel();settle(false,reason);}
   }
   utterance.onstart=()=>{
    if(!active())return;started=true;timers.clearTimeout(watchdog);onSpeaking(true);
    timer(()=>retryOrFail('speech-timeout'),15000);
   };
   utterance.onend=()=>{if(active())settle(true);};
   utterance.onerror=event=>{if(!active())return;if(['canceled','interrupted'].includes(event.error))settle(false);else retryOrFail(event.error||'speech-error');};
   // Some Android engines expose an incomplete voice list. Submit the language
   // immediately and allow the native engine to select its installed voice.
   if(synthesis.paused)synthesis.resume?.();
   timer(()=>retryOrFail('start-timeout'),1800);
   synthesis.speak(utterance);
  }
  try{
   const voice=voiceFor(lang);
   if(!voice){voiceListener=()=>{
    if(current!==generation||!finish||started||attempt!==1)return;
    const loaded=voiceFor(lang);if(loaded){attempt++;synthesis.cancel();launch(loaded);}
   };synthesis.addEventListener?.('voiceschanged',voiceListener);}
   launch(voice);
  }catch{settle(false,'speech-error');}
  return completion;
 }
 return {speak,cancel,warmup};
}
