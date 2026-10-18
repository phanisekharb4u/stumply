// Stumply — Settings, storage, sign-in calls, cloud saving, tournaments, co-scorers, Discover and the viewer live feed.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
//  PUSH NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════
// notifyViewers() — called by admin app after key events.
// Sends a notification via the service worker to ALL open viewer tabs/windows
// AND to any installed PWA instances on the same device.
//
// On Android Chrome: works fully (foreground + background)
// On iPhone Safari: works when installed as PWA (iOS 16.4+)
// On desktop Chrome/Edge: works fully

let _swReg = null; // cached SW registration

async function getSwReg(){
  if(_swReg)return _swReg;
  if(!('serviceWorker' in navigator))return null;
  try{_swReg=await navigator.serviceWorker.ready;return _swReg;}catch{return null;}
}

async function requestNotifPermission(){
  if(!('Notification' in window))return false;
  if(Notification.permission==='granted')return true;
  if(Notification.permission==='denied')return false;
  let result=await Notification.requestPermission();
  return result==='granted';
}

function isIOS(){try{return /iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}catch(e){return false;}}
function isStandalone(){try{return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}catch(e){return false;}}
function canPhoneNotify(){return ('Notification' in window)&&Notification.permission==='granted';}
// In-app alert: a banner at the top plus a short buzz, for browsers that cannot show phone notifications
function inAppAlert(title,body){
  let el=document.getElementById('alert-banner');
  if(!el){el=document.createElement('div');el.id='alert-banner';el.setAttribute('role','status');document.body.appendChild(el);
    el.addEventListener('click',()=>{el.classList.remove('on');if(APP.role==='viewer')showTab('live');});}
  el.innerHTML='<b></b><span></span>';el.firstChild.textContent=title;el.lastChild.textContent=body;
  el.classList.add('on');try{navigator.vibrate&&navigator.vibrate([80,40,80]);}catch(e){}
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),6000);
}
async function sendNotif(title,body,tag){
  if(lsGet('notif_enabled')!=='1'&&tag!=='test')return;
  if(!canPhoneNotify()){if(document.visibilityState==='visible')inAppAlert(title,body);return;}
  if(document.visibilityState==='visible'&&tag!=='test'){inAppAlert(title,body);return;}
  try{
    let reg=await getSwReg();
    if(reg){
      // Use SW — works in background too
      reg.active?.postMessage({type:'SHOW_NOTIFICATION',title,body,tag,
        url:window.location.href.split('?')[0]+(APP.tid||APP.viewTid?'?t='+(APP.tid||APP.viewTid):'')});
    } else {
      // Fallback: direct Notification API (foreground only)
      new Notification(title,{body,icon:'/icon-192.png',tag,vibrate:[100,50,100]});
    }
  }catch(e){console.warn('Notification error:',e);}
}

// Key notification triggers — called from game engine
function notifyMatchStarted(teamA,teamB,matchType){
  if(APP.role!=='viewer')return;
  sendNotif(
    '🏏 Match Started!',
    `${teamA} vs ${teamB}${matchType&&matchType!=='League'?' — '+matchType:''}`,
    'match-start'
  );
}
function notifyInningsComplete(team,runs,wickets,overs){
  if(APP.role!=='viewer')return;
  sendNotif(
    '📊 Innings Complete',
    `${team}: ${runs}/${wickets} (${overs} Ov)`,
    'innings-end'
  );
}
function notifyWicket(batsmanName,runs,dismissal,score,over){
  if(APP.role!=='viewer')return;
  sendNotif(
    `⚡ Wicket! ${batsmanName} out for ${runs}`,
    `${dismissal} | Score: ${score} (${over})`,
    'wicket'
  );
}
function notifyMatchResult(resultText,matchType){
  if(APP.role!=='viewer')return;
  sendNotif(
    `🏆 Match Result${matchType&&matchType!=='League'?' — '+matchType:''}`,
    resultText,
    'match-result'
  );
}
function notifyHalfCentury(name,runs){
  if(APP.role!=='viewer')return;
  sendNotif(`🎯 Half Century!`,`${name} reaches ${runs} runs!`,'fifty');
}
function notifyCentury(name,runs){
  if(APP.role!=='viewer')return;
  sendNotif(`💯 CENTURY!`,`${name} scores ${runs} runs!`,'century');
}

