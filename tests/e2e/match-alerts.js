// Match alerts: viewer gets alerts from the scorer's actions, on a browser with and without phone notifications
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const A=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();A.on('pageerror',e=>errs.push('A '+e.message));A.on('dialog',d=>d.accept());
await A.goto(U);await A.waitForTimeout(500);await A.click('#auth-tabs >> text=Register');
await A.fill('#r-n','Test Admin');await A.fill('#r-u','al'+T);await A.fill('#r-e','al'+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);
await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.W=W;showTab('admin');document.getElementById('t-size').value='5';document.getElementById('t-overs').value='custom';document.getElementById('t-overs-custom').value='2';saveTournament();await W(100);
 const fill=(n,c,k)=>{document.getElementById('nt-name').value=n;document.getElementById('nt-code').value=c;for(let i=1;i<=5;i++){document.getElementById('bp-n'+i).value=k+' Player '+i;document.getElementById('bp-j'+i).value=i;}addTeam();};
 fill('Test Team A','TTA','A');await W(60);fill('Test Team B','TTB','B');await W(60);showTab('matches');openSchedModal();await W(80);scheduleMatch();await W(200);await flushSave();});
const tid=await A.evaluate(()=>APP.tid);
// Viewer 1: like iPhone Safari tab — no Notification API at all
const c1=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
await c1.addInitScript(()=>{delete window.Notification;window.__alerts=[];});
const V1=await c1.newPage();V1.on('pageerror',e=>errs.push('V1 '+e.message));
await V1.goto(U);await V1.waitForTimeout(1000);
await V1.click('#awatch .anotif .bgld');await V1.waitForTimeout(300);
L('iPhone Safari tab, tap Yes notify me:',await V1.evaluate(()=>document.getElementById('notif-status').textContent));
await V1.goto(U+'?t='+tid);await V1.waitForTimeout(1500);
await V1.evaluate(()=>{const o=inAppAlert;window.inAppAlert=function(t,b){window.__alerts.push(t+' | '+b);return o(t,b);};});
L('bell:',await V1.evaluate(()=>document.getElementById('notif-btn').textContent+' '+document.getElementById('notif-btn').title));
// Viewer 2: desktop browser with notifications allowed
const c2=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block',permissions:['notifications']});
await c2.addInitScript(()=>{window.__n=[];});
const V2=await c2.newPage();V2.on('pageerror',e=>errs.push('V2 '+e.message));
await V2.goto(U);await V2.waitForTimeout(1000);await V2.click('#awatch .anotif .bgld');await V2.waitForTimeout(800);
L('desktop, tap Yes notify me:',await V2.evaluate(()=>document.getElementById('notif-status').textContent));
await V2.goto(U+'?t='+tid);await V2.waitForTimeout(1500);
await V2.evaluate(()=>{const o=inAppAlert;window.inAppAlert=function(t,b){window.__n.push(t+' | '+b);return o(t,b);};});
// scorer plays
await A.evaluate(async()=>{const W=window.W;
 const pick=async()=>{if(document.getElementById('nov-mo').classList.contains('on')){let s=document.getElementById('nov-bwl');s.value=[...s.options].find(o=>!o.disabled).value;confirmNewOver();await W(20);}};
 const ball=async r=>{await pick();if(APP.liveMatch)addRun(r);await W(250);};
 startMatch(APP.matches[0].id);confirmToss();await W(150);confirmInningsSetup();await W(800);
 for(const r of [6,6,6,6,6,6,6,6,6])await ball(r);
 await pick();triggerWicket();await W(40);document.getElementById('wkt-type').value='Bowled';onDismChange();confirmWicket();await W(400);
 for(let i=0;i<4&&APP.liveMatch;i++)await ball(1);await W(1900);
 for(let i=0;i<40&&!document.getElementById('ins-mo').classList.contains('on');i++)await W(100);confirmInningsSetup();await W(200);
 for(let i=0;i<12&&APP.liveMatch;i++)await ball(0);await W(1200);await flushSave();});
await V1.waitForTimeout(2500);
L('iPhone viewer in-app alerts:\n  '+(await V1.evaluate(()=>window.__alerts)).join('\n  '));
await V1.evaluate(()=>{});await V1.screenshot({path:'shots/t27-banner.png'});
L('desktop viewer alerts shown:',(await V2.evaluate(()=>window.__n)).length);
L('scorer got alerts on own phone:',await A.evaluate(()=>!!document.getElementById('alert-banner')));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
