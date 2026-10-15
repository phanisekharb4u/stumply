// Stumply — Start-up: runs last, after every other file has loaded.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ── Update bindActions ALLOWED whitelist ─────────────────────────────────
// (done via the existing ALLOWED object — just add new functions)
// Show warning if localStorage is blocked (private/incognito mode)
(function(){
  try{var t='__cs_ls_test__';localStorage.setItem(t,t);localStorage.removeItem(t);}
  catch(e){var w=document.getElementById('ls-warn');if(w)w.style.display='block';}
})();
// Apply saved language immediately (before login)
(function(){try{CURRENT_LANG=lsGet('stumply_lang')||'en';applyLanguage();}catch(e){}})();
// Register service worker for PWA/offline support
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
// Bind all data-action elements (auth buttons need this before login)
bindActions();

// ── Start-up: shared link → saved viewer → saved admin session → sign-in screen
(async function boot(){
  let params;try{params=new URLSearchParams(location.search);}catch(e){params=new URLSearchParams('');}
  let t=params.get('t'),view=cleanUname(params.get('view'));
  if(!CLOUD_OK){showAuthScreen('');return;}
  let loading=document.getElementById('boot-msg');
  const busy=msg=>{if(loading){loading.textContent=msg||'';loading.style.display=msg?'block':'none';}};
  try{
    if(t){busy('Loading tournament…');await openViewer(t);busy('');return;}
    if(view){
      busy('Loading tournament…');
      let list=await tournamentsOfUser(view);
      if(list&&list.length){await openViewer(list[0].tid);busy('');return;}
      busy('');showAuthScreen('');showViewer();
      document.getElementById('dc-q').value=view;
      document.getElementById('v-err').textContent=list?'This admin has no tournaments yet':'Username not found — check the link';
      return;
    }
  }catch(e){
    busy('');showAuthScreen('');showViewer();
    document.getElementById('v-err').textContent=e.message==='NOT_FOUND'?'That tournament is no longer available':authErrText(e.message);
    return;
  }
  try{
    if(ssGet('stumply_idp')){busy('Signing you in…');let pid=await idpFinish();if(pid){await enterAdmin();busy('');return;}busy('');}
  }catch(e){busy('');AUTH=null;persistAuth();showAuthScreen(idpErrText(e.message,e.pid));return;}
  let saved=safeParse(lsGet(LS_AUTH),null);
  if(saved&&saved.uid&&saved.refreshToken){
    AUTH=saved;busy('Signing you in…');
    try{await enterAdmin();busy('');return;}
    catch(e){
      busy('');
      if(e.message==='NETWORK'){showAuthScreen('No connection — connect to the internet and reload to continue.');return;}
      AUTH=null;persistAuth();
      showAuthScreen(e.message==='SESSION_EXPIRED'?'Your session has ended. Please sign in again.':'');
      return;
    }
  }
  // Opening the site itself always shows the sign-in screen; the last watched
  // tournament is offered there with one tap instead of opening by itself
  showAuthScreen('');
  let vt=lsGet(LS_VIEW);
  if(vt&&SAFE_ID.test(vt)){
    let name='';
    try{let m=await dbReq('GET','tournaments/'+vt+'/meta');let t=safeParse(m,null);name=t&&t.name?String(t.name).slice(0,60):'';}catch(e){}
    let vl=document.getElementById('v-list');
    if(vl&&name)vl.innerHTML=`<button class="acard" style="width:100%;margin-top:12px" onclick="watchTournament('${vt}')"><span class="at">Continue watching</span><span class="an">▶ ${esc(name)}</span></button>`;
    else if(!name)lsRemove(LS_VIEW);
  }
})();
