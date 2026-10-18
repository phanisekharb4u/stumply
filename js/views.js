// Stumply — Live view, scorecard, history, stats, points table, home and small helpers.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  LIVE VIEW
// ══════════════════════════════════════════════════════════════════════════
function renderLive(){
  if(APP.role==='viewer'){
    document.getElementById('livebadge').classList.toggle('hidden',!APP.matches.some(m=>m.status==='live'));
  }
  let el=document.getElementById('livecont');
  if(OVL)renderOverlay();
  if(!APP.liveMatch){
    let last=lastCompletedMatch();
    speakResult(last);
    el.innerHTML=`${last?'<div class="card">'+resultCard(last)+'</div>':''}<div style="text-align:center;padding:${last?24:60}px 0;color:var(--dim)">No live match.<br>
      <span style="font-size:12px">${APP.role==='admin'?'Go to Matches and start a match.':'Waiting for admin. Updates automatically.'}</span>
      ${APP.role==='admin'&&_undoStack.length?'<br><button class="bsm" style="margin-top:14px" onclick="undoLast()">↩ Undo last ball (reopen match)</button>':''}
    </div>${last?`<div class="lv-tools"><button class="bsm" onclick="shareLiveWA('${last.id}')">💬 Share result on WhatsApp</button></div>`:''}`;return;
  }
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  if(!inn){el.innerHTML='<p style="color:var(--dim)">Preparing...</p>';return;}
  speakTick(m,inn);
  let batT=APP.teams.find(t=>t.id===inn.battingTeamId);
  let st=inn.striker?inn.batsmen[inn.striker]:null;
  let ns=inn.nonStriker?inn.batsmen[inn.nonStriker]:null;
  let bw=inn.currentBowler?inn.bowlers[inn.currentBowler]:null;
  let crr=inn.legalBalls>0?((inn.runs/inn.legalBalls)*6).toFixed(2):'0.00';
  let rrrH='';
  if(inn.target&&!inn.completed){
    let need=Math.max(0,inn.target-inn.runs),bl=innBalls(inn)-inn.legalBalls;
    let rrr=bl>0?((need/bl)*6).toFixed(2):'∞';
    rrrH=`<div class="smi">RRR:<span style="color:${parseFloat(rrr)>parseFloat(crr)?'#FFB4A8':'#9AE6B4'}">${rrr}</span></div>
      <div class="smi">Need:<span>${need} off ${bl}b</span></div>`;
  }
  let tossStr=m.toss?`<span style="font-size:10px;font-family:var(--mono);color:var(--dim)">🪙 ${gtn(m.toss.winner)} elected to ${esc(String(m.toss.decision).toUpperCase())}</span>`:'';
  let lmt=m.matchType||'League';
  let lmtcol=lmt==='Final'?'var(--gold)':lmt==='Semi Final'?'var(--purple)':lmt==='Quarter Final'?'var(--blue)':lmt.startsWith('Group')?'var(--amber)':'var(--em)';
  let stageBanner=lmt!=='League'?`<div style="text-align:center;font-family:var(--disp);font-size:11px;letter-spacing:2px;color:${lmtcol};background:rgba(0,0,0,.3);border:1px solid ${lmtcol};border-radius:6px;padding:4px 12px;margin-bottom:10px">${esc(lmt.toUpperCase())}</div>`:'';
  let overLog=`<div class="overlog"><span class="olbl">THIS OVER:</span>`;
  (inn.thisOver||[]).forEach(b=>overLog+=`<div class="ball ${bc(b)}"${String(b).length>2?' style="font-size:10px"':''}>${esc(b)}</div>`);
  overLog+='</div>';
  let fhBanner=APP.pendingFreeHit&&!inn.completed?'<div class="fhb" style="display:block">🟢 FREE HIT — Batsman cannot be dismissed (except Run Out)!</div>':'';
  let tgt='';
  if(inn.target&&!inn.completed){
    let need=Math.max(0,inn.target-inn.runs),bl=innBalls(inn)-inn.legalBalls;
    tgt=`<div style="background:rgba(240,192,64,.1);border:1px solid var(--gdim);border-radius:8px;padding:8px 12px;margin-bottom:11px">
      🎯 <span style="font-family:var(--mono)">Target:<b style="color:var(--gold);font-size:16px"> ${inn.target}</b> | Need:<b> ${need}</b> off <b>${bl}</b>b</span>
    </div>`;
  }
  let iebb=inn.completed?`<div class="iebb"><h2>${inn.super?'Super Over innings complete':'Innings '+inn.number+' Complete'}</h2>
    <p>${batT?esc(batT.name):''}: ${scTxt(inn)} (${ov(inn)} Ov)</p>
    ${inn.number%2===1?'<p style="color:var(--gold);margin-top:4px">'+(inn.super?'Other team bats next...':'Starting Innings 2...')+'</p>':''}
  </div>`:'';
  // Warnings for missing striker/bowler (scorer only — viewers cannot act on them)
  let warns='';
  let notStarted=!inn.completed&&inn.legalBalls===0&&!(inn.thisOver||[]).length&&(!inn.striker||!inn.nonStriker||!inn.currentBowler);
  let between=inn.completed&&m.status==='live'; // next innings about to start
  if(APP.role!=='admin'&&(notStarted||between)){
    let prev=between?inn:m.innings[m.currentInnings-1];
    if(between){let nx=inn.number+1;inn={number:nx,super:nx>2,battingTeamId:inn.bowlingTeamId,target:nx%2===0?inn.runs+1:null,maxBalls:nx>2?6:(m.overs?m.overs*6:0)};}
    el.innerHTML=`${stageBanner}<div class="shero" style="text-align:center">
      <div class="steam">${prev?'⏸ '+(inn.super?'⚡ '+esc(soName(m,inn).toUpperCase())+' · ':'')+'INNINGS BREAK':'⏳ MATCH STARTING SOON'}</div>
      ${prev?`<div style="font-size:15px;margin-top:8px">${esc(rawTeamName(prev.battingTeamId))}: <b>${scTxt(prev)}</b> (${ov(prev)} Ov)</div>`:''}
      ${inn.target?`<div class="sruns" style="font-size:44px;margin-top:6px">🎯 ${inn.target}</div><div class="sovs">${esc(rawTeamName(inn.battingTeamId))} need ${plural(inn.target,'run')} to win from ${plural(innOvers(inn),'over')}</div>`:''}
      ${!prev&&m.toss?`<div style="font-size:13px;margin-top:8px">🪙 ${gtn(m.toss.winner)} elected to ${esc(String(m.toss.decision).toUpperCase())}</div>`:''}
      <div style="font-size:12px;opacity:.85;margin-top:10px">Waiting for the scorer to pick the openers…</div>
    </div>
    <div class="lv-tools"><button class="bsm" onclick="shareLiveWA('${m.id}')">💬 WhatsApp update</button>${speakBtn()}</div>
    ${pollBox(m)}`;
    return;
  }
  if(APP.role!=='admin'){}
  else if(inn.striker&&!inn.nonStriker&&!inn.completed&&!lmsAlone(inn)) warns+=`<div class="warn-box">⚠ No non-striker set. <a onclick="openManage()">Tap ⚙️ Manage</a> to set the other batter before scoring.</div>`;
  if(APP.role==='admin'&&!inn.striker&&!inn.completed) warns+=`<div class="warn-box">⚠ No striker set. <a onclick="openManage()">Tap ⚙️ Manage</a> to set next batsman before scoring.</div>`;
  if(APP.role==='admin'&&!inn.currentBowler&&!inn.completed) warns+=`<div class="warn-box">⚠ No bowler set. <a onclick="openManage()">Tap ⚙️ Manage</a>.</div>`;
  if(APP.role==='admin'&&needBowler(inn)){
    warns+=`<div class="warn-box">⚠ Over complete. <a onclick="promptBowlerNow()">Choose the next bowler</a> to continue.</div>`;
    if(activeTabName()==='live'&&!document.getElementById('nov-mo').classList.contains('on'))setTimeout(promptBowlerNow,0);
  }
  let sp='';
  if(APP.role==='admin'&&!inn.completed){
    sp=`${fhBanner}
    <div class="mgbar">
      <span class="mglbl">⚡ Actions:</span>
      <button class="bsm bblu" onclick="openManage()">⚙️ Manage Players / Bowler</button>
      <button class="bsm" onclick="undoLast()" style="background:var(--bg2);color:var(--txt);border:1px solid var(--bdr)">↩ Undo last ball</button>
      <button class="bsm bpur" onclick="triggerRetiredHurt()">🚑 Retired Hurt</button>
      ${inn.super?'':'<button class="bsm" onclick="openRain()" style="background:var(--bg2);color:var(--txt);border:1px solid var(--bdr)">🌧 Reduce overs</button>'}
      <button class="bsm bdng" onclick="openDiscard()" style="margin-left:auto">🚫 Discard Match</button>
    </div>
    <div class="card"><div class="ch">🎯 Ball-by-Ball Entry <select class="ww-mode" aria-label="Shot map" onchange="wwSet(this.value)">${['off','4s6s','all'].map(v=>`<option value="${v}"${wwMode()===v?' selected':''}>${v==='off'?'Shot map: off':v==='4s6s'?'Shot map: 4s & 6s':'Shot map: all runs'}</option>`).join('')}</select></div>
      <div class="sbtns">
        <button class="sbtn b0" onclick="addRun(0)">•<span>DOT</span></button>
        <button class="sbtn b1" onclick="addRun(1)">1</button>
        <button class="sbtn b2" onclick="addRun(2)">2</button>
        <button class="sbtn b3" onclick="addRun(3)">3</button>
        <button class="sbtn b4" onclick="addRun(4)">4<span>FOUR 🔥</span></button>
        <button class="sbtn b6" onclick="addRun(6)">6<span>SIX 🚀</span></button>
        <button class="sbtn bwkt" onclick="triggerWicket()">⚡ WICKET</button>
      </div>
      <div class="exrow">
        <button class="bex" onclick="addExtra('wide')">↔️ WIDE</button>
        <button class="bex" onclick="addExtra('noball')">🚫 NO BALL</button>
        <button class="bex" onclick="addExtra('bye')">👋 BYE</button>
        <button class="bex" onclick="addExtra('legbye')">🦵 LEG BYE</button>
      </div>
    </div>`;
  }
  el.innerHTML=`${stageBanner}${iebb}${warns}
  <div class="shero">
    <div class="steam">${batT?esc(batT.name.toUpperCase()):''} — ${inn.super?'⚡ '+soName(m,inn).toUpperCase():'INN '+inn.number} &nbsp;${tossStr}</div>
    <div class="sruns" id="sdisplay">${allOut(inn)?inn.runs+'<span style="font-size:.32em;font-family:var(--body)"> all out</span>':inn.runs+'/'+inn.wickets}</div>
    <div class="sovs">(${ov(inn)} Overs of ${innOvers(inn)})</div>${rulesText()&&!inn.super?'<div class="rules-line">📜 '+esc(rulesText())+'</div>':''}${!inn.super&&m.overs?'<div style="font-size:11px;color:#FFE08A;margin-top:2px">🌧 Reduced to '+m.overs+' overs a side</div>':''}
    <div class="smeta">
      <div class="smi">CRR:<span>${crr}</span></div>
      ${rrrH}
      <div class="smi">P-ship:<span>${inn.currentPartnership.runs}(${inn.currentPartnership.balls}b)</span></div>
      <div class="smi">FoW:<span>${inn.fallOfWickets.length?inn.fallOfWickets[inn.fallOfWickets.length-1].score+'/'+inn.fallOfWickets[inn.fallOfWickets.length-1].wicket:'—'}</span></div>
    </div>
  </div>
  ${tgt}
  <div class="bgrid">
    <div class="bcard sk"><div class="skm">★ ON STRIKE</div>
      <div class="bnm">${st?av(inn.striker,26)+esc(st.name):'⚠ Not set'}</div>
      <div class="bst"><span>${st?st.runs:0}</span>(${st?st.balls:0}b) 4s:<span>${st?st.fours:0}</span> 6s:<span>${st?st.sixes:0}</span> SR:<span>${st&&st.balls>0?((st.runs/st.balls)*100).toFixed(1):'—'}</span></div>
    </div>
    <div class="bcard">
      <div class="bnm">${ns?av(inn.nonStriker,26)+esc(ns.name):lmsAlone(inn)?'🧍 Batting alone':'⚠ Not set'} <span style="font-size:9px;color:var(--dim)">${!ns&&lmsAlone(inn)?'(last man stands)':'(non-striker)'}</span></div>
      ${!ns&&lmsAlone(inn)?'<div class="bst">Nobody left to come in. Strike stays with this batter.</div>':`<div class="bst"><span>${ns?ns.runs:0}</span>(${ns?ns.balls:0}b) 4s:<span>${ns?ns.fours:0}</span> 6s:<span>${ns?ns.sixes:0}</span></div>`}
    </div>
  </div>
  <div class="bwlcard">
    <div class="bwlnm">${bw?av(inn.currentBowler,26)+esc(bw.name):'⚠ Not set'} <span style="font-size:10px;color:var(--dim)">(Bowling)</span></div>
    <div style="font-family:var(--mono);font-size:11px;color:var(--dim)">
      O:<span style="color:var(--blue)">${bw?bowlerOvTxt(bw):'0'}</span>
      M:<span style="color:var(--blue)">${bw?bw.maidens:0}</span>
      R:<span style="color:var(--blue)">${bw?bw.runs:0}</span>
      W:<span style="color:var(--blue)">${bw?bw.wickets:0}</span>
      Eco:<span style="color:var(--blue)">${bw?econTxt(bw.runs,bw.overs,bw.balls):'—'}</span>
    </div>
  </div>
  ${overLog}
  <div class="rbar">
    <div class="ri">Extras:<span>${inn.extras.total}</span></div>
    <div class="ri">Wd:<span>${inn.extras.wide||0}</span></div>
    <div class="ri">Nb:<span>${inn.extras.noball||0}</span></div>
    <div class="ri">B:<span>${inn.extras.bye||0}</span></div>
    <div class="ri">LB:<span>${inn.extras.legbye||0}</span></div>
  </div>
  ${sp}
  ${(inn.log||[]).length?`<div class="card"><div class="ch">🎙 Commentary</div>${cmList(inn,12)}${inn.log.length>12?`<button class="bsm" style="margin-top:8px" onclick="showMHist('${m.id}')">📊 Full scorecard &amp; commentary</button>`:''}</div>`:''}
  <div class="lv-tools">
    <button class="bsm" onclick="shareLiveWA('${m.id}')">💬 WhatsApp update</button>
    <button class="bsm" onclick="shareImage('${m.id}')">📤 Share score as image</button>
    ${speakBtn()}
    <button class="bsm" onclick="showMHist('${m.id}')">📈 Graphs &amp; scorecard</button>
  </div>
  ${pollBox(m)}
  ${inn.fallOfWickets.length?`<div class="card"><div class="ch">⬇ Fall of Wickets</div>
    <div class="fow-list">${inn.fallOfWickets.map(f=>`<div class="fow-chip">${f.score}/${f.wicket} (${esc(f.batsman)}, ov ${f.over})</div>`).join('')}</div>
  </div>`:''}`;
}
function bc(b){
  b=String(b);
  if(/W$/.test(b))return'wkt';if(/wd/.test(b))return'wide';if(/nb/.test(b))return'nb';
  if(b==='·'||b==='•')return'dot';if(b==='4')return'r4';if(b==='6')return'r6';
  if(/FH/.test(b)){let f=parseInt(b);return f===4?'r4':f===6?'r6':'fh';}
  let n=parseInt(b);if(n===1)return'r1';if(n===2)return'r2';if(n===3)return'r3';
  return'dot';
}
function flashScore(){let e=document.getElementById('sdisplay');if(e){e.classList.add('fl');setTimeout(()=>e.classList.remove('fl'),380);}}

