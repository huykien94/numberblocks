// Optional maintainer task, not required to build or run the game.
// Requires eSpeak NG 1.52 and FFmpeg. Generated speech is not a human recording.
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {voiceCatalog} from '../src/voice-catalog.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const temp=mkdtempSync(join(tmpdir(),'numberblocks-voice-'));
const binary=process.env.NUMBERBLOCKS_ESPEAK || 'espeak-ng';
const data=process.env.NUMBERBLOCKS_ESPEAK_DATA;
function run(cmd,args){const result=spawnSync(cmd,args,{encoding:'utf8'});if(result.status!==0)throw new Error(result.error?.message||result.stderr);}
try{
 for(const [lang,entries] of Object.entries(voiceCatalog)){
  const folder=resolve(root,'public','audio',lang);mkdirSync(folder,{recursive:true});
  for(const {id,text} of entries){
   const wav=join(temp,'voice.wav');
   run(binary,[...(data?[`--path=${data}`]:[]),'-v',lang==='vi'?'vi':'en-us','-s',lang==='vi'?'145':'150','-p','55','-a','140','-w',wav,text]);
   run('ffmpeg',['-v','error','-y','-i',wav,'-af','silenceremove=start_periods=1:start_duration=0.01:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_duration=0.04:start_threshold=-48dB,areverse,loudnorm=I=-19:TP=-3:LRA=7','-ac','1','-ar','24000','-codec:a','libmp3lame','-b:a','48k',resolve(folder,`${id}.mp3`)]);
  }
  console.log(`${lang}: ${entries.length} clips generated`);
 }
 writeFileSync(resolve(root,'public/audio/README.txt'),'Original math prompts synthesized with eSpeak NG 1.52.0 (vi and en-us), encoded using FFmpeg. These are synthesized voices, not human recordings. Texts and regeneration script: src/voice-catalog.js and scripts/generate-voices.mjs. Speech engine project: https://github.com/espeak-ng/espeak-ng. No eSpeak NG binary, voice data or FFmpeg binary is distributed with this website.\n');
}finally{rmSync(temp,{recursive:true,force:true});}
