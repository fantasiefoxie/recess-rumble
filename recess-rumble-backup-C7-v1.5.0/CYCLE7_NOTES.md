# Cycle 7 Notes — v1.5.0

## C7-T1 — Evolutions
- 3 recipes (Kancha+Bus Pass → Swift Kancha, Patang+Cricket Ball → Heavy Patang, Gilli+Sharpener → Heavy Gilli); +15% damage, star label, once per weapon per run, item not consumed, no-recipe EVOLVE unchanged.
- Tests: 128/128

## C7-T2 — Sets
- School Set (Bus Pass + Tiffin) +10 Max HP + heal 10; Street Set (Chai + Cricket Ball) +5% crit; both-equipped only, break removes, stacked with synergies and evolutions.
- Tests: 128/128

## C7-T3 — Curse/Blessing Event
- One-time modal after 3rd battle win; Blessing +5 Max HP +5 HP +10% XP, Curse +15% damage and -5 HP floored at 1, Walk Away +10 coins; run-only, paused while open, stats row Event.
- Tests: 128/128

## C7-T4 — Boss Affixes + Seeded/Daily Run
- 5-affix pool, 2 distinct per boss via seeded RNG (Thick Skin / Swift / Vampiric / Spiky / Greedy); seed input + Daily YYYY-MM-DD, seeded affixes/shop/wave composition only, HUD Seed display.
- Tests: 128/128

## C7-T5 — Meta Tier-2
- 8 fixed names mapped 1:1, Tier-2 bonuses via getEffectiveStats()/helpers, unlock at 1 completed run + 5 wins in one run, META panel toggle, 16-combo matrix + 8 cross-system checks PASS.
- Tests: 128/128

## Regressions
- C4 caps hold (Speed <=400, Lifesteal <=5%); C5 HUD/accessibility/summary intact; C6 affixes/seeded/Endless intact; all 4 characters WIN wave 5 at Danger 0; Endless waves 6-10 with wave-10 boss affixes and Tier-2 persistence.
- RR_TESTS.runAll(): 128/128 PASS, zero console errors after hard reload.

## Known limitations
- Vampiric affix applies via nearest-boss proxy in hurtPlayer; boss attack telegraph/phase logic unchanged.
- Endless verification used wave-jump simulation (wave assignment + startWave), not a full 10-wave survival run.
- Event modal reuses the existing overlay tagged data-event-modal rather than a separate #eventModal element; no new panel was introduced.
