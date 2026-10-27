// Ask Stumply helper: answers common questions from the Help guide in English and Telugu, offers the right screen
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';
(async()=>{const b=await chromium.launch();const errs=[];const L=(...a)=>console.log(...a);
const P=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'})).newPage();P.on('pageerror',e=>errs.push(e.message));
await P.goto(U);await P.waitForTimeout(800);
const top=q=>P.evaluate(q=>{let d=document.createElement('div');d.innerHTML=asAnswer(q);return (d.querySelector('b')||{}).textContent||'(no match) '+d.textContent.slice(0,40);},q);
for(const q of ['how do I create a tournament','how to make a single match','add players to team','how to score a match','how can my friends watch','share score on whatsapp','delete a team','undo wrong ball','change language to telugu','is it free','super over tie','reset password','points table','auto fixtures','career stats of a player','how do i report a bug','asdfgh'])L(q,'→',await top(q));
await P.click('.ahbtn[aria-label="Help"]');await P.waitForTimeout(150);
L('panel opens with greeting and',await P.evaluate(()=>document.querySelectorAll('#as-log .as-chip').length),'question chips');
await P.click('#as-log .as-chip >> nth=0');await P.waitForTimeout(400);
L('chip answer:',await P.evaluate(()=>[...document.querySelectorAll('#as-log .as-bot')].pop().querySelector('b').textContent));
await P.fill('#as-q','how can my friends watch');await P.press('#as-q','Enter');await P.waitForTimeout(400);
L('signed-out viewer button:',await P.evaluate(()=>([...document.querySelectorAll('#as-log .as-bot')].pop().querySelector('.as-go')||{}).textContent));
await P.evaluate(()=>setLang('te'));await P.waitForTimeout(300);
for(const q of ['టోర్నమెంట్ ఎలా సృష్టించాలి?','ఆటగాళ్లను ఎలా చేర్చాలి','లైవ్ ఎలా చూడాలి?','ఉచితమా'])L(q,'→',await top(q));
L(errs.length?errs:'no page errors');await b.close();})().catch(e=>console.log('FAILED',e.message));
