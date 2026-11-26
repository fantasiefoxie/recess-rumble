# Cycle 8 — Notes — v1.6.0 — 2026-11-26

## Scope

C8-T1 Weapon / Meta Tier — 4 weapons (Cricket Bat, Slingshot, Tiffin Throw, Ruler), 1 equipped per run, +2 damage per weapon level, all via getEffectiveStats()/hitEnemy().
C8-T2 Level-up (7-choice pool, queue, event-first) — pick 1 of 3 distinct seeded choices, queued modals, event > chest > level-up > craft ordering.
C8-T3 Elites + Materials — x3 HP / x1.5 dmg / x0.9 speed / x1.35 scale / x3 XP / x2 coins, wave 2+, caps + guarantee, 2 seeded material drops per elite.
C8-T4 Consumables + Chests + Crafting — Tiffin/Bomb/Shield hotkeys 1/2/3, 5%/100% chest chance with 3-of-7 choices, 3 material+coin recipes.
C8-T5 Danger 0-5 + Endless — exact 7-column table, Danger x Elite x Endless stacking, wave 11+ curve with speed cap 1.30.

## Tests

C8-T1: 136/136 PASS (8 weapon tests)
C8-T2: 144/144 PASS (8 level-up tests)
C8-T3: 150/150 PASS (6 elite/material tests)
C8-T4: 158/158 PASS (8 consumable/chest/craft tests)
C8-T5: 165/165 PASS (7 danger/endless/regression tests)
Final: RR_TESTS.runAll(): 165/165 PASS, zero console errors. No test fix required in CLOSE.

## Manual Checks

Weapon select / mechanics / level scaling / C7 stacking — PASS
Level-up modal / pool / queue / event-first / seeded choices — PASS
Elite stats / spawn caps / guarantee / material drops / HUD — PASS
Consumables / chest pool / crafting costs / modal ordering — PASS
Danger 0-5 table / elite stack / Endless 11-15-20 / speed cap — PASS
Smoke: level-up / elite / chest / craft / Danger all work — PASS

## Deviations

Spawn-count multipliers implemented by shortening the timer-based spawn interval (the game has no fixed per-wave count); dangerSpawnCount() holds the exact ceil formula for tests.
Vitality / chest +Max HP / craft +Max HP applied directly to player.maxHp and tracked in bonus fields (same pattern as School Set / Blessing) to avoid double-counting with getEffectiveStats().

## Deferred / C9

No C9 work done in CLOSE. Candidate next: art/audio polish, achievement tie-ins, further Endless boss variety.
