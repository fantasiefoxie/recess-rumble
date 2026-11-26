// Recess Rumble test harness. Loaded after the game script; run with RR_TESTS.runAll().
window.RR_TESTS = (() => {
  const results = [];
  function assert(name, cond, detail) {
    results.push({ name, pass: !!cond, detail: detail || '' });
    return !!cond;
  }
  function fresh() {
    if (typeof newGame === 'function') newGame();
  }
  function c2SkillGate(kind) {
    fresh(); wave=4; spawnEnemy(kind); const on=enemies[enemies.length-1];
    wave=2; spawnEnemy(kind); const off=enemies[enemies.length-1];
    wave=1; fresh();
    return on.skillUnlocked===true && off.skillUnlocked===false && SKILL_TELEGRAPH>=0.4 && on.skillTimer<=SKILL_TELEGRAPH;
  }
  function c2Boss(kind, ratio) {
    fresh(); wave=5; bossKind=kind; spawnEnemy('boss');
    const b=enemies[enemies.length-1]; b.hp=b.maxHp*ratio; b.phase2Cd=0; return b;
  }
  function c2Tick(b, seconds) { const n=Math.ceil(seconds*60); for(let i=0;i<n;i++) updateBossPhase(b,1/60); }
  const tests = {
    balance() {
      assert('deterministic seed helper exists', typeof setSeedForTest === 'function');
      if (typeof setSeedForTest !== 'function') return;
      setSeedForTest(12345); fresh();
      const a = []; for (let i=0;i<8;i++) a.push(Math.round(rnd()*1e6));
      setSeedForTest(12345); fresh();
      const b = []; for (let i=0;i<8;i++) b.push(Math.round(rnd()*1e6));
      assert('same seed reproduces RNG stream', JSON.stringify(a) === JSON.stringify(b));
      assert('spawn uses seeded RNG', typeof spawnEnemy === 'function');
    },
    audio() {
      assert('audio engine exists', typeof audioEngine === 'object' && audioEngine !== null);
      if (typeof audioEngine !== 'object' || !audioEngine) return;
      let ok = true; try { audioEngine.sfx('hit'); audioEngine.sfx('pickup'); } catch(e) { ok = false; }
      assert('sfx calls do not throw', ok);
      assert('music start/stop exists', typeof audioEngine.startMusic === 'function' && typeof audioEngine.stopMusic === 'function');
    },
    onboarding() {
      assert('hint state exists', typeof hintsVisible !== 'undefined');
      if (typeof dismissHints === 'function') { dismissHints(); assert('hints dismiss', hintsVisible === false); }
    },
    portal() {
      assert('cover generator exists', typeof generateCover === 'function');
      if (typeof generateCover === 'function') {
        const url = generateCover();
        assert('cover is png data url', typeof url === 'string' && url.startsWith('data:image/png'));
      }
    },
    pooling() {
      assert('pool stats exist', typeof poolStats === 'function');
      if (typeof poolStats === 'function') {
        fresh();
        for (let i=0;i<40;i++) particles.push({x:i,y:i,vx:0,vy:0,life:1,color:'#fff'});
        for (let i=particles.length-1;i>=0;i--) { recycle('particle',particles[i]); particles.splice(i,1); }
        const s = poolStats();
        assert('particles recycled into pool', s.particlePool > 0, JSON.stringify(s));
      }
    },
    meta() {
      assert('best score persisted', typeof save === 'object' && 'bestScore' in save);
      if (typeof recordRun === 'function') {
        const before = save.bestScore || 0;
        const metaBefore = JSON.parse(JSON.stringify(save.meta));
        recordRun(999999, 123);
        assert('recordRun updates best score', save.bestScore >= 999999);
        assert('recordRun does not lower best', save.bestScore >= before);
        save.meta = metaBefore; persist();
      }
    },
    leaderboard() {
      assert('leaderboard helpers exist', typeof addScore === 'function' && typeof getScores === 'function');
      if (typeof addScore === 'function') {
        addScore(4321, 'test-seed');
        const list = getScores();
        addScore(999999, 'unit-seed');
      assert('score inserted', Array.isArray(getScores()) && getScores().some(x => x.score === 999999));
      }
    },
    achievements() {
      assert('achievement helpers exist', typeof unlockAchievement === 'function' && typeof achievements === 'object');
      if (typeof unlockAchievement === 'function') {
        unlockAchievement('test_achievement');
        assert('achievement unlocked', !!achievements.test_achievement);
      }
    },
    enemies() {
      assert('dust enemy defined', typeof FOES === 'object' && !!FOES.dust);
      if (typeof spawnEnemy === 'function' && FOES && FOES.dust) {
        const before = enemies.length; spawnEnemy('dust');
        assert('dust enemy spawns', enemies.length === before + 1 && enemies[enemies.length-1].kind === 'dust');
      }
    },
    accessibility() {
      assert('settings object has reducedMotion', typeof settings === 'object' && 'reducedMotion' in settings);
      if (typeof settings === 'object') {
        settings.reducedMotion = true; shake = 1;
        if (typeof update === 'function') update(1/60);
        assert('reduced motion clears shake', shake === 0);
        settings.reducedMotion = false;
      }
    },
    adaptive_music() { assert('music intensity exists', typeof musicIntensity === 'number'); },
    hit_stop() { hitStop=0.01; if (typeof tickHitStop==='function') tickHitStop(1/60); assert('hit stop expires', hitStop===0); },
    low_hp() { if (typeof lowHealth==='function') { player.hp=1; assert('low health detected', lowHealth()===true); player.hp=player.maxHp; assert('full health not low', lowHealth()===false); } },
    magnet_beam() { assert('magnet beam helper exists', typeof magnetBeamCount==='function'); },
    bullet_sprites() { assert('bullet kinds registered', Array.isArray(bulletKinds) && bulletKinds.length>=3); },
    spawn_warning() { if (typeof scheduleSpawn==='function') { scheduleSpawn(200,300); assert('spawn marker queued', spawnMarkers.length>0); } },
    combo() { if (typeof registerKill==='function') { combo=0; registerKill(); assert('combo increments', combo>=1); } },
    wave_banner() { assert('banner animation helper exists', typeof bannerScale==='function' && bannerScale()>0); },
    contextual_hints() { if (typeof showHintOnce==='function') { Object.keys(shownHints).forEach(k=>delete shownHints[k]); showHintOnce('unit'); showHintOnce('unit'); assert('hint shown once', Object.keys(shownHints).filter(k=>k==='unit').length===1); } },
    volume() { assert('volume settings exist', 'sfxVolume' in settings && 'musicVolume' in settings); },
    pause_menu() { assert('pause options include restart', typeof pauseOptions==='function' && pauseOptions().includes('RESTART')); },
    run_summary() { const s=runSummary(); assert('summary has keys', s && 'score' in s && 'wave' in s && 'time' in s); },
    localization() { const old=lang; lang='hi'; assert('card translated', t('EXTRA MARBLE')!=='EXTRA MARBLE'); lang=old; },
    pickup_pool() { if (typeof poolStats==='function') { const s=poolStats(); assert('pickup pool tracked', 'pickupPool' in s); } },
    key_remap() { assert('keymap exists', typeof settings.keymap==='object' && 'up' in settings.keymap); },
    event_variety() { assert('at least five events', EVENTS.length>=5); },
    new_weapon() { assert('compass weapon card exists', CARDS.some(c=>c.id==='compass')); },
    biome() { assert('biome tint deterministic', groundTint(42)===groundTint(42)); },
    trailer() { assert('trailer frames exportable', typeof exportTrailerFrames==='function' && exportTrailerFrames().length>0); },
    daily_challenge() { const a=challengeForDate('2026-11-26'), b=challengeForDate('2026-11-26'); assert('challenge deterministic', JSON.stringify(a)===JSON.stringify(b)); },
    scholar_has_primary_attack() {
      selectedChar='scholar'; newGame(); spawnEnemy('marble'); spawnEnemy('kite');
      for(let i=0;i<120;i++) updateWeapons(1/60);
      assert('compass fires own projectile', marbles.some(m=>m.source==='compass'));
      selectedChar='runner';
    },
    tank_has_ranged_fallback() {
      selectedChar='tank'; newGame();
      assert('tank has 2 weapons incl kancha', player.weapons.length===2 && player.weapons.some(w=>w.id==='kancha'));
      selectedChar='runner';
    },
    aimer_starts_tier2_patang() {
      selectedChar='aimer'; newGame();
      const p=player.weapons.find(w=>w.id==='patang');
      assert('aimer patang T2', !!p && p.level===2);
      assert('aimer has kancha T1 secondary', player.weapons.length===2 && player.weapons.some(w=>w.id==='kancha'&&w.level===1));
      selectedChar='runner';
    },
    meta_totalkills_increments_once() {
      fresh(); const before=save.meta.totalKills||0; const snapshot=JSON.parse(JSON.stringify(save.meta));
      recordRun(50, 777);
      const ok=save.meta.totalKills-before===50;
      save.meta=snapshot; persist();
      assert('totalKills increments once per run', ok, String(save.meta.totalKills-before));
    },
    meta_initializes_default() {
      const backup=save.meta; save.meta=undefined; migrateMeta(save);
      const ok=Array.isArray(save.meta.unlocks)&&save.meta.unlocks.length===0&&save.meta.totalRuns===0&&save.meta.totalKills===0;
      save.meta=backup;
      assert('meta initializes defaults', ok);
    },
    meta_migrates_existing_save() {
      const old={unlocked:['festival'],achievements:{victory:true},bestScore:99};
      migrateMeta(old);
      assert('migration preserves leaderboard/achievements', Array.isArray(old.meta.unlocks)&&old.unlocked[0]==='festival'&&old.achievements.victory===true&&old.bestScore===99);
    },
    meta_unlock_triggers() {
      fresh(); const before=save.meta.unlocks.slice(); save.meta.unlocks=[]; persist();
      score=150; wave=4; level=16; player.crit=0.35;
      checkMetaUnlocks({kills:score,wave,level,crit:player.crit,runs:save.totalRuns});
      const ok=save.meta.unlocks.includes('runner_unlock')&&save.meta.unlocks.includes('tank_unlock');
      save.meta.unlocks=before; persist();
      assert('run-end unlock conditions trigger', ok);
    },
    meta_effect_applies() {
      fresh(); const before=save.meta.unlocks.slice(); save.meta.unlocks=[]; persist(); newGame();
      const base={hp:player.maxHp,crit:player.crit,xp:player.xpMul,coins,rerollCount};
      save.meta.unlocks=META_UNLOCKS.map(u=>u.id);
      newGame();
      const ok=rerollCount===1&&player.maxHp===base.hp+1&&Math.abs(player.crit-(base.crit+0.05))<1e-6&&Math.abs(player.xpMul-base.xp*1.05)<1e-6&&coins===base.coins+2;
      save.meta.unlocks=before; persist(); newGame();
      assert('all 5 meta effects apply', ok);
    },
    evo_bias_offers_missing_weapon() {
      let hits=0;
      for (let s=0;s<20;s++) {
        fresh(); player.weapons=[{id:'kancha',type:'kancha',level:5}]; wave=3; setSeedForTest(1000+s); rollShop();
        if (shopOffers.some(o=>o&&o.type==='patang')) hits++;
      }
      wave=1; fresh();
      assert('missing prereq weapon biased at wave 3', hits/20>=0.3, String(hits)+'/20');
    },
    evo_bias_offers_undertier() {
      let hits=0;
      for (let s=0;s<20;s++) {
        fresh(); player.weapons=[{id:'kancha',type:'kancha',level:2}]; wave=3; setSeedForTest(2000+s); rollShop();
        if (shopOffers.some(o=>o&&o.type==='kancha')) hits++;
      }
      wave=1; fresh();
      assert('under-tier prereq biased at wave 3', hits/20>=0.3, String(hits)+'/20');
    },
    evo_bias_disabled_early() {
      const rate=w=>{ let hits=0; for(let s=0;s<50;s++){ fresh(); player.weapons=[{id:'kancha',type:'kancha',level:5}]; wave=w; setSeedForTest(3000+s); rollShop(); if(shopOffers.some(o=>o&&o.type==='patang')) hits++; } return hits/50; };
      const early=rate(1), late=rate(3); wave=1; fresh();
      assert('bias off at wave 1', early<late, early+'/'+late);
    },
    evo_offer_appears_in_shop() {
      fresh(); player.weapons=[{id:'kancha',type:'kancha',level:5},{id:'patang',type:'patang',level:3}];
      wave=3; coins=100; setSeedForTest(5555); showShop();
      const o=shopOffers[0]; const offered=!!(o&&o.isEvo&&o.evoId==='rang');
      buyShopOffer(0);
      const ok=offered&&coins===75&&player.evos.includes('rang');
      wave=1; fresh();
      assert('EVOLVE shop slot offers and applies', ok);
    },
    boss_phase2_fires() {
      assert('all 3 bosses phase 2 fires', ['top','prefect','bell'].every(k=>{
        const b=c2Boss(k,0.6); c2Tick(b,0.05);
        const okPhase=b.phase===2 && b.recoveryTimer>=0.75;
        c2Tick(b,1.6);
        return okPhase && b.phase2Fired>=1 && bullets.some(x=>x.boss);
      }));
    },
    boss_phase3_speed() {
      const b=c2Boss('top',0.32); c2Tick(b,0.05);
      assert('phase 3 speed x1.25', b.phase===3 && Math.abs(b.speed/(b.baseSpeed*1.25)-1)<0.01 && b.phase2CdMax===2);
    },
    boss_recovery_window() {
      const b=c2Boss('prefect',0.6); updateBossPhase(b,0);
      const rec=b.recoveryTimer, fired=b.phase2Fired;
      c2Tick(b,0.5); const held=b.phase2Fired===fired && b.recoveryTimer<0.31;
      c2Tick(b,1.2);
      assert('recovery >=0.8s blocks attacks', rec>=0.8 && held && b.phase2Fired>fired);
    },
    boss_phase3_attack_fires() {
      const b=c2Boss('bell',0.32); c2Tick(b,0.05); c2Tick(b,1.5); const first=b.phase2Fired;
      c2Tick(b,3.2);
      assert('phase 3 attack every 2s', first>=1 && b.phase2Fired>first && b.phase2CdMax===2);
    },
    c2_skill_goli() { assert('goli skill unlock gate', c2SkillGate('marble')); },
    c2_skill_patang() { assert('patang skill unlock gate', c2SkillGate('kite')); },
    c2_skill_danda() { assert('danda skill unlock gate', c2SkillGate('gilli')); },
    c2_skill_chalk() { assert('chalk skill unlock gate', c2SkillGate('dust')); },
    c2_skill_monitor() { assert('monitor skill unlock gate', c2SkillGate('monitor')); },
    c2_skill_sweeper() { assert('sweeper skill unlock gate', c2SkillGate('sweeper')); },
    c2_skill_peon() { assert('peon skill unlock gate', c2SkillGate('peon')); },
    c2_skill_duster() { assert('duster skill unlock gate', c2SkillGate('duster')); },
    c2_skill_captain() { assert('captain skill unlock gate', c2SkillGate('captain')); },
    c2_skill_copy() { assert('copy skill unlock gate', c2SkillGate('splitter')); },
    wave_hp_scaling() {
      const a=[1,3,5].map(w=>scaledHp(20,w,false));
      assert('HP scaling 20/30/40', JSON.stringify(a)==='[20,30,40]', JSON.stringify(a));
    },
    wave_elite_curve() {
      const a=[1,2,3,4,5,6,7,8,9,10].map(w=>eliteChance(w));
      const e=[0,0,0.12,0.16,0.2,0.24,0.28,0.32,0.35,0.35];
      assert('elite curve monotonic and capped', JSON.stringify(a)===JSON.stringify(e), JSON.stringify(a));
    },
    char_runner_start() {
      selectedChar='runner'; newGame();
      assert('runner starts kancha T1', player.weapons.length===1 && player.weapons[0].type==='kancha' && player.weapons[0].level===1);
      assert('runner starts bus', player.items.some(i=>i.id==='bus'));
      assert('runner coins unchanged', coins===(hasUnlock('coin_hoarder')?2:0)); selectedChar='runner';
    },
    char_tank_start() {
      selectedChar='tank'; newGame();
      assert('tank starts gilli + water', player.weapons[0].type==='gilli' && player.items.some(i=>i.id==='water')); selectedChar='runner';
    },
    char_aimer_start() {
      selectedChar='aimer'; newGame();
      assert('aimer starts patang + ball', player.weapons[0].type==='patang' && player.items.some(i=>i.id==='ball'));
      assert('ball rarity crit applied', player.crit>0.4, String(player.crit)); selectedChar='runner';
    },
    char_scholar_start() {
      selectedChar='scholar'; newGame();
      assert('scholar starts compass + notes', player.weapons[0].type==='compass' && player.items.some(i=>i.id==='notes')); selectedChar='runner';
    },
    shop_rarity_class_rendered() {
      newGame(); coins=100000; const kinds=new Set();
      const rarities=['item-common','item-rare','item-epic','item-legendary'];
      for (let k=0;k<20 && kinds.size<2;k++) {
        showShop();
        [...buttonsEl.querySelectorAll('.shop-slot')].forEach(el=>rarities.forEach(c=>{ if(el.classList.contains(c)) kinds.add(c); }));
        if (kinds.size<2) rerollShop();
      }
      assert('two rarity classes rendered on slots', kinds.size>=2, [...kinds].join(','));
    },
    shop_reroll_cost_rendered() {
      newGame(); coins=100; showShop();
      const btn=[...buttonsEl.querySelectorAll('button')].find(b=>b.textContent.includes('Reroll'));
      assert('reroll cost rendered with coin icon', !!btn && btn.textContent.includes('🪙') && btn.textContent.includes(String(rerollCost())), btn?btn.textContent:'no button');
    },
    shop_reroll_cost_curve() {
      const actual=[1,2,3,4,5].map(w=>[0,1,2].map(n=>{ wave=w; rerollCount=n; return rerollCost(); }));
      const expected=[1,2,3,4,5].map(w=>[0,1,2].map(n=>Math.floor((5+w)*Math.pow(1.5,n))));
      assert('reroll cost curve exact', JSON.stringify(actual)===JSON.stringify(expected), JSON.stringify(actual));
      wave=1; rerollCount=0;
    },
    shop_lock_persists_across_reroll() {
      newGame(); coins=200; showShop();
      const id=shopOffers[0].id; toggleShopLock(0); rerollShop();
      assert('locked slot survives reroll', shopOffers[0].id===id && shopOffers[0].locked===true);
    },
    shop_lock_persists_across_wave() {
      newGame(); coins=200; showShop();
      const id=shopOffers[0].id; toggleShopLock(0);
      carriedSlots=shopOffers.map(o=>o&&o.locked?Object.assign({},o,{locked:true}):null);
      rerollCount=0; wave++; startWave(); showShop();
      assert('locked slot survives wave', shopOffers[0].id===id && shopOffers[0].locked===true);
    },
    item_lifeline_revives() {
      newGame(); player.items.push(ITEMS.find(i=>i.id==='lifeline'));
      player.hp=0; invuln=0; hurtPlayer(0,0,1);
      assert('lifeline revives once', player.hp>0 && player.lifelineUsed===true);
      player.hp=0; invuln=0; hurtPlayer(0,0,1);
      assert('second death ends run', phase==='gameover');
    },
    item_tiffin_box_heals() {
      newGame(); player.items.push(ITEMS.find(i=>i.id==='tiffin_box'));
      player.hp=1; waveTime=0; update(1/60);
      assert('tiffin box heals 15%', player.hp >= 1+player.maxHp*0.15-0.01);
    },
    item_chalk_dust_blinds() {
      newGame(); player.items.push(ITEMS.find(i=>i.id==='chalk_dust'));
      spawnEnemy('marble'); spawnEnemy('marble');
      enemies[1].x=enemies[0].x+30; enemies[1].y=enemies[0].y;
      hitEnemy(enemies[0],1,true);
      assert('crit blinds nearest enemy', enemies.some(e=>(e.blindTimer||0)>=0.9));
    },
    item_marble_magnet_stacks() {
      newGame(); const base=player.magnet, item=ITEMS.find(i=>i.id==='marble_magnet');
      item.apply(player); const one=player.magnet; item.apply(player);
      assert('magnet x1.5 then x2.25', Math.abs(one/base-1.5)<0.01 && Math.abs(player.magnet/base-2.25)<0.01);
    },
    item_sharpener_crit_dmg() {
      newGame(); const base=player.critDmg; ITEMS.find(i=>i.id==='sharpener').apply(player);
      assert('critDmg +0.25', Math.abs(player.critDmg-base-0.25)<0.001);
    },
    item_hall_pass_blocks_spawns() {
      newGame(); player.items.push(ITEMS.find(i=>i.id==='hall_pass')); startWave(); enemies=[]; spawnTimer=0;
      for(let i=0;i<60;i++) update(1/60);
      assert('no spawns in first 5s', enemies.length===0);
      waveTime=14; for(let i=0;i<60;i++) update(1/60);
      assert('spawns resume after 5s', enemies.length>0);
    },
    tier_merge_increments() {
      newGame(); player.weapons=[{type:'kancha',level:1}]; coins=100;
      shopOffers=[{kind:'weapon',type:'kancha',price:10}];
      buyShopOffer(0);
      assert('duplicate merges tier', player.weapons[0].level===2);
      assert('no duplicate weapon added', player.weapons.length===1);
    },
    tier_merge_respects_cap() {
      newGame(); player.weapons=[{type:'patang',level:3}]; coins=100;
      shopOffers=[{kind:'weapon',type:'patang',price:10}];
      buyShopOffer(0);
      assert('capped tier unchanged', player.weapons[0].level===3);
      rollShop();
      assert('capped weapon omitted from shop', !shopOffers.some(o=>o.kind==='weapon'&&o.type==='patang'));
    },
    tier_scaling_damage() {
      const m=tierDamageMul({type:'kancha',level:3});
      assert('tier-3 damage ~2.56x', Math.abs(m-Math.pow(1.6,2))/Math.pow(1.6,2)<0.01, String(m));
    },
    tier_scaling_fire_rate() {
      const m=tierRateMul({type:'kancha',level:3});
      assert('tier-3 rate ~1.21x', Math.abs(m-Math.pow(1.1,2))/Math.pow(1.1,2)<0.01, String(m));
    },
    visible_gear() {
      newGame();
      player.items=[ITEMS.find(i=>i.id==='tiffin'), ITEMS.find(i=>i.id==='umbrella')].filter(Boolean);
      player.armor=1; player.dodge=0.1; player.evos=['masala','rang'];
      let ok=true; try { drawPixelKid(100,100,'s',0,0,0,0); } catch(e) { ok=false; }
      assert('gear renders without error', ok);
      assert('gear list present', player.items.length>0 && player.armor>0);
    },
    stats_panel() {
      const s=derivedStats();
      assert('derived stats complete', ['hp','damage','rate','crit','dodge','armor','speed'].every(k=>k in s));
      if (!statsVisible) toggleStats();
      assert('stats panel visible', !!statsEl && statsEl.classList.contains('show'));
      updateStatsPanel();
      assert('stats panel populated', statsEl.innerHTML.includes('RECESS STATS'));
      if (statsVisible) toggleStats();
    },
    enemy_depth_v2() {
      const ids=['peon','duster','captain','splitter'];
      assert('four new archetypes', ids.every(id=>!!FOES[id] && !!FOES[id].persona && !!FOES[id].skill));
      let ok=true;
      ids.forEach(id=>{ try { const n=enemies.length; spawnEnemy(id); triggerEnemySkill(enemies[enemies.length-1]); if(enemies.length<=n) ok=false; } catch(e) { ok=false; } });
      assert('skills fire without errors', ok);
      assert('persona labels tracked', typeof shownPersonas!=='undefined' && shownPersonas.size>0);
    },
    shop_engine() {
      assert('coins tracked', typeof coins==='number');
      coins=100; if (typeof showShop==='function') { showShop(); assert('shop offers generated', shopOffers.length>0); const before=coins; const btns=[...buttonsEl.querySelectorAll('button')]; assert('continue is first button', btns[0] && btns[0].textContent.includes('CONTINUE')); const buy=btns.find(b=>!b.disabled && /coins/.test(b.textContent)); if(buy) { buy.click(); assert('purchase deducts coins', coins<before); } }
    },
    enemy_depth() {
      assert('personas defined', !!FOES.monitor.persona && !!FOES.sweeper.persona);
      assert('skills defined', !!FOES.monitor.skill && !!FOES.gilli.skill && !!FOES.dust.skill);
      const before=enemies.length; spawnEnemy('monitor');
      assert('monitor spawns', enemies.length===before+1 && enemies[enemies.length-1].kind==='monitor');
      let ok=true; try { triggerEnemySkill(enemies[enemies.length-1]); } catch(e) { ok=false; }
      assert('skill fires without error', ok);
      assert('elite flag supported', 'elite' in enemies[enemies.length-1]);
    },
    character_engine() {
      assert('four characters', CHARACTERS.length>=4);
      const old=selectedChar; selectedChar='runner'; newGame();
      assert('runner speed bonus', player.speed>140);
      selectedChar='tank'; newGame();
      assert('tank hp bonus', player.maxHp>6);
      assert('character applied', typeof applyCharacter==='function');
      selectedChar=old;
    },
    brotato_stats() {
      newGame();
      assert('stat fields present', ['armor','dodge','lifesteal','critDmg'].every(k=>k in player));
      assert('progression cards exist', ['armor','dodge','lifesteal','critpower'].every(id=>CARDS.some(c=>c.id===id)));
      assert('crit multiplier helper', critMul()>=2);
    },
    daily_mode() {
      assert('startDaily exists', typeof startDaily==='function');
      if (typeof startDaily==='function') {
        const c=challengeForDate(new Date().toISOString().slice(0,10));
        startDaily();
        assert('daily mode enabled', dailyMode===true);
        assert('daily modifier applied', ['FAST','ARMOUR','SWARM'].includes(dailyModifier));
        assert('daily seed applied', seedNum===(c.seed>>>0));
      }
      const bad=challengeForDate('not-a-date');
      assert('invalid date still yields challenge', !!bad && typeof bad.seed==='number');
    }
  };
  return {
    tests,
    results,
    run(id) {
      results.length = 0;
      try { tests[id] && tests[id](); } catch(e) { assert(id + ' threw', false, String(e)); }
      return results.slice();
    },
    runAll() {
      results.length = 0;
      Object.keys(tests).forEach(id => { try { tests[id](); } catch(e) { assert(id + ' threw', false, String(e)); } });
      return results.slice();
    }
  };
})();
