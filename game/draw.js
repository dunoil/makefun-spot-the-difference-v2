// draw.js — paints every scene on canvas, one shared picture per level with the
// differences applied per side. The base scene is drawn identically for both
// panels; then each difference paints its own element differently on side 0
// (left) and side 1 (right). Nothing here reads the network: all art is code.

import { PANEL_WIDTH, PANEL_HEIGHT } from './levels.js';

const W = PANEL_WIDTH;
const H = PANEL_HEIGHT;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function gull(ctx, x, y, scale) {
  ctx.beginPath();
  ctx.arc(x - 7 * scale, y, 8 * scale, Math.PI * 1.05, Math.PI * 1.95);
  ctx.arc(x + 7 * scale, y, 8 * scale, Math.PI * 1.05, Math.PI * 1.95);
  ctx.strokeStyle = '#3a3f4a';
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

function cloud(ctx, x, y, scale, fill) {
  ellipse(ctx, x, y, 34 * scale, 15 * scale, fill);
  ellipse(ctx, x - 22 * scale, y + 5 * scale, 20 * scale, 11 * scale, fill);
  ellipse(ctx, x + 24 * scale, y + 5 * scale, 22 * scale, 12 * scale, fill);
}

// ---------------------------------------------------------------- harbour ---
function drawHarbourBase(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 210);
  sky.addColorStop(0, '#f7c98b');
  sky.addColorStop(0.55, '#f2a56b');
  sky.addColorStop(1, '#e88a7a');
  rect(ctx, 0, 0, W, 210, sky);
  circle(ctx, 118, 78, 26, '#fff3c4');
  cloud(ctx, 250, 60, 1, 'rgba(255,244,220,0.9)');
  cloud(ctx, 420, 40, 0.8, 'rgba(255,244,220,0.75)');
  // Distant headland.
  poly(ctx, [[0, 210], [150, 150], [300, 210]], '#b97a6d');
  poly(ctx, [[330, 210], [470, 165], [600, 210]], '#a96a63');
  // Sea.
  const sea = ctx.createLinearGradient(0, 210, 0, H);
  sea.addColorStop(0, '#7fb3c8');
  sea.addColorStop(1, '#3f7d9b');
  rect(ctx, 0, 210, W, H - 210, sea);
  for (let i = 0; i < 7; i++) {
    line(ctx, 40 + i * 80, 232 + (i % 3) * 22, 110 + i * 80, 232 + (i % 3) * 22, 'rgba(255,255,255,0.35)', 2);
  }
  // Sun glitter on the water.
  for (let i = 0; i < 5; i++) {
    line(ctx, 96 + i * 6, 240 + i * 16, 140 - i * 6, 240 + i * 16, 'rgba(255,240,180,0.5)', 3);
  }
  // Dock planks along the bottom.
  rect(ctx, 0, 330, W, 50, '#8a6242');
  for (let x = 0; x < W; x += 60) line(ctx, x, 330, x, H, '#6e4a2f', 2);
  line(ctx, 0, 344, W, 344, '#6e4a2f', 2);
  // Harbour house, left.
  rect(ctx, 52, 218, 84, 72, '#f3e3c2');
  poly(ctx, [[44, 220], [94, 182], [144, 220]], '#b3543f');
  rect(ctx, 84, 252, 20, 38, '#6e4a2f');
  // Boat with a mast, centre.
  poly(ctx, [[250, 268], [350, 268], [330, 296], [270, 296]], '#7a4a2b');
  line(ctx, 300, 268, 300, 196, '#5d3a22', 4);
  poly(ctx, [[302, 200], [342, 236], [302, 236]], '#fdf6e3');
  // Lighthouse, right.
  rect(ctx, 522, 120, 34, 150, '#f2ede0');
  for (const y of [150, 190, 230]) rect(ctx, 522, y, 34, 16, '#c0392b');
  rect(ctx, 516, 100, 46, 24, '#33414f');
  poly(ctx, [[512, 102], [539, 78], [566, 102]], '#33414f');
  // Crates on the dock.
  rect(ctx, 186, 306, 26, 24, '#a9803e');
  line(ctx, 186, 318, 212, 318, '#7c5a26', 2);
  line(ctx, 199, 306, 199, 330, '#7c5a26', 2);
}

