// ══════════════════════════════════════════════════════════════════════════
//  LOOKING FOR PLAYERS: teams post what they need, players post that they
//  are free. Public for up to 30 days; the poster can delete; a phone number
//  (WhatsApp) is only allowed when the poster says they are 18 or older.
//  board/$id = {uid,kind:'team'|'player',role,city,when,note,name,phone?,adult?,at,exp}
// ══════════════════════════════════════════════════════════════════════════
const BD_DAYS=30,BD_MAX_MINE=3,BD_ROLES=['Any','Batter','Bowler','All-rounder','Wicket-keeper'];
let _bd=[],_bdKind='all';
async function openBoard(){
  let b=document.getElementById('bd-body');if(!b)return;
  b.innerHTML=`<div class="mt">🤝 Looking for players</div>
    <p class="bd-sub">Teams short of players and players looking for a game, near you.</p>
    <div class="bd-tabs" role="tablist">
      <button class="bsm" data-k="all" onclick="bdKind('all')">All</button>
      <button class="bsm" data-k="team" onclick="bdKind('team')">🏏 Teams need players</button>
      <button class="bsm" data-k="player" onclick="bdKind('player')">🙋 Players available</button>
    </div>
    <div class="asearch" style="margin:8px 0"><input id="bd-q" type="search" placeholder="Town, city or role" autocomplete="off" oninput="renderBoard()" aria-label="Search posts"></div>
    <button class="bsm bgld" style="width:100%" onclick="bdForm()">➕ Post</button>
    <div id="bd-form"></div>
    <div id="bd-list"><p style="color:var(--dim)">Loading…</p></div>
    <div class="mact"><button class="bsm" onclick="closeM('bd-mo')">✕ Close</button></div>`;
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(b);
  openM('bd-mo');bdTabs();
  await loadBoard();
}
function bdKind(k){_bdKind=k;bdTabs();renderBoard();}
function bdTabs(){document.querySelectorAll('#bd-body .bd-tabs button').forEach(x=>x.classList.toggle('bgld',x.getAttribute('data-k')===_bdKind));}
function bdClean(id,v){
  if(!SAFE_ID.test(id)||!v||typeof v!=='object')return null;
  let s=(x,n)=>typeof x==='string'?x.slice(0,n):'';
  let p={id,uid:s(v.uid,128),kind:v.kind==='player'?'player':'team',role:s(v.role,30),city:s(v.city,40),when:s(v.when,40),note:s(v.note,200),name:s(v.name,60),
    phone:/^[0-9]{10,13}$/.test(String(v.phone||''))&&v.adult===true?String(v.phone):'',at:+v.at||0,exp:+v.exp||0};
  return p.exp>Date.now()?p:null;
}
async function loadBoard(){
  let raw=null;
  try{let r=await fetch(DB_URL+'/board.json?orderBy=%22at%22&limitToLast=150');if(!r.ok)throw new Error('HTTP_'+r.status);raw=await r.json();}
  catch(e){let el=document.getElementById('bd-list');if(el)el.innerHTML=`<p class="emsg">${e.message==='HTTP_401'?'The board is not switched on yet.':'Could not load posts. Check your connection and try again.'}</p>`;return;}
  _bd=Object.entries(raw&&typeof raw==='object'?raw:{}).map(([k,v])=>bdClean(k,v)).filter(Boolean).sort((a,b)=>b.at-a.at);
  // tidy up: delete my own posts that have expired
  let me=myAuth();
  if(me&&raw&&typeof raw==='object')Object.entries(raw).forEach(([k,v])=>{if(SAFE_ID.test(k)&&v&&v.uid===me.uid&&(+v.exp||0)<=Date.now())dbReq('DELETE','board/'+k,undefined,true).catch(()=>{});});
  renderBoard();
}
function renderBoard(){
  let el=document.getElementById('bd-list');if(!el)return;
  let q=String((document.getElementById('bd-q')||{}).value||'').trim().toLowerCase();
  let me=AUTH?AUTH.uid:(safeParse(lsGet(LS_AUTH),null)||{}).uid;
  let rows=_bd.filter(p=>(_bdKind==='all'||p.kind===_bdKind)&&(!q||(p.city+' '+p.role+' '+p.note+' '+p.name).toLowerCase().includes(q)));
  if(!rows.length){el.innerHTML=`<p style="color:var(--dim);margin-top:10px">${_bd.length?'No posts match your search.':'No posts yet. Be the first: tap ➕ Post.'}</p>`;
    if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(el);return;}
  let day=t=>new Date(t).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  el.innerHTML=rows.map(p=>{
    let head=p.kind==='team'?`<span>🏏 Team needs:</span> <span>${esc(p.role&&p.role!=='Any'?p.role:'Players')}</span>`:`<span>🙋 Available:</span> <span>${esc(p.role&&p.role!=='Any'?p.role:'Any role')}</span>`;
    let wa=p.phone?`<a class="bsm bblu bd-wa" href="https://wa.me/${p.phone.length===10?'91'+p.phone:p.phone}?text=${encodeURIComponent('Hi, I saw your post on Stumply ('+(p.kind==='team'?'team needs players':'player available')+(p.city?', '+p.city:'')+').')}" target="_blank" rel="noopener">💬 WhatsApp</a>`
      :`<span class="bd-nophone">No phone shared. Reply as the post says.</span>`;
    return `<div class="bd-post${p.kind==='player'?' bd-pl':''}">
      <div class="bd-h">${head}</div>
      <div class="bd-meta" data-noi18n>${[p.city&&'📍 '+esc(p.city),p.when&&'📅 '+esc(p.when)].filter(Boolean).join(' · ')}</div>
      ${p.note?`<div class="bd-note" data-noi18n>${esc(p.note)}</div>`:''}
      <div class="bd-foot"><span data-noi18n>${esc(p.name||'Stumply user')} · ${day(p.at)}</span>
      <span class="bd-act">${wa}${p.uid===me?`<button class="bsm bdng" onclick="bdDelete('${p.id}')">🗑 Delete</button>`
        :(_isOwner?`<button class="bsm bdng" onclick="bdDelete('${p.id}')">🗑 Remove</button>`:`<a class="bsm bd-rep" href="mailto:phanisekharb4u@gmail.com?subject=${encodeURIComponent('Stumply board: report post '+p.id)}">🚩 Report</a>`)}</span></div>
    </div>`;}).join('');
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(el);
}
function bdForm(){
  let f=document.getElementById('bd-form');if(!f)return;
  if(f.innerHTML){f.innerHTML='';return;}
  if(!myAuth()){
    closeM('bd-mo');
    showAuthScreen('Sign in or create a free account to post on the board (Google is quickest). Reading posts needs no account.');
    return;
  }
  if(_bd.filter(p=>p.uid===AUTH.uid).length>=BD_MAX_MINE){toast(`You can have ${BD_MAX_MINE} posts at a time. Delete an old one first.`,'warn');return;}
  f.innerHTML=`<div class="pcl bd-form">
    <div class="mr"><label>I am posting as</label><select id="bd-kind"><option value="team">🏏 A team that needs players</option><option value="player">🙋 A player looking for a team</option></select></div>
    <div class="mr"><label>Role</label><select id="bd-role">${BD_ROLES.map(r=>`<option value="${r}">${r}</option>`).join('')}</select></div>
    <div class="mr"><label>Town or city</label><input class="ifield" id="bd-city" maxlength="40" placeholder="e.g. Guntur"></div>
    <div class="mr"><label>When (optional)</label><input class="ifield" id="bd-when" maxlength="40" placeholder="e.g. Saturday 7 am, or weekends"></div>
    <div class="mr"><label>Details</label><textarea class="ifield" id="bd-note" rows="3" maxlength="200" placeholder="e.g. Tennis ball, 10 overs, Gandhi ground. Ask for Ravi at the nets." style="width:100%;box-sizing:border-box;resize:vertical"></textarea></div>
    <label class="bd-chk"><input type="checkbox" id="bd-adult" onchange="document.getElementById('bd-phone-row').style.display=this.checked?'':'none'"> I am 18 or older and want to share my WhatsApp number</label>
    <div class="mr" id="bd-phone-row" style="display:none"><label>WhatsApp number</label><input class="ifield" id="bd-phone" inputmode="numeric" maxlength="15" placeholder="10-digit mobile number"></div>
    <p class="pcl-hint">Your post is public for ${BD_DAYS} days, then it disappears. Under 18? Do not share a phone number: ask a parent, coach or organiser to post for you, or say in the details where to find you.</p>
    <div id="bd-err" class="emsg"></div>
    <button class="bsm bgld" onclick="bdSave()">✔ Post it</button></div>`;
  if(CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(f);
}
async function bdSave(){
  if(!myAuth())return;
  const g=id=>String((document.getElementById(id)||{}).value||'').trim().replace(/[<>`]/g,'');
  let err=document.getElementById('bd-err'),adult=!!(document.getElementById('bd-adult')||{}).checked;
  let phone=g('bd-phone').replace(/[\s+()-]/g,'');
  let city=g('bd-city').slice(0,40),note=g('bd-note').slice(0,200);
  const bad=t=>{if(err)err.textContent=t;};
  if(!city){bad('Please enter your town or city.');return;}
  if(adult&&!/^[0-9]{10,13}$/.test(phone)){bad('Enter a 10-digit mobile number, or untick the box.');return;}
  if(!adult&&!note){bad('Please say in the details how people can reach you.');return;}
  let now=Date.now(),id='b'+now.toString(36)+Math.random().toString(36).slice(2,6);
  let post={uid:AUTH.uid,kind:g('bd-kind')==='player'?'player':'team',role:BD_ROLES.includes(g('bd-role'))?g('bd-role'):'Any',city,when:g('bd-when').slice(0,40),note,
    name:String(AUTH.name||APP.dname||'').slice(0,60),at:now,exp:now+BD_DAYS*86400000};
  if(adult){post.phone=phone;post.adult=true;}
  try{await dbReq('PUT','board/'+id,post,true);}
  catch(e){bad(e.message==='NETWORK'?'No connection — try again.':'Could not post it — try again.');return;}
  toast('✅ Posted. It stays up for '+BD_DAYS+' days.');
  document.getElementById('bd-form').innerHTML='';
  _bd.unshift(bdClean(id,post));renderBoard();
}
async function bdDelete(id){
  if(!myAuth()||!SAFE_ID.test(id))return;
  try{await dbReq('DELETE','board/'+id,undefined,true);_bd=_bd.filter(p=>p.id!==id);renderBoard();toast('Post deleted');}
  catch(e){toast(authErrText(e.message),'warn');}
}
