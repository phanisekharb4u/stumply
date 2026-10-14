// New features: rules (last man stands, no LBW, no free hit), WhatsApp text, graphs, overlay, poll, spoken score, fees, awards share
const {chromium}=require(process.env.PW);const PORT=process.env.MP||8771;const U=`http://localhost:${PORT}/`;const T=process.env.TAG||Date.now().toString(36);
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const stub=()=>{window.__wa=[];window.__said=[];const o=window.open;window.open=function(u){if(String(u).includes('wa.me')){window.__wa.push(decodeURIComponent(String(u).split('text=')[1]||''));return {};}return o.apply(window,arguments);};
  if(window.speechSynthesis){speechSynthesis.speak=u=>window.__said.push(u.text);speechSynthesis.cancel=()=>{};}};
const A=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();A.on('pageerror',e=>errs.push('A '+e.message));A.on('dialog',d=>d.accept());
await A.addInitScript(stub);
await A.goto(U);await A.waitForTimeout(500);await A.click('#auth-tabs >> text=Register');
await A.fill('#r-n','Test Admin');await A.fill('#r-u','nf'+T);await A.fill('#r-e','nf'+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);
await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.W=W;showTab('admin');
 document.getElementById('t-name').value='Test Cup';document.getElementById('t-size').value='3';document.getElementById('t-overs').value='custom';document.getElementById('t-overs-custom').value='2';
 document.getElementById('t-lms').checked=true;document.getElementById('t-nolbw').checked=true;document.getElementById('t-fh').checked=false;saveTournament();await W(100);
 const fill=(n,c,k)=>{document.getElementById('nt-name').value=n;document.getElementById('nt-code').value=c;for(let i=1;i<=3;i++){document.getElementById('bp-n'+i).value=k+' Player '+i;document.getElementById('bp-j'+i).value=i;}addTeam();};
 fill('Test Team A','TTA','A');await W(60);fill('Test Team B','TTB','B');await W(60);showTab('matches');openSchedModal();await W(80);scheduleMatch();await W(200);await flushSave();});
