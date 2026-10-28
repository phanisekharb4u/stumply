// ══════════════════════════════════════════════════════════════════════════
//  PLAYER ACCOUNTS: a player claims "This is me" on their name in any
//  tournament, and their career adds up across every organiser.
//  players/$uid  – public profile {name,city,role,at,claims:{tid~pid:{t,p,at}}}
//  claims/$tid/$pid – uid of the player who claimed it (organiser can remove)
// ══════════════════════════════════════════════════════════════════════════
const LS_PCLAIM='stumply_pclaim';
const careerUrl=uid=>location.origin+'/?player='+encodeURIComponent(uid);
// The signed-in account, also while watching a shared link
function myAuth(){
  if(AUTH)return AUTH;
  let s=safeParse(lsGet(LS_AUTH),null);
  if(s&&s.uid&&s.refreshToken&&SAFE_ID.test(s.uid)){AUTH=s;return AUTH;}
  return null;
}
function claimTid(){return APP.tid||APP.viewTid;}
function iOrganise(){let a=AUTH;return !!(a&&APP.role==='admin'&&careerOwner()===a.uid);}
async function renderClaim(pid,name){
  let el=document.getElementById('pl-claim'),tid=claimTid();
  if(!el||!tid||!SAFE_ID.test(pid))return;
  let who=null;
  try{who=await dbReq('GET','claims/'+tid+'/'+pid);}catch(e){return;}
  if(!document.getElementById('pl-claim')||_plLast!==pid)return;
  let me=AUTH?AUTH.uid:(safeParse(lsGet(LS_AUTH),null)||{}).uid,h='';
  if(typeof who==='string'&&SAFE_ID.test(who)){
    let pn='';try{pn=await dbReq('GET','players/'+who+'/name');}catch(e){}
    pn=typeof pn==='string'&&pn?pn:name;
    if(who===me)h=`<div class="pcl pcl-me">✅ This is you. These matches count in your player career.</div>
      <div class="pcl-btns"><button class="bsm bgld" onclick="openPlayerCareer('${who}')">🏆 My player career</button><button class="bsm" onclick="unclaimMe('${tid}','${pid}')">Not me</button></div>`;
    else h=`<div class="pcl">🧢 <b>${esc(pn)}</b> has a Stumply player account.</div>
      <div class="pcl-btns"><button class="bsm bgld" onclick="openPlayerCareer('${who}')">🏆 Career: all organisers</button>${iOrganise()?`<button class="bsm bdng" onclick="removeClaim('${tid}','${pid}')">Remove claim</button>`:''}</div>`;
  }else h=`<button class="bsm bblu" onclick="claimMe('${pid}')" data-n="${esc(name)}" id="pcl-btn">🙋 This is me: add to my player career</button>
    <p class="pcl-hint">Playing in more than one place? Sign in for free, tap this on your name in each tournament, and all your runs and wickets add up in one career, whoever organised the match.</p>`;
  el.innerHTML=h;
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(el);
}
function claimMe(pid){
  let tid=claimTid(),b=document.getElementById('pcl-btn'),name=b?b.getAttribute('data-n')||'':'';
  if(!tid)return;
  if(!myAuth()){
    lsSet(LS_PCLAIM,JSON.stringify({tid,pid,name:name.slice(0,60)}));
    closeM('pl-mo');
    showAuthScreen('Sign in or create a free account (Google is quickest). Then we add this player to your career.');
    return;
  }
  doClaim(tid,pid,name).then(ok=>{if(ok)renderClaim(pid,name);});
}
async function doClaim(tid,pid,name){
  let uid=AUTH.uid,prof=null;
  try{prof=await dbReq('GET','players/'+uid);}catch(e){}
  let up={};
  up['claims/'+tid+'/'+pid]=uid;
  up['players/'+uid+'/claims/'+tid+'~'+pid]={t:tid,p:pid,at:Date.now()};
  if(!prof||!prof.name)up['players/'+uid+'/name']=String(name||AUTH.name||'Player').slice(0,60);
  up['players/'+uid+'/at']=Date.now();
  try{await dbReq('PATCH','',up,true);toast('✅ Added to your player career');return true;}
  catch(e){
    if(e.message==='NETWORK'){toast('No connection — try again','warn');return false;}
    let who=null;try{who=await dbReq('GET','claims/'+tid+'/'+pid);}catch(x){}
    toast(who&&who!==uid?'Another player already claimed this name. Ask the organiser to remove it if it is wrong.':'Could not add it — try again','warn');
    return false;
  }
}
async function unclaimMe(tid,pid){
  if(!myAuth())return;
  let up={};up['claims/'+tid+'/'+pid]=null;up['players/'+AUTH.uid+'/claims/'+tid+'~'+pid]=null;
  try{await dbReq('PATCH','',up,true);toast('Removed from your player career');renderClaim(pid,'');}
  catch(e){toast(authErrText(e.message),'warn');}
}
async function removeClaim(tid,pid){
  if(!iOrganise())return;
  try{await dbReq('DELETE','claims/'+tid+'/'+pid,undefined,true);toast('Claim removed');renderClaim(pid,'');}
  catch(e){toast(authErrText(e.message),'warn');}
}
// After signing in from "This is me", finish the claim
async function finishPendingClaim(){
  let p=safeParse(lsGet(LS_PCLAIM),null);
  if(!p||!AUTH)return;
  lsRemove(LS_PCLAIM);
  if(!SAFE_ID.test(String(p.tid))||!SAFE_ID.test(String(p.pid)))return;
  if(await doClaim(p.tid,p.pid,String(p.name||'')))openPlayerCareer(AUTH.uid);
}

