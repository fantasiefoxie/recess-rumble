# Cycle 11 — Notes — v1.9.0 — 2026-11-26

Prior spec: v1.8.0
Status: CLOSED

## Scope

C11-T1 — GPU stem renderer (WGSL compute, 5 chiptune stems, deterministic PCM)
C11-T2 — Scheduler + readback limits (2-bar lookahead, 100ms tick, 0.25s bar-boundary crossfades)
C11-T3 — Mood table + transitions + fallbacks (7 reactive moods, priority, ducks, WebGL2/CPU fallback)
C11-T4 — Save/settings wiring (musicVolume, save.muted, RR_MUSIC_ENABLED_v1, volume slider, corrupt defaults)

## Tests

Start v1.8.0: 231/231 PASS
C11-T1: 234/234 PASS — 3 new tests
C11-T2: 236/236 PASS — 2 new tests
C11-T3: 240/240 PASS — 4 new tests (ruling A: music_bar_crossfade already counted in T2)
C11-T4: 241/241 PASS — 1 new test
C11-CLOSE re-verify: 241/241 PASS, zero console errors

## Canonical rulings

1. Ruling A (test count): T1=3, T2=2, T3=4, T4=1 new tests; 241/241 only after T4. music_bar_crossfade belongs to T2, not duplicated in T3.
2. Ruling A (settings UI): one #music-volume range slider added inside existing settings area; existing #hud-mute wired; no second range input, no duplicate listeners.
3. RR_MUSIC_ENABLED_v1 storage type is string '1'/'0' (preserved, never migrated).
4. WebGL2 context unavailable in the test browser → CPU fallback path canonical for that environment; WebGL2 remains coded as first fallback.
5. T4 corrupt defaults: musicVolume 'loud' -> 0.8, save.muted 'yes' -> false, junk enable flag -> '1'; single repair write.

## Known issues

None. No external assets, CDN, npm, build step, or ScriptProcessor. Offline file:// supported. C10 / C9 / C8 regressions all PASS.

## Deferred / C12

No C12 work started. Candidates: more moods, loop variation, visualizer, per-stem volume, OST export.
