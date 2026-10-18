// Wagon wheel: picker opens after 4s and 6s (default) or every run, tap saves the spot, scorecard shows the shot map per batter
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const A=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
await A.goto(U);await A.waitForTimeout(500);await A.click('#auth-tabs >> text=Register');
await A.fill('#r-n','Test Admin');await A.fill('#r-u','ww'+T);await A.fill('#r-e','ww'+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);
await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.W=W;showTab('admin');document.getElementById('t-size').value='3';document.getElementById('t-overs').value='custom';document.getElementById('t-overs-custom').value='2';saveTournament();await W(100);
 for(const k of ['A','B']){document.getElementById('nt-name').value='Test Team '+k;document.getElementById('nt-code').value='TT'+k;for(let i=1;i<=3;i++){document.getElementById('bp-n'+i).value=k+' Player '+i;document.getElementById('bp-j'+i).value=i;}addTeam();await W(50);}
 showTab('matches');openSchedModal();await W(80);scheduleMatch();await W(150);startMatch(APP.matches[0].id);confirmToss();await W(150);confirmInningsSetup();await W(300);});
const tap=async(fx,fy)=>{const bx=await (await A.$('#ww-field svg')).boundingBox();await A.mouse.click(bx.x+bx.width*fx,bx.y+bx.height*fy);await A.waitForTimeout(150);};
const open=()=>A.evaluate(()=>document.getElementById('ww-mo').classList.contains('on'));
L('mode by default:',await A.evaluate(()=>wwMode()));
await A.evaluate(()=>addRun(1));await A.waitForTimeout(150);L('picker after a single (fours and sixes mode):',await open());
await A.evaluate(()=>addRun(4));await A.waitForTimeout(150);L('picker after a four:',await open(),'|',await A.evaluate(()=>document.getElementById('ww-title').textContent));
await A.screenshot({path:'shots/ww-picker.png'});
await tap(0.85,0.45);L('picker closed after tap:',!(await open()));
await A.evaluate(()=>addRun(6));await A.waitForTimeout(150);await tap(0.25,0.1);
await A.evaluate(()=>wwSet('all'));await A.evaluate(()=>addRun(2));await A.waitForTimeout(150);L('picker after a 2 in all-runs mode:',await open());await tap(0.5,0.9);
await A.evaluate(()=>addRun(4));await A.waitForTimeout(150);await A.click('#ww-mo >> text=Skip');L('skip closes it:',!(await open()));
L('saved spots:',await A.evaluate(()=>JSON.stringify(APP.liveMatch.innings[0].log.filter(c=>c.w).map(c=>[c.s,c.r,c.w.map(v=>Math.round(v*10)/10)]))));
await A.evaluate(()=>wwSet('off'));await A.evaluate(()=>addRun(6));await A.waitForTimeout(150);L('picker when off:',await open());
await A.evaluate(()=>undoLast());await A.evaluate(()=>flushSave());
await A.evaluate(async()=>{showTab('scorecard');populateSCSelect();document.getElementById('sc-sel').value=APP.matches[0].id;renderSC();await W(100);});
L('scorecard wagon wheel:',await A.evaluate(()=>{let b=[...document.querySelectorAll('.g-box')].find(x=>x.querySelector('.ww-wrap'));return b?b.querySelector('.g-t').textContent+' | lines '+b.querySelectorAll('.ww-wrap line').length+' | '+b.querySelector('.ww-sum').textContent:'none';}));
await A.evaluate(()=>{let s=document.querySelector('.ww-sel');s.value=s.options[1].value;wwPick(s);});
L('one batter only:',await A.evaluate(()=>{let s=document.querySelector('.ww-sel');return s.value+' | lines '+s.closest('.g-box').querySelectorAll('.ww-wrap line').length+' | '+s.closest('.g-box').querySelector('.ww-sum').textContent;}));
await A.evaluate(()=>{let s=document.querySelector('.ww-sel');s.value='';wwPick(s);document.querySelector('.ww-wrap').scrollIntoView({block:'center'});});await A.screenshot({path:'shots/ww-scorecard.png'});
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