// ── A player's career across all claimed tournaments ──
async function openPlayerCareer(uid){
  if(!SAFE_ID.test(String(uid)))return;
  let box=document.getElementById('pl-cont');if(!box)return;
  let back=document.getElementById('pl-mo').classList.contains('on')&&_plLast?`<button class="bsm" onclick="openPlayerBack()">← Back</button>`:'';
  box.innerHTML='<p style="color:var(--dim)">Loading career…</p>';openM('pl-mo');
  let prof=null;
  try{prof=await dbReq('GET','players/'+uid);}catch(e){}
  let me=!!(AUTH&&AUTH.uid===uid);
  if(!prof||typeof prof!=='object'){
    box.innerHTML=back+(me?`<p style="margin-top:8px">Your player career is empty so far.</p><p class="pcl-hint">Open any Stumply tournament, tap your name (in Players, a scorecard or Stats) and tap “🙋 This is me”. Your matches then add up here.</p>`
      :'<p style="color:var(--dim);margin-top:8px">This player career was not found.</p>');
    if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(box);return;
  }
  let byT={};
  Object.values(prof.claims&&typeof prof.claims==='object'?prof.claims:{}).filter(c=>c&&SAFE_ID.test(String(c.t))&&SAFE_ID.test(String(c.p)))
    .sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,60).forEach(c=>{(byT[c.t]=byT[c.t]||[]).push(String(c.p));});
  let C=careerNew(''),per=[],cur=claimTid();
  await Promise.all(Object.entries(byT).map(async([tid,pids])=>{
    try{
      let [cl,meta,raw,teams]=await Promise.all([dbReq('GET','claims/'+tid),dbReq('GET','tournaments/'+tid+'/meta'),
        tid===cur?null:dbReq('GET','tournaments/'+tid+'/matches'),tid===cur?null:dbReq('GET','tournaments/'+tid+'/teams')]);
      pids=pids.filter(p=>cl&&cl[p]===uid);if(!pids.length)return;
      let tm=safeParse(meta,null),tname=String(tm&&tm.name||'Tournament').slice(0,60);
      let ms=tid===cur?APP.matches:Object.values(raw&&typeof raw==='object'?raw:{}).map(x=>{let m=safeParse(x,null);return m&&typeof m==='object'?cleanData(m,'',0):null;}).filter(Boolean);
      let tl=tid===cur?APP.teams:safeParse(teams,[]);if(!Array.isArray(tl))tl=[];
      let row={t:tname,runs:0,wk:0,m:0};
      pids.forEach(pid=>{
        let pn='';tl.forEach(t=>(t&&Array.isArray(t.players)?t.players:[]).forEach(p=>{if(p&&p.id===pid)pn=String(p.name||'');}));
        ms.filter(m=>m&&m.status==='completed'&&Array.isArray(m.innings)).forEach(m=>{
          if(!pn)mainInns(m).forEach(inn=>{let b=inn.batsmen&&inn.batsmen[pid],w=inn.bowlers&&inn.bowlers[pid];pn=pn||(b&&b.name)||(w&&w.name)||'';});
          let r=careerAdd(C,m,tname,careerKey(pn||'\u0000'),pid);row.runs+=r.runs;row.wk+=r.wk;row.m+=r.m;});
      });
      per.push(row);
    }catch(e){}
  }));
  let name=String(prof.name||'Player').slice(0,60);
  let sub=[prof.role,prof.city].filter(x=>typeof x==='string'&&x).map(x=>esc(x.slice(0,40))).join(' · ');
  let html=back+careerBody(name,C,per,sub?`<div style="font-size:13px;color:var(--dim)">${sub}</div>`:'');
  if(!C.m&&!per.length)html=html.replace('No completed matches found for this name.','No completed matches yet.');
  html+=`<div class="pcl-btns" style="margin-top:12px"><button class="bsm bblu" onclick="shareCareer('${uid}')">📤 Share on WhatsApp</button><button class="bsm" onclick="copyCareer('${uid}')">🔗 Copy link</button>${me?`<button class="bsm" onclick="editPlayerProfile()">✏️ Edit my profile</button>`:''}</div>
    <div id="pp-edit"></div>
    <p style="font-size:11px;color:var(--dim);margin-top:10px">Counts completed matches in every tournament where this player tapped “This is me”, whoever organised it. Super Overs are not included. Organisers can remove a wrong claim.</p>`;
  box.innerHTML=html;box.setAttribute('data-name',name);
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(box);
}
function shareCareer(uid){
  let n=(document.getElementById('pl-cont')||{getAttribute:()=>''}).getAttribute('data-name')||'';
  shareWA(`🏏 ${n?n+' – ':''}cricket career on Stumply\n${careerUrl(uid)}`);
}
function copyCareer(uid){
  let u=careerUrl(uid);
  try{navigator.clipboard.writeText(u).then(()=>toast('✅ Link copied!')).catch(()=>toast(u));}catch(e){toast(u);}
}
async function editPlayerProfile(){
  let el=document.getElementById('pp-edit');if(!el||!myAuth())return;
  let p=null;try{p=await dbReq('GET','players/'+AUTH.uid);}catch(e){}
  p=p&&typeof p==='object'?p:{};
  const v=x=>esc(typeof x==='string'?x:'');
  el.innerHTML=`<div class="pcl" style="margin-top:10px">
    <div class="mr"><label>Name shown on your career</label><input class="ifield" id="pp-name" maxlength="60" value="${v(p.name||AUTH.name)}"></div>
    <div class="mr"><label>Town or city (optional)</label><input class="ifield" id="pp-city" maxlength="40" value="${v(p.city)}" placeholder="e.g. Guntur"></div>
    <div class="mr"><label>Role (optional)</label><select id="pp-role">${['','Batter','Bowler','All-rounder','Wicket-keeper'].map(r=>`<option value="${r}" ${p.role===r?'selected':''}>${r||'—'}</option>`).join('')}</select></div>
    <p class="pcl-hint">Your career page is public. Do not add a phone number or address here.</p>
    <button class="bsm bgld" onclick="savePlayerProfile()">💾 Save</button></div>`;
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(el);
}
async function savePlayerProfile(){
  if(!myAuth())return;
  const g=id=>String((document.getElementById(id)||{}).value||'').trim().replace(/[<>`]/g,'');
  let name=g('pp-name').slice(0,60);
  if(!name){toast('Please enter your name','warn');return;}
  try{await dbReq('PATCH','players/'+AUTH.uid,{name,city:g('pp-city').slice(0,40),role:g('pp-role').slice(0,30),at:Date.now()},true);
    toast('✅ Profile saved');openPlayerCareer(AUTH.uid);}
  catch(e){toast(authErrText(e.message),'warn');}
}
function openMyCareer(){if(myAuth())openPlayerCareer(AUTH.uid);}
function shareMyCareer(){if(myAuth())shareCareer(AUTH.uid);}
