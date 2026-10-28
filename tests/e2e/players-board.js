// Looking for players board: reading needs no account, posting does; phone only for 18+; poster can delete; others cannot; expired posts disappear
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const page=async(tag)=>{const p=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());return p;};
const reg=async(A,n,u)=>{await A.click('#auth-tabs >> text=Register');await A.fill('#r-n',n);await A.fill('#r-u',u+T);await A.fill('#r-e',u+T+'@example.com');await A.fill('#r-p','secret1');await A.fill('#r-p2','secret1');await A.click('#apanel-reg .btnpri');await A.waitForTimeout(1800);};
const list=async P=>P.evaluate(()=>[...document.querySelectorAll('#bd-list .bd-post')].map(e=>e.innerText.replace(/\n+/g,' | ')).join('\n   ')||document.getElementById('bd-list').innerText.trim());
// A visitor without an account
const V=await page('V');await V.goto(U);await V.waitForTimeout(800);
await V.click('.bd-entry');await V.waitForTimeout(800);
L('empty board:',await list(V));
await V.click('#bd-body >> text=Post');await V.waitForTimeout(400);
L('posting without an account goes to sign-in:',await V.evaluate(()=>getComputedStyle(document.getElementById('authscr')).display!=='none'&&!document.getElementById('bd-mo').classList.contains('on')));
// An organiser posts from Admin
const A=await page('A');await A.goto(U);await A.waitForTimeout(500);await reg(A,'Test Captain','bda');
await A.evaluate(()=>showTab('admin'));L('admin card:',await A.evaluate(()=>document.getElementById('board-card').innerText.replace(/\n+/g,' | ')));
await A.click('#board-card button');await A.waitForTimeout(800);
await A.click('#bd-body >> text=Post');await A.waitForTimeout(300);
await A.selectOption('#bd-role','Bowler');await A.fill('#bd-city','Guntur');await A.fill('#bd-when','Saturday 7 am');
await A.click('#bd-form >> text=Post it');await A.waitForTimeout(300);
L('no phone and no details:',await A.evaluate(()=>document.getElementById('bd-err').innerText));
await A.fill('#bd-note','Tennis ball, 10 overs. Ask for the captain at Test Ground nets.');
await A.click('#bd-form >> text=Post it');await A.waitForTimeout(800);
L('after posting:',await list(A));
// Second post with a WhatsApp number (18+)
await A.click('#bd-body >> text=Post');await A.waitForTimeout(300);
await A.selectOption('#bd-kind','player');await A.selectOption('#bd-role','Wicket-keeper');await A.fill('#bd-city','Vijayawada');
await A.check('#bd-adult');await A.fill('#bd-phone','98765');await A.click('#bd-form >> text=Post it');await A.waitForTimeout(300);
L('short phone:',await A.evaluate(()=>document.getElementById('bd-err').innerText));
await A.fill('#bd-phone','98765 43210');await A.click('#bd-form >> text=Post it');await A.waitForTimeout(800);
L('WhatsApp link:',await A.evaluate(()=>document.querySelector('.bd-wa').getAttribute('href').split('?')[0]));
L('database blocks a phone without the 18+ tick:',await A.evaluate(async()=>{let n=Date.now();try{await dbReq('PUT','board/bx'+n,{uid:AUTH.uid,kind:'team',city:'X',phone:'9876543210',at:n,exp:n+1000},true);return 'allowed (bad)';}catch(e){return 'blocked';}}));
L('database blocks posts longer than 30 days:',await A.evaluate(async()=>{let n=Date.now();try{await dbReq('PUT','board/by'+n,{uid:AUTH.uid,kind:'team',city:'X',at:n,exp:n+90*86400000},true);return 'allowed (bad)';}catch(e){return 'blocked';}}));
// An expired post of A's (written directly) is hidden and tidied up
await A.evaluate(async()=>{let n=Date.now();await dbReq('PUT','board/bold1',{uid:AUTH.uid,kind:'team',city:'Old Town',at:n-40*86400000,exp:n-1000},true);});
// Third post fills the limit
await A.click('#bd-body >> text=Post');await A.fill('#bd-city','Tenali');await A.fill('#bd-note','Need two fielders');await A.click('#bd-form >> text=Post it');await A.waitForTimeout(800);
await A.click('#bd-body >> text=Post');await A.waitForTimeout(300);
L('fourth post is refused:',await A.evaluate(()=>!document.getElementById('bd-form').innerHTML));
// The visitor reads the board
await V.goto(U);await V.waitForTimeout(800);await V.click('.bd-entry');await V.waitForTimeout(1000);
L('visitor sees:',await list(V));
L('expired post hidden:',await V.evaluate(()=>!document.getElementById('bd-list').innerText.includes('Old Town')));
await V.evaluate(()=>bdKind('player'));L('players only:',await V.evaluate(()=>document.querySelectorAll('#bd-list .bd-post').length));
await V.evaluate(()=>bdKind('all'));await V.fill('#bd-q','guntur');await V.waitForTimeout(200);L('search guntur:',await V.evaluate(()=>document.querySelectorAll('#bd-list .bd-post').length));
await V.fill('#bd-q','');await V.dispatchEvent('#bd-q','input');
L('visitor buttons:',await V.evaluate(()=>[...document.querySelectorAll('#bd-list .bd-act')].map(e=>e.innerText.replace(/\n+/g,' ')).join(' / ')));
// Another user cannot delete A's post
const B=await page('B');await B.goto(U);await B.waitForTimeout(500);await reg(B,'Test Other','bdb');
const pid=await A.evaluate(()=>_bd.find(p=>p.city==='Guntur').id);
L('another user deletes it:',await B.evaluate(async id=>{try{await dbReq('DELETE','board/'+id,undefined,true);return 'allowed (bad)';}catch(e){return 'blocked';}},pid));
// A deletes their own post; the expired one was tidied up
await A.evaluate(()=>loadBoard());await A.waitForTimeout(800);
L('expired post removed from the database:',await A.evaluate(async()=>(await dbReq('GET','board/bold1'))===null));
await A.evaluate(id=>bdDelete(id),pid);await A.waitForTimeout(800);
L('after deleting:',await list(A));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
