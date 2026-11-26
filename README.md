# Recess Rumble

A single-file, offline browser game — everyday India, original procedural art, and GPU-generated chiptune music. No build step, no dependencies, no external assets.

## Play

Open `recess-rumble/index.html` in a modern browser (Chrome recommended). Move with WASD/arrow keys or drag on touch; attacks fire automatically.

## Features

- 5 playable characters with unlock conditions and distinct passives
- 6 weapons, level-up pool with rerolls, meta shop and crafting
- Danger 1-5 plus Endless mode, bosses every 10 waves
- In-run shop, recycle/harvest materials, traits, synergies and events
- 12 achievements, run history and lifetime stats
- WebGPU/WGSL procedural chiptune with WebGL2/CPU fallbacks and reactive moods

## Tests

Open the game in a browser console and run:

```js
RR_TESTS.runAll()
```

Current status: **241/241 PASS**, zero console errors.

## Notes

`DEPTH_SPEC.md` and `CYCLE*_NOTES.md` document the design spec and cycle history. `recess-rumble/backups` and the `backup_C*` folders hold frozen prior versions.