function drawHarbourDifference(ctx, id, side) {
  if (id === 'sun-rays') {
    if (side === 0) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        line(ctx, 118 + Math.cos(a) * 32, 78 + Math.sin(a) * 32,
          118 + Math.cos(a) * 44, 78 + Math.sin(a) * 44, '#fff3c4', 3);
      }
    }
  } else if (id === 'lighthouse-beam') {
    if (side === 0) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      poly(ctx, [[516, 112], [380, 70], [380, 150]], '#ffe98a');
      ctx.restore();
      circle(ctx, 539, 112, 10, '#fff6b0');
    }
  } else if (id === 'boat-flag') {
    poly(ctx, [[300, 196], [300, 178], [326, 187]], side === 0 ? '#d64533' : '#2e8f86');
  } else if (id === 'third-gull') {
    if (side === 0) gull(ctx, 428, 68, 1);
  } else if (id === 'buoy') {
    if (side === 0) {
      ellipse(ctx, 478, 300, 14, 10, '#d64533');
      rect(ctx, 474, 284, 8, 10, '#d64533');
      circle(ctx, 478, 282, 4, '#ffd23f');
    }
  } else if (id === 'house-window') {
    rect(ctx, 66, 232, 18, 18, side === 0 ? '#ffd23f' : '#33414f');
    if (side === 0) {
      line(ctx, 75, 232, 75, 250, '#8a6242', 2);
      line(ctx, 66, 241, 84, 241, '#8a6242', 2);
    }
  } else if (id === 'extra-crate') {
    if (side === 1) {
      rect(ctx, 192, 282, 24, 24, '#a9803e');
      line(ctx, 192, 294, 216, 294, '#7c5a26', 2);
    }
  }
}

// ----------------------------------------------------------------- market ---
function drawMarketBase(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#101736');
  sky.addColorStop(1, '#2a2a5e');
  rect(ctx, 0, 0, W, 240, sky);
  // Stars (the fixed ones; the missing-star difference adds one more).
  const fixedStars = [[40, 30], [150, 80], [210, 36], [260, 90], [340, 40], [400, 70], [470, 30], [560, 100], [580, 40], [120, 120]];
  for (const [x, y] of fixedStars) star(ctx, x, y, 3.5, '#fff8d6');
  // Rooftops and walls.
  rect(ctx, 0, 170, W, 130, '#3d2b4f');
  rect(ctx, 0, 170, 130, 130, '#4a3358');
  poly(ctx, [[0, 172], [65, 128], [130, 172]], '#2c1e3a');
  rect(ctx, 470, 170, 130, 130, '#4a3358');
  poly(ctx, [[470, 172], [535, 128], [600, 172]], '#2c1e3a');
  // Cobblestone street.
  rect(ctx, 0, 300, W, 80, '#5b5470');
  for (let y = 312; y < H; y += 18) {
    for (let x = ((y / 18) % 2) * 20; x < W; x += 40) {
      ellipse(ctx, x, y, 16, 6, 'rgba(0,0,0,0.18)');
    }
  }
  // Stall awnings, left and right.
  poly(ctx, [[130, 210], [270, 210], [258, 176], [142, 176]], '#d64533');
  for (let i = 0; i < 4; i++) {
    poly(ctx, [[142 + i * 29, 176], [171 + i * 29, 176], [167 + i * 29, 210], [146 + i * 29, 210]], '#f3e3c2');
  }
  poly(ctx, [[330, 210], [470, 210], [458, 176], [342, 176]], '#2e8f86');
  for (let i = 0; i < 4; i++) {
    poly(ctx, [[342 + i * 29, 176], [371 + i * 29, 176], [367 + i * 29, 210], [346 + i * 29, 210]], '#f3e3c2');
  }
  // Stall counters and goods.
  rect(ctx, 140, 240, 120, 60, '#7a4a2b');
  rect(ctx, 340, 240, 120, 60, '#7a4a2b');
  circle(ctx, 170, 232, 9, '#e2574c');
  circle(ctx, 195, 232, 9, '#e2574c');
  circle(ctx, 220, 232, 9, '#f2a541');
  circle(ctx, 400, 232, 9, '#f2a541');
  circle(ctx, 425, 232, 9, '#7fb069');
  // Paper lanterns on a string across the top.
  line(ctx, 0, 96, W, 96, '#1c1c30', 2);
  const lanternXs = [60, 120, 178, 240, 300, 360, 420, 480, 540];
  for (const x of lanternXs) {
    line(ctx, x, 96, x, 104, '#1c1c30', 2);
    ellipse(ctx, x, 118, 13, 16, '#e2574c');
    line(ctx, x - 13, 118, x + 13, 118, '#b23a30', 1.5);
  }
  // Vendor behind the right stall.
  circle(ctx, 382, 226, 14, '#f2c89b');
  rect(ctx, 364, 240, 36, 60, '#3f6fb5');
}

