// Stumply — Navigation, tournament settings, teams, players, photos and match scheduling.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════════════════
function showTab(t){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  // Show the target view
  let v=document.getElementById('view-'+t);
  if(v)v.classList.add('active');
  // Mark the correct tab button active — buttons use data-action (not onclick)
  document.querySelectorAll('.tab-btn').forEach(b=>{
    let act=b.getAttribute('data-action')||b.getAttribute('onclick')||'';
    if(act.includes("'"+t+"'"))b.classList.add('active');
  });
  {let gl=document.getElementById('sync-golive');if(gl)gl.style.display=t==='live'?'none':'';}
  // Render content for this tab
  if(t==='live')    { renderLive(); return; }
  if(t==='home')    { renderHome(); return; }
  if(t==='matches') { renderMatches(); return; }
  if(t==='scorecard'){ populateSCSelect(); renderSC(); return; }
  if(t==='history') { renderHistory(); return; }
  if(t==='admin'){
    // Small delay on mobile to ensure DOM is ready after CSS transition
    if(APP.role!=='admin'){toast('Admin access only');return;}
    setTimeout(()=>{
      try{renderTeamList();}catch(e){console.error('renderTeamList:',e);}
      try{filterPlayers();}catch(e){console.error('filterPlayers:',e);}
      try{buildBulkTable();}catch(e){}
    },50);
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  TOURNAMENT / TEAMS
// ══════════════════════════════════════════════════════════════════════════
function getOversFromUI(){
  let sel=document.getElementById('t-overs');if(!sel)return APP.tournament.overs||20;
  if(sel.value==='custom'){let c=parseInt(document.getElementById('t-overs-custom').value);return(c>0&&c<=100)?c:20;}
  return parseInt(sel.value)||20;
}
function bowlerMaxOvers(totalOvers){return Math.max(1,Math.ceil(totalOvers/5));}
// Legal balls a bowler has bowled, and whether he can still start a full over
function bowlerBalls(b){return b?(b.overs||0)*6+(b.balls||0):0;}
function bowlerOvTxt(b){let t=bowlerBalls(b);return Math.floor(t/6)+(t%6?'.'+t%6:'');}
// A bowler may start a new over until he has bowled his quota of balls (part overs carry over)
function bowlerMaxed(b){return bowlerBalls(b)>=bowlerMaxOvers(liveOvers())*6;}
function maxBalls(){return(APP.tournament.overs||20)*6;}
function cmText(c){
  let r=+c.r||0,t,k='';
  if(c.e==='run'){t=r===4?'FOUR! 🔥':r===6?'SIX! 🚀':r===0?'no run':plural(r,'run');k=r===4?'4':r===6?'6':'';}
  else if(c.e==='wd'){t='wide'+(r>1?' + '+plural(r-1,'run'):'');k='x';}
  else if(c.e==='nb'){t='no ball'+(r>1?' + '+plural(r-1,'run'):'')+(c.d==='bat'?' (off the bat)':'');k='x';}
  else if(c.e==='b'){t=plural(r,'bye');k='x';}
  else if(c.e==='lb'){t=plural(r,'leg bye');k='x';}
  else if(c.e==='rh'){t='Retired hurt';k='x';}
  else if(c.e==='rb'){t='Back in to bat';k='';}
  else {t='OUT!';k='w';}
  return {t,k};
}
function cmRow(c){
  let {t,k}=cmText(c);
  let more=c.e==='out'?` <span>${esc(c.d||'')}</span>${c.x?' ('+(c.x==='wide'?'wide':'no ball')+')':''}${+c.r?' · '+plural(+c.r,'run'):''}`:'';
  if(c.e==='rh'||c.e==='rb')return `<div class="cm-row${k?' cm-'+k:''}"><span class="cm-o">${esc(c.o)}</span><div><span class="cm-who">${esc(c.d||'')}</span><br><b>🚑 ${esc(t)}</b></div></div>`;
  return `<div class="cm-row${k?' cm-'+k:''}"><span class="cm-o">${esc(c.o)}</span><div>${c.fh?'<span>Free hit</span> · ':''}<span class="cm-who">${esc(c.b)} → ${esc(c.s)}</span><br><b>${esc(t)}</b>${more}</div></div>`;
}
// Newest first, with a line between overs
function cmList(inn,limit){
  let log=(inn.log||[]).slice().reverse();if(limit)log=log.slice(0,limit);
  let out='',ovr=null;
  log.forEach(c=>{let o=String(c.o).split('.')[0];if(ovr!==null&&o!==ovr)out+=`<div class="cm-over">— End of over ${+o+1} —</div>`;ovr=o;out+=cmRow(c);});
  return `<div class="cm-list">${out}</div>`;
}
// Per-innings limits: overs can be cut for rain, a Super Over is 6 balls, smaller sides have fewer wickets
function innBalls(inn){return inn&&inn.maxBalls>0?inn.maxBalls:maxBalls();}
function innOvers(inn){return Math.round(innBalls(inn)/6);}
function innMaxW(inn){return inn&&inn.maxW>0?inn.maxW:10;}
function allOut(inn){return !!inn&&inn.wickets>=innMaxW(inn);}
function liveOvers(){let m=APP.liveMatch,inn=m&&m.innings[m.currentInnings];return inn?innOvers(inn):(APP.tournament.overs||20);}
// Players per side for this tournament (2 to 11)
function teamSize(){let n=+APP.tournament.teamSize;return n>=2&&n<=11?n:11;}
function mainInns(m){return ((m&&m.innings)||[]).filter(i=>!i.super);}
// "Super Over", or "Super Over 1 / 2 / …" when a match needed more than one
function soName(m,inn){return 'Super Over'+((m&&(m.innings||[]).length>4)||inn.number>4?' '+Math.floor((inn.number-1)/2):'');}
function innLabel(inn,m){return inn.super?soName(m,inn):'Innings '+inn.number;}
function updateBowlerMaxLabel(){
  let ov=getOversFromUI(),mx=bowlerMaxOvers(ov);
  let el=document.getElementById('t-bwl-max');if(el)el.textContent=mx+' ov';
}
function getBaseUrl(){
  try{
    let href=location.href||'';
    // Remove any existing query string and hash
    let base=href.split('?')[0].split('#')[0];
    // Sanity check: must start with http and not be srcdoc/null/blob
    if(base.startsWith('http')&&!base.includes('srcdoc')&&!base.includes('blob:')){
      return base;
    }
  }catch(e){}
  // Fallback: try to build from host
  try{
    if(location.hostname&&location.hostname!=='null'){
      let proto=location.protocol&&location.protocol!=='null:'?location.protocol:'https:';
      let port=location.port?':'+location.port:'';
      return proto+'//'+location.hostname+port+'/';
    }
  }catch(e){}
  return null; // can't determine URL
}
function updateShareLink(){
  let el=document.getElementById('share-url');if(!el||!APP.tid)return;
  let base=getBaseUrl();
  if(base){
    el.value=base+'?t='+encodeURIComponent(APP.tid);
    el.style.color='var(--em)';
    let oe=document.getElementById('ovl-url');if(oe)oe.value=overlayLink();
    el.removeAttribute('title');
  } else {
    // Running in an iframe/preview — show the query only
    el.value='?t='+encodeURIComponent(APP.tid);
    el.style.color='var(--amber)';
    el.setAttribute('title','Add your site address in front, e.g. https://stumply.pages.dev/?t='+APP.tid);
    el.removeAttribute('readonly');
  }
}
function copyShareLink(){
  let el=document.getElementById('share-url');if(!el||!el.value){toast('Save tournament first');return;}
  navigator.clipboard.writeText(el.value).then(()=>toast('✅ Link copied!')).catch(()=>{el.select();document.execCommand('copy');toast('✅ Copied!');});
}
function openShareLink(){
  let el=document.getElementById('share-url');if(!el||!el.value){toast('Save tournament first');return;}
  window.open(el.value,'_blank');
}
function saveTournament(){
  if(ownerOnly())return;
  let name=document.getElementById('t-name').value.trim();
  if(!name){toast('Enter a tournament name','warn');document.getElementById('t-name').focus();return;}
  let yr=String(document.getElementById('t-yr').value).trim();
  if(!/^\d{4}$/.test(yr)||+yr<2000||+yr>2100){toast('Enter a year between 2000 and 2100','warn');document.getElementById('t-yr').focus();return;}
  let sel=document.getElementById('t-overs');
  if(sel&&sel.value==='custom'){
    let raw=String(document.getElementById('t-overs-custom').value).trim();
    if(!/^\d+$/.test(raw)||+raw<1||+raw>100){toast('Overs must be a whole number from 1 to 100','warn');document.getElementById('t-overs-custom').focus();return;}
  }
  APP.tournament.name=name.slice(0,60);
  APP.tournament.edition=document.getElementById('t-ed').value.trim().slice(0,40)||'Season 1';
  APP.tournament.year=+yr;
  APP.tournament.overs=getOversFromUI();
  let tsz=document.getElementById('t-size'),oldSize=teamSize();
  if(tsz){let n=+tsz.value;APP.tournament.teamSize=n>=2&&n<=11?n:11;}
  if(teamSize()!==oldSize)buildBulkTable();
  APP.tournament.city=String(document.getElementById('t-city').value||'').trim().slice(0,40);
  let wasL=!!APP.tournament.listed;APP.tournament.listed=!!document.getElementById('t-listed').checked;
  if(wasL&&!APP.tournament.listed)APP.tournament.wasListed=true;
  APP.tournament.lms=!!(document.getElementById('t-lms')||{}).checked;
  APP.tournament.noLBW=!!(document.getElementById('t-nolbw')||{}).checked;
  APP.tournament.noFH=!(document.getElementById('t-fh')||{checked:true}).checked;
  saveState();toast('Saved ✓');renderHome();updateShareLink();
}
const DROLES=['Batsman','Batsman','Batsman','Wicket-keeper','All-rounder','All-rounder','Batsman','Bowler','Bowler','Bowler','Bowler'];
const DPNAMES=['Opener 1','Opener 2','No.3 Bat','Wicket-keeper','All-rounder 1','All-rounder 2','Middle-order','Bowler 1','Bowler 2','Bowler 3','Bowler 4'];
const DJERSEYS=[1,2,3,7,33,8,63,93,11,23,4];
const ROLES=['Batsman','Bowler','All-rounder','Wicket-keeper'];
function buildBulkTable(){
  let tb=document.getElementById('btbody');if(!tb)return;tb.innerHTML='';
  let N=teamSize();setTxt(document.getElementById('bt-size-lbl'),N+' mandatory players');
  // Mandatory players (players per side)
  for(let i=1;i<=N;i++){
    let ro=ROLES.map(r=>`<option${r===DROLES[i-1]?' selected':''}>${r}</option>`).join('');
    tb.innerHTML+=`<tr style="${i===1?'border-top:2px solid var(--edim)':''}">
      <td class="pn" style="color:var(--gold)">${i}</td>
      <td><input class="pi" id="bp-n${i}" placeholder="${DPNAMES[i-1]}" style="border-color:var(--edim)"></td>
      <td><input class="pj" id="bp-j${i}" value="${DJERSEYS[i-1]}" type="number" min="1" max="999"></td>
      <td><select class="ps" id="bp-r${i}">${ro}</select></td></tr>`;
  }
  // Separator row
  tb.innerHTML+=`<tr><td colspan="4" style="padding:6px 4px;font-family:var(--mono);font-size:10px;color:var(--amber);letter-spacing:1px;border-top:1px dashed var(--bdr);border-bottom:1px dashed var(--bdr)">
    ➕ OPTIONAL SUBSTITUTES (${N+1}–${N+3})
  </td></tr>`;
  // 3 optional substitute rows
  for(let i=N+1;i<=N+3;i++){
    let ro=ROLES.map(r=>`<option${r==='Batsman'?' selected':''}>${r}</option>`).join('');
    tb.innerHTML+=`<tr style="opacity:0.7">
      <td class="pn" style="color:var(--amber)">${i}</td>
      <td><input class="pi" id="bp-n${i}" placeholder="Sub ${i-N} (optional)"></td>
      <td><input class="pj" id="bp-j${i}" value="${i*10}" type="number" min="1" max="999"></td>
      <td><select class="ps" id="bp-r${i}">${ro}</select></td></tr>`;
  }
}
function clearBulk(){
  ['nt-name','nt-code','nt-city'].forEach(id=>document.getElementById(id).value='');
  let N=teamSize();
  for(let i=1;i<=N;i++){let n=document.getElementById('bp-n'+i);if(n)n.value='';let j=document.getElementById('bp-j'+i);if(j)j.value=DJERSEYS[i-1];}
  for(let i=N+1;i<=N+3;i++){let el=document.getElementById('bp-n'+i);if(el)el.value='';let ej=document.getElementById('bp-j'+i);if(ej)ej.value=i*10;}
}
function validJersey(v){let x=String(v).trim();return /^\d{1,3}$/.test(x)?+x:null;}
function addTeam(){
  if(ownerOnly())return;
  let name=document.getElementById('nt-name').value.trim().slice(0,40);
  let code=document.getElementById('nt-code').value.trim().toUpperCase();
  let city=document.getElementById('nt-city').value.trim().slice(0,40);
  if(!name||!code){toast('Enter team name and code','warn');return;}
  if(!/^[A-Z0-9]{2,4}$/.test(code)){toast('Team code must be 2 to 4 letters or numbers','warn');document.getElementById('nt-code').focus();return;}
  if(APP.teams.some(t=>t.name.trim().toLowerCase()===name.toLowerCase())){toast('A team with that name already exists','warn');return;}
  if(APP.teams.some(t=>String(t.code).toUpperCase()===code)){toast('A team with that code already exists','warn');return;}
  let players=[],names={},jerseys={},N=teamSize();
  for(let i=1;i<=N+3;i++){
    let nEl=document.getElementById('bp-n'+i);if(!nEl)continue;
    let n=(nEl.value||'').trim().slice(0,40);
    if(!n){
      if(i<=N){toast(`Player ${i} name is required — all ${N} players must be filled`,'warn');nEl.focus();return;}
      continue; // optional substitute left blank
    }
    let jEl=document.getElementById('bp-j'+i);
    let j=validJersey(jEl.value);
    if(j===null){toast(`Player ${i}: jersey number must be 0 to 999`,'warn');jEl.focus();return;}
    if(names[n.toLowerCase()]){toast(`Player ${i}: "${n}" is already in this team`,'warn');nEl.focus();return;}
    if(jerseys[j]){toast(`Player ${i}: jersey ${j} is already used in this team`,'warn');jEl.focus();return;}
    names[n.toLowerCase()]=1;jerseys[j]=1;
    let r=document.getElementById('bp-r'+i)?.value||'Batsman';
    players.push({id:uid('pl_'),name:n,jersey:j,role:r,mandatory:i<=N,isSub:i>N});
  }
  APP.teams.push({id:uid('tm_'),name,code,city,players});
  clearBulk();renderTeamList();populatePlayerTeamSel();saveState();
  let subCount=players.filter(p=>p.isSub).length;
  toast(`✅ ${name} added — ${N} players${subCount?` + ${subCount} sub${subCount>1?'s':''}`:''}`);
}
function deleteTeam(id){
  if(APP.role!=='admin'||ownerOnly())return;
  let t0=APP.teams.find(t=>t.id===id);if(!t0)return;
  let ms=APP.matches.filter(m=>m.teamAId===id||m.teamBId===id);
  if(ms.some(m=>m.status==='live')){toast(t0.name+' is playing a live match — finish or discard it first','warn');return;}
  let msg='Delete team '+t0.name+'?';
  if(ms.length){
    let done=ms.filter(m=>m.status==='completed').length,up=ms.length-done;
    let parts=[];if(done)parts.push(done+' completed');if(up)parts.push(up+' upcoming');
    msg='Delete team '+t0.name+' and its '+ms.length+' match'+(ms.length===1?'':'es')+' ('+parts.join(', ')+')?\n\n'
      +'Those scorecards are removed and the points table, stats and awards are recalculated without them. This cannot be undone.';
  }
  if(!window.confirm(msg))return;
  let gone=new Set(ms.map(m=>m.id));
  APP.matches=APP.matches.filter(m=>!gone.has(m.id));
  try{_undoStack=_undoStack.filter(u=>!gone.has(u.id));}catch(e){}
  t0.players.forEach(p=>{delete APP.photos[p.id];});delete APP.photos[id];
  APP.teams=APP.teams.filter(t=>t.id!==id);
  renderTeamList();populatePlayerTeamSel();filterPlayers();renderMatches();populateSCSelect();renderSC();renderHistory();renderHome();
  saveState();
  toast(ms.length?t0.name+' and '+ms.length+' match'+(ms.length===1?'':'es')+' deleted':t0.name+' deleted');
}
function renderTeamList(){
  let el=document.getElementById('tlist');if(!el)return;
  if(!APP.teams.length){el.innerHTML='<p style="color:var(--dim)">No teams yet.</p>';renderFees();return;}
  el.innerHTML=`<div class="tblwrap"><table><thead><tr><th>Logo</th><th>Code</th><th>Name</th><th>City</th><th>Players</th><th></th></tr></thead><tbody>`
    +APP.teams.map(t=>`<tr>
      <td>${APP.role==='admin'?photoCell(t.id):av(t.id,30)}</td>
      <td><span class="tag tg">${esc(t.code)}</span></td><td>${esc(t.name)}</td><td>${esc(t.city)||'—'}</td><td>${t.players.length}</td>
      <td>${APP.role==='admin'?`<button class="bsm bdng" onclick="deleteTeam('${t.id}')">✕</button>`:''}</td>
    </tr>`).join('')+'</tbody></table></div>';
  renderFees();
}
function populatePlayerTeamSel(){
  let el=document.getElementById('pt-sel');if(!el)return;
  el.innerHTML='<option value="">— Select Team —</option>'+APP.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
}
function filterPlayers(){
  let tid=document.getElementById('pt-sel').value;
  let el=document.getElementById('plist');
  if(!tid){el.innerHTML='';return;}
  let team=APP.teams.find(t=>t.id===tid);
  if(!team){el.innerHTML='';return;}
  let admin=APP.role==='admin';
  let roleOpts=sel=>ROLES.map(r=>`<option${r===sel?' selected':''}>${r}</option>`).join('');
  let rows=team.players.map(p=>`<div class="prow">
      <div>${admin?photoCell(p.id):av(p.id,34)}</div>
      ${admin?`<input class="ifield pe" style="flex:1 1 130px" value="${esc(p.name)}" maxlength="40" aria-label="Player name" onchange="updPlayer('${tid}','${p.id}','name',this.value)">`:`<b style="flex:1 1 130px">${esc(p.name)}</b>`}
      ${admin?`<input class="ifield pe" style="flex:0 0 64px" type="number" min="0" max="999" value="${esc(p.jersey)}" aria-label="Jersey number" onchange="updPlayer('${tid}','${p.id}','jersey',this.value)">`:`<span class="tag tb">${esc(p.jersey)}</span>`}
      ${admin?`<select class="sfield pe" style="flex:1 1 120px" aria-label="Role" onchange="updPlayer('${tid}','${p.id}','role',this.value)">${roleOpts(p.role)}</select>`:`<span class="tag ta">${esc(p.role)}</span>`}
      ${admin?`<label class="optlbl" style="display:inline-flex;gap:5px;font-size:12px;align-items:center"><input type="radio" name="capt-${tid}" ${team.captainId===p.id?'checked':''} onchange="setCaptain('${tid}','${p.id}')">Captain</label>`:(team.captainId===p.id?'<span class="tag tg">Captain</span>':'')}
      ${p.isSub?'<span class="tag ta">Sub</span>':''}
      ${admin?`<button class="bsm bdng" style="margin-left:auto" title="Remove player" onclick="delPlayer('${tid}','${p.id}')">✕</button>`:''}
    </div>`).join('');
  let add=admin?`<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:10px;padding-top:10px;border-top:1px dashed var(--bdr)">
      <input class="ifield pe" id="pa-name" placeholder="New player name" maxlength="40" style="flex:2;min-width:130px">
      <input class="ifield pe" id="pa-jersey" type="number" min="0" max="999" placeholder="No." style="width:64px">
      <select class="sfield pe" id="pa-role" style="flex:1;min-width:110px">${roleOpts('Batsman')}</select>
      <label class="optlbl" style="display:inline-flex;gap:5px;font-size:12px"><input type="checkbox" id="pa-sub">Substitute</label>
      <button class="bsm bgld" onclick="addPlayer('${tid}')">➕ Add player</button>
    </div>
    <p style="font-size:11px;color:var(--dim);margin-top:8px">Tap the circle to add an optional photo. Changes save automatically.</p>`:'';
  el.innerHTML=(team.players.length?rows:'<p style="color:var(--dim)">No players.</p>')+add;
}
function updPlayer(tid,pid,field,val){
  if(ownerOnly())return;
  if(APP.role!=='admin')return;
  let t=APP.teams.find(x=>x.id===tid),p=t&&t.players.find(x=>x.id===pid);if(!p)return;
  if(field==='name'){
    let n=String(val).trim().slice(0,40);
    if(!n){toast('Player name cannot be empty','warn');filterPlayers();return;}
    if(t.players.some(x=>x.id!==pid&&x.name.trim().toLowerCase()===n.toLowerCase())){toast(`"${n}" is already in this team`,'warn');filterPlayers();return;}
    p.name=n;
    // keep line-ups of matches that have not started in step
    APP.matches.forEach(m=>{if(m.status==='scheduled'&&m.playingXI&&m.playingXI[tid])m.playingXI[tid].forEach(x=>{if(x.id===pid)x.name=n;});});
  } else if(field==='jersey'){
    let j=validJersey(val);
    if(j===null){toast('Jersey number must be 0 to 999','warn');filterPlayers();return;}
    if(t.players.some(x=>x.id!==pid&&+x.jersey===j)){toast(`Jersey ${j} is already used in this team`,'warn');filterPlayers();return;}
    p.jersey=j;
  } else if(field==='role'){
    if(ROLES.includes(val))p.role=val;
  }
  saveState();toast('Player updated ✓');
}
function addPlayer(tid){
  if(ownerOnly())return;
  if(APP.role!=='admin')return;
  let t=APP.teams.find(x=>x.id===tid);if(!t)return;
  let n=document.getElementById('pa-name').value.trim().slice(0,40);
  let j=validJersey(document.getElementById('pa-jersey').value);
  if(!n){toast('Enter the player name','warn');document.getElementById('pa-name').focus();return;}
  if(j===null){toast('Jersey number must be 0 to 999','warn');document.getElementById('pa-jersey').focus();return;}
  if(t.players.some(x=>x.name.trim().toLowerCase()===n.toLowerCase())){toast(`"${n}" is already in this team`,'warn');return;}
  if(t.players.some(x=>+x.jersey===j)){toast(`Jersey ${j} is already used in this team`,'warn');return;}
  let sub=document.getElementById('pa-sub').checked;
  t.players.push({id:uid('pl_'),name:n,jersey:j,role:document.getElementById('pa-role').value,mandatory:!sub,isSub:sub});
  filterPlayers();renderTeamList();saveState();toast(`✅ ${n} added`);
}
function setCaptain(tid,pid){
  if(ownerOnly())return;
  if(APP.role!=='admin')return;
  let t=APP.teams.find(x=>x.id===tid);if(!t)return;
  t.captainId=pid;saveState();toast('Captain set ✓');
}
function isCaptain(pid){return APP.teams.some(t=>t.captainId===pid);}
function delPlayer(tid,pid){
  if(ownerOnly())return;
  if(APP.role!=='admin')return;
  let t=APP.teams.find(x=>x.id===tid),p=t&&t.players.find(x=>x.id===pid);if(!p)return;
  if(!window.confirm('Remove '+p.name+' from '+t.name+'? Past scorecards keep their records.'))return;
  t.players=t.players.filter(x=>x.id!==pid);
  if(t.captainId===pid)delete t.captainId;
  if(APP.photos[pid]){delete APP.photos[pid];}
  filterPlayers();renderTeamList();saveState();
}

// ══════════════════════════════════════════════════════════════════════════
//  OPTIONAL PHOTOS — players, team logos, umpires
//  Stored as small thumbnails inside the tournament, so no file storage is needed.
// ══════════════════════════════════════════════════════════════════════════
const PHOTO_RE=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/;
function photoOf(id){let d=id&&APP.photos&&APP.photos[id];return(typeof d==='string'&&d.length<60000&&PHOTO_RE.test(d))?d:null;}
function av(id,size){let d=photoOf(id);size=size||22;return d?`<img class="av" src="${d}" width="${size}" height="${size}" alt="" loading="lazy">`:'';}
function umpId(name){let k=String(name||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40);return k?'ump_'+k:'';}
function photoCell(id){
  let d=photoOf(id);
  return `<span style="display:inline-block;text-align:center"><button type="button" class="avbtn" title="${d?'Change photo':'Add photo'}" onclick="pickPhoto('${esc(id)}')">${d?`<img src="${d}" alt="">`:'📷'}</button>${d?`<button type="button" class="avx" onclick="removePhoto('${esc(id)}')">remove</button>`:''}</span>`;
}
function afterPhotoChange(){
  saveState();
  try{renderTeamList();filterPlayers();refreshUmpPhotos();renderMatches();refreshView();}catch(e){}
}
function pickPhoto(id){
  if(ownerOnly())return;
  if(APP.role!=='admin'||!id)return;
  let inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=()=>{
    let f=inp.files&&inp.files[0];if(!f)return;
    if(!/^image\//.test(f.type)){toast('Choose an image file','warn');return;}
    let url=URL.createObjectURL(f),img=new Image();
    img.onload=()=>{
      try{
        const S=128;let c=document.createElement('canvas');c.width=S;c.height=S;
        let side=Math.min(img.naturalWidth,img.naturalHeight);
        let sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;
        let ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,S,S);
        ctx.drawImage(img,sx,sy,side,side,0,0,S,S);
        let d=c.toDataURL('image/jpeg',0.72);
        if(!PHOTO_RE.test(d)||d.length>=60000){toast('That image could not be used','warn');return;}
        APP.photos[id]=d;afterPhotoChange();toast('📷 Photo saved');
      }catch(e){toast('That image could not be used','warn');}
      finally{URL.revokeObjectURL(url);}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);toast('That image could not be read','warn');};
    img.src=url;
  };
  inp.click();
}
function removePhoto(id){
  if(ownerOnly())return;
  if(APP.role!=='admin'||!APP.photos[id])return;
  delete APP.photos[id];afterPhotoChange();toast('Photo removed');
}
// Photo buttons under the umpire name fields in the schedule dialog
function refreshUmpPhotos(){
  [1,2,3].forEach(i=>{
    let box=document.getElementById('sch-up'+i),inp=document.getElementById('sch-u'+i);if(!box||!inp)return;
    let id=umpId(inp.value);
    box.innerHTML=id?photoCell(id):'<span style="font-size:10px;color:var(--dim)">Type a name to add a photo</span>';
    if(!inp._ph){inp._ph=1;inp.addEventListener('input',refreshUmpPhotos);}
  });
}
function umpLine(m){let u=realUmpires(m);return u.length?u.map(x=>av(umpId(x),18)+esc(x)).join(' · '):'Umpires not set';}

// ══════════════════════════════════════════════════════════════════════════
//  MATCH SCHEDULING
// ══════════════════════════════════════════════════════════════════════════
// Returns the last XI player IDs for a team from completed matches
function getLastXI(teamId){
  // Find most recent completed match involving this team
  let played=APP.matches.filter(m=>
    m.status==='completed'&&(m.teamAId===teamId||m.teamBId===teamId)
  );
  if(!played.length)return null;
  let last=played[played.length-1];
  // Collect players who actually batted or bowled
  let ids=new Set();
  last.innings.forEach(inn=>{
    if(inn.battingTeamId===teamId){
      Object.keys(inn.batsmen).forEach(id=>{
        if(inn.batsmen[id].status!=='yet')ids.add(id);
      });
    }
    if(inn.bowlingTeamId===teamId){
      Object.keys(inn.bowlers).forEach(id=>{
        let b=inn.bowlers[id];
        if(b.overs>0||b.balls>0)ids.add(id);
      });
    }
  });
  return ids.size>0?[...ids]:null;
}

function buildXIRows(side, teamId, prefilledPlayers){
  let cont=document.getElementById('sch-'+side+'-xi');
  let hint=document.getElementById('sch-'+side+'-hint');
  if(!cont)return;
  let team=APP.teams.find(t=>t.id===teamId);
  if(!team){cont.innerHTML='<p style="color:var(--dim);font-size:12px">Select a team above</p>';if(hint)hint.textContent='';return;}

  // Start with full squad in order
  let orderedPlayers=[...team.players];

  if(prefilledPlayers&&prefilledPlayers.length>0){
    // Edit mode — use the previously saved XI, top up with squad for any gaps
    let filledIds=new Set(prefilledPlayers.map(p=>p.id));
    let extras=orderedPlayers.filter(p=>!filledIds.has(p.id));
    orderedPlayers=[...prefilledPlayers,...extras];
    if(hint)hint.textContent='(pre-filled from saved lineup — edit as needed)';
  } else {
    // Check if team has played before → reorder to last XI first
    let lastIdArr=getLastXI(teamId); // returns array or null
    if(lastIdArr&&lastIdArr.length>0){
      let lastIdSet=new Set(lastIdArr); // array → Set for .has()
      let inLast=orderedPlayers.filter(p=>lastIdSet.has(p.id));
      let notInLast=orderedPlayers.filter(p=>!lastIdSet.has(p.id));
      orderedPlayers=[...inLast,...notInLast];
      if(hint)hint.textContent='(auto-filled from last match — edit as needed)';
    } else {
      // No previous match — just fill from squad (THE MAIN FIX)
      if(hint)hint.textContent=orderedPlayers.length>0?`✅ ${orderedPlayers.length} players loaded from squad`:' ⚠ No players in squad — add in Admin → Teams';
    }
  }

  // Mandatory rows (players per side) pre-filled from squad, then 3 optional sub slots
  let rows=[],N=teamSize();
  for(let i=0;i<N;i++){
    let p=orderedPlayers[i]||null;
    let nm=p?p.name:'';
    let pid=p?p.id:'';
    let isSub=p&&p.isSub;
    rows.push(`<div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
      <span style="font-family:var(--mono);font-size:10px;color:var(--gold);width:18px;text-align:center;flex-shrink:0">${i+1}</span>
      <input class="ifield xi-inp" data-side="${side}" data-idx="${i}" data-mandatory="1"
        style="font-size:12px;padding:4px 7px;flex:1;border-color:${nm?'var(--edim)':'var(--bdr)'}"
        placeholder="Required — Player ${i+1}"
        value="${nm.replace(/"/g,'&quot;')}"
        data-orig-id="${pid}">
    </div>`);
  }
  // Separator
  rows.push(`<div style="font-family:var(--mono);font-size:9px;color:var(--amber);letter-spacing:1px;padding:5px 0 3px 22px;border-top:1px dashed var(--bdr);margin-top:4px">➕ OPTIONAL SUBS</div>`);
  // Optional substitutes (slots 12-14)
  let subs=orderedPlayers.filter(p=>p.isSub);
  for(let i=0;i<3;i++){
    let p=subs[i]||null;
    let nm=p?p.name:'';
    let pid=p?p.id:'';
    rows.push(`<div style="display:flex;gap:4px;align-items:center;margin-bottom:2px;opacity:0.75">
      <span style="font-family:var(--mono);font-size:10px;color:var(--amber);width:18px;text-align:center;flex-shrink:0">${N+1+i}</span>
      <input class="ifield xi-inp" data-side="${side}" data-idx="${N+i}" data-mandatory="0"
        style="font-size:12px;padding:4px 7px;flex:1"
        placeholder="Sub ${i+1} (optional)"
        value="${nm.replace(/"/g,'&quot;')}"
        data-orig-id="${pid}">
    </div>`);
  }
  cont.innerHTML=rows.join('');
}

function onXINameChange(inp){
  // When admin edits a name, clear orig-id so we treat it as a new/override player
  if(inp.value.trim()!==inp.getAttribute('data-orig-val'))inp.removeAttribute('data-orig-id-locked');
}

function onSchTeamChange(side){
  let teamId=document.getElementById('sch-'+side).value;
  buildXIRows(side,teamId);
  // Cross-validate: warn if same team on both sides
  let a=document.getElementById('sch-a').value,b=document.getElementById('sch-b').value;
  let warn=document.getElementById('sch-warn');
  if(warn)warn.textContent=(a&&b&&a===b)?'⚠ Both teams are the same — select different teams':'';
}

function getXIFromRows(side, teamId){
  let team=APP.teams.find(t=>t.id===teamId);
  let players=[];
  let inputs=document.querySelectorAll(`input[data-side="${side}"]`);
  inputs.forEach((inp,i)=>{
    let nm=inp.value.trim();
    if(!nm)return; // skip blank (especially optional sub slots)
    let isMandatory=inp.getAttribute('data-mandatory')!=='0';
    let origId=inp.getAttribute('data-orig-id');
    // Try to match to existing squad player by id or name
    let existing=origId&&team?team.players.find(p=>p.id===origId):null;
    if(!existing&&team){
      existing=team.players.find(p=>p.name.toLowerCase()===nm.toLowerCase());
    }
    if(existing){
      players.push({id:existing.id,name:nm,jersey:existing.jersey,role:existing.role,isSub:!isMandatory});
    } else {
      players.push({id:uid('xi_'),name:nm,jersey:i+1,role:'Batsman',isSub:!isMandatory});
    }
  });
  return players;
}

let _schConfirmKey=null;
// A single match only offers the Friendly stage (plus whatever an existing match already uses)
let _stageHTML=null;
function limitStages(keep){
  let sel=document.getElementById('sch-stage');
  if(_stageHTML===null)_stageHTML=sel.innerHTML;
  sel.innerHTML=_stageHTML;
  if(APP.tournament.single)[...sel.options].forEach(o=>{if(o.value!=='Friendly'&&o.value!==keep)o.remove();});
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(sel);
}
function openSchedModal(){
  if(APP.tournament.single&&APP.matches.length){toast('A single match has only one game. To play another, tap New single match in Admin → My Tournaments.','warn');return;}
  if(APP.teams.length<2){toast('Add at least 2 teams first');return;}
  let opts=APP.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  document.getElementById('sch-a').innerHTML=opts;
  document.getElementById('sch-b').innerHTML=opts;
  document.getElementById('sch-d').value=todayISO();
  document.getElementById('sch-warn').textContent='';
  // Always start from a clean form
  ['sch-v','sch-u1','sch-u2','sch-u3'].forEach(id=>{document.getElementById(id).value='';});
  limitStages('');
  document.getElementById('sch-stage').value=APP.tournament.single?'Friendly':'League';
  let mo0=document.getElementById('sch-mo');mo0.removeAttribute('data-edit-id');
  let t0=mo0.querySelector('.mt');if(t0)setTxt(t0,'📅 Schedule Match');
  setTxt(document.getElementById('sch-save'),'📅 Schedule');
  _schConfirmKey=null;refreshUmpPhotos();
  // Always default Team A = first team, Team B = second team (different teams)
  document.getElementById('sch-a').value=APP.teams[0].id;
  document.getElementById('sch-b').value=APP.teams[1].id;
  // Build XI rows — pre-filled from each team's squad
  buildXIRows('a',APP.teams[0].id);
  buildXIRows('b',APP.teams[1].id);
  // Wire the team dropdowns so changing team A/B re-fills the XI
  let sa=document.getElementById('sch-a'),sb=document.getElementById('sch-b');
  sa.onchange=()=>onSchTeamChange('a');
  sb.onchange=()=>onSchTeamChange('b');
  openM('sch-mo');
}

function scheduleMatch(){
  let a=document.getElementById('sch-a').value,b=document.getElementById('sch-b').value;
  if(!a||!b||a===b){toast('Select two different teams');return;}
  let xiA=getXIFromRows('a',a);
  let xiB=getXIFromRows('b',b);
  // Count mandatory XI (first 11 slots) — all must be filled
  let mandatoryA=document.querySelectorAll(`input[data-side="a"][data-mandatory="1"]`);
  let mandatoryB=document.querySelectorAll(`input[data-side="b"][data-mandatory="1"]`);
  let emptyA=[...mandatoryA].filter(el=>!el.value.trim());
  let emptyB=[...mandatoryB].filter(el=>!el.value.trim());
  if(emptyA.length>0){
    toast(`Team A: fill all ${teamSize()} players (${emptyA.length} missing)`,'warn');
    emptyA[0].focus();return;
  }
  if(emptyB.length>0){
    toast(`Team B: fill all ${teamSize()} players (${emptyB.length} missing)`,'warn');
    emptyB[0].focus();return;
  }
  if(xiA.length<teamSize()){toast(`Team A must have ${teamSize()} players`,'warn');return;}
  if(xiB.length<teamSize()){toast(`Team B must have ${teamSize()} players`,'warn');return;}
  let matchType=document.getElementById('sch-stage').value||'League';
  let venue=document.getElementById('sch-v').value.trim();
  let date=document.getElementById('sch-d').value;
  let warnEl=document.getElementById('sch-warn');warnEl.textContent='';
  let editing=document.getElementById('sch-mo').getAttribute('data-edit-id');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){warnEl.textContent='⚠ Choose the match date.';document.getElementById('sch-d').focus();return;}
  let soft=[];
  if(date<todayISO())soft.push('That date is in the past.');
  if(APP.matches.some(x=>x.id!==editing&&x.status==='scheduled'&&x.date===date&&((x.teamAId===a&&x.teamBId===b)||(x.teamAId===b&&x.teamBId===a))))
    soft.push('These two teams already have a match scheduled on that date.');
  if(soft.length){
    let key=[a,b,date,editing||'',soft.length].join('|');
    if(_schConfirmKey!==key){_schConfirmKey=key;warnEl.textContent='⚠ '+soft.join(' ')+' Tap the button again to save anyway.';return;}
  }
  _schConfirmKey=null;
  let umpires=[document.getElementById('sch-u1').value.trim(),
               document.getElementById('sch-u2').value.trim(),
               document.getElementById('sch-u3').value.trim()];
  let mo=document.getElementById('sch-mo');
  let editId=mo.getAttribute('data-edit-id');
  if(editId){
    // Edit mode — update existing match
    let m=APP.matches.find(x=>x.id===editId);
    if(m){m.teamAId=a;m.teamBId=b;m.matchType=matchType;m.venue=venue;m.date=date;m.umpires=umpires;m.playingXI={[a]:xiA,[b]:xiB};m.size=teamSize();}
    mo.removeAttribute('data-edit-id');
    let title=mo.querySelector('.mt');if(title)setTxt(title,'📅 Schedule Match');
    closeM('sch-mo');renderMatches();populateSCSelect();saveState();toast('Match updated ✓');
  } else {
    // New match
    APP.matches.push({
      id:uid('m_'),teamAId:a,teamBId:b,
      matchType,playingXI:{[a]:xiA,[b]:xiB},
      venue,date,umpires,size:teamSize(),
      status:'scheduled',innings:[],winner:null,toss:null,resultText:null
    });
    closeM('sch-mo');renderMatches();populateSCSelect();saveState();toast('Match scheduled ✓');
  }
}
// ── Auto fixtures: a League match for every pair of teams (round robin) ──
// Circle method: each round every team plays once, so nobody plays twice in a row.
function roundRobin(ids,twice){
  let t=ids.slice();if(t.length%2)t.push(null);
  let n=t.length,rounds=[];
  for(let r=0;r<n-1;r++){
    let games=[];
    for(let i=0;i<n/2;i++){let a=t[i],b=t[n-1-i];if(a&&b)games.push(r%2?[b,a]:[a,b]);}
    rounds.push(games);t.splice(1,0,t.pop());
  }
  // Order games inside each round so a team never plays the last game of one round and the first of the next
  for(let r=1;r<rounds.length;r++){let last=rounds[r-1][rounds[r-1].length-1]||[],g=rounds[r];
    for(let k=0;k<g.length&&g.length>1;k++){if(!last.includes(g[0][0])&&!last.includes(g[0][1]))break;g.push(g.shift());}}
  let all=rounds.flat();
  return twice?all.concat(all.map(([a,b])=>[b,a])):all;
}
function autoFixPlan(){
  let pairs=roundRobin(APP.teams.map(t=>t.id),!!(document.getElementById('fx-2')||{}).checked);
  // Skip pairs already scheduled: once if single round robin, per direction if twice
  let twice=!!(document.getElementById('fx-2')||{}).checked,seen={};
  APP.matches.filter(m=>(m.matchType||'League')==='League').forEach(m=>{let k=[m.teamAId,m.teamBId].sort().join('|');seen[k]=(seen[k]||0)+1;});
  return pairs.filter(([a,b])=>{let k=[a,b].sort().join('|');if(seen[k]>0){seen[k]--;return false;}return true;});
}
function updAutoFixInfo(){
  let el=document.getElementById('fx-info');if(!el)return;
  let plan=autoFixPlan(),per=Math.max(1,+document.getElementById('fx-n').value||1);
  el.textContent=plan.length?`${plan.length} ${plan.length===1?'match':'matches'} will be created over ${plural(Math.ceil(plan.length/per),'day')}.`:'Every pair of teams already has a League match.';
}
function openAutoFix(){
  if(APP.role!=='admin')return;
  if(APP.teams.length<3){toast('Add at least 3 teams first','warn');return;}
  document.getElementById('fx-d').value=todayISO();
  ['fx-n','fx-2','fx-d'].forEach(id=>{let e=document.getElementById(id);if(e)e.onchange=updAutoFixInfo;});
  updAutoFixInfo();openM('fix-mo');
}
function makeAutoFix(){
  let d=document.getElementById('fx-d').value,per=Math.max(1,+document.getElementById('fx-n').value||1),venue=document.getElementById('fx-v').value.trim().slice(0,60);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){toast('Choose the first match date','warn');return;}
  let plan=autoFixPlan();if(!plan.length){toast('Every pair of teams already has a League match','warn');return;}
  let day=new Date(d+'T12:00:00');
  plan.forEach(([a,b],i)=>{
    if(i&&i%per===0)day.setDate(day.getDate()+1);
    let date=new Date(day.getTime()-day.getTimezoneOffset()*60000).toISOString().slice(0,10);
    APP.matches.push({id:uid('m_'),teamAId:a,teamBId:b,matchType:'League',playingXI:{},venue,date,umpires:['','',''],size:teamSize(),
      status:'scheduled',innings:[],winner:null,toss:null,resultText:null});
  });
  closeM('fix-mo');renderMatches();populateSCSelect();saveState();
  toast(`✅ ${plan.length} ${plan.length===1?'match':'matches'} scheduled`);
}
function cancelSchModal(){
  let mo=document.getElementById('sch-mo');
  mo.removeAttribute('data-edit-id');
  let title=mo.querySelector('.mt');if(title)setTxt(title,'📅 Schedule Match');
  closeM('sch-mo');
}
function renderMatches(){
  let el=document.getElementById('mlist');
  let sb=document.getElementById('sched-btn');if(sb)sb.style.visibility=APP.tournament.single&&APP.matches.length?'hidden':'';
  let ab=document.getElementById('auto-btn');if(ab)ab.style.display=APP.tournament.single||APP.teams.length<3?'none':'';
  if(!APP.matches.length){el.innerHTML='<div class="card"><p style="color:var(--dim)">No matches scheduled yet.</p></div>';return;}
  el.innerHTML=APP.matches.map((m,idx)=>{
    let tA=APP.teams.find(t=>t.id===m.teamAId),tB=APP.teams.find(t=>t.id===m.teamBId);
    if(!tA||!tB)return'';
        let mt=m.matchType||'League';
    let mtColor=mt==='Final'?'var(--gold)':mt==='Semi Final'?'var(--purple)':mt==='Quarter Final'||mt==='Round of 16'?'var(--blue)':mt.startsWith('Group')?'var(--amber)':'var(--em)';
    let mtBg=mt==='Final'?'rgba(240,192,64,.2)':mt==='Semi Final'?'rgba(160,64,240,.2)':mt==='Quarter Final'||mt==='Round of 16'?'rgba(64,144,240,.2)':mt.startsWith('Group')?'rgba(240,160,48,.2)':'rgba(0,201,122,.15)';
    let stageBadge=`<span style="font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:8px;background:${mtBg};color:${mtColor};border:1px solid ${mtColor};margin-right:4px">${esc(mt.toUpperCase())}</span>`;
    let stag=m.status==='live'?'<span class="tag tr">🔴 LIVE</span>':m.status==='completed'?'<span class="tag tg">✅ DONE</span>':'<span class="tag tb">UPCOMING</span>';
    let sc=m.innings.map(inn=>{let t=APP.teams.find(x=>x.id===inn.battingTeamId);return`<div style="font-family:var(--mono);font-size:11px;color:var(--dim)">${inn.super?'⚡ '+soName(m,inn)+' · ':''}${t?esc(t.code):'?'}: ${scTxt(inn)} (${ov(inn)})</div>`;}).join('');
    let wr=m.resultText?`<div style="color:var(--em);font-size:12px;margin-top:3px">🏆 ${esc(m.resultText)}</div>${m.motm&&playerNameInMatch(m,m.motm)?`<div style="font-size:11px;color:var(--dim);margin-top:2px">🏅 Player of the Match: ${av(m.motm,18)}<b style="color:var(--gold)">${esc(playerNameInMatch(m,m.motm))}</b></div>`:''}`:'';
    let ab='';
    if(APP.role==='admin'){
      if(m.status==='scheduled'){
        ab+=`<button class="bsm bgld" onclick="startMatch('${m.id}')">▶ Start</button>`;
        ab+=`<button class="bsm bblu" onclick="openEditMatch('${m.id}')">✏️ Edit</button>`;
        ab+=`<button class="bsm bdng" onclick="deleteMatch('${m.id}')">🗑 Delete</button>`;
        let prev=APP.matches.slice(0,idx).reverse().find(x=>x.status==='scheduled');
        let next=APP.matches.slice(idx+1).find(x=>x.status==='scheduled');
        if(prev)ab+=`<button class="bsm" style="background:var(--bg2);color:var(--dim);border:1px solid var(--bdr);padding:6px 9px" onclick="moveMatch('${m.id}',-1)" title="Move up">↑</button>`;
        if(next)ab+=`<button class="bsm" style="background:var(--bg2);color:var(--dim);border:1px solid var(--bdr);padding:6px 9px" onclick="moveMatch('${m.id}',1)" title="Move down">↓</button>`;
      }else if(m.status==='live'){
        ab+=`<button class="bsm" onclick="showTab('live')">🔴 Score</button>`;
      }else if(m.status==='completed'){
        ab+=`<button class="bsm bdng" onclick="deleteMatch('${m.id}')">🗑 Delete</button>`;
      }
    }
    return`<div class="card" id="mc-${m.id}">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
          ${stageBadge}
          <div style="font-family:var(--disp);font-size:14px">${av(tA.id,22)}${esc(tA.name)} <span style="color:var(--dim)">vs</span> ${av(tB.id,22)}${esc(tB.name)}</div>
        </div>
        <div style="margin-left:auto">${stag}</div>
      </div>
      <div style="font-size:11px;color:var(--dim)">📍 ${esc(venueTxt(m))} &nbsp;|&nbsp; 📅 ${esc(m.date)}</div>
      <div style="font-size:11px;color:var(--dim)">👔 ${umpLine(m)}</div>
      ${sc}${wr}
      <div style="margin-top:9px;display:flex;gap:6px;flex-wrap:wrap">${ab}</div>
    </div>`;
  }).join('');
}
function deleteMatch(mid){
  let m=APP.matches.find(x=>x.id===mid);if(!m)return;
  if(m.status==='live'){toast('Cannot delete a live match — end it first','warn');return;}
  // Show inline confirm inside the match card
  let card=document.getElementById('mc-'+mid);
  if(!card)return;
  let existing=card.querySelector('.del-confirm');
  if(existing){existing.remove();return;}
  let div=document.createElement('div');
  div.className='del-confirm';
  div.style.cssText='margin-top:8px;background:rgba(232,64,64,.15);border:1px solid var(--red);border-radius:7px;padding:9px 12px;font-size:12px;color:var(--red)';
  div.innerHTML=`${m.status==='completed'?'Delete this completed match? Its scorecard is removed and the points table, stats and awards are recalculated without it. This cannot be undone.':'Are you sure you want to delete this match?'}
    <div style="display:flex;gap:7px;margin-top:7px">
      <button class="bsm bdng" style="flex:1" onclick="confirmDeleteMatch('${mid}')">Yes, Delete</button>
      <button class="bsm" style="flex:1;background:var(--bg2);color:var(--dim);border:1px solid var(--bdr)" onclick="this.closest('.del-confirm').remove()">Cancel</button>
    </div>`;
  card.appendChild(div);
}
function confirmDeleteMatch(mid){
  if(APP.role!=='admin')return;
  let dm=APP.matches.find(x=>x.id===mid);
  if(dm&&dm.status==='live'){toast('Cannot delete a live match — end it first','warn');return;}
  APP.matches=APP.matches.filter(x=>x.id!==mid);
  try{_undoStack=_undoStack.filter(u=>u.id!==mid);}catch(e){}
  renderMatches();populateSCSelect();renderSC();renderHistory();renderHome();saveState();toast('Match deleted');
}
function moveMatch(mid,dir){
  let idx=APP.matches.findIndex(x=>x.id===mid);if(idx<0)return;
  let newIdx=idx+dir;
  if(newIdx<0||newIdx>=APP.matches.length)return;
  [APP.matches[idx],APP.matches[newIdx]]=[APP.matches[newIdx],APP.matches[idx]];
  renderMatches();saveState();
}
function openEditMatch(mid){
  let m=APP.matches.find(x=>x.id===mid);if(!m)return;
  if(APP.teams.length<2){toast('Need at least 2 teams');return;}
  let opts=APP.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  document.getElementById('sch-a').innerHTML=opts;
  document.getElementById('sch-b').innerHTML=opts;
  document.getElementById('sch-a').value=m.teamAId;
  document.getElementById('sch-b').value=m.teamBId;
  document.getElementById('sch-v').value=m.venue||'';
  document.getElementById('sch-d').value=m.date||'';
  document.getElementById('sch-u1').value=m.umpires[0]||'';
  document.getElementById('sch-u2').value=m.umpires[1]||'';
  document.getElementById('sch-u3').value=m.umpires[2]||'';
  document.getElementById('sch-warn').textContent='';
  document.getElementById('sch-v').value=m.venue==='TBD'?'':(m.venue||'');
  // Pre-fill XI from the match's stored playingXI if available, else from squad
  buildXIRows('a',m.teamAId,m.playingXI?m.playingXI[m.teamAId]:null);
  buildXIRows('b',m.teamBId,m.playingXI?m.playingXI[m.teamBId]:null);
  let stageEl=document.getElementById('sch-stage');
  if(stageEl){limitStages(m.matchType||'League');stageEl.value=m.matchType||'League';}
  let sa=document.getElementById('sch-a'),sb=document.getElementById('sch-b');
  sa.onchange=()=>onSchTeamChange('a');
  sb.onchange=()=>onSchTeamChange('b');
  document.getElementById('sch-mo').setAttribute('data-edit-id',mid);
  let title=document.querySelector('#sch-mo .mt');
  if(title)setTxt(title,'✏️ Edit Match');
  setTxt(document.getElementById('sch-save'),'💾 Save changes');
  _schConfirmKey=null;refreshUmpPhotos();
  openM('sch-mo');
}
