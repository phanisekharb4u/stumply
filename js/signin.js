// Stumply — Sign-in screen: watch first, register, sign in, Google / X, password reset.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  SIGN-IN SCREEN
// ══════════════════════════════════════════════════════════════════════════
function showAuthPanel(id,withTabs){
  ['apanel-login','apanel-reg','apanel-forgot','apanel-setup'].forEach(p=>{
    let el=document.getElementById(p);if(el)el.classList.toggle('on',p===id);
  });
  let tabs=document.getElementById('auth-tabs');if(tabs)tabs.style.display=withTabs?'':'none';
}
function switchTab(t){
  t=t==='reg'?'reg':'login';
  document.querySelectorAll('.atab').forEach((b,i)=>b.classList.toggle('on',i===(t==='login'?0:1)));
  showAuthPanel('apanel-'+t,true);
}
function showLogin(){switchTab('login');}
// The watch section is always on the sign-in screen; this just brings it to the top
function showViewer(){
  let ve=document.getElementById('v-err');if(ve)ve.textContent='';
  let vl=document.getElementById('v-list');if(vl)vl.innerHTML='';
  try{window.scrollTo(0,0);}catch(e){}
  loadDiscover();
}
// Phone: the strip under the header jumps down to the watch section
function watchGo(){let w=document.getElementById('awatch');if(w)w.scrollIntoView({behavior:'smooth',block:'start'});}
// Jump to the organiser card
function orgGo(tab){
  if(tab==='login'||tab==='reg')switchTab(tab);
  let o=document.getElementById('aorg');if(o)o.scrollIntoView({behavior:'smooth',block:'start'});
}
let _abarObs=null;
function watchAbar(){
  let bar=document.getElementById('abar'),org=document.getElementById('aorg');
  if(!bar||!org||_abarObs||typeof IntersectionObserver==='undefined')return;
  _abarObs=new IntersectionObserver(es=>es.forEach(e=>bar.classList.toggle('away',e.isIntersecting)),{threshold:0.05});
  _abarObs.observe(org);
}
function showForgot(){
  showAuthPanel('apanel-forgot',false);setTimeout(()=>orgGo(),30);
  let from=document.getElementById('l-u'),to=document.getElementById('fp-u');
  if(from&&to&&!to.value)to.value=from.value;
  document.getElementById('fp-err1').textContent='';
  document.getElementById('fp-ok').textContent='';
}
function authBusy(on){
  document.querySelectorAll('#authscr .btnpri').forEach(b=>{b.disabled=on;b.style.opacity=on?'.6':'';});
}
function showAuthScreen(msg){
  document.querySelectorAll('.mo.on').forEach(o=>o.classList.remove('on')); // no pop-up from the last session stays on top
  document.querySelectorAll('.pweye').forEach(b=>{let i=document.getElementById(b.dataset.for);if(i)i.type='password';b.classList.remove('on');b.textContent='👁';b.setAttribute('aria-label','Show password');b.title='Show password';});
  document.getElementById('authscr').style.display='flex';
  document.getElementById('topbar').classList.add('hidden');
  document.getElementById('main').classList.add('hidden');
  document.getElementById('syncbar').classList.remove('on');
  switchTab('login');
  let e=document.getElementById('l-err');if(e)e.textContent=msg||'';
  let w=document.getElementById('cfg-warn');if(w)w.style.display=CLOUD_OK?'none':'block';
  idpProbe();loadDiscover();
  if(msg)setTimeout(()=>orgGo(),60);
}
function needCloud(errEl){
  if(CLOUD_OK)return true;
  if(errEl)errEl.textContent='This site is not connected to Firebase yet. See the setup steps in README.md.';
  return false;
}
const cleanUname=s=>String(s||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'_').slice(0,30);