function drawMarketDifference(ctx, id, side) {
  if (id === 'moon') {
    if (side === 0) {
      circle(ctx, 518, 62, 22, '#fdf6d8');
      circle(ctx, 512, 58, 4, '#e8ddb0');
      circle(ctx, 526, 68, 3, '#e8ddb0');
    } else {
      circle(ctx, 518, 62, 22, '#fdf6d8');
      circle(ctx, 528, 56, 20, '#2a2a5e');
    }
  } else if (id === 'lantern-colour') {
    ellipse(ctx, 178, 118, 13, 16, side === 0 ? '#e2574c' : '#4caf6d');
    line(ctx, 165, 118, 191, 118, side === 0 ? '#b23a30' : '#2f7a4a', 1.5);
  } else if (id === 'missing-star') {
    if (side === 0) star(ctx, 92, 52, 4, '#fff8d6');
  } else if (id === 'roof-cat') {
    if (side === 0) {
      ellipse(ctx, 448, 148, 16, 8, '#22222e');
      circle(ctx, 462, 140, 7, '#22222e');
      poly(ctx, [[458, 134], [460, 128], [464, 134]], '#22222e');
      poly(ctx, [[464, 134], [467, 128], [469, 134]], '#22222e');
      line(ctx, 432, 146, 424, 140, '#22222e', 2.5);
    }
  } else if (id === 'awning-stripe') {
    if (side === 1) {
      poly(ctx, [[200, 176], [229, 176], [225, 210], [204, 210]], '#d64533');
    }
  } else if (id === 'fruit-basket') {
    ellipse(ctx, 332, 306, 22, 10, '#8a6242');
    for (let i = 0; i < 4; i++) circle(ctx, 318 + i * 10, 298, 7, side === 0 ? '#d64533' : '#f28c28');
  } else if (id === 'dark-bulb') {
    circle(ctx, 300, 96, 5, side === 0 ? '#ffe98a' : '#3a3a55');
    if (side === 0) circle(ctx, 300, 96, 10, 'rgba(255,233,138,0.35)');
  } else if (id === 'stall-sign') {
    circle(ctx, 252, 216, 12, '#f3e3c2');
    if (side === 0) star(ctx, 252, 216, 7, '#d64533');
    else circle(ctx, 252, 216, 5, '#2e8f86');
  } else if (id === 'vendor-hat') {
    if (side === 0) {
      ellipse(ctx, 382, 214, 16, 7, '#d64533');
      rect(ctx, 374, 208, 16, 8, '#d64533');
    }
  } else if (id === 'shutter') {
    if (side === 0) {
      rect(ctx, 44, 216, 36, 32, '#2e8f86');
      line(ctx, 62, 216, 62, 248, '#245f59', 3);
    } else {
      rect(ctx, 44, 216, 36, 32, '#6e4a2f');
      for (let y = 222; y < 248; y += 6) line(ctx, 44, y, 80, y, '#54371f', 2);
    }
  }
}