// ══════════════════════════════════════════════════════════════════════════
//  SCORECARD
// ══════════════════════════════════════════════════════════════════════════
function populateSCSelect(){
  let sel=document.getElementById('sc-sel');
  let all=APP.matches.filter(m=>m.innings.length>0);
  if(APP.liveMatch&&!all.find(x=>x.id===APP.liveMatch.id))all.push(APP.liveMatch);
  let prev=sel.value;
  sel.innerHTML='<option value="">— Select a match —</option>'
    +all.map(m=>{
      let tA=APP.teams.find(t=>t.id===m.teamAId),tB=APP.teams.find(t=>t.id===m.teamBId);
      let mt2=m.matchType||'League',no=APP.matches.indexOf(m)+1;
      let extra=[m.venue&&m.venue!=='TBD'?m.venue:'',m.status==='live'?'LIVE':''].filter(Boolean).join(' · ');
      return`<option value="${esc(m.id)}">#${no} [${esc(mt2)}] ${tA?esc(tA.name):'?'} vs ${tB?esc(tB.name):'?'} (${esc(m.date)})${extra?' · '+esc(extra):''}</option>`;
    }).join('');
  if(prev)sel.value=prev;
}
function renderSC(){
  let mid=document.getElementById('sc-sel').value;
  let el=document.getElementById('sc-cont');
  if(!mid){el.innerHTML='<p style="color:var(--dim)">Select a match.</p>';return;}
  let m=APP.matches.find(x=>x.id===mid)||(APP.liveMatch?.id===mid?APP.liveMatch:null);
  if(!m){el.innerHTML='<p style="color:var(--dim)">Not found.</p>';return;}
  let mtype=m.matchType||'League';
  let mtcol=mtype==='Final'?'var(--gold)':mtype==='Semi Final'?'var(--purple)':mtype==='Quarter Final'?'var(--blue)':'var(--em)';
  let html=`<div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
      <span style="font-family:var(--mono);font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(240,192,64,.1);color:${mtcol};border:1px solid ${mtcol}">${esc(mtype.toUpperCase())}</span>
      <div style="font-family:var(--disp);font-size:16px">${gtn(m.teamAId)} vs ${gtn(m.teamBId)}</div>
    </div>
    <div style="font-size:11px;color:var(--dim)">📍 ${esc(venueTxt(m))} | ${esc(m.date)} | 👔 ${umpLine(m)}</div>
    ${m.toss?`<div style="font-size:11px;color:var(--dim)">🪙 ${gtn(m.toss.winner)} elected to ${esc(String(m.toss.decision).toUpperCase())}</div>`:''}
    ${m.resultText?`<div style="color:var(--em);font-size:14px;margin-top:4px;font-family:var(--disp)">🏆 ${esc(m.resultText)}</div>`:''}
    ${m.motm&&playerNameInMatch(m,m.motm)?`<div style="font-size:12px;color:var(--dim);margin-top:3px">🏅 Player of the Match: ${av(m.motm,18)}<b style="color:var(--gold)">${esc(playerNameInMatch(m,m.motm))}</b></div>`:''}
    <div class="noprint" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
      <button class="bsm" onclick="shareImage('${m.id}')">📤 Share image</button>
      <button class="bsm" onclick="printScorecard('${m.id}')">🖨 Print / PDF</button>
      <button class="bsm" onclick="shareScorecardWA('${m.id}')">💬 WhatsApp scorecard</button>
    </div>
  </div>`;
  m.innings.forEach(inn=>{
    let bat=APP.teams.find(t=>t.id===inn.battingTeamId),bwl=APP.teams.find(t=>t.id===inn.bowlingTeamId);
    html+=`<div style="margin-bottom:20px">
      <div class="inns-hdr">${inn.super?'⚡ ':''}${bat?esc(bat.name):'?'} — ${innLabel(inn,m)}: <b>${scTxt(inn)}</b> (${ov(inn)} / ${innOvers(inn)} Ov)${inn.target&&!inn.super&&m.overs?' · 🌧 target '+inn.target:''}</div>
      <div class="tblwrap"><table><thead><tr><th>Batsman</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead><tbody>`;
    Object.entries(inn.batsmen||{}).forEach(([pid,b])=>{
      if(!b||b.status==='yet')return;
      let sr=b.balls>0?((b.runs/b.balls)*100).toFixed(1):'—';
      let dis=b.status==='batting'?'<span class="tag tg">not out</span>'
        :b.status==='retired'?'<span class="tag ta">retired hurt</span>'
        :`<span style="font-size:10px;color:var(--dim)">${esc(dispDism(b.dismissal))}</span>`;
      html+=`<tr><td style="font-weight:600;white-space:nowrap">${av(pid,20)}<a class="plink" onclick="openPlayer('${pid}')">${esc(b.name)}</a>${isCaptain(pid)?' <span style="color:var(--dim);font-weight:400">(c)</span>':''}</td><td>${dis}</td>
        <td style="font-family:var(--mono);color:var(--gold);font-weight:700">${b.runs}</td>
        <td style="font-family:var(--mono)">${b.balls}</td><td style="font-family:var(--mono)">${b.fours}</td>
        <td style="font-family:var(--mono)">${b.sixes}</td><td style="font-family:var(--mono)">${sr}</td></tr>`;
    });
    html+=`</tbody></table></div>
    <div style="font-size:11px;color:var(--dim);margin:6px 0;font-family:var(--mono)">
      Extras: ${inn.extras.total} (w${inn.extras.wide||0} nb${inn.extras.noball||0} b${inn.extras.bye||0} lb${inn.extras.legbye||0})
      &nbsp;|&nbsp;<b style="color:var(--txt)">Total: ${scTxt(inn)}</b>
    </div>`;
    {let dnb=Object.values(inn.batsmen||{}).filter(b=>b&&b.status==='yet').map(b=>b.name);
     if(dnb.length&&(inn.completed||m.status==='completed'))html+=`<div style="font-size:12px;color:var(--dim);margin:0 0 8px"><b>Did not bat:</b> ${esc(dnb.join(', '))}</div>`;}
    if(inn.fallOfWickets.length)html+=`<div style="margin-bottom:8px"><span style="font-size:10px;color:var(--dim);letter-spacing:1px;text-transform:uppercase">Fall of Wickets</span>
      <div class="fow-list" style="margin-top:3px">${inn.fallOfWickets.map(f=>`<div class="fow-chip">${f.score}/${f.wicket} (${esc(f.batsman)})</div>`).join('')}</div></div>`;
    html+=`<div class="tblwrap"><table style="margin-top:6px"><thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th><th>Wd</th><th>Nb</th></tr></thead><tbody>`;
    let bwlIds=[...(inn.bowlOrder||[]).filter(id=>inn.bowlers&&inn.bowlers[id]),...Object.keys(inn.bowlers||{}).filter(id=>!(inn.bowlOrder||[]).includes(id))];
    bwlIds.forEach(pid=>{let b=inn.bowlers[pid];
      if(!hasBowled(b))return;
      html+=`<tr><td style="font-weight:600;white-space:nowrap">${av(pid,20)}<a class="plink" onclick="openPlayer('${pid}')">${esc(b.name)}</a></td>
        <td style="font-family:var(--mono)">${b.overs||0}.${b.balls||0}</td>
        <td style="font-family:var(--mono)">${b.maidens}</td>
        <td style="font-family:var(--mono)">${b.runs}</td>
        <td style="font-family:var(--mono);color:var(--red);font-weight:700">${b.wickets}</td>
        <td style="font-family:var(--mono)">${econTxt(b.runs,b.overs,b.balls)}</td>
        <td style="font-family:var(--mono)">${b.wides||0}</td>
        <td style="font-family:var(--mono)">${b.noballs||0}</td></tr>`;
    });
    html+='</tbody></table></div>';
    if((inn.log||[]).length)html+=`<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700;font-size:13px">🎙 Ball-by-ball commentary (${inn.log.length})</summary><div style="margin-top:8px">${cmList(inn)}</div></details>`;
    html+='</div>';
  });
  html+=graphsHTML(m);
  el.innerHTML=html;
}