// After sign-in or session restore: load the profile and open a tournament
async function enterAdmin(){
  let offline=false,prof=null;
  try{prof=await dbReq('GET','users/'+AUTH.uid,undefined,true);}
  catch(e){if(e.message!=='NETWORK')throw e;offline=true;}
  if(prof&&typeof prof==='object'){AUTH.name=String(prof.name||'');AUTH.uname=String(prof.uname||'');persistAuth();}
  if(!offline&&!(prof&&prof.uname)){showSetup();return;}
  if(!offline){ // usage tracking: when this admin was last here (ignored if the database rules are older)
    dbReq('PATCH','users/'+AUTH.uid,{lastSeen:Date.now()},true).catch(()=>{});
    _isOwner=false;
    dbReq('GET','owners/'+AUTH.uid,undefined,true).then(v=>{_isOwner=v===true;if(_isOwner)loadUsage();else renderUsage();}).catch(()=>{});
  }
  stopViewerStream();
  APP.role='admin';APP.viewTid=null;APP.uname=AUTH.uname||'';APP.dname=AUTH.name||AUTH.email||'Admin';
  if(!offline){
    try{_tlist=sortTournaments(await dbReq('GET','userTournaments/'+AUTH.uid));}
    catch(e){if(e.message!=='NETWORK')throw e;offline=true;}
  }
  _slist=[];
  if(!offline){try{let so=await dbReq('GET','scorerOf/'+AUTH.uid,undefined,true);
    _slist=Object.entries(so&&typeof so==='object'?so:{}).filter(([k,v])=>SAFE_ID.test(k)&&v&&typeof v==='object')
      .map(([tid,v])=>({tid,name:String(v.name||'Tournament').slice(0,80),ownerName:String(v.ownerName||'').slice(0,80)}));}catch(e){}}
  let cur=lsGet(LS_CUR);
  if(offline){
    if(!cur||!lsGet(LS_TCACHE+cur))throw new Error('NETWORK');
    await openTournament(cur);
  } else {
    let pick=_tlist.find(t=>t.tid===cur)||_slist.find(t=>t.tid===cur)||_tlist[0];
    let opened=false;
    if(pick){try{await openTournament(pick.tid);opened=true;}catch(e){if(e.message!=='NOT_FOUND'&&!_slist.includes(pick))throw e;}}
    if(!opened&&_tlist[0]&&pick!==_tlist[0]){try{await openTournament(_tlist[0].tid);opened=true;}catch(e){}}
    if(!opened)await createTournament(blankTournament(APP.dname+"'s Tournament"));
  }
  initApp();startCollab();
  if(typeof finishPendingClaim==='function')finishPendingClaim();
}
// Claim a username and save the profile for the signed-in account
async function saveProfile(name,uname){
  try{await dbReq('PUT','usernames/'+uname,AUTH.uid,true);}
  catch(e){ // lost a race for the name: fall back to a unique variant
    if(e.message==='NETWORK')throw e;
    uname=(uname.slice(0,24)+'_'+Math.random().toString(36).slice(2,6));
    await dbReq('PUT','usernames/'+uname,AUTH.uid,true);
  }
  await dbReq('PUT','users/'+AUTH.uid,{name,uname},true);
  try{await dbReq('PATCH','users/'+AUTH.uid,{createdAt:Date.now()},true);}catch(e){}
  AUTH.name=name;AUTH.uname=uname;persistAuth();
}

