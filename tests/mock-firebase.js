// Fake Firebase for tests: Auth + Realtime Database REST (with streaming), following the rules in
// database.rules.json closely enough to catch permission mistakes. Start with ROOT=<repo> PORT=<port> node mock-firebase.js
// Options: CFG=none (app not configured), IDP=google.com,twitter.com (sign-in providers switched on), ANON=off.
// Test helpers: /__dump (whole database), /__owner?uid= (make a site owner), /__expire (expire all tokens).
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=process.env.ROOT,PORT=+process.env.PORT,CONFIGURED=process.env.CFG!=='none';
const users={};let db={};let NEXT=null;let epoch=0;const streams=[];
const tok=(uid)=>`tok.${uid}.${epoch}`;
const uidOf=t=>{if(!t)return null;let p=t.split('.');return p[0]==='tok'&&+p[2]===epoch?p[1]:null;};
const get=(p)=>p.reduce((o,k)=>o&&typeof o==='object'?o[k]:undefined,db);
function set(p,v){if(!p.length){db=v||{};return;}let o=db;for(let i=0;i<p.length-1;i++){if(!o[p[i]]||typeof o[p[i]]!=='object')o[p[i]]={};o=o[p[i]];}
  if(v===null||v===undefined)delete o[p[p.length-1]];else o[p[p.length-1]]=v;}
function canRead(p,uid){const own=!!(uid&&db.owners&&db.owners[uid]===true);if(p[0]==='public')return true;if((p[0]==='players'||p[0]==='claims')&&p.length>=2)return true;if(p[0]==='polls')return p.length>=3;if(p[0]==='scorerOf'&&p.length>=2)return uid===p[1];if(p[0]==='owners'&&p.length===2)return uid===p[1];if((p[0]==='users'||p[0]==='userTournaments')&&p.length===1)return !!(uid&&db.owners&&db.owners[uid]===true);if(['tournaments','userTournaments','usernames'].includes(p[0])&&p.length>=2)return true;if(p[0]==='users'&&p.length>=2)return uid===p[1];return false;}
function canWrite(p,uid,val,method){
  if(!uid)return false;
  const T=id=>get(['tournaments',id]);const isSc=id=>{let t=T(id);return !!(t&&t.scorers&&t.scorers[uid]);};
  if(p[0]==='tournaments'&&p.length>=2){let cur=T(p[1]);
    if(cur){if(cur.owner===uid)return true;return isSc(p[1])&&p.length>=3&&['matches','order','liveId','_savedAt','live'].includes(p[2]);}
    return p.length===2&&method==='PUT'&&!!val&&val.owner===uid;}
  if(p[0]==='userTournaments'&&p.length>=2){if(p[1]===uid)return true;let t=T(p[2]);return p.length===4&&['live','updatedAt'].includes(p[3])&&t&&t.owner===p[1]&&isSc(p[2]);}
  if(p[0]==='public'&&p.length>=2){let t=T(p[1]);if(t&&t.owner===uid)return true;return p.length===3&&['live','updatedAt'].includes(p[2])&&isSc(p[1])&&get(p.slice(0,2))!==undefined;}
  if(p[0]==='scorerOf'&&p.length===3){if(uid===p[1])return val===null;let t=T(p[2]);return !!(t&&t.owner===uid);}
  if(p[0]==='polls'){if(p.length===2){let t=get(['tournaments',p[1]]);return !!(t&&t.owner===uid)&&val===null;}
    return p.length===4&&p[3]===uid&&get(['tournaments',p[1]])!==undefined&&typeof val==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(val);}
  if(p[0]==='players'&&p.length>=2)return p[1]===uid&&!uid.startsWith('a');
  if(p[0]==='claims'&&p.length===3){if(uid.startsWith('a'))return false;const cur=get(p),t=T(p[1]);
    if(val===null)return cur===uid||!!(t&&t.owner===uid);return cur===undefined&&val===uid&&!!t;}
  if(p[0]==='usernames'&&p.length===2)return get(p)===undefined&&val===uid;
  if(p[0]==='users'&&p.length>=2)return p[1]===uid;
  return false;}
function notify(p,type,data){streams.forEach(s=>{const pj=p.join('/'),sj=s.p.join('/');
  if(p.length>=s.p.length&&p.slice(0,s.p.length).join('/')===sj){let rel='/'+p.slice(s.p.length).join('/');s.res.write(`event: ${type}\ndata: ${JSON.stringify({path:rel,data})}\n\n`);}
  else if(s.p.slice(0,p.length).join('/')===pj){s.res.write(`event: put\ndata: ${JSON.stringify({path:'/',data:get(s.p)??null})}\n\n`);}});}