// ══════════════════════════════════════════════════════════════════════════
//  HISTORY / POINTS TABLE
// ══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════
//  HISTORY & TOURNAMENT STATS
// ══════════════════════════════════════════════════════════════════════════
function switchStatTab(tab){
  document.querySelectorAll('.stab-btn').forEach(b=>{
    b.classList.toggle('stab-on', b.id==='stab-'+tab);
  });
  document.querySelectorAll('.statsview').forEach(v=>{
    v.classList.toggle('active', v.id==='statsview-'+tab);
  });
  // Render on demand
  if(tab==='matches')   renderCompleted();
  else if(tab==='points')    renderPoints();
  else if(tab==='bracket')   renderBracket();
  else if(tab==='batting')   renderBattingStats();
  else if(tab==='bowling')   renderBowlingStats();
  else if(tab==='fielding')  renderFieldingStats();
  else if(tab==='awards')    renderAwards();
}
function renderHistory(){
  setDiscardText();
  let pb=document.getElementById('stab-points'),single=!!APP.tournament.single;
  if(pb){pb.style.display=single?'none':'';if(single&&pb.classList.contains('stab-on'))switchStatTab('matches');}
  let kb=document.getElementById('stab-bracket');
  if(kb){kb.style.display=single?'none':'';if(single&&kb.classList.contains('stab-on'))switchStatTab('matches');}
  renderBracket();
  renderCompleted();
  renderPoints();
  // Pre-render stats so they're ready
  renderBattingStats();
  renderBowlingStats();
  renderFieldingStats();
  renderAwards();
}