// ── Sign in with Google / X / Facebook (redirect flow through Firebase) ──
const IDPS={'google.com':'google','twitter.com':'twitter','facebook.com':'facebook'};
const IDP_NAMES={'google.com':'Google','twitter.com':'X (Twitter)','facebook.com':'Facebook'};
const idpContinue=()=>location.origin+'/';
let _idpProbe=null;
function ssGet(k){try{return sessionStorage.getItem(k);}catch(e){return null;}}
function ssSet(k,v){try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v);}catch(e){}}
// Show only the buttons that are switched on and set up in Firebase
function idpProbe(){
  if(!CLOUD_OK||_idpProbe)return _idpProbe;
  _idpProbe=Promise.all(Object.keys(IDPS).map(pid=>authCall('createAuthUri',{providerId:pid,continueUri:idpContinue()})
    .then(j=>!!(j&&j.authUri)).catch(()=>false))).then(res=>{
    let any=false;
    Object.values(IDPS).forEach((k,i)=>{any=any||res[i];document.querySelectorAll('.idp-'+k).forEach(b=>b.style.display=res[i]?'':'none');});
    document.querySelectorAll('.idp-box').forEach(b=>b.style.display=any?'':'none');
    return res;
  });
  return _idpProbe;
}
async function idpStart(pid){
  let err=document.getElementById(document.getElementById('apanel-reg').classList.contains('on')?'r-err':'l-err');
  if(err)err.textContent='';
  if(!needCloud(err)||!IDPS[pid])return;
  authBusy(true);
  try{
    let body={providerId:pid,continueUri:idpContinue()};
    if(pid==='google.com')body.customParameter={prompt:'select_account'};
    let j=await authCall('createAuthUri',body);
    if(!j||!j.authUri)throw new Error('OPERATION_NOT_ALLOWED');
    ssSet('stumply_idp',JSON.stringify({pid,sid:j.sessionId||'',at:Date.now()}));
    location.assign(j.authUri);
  }catch(e){if(err)err.textContent=idpErrText(e.message,pid);authBusy(false);}
}
function idpErrText(code,pid){
  code=String(code||'');let n=IDP_NAMES[pid]||'That service';
  if(code==='IDP_CANCELLED')return n+' sign-in was cancelled.';
  if(/EMAIL_EXISTS|NEED_CONFIRMATION|FEDERATED_USER_ID_ALREADY_LINKED/.test(code))return 'This email already has a Stumply account. Sign in with your email and password, or the service you used before.';
  if(/OPERATION_NOT_ALLOWED|INVALID_PROVIDER_ID|CONFIGURATION_NOT_FOUND/.test(code))return n+' sign-in is not switched on yet.';
  if(/INVALID_IDP_RESPONSE|INVALID_CONTINUE_URI|UNAUTHORIZED_DOMAIN|MISSING_OR_INVALID_NONCE/.test(code))return n+' sign-in did not complete. Please try again.';
  return authErrText(code);
}
// Back from Google / X / Facebook: finish the sign-in. Returns the provider id when it handled the page.
async function idpFinish(){
  let st=safeParse(ssGet('stumply_idp'),null);
  let q=new URLSearchParams(location.search);
  let back=q.has('code')||q.has('oauth_verifier')||q.has('error')||q.has('denied')||/id_token|access_token/.test(location.hash);
  if(!st||!back)return null;
  ssSet('stumply_idp',null);
  let full=location.href;
  try{history.replaceState(null,'',location.pathname);}catch(e){}
  if(q.has('error')||q.has('denied'))throw Object.assign(new Error('IDP_CANCELLED'),{pid:st.pid});
  let j;
  try{j=await authCall('signInWithIdp',{requestUri:full,sessionId:st.sid,returnSecureToken:true,returnIdpCredential:true});}
  catch(e){e.pid=st.pid;throw e;}
  if(!j||!j.idToken||j.needConfirmation)throw Object.assign(new Error('NEED_CONFIRMATION'),{pid:st.pid});
  setAuthFromResponse(j);
  AUTH.idpName=String(j.displayName||j.fullName||'').slice(0,60);persistAuth();
  return st.pid;
}
function showSetup(){
  showAuthScreen('');showAuthPanel('apanel-setup',false);setTimeout(()=>orgGo(),60);
  document.getElementById('s-n').value=AUTH&&(AUTH.idpName||'')||'';
  let base=cleanUname(AUTH&&(AUTH.idpName||String(AUTH.email||'').split('@')[0])||'');
  document.getElementById('s-u').value=base.length>=3?base:'';
  document.getElementById('s-err').textContent='';
}
async function finishSetup(){
  let name=document.getElementById('s-n').value.trim().slice(0,60);
  let uname=cleanUname(document.getElementById('s-u').value);
  let err=document.getElementById('s-err');err.textContent='';
  if(!AUTH){showAuthScreen('');return;}
  if(!name){err.textContent='Enter your name';return;}
  if(uname.length<3){err.textContent='Username must be at least 3 characters (letters, numbers, _)';return;}
  authBusy(true);
  try{
    if(await dbReq('GET','usernames/'+uname)){err.textContent='That username is taken — choose another';return;}
    await saveProfile(name,uname);
    await enterAdmin();
  }catch(e){err.textContent=authErrText(e.message);}
  finally{authBusy(false);}
}
async function doRegister(){
  let name=document.getElementById('r-n').value.trim().slice(0,60);
  let uname=cleanUname(document.getElementById('r-u').value);
  let email=document.getElementById('r-e').value.trim();
  let pass=document.getElementById('r-p').value,pass2=document.getElementById('r-p2').value;
  let err=document.getElementById('r-err'),ok=document.getElementById('r-ok');
  err.textContent='';ok.textContent='';
  if(!needCloud(err))return;
  if(!name){err.textContent='Enter your name';return;}
  if(uname.length<3){err.textContent='Username must be at least 3 characters (letters, numbers, _)';return;}
  if(!/^\S+@\S+\.\S+$/.test(email)){err.textContent='Enter a valid email address';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters';return;}
  if(pass!==pass2){err.textContent='Passwords do not match';return;}
  authBusy(true);
  try{
    if(await dbReq('GET','usernames/'+uname)){err.textContent='That username is taken — choose another';return;}
    setAuthFromResponse(await authCall('signUp',{email,password:pass,returnSecureToken:true}));
    await saveProfile(name,uname);
    ok.textContent='✅ Account created! Signing you in...';
    await enterAdmin();
  }catch(e){
    err.textContent=authErrText(e.message);ok.textContent='';
  }finally{authBusy(false);}
}
async function doLogin(){
  let email=document.getElementById('l-u').value.trim();
  let pass=document.getElementById('l-p').value;
  let err=document.getElementById('l-err');err.textContent='';
  if(!needCloud(err))return;
  if(!email||!pass){err.textContent='Enter your email and password';return;}
  authBusy(true);
  try{
    setAuthFromResponse(await authCall('signInWithPassword',{email,password:pass,returnSecureToken:true}));
    await enterAdmin();
    document.getElementById('l-p').value='';
  }catch(e){
    if(APP.role!=='admin'){AUTH=null;persistAuth();}
    err.textContent=authErrText(e.message);
  }finally{authBusy(false);}
}
// "Forgot password": Firebase emails a reset link
async function fpStep1(){
  let email=document.getElementById('fp-u').value.trim();
  let err=document.getElementById('fp-err1'),ok=document.getElementById('fp-ok');
  err.textContent='';ok.textContent='';
  if(!needCloud(err))return;
  if(!/^\S+@\S+\.\S+$/.test(email)){err.textContent='Enter the email you registered with';return;}
  authBusy(true);
  try{
    await authCall('sendOobCode',{requestType:'PASSWORD_RESET',email});
    ok.textContent='✅ If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.';
  }catch(e){
    if(/EMAIL_NOT_FOUND/.test(e.message))ok.textContent='✅ If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.';
    else err.textContent=authErrText(e.message);
  }finally{authBusy(false);}
}
// Watch: one matching listed tournament opens straight away, otherwise the text is tried as an admin username
function doGuest(){return watchSearch();}
async function watchSearch(){
  let unameEl=document.getElementById('dc-q'),errEl=document.getElementById('v-err'),listEl=document.getElementById('v-list');
  let raw=String(unameEl?unameEl.value:'').trim(),uname=cleanUname(raw);
  errEl.textContent='';if(listEl)listEl.innerHTML='';
  if(!needCloud(errEl))return;
  if(!raw){errEl.textContent='Type a tournament name, city or username, or pick a match below.';if(unameEl)unameEl.focus();return;}
  let q=raw.toLowerCase(),hits=(_disc||[]).filter(t=>(t.name+' '+t.edition+' '+t.city+' '+t.by).toLowerCase().includes(q));
  if(hits.length===1){return watchTournament(hits[0].tid);}
  authBusy(true);
  try{
    let list=uname.length>=3?await tournamentsOfUser(uname):null;
    if(list===null){errEl.textContent=hits.length?'Pick a tournament from the list below.':'Nothing found. Check the spelling, or ask the organiser for the share link.';return;}
    if(!list.length){errEl.textContent='This admin has no tournaments yet';return;}
    if(list.length===1){await openViewer(list[0].tid);return;}
    listEl.innerHTML='<div style="font-size:11px;color:var(--dim);margin:10px 0 4px">Choose a tournament:</div>'+list.map(t=>
      `<button class="btnalt" style="margin-top:6px;text-align:left" onclick="watchTournament('${esc(t.tid)}')">${t.live?'🔴 ':''}${esc(t.name)} <span style="color:var(--dim);font-size:11px">${esc(t.edition)}${t.year?', '+esc(t.year):''}</span></button>`).join('');
  }catch(e){
    errEl.textContent=e.message==='NOT_FOUND'?'That tournament is no longer available':authErrText(e.message);
  }finally{authBusy(false);}
}
async function watchTournament(tid){
  let errEl=document.getElementById('v-err');
  try{await openViewer(tid);}
  catch(e){if(errEl)errEl.textContent=e.message==='NOT_FOUND'?'That tournament is no longer available':authErrText(e.message);}
}
async function doLogout(){
  if(APP.role==='admin'){try{await Promise.race([flushSave(),new Promise(r=>setTimeout(r,3000))]);}catch(e){}}
  stopViewerStream();
  if(_pushTimer){clearTimeout(_pushTimer);_pushTimer=null;}
  if(_retryTimer){clearTimeout(_retryTimer);_retryTimer=null;}
  if(_dirty&&APP.role==='admin')toast('Some changes are saved on this device only — sign in again when online to sync them.','warn');
  AUTH=null;persistAuth();lsRemove(LS_VIEW);
  _pushed=null;_idxPushed={};_tlist=[];_dirty=false;_vraw=null;_autoNavLiveId=null;
  APP.role=null;APP.uname=null;APP.tid=null;APP.viewTid=null;APP.liveMatch=null;APP.teams=[];APP.matches=[];
  ['l-u','l-p','r-n','r-u','r-e','r-p','r-p2','fp-u','dc-q','s-n','s-u'].forEach(id=>{let e=document.getElementById(id);if(e)e.value='';});
  ['r-err','r-ok','fp-err1','fp-ok','v-err'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent='';});
  let vl=document.getElementById('v-list');if(vl)vl.innerHTML='';
  showAuthScreen('');
}