const body=req=>new Promise(r=>{let b='';req.on('data',d=>b+=d);req.on('end',()=>r(b));});
const J=(res,code,o)=>{res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(o));};
http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://x');
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'*','Access-Control-Allow-Headers':'*'});return res.end();}
  if(u.pathname==='/__expire'){epoch++;return J(res,200,{epoch});}
  if(u.pathname==='/__owner'){db.owners=db.owners||{};db.owners[u.searchParams.get('uid')]=true;return J(res,200,{ok:1});}
  if(u.pathname==='/__idp'){const c=u.searchParams.get('cont');const pid=u.searchParams.get('pid');const em=u.searchParams.get('em')||'social@example.com';
    const back=pid==='twitter.com'?'?oauth_token=t1&oauth_verifier=v1':'?code=c1&state=s1';res.writeHead(302,{Location:c+back+'&em='+encodeURIComponent(em)});return res.end();}
  if(u.pathname==='/__dump')return J(res,200,{db,users:Object.keys(users)});
  if(u.pathname.startsWith('/auth/accounts:')){
    const m=u.pathname.split(':')[1],b=JSON.parse(await body(req)||'{}');
    if(m==='signUp'&&!b.email){if(process.env.ANON==='off')return J(res,400,{error:{message:'ADMIN_ONLY_OPERATION'}});
      const uid='a'+Math.random().toString(36).slice(2,10);return J(res,200,{idToken:tok(uid),refreshToken:'r.'+uid,expiresIn:'3600',localId:uid});}
    if(m==='signUp'){if(users[b.email])return J(res,400,{error:{message:'EMAIL_EXISTS'}});if((b.password||'').length<6)return J(res,400,{error:{message:'WEAK_PASSWORD : Password should be at least 6 characters'}});
      const uid='u'+Object.keys(users).length+Math.random().toString(36).slice(2,8);users[b.email]={uid,password:b.password};
      return J(res,200,{idToken:tok(uid),email:b.email,refreshToken:'r.'+uid,expiresIn:'3600',localId:uid});}
    if(m==='signInWithPassword'){const x=users[b.email];if(!x||x.password!==b.password)return J(res,400,{error:{message:'INVALID_LOGIN_CREDENTIALS'}});
      return J(res,200,{idToken:tok(x.uid),email:b.email,refreshToken:'r.'+x.uid,expiresIn:'3600',localId:x.uid,registered:true});}
    if(m==='sendOobCode')return J(res,200,{email:b.email});
    if(m==='createAuthUri'){const on=(process.env.IDP||'google.com,twitter.com,facebook.com').split(',');
      if(!on.includes(b.providerId))return J(res,400,{error:{message:'OPERATION_NOT_ALLOWED'}});
      return J(res,200,{authUri:'http://localhost:'+(process.env.PORT||8771)+'/__idp?pid='+b.providerId+'&cont='+encodeURIComponent(b.continueUri),sessionId:'sid-'+b.providerId,providerId:b.providerId});}
    if(m==='signInWithIdp'){const q=new URL(b.requestUri).searchParams;const em=q.get('em')||'social@example.com';const pid=(b.sessionId||'').slice(4);
      if(!q.get('code')&&!q.get('oauth_verifier'))return J(res,400,{error:{message:'INVALID_IDP_RESPONSE'}});
      if(users[em]&&users[em].password&&!users[em].idp)return J(res,200,{needConfirmation:true,email:em});
      if(!users[em]){users[em]={uid:'s'+Object.keys(users).length+Math.random().toString(36).slice(2,8),idp:pid};}
      const x=users[em];return J(res,200,{idToken:tok(x.uid),email:em,refreshToken:'r.'+x.uid,expiresIn:'3600',localId:x.uid,displayName:'Social Test User',providerId:pid});}
    return J(res,400,{error:{message:'UNKNOWN'}});}
  if(u.pathname==='/token'){const b=new URLSearchParams(await body(req));const uid=(b.get('refresh_token')||'').split('.')[1];
    if(!uid)return J(res,400,{error:{message:'INVALID_REFRESH_TOKEN'}});
    return J(res,200,{id_token:tok(uid),refresh_token:'r.'+uid,expires_in:'3600',user_id:uid});}
  if(u.pathname.startsWith('/db/')&&u.pathname.endsWith('.json')){
    const p=u.pathname.slice(4,-5).split('/').filter(Boolean);const auth=u.searchParams.get('auth');const uid=uidOf(auth);
    if(auth&&!uid)return J(res,401,{error:'Auth token is expired'});
    if(req.method==='GET'){
      if(!canRead(p,uid))return J(res,401,{error:'Permission denied'});
      if((req.headers.accept||'').includes('text/event-stream')){
        res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});
        res.write(`event: put\ndata: ${JSON.stringify({path:'/',data:get(p)??null})}\n\n`);
        const s={p,res};streams.push(s);req.on('close',()=>streams.splice(streams.indexOf(s),1));return;}
      return J(res,200,get(p)??null);}
    const raw=await body(req);const val=raw?JSON.parse(raw):null;
    if(req.method==='PUT'){NEXT=null;if(!canWrite(p,uid,val,'PUT'))return J(res,401,{error:'Permission denied'});set(p,val);notify(p,'put',val);return J(res,200,val);}
    if(req.method==='PATCH'){const save=db;db=JSON.parse(JSON.stringify(save));Object.keys(val).forEach(k=>set(p.concat(k.split('/')),val[k]));NEXT=db;db=save;
      for(const k of Object.keys(val)){if(!canWrite(p.concat(k.split('/')),uid,val[k],'PATCH')){NEXT=null;return J(res,401,{error:'Permission denied'});}}NEXT=null;
      Object.keys(val).forEach(k=>set(p.concat(k.split('/')),val[k]));Object.keys(val).forEach(k=>notify(p.concat(k.split('/')),'put',val[k]));return J(res,200,val);}
    if(req.method==='DELETE'){if(!canWrite(p,uid,null,'DELETE'))return J(res,401,{error:'Permission denied'});set(p,null);notify(p,'put',null);return J(res,200,null);}
  }
  if(u.pathname==='/firebase-config.js'&&CONFIGURED){res.writeHead(200,{'Content-Type':'text/javascript'});
    return res.end(`window.STUMPLY_FIREBASE={apiKey:"test-key",databaseURL:"http://localhost:${PORT}/db",authEndpoint:"http://localhost:${PORT}/auth",tokenEndpoint:"http://localhost:${PORT}/token"};`);}
  let f=path.join(ROOT,u.pathname==='/'?'index.html':u.pathname);
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':'application/octet-stream'});res.end(d);});
}).listen(PORT);