// ── Collect all player stats across all completed matches ─────────────
function collectPlayerStats(){
  let batting={};  // pid → {name,team,matches,innings,runs,balls,fours,sixes,outs,notOuts,centuries,halfCenturies,ducks,highest,highestNotOut}
  let bowling={};  // pid → {name,team,matches,overs,balls,runs,wickets,maidens,wides,noballs,bestWickets,bestRuns}
  let fielding={}; // pid → {name,team,catches,runOuts,stumpings}

  let done=APP.matches.filter(m=>m.status==='completed');

  done.forEach(m=>{
    let teamA=APP.teams.find(t=>t.id===m.teamAId);
    let teamB=APP.teams.find(t=>t.id===m.teamBId);

    mainInns(m).forEach(inn=>{
      let batTeam=APP.teams.find(t=>t.id===inn.battingTeamId);
      let bwlTeam=APP.teams.find(t=>t.id===inn.bowlingTeamId);

      // ── Batting ──────────────────────────────────────────────────
      Object.entries(inn.batsmen||{}).forEach(([pid,b])=>{
        if(b.status==='yet')return; // did not bat
        if(!batting[pid]) batting[pid]={
          name:b.name,team:batTeam?batTeam.code:'?',
          matches:new Set(),innings:0,runs:0,balls:0,
          fours:0,sixes:0,outs:0,notOuts:0,
          centuries:0,halfCenturies:0,ducks:0,
          highest:0,highestNotOut:false
        };
        let p=batting[pid];
        p.matches.add(m.id);
        p.innings++;
        p.runs+=b.runs||0;
        p.balls+=b.balls||0;
        p.fours+=b.fours||0;
        p.sixes+=b.sixes||0;
        let out=(b.status==='out');
        if(out)p.outs++;else p.notOuts++;
        if((b.runs||0)===0&&out)p.ducks++;
        if((b.runs||0)>=100)p.centuries++;
        else if((b.runs||0)>=50)p.halfCenturies++;
        // Highest score
        if((b.runs||0)>p.highest||((b.runs||0)===p.highest&&!out&&p.highestNotOut===false)){
          p.highest=b.runs||0;
          p.highestNotOut=!out;
        }
      });

      // ── Bowling ──────────────────────────────────────────────────
      Object.entries(inn.bowlers||{}).forEach(([pid,bw])=>{
        if(!hasBowled(bw))return; // did not bowl
        if(!bowling[pid]) bowling[pid]={
          name:bw.name,team:bwlTeam?bwlTeam.code:'?',
          matches:new Set(),overs:0,balls:0,runs:0,
          wickets:0,maidens:0,wides:0,noballs:0,
          bestWickets:0,bestRuns:999
        };
        let p=bowling[pid];
        p.matches.add(m.id);
        p.overs+=bw.overs||0;
        p.balls+=bw.balls||0;
        p.runs+=bw.runs||0;
        p.wickets+=bw.wickets||0;
        p.maidens+=bw.maidens||0;
        p.wides+=bw.wides||0;
        p.noballs+=bw.noballs||0;
        // Best bowling figure
        if((bw.wickets||0)>p.bestWickets||
          ((bw.wickets||0)===p.bestWickets&&(bw.runs||0)<p.bestRuns)){
          p.bestWickets=bw.wickets||0;
          p.bestRuns=bw.runs||0;
        }
      });

      // ── Fielding — parse from dismissal strings ───────────────────
      Object.entries(inn.batsmen||{}).forEach(([pid,b])=>{
        if(b.status!=='out'||!b.dismissal)return;
        let dism=b.dismissal;
        // Caught: "c FielderName b BowlerName"
        if(dism.startsWith('c ')&&dism.includes(' b ')){
          let fielder=dism.startsWith('c & b ')?dism.slice(6).trim():dism.slice(2,dism.indexOf(' b ')).trim();
          // Find fielder by name in bowling team
          let fp=findPlayerByName(fielder,inn.bowlingTeamId);
          if(fp){
            if(!fielding[fp.id])fielding[fp.id]={name:fp.name,team:bwlTeam?bwlTeam.code:'?',matches:new Set(),catches:0,runOuts:0,stumpings:0};
            fielding[fp.id].catches++;
            fielding[fp.id].matches.add(m.id);
          }
        }
        // Stumped: "st FielderName b BowlerName"
        if(dism.startsWith('st ')){
          let fielder=dism.slice(3,dism.indexOf(' b ')).trim();
          let fp=findPlayerByName(fielder,inn.bowlingTeamId);
          if(fp){
            if(!fielding[fp.id])fielding[fp.id]={name:fp.name,team:bwlTeam?bwlTeam.code:'?',matches:new Set(),catches:0,runOuts:0,stumpings:0};
            fielding[fp.id].stumpings++;
            fielding[fp.id].matches.add(m.id);
          }
        }
        // Run Out: "run out (FielderName)"
        if(dism.startsWith('run out')){
          let m2=dism.match(/\(([^)]+)\)/);
          if(m2){
            let fp=findPlayerByName(m2[1].trim(),inn.bowlingTeamId);
            if(fp){
              if(!fielding[fp.id])fielding[fp.id]={name:fp.name,team:bwlTeam?bwlTeam.code:'?',matches:new Set(),catches:0,runOuts:0,stumpings:0};
              fielding[fp.id].runOuts++;
              fielding[fp.id].matches.add(m.id);
            }
          }
        }
      });
    });
  });

  // M = matches the player was in the side for (every player in the XI is listed in each innings)
  let played={};
  done.forEach(m=>mainInns(m).forEach(inn=>{
    [...Object.keys(inn.batsmen||{}),...Object.keys(inn.bowlers||{})].forEach(id=>{(played[id]=played[id]||new Set()).add(m.id);});
  }));
  const cnt=(id,p)=>{let s=new Set(p.matches);(played[id]||[]).forEach(x=>s.add(x));return s.size;};
  Object.entries(batting).forEach(([id,p])=>{p.matches=cnt(id,p);});
  Object.entries(bowling).forEach(([id,p])=>{p.matches=cnt(id,p);});
  Object.entries(fielding).forEach(([id,p])=>{p.matches=cnt(id,p);});

  return {batting:Object.entries(batting).map(([id,v])=>({id,...v})),
          bowling:Object.entries(bowling).map(([id,v])=>({id,...v})),
          fielding:Object.entries(fielding).map(([id,v])=>({id,...v}))};
}