function afterScore(){saveState();renderLive();}
function refreshView(){
  let tabs=['home','matches','live','scorecard','history'];
  let a=tabs.find(t=>document.getElementById('view-'+t).classList.contains('active'))||'home';
  if(a==='live')renderLive();
  else if(a==='home')renderHome();
  else if(a==='matches')renderMatches();
  else if(a==='scorecard'){populateSCSelect();renderSC();}
  else if(a==='history')renderHistory();
}

// Keep the page content and the viewer status bar just below the top bar,
// whatever height it has on this screen.
function layoutTop(){
  let tb=document.getElementById('topbar'),sb=document.getElementById('syncbar'),mn=document.getElementById('main');
  if(!tb||!mn||tb.classList.contains('hidden'))return;
  let h=tb.offsetHeight;
  if(sb)sb.style.top=h+'px';
  let sbh=(sb&&sb.classList.contains('on'))?sb.offsetHeight:0;
  mn.style.marginTop=(h+sbh)+'px';
}
window.addEventListener('resize',layoutTop);
window.addEventListener('orientationchange',()=>setTimeout(layoutTop,200));
function initApp(){
  document.body.classList.toggle('is-viewer',APP.role==='viewer');
  try{
  document.getElementById('authscr').style.display='none';
  document.getElementById('topbar').classList.remove('hidden');
  document.getElementById('main').classList.remove('hidden');
  let ch=document.getElementById('uchip');
  ch.textContent=APP.role==='admin'?'ADMIN':'VIEWER';
  ch.className='chip'+(APP.role==='admin'?' admin':'');
  ch.style.display=APP.role==='admin'?'none':''; // the Admin tab already shows the role
  document.getElementById('unm').textContent=APP.role==='viewer'?(APP.dname?`Watching: ${APP.dname}`:''):(APP.dname||'');
  document.querySelectorAll('.admin-only').forEach(e=>e.classList.toggle('hidden',APP.role!=='admin'));
  let ob=document.querySelector('.btn-out');if(ob)setTxt(ob,APP.role==='viewer'?'Sign in':'Logout');
  if(APP.role==='viewer'){
    document.getElementById('syncbar').classList.add('on');
    // If a live match exists on load, go straight to Live tab
    if(APP.liveMatch||APP.matches.some(m=>m.status==='live')){
      showTab('live');
    }
    startViewerStream(); // live updates; also handles the one-time jump to Live
  } else {
    try{
      let tn=document.getElementById('t-name');if(tn)tn.value=APP.tournament.name||'';
      let te=document.getElementById('t-ed');if(te)te.value=APP.tournament.edition||'';
      let ty=document.getElementById('t-yr');if(ty)ty.value=APP.tournament.year||2026;
      let ov=APP.tournament.overs||20;
      let tsz=document.getElementById('t-size');if(tsz)tsz.value=String(teamSize());
      let tci=document.getElementById('t-city');if(tci)tci.value=APP.tournament.city||'';
      let tli=document.getElementById('t-listed');if(tli)tli.checked=!!APP.tournament.listed;
      let tlm=document.getElementById('t-lms');if(tlm)tlm.checked=!!APP.tournament.lms;
      let tlb=document.getElementById('t-nolbw');if(tlb)tlb.checked=!!APP.tournament.noLBW;
      let tfh=document.getElementById('t-fh');if(tfh)tfh.checked=!APP.tournament.noFH;
      renderScorers();
      let sel=document.getElementById('t-overs');
      let stdOvs=[5,10,12,20,50];
      if(sel){
        if(stdOvs.includes(ov)){sel.value=String(ov);}
        else{
          sel.value='custom';
          let cw=document.getElementById('t-overs-custom-wrap');if(cw)cw.style.display='';
          let ci=document.getElementById('t-overs-custom');if(ci)ci.value=ov;
        }
        updateBowlerMaxLabel();
      }
      setTimeout(updateShareLink,100);
    }catch(e){console.warn('initApp admin fields:',e);}
  }
  document.getElementById('livebadge').classList.toggle('hidden',!APP.matches.some(m=>m.status==='live'));
  if(APP.liveMatch)APP.liveMatch=APP.matches.find(m=>m.status==='live')||null;
  buildBulkTable();renderHome();renderMatches();renderTeamList();
  populatePlayerTeamSel();populateSCSelect();renderHistory();
  updateNotifBell();
  CURRENT_LANG=lsGet('stumply_lang')||'en';
  setTimeout(applyLanguage,150);
  if(APP.role==='admin'){renderTournamentList();renderLegacyImport();}
  if(APP.role==='viewer'&&APP.liveMatch){_autoNavLiveId=APP.liveMatch.id;showTab('live');}
  else showTab('home');
  layoutTop();setTimeout(layoutTop,400);
  }catch(e){
    console.error('initApp error:',e);
    // Ensure auth screen is hidden and app is shown even if something fails
    let as=document.getElementById('authscr');if(as)as.style.display='none';
    let tb=document.getElementById('topbar');if(tb)tb.classList.remove('hidden');
    let mn=document.getElementById('main');if(mn)mn.classList.remove('hidden');
  }
}