// ----------------------------------------------------------------- forest ---
function drawForestBase(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#bfe3f0');
  sky.addColorStop(1, '#e8f3d8');
  rect(ctx, 0, 0, W, 200, sky);
  circle(ctx, 90, 60, 24, '#fff3c4');
  cloud(ctx, 300, 50, 0.9, 'rgba(255,255,255,0.95)');
  // Far treeline.
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 68;
    poly(ctx, [[x, 200], [x + 30, 120 + (i % 3) * 14], [x + 60, 200]], i % 2 ? '#5d8a4a' : '#6d9a55');
  }
  // Grass clearing.
  const grass = ctx.createLinearGradient(0, 200, 0, H);
  grass.addColorStop(0, '#8fbf6a');
  grass.addColorStop(1, '#5d8a4a');
  rect(ctx, 0, 200, W, H - 200, grass);
  // Stream, bottom right.
  poly(ctx, [[430, 380], [470, 260], [540, 260], [600, 380], [600, 380]], '#6fb7d9');
  poly(ctx, [[470, 260], [540, 260], [560, 300], [500, 300]], '#8ecbe8');
  // Big old oak, left.
  rect(ctx, 128, 170, 44, 150, '#6e4a2f');
  circle(ctx, 120, 150, 46, '#4d7a38');
  circle(ctx, 180, 140, 52, '#5d8a4a');
  circle(ctx, 150, 105, 48, '#6d9a55');
  ellipse(ctx, 150, 185, 14, 20, '#3a2a1a');
  // Berry bush, right.
  circle(ctx, 542, 235, 30, '#3f6b2f');
  circle(ctx, 522, 245, 20, '#4d7a38');
  circle(ctx, 560, 245, 20, '#4d7a38');
  // Flowers scattered on the grass.
  const flowers = [[60, 300], [180, 350], [260, 290], [340, 310], [420, 350], [520, 300], [560, 350]];
  for (const [x, y] of flowers) {
    line(ctx, x, y, x, y - 12, '#3f6b2f', 2);
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      circle(ctx, x + Math.cos(a) * 5, y - 14 + Math.sin(a) * 5, 3.5, '#f2a541');
    }
    circle(ctx, x, y - 14, 3, '#d64533');
  }
  // Mushroom, left.
  rect(ctx, 116, 318, 10, 14, '#f3e3c2');
  // Sunbeams through the canopy.
  ctx.save();
  ctx.globalAlpha = 0.12;
  poly(ctx, [[220, 0], [280, 0], [340, 200], [260, 200]], '#fff8d6');
  poly(ctx, [[380, 0], [420, 0], [470, 200], [420, 200]], '#fff8d6');
  ctx.restore();
}

