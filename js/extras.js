// Stumply — Celebration, awards, knockouts, player profiles, share image, Super Over, WhatsApp text, graphs, stream overlay, spoken score, fan poll, match rules, entry fees and rain.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  CELEBRATION & MATCH AWARDS
// ══════════════════════════════════════════════════════════════════════════
let _lastCompletedMatch=null;

function showCelebration(m){
  if(m.status!=='completed'||!APP.matches.includes(m))return; // match was undone
  _lastCompletedMatch=m;
  let winTeam=m.winner&&m.winner!=='tie'&&m.winner!=='no_result'
    ? APP.teams.find(t=>t.id===m.winner) : null;
  let el=document.getElementById('celebration-overlay');
  let titleEl=document.getElementById('celeb-title');
  let teamEl=document.getElementById('celeb-team');
  let resultEl=document.getElementById('celeb-result');

  if(m.winner==='tie'){
    titleEl.textContent='Match Tied!';
    teamEl.textContent='🤝 Both Teams';
    teamEl.style.color='var(--amber)';
    resultEl.textContent=m.resultText||"It's a tie!";
  } else if(m.winner==='no_result'){
    titleEl.textContent='No Result';
    teamEl.textContent='Match Abandoned';
    teamEl.style.color='var(--dim)';
    resultEl.textContent=m.resultText||'No result';
  } else {
    let isFinal=m.matchType==='Final';
    titleEl.textContent=isFinal?'🏆 Champions!':'Match Won!';
    teamEl.textContent=winTeam?winTeam.name:'Winner';
    teamEl.style.color=isFinal?'var(--gold)':'var(--em)';
    resultEl.textContent=m.resultText||'Won the match';
  }

  // Auto MOTM preview
  let motm=autoPickMOTM(m);
  let motmPrev=document.getElementById('celeb-motm-preview');
  if(motm&&motm.name){
    document.getElementById('celeb-motm-name').textContent=motm.name;
    document.getElementById('celeb-motm-stat').textContent=motm.stat;
    motmPrev.style.display='block';
    if(!m.motm){m.motm=motm.pid;saveState();}
  } else {
    motmPrev.style.display='none';
  }

  let so=document.getElementById('celeb-so');if(so)so.style.display=canSuperOver(m)?'':'none';
  // Confetti
  launchConfetti(m.winner==='tie'?'amber':m.matchType==='Final'?'gold':'green');

  el.classList.add('on');

  // Auto-close after 12 seconds
  setTimeout(()=>{
    if(el.classList.contains('on'))closeCelebration();
  },12000);

  // If final match — show tournament completion
  if(m.matchType==='Final'){
    setTimeout(()=>{if(m.status==='completed'&&APP.matches.includes(m))showTournamentComplete(m);},14000);
  }
}

function closeCelebration(){
  document.getElementById('celebration-overlay').classList.remove('on');
  let wrap=document.getElementById('confetti-wrap');
  if(wrap)wrap.innerHTML='';
}
function openAfterCelebration(){
  closeCelebration();
  setTimeout(()=>openMOTM(),300);
}

function launchConfetti(type){
  let wrap=document.getElementById('confetti-wrap');
  if(!wrap)return;
  wrap.innerHTML='';
  let colors=type==='gold'?['#f5c842','#e09500','#fff','#f0a030','#ffd700']:
             type==='amber'?['#f0a030','#e09500','#f5c842','#d4720a']:
             ['#1a7a2e','#22a03c','#f5c842','#fff','#00c97a','#e8f4fd'];
  for(let i=0;i<80;i++){
    let p=document.createElement('div');
    p.className='confetti-piece';
    p.style.cssText=`
      left:${Math.random()*100}%;
      width:${6+Math.random()*10}px;
      height:${6+Math.random()*10}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation:confettiFall ${2+Math.random()*3}s ${Math.random()*2}s linear forwards;
      opacity:${0.7+Math.random()*0.3};
    `;
    wrap.appendChild(p);
  }
}

// ── Auto-pick MOTM from stats ─────────────────────────────────────────
function autoPickMOTM(m){
  // Batting and bowling in the main innings add up per player (Super Overs left out).
  // The winning side is preferred: a losing player needs a clearly bigger game to be picked.
  let pts={},win=m.winner&&m.winner!=='tie'&&m.winner!=='no_result'?m.winner:null;
  const add=(pid,team,name,score,bit)=>{let p=pts[pid]=pts[pid]||{pid,name,team,score:0,bits:[]};p.score+=score;if(bit)p.bits.push(bit);};
  mainInns(m).forEach(inn=>{
    Object.entries(inn.batsmen||{}).forEach(([pid,b])=>{
      if(b.status==='yet')return;
      let sr=(b.balls||0)>=10?((b.runs||0)/b.balls-1)*10:0;
      add(pid,inn.battingTeamId,b.name,(b.runs||0)+(b.sixes||0)*2+(b.fours||0)+(b.status!=='out'&&(b.runs||0)>=10?5:0)+sr,`${plural(b.runs,'run')} (${b.balls||0}b)`);
    });
    Object.entries(inn.bowlers||{}).forEach(([pid,bw])=>{
      if(!hasBowled(bw))return;
      let balls=(bw.overs||0)*6+(bw.balls||0),eco=balls?(bw.runs||0)*6/balls:0;
      add(pid,inn.bowlingTeamId,bw.name,(bw.wickets||0)*20+(bw.maidens||0)*8+(balls>=6?(8-eco)*2:0),`${plural(bw.wickets,'wkt')} for ${plural(bw.runs,'run')}`);
    });
  });
  let best=null;
  Object.values(pts).forEach(p=>{let s=p.score*(win&&p.team!==win?0.6:1);if(!best||s>best.score)best={pid:p.pid,name:p.name,stat:p.bits.join(', '),score:s};});
  return best&&best.score>0?best:null;
}

function openMOTM(){
  let m=_lastCompletedMatch;if(!m)return;
  // Show auto-suggestion cards
  let auto=autoPickMOTM(m);
  let cards=document.getElementById('motm-auto-cards');
  if(auto&&auto.name){
    cards.innerHTML=`<div class="motm-card">
      <div class="motm-medal">🏅</div>
      <div class="motm-info">
        <div class="motm-title">Suggested Player of the Match</div>
        <div class="motm-name">${esc(auto.name)}</div>
        <div class="motm-stat">${esc(auto.stat)}</div>
      </div>
    </div>`;
  } else {
    cards.innerHTML='';
  }
  // Populate player dropdown
  let sel=document.getElementById('motm-player-sel');
  let seen={},opts='<option value="">— Select player —</option>';
  m.innings.forEach(inn=>{
    let batTeam=APP.teams.find(t=>t.id===inn.battingTeamId),bwlTeam=APP.teams.find(t=>t.id===inn.bowlingTeamId);
    Object.entries(inn.batsmen||{}).forEach(([pid,b])=>{
      if(b.status==='yet')return;
      (seen[pid]=seen[pid]||{name:b.name,team:batTeam?batTeam.code:'?',bits:[]}).bits.push(plural(b.runs,'run'));
    });
    Object.entries(inn.bowlers||{}).forEach(([pid,bw])=>{
      if(!hasBowled(bw))return;
      (seen[pid]=seen[pid]||{name:bw.name,team:bwlTeam?bwlTeam.code:'?',bits:[]}).bits.push(`${bw.wickets||0}/${bw.runs||0}`);
    });
  });
  Object.entries(seen).forEach(([pid,p])=>{opts+=`<option value="${esc(pid)}">${esc(p.name)} (${esc(p.team)}) — ${esc(p.bits.join(', '))}</option>`;});
  sel.innerHTML=opts;
  // Pre-select auto pick
  if(auto)sel.value=auto.pid||'';
  openM('motm-mo');
}

function saveMOTM(){
  let m=_lastCompletedMatch;if(!m)return;
  let pid=document.getElementById('motm-player-sel').value;
  if(pid) m.motm=pid;
  closeM('motm-mo');
  saveState();
  renderMatches();renderHistory();
  toast('🏅 Player of the Match saved!');
}