// ══════════════════════════════════════════════════════════════════════════
//  SECURITY — XSS sanitization
// ══════════════════════════════════════════════════════════════════════════
// esc() HTML-encodes user-supplied strings before inserting into innerHTML
// Use for: player names, team names, venue, username — anything user-typed
function esc(s){
  if(s==null)return'';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;')
    .replace(/'/g,'&#39;')
    .replace(/\//g,'&#x2F;');
}

// ══════════════════════════════════════════════════════════════════════════
//  APP STATE
// ══════════════════════════════════════════════════════════════════════════
let APP={
  role:null, uname:null, dname:null,
  tid:null,      // tournament the admin has open
  viewTid:null,  // tournament a viewer is watching
  photos:{},     // optional thumbnails: player/team/umpire id → data URL
  tournament:{name:'My Tournament',edition:'Season 1',year:new Date().getFullYear(),overs:20},
  teams:[], matches:[], liveMatch:null,
  pendingExtra:null,
  _liveTs:0
};
let syncTimer=null;
Object.defineProperty(APP,'pendingFreeHit',{
  get(){let m=APP.liveMatch,inn=m&&m.innings&&m.innings[m.currentInnings];return !!(inn&&inn.freeHit);},
  set(v){let m=APP.liveMatch,inn=m&&m.innings&&m.innings[m.currentInnings];if(inn)inn.freeHit=!!v;}
});

// ══════════════════════════════════════════════════════════════════════════
//  USER STORE (localStorage)
// ══════════════════════════════════════════════════════════════════════════
// STORAGE — resilient layer with in-memory fallback when localStorage blocked
// ══════════════════════════════════════════════════════════════════════════
let _memStore={};  // in-memory fallback (survives the session, not page reload)
let _lsOK=null;    // cache localStorage availability check

function lsAvailable(){
  if(_lsOK!==null)return _lsOK;
  try{
    let t='__cs_test__';
    localStorage.setItem(t,t);
    localStorage.removeItem(t);
    _lsOK=true;
  }catch(e){
    _lsOK=false;
    console.warn('Stumply: localStorage unavailable, using in-memory storage. Data will not persist across page reloads.',e);
  }
  return _lsOK;
}
function lsGet(key){
  if(lsAvailable()){try{return localStorage.getItem(key);}catch{}}
  return _memStore[key]||null;
}
function lsSet(key,val){
  if(lsAvailable()){try{localStorage.setItem(key,val);return;}catch{}}
  _memStore[key]=val;
}
function lsRemove(key){
  if(lsAvailable()){try{localStorage.removeItem(key);}catch{}}
  delete _memStore[key];
}

// ══════════════════════════════════════════════════════════════════════════
//  CLOUD — Firebase Authentication + Realtime Database (REST, no SDK)
//  • Admins sign in with email + password; only the owner can write a
//    tournament (enforced by database.rules.json on the server).
//  • Viewers read without signing in and get live updates by streaming.
//  • Every tournament is stored under /tournaments/{id}; an admin can own many.
// ══════════════════════════════════════════════════════════════════════════
const CFG=window.STUMPLY_FIREBASE||{};
const CLOUD_OK=!!(CFG.apiKey&&CFG.databaseURL&&!/PASTE_|YOUR_/i.test(String(CFG.apiKey)+String(CFG.databaseURL)));
const DB_URL=String(CFG.databaseURL||'').replace(/\/+$/,'');
const AUTH_URL=String(CFG.authEndpoint||'https://identitytoolkit.googleapis.com/v1').replace(/\/+$/,'');
const TOKEN_URL=String(CFG.tokenEndpoint||'https://securetoken.googleapis.com/v1/token');
const LS_AUTH='stumply_auth_v2';     // signed-in admin session
const LS_CUR='stumply_cur_tid';      // tournament the admin last worked on
const LS_TCACHE='stumply_t_';        // + tournament id → local copy (offline safety)
const LS_VIEW='stumply_view_tid';    // tournament a viewer last watched
const LS_LEGACY_DONE='stumply_legacy_done';
let AUTH=null;                       // {uid,email,idToken,refreshToken,exp,name,uname}
let _tlist=[];                       // admin's tournaments [{tid,name,edition,year,updatedAt,live}]

function persistAuth(){try{if(AUTH)lsSet(LS_AUTH,JSON.stringify(AUTH));else lsRemove(LS_AUTH);}catch(e){}}
function setAuthFromResponse(j){
  AUTH={uid:j.localId,email:j.email||'',idToken:j.idToken,refreshToken:j.refreshToken,
    exp:Date.now()+(parseInt(j.expiresIn)||3600)*1000-60000,name:'',uname:''};
  persistAuth();
}
async function authCall(method,body){
  let r;
  try{r=await fetch(AUTH_URL+'/accounts:'+method+'?key='+encodeURIComponent(CFG.apiKey),
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
  catch(e){throw new Error('NETWORK');}
  let j=null;try{j=await r.json();}catch(e){}
  if(!r.ok)throw new Error((j&&j.error&&j.error.message)||('HTTP_'+r.status));
  return j;
}
let _refreshing=null;
async function getToken(force){
  if(!AUTH)throw new Error('SIGNED_OUT');
  if(!force&&AUTH.idToken&&Date.now()<AUTH.exp)return AUTH.idToken;
  if(!_refreshing){
    let a=AUTH;
    _refreshing=(async()=>{
      let r;
      try{r=await fetch(TOKEN_URL+'?key='+encodeURIComponent(CFG.apiKey),{method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(a.refreshToken)});}
      catch(e){throw new Error('NETWORK');}
      let j=null;try{j=await r.json();}catch(e){}
      if(!r.ok)throw new Error('SESSION_EXPIRED');
      a.idToken=j.id_token;a.refreshToken=j.refresh_token||a.refreshToken;
      a.exp=Date.now()+(parseInt(j.expires_in)||3600)*1000-60000;
      if(AUTH===a)persistAuth();
      return a.idToken;
    })().finally(()=>{_refreshing=null;});
  }
  return _refreshing;
}
// One database request. needAuth=true attaches the admin's token (writes and private reads).
async function dbReq(method,path,body,needAuth){
  for(let attempt=0;;attempt++){
    let url=DB_URL+'/'+path+'.json';
    if(needAuth)url+='?auth='+encodeURIComponent(await getToken(attempt>0));
    let r;
    try{r=await fetch(url,{method,body:body===undefined?undefined:JSON.stringify(body),
      headers:body===undefined?{}:{'Content-Type':'application/json'}});}
    catch(e){throw new Error('NETWORK');}
    if(r.status===401&&needAuth&&attempt===0)continue; // token expired → refresh once
    if(!r.ok)throw new Error(r.status===401||r.status===403?'PERMISSION_DENIED':'HTTP_'+r.status);
    try{return await r.json();}catch(e){return null;}
  }
}
function authErrText(code){
  code=String(code||'');
  if(code.startsWith('EMAIL_EXISTS'))return 'An account with this email already exists — sign in instead.';
  if(/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND/.test(code))return 'Wrong email or password.';
  if(code.startsWith('WEAK_PASSWORD'))return 'Password must be at least 6 characters.';
  if(code.startsWith('INVALID_EMAIL')||code.startsWith('MISSING_EMAIL'))return 'Enter a valid email address.';
  if(code.startsWith('TOO_MANY_ATTEMPTS'))return 'Too many attempts. Please wait a few minutes and try again.';
  if(code.startsWith('USER_DISABLED'))return 'This account has been disabled.';
  if(code.startsWith('OPERATION_NOT_ALLOWED')||code.startsWith('CONFIGURATION_NOT_FOUND'))return 'Email sign-in is not switched on for this Firebase project yet.';
  if(code.startsWith('API_KEY')||code.includes('API key'))return 'The Firebase API key in firebase-config.js is not valid.';
  if(code==='PERMISSION_DENIED')return 'The database refused the request. Check that database.rules.json has been published.';
  if(code==='SESSION_EXPIRED'||code==='SIGNED_OUT')return 'Your session has ended. Please sign in again.';
  if(code==='NETWORK')return 'No connection. Check your internet and try again.';
  return 'Something went wrong ('+code+'). Please try again.';
}

// ── Tournament state ⇄ stored form ────────────────────────────────────
// Each part is stored as a JSON string so empty lists and blanks survive
// the database unchanged, and each match can be updated on its own.
function blankTournament(name){return {name:name||'My Tournament',edition:'Season 1',year:new Date().getFullYear(),overs:20};}
function safeParse(s,fb){try{let v=JSON.parse(s);return v==null?fb:v;}catch(e){return fb;}}
function packState(){
  let matches={};
  APP.matches.forEach(m=>{matches[m.id]=JSON.stringify(m);});
  return {meta:JSON.stringify(APP.tournament),teams:JSON.stringify(APP.teams),
    order:JSON.stringify(APP.matches.map(m=>m.id)),matches,photos:Object.assign({},APP.photos),
    liveId:APP.liveMatch?APP.liveMatch.id:'',scorers:Object.assign({},APP.scorers||{}),_savedAt:Date.now()};
}
// ── Data from the cloud is untrusted: anyone can own a tournament and edit its raw data.
// Clean it before it reaches the screen so it cannot inject code into a viewer's page.
const SAFE_ID=/^[A-Za-z0-9_-]{1,80}$/;
const ID_KEYS=new Set(['id','teamAId','teamBId','battingTeamId','bowlingTeamId','striker','nonStriker','currentBowler','lastOverBowler','motm','winner','captainId','liveId','pots','tid']);
const NUM_KEYS=new Set(['runs','wickets','balls','fours','sixes','overs','maidens','wides','noballs','legalBalls','ballInOver','number','target','score','wicket','currentInnings','total','wide','noball','bye','legbye','completedAt','year','maxBalls','maxW','size','teamSize']);
const MAP_KEYS=new Set(['batsmen','bowlers','playingXI']);
function cleanData(v,key,depth){
  if(depth>12)return null;
  if(v==null)return v;
  if(typeof v==='string'){
    if(ID_KEYS.has(key))return (SAFE_ID.test(v)||v==='tie'||v==='no_result')?v:null;
    if(NUM_KEYS.has(key)){let n=Number(v);return isFinite(n)?n:0;}
    return v.replace(/[<>`]/g,'').slice(0,2000);
  }
  if(typeof v==='number')return isFinite(v)?v:0;
  if(typeof v==='boolean')return v;
  if(Array.isArray(v))return v.slice(0,5000).map(x=>cleanData(x,key==='bowlOrder'?'id':'',depth+1)).filter(x=>x!==undefined);
  if(typeof v==='object'){
    let o={};
    Object.keys(v).forEach(k=>{
      if(k==='__proto__'||k==='constructor'||k==='prototype')return;
      if(MAP_KEYS.has(key)&&!SAFE_ID.test(k))return;
      o[k]=cleanData(v[k],MAP_KEYS.has(key)?'':k,depth+1);
    });
    return o;
  }
  return null;
}
function applyPacked(st){
  st=st||{};
  let t=safeParse(st.meta,null);
  APP.tournament=(t&&typeof t==='object'&&!Array.isArray(t))?cleanData(t,'',0):blankTournament();
  if(!APP.tournament.overs)APP.tournament.overs=20;
  let teams=safeParse(st.teams,[]);
  APP.teams=(Array.isArray(teams)?teams:[]).filter(x=>x&&typeof x==='object').map(x=>cleanData(x,'',0)).filter(x=>x.id);
  APP.teams.forEach(x=>{if(!Array.isArray(x.players))x.players=[];x.players=x.players.filter(p=>p&&p.id);});
  let order=safeParse(st.order,[]);if(!Array.isArray(order))order=[];
  let raw=(st.matches&&typeof st.matches==='object')?st.matches:{},seen={},list=[];
  order.concat(Object.keys(raw)).forEach(id=>{
    if(seen[id]||typeof raw[id]!=='string'||!SAFE_ID.test(id))return;seen[id]=1;
    let m=safeParse(raw[id],null);
    if(!m||typeof m!=='object'||Array.isArray(m))return;
    m=cleanData(m,'',0);
    if(!Array.isArray(m.innings))m.innings=[];
    if(!Array.isArray(m.umpires))m.umpires=[];
    m.id=id;list.push(m);
  });
  APP.matches=list;
  APP.liveMatch=st.liveId?(list.find(m=>m.id===st.liveId)||null):null;
  APP.photos={};
  if(st.photos&&typeof st.photos==='object')Object.keys(st.photos).forEach(k=>{if(SAFE_ID.test(k)&&typeof st.photos[k]==='string'&&PHOTO_RE.test(st.photos[k]))APP.photos[k]=st.photos[k];});
  APP.scorers={};
  if(st.scorers&&typeof st.scorers==='object')Object.keys(st.scorers).forEach(k=>{let v=st.scorers[k];if(SAFE_ID.test(k)&&v&&typeof v==='object')APP.scorers[k]={uname:cleanUname(v.uname)};});
}
function packedFromCloud(raw){
  return {meta:raw.meta,teams:raw.teams,order:raw.order,liveId:raw.liveId||'',
    matches:(raw.matches&&typeof raw.matches==='object')?raw.matches:{},
    photos:(raw.photos&&typeof raw.photos==='object')?raw.photos:{},
    scorers:(raw.scorers&&typeof raw.scorers==='object')?raw.scorers:{},_savedAt:raw._savedAt||0};
}
// What the cloud last confirmed, plus the small "live" node viewers follow
function pushedFromCloud(tid,raw){
  let lv=raw&&raw.live&&typeof raw.live==='object'?raw.live:null;
  return {tid,st:packedFromCloud(raw),rev:lv?Number(lv.rev)||0:0,liveKey:lv?JSON.stringify({rev:lv.rev,mid:lv.mid||'',m:lv.m||''}):''};
}
// The live match for viewers, with commentary cut to the last 12 balls
function liteMatch(json){
  let m=safeParse(json,null);if(!m||typeof m!=='object')return '';
  (m.innings||[]).forEach(i=>{if(i&&Array.isArray(i.log)&&i.log.length>12)i.log=i.log.slice(-12);if(i)i.deliveries=[];});
  return JSON.stringify(m);
}
function ownerOnly(){if(APP.coScorer){toast('Only the tournament owner can change this','warn');return true;}return false;}
// Unique ids even when several things are created in the same millisecond
let _uidN=0;
function uid(prefix){return prefix+Date.now().toString(36)+'_'+(_uidN++).toString(36)+Math.random().toString(36).slice(2,6);}
function newTid(){return 't_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function sortTournaments(o){
  return Object.entries(o||{}).filter(([k,v])=>v&&typeof v==='object'&&SAFE_ID.test(k)).map(([tid,v])=>({tid,
    name:String(v.name||'Tournament'),edition:String(v.edition||''),year:String(v.year||''),
    updatedAt:Number(v.updatedAt)||0,live:!!v.live}))
    .sort((a,b)=>(b.live-a.live)||(b.updatedAt-a.updatedAt));
}

// ── Cloud status indicator (Admin tab) ────────────────────────────────
function updateCloudStatus(state){
  let dot=document.getElementById('cloud-dot'),txt=document.getElementById('cloud-status-txt');
  if(!dot||!txt)return;
  const states={
    connected:['#22a03c','☁️ All changes saved to the cloud'],
    syncing:['#f0a030','🔄 Saving…'],
    error:['#e84040','⚠ Could not save to the cloud — will retry'],
    offline:['#f0a030','📡 Offline — scores are kept on this device and will sync when you are back online'],
  };
  let s=states[state]||states.connected;
  dot.style.background=s[0];txt.textContent=s[1];
}

// ── Saving (admin) ────────────────────────────────────────────────────
let _pushed=null;        // {tid,st} last state the cloud confirmed
let _idxPushed={};       // tid → index entry last written
let _pubPushed={};       // tid → Discover entry last written
let _pushTimer=null,_pushing=null,_dirty=false,_retryTimer=null,_photoWarned=false,_photoRetryAt=0;
function saveState(){
  if(APP.role!=='admin'||!AUTH||!APP.tid)return;
  _dirty=true;
  try{lsSet(LS_TCACHE+APP.tid,JSON.stringify({uid:AUTH.uid,co:!!APP.coScorer,owner:APP.ownerUid||'',ownerName:APP.ownerName||'',dirty:true,st:packState()}));}catch(e){}
  if(_pushTimer)clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>{_pushTimer=null;pushNow();},400);
}
function pushNow(){
  if(_pushing)return _pushing.then(()=>_dirty?pushNow():true);
  if(APP.role!=='admin'||!AUTH||!APP.tid)return Promise.resolve(true);
  let tid=APP.tid,st=packState(),uid=AUTH.uid,co=!!APP.coScorer;
  _dirty=false;
  updateCloudStatus('syncing');
  _pushing=(async()=>{
    try{
      await null; // let _pushing be set before the finally below can clear it
      let fresh=!_pushed||_pushed.tid!==tid;
      if(fresh&&co){let raw=await dbReq('GET','tournaments/'+tid);if(!raw)throw new Error('NOT_FOUND');_pushed=pushedFromCloud(tid,raw);fresh=false;}
      let oldPhotos=(!fresh&&_pushed.st.photos)||{};
      // Photos (owner only) — worked out first so viewers know to reload them
      let pp={},newPhotos=co?oldPhotos:(st.photos||{});
      Object.keys(newPhotos).forEach(id=>{if(newPhotos[id]!==oldPhotos[id])pp[id]=newPhotos[id];});
      Object.keys(oldPhotos).forEach(id=>{if(!(id in newPhotos))pp[id]=null;});
      let liveM=st.liveId&&st.matches[st.liveId]?liteMatch(st.matches[st.liveId]):'';
      let rev=fresh?st._savedAt:_pushed.rev,liveKey;
      if(fresh){
        let body=Object.assign({owner:uid,ownerName:APP.dname||''},st);delete body.photos;
        if(!Object.keys(body.scorers||{}).length)delete body.scorers;
        body.live={rev,mid:st.liveId||'',m:liveM};liveKey=JSON.stringify(body.live);
        await dbReq('PUT','tournaments/'+tid,body,true);
        oldPhotos={};
      } else {
        let patch={},old=_pushed.st;
        (co?['order','liveId']:['meta','teams','order','liveId']).forEach(k=>{if(st[k]!==old[k])patch[k]=st[k];});
        Object.keys(st.matches).forEach(id=>{if(st.matches[id]!==old.matches[id])patch['matches/'+id]=st.matches[id];});
        Object.keys(old.matches).forEach(id=>{if(!(id in st.matches))patch['matches/'+id]=null;});
        // Anything other than the live match changing means viewers reload everything once
        if(Object.keys(patch).some(k=>k!=='matches/'+st.liveId)||(Object.keys(pp).length&&Date.now()>=_photoRetryAt))rev=st._savedAt;
        let lv={rev,mid:st.liveId||'',m:liveM};liveKey=JSON.stringify(lv);
        if(liveKey!==_pushed.liveKey)patch.live=lv;
        if(Object.keys(patch).length){patch._savedAt=st._savedAt;await dbReq('PATCH','tournaments/'+tid,patch,true);}
      }
      // Photos go in their own request: if it is refused, scores are still saved
      let photosSaved=newPhotos;
      if(Object.keys(pp).length&&Date.now()<_photoRetryAt)photosSaved=oldPhotos;
      else if(Object.keys(pp).length){
        try{await dbReq('PATCH','tournaments/'+tid+'/photos',pp,true);_photoWarned=false;}
        catch(e){
          if(e.message==='NETWORK'||e.message==='SESSION_EXPIRED')throw e;
          photosSaved=oldPhotos;_photoRetryAt=Date.now()+60000;
          if(!_photoWarned){_photoWarned=true;toast('Photos could not be saved to the cloud. Publish the updated database rules, then tap Save now.','warn');}
        }
      }
      let keep=co?{photos:photosSaved,meta:_pushed.st.meta,teams:_pushed.st.teams,scorers:_pushed.st.scorers}:{photos:photosSaved};
      _pushed={tid,st:Object.assign({},st,keep),rev,liveKey};
      let t=safeParse(st.meta,{})||{};
      let idx={name:String(t.name||''),edition:String(t.edition||''),year:String(t.year||''),live:!!st.liveId};
      let key=JSON.stringify(idx);
      if(co){
        // Co-scorer: keep the owner's LIVE badges up to date (best effort)
        if(_idxPushed[tid]!==key){_idxPushed[tid]=key;
          let ow=APP.ownerUid,up={live:idx.live,updatedAt:st._savedAt};
          if(ow)dbReq('PATCH','userTournaments/'+ow+'/'+tid,up,true).catch(()=>{});
          if(t.listed)dbReq('PATCH','public/'+tid,up,true).catch(()=>{});}
      } else {
        // Discover listing (best effort: older database rules simply refuse it)
        let pub=t.listed?{name:idx.name.slice(0,80),edition:idx.edition.slice(0,80),city:String(t.city||'').slice(0,40),by:String(APP.uname||'').slice(0,40),
          teams:(safeParse(st.teams,[])||[]).length,live:idx.live}:null;
        let pk=JSON.stringify(pub);
        if(_pubPushed[tid]!==pk){
          try{if(pub){pub.updatedAt=st._savedAt;await dbReq('PUT','public/'+tid,pub,true);}
              else if(_pubPushed[tid]!==undefined||t.wasListed)await dbReq('DELETE','public/'+tid,undefined,true);
              _pubPushed[tid]=pk;}
          catch(e){if(e.message==='NETWORK')throw e;_pubPushed[tid]=pk;}
        }
      }
      if(!co&&_idxPushed[tid]!==key){
        idx.updatedAt=st._savedAt;
        await dbReq('PUT','userTournaments/'+uid+'/'+tid,idx,true);
        _idxPushed[tid]=key;
        let row=_tlist.find(x=>x.tid===tid);
        if(row)Object.assign(row,idx);else _tlist.unshift(Object.assign({tid},idx));
        renderTournamentList();
      }
      if(!_dirty){try{lsSet(LS_TCACHE+tid,JSON.stringify({uid,co,owner:APP.ownerUid||'',ownerName:APP.ownerName||'',dirty:false,st}));}catch(e){}}
      updateCloudStatus('connected');
      return true;
    }catch(e){
      _dirty=true;
      if(e.message==='SESSION_EXPIRED'){toast('Your session has ended — please sign in again to save.','warn');}
      if(e.message==='PERMISSION_DENIED'&&co){toast('Saving was refused — you may no longer be a scorer for this tournament.','warn');}
      updateCloudStatus(e.message==='NETWORK'?'offline':'error');
      if(_retryTimer)clearTimeout(_retryTimer);
      _retryTimer=setTimeout(()=>{_retryTimer=null;if(_dirty)pushNow();},6000);
      return false;
    }finally{_pushing=null;}
  })();
  return _pushing;
}
function flushSave(){
  if(_pushTimer){clearTimeout(_pushTimer);_pushTimer=null;}
  return _dirty||_pushing?pushNow():Promise.resolve(true);
}
function syncNow(){
  if(APP.role!=='admin')return;
  _dirty=true;_photoRetryAt=0;_photoWarned=false;flushSave().then(ok=>toast(ok?'☁️ Saved to the cloud':'Could not reach the cloud — will retry',ok?undefined:'warn'));
}
window.addEventListener('online',()=>{if(_dirty)pushNow();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&_dirty)flushSave();});

// ── Opening, creating, switching and deleting tournaments (admin) ─────
function resetScoringSession(){
  APP.pendingExtra=null;
  try{_undoStack=[];}catch(e){}
}
async function openTournament(tid){
  let cached=safeParse(lsGet(LS_TCACHE+tid),null);
  if(cached&&cached.uid!==AUTH.uid)cached=null;
  let raw=null,offline=false;
  try{raw=await dbReq('GET','tournaments/'+tid);}
  catch(e){if(e.message!=='NETWORK'||!cached)throw e;offline=true;}
  if(raw&&raw.owner!==AUTH.uid&&!(raw.scorers&&raw.scorers[AUTH.uid]))throw new Error('PERMISSION_DENIED');
  let co=raw?raw.owner!==AUTH.uid:!!(cached&&cached.co);
  let cloud=raw?packedFromCloud(raw):null;
  let useLocal=cached&&cached.st&&(offline||!cloud||(cached.dirty&&(cached.st._savedAt||0)>(cloud._savedAt||0)));
  if(!useLocal&&!cloud)throw new Error('NOT_FOUND');
  applyPacked(useLocal?cached.st:cloud);
  APP.tid=tid;lsSet(LS_CUR,tid);
  APP.coScorer=co;APP.ownerUid=raw?String(raw.owner||''):(cached&&cached.owner)||'';APP.ownerName=raw?String(raw.ownerName||''):(cached&&cached.ownerName)||'';
  _pushed=cloud?pushedFromCloud(tid,raw):null;
  resetScoringSession();
  if(useLocal){_dirty=true;if(!offline)pushNow();else updateCloudStatus('offline');}
  else{_dirty=false;updateCloudStatus('connected');}
}
async function createTournament(meta,teams,matches,liveId){
  await flushSave();
  let tid=newTid();
  APP.tid=tid;APP.tournament=meta;APP.teams=teams||[];APP.matches=matches||[];APP.photos={};APP.scorers={};APP.coScorer=false;APP.ownerUid=AUTH.uid;
  APP.liveMatch=liveId?(APP.matches.find(m=>m.id===liveId)||null):null;
  _pushed=null;lsSet(LS_CUR,tid);resetScoringSession();
  saveState();
  return flushSave();
}
async function newTournament(single){
  if(APP.role!=='admin')return;
  let inp=document.getElementById('tn-new');
  let name=(inp?inp.value:'').trim().slice(0,60);
  if(!name&&single===true)name='Friendly Match';
  if(!name){toast('Enter a name for the new tournament','warn');if(inp)inp.focus();return;}
  let meta=blankTournament(name);
  if(single===true){meta.single=true;meta.edition='Single match';}
  let ok=await createTournament(meta);
  if(inp)inp.value='';
  initApp();showTab('admin');
  toast(ok?(single===true?'🏏 Single match created — add the two teams, then schedule it':'🏆 Tournament created'):'Created on this device — will sync when online',ok?undefined:'warn');
}
function newSingleMatch(){return newTournament(true);}
async function switchTournament(tid){
  if(APP.role!=='admin'||tid===APP.tid)return;
  await flushSave();
  try{await openTournament(tid);}
  catch(e){
    if(_slist.some(x=>x.tid===tid)&&(e.message==='NOT_FOUND'||e.message==='PERMISSION_DENIED')){
      dbReq('DELETE','scorerOf/'+AUTH.uid+'/'+tid,undefined,true).catch(()=>{});
      _slist=_slist.filter(x=>x.tid!==tid);renderTournamentList();
      toast('You are no longer a scorer for that tournament','warn');return;}
    toast(e.message==='NOT_FOUND'?'That tournament no longer exists':authErrText(e.message),'warn');return;}
  initApp();showTab('admin');
  toast('Switched to '+(APP.tournament.name||'tournament'));
}
async function deleteTournament(tid){
  if(APP.role!=='admin')return;
  if(tid===APP.tid){toast('Open another tournament first, then delete this one','warn');return;}
  let row=_tlist.find(x=>x.tid===tid);
  if(!window.confirm('Delete "'+(row?row.name:'this tournament')+'" and all its matches? This cannot be undone.'))return;
  try{
    let sc=await dbReq('GET','tournaments/'+tid+'/scorers').catch(()=>null);
    await Promise.all(Object.keys(sc&&typeof sc==='object'?sc:{}).filter(k=>SAFE_ID.test(k)).map(k=>dbReq('DELETE','scorerOf/'+k+'/'+tid,undefined,true).catch(()=>{})));
    await dbReq('DELETE','public/'+tid,undefined,true).catch(()=>{});
    await dbReq('DELETE','polls/'+tid,undefined,true).catch(()=>{});
    await dbReq('DELETE','tournaments/'+tid,undefined,true);
    await dbReq('DELETE','userTournaments/'+AUTH.uid+'/'+tid,undefined,true);
  }catch(e){toast(authErrText(e.message),'warn');return;}
  lsRemove(LS_TCACHE+tid);delete _idxPushed[tid];
  _tlist=_tlist.filter(x=>x.tid!==tid);
  renderTournamentList();toast('Tournament deleted');
}
function renderTournamentList(){
  let el=document.getElementById('tourn-list');if(!el||APP.role!=='admin')return;
  let sl=(_slist||[]).map(t=>{let cur=t.tid===APP.tid;
    return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--bdr)">
      <div style="flex:1;min-width:140px"><div style="font-family:var(--disp);font-size:14px">🤝 ${esc(t.name)} ${cur?'<span class="tag tg">OPEN</span>':''}</div>
      <div style="font-size:11px;color:var(--dim)"><span>Co-scorer</span>${t.ownerName?' · 👤 '+esc(t.ownerName):''}</div></div>
      ${cur?'':`<button class="bsm bblu" onclick="switchTournament('${esc(t.tid)}')">Open</button>`}</div>`;}).join('');
  let sh=sl?`<div style="font-size:11px;font-weight:700;color:var(--dim);margin-top:12px">🤝 YOU SCORE FOR</div>${sl}`:'';
  if(!_tlist.length){el.innerHTML='<p style="color:var(--dim);font-size:12px">No tournaments yet.</p>'+sh;return;}
  el.innerHTML=_tlist.map(t=>{
    let cur=t.tid===APP.tid;
    return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--bdr)">
      <div style="flex:1;min-width:140px">
        <div style="font-family:var(--disp);font-size:14px">${esc(t.name)} ${t.live?'<span class="tag tr">🔴 LIVE</span>':''} ${cur?'<span class="tag tg">OPEN</span>':''}</div>
        <div style="font-size:11px;color:var(--dim)">${esc(t.edition)}${t.year?', '+esc(t.year):''}</div>
      </div>
      ${cur?'':`<button class="bsm bblu" onclick="switchTournament('${esc(t.tid)}')">Open</button>
      <button class="bsm bdng" onclick="deleteTournament('${esc(t.tid)}')">🗑</button>`}
    </div>`;
  }).join('')+sh;
}

// ── Co-scorers: other Stumply accounts that may score this tournament ──
function renderScorers(){
  let el=document.getElementById('scorer-list');if(!el)return;
  let ids=Object.keys(APP.scorers||{});
  el.innerHTML=ids.length?ids.map(id=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--bdr)">
    <div style="flex:1">🤝 <b>@${esc(APP.scorers[id].uname||'?')}</b></div>
    <button class="bsm bdng" onclick="removeScorer('${id}')">Remove</button></div>`).join('')
    :'<p style="color:var(--dim);font-size:12px">No co-scorers yet.</p>';
  let note=document.getElementById('coscorer-note');
  if(note){note.style.display=APP.coScorer?'':'none';
    if(APP.coScorer)note.innerHTML=`<div class="ch">🤝 You are a co-scorer</div><div style="font-size:14px;margin-bottom:4px"><b>${esc(APP.tournament.name||'')}</b>${APP.ownerName?' · 👤 '+esc(APP.ownerName):''}</div><p style="font-size:12px;color:var(--dim);line-height:1.5">You can schedule, start and score matches. Only the owner can change the tournament settings, teams and photos.</p>`;}
  document.body.classList.toggle('co-scorer',!!APP.coScorer);
}
async function addScorer(){
  if(APP.role!=='admin'||ownerOnly())return;
  let inp=document.getElementById('scr-uname'),err=document.getElementById('scr-err');setTxt(err,'');
  let un=cleanUname(inp.value);
  if(un.length<3){setTxt(err,'Enter their Stumply username.');inp.focus();return;}
  try{
    let uid=await dbReq('GET','usernames/'+un);
    if(!uid||typeof uid!=='string'||!SAFE_ID.test(uid)){setTxt(err,'No Stumply account has that username.');return;}
    if(uid===AUTH.uid){setTxt(err,'That is your own username.');return;}
    if(APP.scorers[uid]){setTxt(err,'@'+un+' is already a co-scorer.');return;}
    if(Object.keys(APP.scorers).length>=10){setTxt(err,'You can add up to 10 co-scorers.');return;}
    await flushSave();
    await dbReq('PATCH','tournaments/'+APP.tid,{['scorers/'+uid]:{uname:un}},true);
    APP.scorers[uid]={uname:un};if(_pushed)_pushed.st.scorers=Object.assign({},APP.scorers);
    await dbReq('PUT','scorerOf/'+uid+'/'+APP.tid,{name:String(APP.tournament.name||'Tournament').slice(0,80),owner:AUTH.uid,ownerName:String(APP.dname||'').slice(0,80)},true);
    inp.value='';renderScorers();saveState();
    toast('🤝 @'+un+' can now score this tournament');
  }catch(e){setTxt(err,e.message==='PERMISSION_DENIED'?'The database refused this. Publish the latest database rules first.':authErrText(e.message));}
}
async function removeScorer(uid){
  if(APP.role!=='admin'||ownerOnly()||!APP.scorers[uid])return;
  let un=APP.scorers[uid].uname;
  if(!window.confirm('Remove @'+un+' as a co-scorer?'))return;
  try{
    await dbReq('PATCH','tournaments/'+APP.tid,{['scorers/'+uid]:null},true);
    await dbReq('DELETE','scorerOf/'+uid+'/'+APP.tid,undefined,true).catch(()=>{});
    delete APP.scorers[uid];if(_pushed)_pushed.st.scorers=Object.assign({},APP.scorers);
    renderScorers();saveState();toast('@'+un+' removed');
  }catch(e){toast(authErrText(e.message),'warn');}
}
// When several people work on one tournament, pick up their changes every few seconds
let _collabTimer=null;
function collabActive(){return APP.role==='admin'&&!!APP.tid&&(APP.coScorer||Object.keys(APP.scorers||{}).length>0);}
function startCollab(){if(_collabTimer)clearInterval(_collabTimer);_collabTimer=setInterval(collabTick,6000);}
async function collabTick(){
  if(!collabActive()||_dirty||_pushing||_pushTimer||document.visibilityState==='hidden'||!_pushed)return;
  if(document.querySelector('.mo.on:not(#ww-mo)')||document.getElementById('celebration-overlay').classList.contains('on'))return;
  let tid=APP.tid;
  try{
    let at=await dbReq('GET','tournaments/'+tid+'/_savedAt');
    if(tid!==APP.tid||_dirty||_pushing||!_pushed||at===_pushed.st._savedAt)return;
    let raw=await dbReq('GET','tournaments/'+tid);
    if(tid!==APP.tid||_dirty||_pushing)return;
    if(!raw||(APP.coScorer&&!(raw.scorers&&raw.scorers[AUTH.uid]))){
      toast('You are no longer a scorer for this tournament','warn');
      dbReq('DELETE','scorerOf/'+AUTH.uid+'/'+tid,undefined,true).catch(()=>{});
      _slist=_slist.filter(x=>x.tid!==tid);lsRemove(LS_CUR);lsRemove(LS_TCACHE+tid);_pushed=null;
      try{await enterAdmin();}catch(e){}
      return;
    }
    applyPacked(packedFromCloud(raw));_pushed=pushedFromCloud(tid,raw);
    APP.liveMatch=APP.matches.find(m=>m.status==='live')||null;
    resetScoringSession();
    try{lsSet(LS_TCACHE+tid,JSON.stringify({uid:AUTH.uid,co:!!APP.coScorer,owner:APP.ownerUid||'',ownerName:APP.ownerName||'',dirty:false,st:_pushed.st}));}catch(e){}
    document.getElementById('livebadge').classList.toggle('hidden',!APP.liveMatch);
    renderHome();renderMatches();renderLive();populateSCSelect();renderHistory();renderTeamList();populatePlayerTeamSel();renderScorers();
    toast('🔄 Updated with changes from another scorer');
  }catch(e){}
}

// ── Discover: tournaments their owners chose to list publicly ─────────
let _disc=null;
async function loadDiscover(){
  let el=document.getElementById('dc-list');if(!el||!CLOUD_OK)return;
  el.innerHTML='<div class="aempty">Loading…</div>';
  try{
    let r=await fetch(DB_URL+'/public.json?orderBy=%22updatedAt%22&limitToLast=60');
    if(!r.ok)throw new Error('HTTP');
    let o=await r.json();
    _disc=Object.entries(o&&typeof o==='object'?o:{}).filter(([k,v])=>SAFE_ID.test(k)&&v&&typeof v==='object').map(([tid,v])=>({tid,
      name:String(v.name||'Tournament').slice(0,80),edition:String(v.edition||'').slice(0,80),city:String(v.city||'').slice(0,40),
      by:cleanUname(v.by),teams:Number(v.teams)||0,live:v.live===true,at:Number(v.updatedAt)||0}))
      .sort((a,b)=>(b.live-a.live)||(b.at-a.at));
    renderDiscover();
  }catch(e){el.innerHTML='<div class="aempty">Discover is not available right now.</div>';}
}
function renderDiscover(){
  let el=document.getElementById('dc-list');if(!el||!_disc)return;
  let q=String((document.getElementById('dc-q')||{}).value||'').trim().toLowerCase();
  let list=_disc.filter(t=>!q||(t.name+' '+t.edition+' '+t.city+' '+t.by).toLowerCase().includes(q));
  const day=ms=>{try{return new Date(ms).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}catch(e){return '';}};
  el.innerHTML=list.length?list.slice(0,24).map(t=>`<button class="acard" onclick="watchTournament('${t.tid}')">
      <span class="at${t.live?' live':''}">${t.live?'🔴 LIVE':'Updated '+esc(day(t.at))}${t.city?' · 📍 '+esc(t.city):''}</span>
      <span class="an">${esc(t.name)}</span>
      <span class="as">${[t.edition?esc(t.edition):'',t.teams?plural(t.teams,'team'):'',t.by?'by @'+esc(t.by):''].filter(Boolean).join(' · ')}</span></button>`).join('')
    :`<div class="aempty">${_disc.length?'No tournament matches that search. Press Watch to look it up as an admin username.':'No tournaments are listed yet. Ask the organiser for the share link or their username.'}</div>`;
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(el);
}

// ── Site owner: who is using Stumply ──────────────────────────────────
let _isOwner=false,_usage=null,_slist=[];
async function loadUsage(){
  if(!_isOwner||APP.role!=='admin')return;
  try{
    let [users,idx]=await Promise.all([dbReq('GET','users',undefined,true),dbReq('GET','userTournaments',undefined,true)]);
    _usage={users:users||{},idx:idx||{},at:Date.now()};
  }catch(e){toast(authErrText(e.message),'warn');}
  renderUsage();
}
function usageAgo(ts){
  if(!ts)return '—';
  let d=Math.floor((Date.now()-ts)/86400000);
  if(d<=0)return 'Today';if(d===1)return 'Yesterday';if(d<60)return d+' days ago';
  return new Date(ts).toISOString().slice(0,10);
}
function renderUsage(){
  let card=document.getElementById('usage-card');if(!card)return;
  let show=_isOwner&&APP.role==='admin';card.style.display=show?'':'none';
  if(!show||!_usage)return;
  let now=Date.now(),wk=7*86400000,rows=[];
  let uids=new Set([...Object.keys(_usage.users),...Object.keys(_usage.idx)]);
  uids.forEach(uid=>{
    let u=_usage.users[uid]||{},ts=Object.entries(_usage.idx[uid]||{}).map(([tid,t])=>Object.assign({tid},t)).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    let last=Math.max(u.lastSeen||0,...ts.map(t=>t.updatedAt||0));
    rows.push({uid,name:String(u.name||'(no name)'),uname:String(u.uname||''),created:u.createdAt||0,last,ts});
  });
  rows.sort((a,b)=>b.last-a.last);
  let allT=rows.flatMap(r=>r.ts);
  let box=(n,l)=>`<div style="background:var(--bg5);border:1px solid var(--bdr);border-radius:10px;padding:9px 6px;text-align:center"><div style="font-family:var(--disp);font-size:22px;color:var(--em)">${n}</div><div style="font-size:10px;color:var(--dim)">${l}</div></div>`;
  document.getElementById('usage-sum').innerHTML=box(rows.length,'Admins')+box(allT.length,'Tournaments')+box(allT.filter(t=>t.live).length,'Live now')+
    box(rows.filter(r=>r.last&&now-r.last<wk).length,'Active this week')+box(rows.filter(r=>r.created&&now-r.created<wk).length,'New this week');
  let q=(document.getElementById('usage-q').value||'').trim().toLowerCase();
  let list=q?rows.filter(r=>(r.name+' '+r.uname+' '+r.ts.map(t=>t.name).join(' ')).toLowerCase().includes(q)):rows;
  document.getElementById('usage-list').innerHTML=list.length?list.map(r=>`<div data-noi18n style="padding:9px 0;border-bottom:1px solid var(--bdr)">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:baseline"><b style="font-size:13px">${esc(r.name)}</b>${r.uname?`<span style="font-size:11px;color:var(--dim)">@${esc(r.uname)}</span>`:''}
      <span style="margin-left:auto;font-size:11px;color:var(--dim)">${usageAgo(r.last)}</span></div>
    <div style="font-size:11px;color:var(--dim);margin-top:2px">${r.ts.length} tournament${r.ts.length===1?'':'s'}${r.created?' · joined '+new Date(r.created).toISOString().slice(0,10):''}</div>
    ${r.ts.slice(0,8).map(t=>`<div style="font-size:12px;margin-top:3px"><a href="?t=${encodeURIComponent(t.tid)}" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">${esc(t.name||'Untitled')}</a> <span style="color:var(--dim);font-size:11px">${esc(t.edition||'')} · ${usageAgo(t.updatedAt)}</span>${t.live?' <span class="tag tr">🔴 LIVE</span>':''}</div>`).join('')}
    ${r.ts.length>8?`<div style="font-size:11px;color:var(--dim);margin-top:3px">+ ${r.ts.length-8} more</div>`:''}
  </div>`).join(''):'<p style="color:var(--dim);font-size:12px">Nothing found.</p>';
}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='usage-q')renderUsage();});

// ── One-time import of data saved on this device by the old version ───
function legacyAccounts(){
  let done=safeParse(lsGet(LS_LEGACY_DONE),[]);if(!Array.isArray(done))done=[];
  let users=safeParse(lsGet('cs_users_v1'),{});
  if(!users||typeof users!=='object')return [];
  return Object.keys(users).filter(u=>!done.includes(u)&&users[u]&&users[u].data&&
    ((users[u].data.teams||[]).length||(users[u].data.matches||[]).length))
    .map(u=>({uname:u,name:users[u].name||u,data:users[u].data}));
}
function renderLegacyImport(){
  let card=document.getElementById('legacy-card'),el=document.getElementById('legacy-import');
  if(!card||!el)return;
  let list=APP.role==='admin'?legacyAccounts():[];
  card.style.display=list.length?'':'none';
  el.innerHTML=list.map((a,i)=>`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 0">
    <div style="flex:1;min-width:140px;font-size:12px"><b>${esc((a.data.tournament&&a.data.tournament.name)||a.name)}</b>
      <span style="color:var(--dim)"> — ${(a.data.teams||[]).length} teams, ${(a.data.matches||[]).length} matches (old account “${esc(a.uname)}”)</span></div>
    <button class="bsm bgld" onclick="importLegacy(${i})">📥 Import</button>
  </div>`).join('');
}
async function importLegacy(i){
  let a=legacyAccounts()[i];if(!a||APP.role!=='admin')return;
  let d=a.data;
  let meta=Object.assign(blankTournament(a.name+"'s Tournament"),(d.tournament&&typeof d.tournament==='object')?d.tournament:{});
  let matches=(Array.isArray(d.matches)?d.matches:[]).filter(m=>m&&m.id).map(m=>{
    m.id=String(m.id).replace(/[.#$\[\]\/]/g,'_');
    if(!Array.isArray(m.innings))m.innings=[];if(!Array.isArray(m.umpires))m.umpires=[];return m;});
  let liveId=d.liveId?String(d.liveId).replace(/[.#$\[\]\/]/g,'_'):'';
  let ok=await createTournament(meta,Array.isArray(d.teams)?d.teams:[],matches,liveId);
  let done=safeParse(lsGet(LS_LEGACY_DONE),[]);if(!Array.isArray(done))done=[];
  done.push(a.uname);lsSet(LS_LEGACY_DONE,JSON.stringify(done));
  initApp();showTab('admin');
  toast(ok?'📥 Imported as a new tournament':'Imported on this device — will sync when online',ok?undefined:'warn');
}

// ── Viewers: open a tournament and follow it live ─────────────────────
let _es=null,_vraw=null,_pollTimer=null,_autoNavLiveId=null;
function viewerAfterUpdate(hasLive){
  // Refresh what the viewer is looking at; jump to Live only ONCE when a new
  // match goes live, so they stay free to browse scorecards and stats.
  let a=activeTabName();
  if(a==='scorecard')renderSC();
  else if(a==='history')renderHistory();
  if(hasLive&&APP.liveMatch&&_autoNavLiveId!==APP.liveMatch.id){
    _autoNavLiveId=APP.liveMatch.id;
    if(a!=='live')showTab('live');
  }
}
function setSyncBar(msg){let el=document.getElementById('sync-msg');if(el)el.textContent=msg;}
// Compare the new state with the last one and raise match alerts for viewers
let _alertSnap=null;
function matchAlerts(){
  let snap={};
  APP.matches.forEach(m=>{snap[m.id]={st:m.status,inns:(m.innings||[]).map(i=>({w:i.wickets||0,c:!!i.completed,bat:Object.fromEntries(Object.entries(i.batsmen||{}).map(([k,b])=>[k,b.runs||0]))}))};});
  let prev=_alertSnap;_alertSnap=snap;
  if(!prev)return; // first load: no alerts for what already happened
  APP.matches.forEach(m=>{
    let p=prev[m.id];if(!p)return;
    let A=rawTeamName(m.teamAId),B=rawTeamName(m.teamBId);
    if(p.st!=='live'&&m.status==='live')notifyMatchStarted(A,B,m.matchType);
    (m.innings||[]).forEach((inn,ix)=>{
      let q=p.inns[ix]||{w:0,c:false,bat:{}};
      Object.entries(inn.batsmen||{}).forEach(([k,b])=>{let was=q.bat[k]||0,now=b.runs||0;
        if(was<100&&now>=100)notifyCentury(b.name,now);else if(was<50&&now>=50)notifyHalfCentury(b.name,now);});
      if((inn.wickets||0)>q.w){
        let f=(inn.fallOfWickets||[])[inn.fallOfWickets.length-1];
        let out=f&&Object.values(inn.batsmen||{}).find(b=>b.name===f.batsman&&b.status==='out');
        notifyWicket(f?f.batsman:'Batter',out?out.runs:0,out?dispDism(out.dismissal):'',`${inn.runs}/${inn.wickets}`,ov(inn));
      }
      if(inn.completed&&!q.c&&m.status!=='completed')notifyInningsComplete(rawTeamName(inn.battingTeamId),inn.runs,inn.wickets,ov(inn));
    });
    if(p.st!=='completed'&&m.status==='completed'&&m.resultText)notifyMatchResult(m.resultText,m.matchType);
  });
}
function viewerApply(){
  if(APP.role!=='viewer')return;
  if(!_vraw||_vraw.meta==null){setSyncBar('⚠ This tournament is no longer available');return;}
  applyPacked(packedFromCloud(_vraw));
  try{matchAlerts();}catch(e){}
  APP.dname=String(_vraw.ownerName||'');
  let hasLive=APP.matches.some(m=>m.status==='live');
  document.getElementById('livebadge').classList.toggle('hidden',!hasLive);
  setSyncBar(hasLive?'🟢 Live — scores update automatically':'🟢 Connected — no match is live right now');
  renderHome();renderMatches();populateSCSelect();renderLive();
  viewerAfterUpdate(hasLive);
  if(OVL)renderOverlay();
}
function setAtPath(obj,path,val){
  let parts=String(path).split('/').filter(Boolean);
  if(!parts.length)return;
  let o=obj;
  for(let i=0;i<parts.length-1;i++){
    if(!o[parts[i]]||typeof o[parts[i]]!=='object')o[parts[i]]={};
    o=o[parts[i]];
  }
  let k=parts[parts.length-1];
  if(val===null||val===undefined)delete o[k];else o[k]=val;
}
function onStreamEvent(type,e){
  let d;try{d=JSON.parse(e.data);}catch(err){return;}
  if(!d||typeof d.path!=='string')return;
  if(type==='put'&&d.path==='/'){_vraw=(d.data&&typeof d.data==='object')?d.data:null;}
  else{
    if(!_vraw)_vraw={};
    if(type==='put')setAtPath(_vraw,d.path,d.data);
    else if(d.data&&typeof d.data==='object')Object.keys(d.data).forEach(k=>setAtPath(_vraw,d.path+'/'+k,d.data[k]));
  }
  viewerApply();
}
// Light mode: each ball only sends the live match (with the last 12 balls of
// commentary). Anything else changing bumps live.rev and viewers reload once.
let _vLite=false,_vlive=null,_vrev=null,_vFetching=false,_vAgain=false;
function onLiveEvent(type,e){
  let d;try{d=JSON.parse(e.data);}catch(err){return;}
  if(!d||typeof d.path!=='string')return;
  if(d.path==='/'&&type==='put')_vlive=(d.data&&typeof d.data==='object')?d.data:null;
  else{
    if(!_vlive||typeof _vlive!=='object')_vlive={};
    if(type==='put')setAtPath(_vlive,d.path,d.data);
    else if(d.data&&typeof d.data==='object')Object.keys(d.data).forEach(k=>setAtPath(_vlive,d.path+'/'+k,d.data[k]));
  }
  viewerLive();
}
function viewerLive(){
  if(APP.role!=='viewer')return;
  if(!_vlive||typeof _vlive!=='object'||_vlive.rev!==_vrev){_vrev=_vlive&&_vlive.rev;return viewerFull();}
  if(!_vraw)return viewerFull();
  let mid=String(_vlive.mid||'');
  if(mid&&SAFE_ID.test(mid)&&typeof _vlive.m==='string'&&_vlive.m){
    if(!_vraw.matches||typeof _vraw.matches!=='object')_vraw.matches={};
    _vraw.matches[mid]=_vlive.m;
  }
  _vraw.liveId=mid;
  viewerApply();
}
async function viewerFull(){
  if(_vFetching){_vAgain=true;return;}
  _vFetching=true;
  try{let raw=await dbReq('GET','tournaments/'+APP.viewTid);if(APP.role==='viewer'){_vraw=raw;viewerApply();if(_vLite&&raw&&!raw.live)startViewerStream();}}
  catch(e){setSyncBar('📡 Reconnecting…');}
  finally{_vFetching=false;if(_vAgain){_vAgain=false;viewerFull();}}
}
function startViewerPoll(){
  if(_pollTimer)return;
  _pollTimer=setInterval(async()=>{
    if(APP.role!=='viewer'||!APP.viewTid)return;
    if(_es&&_es.readyState===1)return; // stream is healthy
    try{
      if(_vLite){let lv=await dbReq('GET','tournaments/'+APP.viewTid+'/live');
        if(JSON.stringify(lv)===JSON.stringify(_vlive))return;_vlive=lv;viewerLive();return;}
      let raw=await dbReq('GET','tournaments/'+APP.viewTid);
      if(raw&&_vraw&&raw._savedAt===_vraw._savedAt)return;
      _vraw=raw;viewerApply();
    }catch(e){setSyncBar('📡 Reconnecting…');}
  },4000);
}
function stopViewerStream(){
  if(_es){try{_es.close();}catch(e){}_es=null;}
  if(_pollTimer){clearInterval(_pollTimer);_pollTimer=null;}
}
function startViewerStream(){
  stopViewerStream();
  if(APP.role!=='viewer'||!APP.viewTid)return;
  startViewerPoll(); // only does work while the stream is down
  _vLite=!!(_vraw&&_vraw.live&&typeof _vraw.live==='object'&&'rev' in _vraw.live);
  _vlive=_vLite?_vraw.live:null;_vrev=_vLite?_vraw.live.rev:null;
  if(typeof EventSource==='undefined')return;
  try{
    _es=new EventSource(DB_URL+'/tournaments/'+APP.viewTid+(_vLite?'/live':'')+'.json');
    let h=_vLite?onLiveEvent:onStreamEvent;
    _es.addEventListener('put',e=>h('put',e));
    _es.addEventListener('patch',e=>h('patch',e));
    _es.onerror=()=>setSyncBar('📡 Reconnecting…');
  }catch(e){_es=null;}
}
async function openViewer(tid){
  tid=String(tid||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,60);
  if(!tid)throw new Error('NOT_FOUND');
  let raw=await dbReq('GET','tournaments/'+tid);
  if(!raw||raw.meta==null)throw new Error('NOT_FOUND');
  stopViewerStream();
  APP.role='viewer';APP.uname=null;APP.tid=null;APP.viewTid=tid;
  _vraw=raw;applyPacked(packedFromCloud(raw));
  APP.dname=String(raw.ownerName||'');
  if(!OVL){try{lsSet(LS_VIEW,tid);}catch(e){}}
  initApp();
  if(OVL)renderOverlay();
}
// Resolve an admin's username to their tournaments (live first, then newest)
async function tournamentsOfUser(uname){
  let uid=await dbReq('GET','usernames/'+uname);
  if(!uid||typeof uid!=='string')return null;
  return sortTournaments(await dbReq('GET','userTournaments/'+uid));
}
