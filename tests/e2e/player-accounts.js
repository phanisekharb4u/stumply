// Player accounts: a player taps "This is me" in two organisers' tournaments, signs up on the way, and gets one career across both; the organiser can remove a wrong claim; the career link is public
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const page=async(tag)=>{const p=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());return p;};
const reg=async(A,n,u)=>{await A.click('#auth-tabs >> text=Register');await A.fill('#r-n',n);await A.fill('#r-u',u+T);await A.fill('#r-e',u+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);};
const txt=async(P,sel)=>P.evaluate(s=>{let e=document.querySelector(s);return e?e.innerText.replace(/\n+/g,' | ').trim():'(none)';},sel);
const play=async(A,name,teams,runs)=>A.evaluate(async([name,teams,runs])=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
 showTab('admin');document.getElementById('t-name').value=name;document.getElementById('t-size').value='3';document.getElementById('t-overs').value='custom';document.getElementById('t-overs-custom').value='1';saveTournament();await W(100);
 for(const [tn,code,ps] of teams){document.getElementById('nt-name').value=tn;document.getElementById('nt-code').value=code;ps.forEach((p,i)=>{document.getElementById('bp-n'+(i+1)).value=p;document.getElementById('bp-j'+(i+1)).value=i+1;});addTeam();await W(60);}
 showTab('matches');openSchedModal();await W(80);scheduleMatch();await W(150);startMatch(APP.matches[0].id);confirmToss();await W(150);confirmInningsSetup();await W(250);
 const pick=async()=>{if(document.getElementById('nov-mo').classList.contains('on')){let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();await W(20);}};
 for(const r of runs){await pick();if(r==='W'){triggerWicket();await W(30);document.getElementById('wkt-type').value='Bowled';onDismChange();confirmWicket();}else addRun(r);await W(150);}
 for(let i=0;i<40&&!document.getElementById('ins-mo').classList.contains('on');i++)await W(100);confirmInningsSetup();await W(200);
 for(let i=0;i<12&&APP.liveMatch;i++){await pick();addRun(1);await W(130);}await W(1500);try{closeCelebration();}catch(e){}await flushSave();},[name,teams,runs]);

const A=await page('A');await A.goto(U);await A.waitForTimeout(500);await reg(A,'Test Organiser One','pa');await A.evaluate(()=>lsSet('stumply_ww','off'));
await play(A,'Test Cup One',[['Test Team A','TTA',['Test Batter','A Player 2','A Player 3']],['Test Team B','TTB',['B Player 1','B Player 2','B Player 3']]],[4,6,0,1,0,0]);
const tidA=await A.evaluate(()=>APP.tid);
const B=await page('B');await B.goto(U);await B.waitForTimeout(500);await reg(B,'Test Organiser Two','pb');await B.evaluate(()=>lsSet('stumply_ww','off'));
await play(B,'Test Cup Two',[['Test Team C','TTC',['T Batter','C Player 2','C Player 3']],['Test Team D','TTD',['D Player 1','D Player 2','D Player 3']]],[6,6,'W',2,0,0]);
const tidB=await B.evaluate(()=>APP.tid);
// A player watches the first tournament and taps "This is me" without an account
const P=await page('P');await P.goto(U+'?t='+tidA);await P.waitForTimeout(1500);
await P.evaluate(()=>openPlayer(APP.teams[0].players[0].id));await P.waitForTimeout(800);
L('viewer sees claim button:',await txt(P,'#pl-claim'));
await P.click('#pcl-btn');await P.waitForTimeout(500);
L('sign-in screen message:',await P.evaluate(()=>{let e=document.querySelector('#auth-msg, .amsg, #a-msg');return e?e.innerText.trim():document.body.innerText.includes('we add this player to your career')||document.body.innerText.includes('Then we add this player')?'shown':'(missing)';}));
await reg(P,'Test Player','pp');await P.waitForTimeout(1500);
L('after sign-up the career opens:',await txt(P,'#pl-cont'));
// Same player, second organiser's tournament: already signed in, one tap
await P.goto(U+'?t='+tidB);await P.waitForTimeout(1500);
await P.evaluate(()=>openPlayer(APP.teams[0].players[0].id));await P.waitForTimeout(800);
await P.click('#pcl-btn');await P.waitForTimeout(1200);
L('after claiming in the second tournament:',await txt(P,'#pl-claim'));
await P.evaluate(()=>document.querySelector('#pl-claim .bgld').click());await P.waitForTimeout(1500);
L('career across both organisers:',await txt(P,'#pl-cont'));
const uid=await P.evaluate(()=>AUTH.uid);
// Edit the profile
await P.evaluate(()=>editPlayerProfile());await P.waitForTimeout(500);
await P.fill('#pp-city','Guntur');await P.selectOption('#pp-role','Batter');await P.evaluate(()=>savePlayerProfile());await P.waitForTimeout(1200);
L('profile line:',await P.evaluate(()=>document.querySelector('#pl-cont .pl-head').innerText.replace(/\n+/g,' | ')));
// Somebody else cannot take the same name; anonymous voters cannot claim either
L('organiser two tries to claim the same player:',await B.evaluate(async([t,p])=>{try{await dbReq('PUT','claims/'+t+'/'+p,AUTH.uid,true);return 'allowed (bad)';}catch(e){return 'blocked';}},[tidA,await A.evaluate(()=>APP.teams[0].players[0].id)]));
// The public career link
const V=await page('V');await V.goto(U+'?player='+uid);await V.waitForTimeout(1500);
L('public career link:',(await txt(V,'#pl-cont')).slice(0,200));
L('viewer has no edit button:',await V.evaluate(()=>!document.querySelector('#pl-cont [onclick^="editPlayerProfile"]')));
// Organiser one sees the claim and removes it
await A.evaluate(()=>{showTab('admin');openPlayer(APP.teams[0].players[0].id);});await A.waitForTimeout(1000);
L('organiser sees:',await txt(A,'#pl-claim'));
await A.evaluate(()=>document.querySelector('#pl-claim .bdng').click());await A.waitForTimeout(1000);
L('after removing:',await txt(A,'#pl-claim'));
await V.evaluate(()=>openPlayerCareer(new URLSearchParams(location.search).get('player')));await V.waitForTimeout(1500);
L('career after the claim was removed:',(await txt(V,'#pl-cont')).slice(0,120));
// The player says "Not me" in the second tournament
await P.goto(U+'?t='+tidB);await P.waitForTimeout(1500);
await P.evaluate(()=>openPlayer(APP.teams[0].players[0].id));await P.waitForTimeout(800);
L('player sees:',await txt(P,'#pl-claim'));
await P.evaluate(()=>[...document.querySelectorAll('#pl-claim button')].find(x=>x.innerText.includes('Not me')).click());await P.waitForTimeout(1000);
L('after Not me:',await txt(P,'#pl-claim'));
// Admin card
await A.evaluate(()=>closeM('pl-mo'));
L('admin card:',await txt(A,'#me-player-card'));
await A.evaluate(()=>openPlayerCareer(AUTH.uid));await A.waitForTimeout(1000);
L('organiser own empty career:',await txt(A,'#pl-cont'));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
