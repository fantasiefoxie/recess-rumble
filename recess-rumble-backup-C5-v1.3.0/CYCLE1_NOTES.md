# Recess Rumble — Cycle 1 Wrap Notes

## 1. What Changed (systems shipped)
- Weapon tier merge (spec §1) — tiers 1–5/3/3, merge-on-purchase, gear overlay per tier.
- Item rarity + 6 unique-effect items (spec §2) — common/rare/epic/legendary, lifeline/tiffin_box/chalk_dust/marble_magnet/sharpener/hall_pass.
- Shop depth (spec §3) — 4 slots, lock buttons, reroll with cost curve (5+wave)*1.5^n, locked slot persistence across reroll and wave.
- Character identity (spec §4) — 4 chars, unique start weapons+items, select screen 3-column.
- Wave scaling (spec §5): hp = base*(1+0.25*(w-1)); spawn cap 60+10w; elite curve to 0.35
- Stat caps (spec §6): dodge 0.6, armor diminishing, crit 1.0
- UI: shop + level-up refreshed via Stitch reference, code-drawn DOM integration

## Playtest results (4/4 wave-5 wins)
- runner: L13 131k 112c — evos none
- tank: L22 178k 124c — evos masala
- aimer: L20 165k 119c — evos none
- scholar: L22 136k 111c — evos none

## Known deviations from original plan
- Speed cap (400) + lifesteal cap (5%) deferred to Cycle 2
- Rarity multiplier applies only to numeric stat-deltas (by design)
- Compass projectile array is `marbles` not `bullets` (naming only)
- Aimer secondary-weapon fix (v1.1.1) was a Task 8.5 insertion, not in v1 plan

## Deferred to Cycle 2
- Organic evolution reachability (only forced-trigger verified)
- Boss HP feel at wave 5 (160 HP — playable, may need tuning)
- Aimer passive recheck post-secondary-weapon
- Character unlock / progression meta
- Speed + lifesteal caps
- Stitch as reference-only (not code generator)

## Cycle 2 priorities (proposed, not locked)
1. Enemy skill depth + boss pattern variety
2. Meta-progression (unlocks, achievements tie-in)
3. Organic evolution reachability tuning
4. Balance pass: boss HP, aimer passive, early-wave difficulty

## 6. Checkpoint Artifacts
- `index.html` — post-Task 9, 105/105, 1721 lines (was 1539)
- `index_cycle1_backup.html` — snapshot at cycle close (105233 bytes)
- `DEPTH_SPEC.md` — v1.1.1 (3398 bytes)
- `DEPTH_SPEC_v1.1.1_backup.md` / `DEPTH_SPEC_cycle1_backup.md` — snapshots at cycle close (3398 bytes each)
- `CYCLE1_NOTES.md` — this file
- RR_TESTS: 105/105 | micro runners: 200/200 + 2000/2000
