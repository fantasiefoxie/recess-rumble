# Cycle 10 — Notes — v1.8.0 — 2026-11-26

Prior spec: v1.7.0
Status: CLOSED

## Scope

C10-T1 — In-run level-up pool + reroll (8 choices, 4 distinct offers, cost curve 0/10/20/40/80)
C10-T2 — Danger 1-5 + Endless (DANGER_TABLE, boss HP /4, wave 50+ curve, persistence)
C10-T3 — Meera + Arjun with unlocks (character select, Hot Tiffin, Sixer Streak)
C10-T4 — In-run shop + recycle / harvest + bank (9 items, refresh, scrap/herbs, bank keys)
C10-T5 — 12 achievements + run history (10 fields) + lifetime stats, reused PROFILE / STATS panel

## Tests

Start v1.7.0: 199/199 PASS
C10-T1: 207/207 PASS — 8 new tests
C10-T2: 213/213 PASS — 6 new tests
C10-T3: 219/219 PASS — 6 new tests
C10-T4: 225/225 PASS — 6 new tests
C10-T5: 231/231 PASS — 6 new tests
C10-CLOSE re-verify: 231/231 PASS, zero console errors

## Canonical rulings

1. C10-T2: flat player.armor=1 applies before Danger Taken; pool Armor 0.96^n applies after. Real D2 examples 13 (10 dmg) and 124 (100 dmg + 2 Armor picks).
2. C10-T2: Harvest is additive 1+0.10*n (resolves C10-T1 '+10%/5'); XP floor after Danger x Endless.
3. C10-T3: C9_CHARS.hp are spec values; in-run maxHp still uses pre-existing round(7*hpMult) formula to preserve C8 baseline.
4. C10-T3: Tiffin Lid / Tennis Ball are character-only defs, not added to the selectable weapon pool.
5. C10-T4: non-Endless runs end at Wave 5 (victory), so the W5 shop trigger is Endless-only; no shop on non-Endless victory. No core-loop change.
6. C10-T4: no rarity tiers exist in the game, so recycle uses tier 0 (15+10*level); no quit button, so bank occurs on death/victory only.
7. C10-T5: run history scrap/herbs use run.scrap/herbs at run end (spent amounts not separately tracked); no new tracking invented.

## Known issues

None. C8 / C9 / C10-T1–T5 regressions all PASS.

## Deferred / C11

No C11 work started. Candidates: art/audio polish, achievement rewards, achievement detail modal, spendable banked Scrap/Herbs, challenge/daily modes.
