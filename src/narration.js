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
export function createNarrator({synthesis=globalThis.speechSynthesis, Utterance=globalThis.SpeechSynthesisUtterance, onSpeaking=()=>{}, onUnavailable=()=>{}}={}) {
  let generation=0, finish;
  function cancel(){generation++;synthesis?.cancel();finish?.(false);finish=undefined;onSpeaking(false);}
  function speak(text,lang){
    cancel();const current=generation;
    const completion=new Promise(resolve=>{finish=resolve;});
    if(!synthesis||!Utterance){onUnavailable();finish(false);return completion;}
    try{
      const voices=synthesis.getVoices();
      const voice=voices.find(v=>v.lang.toLowerCase().replace('_','-')===(lang==='vi'?'vi-vn':'en-us')) || voices.find(v=>v.lang.toLowerCase().startsWith(lang));
      // Never knowingly read Vietnamese in a different language's voice.
      if(voices.length&&!voice){onUnavailable();finish(false);return completion;}
      const utterance=new Utterance(text);
      utterance.lang=lang==='vi'?'vi-VN':'en-US';if(voice)utterance.voice=voice;
      utterance.rate=lang==='vi'?.85:.8;utterance.pitch=1.08;utterance.volume=1;
      utterance.onstart=()=>{if(current===generation)onSpeaking(true);};
      utterance.onend=()=>{if(current===generation){onSpeaking(false);finish?.(true);}};
      utterance.onerror=event=>{if(current!==generation)return;onSpeaking(false);finish?.(false);if(!['canceled','interrupted'].includes(event.error))onUnavailable();};
      synthesis.speak(utterance);
    }catch{onSpeaking(false);onUnavailable();finish?.(false);}
    return completion;
  }
  return {speak,cancel};
}
