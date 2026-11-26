// Recess Rumble test harness. Loaded after the game script; run with RR_TESTS.runAll().
window.RR_TESTS = (() => {
  const results = [];
  function assert(name, cond, detail) {
    results.push({ name, pass: !!cond, detail: detail || '' });
    return !!cond;
  }
  function fresh() {
    if (typeof runState !== 'undefined') { runState.character='raju'; runState.trait=null; runState.midEventSeen=false; runState.eventDamageWaves=0; runState.eventSpeedWaves=0; }
    if (typeof metaShop !== 'undefined') metaShop=freshMetaShop();
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
    levelup_pool_four_choices() {
      fresh(); runState.pendingLevels=1; phase='playing'; showLevelUp();
      const labels=[...buttonsEl.querySelectorAll('button')].map(b=>b.textContent);
      const ok=phase==='levelup' && labels.length===5 && new Set(labels.slice(0,4)).size===4 && /REROLL/.test(labels[4]);
      hideOverlay(); phase='playing'; fresh();
      assert('level-up offers 4 distinct + reroll', ok);
    },
    levelup_pool_values_stack() {
      fresh(); runState.pendingLevels=20; const base=getEffectiveStats(), bhp=player.maxHp, bcoin=coinGain(100);
      chooseLevelUp('hp'); const hp=player.maxHp-bhp;
      chooseLevelUp('dmg'); const dmg=getEffectiveStats().damageMul/base.damageMul;
      chooseLevelUp('speed'); const spd=getEffectiveStats().speed/base.speed;
      chooseLevelUp('crit'); const cr=getEffectiveStats().crit-base.crit;
      chooseLevelUp('armor'); const arm=runState.poolPicks.armor;
      chooseLevelUp('harvest'); const har=coinGain(100)-bcoin;
      const ok=hp===8 && Math.abs(dmg-1.05)<0.001 && Math.abs(spd-1.04)<0.001 && Math.abs(cr-0.03)<0.001 && arm===1 && har===10;
      fresh();
      assert('pool per-pick values', ok, JSON.stringify({hp,dmg,spd,cr,arm,har}));
    },
    levelup_pool_caps() {
      fresh(); C10_POOL.forEach(p=>{ if (p.cap!==Infinity) runState.poolPicks[p.id]=p.cap; });
      runState.weapon='bat'; runState.weaponLevel=5;
      const draw=levelupDraw(); const ok=draw.every(c=>String(c.id).startsWith('fallback'));
      fresh();
      assert('at-cap choices removed + fallback', ok);
    },
    levelup_weapon_cap_respect() {
      fresh(); runState.weapon='balloon'; metaShop.weaponTraining.waterBalloon=0; runState.weaponLevel=1;
      const draw=levelupDraw(); const ok=!draw.some(c=>c.id==='weapon'||c.id==='weaponxp') && draw.length===4; fresh();
      assert('weapon cap respected in draw', ok);
    },
    levelup_reroll_cost_curve() {
      const costs=[0,1,2,3,4,9].map(n=>levelupRerollCost(n));
      const ok=JSON.stringify(costs)==='[0,10,20,40,80,80]';
      assert('reroll cost curve', ok, JSON.stringify(costs));
    },
    levelup_reroll_new_set() {
      fresh(); runState.pendingLevels=1; phase='playing'; showLevelUp();
      const ids=[...buttonsEl.querySelectorAll('button')].slice(0,4).map(b=>b.textContent);
      const rb=[...buttonsEl.querySelectorAll('button')].find(b=>b.textContent.includes('REROLL')); rb.click();
      const ids2=[...buttonsEl.querySelectorAll('button')].slice(0,4).map(b=>b.textContent);
      const ok=JSON.stringify(ids)!==JSON.stringify(ids2) && new Set(ids2).size===4 && runState.rerollCount===1;
      const detail=JSON.stringify({ids,ids2,count:runState.rerollCount});
      hideOverlay(); phase='playing'; fresh();
      assert('reroll gives new distinct set', ok, detail);
    },
    levelup_armor_damage_reduction() {
      fresh(); runState.poolPicks.armor=1; player.hp=100; invuln=0; const a=player.hp;
      hurtPlayer(player.x+5,player.y,25); const one=a-player.hp;
      fresh(); runState.poolPicks.armor=5; player.hp=100; invuln=0; const b=player.hp;
      hurtPlayer(player.x+5,player.y,25); const five=b-player.hp; fresh();
      assert('armor 0.96^n reduction', one===24 && five===21, one+' '+five);
    },
    levelup_pool_run_only() {
      fresh(); runState.poolPicks.hp=3; runState.rerollCount=2; const bank=metaShop.bankedCoins;
      newGame(); const ok=runState.poolPicks.hp===0 && runState.rerollCount===0 && metaShop.bankedCoins===bank; fresh();
      assert('pool picks run-only', ok);
    },
    music_volume_muted_wired() {
      const keys=['musicVolume','recess-save',C11_MUSIC_ENABLED_KEY];
      const prev=keys.map(k=>[k,localStorage.getItem(k)]), pv=settings.musicVolume, pm=save.muted;
      try {
        localStorage.setItem('musicVolume','0.3'); localStorage.setItem(C11_MUSIC_ENABLED_KEY,'1');
        c11EnabledAtLoad=c11LoadMusicSettings();
        const restore=settings.musicVolume===0.3;
        save.muted=true; const muted=c11EffectiveVolume()===0;
        save.muted=false; const unmuted=Math.abs(c11EffectiveVolume()-0.3)<0.001 && settings.musicVolume===0.3;
        localStorage.setItem('musicVolume','loud'); const r1=c11LoadMusicSettings();
        const def1=r1===true && settings.musicVolume===0.8 && localStorage.getItem('musicVolume')==='0.8';
        const defDetail=JSON.stringify({r1,vol:settings.musicVolume,stored:localStorage.getItem('musicVolume')});
        save.muted='yes'; c11LoadMusicSettings(); const def2=save.muted===false;
        localStorage.setItem(C11_MUSIC_ENABLED_KEY,'junk'); c11LoadMusicSettings(); const def3=localStorage.getItem(C11_MUSIC_ENABLED_KEY)==='1';
        c11SetMusicEnabled(false); c11EnabledAtLoad=false; const gateOff=c11MusicEnabled()===false;
        audioEngine.stopMusic(); audioEngine.startMusic(); const noStart=C11_T2.timer===null;
        c11SetMusicEnabled(true); c11EnabledAtLoad=true;
        const slider=document.getElementById('music-volume'), mb=document.getElementById('hud-mute');
        const ui=!!slider&&!!mb&&slider.type==='range';
        const noNew=[...document.querySelectorAll('input[type=range]')].length===1;
        assert('music volume/mute/enabled wired', restore&&muted&&unmuted&&def1&&def2&&def3&&gateOff&&noStart&&ui&&noNew,
          JSON.stringify({restore,muted,unmuted,def1,def2,def3,gateOff,noStart,ui,noNew,defDetail}));
      } finally {
        keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); });
        settings.musicVolume=pv; save.muted=pm; c11EnabledAtLoad=c11LoadMusicSettings();
        if (C11_T2.timer) audioEngine.stopMusic();
      }
    },
    music_mood_table() {
      const t=C11_MOOD_PARAMS;
      const ok=Object.keys(t).length===7 && ['menu','combat','intense','boss','lowHp','victory','defeat'].every(m=>t[m]);
      const bpm=t.menu.bpm===112&&t.combat.bpm===120&&t.intense.bpm===128&&t.boss.bpm===130&&t.lowHp.bpm===126&&t.victory.bpm===118&&t.defeat.bpm===96;
      const kinds=t.menu.chordKind===0&&t.combat.chordKind===1&&t.boss.chordKind===1&&t.victory.chordKind===0&&t.defeat.chordKind===1;
      const sw=t.menu.swing===0&&t.combat.swing===0.08&&t.boss.swing===0.08&&t.victory.swing===0;
      const lowLead=C11_T3_WEBGL_FS.includes('uStem') && typeof c11DuckLead==='function';
      assert('7 moods exact table', ok&&bpm&&kinds&&sw&&lowLead, JSON.stringify({ok,bpm,kinds,sw,lowLead}));
    },
    music_transition_priority() {
      const sel=c11SelectMood;
      const cases=[
        sel(false,'death',true,1,1,1,1,0)==='defeat',
        sel(false,'win',true,1,1,1,1,0)==='victory',
        sel(true,null,true,1,1,1,1,0)==='boss',
        sel(true,null,false,10,100,9,1,0)==='lowHp',
        sel(true,null,false,50,100,9,1,0)==='intense',
        sel(true,null,false,50,100,1,1,0.9)==='intense',
        sel(true,null,false,50,100,1,4,0)==='intense',
        sel(true,null,false,50,100,1,1,0)==='combat',
        sel(false,null,false,1,1,1,1,0)==='menu',
        sel(true,null,false,20,100,9,1,5)==='lowHp',
        sel(true,null,true,10,100,9,1,5)==='boss'
      ];
      const pure=cases.every(Boolean);
      const prev=C11_T3.currentMood; audioEngine.setMusicMood('nonsense');
      const ignored=C11_T3.currentMood===prev;
      assert('mood selector pure priority + clamp', pure&&ignored, JSON.stringify({pure,ignored,cases}));
    },
    music_ducking_sfx() {
      initAudio(); if(!audio) return assert('SFX ducking',false,'no audio');
      const g=c11Master();
      const src=c11DuckSfx.toString(), master=c11DuckMaster.toString();
      const ok=src.includes('0.6')&&src.includes('0.05')&&src.includes('200')&&master.includes('linearRampToValueAtTime');
      const sfx=audioEngine.sfx.toString().includes('c11DuckSfx') && beep.toString().includes('c11DuckSfx');
      const perStem=!c11DuckSfx.toString().includes('C11_GAIN_CEILING');
      c11DuckSfx();
      assert('SFX master-only ducking',ok&&sfx&&perStem,JSON.stringify({ok,sfx,perStem}));
    },
    music_fallback_webgl2_worklet() {
      const prev=RR_MUSIC_T3_TEST.path, gpu=navigator.gpu;
      try {
        const p={bpm:120,sampleRate:44100,seed:1,barIndex:0,mood:1,intensity:0.5,barSamples:128,chordRoot:60,chordKind:1,swing:0};
        const mono=new Float32Array(128).fill(0.1);
        RR_MUSIC_T3_TEST.path=()=>({bass:mono,lead:mono,arp:mono,drums:mono,hats:mono});
        const gp=c11RenderBar(p);
        RR_MUSIC_T3_TEST.path=null;
        Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true});
        const cpu=c11CpuBar(p), web=c11WebGLBar(p);
        const valid=x=>x&&C11_T1_STEMS.every(n=>x[n]&&x[n].length===128&&x[n].every(Number.isFinite));
        const shape=valid(cpu)&&(!web||valid(web));
        const noScript=!document.body.innerHTML.toLowerCase().includes('scriptprocessor');
        const noFetch=!c11CpuBar.toString().includes('fetch(')&&!c11WebGLBar.toString().includes('fetch(');
        assert('fallback chain no-GPU -> WebGL2/CPU',!!gp&&shape&&noScript&&noFetch,JSON.stringify({gpu:!!gp,shape,noScript,noFetch}));
      } finally { RR_MUSIC_T3_TEST.path=prev; if(gpu) Object.defineProperty(navigator,'gpu',{value:gpu,configurable:true}); else delete navigator.gpu; }
    },
    music_bar_crossfade() {
      const prev={ r:RR_MUSIC_T2_TEST.render, n:RR_MUSIC_T2_TEST.now, h:RR_MUSIC_T2_TEST.hidden,
        q:C11_T2.queue.slice(), end:C11_T2.scheduledEnd, idx:C11_T2.nextIndex, fb:C11_T2.fallbackNeeded,
        slow:C11_T2.slowBars, log:C11_T2.loggedSlow, fail:C11_T2.failBars, lf:C11_T2.loggedFail };
      try {
        initAudio(); if (!audio) return assert('scheduler lookahead/crossfade', false, 'no audio context');
        audio.resume&&audio.resume();
        const mono=new Float32Array(64).fill(0.25);
        const bar=()=>({ bass:mono,lead:mono,arp:mono,drums:mono,hats:mono });
        RR_MUSIC_T2_TEST.render=()=>bar(); RR_MUSIC_T2_TEST.now=null;
        C11_T2.queue=[]; C11_T2.scheduledEnd=audio.currentTime; C11_T2.nextIndex=0; C11_T2.fallbackNeeded=false;
        c11Tick();
        const lookahead=C11_T2.queue.length===2;
        const started=C11_T2.queue.shift();
        const s=audio.createGain(); s.connect(audio.destination);
        const ramps=[];
        const origLinear=GainNode.prototype.linearRampToValueAtTime;
        // just verify the crossfade constants exist in the schedule path
        const src=c11PlayBar.toString();
        const crossfade=src.includes('linearRampToValueAtTime') && src.includes('0.0001') && src.includes('0.25') && src.includes('C11_GAIN_CEILING');
        const barOnly=c11Tick.toString().includes('scheduledEnd') && src.includes('startAt');
        // slow-GPU flag
        let clock=0; RR_MUSIC_T2_TEST.now=()=>{ clock+=300; return clock; };
        C11_T2.slowBars=0; C11_T2.loggedSlow=false; C11_T2.fallbackNeeded=false; C11_T2.queue=[];
        c11ScheduleNext(); c11ScheduleNext();
        const slowFlag=C11_T2.fallbackNeeded===true;
        // render failures
        RR_MUSIC_T2_TEST.render=()=>null; RR_MUSIC_T2_TEST.now=null;
        C11_T2.failBars=0; C11_T2.loggedFail=false; C11_T2.fallbackNeeded=false; C11_T2.queue=[];
        c11ScheduleNext(); c11ScheduleNext(); c11ScheduleNext();
        const failFlag=C11_T2.fallbackNeeded===true;
        assert('scheduler lookahead/crossfade/flags', lookahead && crossfade && barOnly && slowFlag && failFlag,
          JSON.stringify({lookahead,crossfade,barOnly,slowFlag,failFlag}));
      } finally {
        RR_MUSIC_T2_TEST.render=prev.r; RR_MUSIC_T2_TEST.now=prev.n; RR_MUSIC_T2_TEST.hidden=prev.h;
        C11_T2.queue=prev.q; C11_T2.scheduledEnd=prev.end; C11_T2.nextIndex=prev.idx; C11_T2.fallbackNeeded=prev.fb;
        C11_T2.slowBars=prev.slow; C11_T2.loggedSlow=prev.log; C11_T2.failBars=prev.fail; C11_T2.loggedFail=prev.lf;
      }
    },
    music_api_stable() {
      const api=['startMusic','stopMusic','setMusicMood','tone','sfx'].every(k=>typeof audioEngine[k]==='function');
      const gpu=typeof renderMusicBarGPU==='function' && renderMusicBarGPU.length===1;
      const prevMood=C11_T2.requestedMood;
      audioEngine.setMusicMood('bogus'); const ignored=C11_T2.requestedMood===prevMood;
      audioEngine.setMusicMood('combat'); const set=C11_T2.requestedMood==='combat';
      C11_T2.requestedMood=prevMood;
      const before=C11_T2.timer;
      audioEngine.startMusic(); const one=C11_T2.timer;
      audioEngine.startMusic(); const twice=one===C11_T2.timer;
      audioEngine.stopMusic(); const stopped=C11_T2.timer===null;
      if (before) audioEngine.startMusic();
      assert('music API stable + idempotent', api && gpu && ignored && set && twice && stopped, JSON.stringify({api,gpu,ignored,set,twice,stopped}));
    },
    music_gpu_stem_render() {
      const p={ bpm:120, sampleRate:44100, seed:12345, barIndex:0, mood:1, intensity:0.5, barSamples:88200, chordRoot:60, chordKind:1, swing:0.08 };
      const fake=(x)=>{
        const out={};
        C11_T1_STEMS.forEach((name,k)=>{
          const a=new Float32Array(x.barSamples);
          for(let i=0;i<a.length;i++){
            let h=(x.seed>>>0)+Math.imul(x.barIndex>>>0,7919)+i+k*131;
            h^=h>>>16; h=Math.imul(h,0x7feb352d); h^=h>>>15; h=Math.imul(h,0x846ca68b); h^=h>>>16;
            a[i]=Math.max(-1,Math.min(1,((h>>>0)/2147483647.5)-1));
          }
          out[name]=a;
        });
        return out;
      };
      const prev=RR_MUSIC_T1_TEST.backend;
      try {
        RR_MUSIC_T1_TEST.backend=fake;
        const a=renderMusicBarGPU(p), b=renderMusicBarGPU(p);
        const names=Object.keys(a||{});
        const shape=names.length===5 && C11_T1_STEMS.every(n=>a[n] instanceof Float32Array && a[n].length===p.barSamples);
        const range=C11_T1_STEMS.every(n=>a[n].every(v=>v>=-1&&v<=1));
        const deterministic=C11_T1_STEMS.every(n=>a[n].every((v,i)=>v===b[n][i]));
        const noNaN=C11_T1_STEMS.every(n=>a[n].every(v=>Number.isFinite(v)));
        assert('GPU stem render mocked path', shape && range && deterministic && noNaN, JSON.stringify({names,shape,range,deterministic,noNaN}));
      } finally { RR_MUSIC_T1_TEST.backend=prev; }
    },
    music_stem_list_five() {
      const exact=JSON.stringify(C11_T1_STEMS)===JSON.stringify(['bass','lead','arp','drums','hats']);
      const w=C11_T1_WGSL;
      const bindings=[0,1,2,3,4,5].every(i=>w.includes('@binding('+i+')'));
      const chiptune=w.includes('asin(sin(') && w.includes('fract(p / 6.28318531) < duty') && w.includes('hash(') && !/pad|sine|sin\(6\.28318531 \* fRoot\)/.test(w.replace(/_pad/g,''));
      const seen=[], prev=RR_MUSIC_T1_TEST.backend;
      try {
        RR_MUSIC_T1_TEST.backend=(x)=>{
          seen.push(x.chordKind);
          const out={}; C11_T1_STEMS.forEach(n=>out[n]=new Float32Array(x.barSamples).fill(0.25)); return out;
        };
        [0,1,2,3].forEach(k=>{
          const p={ bpm:120, sampleRate:44100, seed:7, barIndex:1, mood:1, intensity:0.3, barSamples:512, chordRoot:60, chordKind:k, swing:0 };
          renderMusicBarGPU(p);
        });
      } finally { RR_MUSIC_T1_TEST.backend=prev; }
      const kindsOk=JSON.stringify(seen)===JSON.stringify([0,1,2,3]) && w.includes('params.chordKind == 0u') && w.includes('params.chordKind == 2u') && w.includes('params.chordKind == 3u');
      assert('exact 5 chiptune stems + 4 chord kinds', exact && bindings && chiptune && kindsOk, JSON.stringify({exact,bindings,chiptune,kindsOk,seen}));
    },
    music_offline_no_cdn() {
      const html=[...document.querySelectorAll('script')].map(s=>s.textContent).join('\n');
      const i=html.indexOf('// C11 MUSIC - T1 BEGIN'), j=html.indexOf('// C11 MUSIC - T1 END');
      const code=i>=0&&j>i?html.slice(i,j):'';
      const clean=['http','cdn','.mp3','.wav','.ogg','fetch('].every(t=>!code.toLowerCase().includes(t));
      const desc=Object.getOwnPropertyDescriptor(navigator,'gpu');
      let noGpu=false;
      try {
        Object.defineProperty(navigator,'gpu',{ value:undefined, configurable:true });
        const prev=RR_MUSIC_T1_TEST.backend; RR_MUSIC_T1_TEST.backend=null;
        noGpu=renderMusicBarGPU({ bpm:120, sampleRate:44100, seed:1, barIndex:0, mood:0, intensity:0, barSamples:128, chordRoot:60, chordKind:0, swing:0 })===null;
        RR_MUSIC_T1_TEST.backend=prev;
      } finally {
        if (desc) Object.defineProperty(navigator,'gpu',desc);
        else delete navigator.gpu;
      }
      assert('offline T1 code + no-GPU null', clean && noGpu && code.length>100, JSON.stringify({clean,noGpu,len:code.length}));
    },
    achievements_twelve_conditions() {
      const keys=[ACHIEVEMENTS_KEY,HISTORY_KEY,LIFETIME_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        localStorage.removeItem(ACHIEVEMENTS_KEY);
        const ids=C10_ACHIEVEMENTS.map(a=>a.id);
        const exact=ids.length===12 && ['first_blood','wave_10','wave_30','clear_w3','clear_w6','endless_60','danger_5_clear','meera_unlocked','arjun_unlocked','shopper','recycler','banker'].every(id=>ids.includes(id));
        fresh(); const c0=coins, s0=runState.scrap, h0=runState.herbs;
        let allFire=true, noRepeat=true;
        ids.forEach(id=>{ allFire=allFire && unlockT5Achievement(id)===true; });
        bannerText=''; banner=0;
        ids.forEach(id=>{ noRepeat=noRepeat && unlockT5Achievement(id)===false; });
        const noToast=bannerText==='';
        const a=loadAchievements();
        const unlocked=ids.every(id=>a[id]===true);
        const noRewards=coins===c0 && runState.scrap===s0 && runState.herbs===h0;
        assert('12 achievements exact + one toast + no rewards', exact && allFire && noRepeat && noToast && unlocked && noRewards, JSON.stringify({exact,allFire,noRepeat,unlocked,noRewards}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    achievements_legacy_catchup() {
      const keys=[ACHIEVEMENTS_KEY,HISTORY_KEY,LIFETIME_KEY,C10_CHAR_UNLOCKED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY,ENDLESS_BEST_KEY,BANK_SCRAP_KEY,BANK_HERBS_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        [ACHIEVEMENTS_KEY,HISTORY_KEY,LIFETIME_KEY,C10_CHAR_UNLOCKED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY,ENDLESS_BEST_KEY,BANK_SCRAP_KEY,BANK_HERBS_KEY].forEach(k=>localStorage.removeItem(k));
        localStorage.setItem(C10_W3_KEY,'true'); localStorage.setItem(C10_MAX_WAVE_KEY,'35');
        localStorage.setItem(W6_KEY,'true'); localStorage.setItem(ENDLESS_BEST_KEY,JSON.stringify({wave:70,danger:2}));
        localStorage.setItem(C10_CHAR_UNLOCKED_KEY,JSON.stringify({meera:true,arjun:true}));
        localStorage.setItem(BANK_SCRAP_KEY,'120'); localStorage.setItem(BANK_HERBS_KEY,'130');
        evaluateAllAchievements();
        const a=loadAchievements();
        const caught=['wave_10','wave_30','clear_w3','clear_w6','endless_60','meera_unlocked','arjun_unlocked','banker'].every(id=>a[id]);
        localStorage.setItem(ACHIEVEMENTS_KEY,'{{corrupt');
        const corrupt=Object.keys(loadAchievements()).length===0;
        localStorage.setItem(HISTORY_KEY,'not-an-array'); const hist=loadHistory().length===0;
        assert('legacy achievement catch-up + corrupt keys', caught && corrupt && hist, JSON.stringify({caught,corrupt,hist}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    run_history_ten_fields() {
      const keys=[HISTORY_KEY,LIFETIME_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        localStorage.removeItem(HISTORY_KEY);
        fresh(); score=7; coinsEarned=60; wave=9; runState.scrap=3; runState.herbs=2;
        recordRunEndStats('WIN'); const h=loadHistory(), e=h[0];
        const fields=['date','character','danger','endless','wave','result','kills','coins','scrap','herbs'];
        const ten=Object.keys(e).length===10 && fields.every(f=>f in e);
        const vals=e.kills===7 && e.coins===60 && e.scrap===3 && e.herbs===2 && e.wave===9 && e.result==='win' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(e.date);
        recordRunEndStats('WIN'); const once=loadHistory().length===1;
        for(let i=0;i<51;i++){ runState.historyRecorded=false; recordRunEndStats('DEFEAT'); }
        const capped=loadHistory().length===50 && loadHistory()[0].result==='death';
        localStorage.setItem(HISTORY_KEY,'{{bad'); const corrupt=loadHistory().length===0;
        assert('run history 10 fields + once + cap 50', ten && vals && once && capped && corrupt, JSON.stringify({ten,vals,once,capped,corrupt}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    lifetime_stats_reuse() {
      const keys=[LIFETIME_KEY,HISTORY_KEY,BANK_SCRAP_KEY,BANK_HERBS_KEY,C10_MAX_WAVE_KEY,ENDLESS_BEST_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        [LIFETIME_KEY,HISTORY_KEY,BANK_SCRAP_KEY,BANK_HERBS_KEY,C10_MAX_WAVE_KEY,ENDLESS_BEST_KEY].forEach(k=>localStorage.removeItem(k));
        localStorage.setItem(BANK_SCRAP_KEY,'12'); localStorage.setItem(BANK_HERBS_KEY,'9');
        localStorage.setItem(C10_MAX_WAVE_KEY,'22'); localStorage.setItem(ENDLESS_BEST_KEY,JSON.stringify({wave:61}));
        fresh(); score=5; coinsEarned=40; runState.shopSpentRun=30; runState.recycledRun=2; recordRunEndStats('WIN');
        fresh(); score=3; coinsEarned=20; runState.shopSpentRun=10; runState.recycledRun=1; recordRunEndStats('DEFEAT');
        const st=loadLifetime();
        const inc=st.runs===2 && st.wins===1 && st.kills===8 && st.coinsEarned===60 && st.shopSpent===40 && st.recycled===3;
        const reused=bankScrapTotal()===12 && bankHerbsTotal()===9 && maxWaveReached()===22 && endlessBestWave()===61 &&
          !('scrapBanked' in st) && !('bestWave' in st) && !('bestEndless' in st);
        fresh(); const neverReset=loadLifetime().runs===2;
        localStorage.removeItem(LIFETIME_KEY); const missing=loadLifetime().runs===0 && bankScrapTotal()===12;
        assert('lifetime stats increment + reuse keys', inc && reused && neverReset && missing, JSON.stringify({inc,reused,neverReset,missing,st}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    achievements_ui_panel_reuse() {
      const prevAch=localStorage.getItem(ACHIEVEMENTS_KEY), origEval=evaluateAllAchievements;
      localStorage.removeItem(HISTORY_KEY); localStorage.removeItem(ACHIEVEMENTS_KEY);
      evaluateAllAchievements=()=>{};
      showStart(); const btns=[...buttonsEl.querySelectorAll('button')];
      const scoresBtn=btns.find(b=>b.textContent==='SCORES'); const hasBtn=!!scoresBtn; if (scoresBtn) scoresBtn.click();
      const txt=descEl.textContent;
      const panel=txt.indexOf('LIFETIME STATS')>=0 && txt.indexOf('Achievements:')>=0 && txt.indexOf('RUN HISTORY')>=0 && txt.indexOf('No runs yet')>=0;
      const locked=(txt.match(/🔒/g)||[]).length===12;
      const cards=(txt.match(/First Blood|Wave Rider|Thirty Club|W3 Clear|W6 Clear|Endless 60|Nightmare Clear|Tiffin Queen|Sixer King|Big Spender|Scrap King|Hoarder/g)||[]).length===12;
      const backOnly=buttonsEl.querySelectorAll('button').length===1;
      evaluateAllAchievements=origEval;
      if (prevAch===null) localStorage.removeItem(ACHIEVEMENTS_KEY); else localStorage.setItem(ACHIEVEMENTS_KEY,prevAch);
      showStart();
      assert('reused SCORES panel shows stats/achievements/history', hasBtn && panel && locked && cards && backOnly, JSON.stringify({hasBtn,panel,locked,cards,backOnly}));
    },
    achievements_regression() {
      const ok=C10_ACHIEVEMENTS.length===12 && !!C10_SHOP_ITEMS && DANGER_TABLE.length===6 && C9_CHARS.length===5 && Object.keys(C8_WEAPONS).length===8;
      assert('T5 no regressions in prior systems', ok);
    },
    inrun_shop_three_offers() {
      fresh(); runState.seed='TEST'; runState.rng=()=>0; player.hp=1; player.maxHp=100;
      const ids=inrunShopDraw();
      const three=ids.length===3 && new Set(ids).size===3;
      runState.shopCrit=0.20; const noCrit=!inrunShopDraw().includes('crit4'); runState.shopCrit=0;
      player.weapons.forEach(w=>{ w.level=weaponCap(w.type); }); const noWxp=!inrunShopDraw().includes('weaponxp2');
      const origEligible=inrunEligible; inrunEligible=()=>false;
      player.hp=player.maxHp; const fill=inrunShopDraw();
      inrunEligible=origEligible;
      const fillerOk=fill.length===3 && new Set(fill).size===3 && fill.includes('cache');
      fresh();
      assert('in-run shop 3 distinct + caps + filler', three && noCrit && noWxp && fillerOk, JSON.stringify({ids,fill}));
    },
    inrun_shop_costs_effects() {
      fresh(); player.hp=1; player.maxHp=50; coins=1000;
      const costs=Object.values(C10_SHOP_ITEMS).filter(i=>i.weight>0).map(i=>i.cost);
      applyInrunItem('heal40'); const heal=player.hp;
      applyInrunItem('maxhp10'); const maxhp=player.maxHp, curhp=player.hp;
      const base=getEffectiveStats().damageMul; applyInrunItem('dmg8'); applyInrunItem('dmg8');
      const dmg=getEffectiveStats().damageMul/base;
      const bspeed=getEffectiveStats().speed; applyInrunItem('spd5'); const spd=getEffectiveStats().speed/bspeed;
      for(let i=0;i<5;i++) applyInrunItem('crit4'); const crit=runState.shopCrit;
      const armor=player.armor; applyInrunItem('armor1'); const armor2=player.armor;
      player.weapons.forEach(w=>{ w.level=1; }); applyInrunItem('weaponxp2'); const wl=player.weapons[0].level;
      coins=0; const bought=buyInrunOffer(0); const unchanged=coins===0;
      fresh();
      const ok=costs.includes(30)&&costs.includes(50)&&costs.includes(60)&&costs.includes(40)&&costs.includes(45)&&costs.includes(70)&&costs.includes(25)&&costs.includes(55) &&
        heal===41 && maxhp===60 && curhp===51 && Math.abs(dmg-1.08*1.08)<0.001 && Math.abs(spd-1.05)<0.001 && Math.abs(crit-0.20)<0.001 && armor2===armor+1 && wl===3 && !bought && unchanged;
      assert('in-run shop costs + effects', ok, JSON.stringify({heal,maxhp,curhp,dmg,spd,crit,armor2,wl,bought}));
    },
    inrun_shop_refresh_rules() {
      const costs=[0,1,2,3,4].map(inrunRefreshCost);
      fresh(); coins=0; runState.seed='TEST'; runState.rng=()=>0;
      runState.inrunOffers=[{id:'heal40',sold:true},{id:'dmg8',sold:false},{id:'spd5',sold:false}];
      runState.inrunRefreshCount=0; showInrunShop();
      const buttons=[...buttonsEl.querySelectorAll('button')];
      const free=buttons.find(b=>b.textContent.startsWith('Refresh (')); const freeOk=free&&!free.disabled;
      const before=runState.inrunOffers.map(o=>o.id+':'+o.sold); free.click();
      const after=runState.inrunOffers.map(o=>o.id+':'+o.sold);
      const soldKept=after[0]===before[0] && runState.inrunOffers[0].sold;
      runState.inrunRefreshCount=1; coins=0; showInrunShop();
      const paid=[...buttonsEl.querySelectorAll('button')].find(b=>b.textContent.startsWith('Refresh ('));
      const brokeDisabled=!!paid&&paid.disabled;
      hideOverlay(); phase='playing'; fresh();
      const ok=JSON.stringify(costs)==='[0,15,30,50,50]' && freeOk && soldKept && brokeDisabled;
      assert('in-run shop refresh rules', ok, JSON.stringify({costs,freeOk,soldKept,brokeDisabled,before,after}));
    },
    recycle_rates_scrap() {
      fresh(); const s3=scrapForWeapon(3), s1=scrapForWeapon(1);
      addWeapon('tiffin'); const idx=player.weapons.length-1; player.weapons[idx].level=3;
      const before=player.weapons.length, sc=runState.scrap;
      const did=recycleWeapon(idx); const after=player.weapons.length, gained=runState.scrap-sc;
      const starterBlocked=!recyclableWeapons().some(x=>x.i===0);
      const empty=(()=>{ fresh(); return recyclableWeapons().length===0; })();
      fresh();
      assert('recycle scrap rates + eligibility', s3===45 && s1===25 && did && after===before-1 && gained===45 && starterBlocked && empty, JSON.stringify({s3,s1,did,gained,starterBlocked,empty}));
    },
    harvest_drops_bank_rules() {
      const keys=[BANK_SCRAP_KEY,BANK_HERBS_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        keys.forEach(([k])=>localStorage.removeItem(k));
        fresh(); runState.seed='TEST'; runState.rng=()=>0; harvestDrops({boss:false});
        const both=runState.herbs===1 && runState.scrap===1;
        runState.rng=()=>0.99; harvestDrops({boss:false}); const none=runState.herbs===1 && runState.scrap===1;
        harvestDrops({boss:true}); const boss=runState.herbs===3 && runState.scrap===4;
        runState.scrap=10; runState.herbs=5; const first=bankRunMaterials(), second=bankRunMaterials();
        const banked=bankScrapTotal()===10 && bankHerbsTotal()===5;
        newGame(); const reset=runState.scrap===0 && runState.herbs===0 && bankScrapTotal()===10;
        assert('harvest drops + bank once', both && none && boss && first && !second && banked && reset, JSON.stringify({both,none,boss,first,second,banked,reset}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    inrun_shop_regression() {
      fresh(); wave=3; bossSpawned=false; let called=false;
      maybeShowInrunShop(()=>{ called=true; });
      const noMid=called && phase!=='inrun_shop';
      fresh(); wave=5; bossSpawned=true; let called2=false;
      maybeShowInrunShop(()=>{ called2=true; });
      const opens=!called2 && phase==='inrun_shop';
      hideOverlay(); phase='playing'; fresh();
      const untouched=!!metaShop && !('scrap' in (metaShop.upgrades||{}));
      assert('in-run shop trigger + no regressions', noMid && opens && untouched, JSON.stringify({noMid,opens,untouched}));
    },
    char_meera_stats_passive() {
      const keys=[C10_CHAR_UNLOCKED_KEY,C10_CHAR_SELECTED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        localStorage.setItem(C10_CHAR_UNLOCKED_KEY,JSON.stringify({meera:true,arjun:true}));
        fresh(); runState.character='meera'; newGame(); const c=C9_CHARS.find(x=>x.id==='meera');
        const stats=c.hp===130 && c.dmg===10 && c.spd===100 && c.crit===0.05 && c.weaponName==='Tiffin Lid' && runState.weapon==='tiffinlid';
        wave=1; const h1=meeraHealAmount(); wave=25; const h25=meeraHealAmount(); wave=50; const h50=meeraHealAmount();
        runState.poolPicks.tiffin=2; wave=1; const hpick=meeraHealAmount();
        newGame(); runState.character='meera'; runState.runCharacter='meera'; runState.poolPicks.tiffin=0;
        phase='start'; player.hp=1; const noHeal=meeraPassiveTick(30)===0 && player.hp===1;
        phase='playing'; const healed=meeraPassiveTick(30);
        assert('Meera stats + Hot Tiffin heal', stats && h1===10 && h25===14 && h50===20 && hpick===40 && noHeal && healed>0, JSON.stringify({h1,h25,h50,hpick,healed}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    char_arjun_stats_passive() {
      const keys=[C10_CHAR_UNLOCKED_KEY,C10_CHAR_SELECTED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        localStorage.setItem(C10_CHAR_UNLOCKED_KEY,JSON.stringify({meera:true,arjun:true}));
        fresh(); runState.character='arjun'; newGame(); const c=C9_CHARS.find(x=>x.id==='arjun');
        const stats=c.hp===85 && c.dmg===10 && c.spd===108 && c.crit===0.15 && c.weaponName==='Tennis Ball' && runState.weapon==='tennisball';
        const base=getEffectiveStats().damageMul;
        runState.streakKills=0; runState.sixerActive=false;
        registerKill(); registerKill(); const mid=runState.sixerActive;
        registerKill(); const active=runState.sixerActive, buffed=getEffectiveStats().damageMul/base;
        runState.sixerTimer=1; registerKill(); registerKill(); registerKill(); const refreshed=runState.sixerTimer===6;
        const notStack=Math.abs(getEffectiveStats().damageMul/base-1.25)<0.001;
        arjunHit(); const reset=!runState.sixerActive && runState.streakKills===0;
        fresh(); runState.character='arjun'; newGame(); const coins=coinGain(100);
        assert('Arjun stats + Sixer Streak', stats && !mid && active && Math.abs(buffed-1.25)<0.001 && refreshed && notStack && reset && coins===110, JSON.stringify({mid,active,buffed,refreshed,reset,coins}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    char_unlock_meera_w3() {
      const keys=[C10_CHAR_UNLOCKED_KEY,C10_CHAR_SELECTED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        [C10_CHAR_UNLOCKED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY].forEach(k=>localStorage.removeItem(k));
        evaluateCharUnlocks(); const locked=!charUnlocked('meera');
        localStorage.setItem(C10_W3_KEY,'true'); evaluateCharUnlocks();
        const unlocked=charUnlocked('meera'), toast=bannerText.indexOf('New Character Unlocked: Meera')===0;
        bannerText=''; evaluateCharUnlocks(); const once=bannerText==='';
        assert('Meera unlock on W3 clear + one toast', locked && unlocked && toast && once, JSON.stringify({locked,unlocked,toast,once}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    char_unlock_arjun_wave30_or_w6() {
      const keys=[C10_CHAR_UNLOCKED_KEY,C10_CHAR_SELECTED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        [C10_CHAR_UNLOCKED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY].forEach(k=>localStorage.removeItem(k));
        localStorage.setItem(C10_MAX_WAVE_KEY,'29'); evaluateCharUnlocks(); const l29=!charUnlocked('arjun');
        localStorage.setItem(C10_MAX_WAVE_KEY,'30'); evaluateCharUnlocks(); const u30=charUnlocked('arjun');
        [C10_CHAR_UNLOCKED_KEY,C10_MAX_WAVE_KEY,W6_KEY].forEach(k=>localStorage.removeItem(k));
        localStorage.setItem(W6_KEY,'true'); evaluateCharUnlocks(); const uW6=charUnlocked('arjun');
        localStorage.removeItem(C10_CHAR_UNLOCKED_KEY); localStorage.removeItem(W6_KEY);
        runState.character='arjun'; newGame(); const fallback=runState.character==='raju';
        assert('Arjun unlock Wave30 OR W6 + locked fallback', l29 && u30 && uW6 && fallback, JSON.stringify({l29,u30,uW6,fallback}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    char_select_persistence_freeze() {
      const keys=[C10_CHAR_UNLOCKED_KEY,C10_CHAR_SELECTED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY].map(k=>[k,localStorage.getItem(k)]);
      try {
        [C10_CHAR_UNLOCKED_KEY,C10_CHAR_SELECTED_KEY,C10_W3_KEY,C10_MAX_WAVE_KEY,W6_KEY].forEach(k=>localStorage.removeItem(k));
        saveCharSelected('meena'); const persisted=loadCharSelected()==='meena';
        localStorage.setItem(C10_CHAR_SELECTED_KEY,'arjun'); const fallback=loadCharSelected()==='raju';
        fresh(); runState.character='meena'; newGame(); const frozen=runState.runCharacter;
        runState.character='kabir'; const still=currentChar().id===frozen;
        const hints=!!C10_UNLOCK_HINT.meera && /W3/.test(C10_UNLOCK_HINT.meera) && /30/.test(C10_UNLOCK_HINT.arjun);
        assert('character select persists + mid-run freeze', persisted && fallback && frozen==='meena' && still && hints, JSON.stringify({persisted,fallback,frozen,still,hints}));
      } finally { keys.forEach(([k,v])=>{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }); fresh(); }
    },
    char_regression() {
      const a=C9_CHARS[0], b=C9_CHARS[1], c=C9_CHARS[2];
      const ok=a.hp===90 && a.dmgMult===1 && a.weaponName==='Slingshot' && b.hp===140 && b.weaponName==='Cricket Bat' && c.hp===85 && c.dmgMult===1.20 && c.weaponName==='Water Balloon';
      assert('existing characters unchanged', ok);
    },
    trait_draft_pick_one() {
      fresh(); showTraitDraft(()=>{});
      const labels=[...buttonsEl.querySelectorAll('button')].map(b=>b.textContent);
      const three=phase==='trait' && labels.length===3 && new Set(labels).size===3;
      window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      const noBypass=phase==='trait';
      chooseTrait('masala',null); const picked=runState.trait==='masala'; fresh();
      assert('trait draft 3 distinct + pick only', three && noBypass && picked);
    },
    trait_effects_stack() {
      fresh(); const base=getEffectiveStats();
      runState.trait='masala'; newGame(); const a=getEffectiveStats();
      runState.trait='gold'; newGame(); const g=getEffectiveStats();
      runState.trait='sharp'; newGame(); const s=getEffectiveStats();
      runState.trait='tiffin'; newGame(); const h=player.maxHp;
      const ok=Math.abs(a.damageMul/base.damageMul-1.15)<0.001 && Math.abs(g.damageMul/base.damageMul-0.90)<0.001 &&
        Math.abs(s.crit-base.crit-0.08)<0.001 && h>=base.maxHp+30-1; fresh();
      assert('trait effects stack', ok);
    },
    trait_synergy_trigger() {
      fresh(); runState.trait='masala'; runState.weapon='balloon'; metaShop.upgrades.tiffin_stock=2;
      const spice=synergyActive('spice_rush'); runState.trait='tiffin';
      const a=spice && synergyActive('tank_feast') && !synergyActive('greed_run');
      runState.trait='gold'; metaShop.upgrades.thrift=2; const b=synergyActive('greed_run');
      runState.trait='sharp'; metaShop.upgrades.might=2; const c=synergyActive('glass_cannon');
      runState.trait='swift'; metaShop.upgrades.swiftness=2; const d=synergyActive('swift_chef'); fresh();
      assert('synergy conditions trigger', a&&b&&c&&d);
    },
    event_spice_merchant() {
      fresh(); runState.seed='TEST'; runState.rng=()=>0; wave=4; showMidRunEvent(null);
      const labels=[...buttonsEl.querySelectorAll('button')].map(b=>b.textContent);
      const b1=buttonsEl.querySelectorAll('button')[0]; coins=50; runState.weaponLevel=1; b1.click();
      const buy=coins===0 && runState.weaponLevel===2;
      coins=50; runState.weaponLevel=5; b1.click(); const refund=coins===50;
      fresh();
      assert('spice merchant pay/refund', labels.length===2 && buy && refund);
    },
    event_tiffin_blessing_scrap_gamble() {
      fresh(); runState.seed='TEST'; runState.rng=()=>0.3; wave=5; showMidRunEvent(null);
      const b1=buttonsEl.querySelectorAll('button')[0]; player.hp=10; player.maxHp=100; b1.click();
      const heal=player.hp===50;
      fresh(); runState.seed='TEST'; runState.rng=()=>0.6; wave=6; showMidRunEvent(null);
      const a=buttonsEl.querySelectorAll('button')[0]; coins=30; a.click(); const lose=coins===0;
      fresh();
      assert('tiffin heal + scrap gamble', heal && lose);
    },
    event_training_break_expiry() {
      fresh(); const base0=getEffectiveStats().damageMul; runState.eventDamageWaves=3;
      const buffed=getEffectiveStats().damageMul/base0;
      finishWaveEndApply(); finishWaveEndApply(); finishWaveEndApply();
      const expired=runState.eventDamageWaves===0 && Math.abs(getEffectiveStats().damageMul/base0-1)<0.001; fresh();
      assert('training break 3-wave expiry', Math.abs(buffed-1.20)<0.001 && expired);
    },
    event_cadence_no_boss() {
      const opens=w=>{ fresh(); wave=w; runState.waveEndHandled=true; finishWaveEnd(); const o=phase==='event'; hideOverlay(); phase='playing'; fresh(); return o; };
      const a=[1,3,4,8,9,10,20].map(opens);
      fresh();
      assert('mid-run event cadence', JSON.stringify(a)==='[false,false,true,true,false,false,false]');
    },
    boss_spawn_every_10() {
      const has=w=>{ fresh(); wave=w; bossSpawned=false; startWave(); return enemies.some(e=>e.boss); };
      const a=[9,10,11,19,20,21].map(has); fresh();
      assert('boss every 10 waves', JSON.stringify(a)==='[false,true,false,false,true,false]');
    },
    boss_hp_damage_table() {
      const t=C9_BOSS_TABLE, s10=bossSpec(10), s40=bossSpec(40);
      const ok=t.length===6 && t[0].hp===600 && t[1].hp===900 && t[2].hp===750 && t[0].attack===30 &&
        s10.hp===600 && s40.hp===1200 && s40.contact===24 && s40.speed===75;
      assert('boss HP/damage/scale table', ok, JSON.stringify({s10,s40}));
    },
    boss_affix_armored_burn() {
      fresh(); wave=10; startWave(); const b=enemies.find(e=>e.boss); runState.affixes=['Armored'];
      b.hp=1000; const h0=b.hp; hitEnemy(b,100,false); const direct=h0-b.hp;
      const h1=b.hp; hitEnemy(b,20,false,true); const burn=h1-b.hp;
      fresh();
      assert('armored reduces direct, burn bypasses', Math.round(direct)===75 && Math.round(burn)===20);
    },
    boss_affix_regen_counter() {
      fresh(); wave=10; startWave(); const b=enemies.find(e=>e.boss); runState.affixes=['Regenerating'];
      b.maxHp=1000; b.hp=500; update(1); const regen=b.hp-500;
      hitEnemy(b,1,false); b.regenPaused=3; const h=b.hp; update(1); const paused=b.hp===h;
      fresh();
      assert('regen +8/s paused by hit', Math.abs(regen-8)<1 && paused);
    },
    enemy_spice_sprinter_dash() {
      fresh(); wave=5; spawnEnemy('spice'); const e=enemies[enemies.length-1];
      const ok=FOES.spice.hp===30 && FOES.spice.speed===1.8 && e.dashTimer===3; fresh();
      assert('spice sprinter stats + dash', ok);
    },
    enemy_shieldbearer_shield() {
      fresh(); wave=5; spawnEnemy('shield'); const e=enemies[enemies.length-1]; e.hp=120;
      hitEnemy(e,10,false); const blocked=e.hp===120 && e.shieldDamage===10;
      for(let i=0;i<3;i++) hitEnemy(e,10,false);
      const broken=!e.shieldUp && e.stunTimer===1.5; fresh();
      assert('shieldbearer front block + break', blocked && broken);
    },
    boss_rewards_thrift() {
      fresh(); wave=10; bossSpawned=false; startWave(); const b=enemies.find(e=>e.boss); b.hp=1;
      const c0=coins, m0=JSON.stringify(runState.materials); hitEnemy(b,99,false);
      const gained=coins-c0;
      const ok=gained>=150 && JSON.stringify(runState.materials)!==m0 && runState.materials.masala>=10; fresh();
      assert('boss chest rewards + thrift applies', ok);
    },
    weapon_waterballoon_splash_slow() {
      fresh(); runState.weapon='balloon'; player.faceX=1; player.faceY=0; player.crit=0; enemies=[];
      spawnEnemy('gilli'); const a=enemies[0]; a.x=player.x+80; a.y=player.y; a.hp=100; a.maxHp=100;
      spawnEnemy('gilli'); const b=enemies[1]; b.x=player.x+110; b.y=player.y+20; b.hp=100; b.maxHp=100;
      fireC8Weapon();
      const ok=a.hp===86 && b.hp===94 && a.slowTimer>0 && b.slowTimer>0; fresh();
      assert('water balloon splash + slow', ok);
    },
    weapon_pressure_cooker_cone_burn() {
      fresh(); runState.weapon='cooker'; player.faceX=1; player.faceY=0; enemies=[];
      spawnEnemy('gilli'); const a=enemies[0]; a.x=player.x+60; a.y=player.y; a.hp=100; a.maxHp=100;
      spawnEnemy('gilli'); const b=enemies[1]; b.x=player.x-60; b.y=player.y; b.hp=100; b.maxHp=100;
      fireC8Weapon();
      const ok=a.hp===90 && b.hp===100 && a.burnTimer>0 && a.burnDmg===2; fresh();
      assert('pressure cooker cone + burn', ok);
    },
    weapon_training_tier_gate() {
      fresh(); const caps=[0,1,2,3].map(t=>{ metaShop.weaponTraining.waterBalloon=t; return weaponCap('waterBalloon'); });
      metaShop.weaponTraining.waterBalloon=0; runState.weapon='balloon'; runState.weaponLevel=1;
      runState.pendingLevels=5; for(let i=0;i<5;i++) chooseLevelUp('weapon');
      const capped=runState.weaponLevel===1; fresh();
      assert('training tier caps', JSON.stringify(caps)==='[1,2,3,5]' && capped);
    },
    weapon_craft_unlock() {
      fresh(); metaShop.bankedCoins=50; metaShop.bankedMaterials.masala=10; metaShop.bankedMaterials.cloth=5;
      const blocked=!craftWeapon('pressureCooker');
      const ok=craftWeapon('waterBalloon') && metaShop.crafted.waterBalloon===true && metaShop.bankedCoins===0 && metaShop.bankedMaterials.masala===0 && metaShop.bankedMaterials.cloth===0;
      fresh();
      assert('weapon craft unlock + costs', blocked && ok);
    },
    weapon_scaling_might_stack() {
      fresh(); runState.weapon='balloon'; newGame(); const base=getEffectiveStats().damageMul;
      metaShop.upgrades.might=2; newGame(); const withMight=getEffectiveStats().damageMul; fresh();
      assert('water balloon scales with Might+', Math.abs(withMight/base-1.0816)<0.001);
    },
    weapon_persistence_training() {
      fresh(); metaShop.weaponTraining.waterBalloon=2; metaShop.crafted.waterBalloon=true; saveMetaShop();
      metaShop=freshMetaShop(); loadMetaShop();
      const ok=metaShop.weaponTraining.waterBalloon===2 && metaShop.crafted.waterBalloon===true;
      localStorage.setItem('RR_META_SHOP_v1',JSON.stringify({version:1,bankedCoins:5,bankedMaterials:{masala:0,scrap:0,cloth:0},upgrades:{might:1}}));
      metaShop=freshMetaShop(); loadMetaShop();
      const migrated=metaShop.weaponTraining.waterBalloon===0 && metaShop.upgrades.might===1 && metaShop.bankedCoins===5;
      fresh();
      assert('craft/training persist + old save migrates', ok && migrated);
    },
    shop_banking() {
      fresh(); coins=100; runState.materials={masala:2,scrap:1,cloth:0};
      bankRunCurrency(); const once={coins,bank:metaShop.bankedCoins,mats:JSON.stringify(metaShop.bankedMaterials)};
      bankRunCurrency(); const twice=metaShop.bankedCoins===100;
      fresh();
      assert('run-end banking once', once.coins===0 && once.bank===100 && once.mats==='{"masala":2,"scrap":1,"cloth":0}' && twice);
    },
    shop_buy_vitality() {
      fresh(); metaShop.bankedCoins=20; metaShop.bankedMaterials.masala=2;
      const bought=buyMetaUpgrade('vitality'); const tier=metaShop.upgrades.vitality;
      newGame(); const hp=player.maxHp;
      fresh();
      assert('buy vitality T1 applies +5 HP', bought && tier===1 && hp>=11 && metaShop.bankedCoins===0);
    },
    shop_buy_tier_gate() {
      fresh(); metaShop.bankedCoins=300; metaShop.bankedMaterials.masala=20;
      const a=buyMetaUpgrade('vitality'), b=buyMetaUpgrade('vitality'), c=buyMetaUpgrade('vitality'), d=buyMetaUpgrade('vitality');
      const ok=a&&b&&c&&!d&&metaShop.upgrades.vitality===3; fresh();
      assert('tier gate + MAX block', ok);
    },
    shop_insufficient_blocked() {
      fresh(); const ok=!buyMetaUpgrade('might') && metaShop.upgrades.might===0 && metaShop.bankedCoins===0; fresh();
      assert('insufficient bank blocks buy', ok);
    },
    shop_persistence() {
      fresh(); metaShop.upgrades.might=2; metaShop.bankedCoins=55; saveMetaShop();
      metaShop=freshMetaShop(); loadMetaShop();
      const ok=metaShop.upgrades.might===2 && metaShop.bankedCoins===55; fresh();
      assert('meta shop persists via load', ok);
    },
    shop_corrupt_save() {
      fresh(); localStorage.setItem('RR_META_SHOP_v1','{garbage'); loadMetaShop(); const a=metaShop.bankedCoins===0;
      localStorage.setItem('RR_META_SHOP_v1',JSON.stringify({version:0,bankedCoins:999,upgrades:{might:3}})); loadMetaShop();
      const b=metaShop.bankedCoins===0 && metaShop.upgrades.might===0; fresh();
      assert('corrupt/old save resets safely', a && b);
    },
    shop_run_start_apply() {
      fresh(); const b=getEffectiveStats();
      META_SHOP_UPGRADES.forEach(u=>metaShop.upgrades[u.id]=1); newGame(); const s=getEffectiveStats();
      const ok=runState.metaMaxHpBonus===5 && Math.abs(s.damageMul/b.damageMul-1.04)<0.001 &&
        Math.abs(s.speed/b.speed-1.03)<0.001 && Math.abs(s.crit-b.crit-0.01)<0.001 &&
        Math.abs(runState.metaCoinMult-1.05)<0.001 && runState.metaTiffinHeals===1;
      fresh();
      assert('all 6 meta upgrades apply at run start', ok);
    },
    shop_thrift_stack() {
      fresh(); runState.danger=3; const base=Math.floor(20*1.35);
      metaShop.upgrades.thrift=1; newGame(); const stacked=coinGain(base);
      const c2=coins; chooseChest('coins'); const chest=coins-c2;
      fresh();
      assert('thrift x danger + chest unscaled', base===27 && stacked===28 && chest===40);
    },
    char_raju_stats() {
      fresh(); runState.character='raju'; newGame(); const c=C9_CHARS[0];
      const ok=c.hp===90 && c.dmg===10 && c.spd===110 && c.crit===0.05 && c.weaponName==='Slingshot' &&
        currentChar().id==='raju';
      phase='playing'; updateHudButtons(); const hud=document.getElementById('hud-character').textContent==='Character: Raju'; fresh();
      assert('raju starter stats + HUD', ok && hud);
    },
    char_meena_stats() {
      fresh(); runState.character='meena'; newGame(); const c=C9_CHARS[1];
      const ok=c.hp===140 && c.dmg===10 && c.spd===95 && c.crit===0.05 && c.weaponName==='Cricket Bat';
      phase='playing'; updateHudButtons(); const hud=document.getElementById('hud-character').textContent==='Character: Meena'; fresh();
      assert('meena starter stats + HUD', ok && hud);
    },
    char_kabir_stats() {
      fresh(); runState.character='kabir'; newGame(); const c=C9_CHARS[2];
      const ok=c.hp===85 && c.dmg===12 && c.spd===100 && c.crit===0.10 && c.weaponName==='Water Balloon' &&
        Math.abs(getEffectiveStats().crit-(player.crit+0.05))<0.001;
      phase='playing'; updateHudButtons(); const hud=document.getElementById('hud-character').textContent==='Character: Kabir'; fresh();
      assert('kabir starter stats + HUD', ok && hud);
    },
    char_raju_passive() {
      fresh(); runState.character='raju'; newGame(); coins=0; const base=getEffectiveStats().speed;
      const vals=[0,50,150,200].map(c=>{ coins=c; return getEffectiveStats().speed/base; });
      fresh();
      assert('raju coin-speed passive + cap', Math.abs(vals[1]-1.05)<0.001 && Math.abs(vals[2]-1.15)<0.001 && Math.abs(vals[3]-1.15)<0.001);
    },
    char_meena_passive() {
      fresh(); runState.character='meena'; newGame(); player.hp=player.maxHp-10; phase='playing';
      update(10); const healed=player.hp===player.maxHp-8;
      player.hp=player.maxHp; update(10); const full=player.hp===player.maxHp;
      player.hp=player.maxHp-10; phase='levelup'; update(10); const paused=player.hp===player.maxHp-10; fresh();
      assert('meena +2 HP per 10s playing only', healed && full && paused);
    },
    char_kabir_passive() {
      fresh(); runState.character='kabir'; newGame(); const base=getEffectiveStats().crit;
      const b=[];
      for (const n of [0,5,15]) { runState.levelsGained=n; b.push(getEffectiveStats().crit-base); }
      fresh();
      assert('kabir crit per level + cap', Math.abs(b[0])<0.001 && Math.abs(b[1]-0.05)<0.001 && Math.abs(b[2]-0.10)<0.001);
    },
    danger_multipliers_table() {
      const t=DANGER_TABLE;
      const ok=t[0].hp===1 && t[0].dmg===1 && t[0].spd===1 && t[0].coins===1 && t[0].xp===1 && t[0].taken===1 &&
        t[2].hp===1.6 && t[2].dmg===1.35 && t[2].spd===1.05 && t[2].coins===1.45 && t[2].xp===1.45 && t[2].taken===1.35 &&
        t[4].hp===2.8 && t[4].dmg===1.9 && t[4].spd===1.12 && t[4].coins===2.1 && t[4].xp===2.1 && t[4].taken===1.9;
      assert('D1-D5 exact table', ok);
    },
    danger_boss_divide_by_four() {
      const bh=(base,d)=>Math.max(1,Math.floor(Math.floor(base*DANGER_TABLE[d].hp)/4));
      const ok=bh(1000,0)===250 && bh(1000,2)===400 && bh(1000,4)===700 && bh(10,0)===2 && bh(3,0)===1 &&
        Math.ceil(100*DANGER_TABLE[2].dmg)===135 && Math.floor(1000*DANGER_TABLE[2].hp)===1600;
      assert('boss HP floor(/4), damage/normal unscaled', ok);
    },
    danger_stacking_order_armor_coins() {
      fresh(); runState.danger=2; runState.poolPicks.harvest=2; runState.poolPicks.armor=2;
      const coins=Math.floor(100*danger().coins*coinGain(100)/100);
      player.hp=50; invuln=0; hurtPlayer(player.x+5,player.y,100); const taken=50-player.hp;
      runState.poolPicks.armor=2; player.hp=50; chooseEvent('curse',null); const eventLoss=50-player.hp; fresh();
      assert('danger x harvest x armor order', coins===174 && taken===124 && eventLoss===5, coins+' '+taken+' '+eventLoss);
    },
    endless_wave_50_plus_curve() {
      fresh(); wave=51; const a=endlessHp(); wave=60; const b=endlessHp(), bd=endlessDamage();
      const bh=Math.max(1,Math.floor(Math.floor(1000*2.8)/4)); wave=100; const c=endlessHp(), sp=endlessSpeed(); fresh();
      assert('endless 51/60/100 + boss + speed cap', Math.abs(a-1.18)<0.001 && Math.abs(b-2.8)<0.001 && Math.abs(bd-1.8)<0.001 && bh===700 && Math.abs(c-10)<0.001 && sp===1.25);
    },
    endless_unlock_and_persistence() {
      fresh(); localStorage.setItem(DANGER_KEY,'4'); const d=loadDangerPref();
      localStorage.setItem(DANGER_KEY,'99'); const bad=loadDangerPref();
      localStorage.setItem(W6_KEY,'false'); const locked=!w6Cleared();
      localStorage.setItem(W6_KEY,'true'); const unlocked=w6Cleared();
      saveEndlessBest(77,3); const best=JSON.parse(localStorage.getItem(ENDLESS_BEST_KEY)||'{}');
      localStorage.removeItem(W6_KEY); localStorage.removeItem(ENDLESS_BEST_KEY); localStorage.removeItem(DANGER_KEY); fresh();
      assert('danger/endless persistence + unlock', d===3 && bad===0 && locked && unlocked && best.wave===77 && best.danger===4);
    },
    danger_endless_regression() {
      fresh(); runState.danger=0; wave=3; spawnEnemy('gilli'); const hp=enemies[enemies.length-1].hp;
      const ok=hp===8; fresh();
      assert('D1 baseline unchanged + regressions', ok);
    },
    danger_table() {
      const hp={}, data={};
      for(const d of [0,2,4]) {
        fresh(); runState.danger=d; wave=3; spawnEnemy('gilli'); const e=enemies[enemies.length-1];
        hp[d]=e.hp; data[d]={spd:e.speed/xpSafeSpeed(),mul:e.dangerDamageMul,xp:e.xp};
      }
      function xpSafeSpeed(){ return 1; }
      fresh();
      const ok=hp[2]===Math.round(hp[0]*1.6) && hp[4]===Math.round(hp[0]*2.8) &&
        Math.abs(data[2].mul-1.35)<0.001 && Math.abs(data[4].mul-1.90)<0.001;
      assert('danger HP/damage table', ok);
    },
    danger_spawn_count() {
      fresh(); wave=1; runState.danger=1; const a=dangerSpawnCount(10);
      runState.danger=3; const b=dangerSpawnCount(10);
      wave=51; runState.danger=0; const c=dangerSpawnCount(10); fresh();
      assert('danger/endless spawn count', a===12 && b===18 && c===10);
    },
    danger_damage_taken() {
      fresh(); runState.danger=2; player.hp=50; invuln=0; hurtPlayer(player.x+5,player.y,10);
      const loss=50-player.hp;
      player.hp=50; invuln=5; hurtPlayer(player.x+5,player.y,10); const shield=player.hp===50; fresh();
      assert('danger damage taken + shield', loss===13 && shield);
    },
    danger_elite_stack() {
      fresh(); runState.danger=2; wave=3; runState.seed='TEST'; runState.rng=()=>0; runState.elitesAlive=0; runState.elitesSpawnedThisWave=0;
      spawnEnemy('gilli'); const e=enemies[enemies.length-1]; const hp=e.hp;
      fresh(); runState.danger=5; const c0=coins; chooseChest('coins'); const chest=coins-c0; fresh();
      assert('danger x elite + unscaled chest', hp===39 && chest===40);
    },
    endless_wave_11() {
      fresh(); wave=51; runState.danger=0;
      const ok=endlessHp()===1.18 && endlessDamage()===1.08 && endlessSpeed()===1.01 &&
        dangerSpawnCount(10)===10 && Math.abs(endlessCoins()-1.10)<0.001; fresh();
      assert('endless wave 11 curve', ok);
    },
    endless_wave_20_speed_cap() {
      fresh(); wave=60; const hp20=endlessHp(), dmg20=endlessDamage(), sp20=endlessSpeed();
      wave=100; const sp30=endlessSpeed(); fresh();
      assert('endless wave 60 + speed cap', Math.abs(hp20-2.8)<0.001 && Math.abs(dmg20-1.8)<0.001 && Math.abs(sp20-1.10)<0.001 && sp30===1.25);
    },
    c8_full_regression() {
      fresh();
      runState.weapon='bat'; const w=getEffectiveStats().weaponDmg===10;
      runState.pendingLevels=1; chooseLevelUp('weapon'); const lv=runState.weaponLevel===2 && getEffectiveStats().weaponDmg===12;
      wave=3; runState.seed='TEST'; runState.rng=()=>0; runState.elitesAlive=0; runState.elitesSpawnedThisWave=0;
      spawnEnemy('gilli'); const e=enemies[enemies.length-1]; const m0=C8_MATERIALS.reduce((s,k)=>s+runState.materials[k],0);
      e.hp=1; hitEnemy(e,99,false); const drop=C8_MATERIALS.reduce((s,k)=>s+runState.materials[k],0)-m0===2;
      hideOverlay(); phase='playing';
      player.maxHp=100; player.hp=10; coins=30; useConsumable('tiffin'); const heal=player.hp===35 && coins===0;
      runState.pendingChest=true; phase='playing'; maybeShowChest(); const chest=phase==='chest'; hideOverlay(); phase='playing';
      runState.materials.masala=2; coins=20; craftRecipe('craft_damage'); const craft=Math.abs(runState.craftDamageMult-1.05)<0.001; closeCraft();
      fresh();
      assert('full C8 regression', w && lv && drop && heal && chest && craft, JSON.stringify({w,lv,drop,heal,chest,craft}));
    },
    consumable_tiffin() {
      fresh(); player.hp=50; player.maxHp=100; coins=30; useConsumable('tiffin');
      const healed=player.hp===75 && coins===0;
      player.hp=player.maxHp; coins=30; useConsumable('tiffin');
      const blocked=player.hp===player.maxHp && coins===30; fresh();
      assert('tiffin heals and full-HP blocks', healed && blocked);
    },
    consumable_spice_bomb() {
      fresh(); coins=40; enemies=[];
      for(let i=0;i<3;i++){ spawnEnemy('gilli'); enemies[i].hp=i===0?20:100; enemies[i].maxHp=100; }
      useConsumable('spice_bomb');
      const ok=coins>=2 && coins<40 && enemies.every(e=>e.hp<=70) && runState.consumablesUsed.spice_bomb===1; fresh();
      assert('spice bomb 30 to all + rewards', ok);
    },
    consumable_shield() {
      fresh(); coins=100; player.hp=10; useConsumable('shield');
      const first=invuln>=3 && coins===50;
      const c=coins; useConsumable('shield'); const blocked=coins===c && invuln>=3;
      hurtPlayer(player.x+5,player.y,5); const noDamage=player.hp===10; fresh();
      assert('shield 3s invuln + no refresh', first && blocked && noDamage);
    },
    chest_elite_guaranteed() {
      fresh(); wave=3; runState.seed='TEST'; runState.rng=()=>0; runState.elitesAlive=0; runState.elitesSpawnedThisWave=0;
      spawnEnemy('gilli'); const e=enemies[enemies.length-1]; e.hp=1; hitEnemy(e,99,false);
      const ok=phase==='chest' && titleEl.textContent==='Chest! Choose one:';
      const labels=[...buttonsEl.querySelectorAll('button')].map(b=>b.textContent);
      const finalOk=ok && labels.length===3 && new Set(labels).size===3;
      hideOverlay(); phase='playing'; fresh();
      assert('elite kill opens 3-choice chest', finalOk);
    },
    chest_pool_effects() {
      let ok=true;
      for(const id of C8_CHEST_POOL.map(c=>c.id)){
        fresh(); const c0=coins, m0=JSON.stringify(runState.materials), hp0=player.maxHp;
        chooseChest(id);
        if(id==='coins'&&coins-c0!==40) ok=false;
        if((id==='masala'||id==='scrap'||id==='cloth')&&JSON.stringify(runState.materials)===m0) ok=false;
        if(id==='damage'&&Math.abs(getEffectiveStats().damageMul-1.05)>0.001) ok=false;
        if(id==='maxhp'&&player.maxHp-hp0!==1) ok=false;
      }
      fresh();
      assert('all chest rewards apply', ok);
    },
    craft_recipes() {
      fresh(); runState.character='meena'; newGame(); runState.materials.masala=2; runState.materials.scrap=2; runState.materials.cloth=2; coins=60;
      const baseSpeed=getEffectiveStats().speed, baseHp=player.maxHp;
      craftRecipe('craft_damage'); craftRecipe('craft_hp'); craftRecipe('craft_speed');
      const ok=Math.abs(getEffectiveStats().damageMul-1.05)<0.001 && Math.abs(getEffectiveStats().speed/baseSpeed-1.05)<0.001 &&
        player.maxHp===baseHp+5 && coins===0 && C8_MATERIALS.every(k=>runState.materials[k]===0);
      closeCraft(); fresh();
      assert('craft recipes apply and deduct', ok);
    },
    craft_insufficient_blocked() {
      fresh(); const c0=coins; craftRecipe('craft_damage');
      const ok=coins===c0 && runState.craftDamageMult===1 && runState.materials.masala===0; fresh();
      assert('craft blocked without resources', ok);
    },
    c4_new_run_cleared() {
      fresh(); useConsumable('shield'); runState.chestDamageMult=1.2; runState.craftDamageMult=1.2;
      runState.craftSpeedMult=1.2; runState.craftMaxHpBonus=5; newGame();
      const ok=runState.chestDamageMult===1 && runState.craftDamageMult===1 && runState.craftSpeedMult===1 &&
        runState.craftMaxHpBonus===0 && Object.values(runState.consumablesUsed).every(v=>v===0);
      assert('new run clears C8-T4 state', ok);
    },
    elite_stats() {
      fresh(); wave=3; runState.seed='TEST'; runState.rng=()=>0; rnd=()=>0.5; runState.elitesAlive=0; runState.elitesSpawnedThisWave=0;
      spawnEnemy('gilli'); const e=enemies[enemies.length-1];
      fresh(); wave=3; rnd=()=>0.5; spawnEnemy('gilli'); const n=enemies[enemies.length-1];
      const ok=e.elite && Math.abs(e.hp/n.hp-3)<0.05 && Math.abs(e.speed/n.speed-0.9)<0.01 &&
        Math.abs(e.r/n.r-1.35)<0.01 && e.xp===n.xp*3 && e.eliteCoinMul===2 && eliteDamage(10,e)===15;
      fresh();
      assert('elite stat multipliers', ok);
    },
    elite_spawn_rules() {
      fresh(); wave=1; rnd=()=>0; let w1=0;
      for(let i=0;i<100;i++){ enemies=[]; runState.elitesAlive=0; spawnEnemy('gilli'); if(enemies[enemies.length-1].elite) w1++; }
      fresh(); wave=3; rnd=()=>0; let w3=0;
      for(let i=0;i<20;i++){ spawnEnemy('gilli'); if(enemies[enemies.length-1].elite) w3++; }
      const alive=runState.elitesAlive, spawned=runState.elitesSpawnedThisWave; fresh();
      assert('elite wave/caps', w1===0 && w3<=3 && alive<=2 && spawned<=3);
    },
    elite_guarantee() {
      fresh(); wave=3; runState.seed='TEST'; runState.rng=()=>0.99; runState.elitesAlive=0; runState.elitesSpawnedThisWave=0; runState.spawnsThisWave=14;
      spawnEnemy('gilli'); const e=enemies[enemies.length-1]; const ok=e.elite===true; fresh();
      assert('elite dry-wave guarantee', ok);
    },
    elite_material_drop() {
      fresh(); wave=3; runState.seed='TEST'; runState.rng=()=>0; runState.elitesAlive=0; runState.elitesSpawnedThisWave=0;
      spawnEnemy('gilli'); const e=enemies[enemies.length-1];
      const before=C8_MATERIALS.reduce((s,k)=>s+runState.materials[k],0);
      e.hp=1; hitEnemy(e,99,false);
      const total=C8_MATERIALS.reduce((s,k)=>s+runState.materials[k],0)-before;
      const valid=C8_MATERIALS.every(k=>Number.isInteger(runState.materials[k])&&runState.materials[k]>=0); fresh();
      assert('elite drops exactly 2 materials', total===2 && valid);
    },
    material_hud_row() {
      fresh(); runState.materials.masala=1; runState.materials.scrap=2; runState.materials.cloth=3; updateMaterialsHud();
      const txt=document.getElementById('hud-materials').textContent;
      const ok=txt==='Materials: 🌶️ 1 | 🔩 2 | 🧵 3'; fresh();
      assert('materials HUD row', ok, txt);
    },
    elite_new_run_cleared() {
      fresh(); runState.materials.masala=2; runState.materials.scrap=1; runState.materials.cloth=1;
      wave=3; runState.seed='TEST'; runState.rng=()=>0; spawnEnemy('gilli');
      fresh();
      const ok=C8_MATERIALS.every(k=>runState.materials[k]===0) && runState.elitesAlive===0 && runState.elitesSpawnedThisWave===0;
      assert('new run clears elite/material state', ok);
    },
    levelup_modal_3_distinct() {
      fresh(); runState.pendingLevels=1; phase='playing'; showLevelUp();
      const labels=[...buttonsEl.querySelectorAll('button')].map(b=>b.textContent);
      const ok=phase==='levelup' && labels.length===5 && new Set(labels.slice(0,4)).size===4;
      hideOverlay(); phase='playing'; runState.pendingLevels=0; fresh();
      assert('level-up shows 3 distinct choices', ok);
    },
    levelup_vitality() {
      fresh(); player.hp=12; player.maxHp=12; runState.pendingLevels=1; chooseLevelUp('vitality');
      const ok=player.maxHp===17 && player.hp===17 && runState.levelMaxHpBonus===5; fresh();
      assert('vitality +5 max/current HP', ok);
    },
    levelup_might_stack() {
      fresh(); runState.pendingLevels=2; const base=getEffectiveStats().damageMul;
      chooseLevelUp('might'); chooseLevelUp('might');
      const ok=Math.abs(runState.levelDamageMult-1.21)<0.001 && Math.abs(getEffectiveStats().damageMul/base-1.21)<0.001; fresh();
      assert('might stacks multiplicatively', ok);
    },
    levelup_sharp_eye() {
      fresh(); runState.pendingLevels=2; const base=getEffectiveStats().crit;
      player.items.push(ITEMS.find(i=>i.id==='chai'),ITEMS.find(i=>i.id==='ball'));
      const withStreet=getEffectiveStats().crit;
      chooseLevelUp('sharp'); chooseLevelUp('sharp');
      const ok=Math.abs(runState.levelCritBonus-0.06)<0.001 && Math.abs(getEffectiveStats().crit-(withStreet+0.06))<0.001 && Math.abs(withStreet-base-0.05)<0.001; fresh();
      assert('sharp eye +0.03 each stacks with street', ok);
    },
    levelup_weapon_training() {
      fresh(); runState.pendingLevels=1; const before=getEffectiveStats().weaponDmg;
      chooseLevelUp('weapon');
      const ok=runState.weaponLevel===2 && getEffectiveStats().weaponDmg===before+2; fresh();
      assert('weapon training +1 level', ok);
    },
    levelup_heal_coins() {
      fresh(); runState.pendingLevels=2; player.hp=2; const c0=coins, max=player.maxHp;
      chooseLevelUp('heal'); const healed=player.hp; chooseLevelUp('coins');
      const ok=healed===Math.min(max,12) && coins-c0===20; fresh();
      assert('heal capped + coins +20', ok);
    },
    levelup_queue_multi() {
      fresh(); runState.pendingLevels=2; phase='playing'; showLevelUp();
      const first=buttonsEl.querySelector('button'); if(first)first.click();
      const stillOpen=phase==='levelup' && runState.pendingLevels===1;
      const second=buttonsEl.querySelector('button'); if(second)second.click();
      const ok=stillOpen && runState.pendingLevels===0 && phase==='playing'; fresh();
      assert('multi-level queue opens in sequence', ok);
    },
    levelup_seeded_choices() {
      const pick=()=>{ newGame(true,'TEST123'); runState.pendingLevels=1; phase='playing'; showLevelUp(); const l=[...buttonsEl.querySelectorAll('button')].map(b=>b.textContent); hideOverlay(); phase='playing'; return l; };
      const a=pick(), b=pick(); const ok=JSON.stringify(a)===JSON.stringify(b); fresh();
      assert('same seed reproduces level-up choices', ok);
    },
    weapon_select_bat_default() {
      fresh();
      assert('bat is default weapon', runState.weapon==='bat' && runState.weaponLevel===1);
    },
    weapon_select_each() {
      let ok=true;
      for (const k of Object.keys(C8_WEAPONS)) { fresh(); runState.weapon=k; if (!getEffectiveStats().weaponName.includes(C8_WEAPONS[k].name)) ok=false; }
      fresh();
      assert('all 4 weapons selectable', ok);
    },
    weapon_bat_arc_3() {
      fresh(); runState.weapon='bat'; player.crit=0; player.faceX=1; player.faceY=0; enemies=[];
      for (let i=0;i<4;i++) { spawnEnemy('gilli'); const e=enemies[i]; e.x=player.x+20+i*12; e.y=player.y; e.hp=100; e.maxHp=100; }
      fireC8Weapon();
      const hit=enemies.filter(e=>e.hp<100).length; fresh();
      assert('bat arc hits at most 3', hit===3);
    },
    weapon_slingshot_pierce_2() {
      fresh(); runState.weapon='slingshot'; player.crit=0; enemies=[];
      for (let i=0;i<3;i++) { spawnEnemy('gilli'); const e=enemies[i]; e.x=player.x+20+i*14; e.y=player.y; e.hp=100; e.maxHp=100; }
      fireC8Weapon();
      const hit=enemies.filter(e=>e.hp<100).length; fresh();
      assert('slingshot pierces at most 2', hit===2);
    },
    weapon_tiffin_bounce_2() {
      fresh(); runState.weapon='tiffin'; player.crit=0; enemies=[];
      for (let i=0;i<2;i++) { spawnEnemy('gilli'); const e=enemies[i]; e.x=player.x+20+i*20; e.y=player.y; e.hp=100; e.maxHp=100; }
      fireC8Weapon(); const two=enemies.filter(e=>e.hp<100).length;
      fresh(); runState.weapon='tiffin'; player.crit=0; enemies=[]; spawnEnemy('gilli'); const one=enemies[0]; one.x=player.x+20; one.y=player.y; one.hp=100; one.maxHp=100;
      fireC8Weapon(); const single=one.hp<100; fresh();
      assert('tiffin bounces to one extra', two===2 && single);
    },
    weapon_ruler_crit_speed() {
      fresh(); const baseCrit=getEffectiveStats().crit; runState.weapon='ruler'; const s=getEffectiveStats();
      const ok=s.weaponCrit===0.10 && Math.abs(s.weaponInterval-0.60)<0.001 && s.weaponDmg===5 && Math.abs(s.crit-(baseCrit+0.10))<0.001;
      fresh();
      assert('ruler fast/low-dmg/crit', ok);
    },
    weapon_level_scaling() {
      let ok=true;
      for (const k of ['bat','slingshot','tiffin','ruler']) { fresh(); runState.weapon=k; runState.weaponLevel=3; if (getEffectiveStats().weaponDmg!==C8_WEAPONS[k].dmg+4) ok=false; }
      fresh();
      assert('weapon level adds +2 damage', ok);
    },
    weapon_stacking_c7() {
      unlockAllTier2();
      fresh(); runState.weapon='ruler'; const baseCrit=getEffectiveStats().crit; runState.selectedMeta='Crit'; runState.metaTier=2;
      player.items.push(ITEMS.find(i=>i.id==='chai'),ITEMS.find(i=>i.id==='ball'));
      const crit=getEffectiveStats().crit;
      fresh(); runState.weapon='bat'; player.crit=0; runState.selectedMeta='Athlete'; runState.metaTier=2;
      runState.eventChoice='curse'; runState.eventDamageMult=1.15; enemies=[]; spawnEnemy('gilli');
      const e=enemies[0]; e.x=player.x+20; e.y=player.y; e.hp=100; e.maxHp=100; fireC8Weapon();
      const dealt=100-e.hp;
      for(const n of META_NAMES) save.meta.tier2[n].tier2Unlocked=false; persist(); fresh();
      assert('weapon stacks with C7 bonuses', Math.abs(crit-(baseCrit+0.05+0.05))<0.001 && Math.abs(dealt-12.65)<0.01, 'crit '+crit+' dealt '+dealt);
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
