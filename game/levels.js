// levels.js — the three scenes of Spot the Difference and every hidden difference.
// One job: data. Painting lives in draw.js, rules live in game.js.
// A difference is a spot on the panel (x, y, radius) with a name the game shows
// once it is found. Both panels share these coordinates: the pictures match
// exactly except for what each difference's painter changes on one side.

export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 380;

export const LEVELS = [
  {
    id: 'harbour',
    name: 'Harbour at Dawn',
    tagline: 'Gulls, boats and a sleepy lighthouse waking up.',
    timeLimitSec: 150,
    differences: [
      { id: 'sun-rays', x: 118, y: 78, r: 34, name: 'Sun rays' },
      { id: 'lighthouse-beam', x: 538, y: 92, r: 30, name: 'Lighthouse beam' },
      { id: 'boat-flag', x: 298, y: 212, r: 22, name: 'Boat flag colour' },
      { id: 'third-gull', x: 428, y: 68, r: 20, name: 'Third seagull' },
      { id: 'buoy', x: 478, y: 298, r: 22, name: 'Red buoy' },
      { id: 'house-window', x: 92, y: 248, r: 20, name: 'Lit window' },
      { id: 'extra-crate', x: 212, y: 318, r: 26, name: 'Extra crate' },
    ],
  },
  {
    id: 'market',
    name: 'Lantern Market at Night',
    tagline: 'Paper lanterns, night stalls and one very sleepy cat.',
    timeLimitSec: 180,
    differences: [
      { id: 'moon', x: 518, y: 62, r: 30, name: 'The moon' },
      { id: 'lantern-colour', x: 178, y: 112, r: 20, name: 'Lantern colour' },
      { id: 'missing-star', x: 92, y: 52, r: 14, name: 'A missing star' },
      { id: 'roof-cat', x: 448, y: 148, r: 24, name: 'Cat on the roof' },
      { id: 'awning-stripe', x: 152, y: 192, r: 26, name: 'Awning stripe' },
      { id: 'fruit-basket', x: 332, y: 302, r: 24, name: 'Fruit in the basket' },
      { id: 'dark-bulb', x: 300, y: 96, r: 14, name: 'A dark bulb' },
      { id: 'stall-sign', x: 252, y: 216, r: 18, name: 'Stall sign' },
      { id: 'vendor-hat', x: 382, y: 228, r: 22, name: 'Vendor hat' },
      { id: 'shutter', x: 62, y: 232, r: 22, name: 'Window shutter' },
    ],
  },
  {
    id: 'forest',
    name: 'Forest Clearing',
    tagline: 'Mushrooms, fireflies and something hiding in the old oak.',
    timeLimitSec: 210,
    differences: [
      { id: 'mushroom-cap', x: 122, y: 318, r: 20, name: 'Mushroom cap colour' },
      { id: 'butterfly', x: 422, y: 132, r: 20, name: 'Butterfly' },
      { id: 'hollow-owl', x: 152, y: 182, r: 24, name: 'Owl in the hollow' },
      { id: 'extra-flower', x: 302, y: 332, r: 16, name: 'Extra flower' },
      { id: 'stream-fish', x: 482, y: 322, r: 20, name: 'Fish in the stream' },
      { id: 'cloud', x: 482, y: 56, r: 26, name: 'Cloud' },
      { id: 'rabbit', x: 232, y: 302, r: 24, name: 'Rabbit in the grass' },
      { id: 'berry-colour', x: 542, y: 232, r: 18, name: 'Berry colour' },
      { id: 'acorn', x: 352, y: 346, r: 14, name: 'Acorn' },
      { id: 'branch-bird', x: 382, y: 112, r: 20, name: 'Bird on the branch' },
      { id: 'extra-rock', x: 92, y: 352, r: 18, name: 'Extra rock' },
      { id: 'firefly', x: 502, y: 182, r: 14, name: 'Firefly' },
    ],
  },
];

export const TOTAL_DIFFERENCES = LEVELS.reduce((sum, level) => sum + level.differences.length, 0);
