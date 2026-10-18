// Auto fixtures: round robin for all teams, spread over days, no team playing twice in a row, existing pairs skipped
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const A=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
await A.goto(U);await A.waitForTimeout(500);await A.click('#auth-tabs >> text=Register');
await A.fill('#r-n','Test Admin');await A.fill('#r-u','fx'+T);await A.fill('#r-e','fx'+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);
await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));showTab('admin');document.getElementById('t-size').value='3';saveTournament();await W(100);
 for(const k of ['A','B','C','D','E']){document.getElementById('nt-name').value='Test Team '+k;document.getElementById('nt-code').value='TT'+k;for(let i=1;i<=3;i++){document.getElementById('bp-n'+i).value=k+' Player '+i;document.getElementById('bp-j'+i).value=i;}addTeam();await W(50);}
 showTab('matches');});
L('auto button shown:',await A.evaluate(()=>getComputedStyle(document.getElementById('auto-btn')).display!=='none'));
await A.click('#auto-btn');await A.waitForTimeout(200);
await A.fill('#fx-d','2030-01-05');await A.selectOption('#fx-n','2');await A.evaluate(()=>updAutoFixInfo());
L('plan:',await A.evaluate(()=>document.getElementById('fx-info').textContent));
await A.evaluate(()=>makeAutoFix());await A.waitForTimeout(300);
const list=await A.evaluate(()=>APP.matches.map(m=>[m.date,APP.teams.find(t=>t.id===m.teamAId).code,APP.teams.find(t=>t.id===m.teamBId).code]));
L('matches:',list.length);list.forEach(x=>L(' ',x.join(' ')));
const pairs=new Set(list.map(x=>[x[1],x[2]].sort().join('-')));L('every pair once:',pairs.size===10);
let back=0;for(let i=1;i<list.length;i++){let p=[list[i-1][1],list[i-1][2]];if(p.includes(list[i][1])||p.includes(list[i][2]))back++;}L('team playing two in a row:',back);
await A.click('#auto-btn');await A.waitForTimeout(200);L('second time:',await A.evaluate(()=>document.getElementById('fx-info').textContent));
await A.check('#fx-2');await A.evaluate(()=>updAutoFixInfo());L('return legs:',await A.evaluate(()=>document.getElementById('fx-info').textContent));
await A.evaluate(()=>closeM('fix-mo'));
await A.evaluate(()=>{startMatch(APP.matches[0].id);});await A.waitForTimeout(200);L('first fixture can start (toss open):',await A.evaluate(()=>document.getElementById('toss-mo').classList.contains('on')));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