// ── Tournament Complete ───────────────────────────────────────────────
function showTournamentComplete(finalMatch){
  let winTeam=APP.teams.find(t=>t.id===finalMatch.winner);
  document.getElementById('tc-winner').textContent=winTeam?winTeam.name:'Champions!';
  document.getElementById('tc-result').textContent=finalMatch.resultText||'Tournament Complete';

  // Quick awards summary
  let {batting,bowling}=collectPlayerStats();
  batting.sort((a,b)=>b.runs-a.runs);
  bowling.sort((a,b)=>b.wickets-a.wickets);
  let oc=batting[0],pc=bowling[0];
  let html='';
  if(oc)html+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bdr)"><span style="font-size:24px">🟠</span><div><div style="font-size:9px;color:var(--dim);letter-spacing:1px;font-family:var(--disp)">ORANGE CAP</div><div style="font-family:var(--disp);font-size:15px">${esc(oc.name)}</div><div style="font-family:var(--mono);font-size:11px;color:var(--dim)">${oc.runs} runs</div></div></div>`;
  if(pc)html+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 0"><span style="font-size:24px">🟣</span><div><div style="font-size:9px;color:var(--dim);letter-spacing:1px;font-family:var(--disp)">PURPLE CAP</div><div style="font-family:var(--disp);font-size:15px">${esc(pc.name)}</div><div style="font-family:var(--mono);font-size:11px;color:var(--dim)">${pc.wickets} wickets</div></div></div>`;
  document.getElementById('tc-awards').innerHTML=html;
  launchConfetti('gold');
  openM('tourn-complete-mo');
}

// ── Update determineWinner to trigger celebration ─────────────────────
// (Patch: override the celebration call point)
function determineWinner(m){
  let n=m.innings.length;if(n<2||n%2)return;
  let i1=m.innings[n-2],i2=m.innings[n-1];
  // par = runs needed to tie (the target can be revised after rain)
  let par=(i2.target||i1.runs+1)-1;
  if(i2.super){
    m.winner=i2.runs>par?i2.battingTeamId:i2.runs<par?i1.battingTeamId:'tie';
    m.resultText=m.winner==='tie'?'Match tied — Super Over tied too!':`Match tied — ${rawTeamName(m.winner)} won the Super Over`;
  } else {
    let rev=i2.target&&i2.target!==i1.runs+1?' (revised target)':'';
    if(i2.runs>par){
      let wktsLeft=innMaxW(i2)-i2.wickets;
      m.winner=i2.battingTeamId;
      m.resultText=`${rawTeamName(i2.battingTeamId)} won by ${wktsLeft} wicket${wktsLeft===1?'':'s'}${rev}`;
    } else if(i2.runs<par){
      let margin=par-i2.runs;
      m.winner=i1.battingTeamId;
      m.resultText=`${rawTeamName(i1.battingTeamId)} won by ${margin} run${margin===1?'':'s'}${rev}`;
    } else {
      m.winner='tie';m.resultText='Match Tied!';
    }
  }
  m.status='completed';m.completedAt=Date.now();APP.liveMatch=null;
  document.getElementById('livebadge').classList.add('hidden');
  notifyMatchResult(m.resultText,m.matchType||'League');
  saveState();renderLive();renderHistory();renderMatches();populateSCSelect();
  // Show celebration overlay after brief delay
  setTimeout(()=>showCelebration(m),800);
}

// ── Knockout bracket ──────────────────────────────────────────────────
function brkCard(m){
  let row=id=>{let inns=mainInns(m).filter(i=>i.battingTeamId===id);let sc=inns.map(i=>scTxt(i)).join(' & ');
    return `<div class="brk-t${m.winner===id?' win':''}"><span>${m.winner===id?'✅ ':''}${av(id,18)}${gtn(id)}</span><span style="font-family:var(--mono)">${sc}</span></div>`;};
  let st=m.status==='live'?'🔴 LIVE':m.status==='completed'?esc(m.resultText||''):'📅 '+esc(m.date||'');
  return `<div class="brk-m" onclick="${m.innings.length?`showMHist('${m.id}')`:''}">${row(m.teamAId)}${row(m.teamBId)}<div class="brk-s">${st}</div></div>`;
}
function renderBracket(){
  let el=document.getElementById('brk');if(!el)return;
  let cols=KO_STAGES.map(st=>({st,ms:APP.matches.filter(m=>m.matchType===st)})).filter(c=>c.ms.length);
  let html='';
  if(APP.role==='admin'&&!APP.tournament.single){
    let pr=pointsRows().filter(x=>x.p>0),btn=[];
    let sf=APP.matches.filter(m=>m.matchType==='Semi Final'),fin=APP.matches.some(m=>m.matchType==='Final');
    if(!sf.length&&!fin&&pr.length>=4)btn.push(`<button class="bsm bgld" onclick="autoKO('sf')">🪄 Semi-finals from points table (1v4, 2v3)</button>`);
    if(!sf.length&&!fin&&pr.length>=2)btn.push(`<button class="bsm" onclick="autoKO('final2')">🪄 Final: top 2 from points table</button>`);
    if(sf.length===2&&!fin&&sf.every(m=>m.status==='completed'&&APP.teams.some(t=>t.id===m.winner)))btn.push(`<button class="bsm bgld" onclick="autoKO('final')">🪄 Final from semi-final winners</button>`);
    if(btn.length)html+=`<div class="card"><div style="font-size:12px;color:var(--dim);margin-bottom:8px">Create knockout matches in one tap. They appear in Matches, where you can edit the date, venue and players.</div><div style="display:flex;gap:8px;flex-wrap:wrap">${btn.join('')}</div></div>`;
  }
  if(!cols.length){el.innerHTML=html+`<p style="color:var(--dim)">No knockout matches yet. Schedule a match with the stage Quarter Final, Semi Final or Final and it shows here.</p>`;return;}
  html+=`<div class="brk">${cols.map(c=>`<div class="brk-col"><h4>${c.st==='Final'?'🏆 ':''}${esc(c.st)}</h4>${c.ms.map(brkCard).join('')}</div>`).join('')}</div>`;
  el.innerHTML=html;
}
function autoXI(teamId){
  let t=APP.teams.find(x=>x.id===teamId);if(!t)return [];
  let N=teamSize(),main=t.players.filter(p=>!p.isSub),subs=t.players.filter(p=>p.isSub);
  let all=[...main,...subs];
  return all.slice(0,N+3).map((p,i)=>({id:p.id,name:p.name,jersey:p.jersey,role:p.role,isSub:i>=N}));
}
function autoKO(kind){
  if(APP.role!=='admin')return;
  let pr=pointsRows().filter(x=>x.p>0),pairs=[],stage='Semi Final';
  if(kind==='sf'){if(pr.length<4)return;pairs=[[pr[0],pr[3]],[pr[1],pr[2]]].map(x=>[x[0].team.id,x[1].team.id]);}
  else if(kind==='final2'){if(pr.length<2)return;pairs=[[pr[0].team.id,pr[1].team.id]];stage='Final';}
  else{let sf=APP.matches.filter(m=>m.matchType==='Semi Final');if(sf.length!==2)return;pairs=[[sf[0].winner,sf[1].winner]];stage='Final';}
  let names=pairs.map(x=>rawTeamName(x[0])+' vs '+rawTeamName(x[1])).join('\n');
  if(!window.confirm('Create '+(pairs.length>1?'these matches':'this match')+'?\n\n'+names))return;
  pairs.forEach(([a,b])=>APP.matches.push({id:uid('m_'),teamAId:a,teamBId:b,matchType:stage,playingXI:{[a]:autoXI(a),[b]:autoXI(b)},
    venue:'',date:todayISO(),umpires:['','',''],size:teamSize(),status:'scheduled',innings:[],winner:null,toss:null,resultText:null}));
  saveState();renderMatches();populateSCSelect();renderHistory();
  toast(`✅ ${stage==='Final'?'Final':'Semi-finals'} created — see Matches`);
}

