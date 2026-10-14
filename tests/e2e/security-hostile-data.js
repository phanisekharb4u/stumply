// A hostile tournament owner writes booby-trapped data; a viewer opens it. Nothing may run.
const {chromium}=require(process.env.PW);const U='http://localhost:8771/';const T=process.env.TAG;
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({serviceWorkers:'block'})).newPage();p.on('dialog',d=>{console.log('DIALOG FIRED',d.message());d.dismiss();});
await p.goto(U);await p.waitForTimeout(500);await p.click('#auth-tabs >> text=Register');
await p.fill('#r-n','Test Owner');await p.fill('#r-u',T);await p.fill('#r-e',T+'@example.com');await p.fill('#r-p','secret1');await p.fill('#r-p2','secret1');await p.click('#apanel-reg .btnpri');await p.waitForTimeout(1800);
const tid=await p.evaluate(async()=>{
 const X='<img src=x onerror="window.__pwn=1">';const Q="x');window.__pwn=2;('";
 const team=(id,n)=>({id,name:n+X,code:'A'+X,city:X,players:Array.from({length:11},(_,i)=>({id:id+'p'+i,name:'P'+i+X,jersey:'1'+X,role:X}))});
 const m={teamAId:Q,teamBId:'tb',status:'completed',matchType:'League'+X,date:X,venue:X,umpires:[X],resultText:'R'+X,winner:Q,motm:Q,
   innings:[{number:1,battingTeamId:Q,bowlingTeamId:'tb',runs:X,wickets:'1"><img src=x onerror="window.__pwn=3">',legalBalls:6,batsmen:{[Q]:{name:'B'+X,runs:X,balls:X,fours:0,sixes:0,status:'out',dismissal:X}},bowlers:{tbp1:{name:'W'+X,overs:X,balls:0,runs:1,wickets:1,maidens:0,wides:X,noballs:0}},fallOfWickets:[{score:X,wicket:X,batsman:X,over:X}],extras:{total:X,wide:X},thisOver:[X],currentPartnership:{runs:X,balls:X},partnerships:[],completed:true}]};
 const tid=APP.tid;
 await dbReq('PATCH','tournaments/'+tid,{meta:JSON.stringify({name:'T'+X,edition:X,year:X,overs:'5'+X}),teams:JSON.stringify([team(Q,'Alpha'),team('tb','Beta')]),order:JSON.stringify([Q,'m2']),[`matches/${'m1'}`]:JSON.stringify(m)},true);
 await dbReq('PUT','tournaments/'+tid+'/matches/'+encodeURIComponent(Q),JSON.stringify(m),true).catch(()=>{});
 await dbReq('PATCH','tournaments/'+tid,{['photos/'+'tb']:'javascript:window.__pwn=4'},true).catch(()=>{});
 return tid;});
const v=await (await b.newContext({serviceWorkers:'block'})).newPage();v.on('dialog',d=>{console.log('DIALOG FIRED',d.message());d.dismiss();});const errs=[];v.on('pageerror',e=>errs.push(e.message));
await v.goto(U+'?t='+tid);await v.waitForTimeout(1500);
for(const t of ['home','matches','live','scorecard','history']){await v.evaluate(t=>showTab(t),t);await v.waitForTimeout(250);}
await v.evaluate(()=>{let s=document.getElementById('sc-sel');if(s.options.length>1){s.selectedIndex=1;renderSC();}for(const k of ['matches','points','batting','bowling','fielding','awards'])switchStatTab(k);});await v.waitForTimeout(500);
await v.evaluate(()=>{document.querySelectorAll('[onclick]').forEach(e=>{try{e.click()}catch(x){}});});await v.waitForTimeout(500);
console.log('viewer: injected code ran?',await v.evaluate(()=>window.__pwn||'no'),'| img tags from data:',await v.evaluate(()=>document.querySelectorAll('img[src="x"]').length),'| errors',errs.slice(0,3));
console.log(errs.length?errs:'no page errors');
await b.close();})().catch(e=>console.log('FAILED',e.message));