function drawForestDifference(ctx, id, side) {
  if (id === 'mushroom-cap') {
    poly(ctx, [[104, 320], [140, 320], [122, 300]], side === 0 ? '#d64533' : '#3f6fb5');
    if (side === 0) {
      circle(ctx, 114, 310, 3, '#fff');
      circle(ctx, 128, 306, 2.5, '#fff');
    }
  } else if (id === 'butterfly') {
    if (side === 0) {
      ellipse(ctx, 414, 132, 8, 11, '#f28c28');
      ellipse(ctx, 430, 132, 8, 11, '#f2a541');
      line(ctx, 422, 122, 422, 142, '#333', 1.5);
    }
  } else if (id === 'hollow-owl') {
    if (side === 0) {
      ellipse(ctx, 150, 182, 11, 14, '#8a6d4b');
      circle(ctx, 146, 176, 3, '#fff');
      circle(ctx, 154, 176, 3, '#fff');
      circle(ctx, 146, 176, 1.5, '#222');
      circle(ctx, 154, 176, 1.5, '#222');
      poly(ctx, [[148, 184], [152, 184], [150, 188]], '#f2a541');
    }
  } else if (id === 'extra-flower') {
    if (side === 1) {
      line(ctx, 302, 332, 302, 320, '#3f6b2f', 2);
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5;
        circle(ctx, 302 + Math.cos(a) * 5, 318 + Math.sin(a) * 5, 3.5, '#e2574c');
      }
      circle(ctx, 302, 318, 3, '#ffd23f');
    }
  } else if (id === 'stream-fish') {
    if (side === 0) {
      ellipse(ctx, 482, 322, 12, 6, '#f28c28');
      poly(ctx, [[494, 322], [502, 316], [502, 328]], '#f28c28');
      circle(ctx, 474, 320, 1.5, '#222');
    }
  } else if (id === 'cloud') {
    if (side === 0) cloud(ctx, 482, 56, 0.8, 'rgba(255,255,255,0.95)');
  } else if (id === 'rabbit') {
    if (side === 0) {
      ellipse(ctx, 232, 306, 16, 11, '#e8e0d0');
      circle(ctx, 246, 296, 9, '#e8e0d0');
      ellipse(ctx, 242, 282, 3, 8, '#e8e0d0');
      ellipse(ctx, 248, 282, 3, 8, '#e8e0d0');
      circle(ctx, 252, 296, 1.5, '#222');
    }
  } else if (id === 'berry-colour') {
    for (const [x, y] of [[532, 228], [548, 220], [542, 244], [556, 238]]) {
      circle(ctx, x, y, 5, side === 0 ? '#d64533' : '#7a4a9e');
    }
  } else if (id === 'acorn') {
    if (side === 0) {
      ellipse(ctx, 352, 348, 6, 7, '#8a6242');
      ellipse(ctx, 352, 342, 7, 4, '#6e4a2f');
      line(ctx, 352, 338, 356, 334, '#6e4a2f', 2);
    }
  } else if (id === 'branch-bird') {
    if (side === 0) {
      ellipse(ctx, 382, 112, 10, 7, '#3f6fb5');
      circle(ctx, 390, 106, 5, '#3f6fb5');
      poly(ctx, [[394, 106], [399, 108], [394, 110]], '#f2a541');
      line(ctx, 378, 118, 386, 118, '#333', 1.5);
    }
  } else if (id === 'extra-rock') {
    if (side === 1) {
      ellipse(ctx, 92, 354, 14, 9, '#8a8a92');
      ellipse(ctx, 88, 350, 6, 4, '#a9a9b2');
    }
  } else if (id === 'firefly') {
    if (side === 0) {
      circle(ctx, 502, 182, 4, '#ffe98a');
      circle(ctx, 502, 182, 9, 'rgba(255,233,138,0.4)');
    }
  }
}

const BASE_DRAWERS = { harbour: drawHarbourBase, market: drawMarketBase, forest: drawForestBase };
const DIFF_DRAWERS = { harbour: drawHarbourDifference, market: drawMarketDifference, forest: drawForestDifference };

// Paint one whole panel: the shared base scene, then this side's version of
// every difference. Side 0 is the left picture, side 1 the right picture.
export function drawScene(ctx, level, side) {
  ctx.clearRect(0, 0, W, H);
  BASE_DRAWERS[level.id](ctx);
  for (const diff of level.differences) DIFF_DRAWERS[level.id](ctx, diff.id, side);
}

// A found difference: a gold ring that pops in, plus a tick. progress 0..1
// is the pop animation; 1 means settled.
export function drawFoundMarker(ctx, diff, progress, nowMs) {
  const p = Math.min(1, progress);
  const ease = 1 - Math.pow(1 - p, 3);
  const r = diff.r * (0.6 + 0.4 * ease);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * ease;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r - 7, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,210,63,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Tick.
  ctx.beginPath();
  ctx.moveTo(diff.x - 8, diff.y);
  ctx.lineTo(diff.x - 2, diff.y + 7);
  ctx.lineTo(diff.x + 9, diff.y - 7);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

// The hint pulse: a breathing ring around one unfound difference.
export function drawHintPulse(ctx, diff, nowMs) {
  const breathe = 0.5 + 0.5 * Math.sin(nowMs / 180);
  ctx.save();
  ctx.globalAlpha = 0.45 + 0.4 * breathe;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r + 4 + breathe * 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#7fd4ff';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.restore();
}

// The keyboard cursor: a small crosshair mirrored on both panels.
export function drawCursor(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x - 6, y);
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y - 6);
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 18);
  ctx.stroke();
  ctx.restore();
}

// A wrong click: a red X that fades. ageMs is how long it has been visible.
export function drawWrongMark(ctx, x, y, ageMs) {
  const alpha = Math.max(0, 1 - ageMs / 700);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff5a4e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 10);
  ctx.lineTo(x + 10, y + 10);
  ctx.moveTo(x + 10, y - 10);
  ctx.lineTo(x - 10, y + 10);
  ctx.stroke();
  ctx.restore();
}
