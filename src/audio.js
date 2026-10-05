// Gentle, locally synthesized effects: no downloads, credentials or autoplay.
export function createSoundPlayer(getContext = () => {
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
}) {
  let context, enabled = true, generation = 0;
  const voices = new Set();
  const tunes = {
    tap: [523, 659], merge: [392, 494, 587, 784], correct: [523, 659, 784, 1047],
    retry: [392, 440], next: [440, 587, 740], reset: [587, 440], toggle: [659, 880],
  };
  function stop() {
    generation++;
    for (const voice of voices) { try { voice.stop(); } catch {} }
    voices.clear();
  }
  async function play(name) {
    if (!enabled) return;
    stop();
    const current = generation;
    try {
      context ??= getContext();
      if (!context) return;
      if (context.state !== 'running') await context.resume();
      if (!enabled || current !== generation || context.state !== 'running') return;
      const notes = tunes[name] || tunes.tap;
      notes.forEach((frequency, index) => {
        const start = context.currentTime + index * 0.095;
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        volume.gain.setValueAtTime(0, start);
        volume.gain.linearRampToValueAtTime(0.09, start + 0.012);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.20);
        oscillator.connect(volume); volume.connect(context.destination);
        voices.add(oscillator);
        oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); volume.disconnect(); };
        oscillator.start(start); oscillator.stop(start + 0.22);
      });
    } catch { /* Audio is optional; keep the game playable on unsupported devices. */ }
  }
  return { play, setEnabled(value) { enabled = value; if (!value) stop(); } };
}