function findPlayerByName(name,teamId){
  let team=APP.teams.find(t=>t.id===teamId);
  if(!team)return null;
  let nm=name.toLowerCase();
  return team.players.find(p=>p.name.toLowerCase()===nm||p.name.toLowerCase().includes(nm))||null;
}

// ── Batting Stats table ───────────────────────────────────────────────
function renderBattingStats(){
  let el=document.getElementById('stats-batting');if(!el)return;
  let done=APP.matches.filter(m=>m.status==='completed');
  if(!done.length){el.innerHTML='<p style="color:var(--dim)">No completed matches yet.</p>';return;}
  let {batting}=collectPlayerStats();
  if(!batting.length){el.innerHTML='<p style="color:var(--dim)">No batting data yet.</p>';return;}

  // Sort by runs desc
  batting.sort((a,b)=>b.runs-a.runs);

  let rows=batting.map((p,i)=>{
    let avg=p.outs>0?(p.runs/p.outs).toFixed(2):'—';
    let sr=p.balls>0?((p.runs/p.balls)*100).toFixed(1):'—';
    let hs=p.highest+(p.highestNotOut?'*':'');
    let medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return`<tr>
      <td style="font-family:var(--body);white-space:nowrap">${medal} ${av(p.id,24)}<a class="plink" onclick="openPlayer('${p.id}')">${esc(p.name)}</a><br><span style="font-size:9px;color:var(--dim)">${esc(p.team)}</span></td>
      <td class="num">${p.matches}</td>
      <td class="num">${p.innings}</td>
      <td class="num hi">${p.runs}</td>
      <td class="num">${p.balls}</td>
      <td class="num">${avg}</td>
      <td class="num">${sr}</td>
      <td class="num">${hs}</td>
      <td class="num" style="color:var(--gold)">${p.centuries}</td>
      <td class="num" style="color:var(--amber)">${p.halfCenturies}</td>
      <td class="num" style="color:var(--purple)">${p.sixes}</td>
      <td class="num" style="color:var(--blue)">${p.fours}</td>
      <td class="num" style="color:var(--red)">${p.ducks}</td>
      <td class="num">${p.notOuts}</td>
    </tr>`;
  }).join('');

  el.innerHTML=`<div style="overflow-x:auto">
    <table class="stat-table">
      <thead><tr>
        <th>Player</th><th>M</th><th>Inn</th>
        <th style="color:#F3D98B">Runs</th><th>Balls</th>
        <th>Avg</th><th>SR</th><th>HS</th>
        <th>100s</th><th>50s</th><th>6s</th><th>4s</th>
        <th>Ducks</th><th>NO</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Bowling Stats table ───────────────────────────────────────────────
function renderBowlingStats(){
  let el=document.getElementById('stats-bowling');if(!el)return;
  let done=APP.matches.filter(m=>m.status==='completed');
  if(!done.length){el.innerHTML='<p style="color:var(--dim)">No completed matches yet.</p>';return;}
  let {bowling}=collectPlayerStats();
  let bowlers=bowling.filter(p=>p.wickets>0||p.overs>0||p.balls>0||p.runs>0);
  if(!bowlers.length){el.innerHTML='<p style="color:var(--dim)">No bowling data yet.</p>';return;}

  // Sort by wickets desc, then economy asc
  bowlers.sort((a,b)=>b.wickets-a.wickets||((econ(a.runs,a.overs,a.balls)??99)-(econ(b.runs,b.overs,b.balls)??99)));

  let rows=bowlers.map((p,i)=>{
    let totalOv=p.overs+Math.round(p.balls/6*10)/10;
    let eco=econTxt(p.runs,p.overs,p.balls);
    let avg=p.wickets>0?(p.runs/p.wickets).toFixed(2):'—';
    let best=p.bestWickets>0?`${p.bestWickets}/${p.bestRuns}`:'—';
    let medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return`<tr>
      <td style="font-family:var(--body);white-space:nowrap">${medal} ${av(p.id,24)}<a class="plink" onclick="openPlayer('${p.id}')">${esc(p.name)}</a><br><span style="font-size:9px;color:var(--dim)">${esc(p.team)}</span></td>
      <td class="num">${p.matches}</td>
      <td class="num">${p.overs+Math.floor(p.balls/6)}.${p.balls%6}</td>
      <td class="num">${p.runs}</td>
      <td class="num hi">${p.wickets}</td>
      <td class="num">${best}</td>
      <td class="num" style="color:${parseFloat(eco)<7?'var(--em)':parseFloat(eco)>10?'var(--red)':'var(--amber)'}">${eco}</td>
      <td class="num">${avg}</td>
      <td class="num">${p.maidens}</td>
      <td class="num">${p.wides}</td>
      <td class="num">${p.noballs}</td>
    </tr>`;
  }).join('');

  el.innerHTML=`<div style="overflow-x:auto">
    <table class="stat-table">
      <thead><tr>
        <th>Player</th><th>M</th><th>Overs</th><th>Runs</th>
        <th style="color:#F3D98B">Wkts</th><th>Best</th>
        <th>Eco</th><th>Avg</th><th>Mdns</th>
        <th>Wds</th><th>NBs</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Fielding Stats table ──────────────────────────────────────────────
function renderFieldingStats(){
  let el=document.getElementById('stats-fielding');if(!el)return;
  let done=APP.matches.filter(m=>m.status==='completed');
  if(!done.length){el.innerHTML='<p style="color:var(--dim)">No completed matches yet.</p>';return;}
  let {fielding}=collectPlayerStats();
  if(!fielding.length){el.innerHTML='<p style="color:var(--dim)">No fielding data yet.<br><span style="font-size:11px">Tip: Enter fielder names when recording Caught/Stumped/Run Out dismissals.</span></p>';return;}

  fielding.sort((a,b)=>(b.catches+b.stumpings+b.runOuts)-(a.catches+a.stumpings+a.runOuts));

  let rows=fielding.map((p,i)=>{
    let total=p.catches+p.stumpings+p.runOuts;
    let medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return`<tr>
      <td style="font-family:var(--body);white-space:nowrap">${medal} ${av(p.id,24)}<a class="plink" onclick="openPlayer('${p.id}')">${esc(p.name)}</a><br><span style="font-size:9px;color:var(--dim)">${esc(p.team)}</span></td>
      <td class="num">${p.matches}</td>
      <td class="num hi">${total}</td>
      <td class="num" style="color:var(--em)">${p.catches}</td>
      <td class="num" style="color:var(--gold)">${p.stumpings}</td>
      <td class="num" style="color:var(--blue)">${p.runOuts}</td>
    </tr>`;
  }).join('');

  el.innerHTML=`<div style="overflow-x:auto">
    <table class="stat-table">
      <thead><tr>
        <th>Player</th><th>M</th>
        <th style="color:#F3D98B">Total</th>
        <th>Catches</th><th>Stumpings</th><th>Run Outs</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Awards ─────────────────────────────────────────────────────────────
function setPOTS(pid){
  if(APP.role!=='admin'||ownerOnly())return;
  APP.tournament.pots=pid||'';
  saveState();renderAwards();
  toast(pid?'🌟 Player of the Series saved':'Player of the Series set to auto');
}
function renderAwards(){
  let el=document.getElementById('stats-awards');if(!el)return;
  let done=APP.matches.filter(m=>m.status==='completed');
  if(!done.length){el.innerHTML='<p style="color:var(--dim)">No completed matches yet.</p>';return;}
  let {batting,bowling,fielding}=collectPlayerStats();
  if(!batting.length){el.innerHTML='<p style="color:var(--dim)">Not enough data yet.</p>';return;}

  let AW=[];
  function award(emoji,title,cls,name,team,value,sub){
    if(!name)return'';
    AW.push(`${emoji} ${title}: *${name}* (${team}) — ${value}`);
    return`<div class="award-card ${cls}">
      <div style="font-size:38px;flex-shrink:0">${emoji}</div>
      <div class="award-info">
        <div class="award-title">${title}</div>
        <div class="award-name">${esc(name)} <span style="font-size:11px;color:var(--dim)">(${esc(team)})</span></div>
        <div class="award-val">${value}${sub?` <span style="color:var(--dim)">${sub}</span>`:''}
        </div>
      </div>
    </div>`;
  }

  // Orange Cap — most runs
  let orangeCap=batting.reduce((a,b)=>b.runs>a.runs?b:a,batting[0]);
  // Purple Cap — most wickets
  let purpleCapArr=bowling.filter(p=>p.wickets>0);
  let purpleCap=purpleCapArr.length?purpleCapArr.reduce((a,b)=>b.wickets>a.wickets||(b.wickets===a.wickets&&(econ(b.runs,b.overs,b.balls)??99)<(econ(a.runs,a.overs,a.balls)??99))?b:a,purpleCapArr[0]):null;
  // Best Striker — highest strike rate (min 20 balls)
  let strikers=batting.filter(p=>p.balls>=20);
  let bestSR=strikers.length?strikers.reduce((a,b)=>((b.runs/b.balls)>(a.runs/a.balls))?b:a,strikers[0]):null;
  // Best Economy — lowest economy (min 2 overs)
  let econBowlers=bowling.filter(p=>p.overs>=2);
  let bestEcon=econBowlers.length?econBowlers.reduce((a,b)=>econ(b.runs,b.overs,b.balls)<econ(a.runs,a.overs,a.balls)?b:a,econBowlers[0]):null;
  // Most Sixes
  let mostSixes=batting.filter(p=>p.sixes>0).reduce((a,b)=>b.sixes>a.sixes?b:a,batting[0]);
  // Most Fours
  let mostFours=batting.filter(p=>p.fours>0).reduce((a,b)=>b.fours>a.fours?b:a,batting[0]);
  // Most Centuries
  let centurion=batting.filter(p=>p.centuries>0);
  centurion.sort((a,b)=>b.centuries-a.centuries);
  // Most Half-Centuries
  let halfCens=batting.filter(p=>p.halfCenturies>0);
  halfCens.sort((a,b)=>b.halfCenturies-a.halfCenturies);
  // Best Fielder — most dismissals
  let bestFielder=fielding.length?fielding.reduce((a,b)=>(b.catches+b.stumpings+b.runOuts)>(a.catches+a.stumpings+a.runOuts)?b:a,fielding[0]):null;
  // Highest Individual Score
  let highestBat=batting.reduce((a,b)=>b.highest>a.highest?b:a,batting[0]);
  // Best Bowling Figure
  let bestBowling=purpleCapArr.length?purpleCapArr.reduce((a,b)=>b.bestWickets>a.bestWickets||(b.bestWickets===a.bestWickets&&b.bestRuns<a.bestRuns)?b:a,purpleCapArr[0]):null;
  // Tournament Winner
  let final=APP.matches.find(m=>m.status==='completed'&&m.matchType==='Final');
  let champion=final&&final.winner&&final.winner!=='tie'?APP.teams.find(t=>t.id===final.winner):null;

  let html=`<div class="noprint" style="margin-bottom:12px"><button class="bsm bgld" onclick="shareAwards()">💬 Share awards on WhatsApp</button></div>`;

  // Player of the Series — suggested from all-round points, admin can override
  let pool={};
  const addP=(p,pts,txt)=>{if(!pool[p.id])pool[p.id]={id:p.id,name:p.name,team:p.team,pts:0,bits:[]};pool[p.id].pts+=pts;if(txt)pool[p.id].bits.push(txt);};
  batting.forEach(p=>addP(p,p.runs,plural(p.runs,'run')));
  bowling.forEach(p=>addP(p,p.wickets*20,(p.wickets||!pool[p.id])?plural(p.wickets,'wkt'):''));
  fielding.forEach(p=>{let d=p.catches+p.stumpings+p.runOuts;addP(p,d*10,d?plural(d,'dismissal'):'');});
  let ranked=Object.values(pool).sort((a,b)=>b.pts-a.pts);
  let chosenId=APP.tournament.pots||'';
  let pots=(chosenId&&pool[chosenId])||ranked[0];
  if(pots){
    AW.push(`🌟 Player of the Series: *${pots.name}* (${pots.team})${pots.bits.length?' — '+pots.bits.join(' · '):''}`);
    html+=`<div class="award-card gold-award" style="margin-bottom:14px">
      <div style="font-size:44px;flex-shrink:0">🌟</div>
      <div class="award-info">
        <div class="award-title" style="color:var(--gold)">PLAYER OF THE SERIES${chosenId&&pool[chosenId]?'':' (SO FAR)'}</div>
        <div class="award-name" style="font-size:20px">${av(pots.id,34)}${esc(pots.name)} <span style="font-size:11px;color:var(--dim)">(${esc(pots.team)})</span></div>
        <div class="award-val">${esc(pots.bits.join(' · '))}</div>
        ${APP.role==='admin'?`<select class="motm-sel" style="margin-top:8px" onchange="setPOTS(this.value)">
          <option value="">Auto — best all-round performer</option>
          ${ranked.map(p=>`<option value="${esc(p.id)}" ${p.id===chosenId?'selected':''}>${esc(p.name)} (${esc(p.team)})${p.bits.length?' — '+esc(p.bits.join(', ')):''}</option>`).join('')}
        </select>`:''}
      </div>
    </div>`;
  }

  // Champion first
  if(champion){
    AW.unshift(`🏆 Champions: *${champion.name}*`);
    html+=`<div class="award-card gold-award" style="margin-bottom:14px">
      <div style="font-size:44px;flex-shrink:0">🏆</div>
      <div class="award-info">
        <div class="award-title" style="color:var(--gold)">TOURNAMENT CHAMPION</div>
        <div class="award-name" style="font-size:22px;color:var(--gold)">${esc(champion.name)}</div>
        <div class="award-val">Winner of the Final</div>
      </div>
    </div>`;
  }

  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  html+=award('🟠','Orange Cap — Most Runs','gold-award',orangeCap?.name,orangeCap?.team,plural(orangeCap?.runs,'run'),`Avg: ${orangeCap?.outs>0?(orangeCap.runs/orangeCap.outs).toFixed(1):'—'}`);
  html+=award('🟣','Purple Cap — Most Wickets','purple-award',purpleCap?.name,purpleCap?.team,purpleCap?.wickets+' wickets',`Best: ${purpleCap?.bestWickets}/${purpleCap?.bestRuns}`);
  html+=award('⚡','Highest Score','gold-award',highestBat?.name,highestBat?.team,highestBat?.highest+(highestBat?.highestNotOut?'*':'')+' runs','');
  html+=award('🎳','Best Bowling Figure','purple-award',bestBowling?.name,bestBowling?.team,`${bestBowling?.bestWickets}/${bestBowling?.bestRuns}`,'');
  html+=award('💥','Most Sixes','blue-award',mostSixes?.sixes>0?mostSixes.name:null,mostSixes?.team,(mostSixes?.sixes===1?'1 six':mostSixes?.sixes+' sixes'),'');
  html+=award('🔥','Fastest Striker','red-award',bestSR?.name,bestSR?.team,`SR: ${bestSR?((bestSR.runs/bestSR.balls)*100).toFixed(1):'—'}`,`${bestSR?.runs} runs off ${bestSR?.balls}b`);
  html+=award('🧊','Best Economy','green-award',bestEcon?.name,bestEcon?.team,`Eco: ${bestEcon?econTxt(bestEcon.runs,bestEcon.overs,bestEcon.balls):'—'}`,plural(bestEcon?.wickets,'wkt'));
  html+=award('🧤','Best Fielder','blue-award',bestFielder?.name,bestFielder?.team,plural(bestFielder?(bestFielder.catches+bestFielder.stumpings+bestFielder.runOuts):0,'dismissal'),`${bestFielder?.catches||0}c ${bestFielder?.stumpings||0}st ${bestFielder?.runOuts||0}ro`);
  if(centurion.length) html+=award('💯','Centuries','gold-award',centurion[0].name,centurion[0].team,centurion[0].centuries+' × 100','');
  if(halfCens.length)  html+=award('5️⃣0️⃣','Half-Centuries','gold-award',halfCens[0].name,halfCens[0].team,halfCens[0].halfCenturies+' × 50','');
  html+=award('4️⃣','Most Fours','blue-award',mostFours?.fours>0?mostFours.name:null,mostFours?.team,(mostFours?.fours===1?'1 four':mostFours?.fours+' fours'),'');
  html+='</div>';

  // Tournament summary numbers
  let totalRuns=0,totalWkts=0,usedIds=new Set();
  done.forEach(m=>mainInns(m).forEach(inn=>{totalRuns+=inn.runs||0;totalWkts+=inn.wickets||0;
    Object.keys(inn.batsmen||{}).forEach(id=>usedIds.add(id));Object.keys(inn.bowlers||{}).forEach(id=>usedIds.add(id));}));
  let totalSixes=batting.reduce((s,p)=>s+p.sixes,0);
  let totalFours=batting.reduce((s,p)=>s+p.fours,0);
  let totalCents=batting.reduce((s,p)=>s+p.centuries,0);
  let totalHalfs=batting.reduce((s,p)=>s+p.halfCenturies,0);

  html+=`<div class="card" style="margin-top:14px">
    <div class="ch">📊 Tournament Summary</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
      ${[['Total Runs',totalRuns,'var(--gold)'],['Total Wickets',totalWkts,'var(--red)'],
         ['Centuries',totalCents,'var(--gold)'],['Half-Centuries',totalHalfs,'var(--amber)'],
         ['Sixes Hit',totalSixes,'var(--purple)'],['Fours Hit',totalFours,'var(--blue)'],
         ['Matches Played',done.length,'var(--em)'],['Players Used',usedIds.size||batting.length,'var(--dim)'],
         ['Teams',APP.teams.length,'var(--dim)']
        ].map(([label,val,col])=>`
        <div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:8px;padding:10px 6px">
          <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:${col}">${val}</div>
          <div style="font-size:10px;color:var(--dim);margin-top:3px">${label}</div>
        </div>`).join('')}
    </div>
  </div>`;

  _awTxt=[`🏆 *${APP.tournament.name||'Tournament'}${APP.tournament.edition?' — '+APP.tournament.edition:''}* — Awards`,''].concat(AW).join('\n');
  el.innerHTML=html;
}
function renderCompleted(){
  let el=document.getElementById('hm');
  let done=APP.matches.filter(m=>m.status==='completed');
  if(!done.length){el.innerHTML='<p style="color:var(--dim)">No completed matches yet.</p>';return;}
  el.innerHTML=done.map(m=>{
    let sc=m.innings.map(inn=>{let t=APP.teams.find(x=>x.id===inn.battingTeamId);return`${inn.super?'⚡'+soName(m,inn).replace(/Super Over ?/,'SO')+' ':''}${t?esc(t.code):'?'}: ${scTxt(inn)} (${ov(inn)})`;}).join(' | ');
    let hmt=m.matchType||'League';
    let hmtcol=hmt==='Final'?'var(--gold)':hmt==='Semi Final'?'var(--purple)':hmt==='Quarter Final'||hmt==='Round of 16'?'var(--blue)':hmt.startsWith('Group')?'var(--amber)':'var(--em)';
    return`<div class="hcard" onclick="showMHist('${m.id}')">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span style="font-family:var(--mono);font-size:9px;padding:1px 6px;border-radius:6px;background:rgba(0,0,0,.3);color:${hmtcol};border:1px solid ${hmtcol}">${esc(hmt.toUpperCase())}</span>
        <div class="hteams">${gtn(m.teamAId)} vs ${gtn(m.teamBId)}</div>
      </div>
      <div class="hsc">${sc}</div>
      <div class="hres" style="color:${m.winner==='no_result'?'var(--amber)':'var(--em)'}">${esc(m.resultText||'—')}</div>
      ${m.motm&&playerNameInMatch(m,m.motm)?`<div style="font-size:11px;color:var(--dim);margin-top:2px">🏅 Player of the Match: ${av(m.motm,18)}<b style="color:var(--gold)">${esc(playerNameInMatch(m,m.motm))}</b></div>`:''}
      <div style="font-size:10px;color:var(--dim);margin-top:2px">📍 ${esc(venueTxt(m))} | 📅 ${esc(m.date)}</div>
    </div>`;
  }).join('');
}
function scHTML(mid){
  let sel=document.getElementById('sc-sel'),prev=sel.value;
  if(![...sel.options].some(o=>o.value===mid))populateSCSelect();
  sel.value=mid;renderSC();
  let c=document.getElementById('sc-cont').innerHTML;
  sel.value=prev;
  if(prev)renderSC();else document.getElementById('sc-cont').innerHTML='<p style="color:var(--dim)">Select a match.</p>';
  return c;
}
function showMHist(mid){
  document.getElementById('mhist-cont').innerHTML=scHTML(mid);
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(document.getElementById('mhist-cont'));
  openM('mhist-mo');
}
// ── Print: only the scorecard goes to the printer (or Save as PDF)
function printScorecard(mid){
  let m=APP.matches.find(x=>x.id===mid);if(!m)return;
  let pa=document.getElementById('print-area');
  pa.innerHTML=`<h2 style="margin:0 0 4px;font-family:Georgia,serif">${esc(APP.tournament.name||'Stumply')}</h2>`+scHTML(mid)
    +`<p style="margin-top:14px;font-size:10px;color:#555">Printed from Stumply · stumply.pages.dev</p>`;
  document.body.classList.add('printing');
  let done=()=>{document.body.classList.remove('printing');window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  setTimeout(()=>{window.print();setTimeout(done,1500);},50);
}
const KO_STAGES=['Round of 16','Quarter Final','Semi Final','3rd Place Play-off','Final'];
function koTeams(){let k=new Set();APP.matches.forEach(m=>{if(KO_STAGES.includes(m.matchType)){k.add(m.teamAId);k.add(m.teamBId);}});return k;}
function pointsRows(){
  let s={};
  const blank=()=>({p:0,w:0,l:0,t:0,nr:0,pts:0,rf:0,bf:0,ra:0,ba:0});
  APP.teams.forEach(t=>{s[t.id]=blank();});
  // Only League and Group matches count toward the points table
  let leagueTypes=new Set(['League','Group A','Group B','Group C','Group D']);
  let quota=(APP.tournament.overs||20)*6;
  APP.matches.filter(m=>m.status==='completed'&&leagueTypes.has(m.matchType||'League')).forEach(m=>{
    let A=s[m.teamAId],B=s[m.teamBId];
    if(!A||!B)return;
    A.p++;B.p++;
    if(m.winner==='tie'){A.pts++;B.pts++;A.t++;B.t++;}
    else if(m.winner==='no_result'||!m.winner){A.pts++;B.pts++;A.nr++;B.nr++;return;} // 1 point each, excluded from NRR
    else if(s[m.winner]){s[m.winner].w++;s[m.winner].pts+=2;let l=m.teamAId===m.winner?m.teamBId:m.teamAId;if(s[l])s[l].l++;}
    mainInns(m).forEach(inn=>{
      // A side that is bowled out is treated as having faced its full quota of overs
      let q=inn.maxBalls>0?inn.maxBalls:quota;
      let b=allOut(inn)?q:Math.min(inn.legalBalls,q);
      if(s[inn.battingTeamId]){s[inn.battingTeamId].rf+=inn.runs;s[inn.battingTeamId].bf+=b;}
      if(s[inn.bowlingTeamId]){s[inn.bowlingTeamId].ra+=inn.runs;s[inn.bowlingTeamId].ba+=b;}
    });
  });
  let sorted=APP.teams.map(t=>{
    let x=s[t.id]||blank();
    let rrf=x.bf>0?x.rf/(x.bf/6):0,rra=x.ba>0?x.ra/(x.ba/6):0;
    return{team:t,...x,nrr:(rrf-rra).toFixed(3)};
  }).sort((a,b)=>b.pts-a.pts||parseFloat(b.nrr)-parseFloat(a.nrr));
  return sorted;
}
function renderPoints(){
  let el=document.getElementById('pt'),sorted=pointsRows(),ko=koTeams();
  if(!sorted.length){el.innerHTML='<p style="color:var(--dim)">No teams yet.</p>';return;}
  el.innerHTML=`<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>T</th><th>NR</th><th>Pts</th><th>NRR</th></tr></thead><tbody>`
    +sorted.map((x,i)=>`<tr>
      <td style="color:var(--gold);font-family:var(--mono)">${i+1}</td>
      <td style="white-space:nowrap">${av(x.team.id,22)}<span class="tag tg">${esc(x.team.code)}</span> ${esc(x.team.name)}${ko.has(x.team.id)?' <span class="tag" style="background:#FBF3DC;color:#8A6A10;border:1px solid #E9C46A" title="Qualified">Q</span>':''}</td>
      <td style="font-family:var(--mono)">${x.p}</td>
      <td style="font-family:var(--mono);color:var(--em)">${x.w}</td>
      <td style="font-family:var(--mono);color:var(--red)">${x.l}</td>
      <td style="font-family:var(--mono)">${x.t}</td>
      <td style="font-family:var(--mono)">${x.nr}</td>
      <td style="font-family:var(--mono);font-weight:700;color:var(--gold)">${x.pts}</td>
      <td style="font-family:var(--mono);color:${parseFloat(x.nrr)>=0?'var(--em)':'var(--red)'}">${x.nrr>0?'+':''}${x.nrr}</td>
    </tr>`).join('')+'</tbody></table></div>'+(ko.size?'<div style="font-size:11px;color:var(--dim);margin-top:6px">Q = qualified for the knockouts</div>':'');
}

// ══════════════════════════════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════════════════════════════
function renderHome(){
  document.getElementById('htnm').textContent=`${APP.tournament.name} — ${APP.tournament.edition}`;
  document.getElementById('hinfo').innerHTML=`
    <div>🏆 <b>${esc(APP.tournament.name)}</b></div>
    <div>📅 ${esc(APP.tournament.edition)}, ${esc(APP.tournament.year)}</div>
    <div>🏏 ${APP.teams.length} Teams | 📋 ${APP.matches.length} Matches</div>
    <div>⏱ ${APP.tournament.overs||20}-over format | ✅ ${APP.matches.filter(m=>m.status==='completed').length} Completed</div>
    ${APP.uname?`<div style="color:var(--dim);font-size:11px;margin-top:3px">Owner: <b style="color:var(--gold)">${esc(APP.dname)}</b></div>`:''}`;
  let live=APP.matches.find(m=>m.status==='live');
  let lel=document.getElementById('hlive');
  if(live){
    let tA=APP.teams.find(t=>t.id===live.teamAId),tB=APP.teams.find(t=>t.id===live.teamBId);
    let inn=live.innings[live.currentInnings];
    lel.innerHTML=`<div style="color:var(--red);font-family:var(--disp)">🔴 LIVE</div>
      <div style="font-family:var(--disp);font-size:14px;margin-top:3px">${tA?esc(tA.name):'?'} vs ${tB?esc(tB.name):'?'}</div>
      ${inn?`<div style="font-size:18px;color:var(--gold);margin-top:3px;font-weight:700">${esc(rawTeamName(inn.battingTeamId))}: ${scTxt(inn)} (${ov(inn)})</div>`:''}
      <button class="bsm" style="margin-top:8px" onclick="showTab('live')">View Live →</button>`;
  } else {let last=lastCompletedMatch();lel.innerHTML='<p style="color:var(--dim)">No live match right now.</p>'+(last?'<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bdr)">'+resultCard(last)+'</div>':'');}
  let up=APP.matches.filter(m=>m.status==='scheduled');
  let uel=document.getElementById('hup');
  if(!up.length){uel.innerHTML='<p style="color:var(--dim)">No upcoming matches.</p>';return;}
  uel.innerHTML=up.slice(0,3).map(m=>{
    let tA=APP.teams.find(t=>t.id===m.teamAId),tB=APP.teams.find(t=>t.id===m.teamBId);
    return`<div style="padding:7px 0;border-bottom:1px solid var(--bdr)">
      <div style="font-family:var(--disp)">${tA?esc(tA.name):'?'} <span style="color:var(--dim)">vs</span> ${tB?esc(tB.name):'?'}</div>
      <div style="font-size:11px;color:var(--dim)">📅 ${esc(m.date)} | 📍 ${esc(venueTxt(m))}</div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════════════════════
function rawTeamName(id){return (APP.teams.find(x=>x.id===id)||{name:id||'—'}).name;}
function playerNameInMatch(m,pid){
  if(!m||!pid)return '';
  for(let inn of (m.innings||[])){
    if(inn.batsmen&&inn.batsmen[pid])return inn.batsmen[pid].name;
    if(inn.bowlers&&inn.bowlers[pid])return inn.bowlers[pid].name;
  }
  return '';
}
function activeTabName(){
  let v=document.querySelector('.view.active');return v?v.id.replace('view-',''):'home';
}
function gtn(id){if(!id||id==='tie')return id==='tie'?'Tie':'—';return esc((APP.teams.find(x=>x.id===id)||{name:id}).name);}
function openM(id){document.getElementById(id).classList.add('on');}
function closeM(id){document.getElementById(id).classList.remove('on');}
function toast(msg,type){
  let el=document.getElementById('toast');
  el.textContent=msg;
  el.style.border='1px solid '+(type==='warn'?'#ffb74d':'transparent');
  el.style.color=type==='warn'?'#ffcc80':'#fff';
  el.classList.add('on');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),3500);
}
// Backdrop close (not for mandatory modals)
document.querySelectorAll('.mo').forEach(o=>{
  o.addEventListener('click',e=>{
    if(e.target===o&&!['toss-mo','ins-mo','nov-mo'].includes(o.id))o.classList.remove('on');
  });
});
// Enter key on auth screen
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  let as=document.getElementById('authscr');
  if(!as||as.style.display==='none')return;
  if(!(e.target&&e.target.closest&&e.target.closest('#aorg')))return; // the search box has its own Enter
  if(document.getElementById('apanel-login').classList.contains('on'))doLogin();
  else if(document.getElementById('apanel-reg').classList.contains('on'))doRegister();
  else if(document.getElementById('apanel-forgot').classList.contains('on'))fpStep1();
});
