// === RECESS RUMBLE: BROTATO DEPTH SPEC v1.9.0 ===
// v1.9.0 — CYCLE 11 / C11 complete — 2026-11-26: GPU procedural chiptune music — WGSL 5-stem renderer, bar scheduler with 0.25s crossfades, 7 reactive moods + priority, WebGL2/CPU fallbacks, volume/mute/enable wiring. 241/241 tests PASS, zero console errors.
// v1.8.0 — CYCLE 10 / C10 complete — 2026-11-26: level-up pool + reroll, Danger 1-5 + Endless, 2 characters + unlocks, in-run shop + recycle / harvest + bank, achievements + run history / lifetime stats. 231/231 tests PASS, zero console errors.
// v1.7.0 — CYCLE 9 / C9 complete — 2026-11-26: 3 starter characters, persistent meta shop, 2 new weapons, bosses every 10 waves + 2 enemies, traits + synergies + 4 mid-run events. 199/199 tests PASS, zero console errors.
// v1.6.0 — CYCLE 8 / C8 complete — 2026-11-26: weapons, level-up choices, elites+materials, consumables+chests+crafting, Danger 0-5 + Endless. 165/165 tests PASS, zero console errors.
// ## v1.5.0 — C7 complete: Sets (C7-T2) + Curse/Blessing Event (C7-T3) + Boss Affixes + Seeded/Daily Run (C7-T4) + Meta Tier-2 (C7-T5). 128/128 tests PASS, zero console errors.
// v1.4.0 — Cycle 6: enemy variety + elites, Danger selector, build synergies, shop consumable + weapon reroll, Endless continuation. No balance rework to C1–C5.
// v1.3.0 — Cycle 5: HUD controls, hit feedback, keyboard + reduced-motion, save safety + run summary. No balance changes.
// Authored Cycle 1. Do not edit without bumping to v2.
// v1.1 task 8.5: compass is a standalone primary weapon (own fireCompass path, source:'compass', label T{stacks});
// tank starts kancha T1 + gilli T1 (secondaryWeapon field); aimer starts patang T2 (startTier field).
// [v1.1.1] aimer: starts with kancha T1 as secondary weapon; patang T2 remains identity weapon.

§1. Weapon Tier Merge
- Alias: keep the existing level field name, treat it as tier. tier = weapon.level, tierMax = current cap (5/3/3). No new field. Display string becomes T{tier}/{tierMax}.
- Merge trigger: when the shop offers a weapon the player already owns (same id) and its tier < tierMax, picking it auto-merges: tier += 1, no new weapon added, no fire-timer reset.
- Shop offers a weapon the player does NOT own: adds new weapon at tier 1 via existing addWeapon path, unchanged.
- Evolution gate: the three evolution triggers keep existing prerequisite logic; the combining weapon just has to be finished enough. No change to L1119–1122. (Noted as expected, no surprise.)
- Tier scaling: damage × 1.6^(tier-1), fireRate × 1.1^(tier-1), cap at tierMax. Existing level scaling replaced by this.
- Visual overlay: each tier adds one gear-sprite layer via the existing gear-drawing system.

§2. Item Rarity + Unique Effects
- Rarity multipliers and borders: common ×1.0 gray; rare ×1.4 blue; epic ×1.9 purple; legendary ×2.6 gold.
- Existing item rarities (locked): tiffin rare, bus common, chai common, ball rare, umbrella epic, notes common, water common.
- Six new unique-effect items (locked): lifeline epic (revive once per wave at 50% HP, resets on wave start); tiffin_box rare (heal 15% max HP at wave end); chalk_dust epic (on crit hit, blind nearest enemy 1.0s); marble_magnet common (+50% pickup radius, stacks multiplicatively); sharpener rare (+0.25 critDmg); hall_pass legendary (first 5s of each wave: no enemy spawns).
- Shop rarity coloring uses classes: item-common, item-rare, item-epic, item-legendary.

§3. Shop Depth
- Four slots, locked count.
- Lock button per slot (🔒) toggles locked:true; locked slots carry to next wave's shop and keep their item.
- Reroll button below slots. Cost = (5 + wave) * 1.5^rerollCount. Reroll resets per wave and re-rolls only unlocked slots.
- Coin balance shown in shop header.
- Locked item persists across rerolls and wave transitions until purchased or unlocked.

§4. Character Identity
- runner: kancha + bus, passive +30% speed / -1 HP.
- tank: gilli + water, passive +3 HP / -15% speed.
- aimer: patang + ball, passive +20% crit / -10% damage.
- scholar: compass + notes, passive +35% XP / -1 HP.
- Character select screen shows passive / weapon / item for all four characters.

§5. Wave Scaling Curve
- Enemy HP: baseHp * (1 + 0.25 * (wave - 1)). Elite multiplier ×2 stays. Boss uses same formula with base HP from BOSSES.
- Spawn interval unchanged, but hard cap maxEnemies = 60 + wave * 10; skip spawn when enemies.length >= cap.
- Elite chance = min(0.35, wave >= 3 ? 0.12 + (wave - 3) * 0.04 : 0).
- Boss waves: wave 5 only, unchanged.

§6. Stat Cap / Exponent Rules
- dodge soft-capped at 0.6 (60%).
- armor damage reduction: taken = dmg * (1 - armor/(armor + 10)); diminishing, no hard cap.
- fireMul capped at 4.0.
- crit chance capped at 1.0.
- critDmg no cap.
- magnet no cap.
- Cycle 4 adds hard caps via clampStat/getEffectiveStats: speed <= 400, lifesteal <= 0.05 (5%).

§7. index.html line count at Cycle 4 close: 1872 lines (was 1539 at Task 0).

## Cycle 4 — Stat Caps + Balance + Staggering + Pool + Meta
- C4-T1: clampStat(name,value) + getEffectiveStats() choke point; speed <= 400, lifesteal <= 0.05; non-finite -> 0.
- C4-T2: boss Phase 1 HP 160 for all 3; aimer flat crit +0.20 -> +0.15; waves 1-2 HP x0.85 and cap -1; EVOLVE cost unchanged at 25.
- C4-T3: unlockWave staggering across 41 entries (no 0/undefined, largest wave 29%, wave 5 highest-rarity only).
- C4-T4: +6 cards (2 common / 2 rare / 1 legendary / 1 evolution-synergy), card pool total 47; RANG SYNERGY has +5 coins fallback.
- C4-T5: +3 persistent metas (Pocket Money / Lunch Box / Study Hall), META total 8; no Speed/Lifesteal granted.
