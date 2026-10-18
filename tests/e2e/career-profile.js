// Career profile: one player's totals across two tournaments by the same organiser (matched by name, even in a different team), also for viewers
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const A=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
await A.goto(U);await A.waitForTimeout(500);await A.click('#auth-tabs >> text=Register');
await A.fill('#r-n','Test Admin');await A.fill('#r-u','cp'+T);await A.fill('#r-e','cp'+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);
await A.evaluate(()=>lsSet('stumply_ww','off'));
const play=async(name,teams,runs)=>A.evaluate(async([name,teams,runs])=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
 showTab('admin');document.getElementById('t-name').value=name;document.getElementById('t-size').value='3';document.getElementById('t-overs').value='custom';document.getElementById('t-overs-custom').value='1';saveTournament();await W(100);
 for(const [tn,code,ps] of teams){document.getElementById('nt-name').value=tn;document.getElementById('nt-code').value=code;ps.forEach((p,i)=>{document.getElementById('bp-n'+(i+1)).value=p;document.getElementById('bp-j'+(i+1)).value=i+1;});addTeam();await W(60);}
 showTab('matches');openSchedModal();await W(80);scheduleMatch();await W(150);startMatch(APP.matches[0].id);confirmToss();await W(150);confirmInningsSetup();await W(250);
 const pick=async()=>{if(document.getElementById('nov-mo').classList.contains('on')){let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();await W(20);}};
 for(const r of runs){await pick();if(r==='W'){triggerWicket();await W(30);document.getElementById('wkt-type').value='Bowled';onDismChange();confirmWicket();}else addRun(r);await W(150);}
 for(let i=0;i<40&&!document.getElementById('ins-mo').classList.contains('on');i++)await W(100);confirmInningsSetup();await W(200);
 for(let i=0;i<12&&APP.liveMatch;i++){await pick();addRun(1);await W(130);}await W(1500);try{closeCelebration();}catch(e){}await flushSave();},[name,teams,runs]);
await play('Test Cup One',[['Test Team A','TTA',['Test Batter','A Player 2','A Player 3']],['Test Team B','TTB',['B Player 1','B Player 2','B Player 3']]],[4,6,0,1,0,0]);
await A.evaluate(async()=>{document.getElementById('tn-new').value='Test Cup Two';await newTournament();});await A.waitForTimeout(500);
await play('Test Cup Two',[['Test Team C','TTC',['test  batter','C Player 2','C Player 3']],['Test Team D','TTD',['D Player 1','D Player 2','D Player 3']]],[6,6,'W',2,0,0]);
await A.evaluate(()=>{let p=APP.teams[0].players[0];openPlayer(p.id);});await A.waitForTimeout(200);
L('this tournament profile shows career button:',await A.evaluate(()=>!!document.querySelector('#pl-cont .bgld')));
await A.evaluate(()=>document.querySelector('#pl-cont .bgld').click());await A.waitForTimeout(1500);
L('career (organiser):',await A.evaluate(()=>document.getElementById('pl-cont').innerText.replace(/\n+/g,' | ')));
const tid=await A.evaluate(()=>APP.tid);
const V=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();V.on('pageerror',e=>errs.push('V '+e.message));
await V.goto(U+'?t='+tid);await V.waitForTimeout(1500);
await V.evaluate(()=>{let p=APP.teams[0].players[0];openPlayer(p.id);document.querySelector('#pl-cont .bgld').click();});await V.waitForTimeout(1500);
L('career (viewer):',await V.evaluate(()=>document.getElementById('pl-cont').innerText.replace(/\n+/g,' | ').slice(0,160)));
await V.evaluate(()=>openPlayerBack());L('back to tournament profile:',await V.evaluate(()=>!!document.querySelector('#pl-cont .bgld')));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