// ── Player profile (this tournament) ──────────────────────────────────
function openPlayer(pid){
  if(!SAFE_ID.test(String(pid)))return;
  let {batting,bowling,fielding}=collectPlayerStats();
  let bt=batting.find(x=>x.id===pid),bw=bowling.find(x=>x.id===pid),fd=fielding.find(x=>x.id===pid);
  let info=null,team=null;
  APP.teams.forEach(t=>{let p=(t.players||[]).find(x=>x.id===pid);if(p){info=p;team=t;}});
  let rows=[],name=info&&info.name;
  APP.matches.filter(m=>m.status==='completed'||m.status==='live').forEach(m=>{
    let bat=null,bowl=null,tid=null;
    mainInns(m).forEach(inn=>{
      let b=inn.batsmen&&inn.batsmen[pid];if(b&&b.status!=='yet'){bat=b;tid=inn.battingTeamId;}
      let w=inn.bowlers&&inn.bowlers[pid];if(hasBowled(w)){bowl=w;tid=tid||inn.bowlingTeamId;}
      if(!name)name=(b&&b.name)||(w&&w.name);
    });
    if(!bat&&!bowl)return;
    if(!team)team=APP.teams.find(t=>t.id===tid);
    let opp=tid===m.teamAId?m.teamBId:m.teamAId;
    let bits=[];
    if(bat)bits.push(`🏏 ${bat.runs}${bat.status==='out'?'':'*'} (${bat.balls})`);
    if(bowl)bits.push(`🎳 ${bowl.wickets||0}/${bowl.runs||0} (${bowlerOvTxt(bowl)})`);
    rows.unshift(`<div class="pl-m" onclick="closeM('pl-mo');showMHist('${m.id}')" style="cursor:pointer"><span>vs ${gtn(opp)}<br><span style="font-size:11px;color:var(--dim)">${esc(m.matchType||'League')} · ${esc(m.date||'')}${m.status==='live'?' · 🔴 LIVE':''}</span></span><span style="text-align:right;font-family:var(--mono)">${bits.join('<br>')}</span></div>`);
  });
  name=name||(bt&&bt.name)||(bw&&bw.name)||(fd&&fd.name)||'Player';
  let ini=esc(String(name).trim().split(/\s+/).map(w=>w[0]||'').slice(0,2).join('').toUpperCase());
  let pic=photoOf(pid)?av(pid,56):`<div class="pl-ini">${ini}</div>`;
  let g=a=>`<div class="pl-grid">${a.map(([l,v])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
  let html=`<div class="pl-head">${pic}<div><div style="font:700 20px var(--disp)">${esc(name)}${isCaptain(pid)?' <span style="font-size:13px;color:var(--dim)">(c)</span>':''}</div>
    <div style="font-size:13px;color:var(--dim)">${team?esc(team.name):''}${info&&info.role?' · '+esc(info.role):''}${info&&info.jersey!=null?' · #'+esc(info.jersey):''}</div></div></div>`;
  if(bt)html+=`<div class="pl-sec">🏏 BATTING</div>`+g([['Matches',bt.matches],['Runs',bt.runs],['Highest',bt.highest+(bt.highestNotOut?'*':'')],['Average',bt.outs?(bt.runs/bt.outs).toFixed(1):'—'],
    ['Strike rate',bt.balls?(bt.runs/bt.balls*100).toFixed(1):'—'],['4s',bt.fours],['6s',bt.sixes],['50s / 100s',bt.halfCenturies+' / '+bt.centuries]]);
  if(bw)html+=`<div class="pl-sec">🎳 BOWLING</div>`+g([['Overs',(bw.overs+Math.floor(bw.balls/6))+(bw.balls%6?'.'+bw.balls%6:'')],['Wickets',bw.wickets],['Best',bw.bestWickets+'/'+bw.bestRuns],['Economy',econTxt(bw.runs,bw.overs,bw.balls)]]);
  if(fd)html+=`<div class="pl-sec">🧤 FIELDING</div>`+g([['Catches',fd.catches],['Stumpings',fd.stumpings],['Run outs',fd.runOuts],['Total',fd.catches+fd.stumpings+fd.runOuts]]);
  if(!bt&&!bw&&!fd)html+=`<p style="color:var(--dim)">No completed matches for this player yet.</p>`;
  if(rows.length)html+=`<div class="pl-sec" style="margin-top:12px">📅 MATCHES</div>${rows.join('')}`;
  html+=`<p style="font-size:11px;color:var(--dim);margin-top:10px">Stats are for this tournament only. Totals count completed matches; Super Overs are not included.</p>`;
  document.getElementById('pl-cont').innerHTML=html;
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(document.getElementById('pl-cont'));
  openM('pl-mo');
}

// ── Share a match as an image (result card for WhatsApp etc.) ─────────
function loadImg(src){return new Promise(r=>{let i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});}
function fitFont(g,text,max,size,weight,family){
  do{g.font=`${weight} ${size}px ${family}`;size-=2;}while(g.measureText(text).width>max&&size>14);
}
async function shareImage(mid){
  let m=APP.matches.find(x=>x.id===mid);if(!m||!m.innings.length){toast('No score to share yet','warn');return;}
  let W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;let g=c.getContext('2d');
  let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0A3B25');bg.addColorStop(.55,'#0F5132');bg.addColorStop(1,'#1B7A4B');
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle='#E9C46A';g.fillRect(0,0,W,14);g.fillRect(0,H-14,W,14);
  let serif='Georgia, "Times New Roman", serif',sans='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  let icon=await loadImg('/icon-mark.svg');
  if(icon)g.drawImage(icon,70,70,110,110);
  g.fillStyle='#FFFFFF';g.textBaseline='middle';
  fitFont(g,'Stumply',300,56,'700',serif);g.fillText('Stumply',200,112);
  g.fillStyle='#CFE3D6';g.font=`500 30px ${sans}`;g.fillText('Live cricket scores',202,158);
  // tournament + stage
  g.textAlign='center';g.fillStyle='#FFFFFF';
  let tn=APP.tournament.name||'Cricket';fitFont(g,tn,W-140,58,'700',serif);g.fillText(tn,W/2,290);
  let stage=(m.matchType||'League').toUpperCase()+(m.status==='live'?'  ·  LIVE':'');
  g.font=`700 30px ${sans}`;let sw=g.measureText(stage).width+60;
  g.fillStyle=m.status==='live'?'#C0392B':'#E9C46A';g.beginPath();g.roundRect?g.roundRect(W/2-sw/2,335,sw,56,28):g.rect(W/2-sw/2,335,sw,56);g.fill();
  g.fillStyle=m.status==='live'?'#FFFFFF':'#0A3B25';g.fillText(stage,W/2,364);
  // innings rows
  let y=440;
  m.innings.slice(0,6).forEach(inn=>{
    let h=inn.super?96:150;
    g.fillStyle=inn.super?'rgba(255,255,255,.10)':'rgba(255,255,255,.95)';
    g.beginPath();g.roundRect?g.roundRect(70,y,W-140,h,24):g.rect(70,y,W-140,h);g.fill();
    g.textAlign='left';g.fillStyle=inn.super?'#FFFFFF':'#0A3B25';
    let nm=(inn.super?'⚡ '+soName(m,inn)+' · ':'')+rawTeamName(inn.battingTeamId);
    fitFont(g,nm,560,inn.super?34:44,'700',sans);g.fillText(nm,110,y+(inn.super?h/2:h/2-20));
    if(!inn.super){g.fillStyle='#55665B';g.font=`500 28px ${sans}`;g.fillText(`${ov(inn)} of ${innOvers(inn)} overs`,110,y+h/2+30);}
    g.textAlign='right';g.fillStyle=inn.super?'#FFFFFF':'#0A3B25';g.font=`800 ${inn.super?44:76}px ${sans}`;g.fillText(scTxt(inn),W-110,y+h/2+4);
    y+=h+22;
  });
  // result or chase
  let res=m.resultText||'';let cur=m.innings[m.currentInnings||0];
  if(!res&&m.status==='live'&&cur&&cur.target)res=`Need ${Math.max(0,cur.target-cur.runs)} from ${Math.max(0,innBalls(cur)-cur.legalBalls)} balls`;
  if(res){g.textAlign='center';g.fillStyle='#F3D98B';fitFont(g,'🏆 '+res,W-140,44,'800',sans);g.fillText((m.status==='live'?'🎯 ':'🏆 ')+res,W/2,y+40);y+=100;}
  // top performers (main innings)
  let bb=null,bo=null;
  mainInns(m).forEach(inn=>{Object.values(inn.batsmen||{}).forEach(b=>{if(b.status!=='yet'&&(!bb||b.runs>bb.runs))bb=b;});
    Object.values(inn.bowlers||{}).forEach(b=>{if(hasBowled(b)&&(!bo||b.wickets>bo.wickets||(b.wickets===bo.wickets&&b.runs<bo.runs)))bo=b;});});
  g.textAlign='center';g.fillStyle='#FFFFFF';
  if(bb&&y<H-200){fitFont(g,`🏏 ${bb.name}  ${bb.runs}${bb.status==='out'?'':'*'} (${bb.balls})`,W-160,36,'600',sans);g.fillText(`🏏 ${bb.name}  ${bb.runs}${bb.status==='out'?'':'*'} (${bb.balls})`,W/2,y+10);y+=60;}
  if(bo&&y<H-150){fitFont(g,`🎳 ${bo.name}  ${bo.wickets}/${bo.runs} (${bowlerOvTxt(bo)})`,W-160,36,'600',sans);g.fillText(`🎳 ${bo.name}  ${bo.wickets}/${bo.runs} (${bowlerOvTxt(bo)})`,W/2,y+10);y+=60;}
  let pom=m.motm&&playerNameInMatch(m,m.motm);
  if(pom&&m.status==='completed'&&y<H-120){g.fillStyle='#F3D98B';fitFont(g,'🏅 Player of the Match: '+pom,W-160,32,'600',sans);g.fillText('🏅 Player of the Match: '+pom,W/2,y+10);}
  g.fillStyle='#CFE3D6';g.font=`500 28px ${sans}`;g.fillText(`${venueTxt(m)==='Venue not set'?'':venueTxt(m)+' · '}${m.date||''}  ·  stumply.pages.dev`,W/2,H-60);
  let blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob){toast('Could not make the image','warn');return;}
  let fname=('stumply-'+rawTeamName(m.teamAId)+'-vs-'+rawTeamName(m.teamBId)).replace(/[^A-Za-z0-9-]+/g,'-').slice(0,60)+'.png';
  let file=new File([blob],fname,{type:'image/png'});
  let link=(getBaseUrl()||'https://stumply.pages.dev/')+(APP.tid?'?t='+encodeURIComponent(APP.tid):'');
  if(navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:rawTeamName(m.teamAId)+' vs '+rawTeamName(m.teamBId),text:(m.resultText?m.resultText+' — ':'')+link});return;}
    catch(e){if(e&&e.name==='AbortError')return;}
  }
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);
  toast('🖼 Image saved — share it from your downloads');
}

// ── Super Over: a tied match can be decided with one over each ─────────────
// ══════════════════════════════════════════════════════════════════════════
//  WHATSAPP TEXT UPDATES
// ══════════════════════════════════════════════════════════════════════════
function watchLink(){let b=getBaseUrl(),t=APP.tid||APP.viewTid;return b&&t?b+'?t='+encodeURIComponent(t):'';}
function shareWA(txt){
  let url='https://wa.me/?text='+encodeURIComponent(txt);
  let w=null;try{w=window.open(url,'_blank');}catch(e){}
  if(w){try{w.opener=null;}catch(e){}}else location.href=url;
}
function waHead(m){
  let L=[`🏏 *${rawTeamName(m.teamAId)} vs ${rawTeamName(m.teamBId)}*`];
  let sub=[];if(m.matchType&&m.matchType!=='League')sub.push(m.matchType);
  if(APP.tournament.name&&!APP.tournament.single)sub.push(APP.tournament.name);
  if(sub.length)L.push(sub.join(' · '));
  return L;
}
function waBat(b){return `${b.name} ${b.runs} (${b.balls})`;}
function waLiveText(m){
  let L=waHead(m),inn=m.innings[m.currentInnings];
  (m.innings||[]).forEach(i=>L.push(`${i.super?'⚡ '+soName(m,i)+' · ':''}${rawTeamName(i.battingTeamId)}: *${scTxt(i)}* (${ov(i)} ov)`));
  if(m.status==='completed'){
    if(m.resultText)L.push('🏆 '+m.resultText);
    let mo=m.motm&&playerNameInMatch(m,m.motm);if(mo)L.push('🏅 Player of the Match: '+mo);
  }else if(inn&&!inn.completed&&m.status==='live'){
    let bats=[inn.striker,inn.nonStriker].filter(id=>id&&inn.batsmen[id]).map(id=>waBat(inn.batsmen[id]));
    if(bats.length)L.push('Batting: '+bats.join(' & '));
    let bw=inn.currentBowler&&inn.bowlers[inn.currentBowler];
    if(bw)L.push(`Bowling: ${bw.name} ${bw.wickets}/${bw.runs} (${bowlerOvTxt(bw)} ov)`);
    if(inn.target){let need=Math.max(0,inn.target-inn.runs),bl=innBalls(inn)-inn.legalBalls;L.push(`🎯 ${rawTeamName(inn.battingTeamId)} need ${plural(need,'run')} from ${plural(bl,'ball')}`);}
  }else if(m.status==='live')L.push('⏸ Innings break');
  else L.push(`📅 ${m.date||''} · 📍 ${venueTxt(m)}`);
  let lk=watchLink();if(lk)L.push('',(m.status==='live'?'📺 Watch live: ':'📊 Full scorecard: ')+lk);
  return L.join('\n');
}
function waScorecardText(m){
  let L=waHead(m);
  L.push(`📅 ${m.date||''} · 📍 ${venueTxt(m)}`);
  if(m.toss)L.push(`🪙 ${rawTeamName(m.toss.winner)} won the toss and chose to ${m.toss.decision==='bat'?'bat':'bowl'}`);
  (m.innings||[]).forEach(inn=>{
    L.push('',`*${rawTeamName(inn.battingTeamId)} — ${innLabel(inn,m)}: ${scTxt(inn)} (${ov(inn)} ov)*`);
    Object.values(inn.batsmen||{}).forEach(b=>{if(!b||b.status==='yet')return;
      let how=b.status==='batting'?'not out':b.status==='retired'?'retired hurt':dispDism(b.dismissal);
      L.push(`${b.name} ${b.runs} (${b.balls})${b.fours||b.sixes?` ${b.fours||0}x4 ${b.sixes||0}x6`:''} — ${how}`);});
    let e=inn.extras||{};L.push(`Extras ${e.total||0} (w ${e.wide||0}, nb ${e.noball||0}, b ${e.bye||0}, lb ${e.legbye||0})`);
    let dnb=Object.values(inn.batsmen||{}).filter(b=>b&&b.status==='yet').map(b=>b.name);
    if(dnb.length&&(inn.completed||m.status==='completed'))L.push('Did not bat: '+dnb.join(', '));
    if((inn.fallOfWickets||[]).length)L.push('Fall of wickets: '+inn.fallOfWickets.map(f=>`${f.score}/${f.wicket} (${f.batsman})`).join(', '));
    let bw=Object.values(inn.bowlers||{}).filter(hasBowled);
    if(bw.length){L.push('Bowling:');bw.forEach(b=>L.push(`${b.name} ${bowlerOvTxt(b)}-${b.maidens||0}-${b.runs||0}-${b.wickets||0}`));}
  });
  if(m.resultText)L.push('','🏆 *'+m.resultText+'*');
  let mo=m.motm&&playerNameInMatch(m,m.motm);if(mo)L.push('🏅 Player of the Match: '+mo);
  let lk=watchLink();if(lk)L.push('','📊 '+lk);
  return L.join('\n');
}
function findMatch(mid){return APP.matches.find(x=>x.id===mid)||(APP.liveMatch&&APP.liveMatch.id===mid?APP.liveMatch:null);}
function shareLiveWA(mid){let m=findMatch(mid);if(m)shareWA(waLiveText(m));}
function shareScorecardWA(mid){let m=findMatch(mid);if(m)shareWA(waScorecardText(m));}
let _awTxt='';
function shareAwards(){if(!_awTxt){toast('No awards yet','warn');return;}
  let lk=watchLink();shareWA(_awTxt+(lk?'\n\n📊 '+lk:''));}

// ══════════════════════════════════════════════════════════════════════════
//  MATCH GRAPHS — worm, Manhattan, partnerships (built from the ball labels)
// ══════════════════════════════════════════════════════════════════════════
const G_COL=['#1B7A4B','#2A66B3'],G_WK='#A1261D';
function ballRuns(l){
  l=String(l||'');let w=/W$/.test(l);if(w)l=l.slice(0,-1);
  let x=/wd|nb/.test(l),n;
  if(/^L?B\d/.test(l))n=parseInt(l.replace(/^L?B/,''))||0;
  else if(x)n=w?(parseInt(l)||0)+1:(parseInt(l)||1);
  else n=parseInt(l)||0;
  return {r:n,w:w?1:0};
}
function overSeries(inn){
  let ovs=(inn.pastOvers||[]).slice();if((inn.thisOver||[]).length)ovs.push(inn.thisOver);
  let out=ovs.map(o=>{let r=0,w=0;(o||[]).forEach(l=>{let b=ballRuns(l);r+=b.r;w+=b.w;});return {r,w};});
  let sum=out.reduce((a,o)=>a+o.r,0);
  if(out.length&&sum!==inn.runs)out[out.length-1].r=Math.max(0,out[out.length-1].r+(inn.runs-sum));
  return out;
}
function niceMax(v){if(v<=10)return 10;let p=Math.pow(10,Math.floor(Math.log10(v))),s=[1,2,2.5,5,10].find(k=>k*p>=v);return s*p;}
function gTip(el){let b=el.closest('.g-box');let t=b&&b.querySelector('.g-tip');if(t)t.textContent=el.getAttribute('data-tip')||'';
  b&&b.querySelectorAll('.g-on').forEach(x=>x.classList.remove('g-on'));el.classList.add('g-on');}
function gLegend(ins){return `<div class="g-leg">${ins.map((i,k)=>`<span><i style="background:${G_COL[k]}"></i>${esc(rawTeamName(i.battingTeamId))} ${scTxt(i)} (${ov(i)})</span>`).join('')}<span><i class="g-wk"></i>Wicket</span></div>`;}
function wormSVG(m,ins){
  let W=340,H=190,L=32,R=12,T=12,B=26,pw=W-L-R,ph=H-T-B;
  let maxO=Math.max(1,...ins.map(i=>innOvers(i)));
  let maxR=niceMax(Math.max(...ins.map(i=>i.runs||0),1));
  let X=o=>L+o/maxO*pw,Y=r=>T+ph-r/maxR*ph;
  let g='';
  for(let k=0;k<=4;k++){let v=maxR*k/4,y=Y(v);g+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="g-grid"/><text x="${L-5}" y="${y+3}" class="g-ax" text-anchor="end">${Math.round(v)}</text>`;}
  let step=maxO<=10?1:maxO<=20?2:maxO<=50?5:10;
  for(let o=0;o<=maxO;o+=step)g+=`<text x="${X(o)}" y="${H-8}" class="g-ax" text-anchor="middle">${o}</text>`;
  let ser=ins.map(i=>overSeries(i));
  ins.forEach((inn,k)=>{
    let pts=[[0,0]],c=0;ser[k].forEach((o,ix)=>{c+=o.r;let x=ix+1;if(ix===ser[k].length-1&&inn.legalBalls%6&&ix===Math.floor(inn.legalBalls/6))x=inn.legalBalls/6;pts.push([x,c]);});
    g+=`<polyline fill="none" stroke="${G_COL[k]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/>`;
    (inn.fallOfWickets||[]).forEach(f=>{let pr=String(f.over).split('.'),x=(+pr[0]||0)+(+pr[1]||0)/6;
      g+=`<circle cx="${X(x).toFixed(1)}" cy="${Y(f.score).toFixed(1)}" r="4.5" fill="${G_WK}" stroke="#fff" stroke-width="2"><title>${esc(f.batsman)} out at ${f.score}/${f.wicket}</title></circle>`;});
  });
  let hit='';
  for(let o=0;o<maxO;o++){
    let parts=ins.map((inn,k)=>{let s=ser[k];if(o>=s.length)return null;let c=0,w=0;for(let j=0;j<=o;j++){c+=s[j].r;w+=s[j].w;}return `${rawTeamName(inn.battingTeamId)} ${c}/${w}`;}).filter(Boolean);
    if(!parts.length)continue;
    hit+=`<rect x="${X(o)}" y="${T}" width="${pw/maxO}" height="${ph}" fill="transparent" class="g-hit" data-tip="After over ${o+1}: ${esc(parts.join(' · '))}" onclick="gTip(this)" onmouseenter="gTip(this)"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="g-svg" role="img" aria-label="Worm chart: runs after each over">${g}${hit}</svg>`;
}
function manhattanSVG(m,ins){
  let W=340,H=190,L=32,R=8,T=14,B=26,pw=W-L-R,ph=H-T-B;
  let ser=ins.map(i=>overSeries(i));
  let maxO=Math.max(1,...ins.map(i=>innOvers(i)),...ser.map(s=>s.length));
  let maxR=niceMax(Math.max(6,...ser.flat().map(o=>o.r)));
  let Y=r=>T+ph-r/maxR*ph,slot=pw/maxO,gap=2,bw=Math.max(2,(slot-gap*(ins.length+1))/ins.length);
  let g='';
  for(let k=0;k<=4;k++){let v=maxR*k/4,y=Y(v);g+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="g-grid"/><text x="${L-5}" y="${y+3}" class="g-ax" text-anchor="end">${Math.round(v)}</text>`;}
  let step=maxO<=10?1:maxO<=20?2:maxO<=50?5:10;
  for(let o=1;o<=maxO;o+=(o===1&&step>1?step-1:step))g+=`<text x="${L+slot*(o-0.5)}" y="${H-8}" class="g-ax" text-anchor="middle">${o}</text>`;
  ser.forEach((s,k)=>s.forEach((o,ix)=>{
    let x=L+slot*ix+gap+k*(bw+gap),h=Math.max(o.r?1.5:0,ph-(Y(o.r)-T)),y=T+ph-h;
    let tip=`Over ${ix+1}: ${rawTeamName(ins[k].battingTeamId)} ${plural(o.r,'run')}${o.w?', '+plural(o.w,'wicket'):''}`;
    g+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(2,bw/2)}" fill="${G_COL[k]}" class="g-bar" data-tip="${esc(tip)}" onclick="gTip(this)" onmouseenter="gTip(this)"/>`;
    for(let j=0;j<Math.min(o.w,3);j++)g+=`<circle cx="${(x+bw/2).toFixed(1)}" cy="${(y-6-j*9).toFixed(1)}" r="3.5" fill="${G_WK}" stroke="#fff" stroke-width="1.5" pointer-events="none"/>`;
  }));
  g+=`<line x1="${L}" x2="${W-R}" y1="${T+ph}" y2="${T+ph}" class="g-base"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="g-svg" role="img" aria-label="Manhattan chart: runs in each over">${g}</svg>`;
}
function partnershipsHTML(m,ins){
  const ord=n=>n+(['th','st','nd','rd'][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);
  return ins.map((inn,k)=>{
    let list=(inn.partnerships||[]).map((p,i)=>({...p,lbl:ord(i+1)+' wkt'}));
    let cp=inn.currentPartnership;
    if(cp&&(cp.runs||cp.balls)){let names=[inn.striker,inn.nonStriker].filter(id=>id&&inn.batsmen[id]).map(id=>inn.batsmen[id].name);list.push({...cp,a:names[0],b:names[1],lbl:ord(list.length+1)+' wkt',now:!inn.completed});}
    if(!list.length)return '';
    let mx=Math.max(...list.map(p=>p.runs||0),1);
    return `<div class="g-pt"><div class="g-pth"><i style="background:${G_COL[k]}"></i>${esc(rawTeamName(inn.battingTeamId))}</div>${list.map(p=>`<div class="g-prow"><span class="g-pl">${p.lbl}</span><div class="g-pmid"><div class="g-pn">${p.a?esc(p.a)+(p.b?' & '+esc(p.b):''):''}${p.now?' <em>(batting)</em>':''}</div><div class="g-ptrack"><div style="width:${Math.max(2,(p.runs||0)/mx*100)}%;background:${G_COL[k]}"></div></div></div><span class="g-pv"><b>${p.runs||0}</b> (${p.balls||0})</span></div>`).join('')}</div>`;
  }).join('');
}
function graphsHTML(m){
  let ins=mainInns(m).filter(i=>i.legalBalls>0||(i.thisOver||[]).length).slice(0,2);
  if(!ins.length)return '';
  return `<div class="card g-card"><div class="ch">📈 Match graphs</div>
    <div class="g-box"><div class="g-t">Worm — runs after each over</div>${gLegend(ins)}${wormSVG(m,ins)}<div class="g-tip">Tap the chart to see the score after an over.</div></div>
    <div class="g-box"><div class="g-t">Manhattan — runs in each over</div>${gLegend(ins)}${manhattanSVG(m,ins)}<div class="g-tip">Tap a bar to see that over. Red dots are wickets.</div></div>
    <div class="g-box"><div class="g-t">Partnerships</div>${partnershipsHTML(m,ins)}</div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════════════
//  LIVE-STREAM OVERLAY  (?t=<id>&overlay=1, optional &pos=top, &bg=green)
// ══════════════════════════════════════════════════════════════════════════
const OVL=(()=>{try{let p=new URLSearchParams(location.search);if(p.get('overlay')!=='1'||!p.get('t'))return null;
  return {pos:p.get('pos')==='top'?'top':'bottom',bg:p.get('bg')==='green'};}catch(e){return null;}})();
if(OVL){document.documentElement.classList.add('ovl');if(OVL.bg)document.documentElement.classList.add('ovl-green');}
function overlayLink(){let b=getBaseUrl();return b&&APP.tid?b+'?t='+encodeURIComponent(APP.tid)+'&overlay=1':'';}
function copyOverlayLink(){let v=overlayLink();if(!v){toast('Save tournament first');return;}
  let el=document.getElementById('ovl-url');if(el)el.value=v;
  navigator.clipboard.writeText(v).then(()=>toast('✅ Overlay link copied!')).catch(()=>{if(el){el.select();document.execCommand('copy');}toast('✅ Copied!');});}
function openOverlayLink(){let v=overlayLink();if(!v){toast('Save tournament first');return;}window.open(v+'&bg=green','_blank');}
function teamCode(id){let t=APP.teams.find(x=>x.id===id);return t?(t.code||t.name.slice(0,3)).toUpperCase():'';}
function ovlBall(b){b=String(b);let c=/W$/.test(b)?'ovbw':/^6/.test(b)&&!/wd|nb|B/.test(b)?'ovb6':/^4/.test(b)&&!/wd|nb|B/.test(b)?'ovb4':'';return `<span class="ov-ball ${c}">${esc(b==='·'?'0':b)}</span>`;}
function renderOverlay(){
  if(!OVL)return;
  let el=document.getElementById('ovl');
  if(!el){el=document.createElement('div');el.id='ovl';el.setAttribute('data-noi18n','1');document.body.appendChild(el);}
  el.className='ovl-'+OVL.pos;
  const T=id=>esc(rawTeamName(id)),C=id=>esc(teamCode(id));
  const tag=(m,extra)=>{let a=[esc(APP.tournament.name||'Stumply')];if(m&&m.matchType&&m.matchType!=='League')a.push(esc(m.matchType));if(extra)a.push(extra);return `<div class="ov-tag">${a.join(' · ')}</div>`;};
  const info=parts=>`<div class="ov-info">${parts.filter(Boolean).map(([k,v])=>`<span><em>${k}</em> ${v}</span>`).join('')}</div>`;
  const box=(i,small)=>`<div class="ov-score"><span class="ov-team">${C(i.battingTeamId)}</span><span class="ov-runs">${i.runs}-${i.wickets}</span><span class="ov-ovs">${ov(i)}${small?'':'<small> / '+innOvers(i)+' ov</small>'}</span></div>`;
  const toss=m=>m&&m.toss?['Toss',`${C(m.toss.winner)} chose to ${m.toss.decision==='bat'?'bat':'bowl'}`]:null;
  let m=APP.matches.find(x=>x.status==='live');
  let inn=m&&m.innings[m.currentInnings];
  if(!m||!inn){
    let last=m?null:lastCompletedMatch();
    if(last&&last.resultText){
      let ins=mainInns(last);
      el.innerHTML=tag(last,'Result')+`<div class="ovb">${ins.map(i=>box(i,true)).join('')}<div class="ov-mid">🏆 ${esc(last.resultText)}</div></div>`
        +info([last.motm&&playerNameInMatch(last,last.motm)?['Player of the match',esc(playerNameInMatch(last,last.motm))]:null]);
    }else el.innerHTML=tag(m)+`<div class="ovb"><div class="ov-mid">${m?`${T(m.teamAId)} v ${T(m.teamBId)} · Match starting soon`:'Live scores coming up'}</div></div>`+info([toss(m)]);
    return;
  }
  const innName=i=>i.super?esc(soName(m,i)):(i.number===1?'1st innings':'2nd innings');
  // Between innings (or before the openers walk out): last score and what comes next
  let prev=inn.completed?inn:(!inn.striker&&inn.legalBalls===0?m.innings[m.currentInnings-1]:null);
  if(prev||(!inn.striker&&inn.legalBalls===0)){
    if(prev){
      let chase=prev.number%2===1,next=m.innings[prev.number]||{},tgt=prev.runs+1,overs=next.maxBalls?Math.round(next.maxBalls/6):innOvers(prev);
      el.innerHTML=tag(m,chase?'Innings break':'Innings complete')+`<div class="ovb">${box(prev)}<div class="ov-mid">${chase?`${T(prev.bowlingTeamId)} need ${plural(tgt,'run')} to win from ${plural(overs,'over')}`:'Innings complete'}</div></div>`
        +info([chase?['Target',tgt]:null,chase?['Required rate',(tgt/Math.max(1,overs)).toFixed(2)]:null,['Extras',prev.extras.total||0],(prev.fallOfWickets||[]).length?['Fall of wickets',prev.fallOfWickets.map(f=>`${f.score}/${f.wicket}`).join(' ')]:null]);
    }else el.innerHTML=tag(m)+`<div class="ovb"><div class="ov-mid">${T(m.teamAId)} v ${T(m.teamBId)} · Match starting soon</div></div>`+info([toss(m)]);
    return;
  }
  let bat=id=>{let b=id&&inn.batsmen[id];if(!b)return '';let x=[];if(b.fours)x.push(b.fours+'×4');if(b.sixes)x.push(b.sixes+'×6');
    return `<div class="ov-row${id===inn.striker?' ov-on':''}"><span class="ov-nm">${esc(b.name)}</span><b>${b.runs}</b><i>(${b.balls})</i>${x.length?`<small>${x.join(' ')}</small>`:''}</div>`;};
  let bw=inn.currentBowler&&inn.bowlers[inn.currentBowler];
  let cur=(inn.thisOver||[]).length,balls=cur?inn.thisOver:((inn.pastOvers||[]).slice(-1)[0]||[]);
  let crr=inn.legalBalls?(inn.runs*6/inn.legalBalls).toFixed(2):'0.00';
  let parts=[];
  if(inn.target){
    let need=Math.max(0,inn.target-inn.runs),bl=Math.max(0,innBalls(inn)-inn.legalBalls);
    parts.push(['Target',inn.target],['Need',`${need} from ${plural(bl,'ball')}`],['Required rate',bl?(need*6/bl).toFixed(2):'—'],['Run rate',crr]);
  }else{
    parts.push(['Run rate',crr]);
    if(inn.legalBalls>=6&&!inn.super)parts.push(['Projected',Math.round(inn.runs/inn.legalBalls*innBalls(inn))]);
  }
  let cp=inn.currentPartnership||{runs:0,balls:0};parts.push(['Partnership',`${cp.runs} (${cp.balls})`]);
  let fw=(inn.fallOfWickets||[]).slice(-1)[0];
  if(fw){let lb=Object.values(inn.batsmen||{}).find(b=>b.name===fw.batsman&&b.status==='out');parts.push(['Last wicket',`${esc(fw.batsman)} ${lb?lb.runs+' ('+lb.balls+')':''} · ${fw.score}/${fw.wicket}`]);}
  parts.push(['Extras',inn.extras.total||0]);
  if(!inn.target)parts.push(toss(m));
  let lastLbl=String(balls[balls.length-1]||'');
  let freeHit=cur&&/nb/.test(lastLbl)&&!/W$/.test(lastLbl)&&!APP.tournament.noFH;
  el.innerHTML=tag(m,`${innName(inn)} · ${T(inn.battingTeamId)} v ${T(inn.bowlingTeamId)}`)+`<div class="ovb">
    ${box(inn)}
    <div class="ov-bat">${bat(inn.striker)}${bat(inn.nonStriker)}${!inn.nonStriker&&lmsAlone(inn)?'<div class="ov-row"><i>Last man stands</i></div>':''}</div>
    <div class="ov-bwl">${bw?`<div class="ov-row"><span class="ov-nm">${esc(bw.name)}</span></div><div class="ov-row"><b>${bw.wickets}-${bw.runs}</b><i>(${bowlerOvTxt(bw)})</i><small>Econ ${econTxt(bw.runs,bw.overs,bw.balls)}</small></div>`:''}</div>
    <div class="ov-balls"><span class="ov-blbl">${cur?'This over':'Last over'}</span>${balls.slice(-8).map(ovlBall).join('')}</div>
  </div>`+(freeHit?'<div class="ov-fh">FREE HIT</div>':'')+info(parts);
}

// ══════════════════════════════════════════════════════════════════════════
//  SPOKEN SCORE (the phone's own voice)
// ══════════════════════════════════════════════════════════════════════════
let _spkKey=null;
function speakOn(){return lsGet('stumply_speak')==='1'&&('speechSynthesis' in window);}
function say(txt){try{let u=new SpeechSynthesisUtterance(txt);u.lang='en-IN';u.rate=1;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}
function toggleSpeak(){
  if(!('speechSynthesis' in window)){toast('This browser cannot speak the score','warn');return;}
  let on=lsGet('stumply_speak')!=='1';lsSet('stumply_speak',on?'1':'0');
  if(on)say('Score updates on');else{try{speechSynthesis.cancel();}catch(e){}}
  toast(on?'🔊 Score will be spoken after every ball':'🔇 Spoken score off');
  renderLive();
}
function speakBtn(){return `<button class="bsm" onclick="toggleSpeak()">${speakOn()?'🔊 Speak score: On':'🔇 Speak score: Off'}</button>`;}
function spokenDism(d){return String(d||'').replace(/\bc & b\b/,'caught and bowled').replace(/\bc\b/,'caught').replace(/\blbw b\b/,'L B W, bowled').replace(/\bst\b/,'stumped').replace(/\bhit wkt b\b/,'hit wicket, bowled').replace(/\bb\b/,'bowled');}
function speakTick(m,inn){
  if(!m||!inn){return;}
  let key=[m.id,m.currentInnings,inn.runs,inn.wickets,inn.legalBalls,(inn.extras&&inn.extras.total)||0,inn.completed?1:0].join('|');
  let prev=_spkKey;_spkKey=key;
  if(!speakOn()||prev===null||prev===key)return;
  let p=prev.split('|'),team=rawTeamName(inn.battingTeamId),score=`${inn.runs} for ${inn.wickets}`;
  if(p[0]!==m.id)return;
  if(+p[1]!==m.currentInnings){if(inn.target)say(`${team} need ${inn.target} to win`);return;}
  if(+p[2]>inn.runs||+p[3]>inn.wickets||+p[4]>inn.legalBalls){say('Last ball undone. '+team+' '+score);return;}
  let c=(inn.log||[])[inn.log.length-1],ev='';
  if(c){if(c.e==='out')ev='Out! '+spokenDism(c.d);else if(c.e==='rh'||c.e==='rb')ev='';else ev=cmText(c).t.replace(/[^\p{L}\p{N}!+ ]/gu,'').trim().replace(/^no run$/,'Dot ball');}
  let txt=(ev?ev+'. ':'')+team+' '+score+'.';
  if(inn.completed)txt+=' End of innings.';
  else if(inn.legalBalls>0&&inn.legalBalls%6===0&&+p[4]!==inn.legalBalls)txt+=` End of over ${inn.legalBalls/6}.`;
  if(inn.target&&!inn.completed){let need=Math.max(0,inn.target-inn.runs),bl=innBalls(inn)-inn.legalBalls;txt+=` Need ${need} from ${bl} balls.`;}
  say(txt);
}
function speakResult(last){
  if(!last)return;let key='done|'+last.id,prev=_spkKey;_spkKey=key;
  if(!speakOn()||prev===null||prev===key||!last.resultText)return;
  if(prev.split('|')[0]===last.id)say(last.resultText);
}

// ══════════════════════════════════════════════════════════════════════════
//  FAN POLL — "who will win?" (viewers vote with a free anonymous sign-in)
// ══════════════════════════════════════════════════════════════════════════
const LS_ANON='stumply_anon';
let _anon=null,_poll={mid:null,votes:{},at:0,busy:false};
async function anonToken(){
  if(!_anon)_anon=safeParse(lsGet(LS_ANON),null);
  if(_anon&&_anon.idToken&&Date.now()<_anon.exp)return _anon;
  if(_anon&&_anon.refreshToken){
    let r;
    try{r=await fetch(TOKEN_URL+'?key='+encodeURIComponent(CFG.apiKey),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(_anon.refreshToken)});}
    catch(e){throw new Error('NETWORK');}
    let j=null;try{j=await r.json();}catch(e){}
    if(r.ok&&j&&j.id_token){_anon.idToken=j.id_token;_anon.refreshToken=j.refresh_token||_anon.refreshToken;_anon.exp=Date.now()+(parseInt(j.expires_in)||3600)*1000-60000;lsSet(LS_ANON,JSON.stringify(_anon));return _anon;}
  }
  let j=await authCall('signUp',{returnSecureToken:true});
  _anon={uid:j.localId,idToken:j.idToken,refreshToken:j.refreshToken,exp:Date.now()+(parseInt(j.expiresIn)||3600)*1000-60000};
  lsSet(LS_ANON,JSON.stringify(_anon));return _anon;
}
function pollTid(){return APP.tid||APP.viewTid;}
function pollMyUid(){if(AUTH)return AUTH.uid;let a=_anon||safeParse(lsGet(LS_ANON),null);return a&&a.uid;}
function pollOpen(m){return m.status!=='completed'&&(m.innings||[]).length<2;}
async function loadPoll(mid,force){
  let tid=pollTid();if(!tid||!mid)return;
  if(_poll.mid!==mid)_poll={mid,votes:{},at:0,busy:false};
  if(_poll.busy||(!force&&Date.now()-_poll.at<45000))return;
  _poll.busy=true;
  try{let v=await dbReq('GET','polls/'+tid+'/'+mid);if(_poll.mid===mid)_poll.votes=(v&&typeof v==='object')?v:{};}catch(e){}
  finally{_poll.busy=false;_poll.at=Date.now();}
  renderPoll();
}
function pollHTML(m){
  let A=m.teamAId,B=m.teamBId,v=_poll.mid===m.id?_poll.votes:{},c={};c[A]=0;c[B]=0;
  Object.values(v).forEach(x=>{if(x===A||x===B)c[x]++;});
  let tot=c[A]+c[B],uid=pollMyUid(),mine=uid&&v[uid],open=pollOpen(m);
  let pa=tot?Math.round(c[A]*100/tot):0,pct={};pct[A]=pa;pct[B]=tot?100-pa:0;
  let btn=id=>`<button class="pl-opt${mine===id?' on':''}" ${open?`onclick="castVote('${m.id}','${id}')"`:'disabled'}><span class="pl-bar" style="width:${pct[id]}%"></span><span class="pl-n">${mine===id?'✓ ':''}${esc(rawTeamName(id))}</span><span class="pl-p">${tot?pct[id]+'%':''}</span></button>`;
  return `<div class="card pl-card"><div class="ch">🗳 Fan poll: who will win?</div>${btn(A)}${btn(B)}
    <div class="pl-foot">${plural(tot,'vote')}${open?(mine?' · Tap the other team to change your vote':' · Tap a team to vote'):' · Voting closed'}</div></div>`;
}
function renderPoll(){
  let b=document.getElementById('poll-box');if(!b)return;
  let m=findMatch(b.getAttribute('data-mid'));if(m)b.innerHTML=pollHTML(m);
}
function pollBox(m){
  if(!m||!m.teamAId||!m.teamBId)return '';
  setTimeout(()=>loadPoll(m.id),0);
  return `<div id="poll-box" data-mid="${esc(m.id)}">${pollHTML(m)}</div>`;
}
async function castVote(mid,team){
  let m=findMatch(mid);if(!m||!pollOpen(m)){toast('Voting is closed','warn');renderPoll();return;}
  let tid=pollTid();if(!tid)return;
  try{
    let uid,tok;
    if(AUTH){uid=AUTH.uid;tok=await getToken();}
    else{let a=await anonToken();uid=a.uid;tok=a.idToken;}
    let r;
    try{r=await fetch(DB_URL+'/polls/'+tid+'/'+mid+'/'+uid+'.json?auth='+encodeURIComponent(tok),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(team)});}
    catch(e){throw new Error('NETWORK');}
    if(!r.ok)throw new Error('HTTP_'+r.status);
    if(_poll.mid===mid)_poll.votes[uid]=team;
    renderPoll();toast('🗳 Vote saved: '+rawTeamName(team));
    loadPoll(mid,true);
  }catch(e){
    let msg=String(e&&e.message||'');
    if(/ADMIN_ONLY|OPERATION_NOT_ALLOWED|CONFIGURATION_NOT_FOUND/.test(msg))toast('Voting is not switched on yet','warn');
    else if(msg==='NETWORK')toast('No connection — try again','warn');
    else toast('Could not save your vote — try again','warn');
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  MATCH RULES — last man stands, no LBW, free hit
// ══════════════════════════════════════════════════════════════════════════
// Last man stands: with nobody left to come in, the last batter bats on alone
function lmsAlone(inn){
  if(!inn||!inn.lms)return false;
  return Object.values(inn.batsmen||{}).filter(b=>b&&b.status!=='out').length<=1;
}
function rulesText(){
  let r=[];if(APP.tournament.lms)r.push('Last man stands');if(APP.tournament.noLBW)r.push('No LBW');if(APP.tournament.noFH)r.push('No free hit');
  return r.join(' · ');
}

// ══════════════════════════════════════════════════════════════════════════
//  ENTRY FEES (owner only)
// ══════════════════════════════════════════════════════════════════════════
function rupees(n){return '₹'+(Math.round(+n||0)).toLocaleString('en-IN');}
function feeNum(v){let n=Math.round(+String(v).replace(/[^\d.]/g,'')||0);return Math.max(0,Math.min(10000000,n));}
function setFee(v){if(APP.role!=='admin'||ownerOnly())return;APP.tournament.fee=feeNum(v);saveState();renderFees();}
function setPaid(id,v){if(APP.role!=='admin'||ownerOnly())return;let t=APP.teams.find(x=>x.id===id);if(!t)return;t.paid=feeNum(v);saveState();renderFees();toast('💰 Saved');}
function renderFees(){
  let el=document.getElementById('fee-list');if(!el)return;
  let fee=+APP.tournament.fee||0,fa=document.getElementById('fee-amt');
  if(fa&&document.activeElement!==fa)fa.value=fee||'';
  if(!APP.teams.length){el.innerHTML='<p style="color:var(--dim);font-size:13px">Add teams first.</p>';return;}
  let got=0,paidN=0;
  let rows=APP.teams.map(t=>{
    let p=+t.paid||0;got+=p;if(fee&&p>=fee)paidN++;
    let st=fee&&p>=fee?'<span class="tag tg">Paid</span>':p>0?'<span class="tag ta">Part paid</span>':'<span class="tag tr">Not paid</span>';
    return `<tr><td style="font-weight:600">${esc(t.name)}</td><td><input class="ifield" type="number" min="0" inputmode="numeric" value="${p||''}" placeholder="0" aria-label="Amount paid by ${esc(t.name)}" onchange="setPaid('${t.id}',this.value)" style="width:100px;padding:6px 8px"></td><td>${st}</td><td>${fee&&p<fee?`<button class="bsm bgld" style="white-space:nowrap" onclick="setPaid('${t.id}',${fee})">✓ Mark paid</button>`:''}</td></tr>`;
  }).join('');
  let exp=fee*APP.teams.length;
  el.innerHTML=`<div class="fee-sum">
      <div><b>${rupees(got)}</b><span>Collected</span></div>
      ${fee?`<div><b>${rupees(Math.max(0,exp-got))}</b><span>Still to collect</span></div><div><b>${paidN} / ${APP.teams.length}</b><span>Teams paid</span></div>`:''}
    </div>
    <div class="tblwrap"><table><thead><tr><th>Team</th><th>Paid (₹)</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function canSuperOver(m){
  return !!(m&&APP.role==='admin'&&m.status==='completed'&&m.winner==='tie'&&m.innings.length>=2&&m.innings.length%2===0
    &&m.innings.length<20&&!APP.matches.some(x=>x.status==='live'));
}
function startSuperOver(mid){
  let m=APP.matches.find(x=>x.id===mid);
  if(!canSuperOver(m)){toast('A Super Over can only follow a tied match, when no other match is live','warn');return;}
  try{closeCelebration();}catch(e){}
  // The side that batted second bats first in the Super Over
  let last=m.innings[m.innings.length-1];
  m.status='live';m.winner=null;m.resultText=null;delete m.completedAt;delete m.motm;
  APP.liveMatch=m;_undoStack=[];APP.pendingFreeHit=false;
  document.getElementById('livebadge').classList.remove('hidden');
  renderMatches();renderHistory();populateSCSelect();renderHome();
  showTab('live');
  startInnings(m.innings.length+1,last.battingTeamId,last.bowlingTeamId);
  toast('⚡ Super Over! One over each, 2 wickets');
}
function superFromCelebration(){let m=_lastCompletedMatch;if(m)startSuperOver(m.id);}

// ── Rain / bad light: cut the overs during a live match ───────────────────
function openRain(){
  let m=APP.liveMatch,inn=m&&m.innings[m.currentInnings];
  if(!inn||inn.completed){toast('Innings not in progress');return;}
  if(inn.super){toast('Overs cannot be changed in a Super Over','warn');return;}
  let cur=innOvers(inn);
  setTxt(document.getElementById('rain-now'),`Now: ${cur} overs a side. ${ov(inn)} overs bowled in this innings.`);
  document.getElementById('rain-ov').value='';
  document.getElementById('rain-tgt').value='';
  document.getElementById('rain-tgt-row').style.display=inn.target?'':'none';
  setTxt(document.getElementById('rain-hint'),'');
  setTxt(document.getElementById('rain-err'),'');
  openM('rain-mo');
}
function rainSuggest(){
  setTxt(document.getElementById('rain-err'),'');
  let m=APP.liveMatch,inn=m&&m.innings[m.currentInnings];if(!inn||!inn.target)return;
  let n=+String(document.getElementById('rain-ov').value).trim();
  if(!(n>=1))return;
  let i1=m.innings[0],sug=Math.floor(i1.runs*n/innOvers(i1))+1;
  document.getElementById('rain-tgt').value=sug;
  setTxt(document.getElementById('rain-hint'),`Suggested target ${sug} scales ${plural(i1.runs,'run')} to ${plural(n,'over')} by run rate. This is not official DLS. If you use a DLS app, type its target instead.`);
}
function confirmRain(){
  let m=APP.liveMatch,inn=m&&m.innings[m.currentInnings];
  let err=document.getElementById('rain-err');setTxt(err,'');
  if(!inn||inn.completed||inn.super){closeM('rain-mo');return;}
  let raw=String(document.getElementById('rain-ov').value).trim(),cur=innOvers(inn);
  if(!/^\d+$/.test(raw)||+raw<1){setTxt(err,'Enter the new overs as a whole number.');return;}
  let n=+raw;
  if(n>=cur){setTxt(err,`New overs must be fewer than ${cur}.`);return;}
  if(n*6<inn.legalBalls){setTxt(err,`${ov(inn)} overs are already bowled. Enter ${Math.ceil(inn.legalBalls/6)} or more.`);return;}
  let t=null;
  if(inn.target){
    let tr=String(document.getElementById('rain-tgt').value).trim();
    if(!/^\d+$/.test(tr)||+tr<1){setTxt(err,'Enter the revised target as a whole number.');return;}
    t=+tr;
  }
  pushUndo();
  m.overs=n;inn.maxBalls=n*6;if(t)inn.target=t;
  closeM('rain-mo');
  toast(`🌧 Match cut to ${n} overs a side`+(t?` — new target ${t}`:''));
  if(t&&inn.runs>=t){endInnings();return;}
  if(inn.legalBalls>=inn.maxBalls){endInnings();return;}
  afterScore();
}
