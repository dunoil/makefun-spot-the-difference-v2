// game.js — the rules of Spot the Difference: state, input, timer, scoring.
// One job: play. Painting lives in draw.js, scenes in levels.js, sound in audio.js.

import { LEVELS, TOTAL_DIFFERENCES } from './levels.js';
import { drawScene, drawFoundMarker, drawHintPulse, drawCursor, drawWrongMark } from './draw.js';
import { playFind, playWrong, playHint, playLevelClear, playWin, playTick, setMuted, isMuted } from './audio.js';

const canvasA = document.getElementById('panel-a');
const canvasB = document.getElementById('panel-b');
const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');

const elFound = document.getElementById('found-count');
const elTimer = document.getElementById('timer');
const elScore = document.getElementById('score');
const elHints = document.getElementById('hints-left');
const elLevelName = document.getElementById('level-name');
const elMessage = document.getElementById('message');
const elHintBtn = document.getElementById('hint-btn');
const elMuteBtn = document.getElementById('mute-btn');
const elOverlay = document.getElementById('overlay');
const elOverlayTitle = document.getElementById('overlay-title');
const elOverlayText = document.getElementById('overlay-text');
const elOverlayScore = document.getElementById('overlay-score');
const elOverlayBtn = document.getElementById('overlay-btn');

const FIND_POINTS = 100;
const WRONG_POINTS = 25;
const WRONG_TIME_SEC = 5;
const TIME_BONUS_PER_SEC = 5;
const HINTS_PER_LEVEL = 3;
const CURSOR_STEP = 12;
const CURSOR_FINE_STEP = 3;

const state = {
  screen: 'title', // title | playing | levelDone | gameDone | timeUp
  levelIndex: 0,
  found: [], // { diff, atMs } in the order found
  wrongMarks: [], // { x, y, atMs }
  score: 0,
  totalFound: 0,
  hintsLeft: HINTS_PER_LEVEL,
  hintDiff: null, // difference currently pulsing, or null
  hintUntilMs: 0,
  timeLeftSec: 0,
  lastTickSec: -1,
  cursor: { x: 300, y: 190, visible: false },
  levelStartMs: 0,
  levelResults: [], // { name, found, timeLeftSec, bonus }
};

function level() {
  return LEVELS[state.levelIndex];
}

function foundIds() {
  return new Set(state.found.map((f) => f.diff.id));
}

function remainingCount() {
  return level().differences.length - state.found.length;
}

function formatTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function showOverlay(title, text, scoreText, buttonLabel, onClick) {
  elOverlayTitle.textContent = title;
  elOverlayText.textContent = text;
  elOverlayScore.textContent = scoreText;
  elOverlayBtn.textContent = buttonLabel;
  elOverlay.classList.remove('hidden');
  elOverlayBtn.onclick = () => {
    elOverlay.classList.add('hidden');
    onClick();
  };
}

function hideOverlay() {
  elOverlay.classList.add('hidden');
}

function updateHud() {
  const lv = level();
  elLevelName.textContent = `Level ${state.levelIndex + 1} of ${LEVELS.length}: ${lv.name}`;
  elFound.textContent = `${state.found.length} / ${lv.differences.length}`;
  elTimer.textContent = formatTime(state.timeLeftSec);
  elTimer.classList.toggle('low', state.screen === 'playing' && state.timeLeftSec <= 10);
  elScore.textContent = String(state.score);
  elHints.textContent = String(state.hintsLeft);
  elHintBtn.disabled = state.screen !== 'playing' || state.hintsLeft <= 0 || remainingCount() === 0;
}

function setMessage(text) {
  elMessage.textContent = text;
}

function startLevel(index) {
  state.levelIndex = index;
  state.found = [];
  state.wrongMarks = [];
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintDiff = null;
  state.timeLeftSec = level().timeLimitSec;
  state.lastTickSec = -1;
  state.cursor = { x: 300, y: 190, visible: false };
  state.screen = 'playing';
  state.levelStartMs = performance.now();
  hideOverlay();
  setMessage(`Find ${level().differences.length} differences in ${level().name}. Wrong clicks cost ${WRONG_TIME_SEC} seconds.`);
  updateHud();
}

function startGame() {
  state.score = 0;
  state.totalFound = 0;
  state.levelResults = [];
  startLevel(0);
}

