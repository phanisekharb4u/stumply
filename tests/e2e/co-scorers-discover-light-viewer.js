// Part 3: co-scorers, Discover, light viewer updates
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());return p;};
const L=(...a)=>console.log(...a);
const reg=async(p,name,un)=>{await p.goto(U);await p.waitForTimeout(500);await p.click('#auth-tabs >> text=Register');
 await p.fill('#r-n',name);await p.fill('#r-u',un);await p.fill('#r-e',un+'@example.com');await p.fill('#r-p','secret1');await p.fill('#r-p2','secret1');await p.click('#apanel-reg .btnpri');await p.waitForTimeout(1800);};
const O=await mk(),S=await mk(),V=await mk();const pend=new Map();O.on('request',r=>pend.set(r,r.method()+' '+r.url().replace(/auth=[^&]+/,'')));O.on('requestfinished',r=>pend.delete(r));O.on('requestfailed',r=>pend.delete(r));
await reg(O,'Test Owner','own'+T);await reg(S,'Test Scorer','scr'+T);
await O.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));showTab('admin');document.getElementById('t-name').value='Test Discover Cup';document.getElementById('t-city').value='Test City';document.getElementById('t-listed').checked=true;document.getElementById('t-size').value='5';saveTournament();await W(100);
 const fill=(n,c,k)=>{document.getElementById('nt-name').value=n;document.getElementById('nt-code').value=c;for(let i=1;i<=5;i++){document.getElementById('bp-n'+i).value=k+' Player '+i;document.getElementById('bp-j'+i).value=i;}addTeam();};
 fill('Test Team A','TTA','A');await W(60);fill('Test Team B','TTB','B');await W(60);showTab('matches');openSchedModal();await W(80);scheduleMatch();await W(800);});
L('add unknown:',await O.evaluate(async(t)=>{showTab('admin');document.getElementById('scr-uname').value='nobody_'+t;await addScorer();return document.getElementById('scr-err').textContent;},T));
L('add self:',await O.evaluate(async(t)=>{document.getElementById('scr-uname').value='own'+t;await addScorer();return document.getElementById('scr-err').textContent;},T));
L('add scorer:',await O.evaluate(async(t)=>{document.getElementById('scr-uname').value='scr'+t;await addScorer();return document.getElementById('scorer-list').innerText.trim();},T));
const dump=async()=>(await (await fetch(U+'__dump')).json()).db;
let db=await dump();let tid=await O.evaluate(()=>APP.tid);
L('cloud: scorers',JSON.stringify(db.tournaments[tid].scorers),'| scorerOf',Object.keys(db.scorerOf||{}).length,'| public',JSON.stringify(db.public&&db.public[tid]));
// scorer signs in again (fresh load) and sees the tournament
await S.reload();await S.waitForTimeout(1800);
L('scorer list:',await S.evaluate(()=>{showTab('admin');return document.getElementById('tourn-list').innerText.replace(/\n+/g,' | ');}));
await S.evaluate(async(tid)=>{await switchTournament(tid);await new Promise(r=>setTimeout(r,200));showTab('admin');},tid);
L('scorer view: co',await S.evaluate(()=>APP.coScorer),'| owner cards visible:',await S.evaluate(()=>[...document.querySelectorAll('.owner-only')].filter(e=>e.offsetParent).length),'| note:',await S.evaluate(()=>document.getElementById('coscorer-note').innerText.slice(0,60)));
await S.screenshot({path:'shots/t25-scorer-admin.png'});
L('scorer addTeam:',await S.evaluate(async()=>{addTeam();await new Promise(r=>setTimeout(r,50));return document.getElementById('toast').textContent;}));
// viewer opens before match starts
await V.goto(U+'?t='+tid);await V.waitForTimeout(1500);
L('viewer lite mode:',await V.evaluate(()=>_vLite));
// scorer starts and scores
await S.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));showTab('matches');startMatch(APP.matches[0].id);confirmToss();await W(80);confirmInningsSetup();await W(60);for(const r of [1,4,6,0,2]){addRun(r);await W(30);}await flushSave();});
await V.waitForTimeout(1500);
L('viewer live score:',await V.evaluate(()=>APP.liveMatch?scTxt(APP.liveMatch.innings[0])+' log '+(APP.liveMatch.innings[0].log||[]).length:'no live'));
await S.evaluate(async()=>{for(const r of [1,1,1,1,1,1,1,1,1,1]){if(document.getElementById('nov-mo').classList.contains('on')){let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();}addRun(r);await new Promise(x=>setTimeout(x,30));}await flushSave();});
await V.waitForTimeout(1500);
db=await dump();let t=db.tournaments[tid];
L('cloud: full match',t.matches[t.liveId].length,'bytes | live node m',t.live.m.length,'bytes | rev',t.live.rev,'| viewer score',await V.evaluate(()=>scTxt(APP.liveMatch.innings[0])+' log '+APP.liveMatch.innings[0].log.length));
L('owner idx live flag:',JSON.stringify(db.userTournaments[t.owner][tid].live),'| public live:',db.public[tid].live);
// owner picks it up
L('owner state:',await O.evaluate(()=>JSON.stringify({ca:collabActive(),d:_dirty,p:!!_pushing,t:!!_pushTimer,v:document.visibilityState,mo:[...document.querySelectorAll('.mo.on')].map(x=>x.id),cel:document.getElementById('celebration-overlay').classList.contains('on'),pushed:!!_pushed,timer:!!_collabTimer})));
L('owner pending:',[...pend.values()].join(' ; '));await O.waitForTimeout(7000);
L('owner sees:',await O.evaluate(()=>APP.liveMatch?scTxt(APP.liveMatch.innings[0]):'no live'),'| toast:',await O.evaluate(()=>document.getElementById('toast').textContent));
// discover
const D=await mk();await D.goto(U);await D.waitForTimeout(800);
L('discover:',await D.evaluate(async()=>{showViewer();await new Promise(r=>setTimeout(r,600));return document.getElementById('dc-list').innerText.replace(/\n+/g,' | ');}));
await D.screenshot({path:'shots/t25-discover.png'});
L('discover search miss:',await D.evaluate(()=>{document.getElementById('dc-q').value='zzz';renderDiscover();return document.getElementById('dc-list').innerText;}));
// owner turns listing off
await O.evaluate(async()=>{showTab('admin');document.getElementById('t-listed').checked=false;saveTournament();await flushSave();});
db=await dump();L('public after unlist:',JSON.stringify((db.public||{})[tid]||null));
// owner removes the scorer
await O.evaluate(async()=>{let id=Object.keys(APP.scorers)[0];await removeScorer(id);});
await S.waitForTimeout(7500);
L('scorer after removal:',await S.evaluate(()=>APP.tid+' co='+APP.coScorer+' | '+document.getElementById('toast').textContent));
// hostile public entry
await fetch(U+'__dump');
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
