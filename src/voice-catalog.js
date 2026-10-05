import {problemPool} from './math.js';
import {questionText,numberText} from './narration.js';
export const voiceCatalog=Object.fromEntries(['vi','en'].map(lang=>{
 const entries=[];
 for(let n=0;n<=20;n++)entries.push({id:`number-${n}`,text:numberText(lang,n)});
 for(const mode of ['add','subtract','multiply','divide']){
  for(const [a,b] of problemPool(mode))entries.push({id:`question-${mode}-${a}-${b}`,text:questionText(lang,mode,a,b)});
 }
 entries.push({id:'correct',text:lang==='vi'?'Giỏi lắm! Bé đếm đúng rồi!':'Well done! You counted them all!'});
 entries.push({id:'retry',text:lang==='vi'?'Không sao cả! Mình cùng chơi lại và đếm thật kỹ nhé.':'That’s okay! Let’s start again and count together.'});
 return [lang,entries];
}));
