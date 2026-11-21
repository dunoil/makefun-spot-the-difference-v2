# Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/dunoil/makefun-spot-the-difference-v2/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/dunoil/makefun-spot-the-difference-v2/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): two near-identical pictures side by side, 29 hidden differences across three original hand-painted canvas scenes, a countdown on every level, hints, sounds and a score.

## The game

Three levels of rising difficulty, each a different original scene drawn entirely in code (no image files, no network):

1. **Harbour at Dawn** — 7 differences, 150 seconds
2. **Lantern Market at Night** — 10 differences, 180 seconds
3. **Forest Clearing** — 12 differences, 210 seconds

Both panels are painted from one shared scene description with the differences applied per side, so the pictures match exactly except for the differences.

## How to play

- Click a difference in either picture to mark it. Found differences get a gold ring and a tick.
- Wrong clicks cost 5 seconds and 25 points.
- **Hint** button (or `H`): 3 uses per level, briefly pulses one unfound difference.
- Keyboard: arrow keys move the cursor, `Enter` or `Space` marks, `Shift` + arrows for fine movement.
- Each find is worth 100 points; clearing a level adds a time bonus of 5 points per second left.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome. It plays with no network request: every script, style and sound is a file under `game/` or synthesized with WebAudio.

## Files

- `game/index.html` — page, HUD and panels
- `game/game.js` — rules: state, input, timer, scoring
- `game/levels.js` — the three scenes and their difference sets
- `game/draw.js` — canvas painting of every scene and marker
- `game/audio.js` — synthesized WebAudio sounds
- `game/style.css` — layout and HUD
- `main.ts` — hands the game in to make.fun (copies `game/` and `screenshots/`, writes `dossier.json`)
- `screenshots/` — real renders of the game running in a browser