function levelComplete() {
  state.screen = 'levelDone';
  const bonus = Math.round(state.timeLeftSec) * TIME_BONUS_PER_SEC;
  state.score += bonus;
  state.levelResults.push({ name: level().name, found: state.found.length, timeLeftSec: state.timeLeftSec, bonus });
  playLevelClear();
  updateHud();
  const isLast = state.levelIndex === LEVELS.length - 1;
  if (isLast) {
    state.screen = 'gameDone';
    playWin();
    showOverlay(
      'You found them all!',
      `All ${TOTAL_DIFFERENCES} differences across ${LEVELS.length} scenes, sharp eyes. ` +
        `Levels cleared: ${state.levelResults.map((r) => r.name).join(', ')}.`,
      `Final score: ${state.score}`,
      'Play again',
      startGame,
    );
  } else {
    showOverlay(
      `${level().name} complete!`,
      `You found all ${level().differences.length} differences with ${formatTime(state.timeLeftSec)} to spare. ` +
        `Next up: ${LEVELS[state.levelIndex + 1].name}, ${LEVELS[state.levelIndex + 1].differences.length} differences, ` +
        `${LEVELS[state.levelIndex + 1].timeLimitSec} seconds.`,
      `Time bonus +${bonus}  |  Score: ${state.score}`,
      'Next level',
      () => startLevel(state.levelIndex + 1),
    );
  }
}

function timeUp() {
  state.screen = 'timeUp';
  playWrong();
  updateHud();
  showOverlay(
    'Out of time!',
    `The clock ran out on ${level().name} with ${remainingCount()} difference${remainingCount() === 1 ? '' : 's'} still hiding. ` +
      `Your sharp eyes found ${state.totalFound} of ${TOTAL_DIFFERENCES} in total.`,
    `Score: ${state.score}`,
    'Try this level again',
    () => startLevel(state.levelIndex),
  );
}

function nearestUnfound(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const diff of level().differences) {
    if (foundIds().has(diff.id)) continue;
    const dist = Math.hypot(diff.x - x, diff.y - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = diff;
    }
  }
  return best && bestDist <= best.r + 10 ? best : null;
}

function markAt(x, y) {
  if (state.screen !== 'playing') return;
  const diff = nearestUnfound(x, y);
  if (diff) {
    state.found.push({ diff, atMs: performance.now() });
    state.totalFound += 1;
    state.score += FIND_POINTS;
    playFind();
    setMessage(`Found: ${diff.name}! ${remainingCount()} to go.`);
    if (remainingCount() === 0) levelComplete();
  } else {
    state.wrongMarks.push({ x, y, atMs: performance.now() });
    state.timeLeftSec = Math.max(0, state.timeLeftSec - WRONG_TIME_SEC);
    state.score = Math.max(0, state.score - WRONG_POINTS);
    playWrong();
    setMessage(`Nothing there. Minus ${WRONG_TIME_SEC} seconds and ${WRONG_POINTS} points.`);
    if (state.timeLeftSec <= 0) timeUp();
  }
  updateHud();
}

function useHint() {
  if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
  const unfound = level().differences.filter((d) => !foundIds().has(d.id));
  if (unfound.length === 0) return;
  state.hintsLeft -= 1;
  state.hintDiff = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintUntilMs = performance.now() + 2500;
  playHint();
  setMessage(`Hint: look near the pulsing ring. ${state.hintsLeft} hint${state.hintsLeft === 1 ? '' : 's'} left.`);
  updateHud();
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

canvasA.addEventListener('click', (event) => {
  const p = canvasPoint(event, canvasA);
  markAt(p.x, p.y);
});
canvasB.addEventListener('click', (event) => {
  const p = canvasPoint(event, canvasB);
  markAt(p.x, p.y);
});

elHintBtn.addEventListener('click', useHint);
elMuteBtn.addEventListener('click', () => {
  setMuted(!isMuted());
  elMuteBtn.textContent = isMuted() ? 'Sound: off' : 'Sound: on';
});

document.addEventListener('keydown', (event) => {
  if (state.screen === 'playing') {
    const step = event.shiftKey ? CURSOR_FINE_STEP : CURSOR_STEP;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      state.cursor.visible = true;
      if (event.key === 'ArrowLeft') state.cursor.x = Math.max(0, state.cursor.x - step);
      if (event.key === 'ArrowRight') state.cursor.x = Math.min(600, state.cursor.x + step);
      if (event.key === 'ArrowUp') state.cursor.y = Math.max(0, state.cursor.y - step);
      if (event.key === 'ArrowDown') state.cursor.y = Math.min(380, state.cursor.y + step);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!state.cursor.visible) state.cursor.visible = true;
      markAt(state.cursor.x, state.cursor.y);
      return;
    }
    if (event.key === 'h' || event.key === 'H') {
      useHint();
      return;
    }
  }
  if (event.key === 'Enter' && state.screen !== 'playing' && !elOverlay.classList.contains('hidden')) {
    elOverlayBtn.click();
  }
});

// ---------------------------------------------------------------- rendering --
let lastFrameMs = performance.now();

