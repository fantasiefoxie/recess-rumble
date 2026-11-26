// === RECESS RUMBLE: BROTATO DEPTH SPEC v1.1.1 ===
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
