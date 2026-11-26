# Cycle 6 — v1.4.0

T1: Dasher (speed 1.6, HP 0.7, #ffd166, Wave 3+) + Bruiser (speed 0.6, HP 2.0, #9d4edd, Wave 4+) + Elite (2.5× HP, ×1.4 size, +5 coins, max 1/wave, Waves 3+ only) — PASS
T2: Danger 0/1/2 — HP ×1 / ×1.15 / ×1.30, coins ×1 / ×1.10 / ×1.25, run-only, resets to 0 — PASS
T3: Synergies Swift / Heavy / Lifedrain — 2+ shared grants one +5% speed / +5% damage / +1% lifesteal, no 3+ stacking, via getEffectiveStats() / clampStat() — PASS
T4: Snack (15 coins, heals 25% max HP, once per run) + Weapon Reroll (10 coins, weapon offer only) — PASS
T5: Endless — CONTINUE only on WIN, Wave 6+ HP +10%/wave, coins +5%/wave, Danger stacks; all 4 characters re-cleared Wave 5 at Danger 0; Runner Endless to Wave 11, 514 kills — PASS
C4 caps re-check: Speed ≤400 / Lifesteal ≤5% — PASS (observed max speed 263.7, max lifesteal 0.03)
Final verification: RR_TESTS.runAll(): 128/128 PASS, zero console errors
