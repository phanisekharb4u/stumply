// Retest for Stumply_Bug_Report_1 (BUG-01..08, OBS-01..06)
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[],dialogs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});return p;};
const L=(...a)=>console.log(...a);
const A=await mk();await A.goto(U);await A.waitForTimeout(500);await A.click('#auth-tabs >> text=Register');
await A.fill('#r-n','Test Admin');await A.fill('#r-u','bg'+T);await A.fill('#r-e','bg'+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);
await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.W=W;
 document.getElementById('tn-new').value='Test Single';await newSingleMatch();await W(300);showTab('admin');
 document.getElementById('t-size').value='5';document.getElementById('t-overs').value='custom';document.getElementById('t-overs-custom').value='1';saveTournament();await W(100);
 const fill=(n,c,k)=>{document.getElementById('nt-name').value=n;document.getElementById('nt-code').value=c;for(let i=1;i<=5;i++){document.getElementById('bp-n'+i).value=k+' Player '+i;document.getElementById('bp-j'+i).value=i;}addTeam();};
 fill('Test Team A','TTA','A');await W(60);fill('Test Team B','TTB','B');await W(60);
 showTab('matches');openSchedModal();await W(80);document.getElementById('sch-v').value='Test Ground';scheduleMatch();await W(300);
 window.pickBowler=async()=>{if(!document.getElementById('nov-mo').classList.contains('on'))return;let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();await W(20);};
 window.ball=async r=>{await pickBowler();if(APP.liveMatch)addRun(r);await W(15);};
 window.wkt=async()=>{await pickBowler();triggerWicket();await W(20);document.getElementById('wkt-type').value='Bowled';onDismChange();confirmWicket();await W(20);};
 window.waitIns=async()=>{for(let i=0;i<40&&!document.getElementById('ins-mo').classList.contains('on');i++)await W(100);};
});
L('BUG-07 schedule button hidden:',await A.evaluate(()=>getComputedStyle(document.getElementById('sched-btn')).visibility),'| try anyway:',await A.evaluate(async()=>{openSchedModal();await W(50);return document.getElementById('toast').textContent+' | sch-mo open='+document.getElementById('sch-mo').classList.contains('on');}));
const tid=await A.evaluate(()=>APP.tid);await A.evaluate(()=>flushSave());
const V=await mk();await V.goto(U+'?t='+tid);await V.waitForTimeout(1500);
// start match, stop at openers popup
await A.evaluate(async()=>{startMatch(APP.matches[0].id);confirmToss();await W(800);await flushSave();});
await V.waitForTimeout(1500);
const vlive=async()=>V.evaluate(()=>{showTab('live');let t=document.getElementById('livecont').innerText.replace(/\n+/g,' | ');return t.slice(0,220)+' || manage links: '+document.querySelectorAll('#livecont [onclick*="openManage"]').length+' | warn boxes: '+document.querySelectorAll('#livecont .warn-box').length;});
L('BUG-02 viewer before innings 1:',await vlive());
L('BUG-01 viewer openManage():',await V.evaluate(()=>{openManage();return document.getElementById('mg-mo').classList.contains('on')?'OPENED':'blocked';}));
L('OBS-06 golive link on live tab:',await V.evaluate(()=>getComputedStyle(document.getElementById('sync-golive')).display),'| on home:',await V.evaluate(()=>{showTab('home');return getComputedStyle(document.getElementById('sync-golive')).display;}));
// innings 1: 6 balls of 1, with retired hurt and return
await A.evaluate(async()=>{confirmInningsSetup();await W(60);await ball(1);await ball(1);
 triggerRetiredHurt();await W(30);document.getElementById('rh-who').value='striker';confirmRetiredHurt();await W(60);
 let i=APP.liveMatch.innings[0];let back=Object.keys(i.batsmen).find(k=>i.batsmen[k].status==='retired');
 document.getElementById('mg-sk').innerHTML+=`<option value="${back}">x</option>`;
 // first bring a new batter, then the retired one back later
 let nxt=Object.keys(i.batsmen).find(k=>i.batsmen[k].status==='yet');document.getElementById('mg-sk').value=nxt;applyBatsmen();await W(40);
 await ball(1);await wkt();
 openManage();await W(30);document.getElementById('mg-sk').value=back;document.getElementById('mg-ns').value='';applyBatsmen();await W(40);
 await ball(1);await ball(1);await W(300);await flushSave();});
