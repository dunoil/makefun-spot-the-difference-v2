// audio.js — every sound is synthesized with WebAudio, no audio files.
// One job: short musical blips for finds, mistakes, hints and wins.

let audioCtx = null;
let muted = false;

function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, startSec, durSec, type, gainValue) {
  if (muted) return;
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + startSec;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durSec);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + durSec + 0.05);
  } catch (err) {
    // Audio is decoration: never let it break the game.
  }
}

// A bright two-note chime when a difference is found.
export function playFind() {
  tone(660, 0, 0.14, 'sine', 0.22);
  tone(990, 0.09, 0.22, 'sine', 0.22);
}

// A low buzz when the player clicks somewhere with no difference.
export function playWrong() {
  tone(160, 0, 0.18, 'square', 0.1);
  tone(120, 0.08, 0.2, 'square', 0.1);
}

// A soft ping when a hint lights up.
export function playHint() {
  tone(880, 0, 0.12, 'triangle', 0.16);
  tone(1174, 0.1, 0.16, 'triangle', 0.16);
}

// A rising arpeggio when a level is cleared.
export function playLevelClear() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => tone(n, i * 0.11, 0.2, 'triangle', 0.2));
}

// A longer fanfare when the whole game is finished.
export function playWin() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318];
  notes.forEach((n, i) => tone(n, i * 0.13, 0.26, 'triangle', 0.2));
}

// A quiet tick in the last ten seconds of a level.
export function playTick() {
  tone(1200, 0, 0.05, 'sine', 0.08);
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}