function render(nowMs) {
  const lv = level();
  drawScene(ctxA, lv, 0);
  drawScene(ctxB, lv, 1);

  for (const entry of state.found) {
    const progress = (nowMs - entry.atMs) / 350;
    drawFoundMarker(ctxA, entry.diff, progress, nowMs);
    drawFoundMarker(ctxB, entry.diff, progress, nowMs);
  }

  if (state.hintDiff && nowMs < state.hintUntilMs) {
    drawHintPulse(ctxA, state.hintDiff, nowMs);
    drawHintPulse(ctxB, state.hintDiff, nowMs);
  } else {
    state.hintDiff = null;
  }

  state.wrongMarks = state.wrongMarks.filter((m) => nowMs - m.atMs < 700);
  for (const m of state.wrongMarks) {
    drawWrongMark(ctxA, m.x, m.y, nowMs - m.atMs);
    drawWrongMark(ctxB, m.x, m.y, nowMs - m.atMs);
  }

  if (state.cursor.visible && state.screen === 'playing') {
    drawCursor(ctxA, state.cursor.x, state.cursor.y);
    drawCursor(ctxB, state.cursor.x, state.cursor.y);
  }
}

function frame(nowMs) {
  const dtSec = (nowMs - lastFrameMs) / 1000;
  lastFrameMs = nowMs;
  if (state.screen === 'playing') {
    state.timeLeftSec -= dtSec;
    const wholeSec = Math.ceil(state.timeLeftSec);
    if (wholeSec <= 10 && wholeSec !== state.lastTickSec && wholeSec > 0) {
      state.lastTickSec = wholeSec;
      playTick();
    }
    if (state.timeLeftSec <= 0) {
      state.timeLeftSec = 0;
      updateHud();
      render(nowMs);
      timeUp();
      requestAnimationFrame(frame);
      return;
    }
    updateHud();
  }
  render(nowMs);
  requestAnimationFrame(frame);
}

// ------------------------------------------------------- screenshot support --
// ?shot=LEVEL:IDX,IDX starts a level with those differences already found,
// ?shot=leveldone:LEVEL shows that level's complete screen, ?shot=win shows
// the game-complete screen, ?shot=title shows the title screen. These only
// pre-arrange a state for screenshots; the game plays normally without them.
function applyShotParam() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  if (shot === 'title') return true;
  if (shot === 'win') {
    state.score = 2540;
    state.totalFound = TOTAL_DIFFERENCES;
    state.screen = 'gameDone';
    state.levelResults = LEVELS.map((lv) => ({ name: lv.name, found: lv.differences.length, timeLeftSec: 42, bonus: 210 }));
    showOverlay(
      'You found them all!',
      `All ${TOTAL_DIFFERENCES} differences across ${LEVELS.length} scenes, sharp eyes. ` +
        `Levels cleared: ${LEVELS.map((lv) => lv.name).join(', ')}.`,
      `Final score: ${state.score}`,
      'Play again',
      startGame,
    );
    return true;
  }
  const doneMatch = shot.match(/^leveldone:(\d+)$/);
  if (doneMatch) {
    const idx = Math.min(LEVELS.length - 1, Math.max(0, parseInt(doneMatch[1], 10) - 1));
    state.levelIndex = idx;
    state.found = LEVELS[idx].differences.map((diff) => ({ diff, atMs: 0 }));
    state.timeLeftSec = 87;
    state.score = 1180;
    state.screen = 'levelDone';
    const bonus = Math.round(state.timeLeftSec) * TIME_BONUS_PER_SEC;
    showOverlay(
      `${LEVELS[idx].name} complete!`,
      `You found all ${LEVELS[idx].differences.length} differences with ${formatTime(state.timeLeftSec)} to spare. ` +
        `Next up: ${LEVELS[Math.min(idx + 1, LEVELS.length - 1)].name}.`,
      `Time bonus +${bonus}  |  Score: ${state.score}`,
      'Next level',
      () => startLevel(idx + 1),
    );
    updateHud();
    return true;
  }
  const playMatch = shot.match(/^(\d+):([\d,]*)$/);
  if (playMatch) {
    const idx = Math.min(LEVELS.length - 1, Math.max(0, parseInt(playMatch[1], 10) - 1));
    startLevel(idx);
    const wanted = playMatch[2].split(',').filter(Boolean).map((n) => parseInt(n, 10));
    for (const n of wanted) {
      const diff = LEVELS[idx].differences[n];
      if (diff) state.found.push({ diff, atMs: 0 });
    }
    state.totalFound = state.found.length;
    state.score = state.found.length * FIND_POINTS;
    setMessage(`Found ${state.found.length} of ${LEVELS[idx].differences.length} differences. ${remainingCount()} to go.`);
    updateHud();
    return true;
  }
  return false;
}

function showTitle() {
  state.screen = 'title';
  state.levelIndex = 0;
  state.found = [];
  state.timeLeftSec = LEVELS[0].timeLimitSec;
  updateHud();
  showOverlay(
    'Spot the Difference',
    'Three hand-painted scenes, 29 hidden differences. Study the two pictures side by side, ' +
      'click every difference you spot, and beat the clock. Wrong clicks cost 5 seconds, ' +
      'hints are limited to 3 per level, and the keyboard works too: arrows move, Enter marks.',
    'Levels: Harbour at Dawn (7)  |  Lantern Market at Night (10)  |  Forest Clearing (12)',
    'Start playing',
    startGame,
  );
}

if (!applyShotParam()) showTitle();
requestAnimationFrame(frame);