L('OBS-05 commentary:',await A.evaluate(()=>APP.matches[0].innings[0].log.filter(c=>c.e==='rh'||c.e==='rb').map(c=>c.o+' '+c.e+' '+c.d).join(' ; ')));
await V.waitForTimeout(1500);
L('BUG-02 viewer at innings break:',await vlive());
await V.screenshot({path:'shots/t26-viewer-break.png'});
// innings 2 tie
await A.evaluate(async()=>{await waitIns();confirmInningsSetup();await W(60);let t=APP.liveMatch.innings[0].runs;for(let i=0;i<6&&APP.liveMatch;i++)await ball(i<t?1:0);await W(1000);});
L('BUG-03 scorer live after tie (behind popup):',await A.evaluate(()=>{let m=APP.matches[0];APP.liveMatch=m;renderLive();let t=document.getElementById('livecont').innerText;APP.liveMatch=null;renderLive();return 'RRR shown='+/RRR/.test(t)+' ∞='+/∞/.test(t)+' Need='+/Need/.test(t);}));
// SO1 tied: B bats first (batted 2nd)
await A.evaluate(async()=>{superFromCelebration();await waitIns();confirmInningsSetup();await W(60);await ball(4);await wkt();for(let i=0;i<5&&APP.liveMatch&&APP.liveMatch.innings.length<4;i++)await ball(0);await W(1700);
 await waitIns();confirmInningsSetup();await W(60);await ball(4);await ball(0);await ball(0);await ball(0);await ball(0);await ball(0);await W(1000);});
L('after SO1:',await A.evaluate(()=>APP.matches[0].resultText));
L('OBS-03 SO2 options:',await A.evaluate(async()=>{superFromCelebration();await waitIns();let m=APP.liveMatch,so1=m.innings[2],so1b=m.innings[3];
 let outB=Object.keys(so1.batsmen).filter(k=>so1.batsmen[k].status==='out').map(k=>so1.batsmen[k].name);
 let bw=Object.keys(so1b.bowlers).filter(k=>hasBowled(so1b.bowlers[k])).map(k=>so1b.bowlers[k].name);
 let opts=[...document.getElementById('ins-op1').options].map(o=>o.text),bopts=[...document.getElementById('ins-bwl').options].map(o=>o.text);
 return 'title: '+document.getElementById('ins-title').textContent+' | out in SO1: '+outB+' offered? '+outB.some(n=>opts.includes(n))+' | bowled SO1 for '+rawTeamName(so1b.bowlingTeamId)+': '+bw+' | bowler options '+bopts.join(',');}));
await A.evaluate(async()=>{confirmInningsSetup();await W(60);await ball(6);for(let i=0;i<5&&APP.liveMatch&&APP.liveMatch.innings.length<6;i++)await ball(0);await W(1700);await waitIns();confirmInningsSetup();await W(60);for(let i=0;i<6&&APP.liveMatch;i++)await ball(1);await W(1000);try{closeCelebration();}catch(e){}await flushSave();});
L('result:',await A.evaluate(()=>APP.matches[0].resultText));
L('BUG-04 matches card:',await A.evaluate(()=>{showTab('matches');return [...document.querySelectorAll('#mlist div')].map(d=>d.textContent).filter(t=>/^⚡|^TT[AB]:/.test(t)).join(' / ');}));
L('BUG-05 history:',await A.evaluate(()=>{renderCompleted();return document.querySelector('#hm .hsc').textContent;}));
L('BUG-05 scorecard headers:',await A.evaluate(()=>{showMHist(APP.matches[0].id);let h=[...document.querySelectorAll('#mhist-cont .inns-hdr')].map(x=>x.textContent.split(':')[0]);closeM('mhist-mo');return h.join(' / ');}));
L('BUG-06 dropdown:',await A.evaluate(()=>{populateSCSelect();return [...document.getElementById('sc-sel').options].slice(1).map(o=>o.text).join(' / ');}));
L('BUG-08 M column:',await A.evaluate(()=>{let s=collectPlayerStats();let n='A Player 2';const g=a=>{let x=a.find(p=>p.name===n);return x?x.matches:'-';};return n+' bat M='+g(s.batting)+' bowl M='+g(s.bowling)+' field M='+g(s.fielding);}));
L('OBS-02 auto POTM:',await A.evaluate(()=>{let p=autoPickMOTM(APP.matches[0]);return p?p.name+' — '+p.stat:'none';}));
// OBS-01 reopen confirm
dialogs.length=0;
await A.evaluate(async()=>{showTab('live');undoLast();await W(100);});
L('OBS-01 confirm shown:',dialogs.join(' | ')||'none','| match status now',await A.evaluate(()=>APP.matches[0].status));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