L('rules saved:',await A.evaluate(()=>JSON.stringify({lms:APP.tournament.lms,noLBW:APP.tournament.noLBW,noFH:APP.tournament.noFH})));
// Fees
await A.evaluate(async()=>{showTab('admin');setFee('2000');setPaid(APP.teams[0].id,2000);setPaid(APP.teams[1].id,500);await W(50);});
L('fees:',await A.evaluate(()=>document.querySelector('.fee-sum').innerText.replace(/\n/g,' ')),'|',await A.evaluate(()=>[...document.querySelectorAll('#fee-list tbody tr')].map(r=>r.innerText.replace(/\s+/g,' ').trim()).join(' / ')));
L('overlay link:',await A.evaluate(()=>document.getElementById('ovl-url').value));
await A.screenshot({path:'shots/t28-admin.png',fullPage:false});
const tid=await A.evaluate(()=>APP.tid);
// Viewer (phone) and overlay page
const cV=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await cV.addInitScript(stub);
const V=await cV.newPage();V.on('pageerror',e=>errs.push('V '+e.message));
await V.goto(U+'?t='+tid);await V.waitForTimeout(1200);
const O=await (await b.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'})).newPage();O.on('pageerror',e=>errs.push('O '+e.message));
await O.goto(U+'?t='+tid+'&overlay=1');await O.waitForTimeout(1200);
L('overlay before match:',await O.evaluate(()=>document.getElementById('ovl')&&document.getElementById('ovl').innerText.replace(/\s+/g,' ')),'| body bg:',await O.evaluate(()=>getComputedStyle(document.body).backgroundColor),'| other UI hidden:',await O.evaluate(()=>getComputedStyle(document.getElementById('main')).display));
// start match, viewer votes before play
await A.evaluate(async()=>{startMatch(APP.matches[0].id);confirmToss();await W(150);confirmInningsSetup();await W(600);await flushSave();});
await V.waitForTimeout(1500);
await V.evaluate(()=>showTab('live'));await V.waitForTimeout(400);
L('viewer poll shown:',await V.evaluate(()=>!!document.querySelector('#poll-box .pl-opt')));
await V.click('#poll-box .pl-opt >> nth=0');await V.waitForTimeout(800);
L('viewer poll after vote:',await V.evaluate(()=>document.getElementById('poll-box').innerText.replace(/\s+/g,' ')));
// viewer turns on spoken score
await V.evaluate(()=>toggleSpeak());await V.waitForTimeout(200);
// scorer: LBW option hidden, no free hit, last man stands
L('LBW disabled:',await A.evaluate(()=>{triggerWicket();let o=[...document.getElementById('wkt-type').options].find(o=>o.value==='LBW');closeM('wkt-mo');return o.disabled;}));
await A.evaluate(async()=>{addRun(4);await W(250);addExtra('noball');document.getElementById('ex-runs').value=1;confirmExtra();await W(250);});
L('free hit after no ball (should be false):',await A.evaluate(()=>APP.pendingFreeHit));
await V.waitForTimeout(1200);
L('viewer heard:',await V.evaluate(()=>window.__said.join(' | ')));
await A.evaluate(async()=>{const wk=async()=>{triggerWicket();await W(30);document.getElementById('wkt-type').value='Bowled';onDismChange();confirmWicket();await W(300);};
 await wk();addRun(1);await W(250);await wk();});
L('after 2 wickets (3 players):',await A.evaluate(()=>{let m=APP.liveMatch,i=m.innings[0];return JSON.stringify({w:i.wickets,maxW:i.maxW,str:i.striker&&i.batsmen[i.striker].name,ns:i.nonStriker,alone:lmsAlone(i),done:i.completed});}));
L('lone batter card:',await A.evaluate(()=>[...document.querySelectorAll('.bcard .bnm')].map(e=>e.innerText.trim()).join(' / ')),'| warn boxes:',await A.evaluate(()=>[...document.querySelectorAll('.warn-box')].map(e=>e.innerText).join(';')||'none'));
await A.evaluate(async()=>{for(let r of [1,2,3]){if(!document.getElementById('nov-mo').classList.contains('on'))addRun(r);await W(250);}});
L('lone batter keeps strike after odd runs:',await A.evaluate(()=>{let i=APP.liveMatch.innings[0];return i.batsmen[i.striker].name+' ns='+i.nonStriker+' balls='+i.legalBalls+' runs='+i.runs;}));
await A.screenshot({path:'shots/t28-lms.png'});
await A.evaluate(async()=>{const pick=async()=>{if(document.getElementById('nov-mo').classList.contains('on')){let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();await W(20);}};
 await pick();addRun(6);await W(250);
 triggerWicket();await W(30);document.getElementById('wkt-type').value='Caught';onDismChange();document.getElementById('wkt-fld').selectedIndex=1;confirmWicket();await W(300);await flushSave();});
L('innings 1 ended all out with 3 wickets:',await A.evaluate(()=>{let i=APP.liveMatch.innings[0];return scTxt(i)+' completed='+i.completed;}));
await O.waitForTimeout(1500);await O.screenshot({path:'shots/t28-overlay-break.png'});
L('overlay at break:',await O.evaluate(()=>document.getElementById('ovl').innerText.replace(/\s+/g,' ')));
// innings 2
await A.evaluate(async()=>{for(let i=0;i<40&&!document.getElementById('ins-mo').classList.contains('on');i++)await W(100);confirmInningsSetup();await W(300);
 for(let r of [4,1,6])  {addRun(r);await W(250);} await flushSave();});
await O.waitForTimeout(1500);await O.screenshot({path:'shots/t28-overlay.png'});
L('overlay live:',await O.evaluate(()=>document.getElementById('ovl').innerText.replace(/\s+/g,' ')));
L('poll closed for viewer:',await V.evaluate(()=>{showTab('live');return document.getElementById('poll-box')?document.getElementById('poll-box').innerText.replace(/\s+/g,' '):'none';}));
// WhatsApp live text (viewer)
await V.evaluate(()=>shareLiveWA(APP.liveMatch.id));
L('--- WhatsApp live text ---\n'+await V.evaluate(()=>window.__wa[0]));
// finish the chase
await A.evaluate(async()=>{const pick=async()=>{if(document.getElementById('nov-mo').classList.contains('on')){let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();await W(20);}};
 for(let i=0;i<12&&APP.liveMatch;i++){await pick();addRun(6);await W(250);} await W(1500);await flushSave();});
L('result:',await A.evaluate(()=>APP.matches[0].resultText));
// scorecard graphs + WhatsApp scorecard
await A.evaluate(async()=>{try{closeCelebration();}catch(e){}showTab('scorecard');populateSCSelect();document.getElementById('sc-sel').value=APP.matches[0].id;renderSC();await W(100);});
L('graphs:',await A.evaluate(()=>JSON.stringify({card:!!document.querySelector('.g-card'),worms:document.querySelectorAll('.g-card polyline').length,bars:document.querySelectorAll('.g-card .g-bar').length,wkts:document.querySelectorAll('.g-card circle').length,parts:document.querySelectorAll('.g-prow').length})));
L('partnership rows:',await A.evaluate(()=>[...document.querySelectorAll('.g-prow')].map(r=>r.innerText.replace(/\s+/g,' ')).join(' / ')));
await A.evaluate(()=>{let r=document.querySelector('.g-card .g-bar');gTip(r);});
L('bar tap shows:',await A.evaluate(()=>document.querySelectorAll('.g-tip')[1].textContent));
await A.evaluate(()=>document.querySelector('.g-card').scrollIntoView());await A.screenshot({path:'shots/t28-graphs.png'});
await A.evaluate(()=>shareScorecardWA(APP.matches[0].id));
L('--- WhatsApp scorecard ---\n'+await A.evaluate(()=>window.__wa[window.__wa.length-1]));
await A.evaluate(async()=>{showTab('history');switchStatTab('awards');await W(100);shareAwards();});
L('--- WhatsApp awards ---\n'+await A.evaluate(()=>window.__wa[window.__wa.length-1]));
L('admin sees poll votes:',await A.evaluate(async()=>{await loadPoll(APP.matches[0].id,true);return Object.keys(_poll.votes).length;}));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
