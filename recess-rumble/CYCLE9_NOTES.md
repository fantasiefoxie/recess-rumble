# Cycle 9 — v1.7.0

Date: 2026-11-26

Prior spec: v1.6.0

Status: CLOSED

## T1 — Characters
3 starters (Raju/Meena/Kabir) with distinct stats, weapons, passives, pick UI and HUD row; 171/171 PASS.

## T2 — Meta Shop
Persistent RR_META_SHOP_v1 bank + 6 upgrades x 3 tiers, banked-only spend, run-start application; 179/179 PASS.

## T3 — Weapons
2 new weapons (Water Balloon + Pressure Cooker), total 6, craft/Training gates, L1-L5 tables; 185/185 PASS.

## T4 — Bosses + Enemies
Boss every 10 waves, 3-boss rotation + HP/damage table, deterministic affixes, Spice Sprinter + Tiffin Shieldbearer; 192/192 PASS.

## T5 — Traits + Events
6 traits with 3 pick-1 draft, 5 synergies, 4 mid-run events; 199/199 PASS.

## Canonical rulings (5)
1. Boss chest cloth = 5 (exact spec, C9-T4).
2. Boss affix selection = deterministic wave % pool (no RNG, C9-T4).
3. Live boss HP = table HP x 2^N / 4 x Danger HP mult (balance-preserving, C9-T4).
4. Trait + event state is run-only and lost on reload; no save write (C9-T5).
5. Tank Feast synergy = Tiffin Tank + Tiffin Stock Tier 2+ (revised, C9-T5).

## Known issues
None. C9-T4 affix labels use the implementation pool order (Greedy / Thick Skin / etc.) as canonical, mapped to behaviors.

## Deferred / C10
No C10 work started. Candidate: new game modes (daily/challenge), achievements, art/audio polish.
