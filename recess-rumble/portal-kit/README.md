# Portal submission kit — Recess Rumble

## Generated assets
Open the game with `?tests=1` (or any state) in a browser console and call:

```js
exportCovers()
```

This downloads:
- `recess-rumble-cover-square.png` (512×512) — portal thumbnail / icon
- `recess-rumble-cover-wide.png` (1920×1080) — hero / social cover

Both are drawn procedurally by `generateCover()` from the game code — no image files are shipped with the game.

## CrazyGames submission checklist
- [ ] Web build: HTML5, no build step, well under 50 MB initial / 250 MB total / 1500 files
- [ ] SDK integration for Full Launch (placeholder hook, not bundled here)
- [ ] GameplayStart event fired when a run begins
- [ ] Mute/volume control available
- [ ] No external ads, no other portal branding
- [ ] Original art and audio (procedural), MIT-third-party notices kept in `keshin/` if shipped
- [ ] Game covers: square + wide generated above
- [ ] Trailer: capture 20–30s of a seeded run at 60fps
- [ ] English + Hindi UI strings present
- [ ] Touch and gamepad controls verified
- [ ] PEGI-12 safe: cartoon marbles/kites, no violence

## Notes
The game keeps 100% ownership; portals pay ad revenue share, they do not buy the game.
