// Original, locally synthesized melodies. Audio starts only after an interaction.
export function createSoundPlayer(getContext = () => {
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
}, timers = globalThis) {
  let context, enabled = true, generation = 0, paused = false;
  let musicEnabled = true, started = false, musicTimer, musicBus, ducked = false;
  let musicGeneration = 0, nextBeat = 0, beat = 0;
  const voices = new Set(), musicVoices = new Set();
  const tunes = {
    tap: [523, 659], merge: [392, 494, 587, 784],
    correct: [523, 659, 784, 1047, 784, 1047],
    retry: [440, 392, 440], next: [440, 587, 740], reset: [587, 440], toggle: [659, 880],
  };
  const melody = [523,659,784,659,587,659,523,0,440,523,659,523,494,587,392,0,
    523,659,784,880,784,659,587,0,659,587,523,440,392,494,523,0];
  function stopVoices(set) {
    for (const voice of set) { try { voice.stop(); } catch {} }
    set.clear();
  }
  function stop() { generation++; stopVoices(voices); }
  function stopMusic() {
    musicGeneration++;timers.clearTimeout(musicTimer);musicTimer=undefined;
    stopVoices(musicVoices);
  }
  async function ready() {
    context ??= getContext();
    if (!context) return false;
    if (context.state !== 'running') await context.resume();
    return context.state === 'running';
  }
  function note(frequency, start, duration, level, destination, set, type='sine') {
    const oscillator=context.createOscillator(), volume=context.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);
    volume.gain.setValueAtTime(0,start);
    volume.gain.linearRampToValueAtTime(level,start+.018);
    volume.gain.exponentialRampToValueAtTime(.001,start+duration);
    oscillator.connect(volume);volume.connect(destination);set.add(oscillator);
    oscillator.onended=()=>{set.delete(oscillator);oscillator.disconnect();volume.disconnect();};
    oscillator.start(start);oscillator.stop(start+duration+.03);
  }
  function scheduleMusic() {
    if (!enabled || !musicEnabled || paused || !started) return;
    if(nextBeat<context.currentTime)nextBeat=context.currentTime+.05;
    while(nextBeat<context.currentTime+1.2){
      const frequency=melody[beat%melody.length];
      if(frequency)note(frequency,nextBeat,.32,.032,musicBus,musicVoices);
      if(beat%8===0)note([131,110,131,98][Math.floor(beat/8)%4],nextBeat,.75,.025,musicBus,musicVoices);
      nextBeat+=.44;beat++;
    }
    musicTimer=timers.setTimeout(scheduleMusic,500);
  }
  async function startMusic() {
    if(!enabled||!musicEnabled||paused||!started||musicTimer!==undefined)return;
    const current=++musicGeneration;
    try {
      if(!await ready()||current!==musicGeneration||!enabled||!musicEnabled||paused)return;
      if(!musicBus){musicBus=context.createGain();musicBus.connect(context.destination);}
      musicBus.gain.setValueAtTime(ducked?.18:1,context.currentTime);
      nextBeat=context.currentTime+.05;scheduleMusic();
    } catch { /* The game still works if the device blocks audio. */ }
  }
  async function play(name) {
    if (!enabled || paused) return;
    stop();const current=generation;
    try {
      if(!await ready()||!enabled||paused||current!==generation)return;
      const notes=tunes[name]||tunes.tap;
      const spacing=name==='correct'?.13:name==='retry'?.18:.095;
      notes.forEach((frequency,index)=>note(frequency,context.currentTime+index*spacing,.23,name==='retry'?.065:.09,context.destination,voices));
    } catch { /* Optional audio must not interrupt play. */ }
  }
  return {
    play,
    async audioContext() { if(await ready())return context;throw new Error('Audio unavailable'); },
    start() { started=true;return startMusic(); },
    setEnabled(value) { enabled=value;if(!value){stop();stopMusic();}else return startMusic(); },
    setMusicEnabled(value) { musicEnabled=value;if(!value)stopMusic();else return startMusic(); },
    setDucked(value) { ducked=value;if(musicBus)musicBus.gain.setTargetAtTime(value?.18:1,context.currentTime,.08); },
    setPaused(value) { paused=value;if(value){stop();stopMusic();}else return startMusic(); },
    dispose() { started=false;stop();stopMusic(); },
  };
}
