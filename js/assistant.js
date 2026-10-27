// Stumply — "Ask Stumply" help assistant: a chat window that answers questions from the Help guide.
// No AI and no server: it looks for the Help steps whose words best match the question, in the
// current language and in English, so answers are always the app's own instructions.
// Plain script (not a module): files share globals and load in the order listed in index.html.

const AS_STOP=new Set(('a an and are as at be by can do does for from get go how i in into is it me my of on or please should so the then there this to use using want what when where which who why will with you your '+
  'ఎలా ఎలాగ ఏమిటి ఎక్కడ ఎందుకు నేను నా మేము ఎవరు ఏది ఎప్పుడు కోసం చేయాలి ఉంది ఉన్నాయి '+
  'कैसे क्या कहाँ क्यों मैं मेरा हम के का की है हैं करें करना कब').split(' '));
// Words people use → words the Help guide uses
const AS_SYN={create:'new make add start',make:'new create',new:'create',start:'new begin',begin:'start',
  game:'match',fixture:'schedule match',fixtures:'schedule auto',league:'tournament',cup:'tournament',series:'tournament',
  batsman:'batter player',batter:'batsman player',bowler:'player bowling',player:'squad team',squad:'player team',
  signup:'register account',login:'sign',password:'forgot reset',account:'register sign',
  watch:'live viewer follow',view:'watch viewer',follow:'watch live',viewer:'watch',audience:'share viewer',
  share:'link whatsapp',link:'share',whatsapp:'share update',
  remove:'delete',erase:'delete',wrong:'undo correct',mistake:'undo correct',undo:'mistake',
  photo:'picture logo',logo:'photo',toss:'start match',score:'scoring ball',scoring:'score ball',
  wide:'extras',noball:'no ball free hit',rain:'reduce overs',tie:'super over',tied:'super over',
  points:'table nrr',semifinal:'knockout semi',final:'knockout',knockout:'semi final bracket',
  stats:'batting bowling history',award:'awards player series',awards:'orange purple cap',
  language:'telugu hindi tamil kannada malayalam',telugu:'language',hindi:'language',
  install:'home screen app',app:'install home screen',offline:'internet',internet:'offline',
  alert:'notification notify',alerts:'notification notify',notification:'alerts notify',
  graph:'graphs worm manhattan',graphs:'worm manhattan',wagon:'wheel shot map',
  career:'profile player',profile:'player career',friend:'co-scorer',coscorer:'co-scorer friend',
  fee:'fees entry',fees:'entry',poll:'fan vote',vote:'poll fan',voice:'speak score',speak:'voice score'};
const AS_FAQ={
  en:[
    ['free cost price pay paid money charge','💰 Is Stumply free?','Yes. Stumply is free for organisers and viewers, with no ads. Viewers do not even need an account.'],
    ['contact support bug problem report email complain','📮 Report a problem','Write to phanisekharb4u@gmail.com with what you did, what you expected and a screenshot if you can.'],
    ['who developed made built created developer owner author contact','👤 Who made Stumply?','Stumply is developed by Phani Sekhar Sunkara. Contact: phanisekharb4u@gmail.com'],
    ['what stumply about','🏏 What is Stumply?','Stumply is a free cricket scorer for local tournaments and single matches. Organisers score ball by ball on their phone, and anyone with the link watches the live score, scorecards and stats, with no app to install.'],
  ],
  te:[
    ['ఉచితం ఫ్రీ ధర డబ్బు చెల్లింపు','💰 Stumply ఉచితమా?','అవును. నిర్వాహకులకు, వీక్షకులకు Stumply ఉచితం, ప్రకటనలు లేవు. వీక్షకులకు ఖాతా కూడా అవసరం లేదు.'],
    ['సమస్య ఫిర్యాదు సంప్రదించు ఈమెయిల్','📮 సమస్య తెలియజేయండి','మీరు ఏమి చేశారు, ఏమి జరగాలి అనుకున్నారు, వీలైతే స్క్రీన్‌షాట్‌తో phanisekharb4u@gmail.com కు రాయండి.'],
  ],
};
const AS_CHIPS={
  en:['How do I create a tournament?','How do I play a single match?','How do I add teams and players?','How do I score a match?','How can people watch live?','How do I share the score?'],
  te:['టోర్నమెంట్ ఎలా సృష్టించాలి?','సింగిల్ మ్యాచ్ ఎలా ఆడాలి?','జట్లు, ఆటగాళ్లను ఎలా చేర్చాలి?','మ్యాచ్ ఎలా స్కోర్ చేయాలి?','లైవ్ ఎలా చూడాలి?','స్కోర్ ఎలా పంచుకోవాలి?'],
};
// Section icon → the screen it is about (only offered when that screen makes sense)
const AS_GO={'🏆':['admin','Open Admin'],'🏏':['admin','Open Admin'],'👥':['admin','Open Admin'],'🤝':['admin','Open Admin'],'🎉':['admin','Open Admin'],
  '📅':['matches','Open Matches'],'🔴':['live','Open Live'],'⚡':['live','Open Live'],'🔗':['admin','Open Admin'],'🏅':['history','Open History'],'📊':['history','Open History']};

function asNorm(s){return String(s||'').toLowerCase().replace(/\[\[|\]\]/g,'').replace(/[^\p{L}\p{M}\p{N}\s-]/gu,' ').replace(/\s+/g,' ').trim();}
function asStem(w){return w.length>4?w.replace(/(ings|ing|es|ed|s)$/,''):w;}
function asTokens(q,weighted){
  let out={};
  asNorm(q).split(' ').forEach(w=>{
    if(!w||AS_STOP.has(w))return;
    out[asStem(w)]=1;
    (AS_SYN[w]||AS_SYN[asStem(w)]||'').split(' ').filter(Boolean).forEach(x=>{x=asStem(x);if(!out[x])out[x]=0.5;});
  });
  let toks=Object.keys(out).filter(w=>w.length>=2);
  return weighted?toks.map(t=>[t,out[t]]):toks;
}
// Indian-language words change their endings (ఆటగాళ్లను / ఆటగాళ్ళను, ఉచితమా / ఉచితం), so compare the start of the word
function asRoot(tok){return /[^\x00-\x7f]/.test(tok)&&tok.length>=4?tok.slice(0,Math.max(3,tok.length-3)):tok;}
function asHit(text,tok){return tok.length<3?(' '+text+' ').includes(' '+tok):text.includes(asRoot(tok));}
// Score every Help section (current language and English together; sections line up by their icon)
function asSearch(q){
  let toks=asTokens(q,true);if(!toks.length)return [];
  let langs=[CURRENT_LANG,'en'].filter((l,i,a)=>HELP_DATA[l]&&a.indexOf(l)===i);
  let res={};
  langs.forEach(l=>{
    let secs=HELP_DATA[l].sections.map(s=>({ic:s[0],title:asNorm(s[1]),body:s[3].map(asNorm),note:asNorm(s[4]||'')}));
    toks.forEach(([t,tw])=>{
      // Rare words matter more: a word found in one section says more than one found in ten
      let df=secs.filter(x=>asHit(x.title,t)||x.body.some(b=>asHit(b,t))||asHit(x.note,t)).length;if(!df)return;
      let w=tw*Math.log(1+secs.length/df);
      secs.forEach(x=>{
        let r=res[x.ic]||(res[x.ic]={ic:x.ic,score:0,items:{}});
        if(asHit(x.title,t))r.score+=3*w;
        x.body.forEach((b,bi)=>{if(asHit(b,t)){r.score+=w;r.items[bi]=(r.items[bi]||0)+w;}});
        if(x.note&&asHit(x.note,t))r.score+=0.5*w;
      });
    });
  });
  return Object.values(res).filter(r=>r.score>0).sort((a,b)=>b.score-a.score);
}
function asFaq(q){
  let toks=asTokens(q),best=null,bs=0;
  (AS_FAQ[CURRENT_LANG]||[]).concat(CURRENT_LANG==='en'?[]:AS_FAQ.en).forEach(f=>{
    let keys=asNorm(f[0]).split(' '),s=toks.filter(t=>keys.some(k=>k===t||(t.length>=4&&k.startsWith(asRoot(t)))||(k.length>=4&&t.startsWith(asRoot(k))))).length;
    if(s>bs){bs=s;best=f;}
  });
  return bs?{f:best,score:bs}:null;
}
function asSection(ic){let H=HELP_DATA[CURRENT_LANG]||HELP_DATA.en;return H.sections.find(s=>s[0]===ic)||HELP_DATA.en.sections.find(s=>s[0]===ic);}
const asTx=v=>esc(v).replace(/\[\[(.+?)\]\]/g,'<span class="demo-tag">$1</span>');

function asAnswer(q){
  let faq=asFaq(q),hits=asSearch(q);
  if(faq&&(!hits.length||faq.score*4>=hits[0].score))return `<b>${esc(faq.f[1])}</b><p>${esc(faq.f[2])}</p>`;
  if(!hits.length||hits[0].score<1)return `<p>${esc(asT('nohit'))}</p>${asChips()}<button class="bsm" onclick="asOpenHelp()">❓ ${esc(asT('fullhelp'))}</button>`;
  let top=hits[0],s=asSection(top.ic),tag=s[2]==='ol'?'ol':'ul';
  let best=Object.entries(top.items).sort((a,b)=>b[1]-a[1]).map(x=>+x[0]);
  let whole=asTokens(q).some(t=>asHit(asNorm(s[1]),t))||best.length>=Math.min(3,s[3].length);
  let list=whole?s[3].map((li,i)=>`<li${best.slice(0,2).includes(i)?' class="as-hl"':''}>${asTx(li)}</li>`).join('')
    :best.slice(0,2).map(i=>`<li>${asTx(s[3][i])}</li>`).join('');
  let html=`<b>${s[0]} ${esc(s[1])}</b><${whole?tag:'ul'} class="as-list">${list}</${whole?tag:'ul'}>`;
  if(whole&&s[4])html+=`<p class="as-note">${asTx(s[4])}</p>`;
  if(!whole&&s[3].length>2)html+=`<details class="as-more"><summary>${esc(asT('allsteps'))}</summary><${tag} class="as-list">${s[3].map(li=>`<li>${asTx(li)}</li>`).join('')}</${tag}>${s[4]?`<p class="as-note">${asTx(s[4])}</p>`:''}</details>`;
  let go=AS_GO[s[0]];
  if(go&&APP.role==='admin'||go&&APP.role==='viewer'&&['live','history','matches'].includes(go[0]))html+=`<button class="bsm bgld as-go" onclick="asGo('${go[0]}')">➜ ${esc(asT(go[1]))}</button>`;
  else if(!APP.role&&['🔑','🏆','🏏','👥','📅','🔴'].includes(s[0]))html+=`<button class="bsm bgld as-go" onclick="asGo('signin')">➜ ${esc(asT('Sign in to start'))}</button>`;
  else if(!APP.role&&s[0]==='👁')html+=`<button class="bsm bgld as-go" onclick="asGo('watch')">➜ ${esc(asT('Find a match to watch'))}</button>`;
  let more=hits.slice(1,3).filter(h=>h.score>=Math.max(2,top.score/3)).map(h=>asSection(h.ic));
  if(more.length)html+=`<div class="as-also">${esc(asT('also'))} ${more.map(x=>`<button class="as-chip" onclick="asAsk(this.textContent)">${esc(x[1])}</button>`).join('')}</div>`;
  return html;
}
const AS_TXT={
  en:{hello:"Hi! I'm the Stumply helper. Ask me how to do anything in Stumply, or tap a question below.",nohit:"I couldn't find that in the Help guide. Try other words, or one of these:",fullhelp:'Open the full Help guide',allsteps:'Show all steps',also:'See also:',ph:'Ask a question…',title:'Ask Stumply'},
  te:{hello:'నమస్తే! నేను Stumply సహాయకుడిని. Stumply లో ఏదైనా ఎలా చేయాలో అడగండి, లేదా కింద ఒక ప్రశ్నను నొక్కండి.',nohit:'సహాయ గైడ్‌లో అది దొరకలేదు. వేరే పదాలతో ప్రయత్నించండి, లేదా వీటిలో ఒకటి:',fullhelp:'పూర్తి సహాయ గైడ్ తెరవండి',allsteps:'అన్ని దశలు చూపించు',also:'ఇవి కూడా చూడండి:',ph:'ప్రశ్న అడగండి…',title:'Stumply ని అడగండి','Open Admin':'అడ్మిన్ తెరువు','Open Matches':'మ్యాచ్‌లు తెరువు','Open Live':'లైవ్ తెరువు','Open History':'చరిత్ర తెరువు','Sign in to start':'మొదలుపెట్టడానికి సైన్ ఇన్ చేయండి','Find a match to watch':'చూడటానికి మ్యాచ్ వెతకండి'},
};
function asT(k){let L=AS_TXT[CURRENT_LANG]||AS_TXT.en;return L[k]||AS_TXT.en[k]||k;}
function asChips(){return `<div class="as-chips">${(AS_CHIPS[CURRENT_LANG]||AS_CHIPS.en).map(c=>`<button class="as-chip" onclick="asAsk(this.textContent)">${esc(c)}</button>`).join('')}</div>`;}
function asAdd(who,html){
  let log=document.getElementById('as-log');if(!log)return;
  let d=document.createElement('div');d.className='as-msg as-'+who;d.innerHTML=html;
  if(who==='me')d.setAttribute('data-noi18n','1');
  log.appendChild(d);
  if(who==='bot'&&CURRENT_LANG!=='en'&&typeof i18nWalk==='function')i18nWalk(d);
  // Show the start of a new answer, not its end
  log.scrollTop=who==='bot'&&log.children.length>2?d.offsetTop-log.offsetTop-8:log.scrollHeight;
}
function asAsk(q){
  q=String(q||'').trim().slice(0,200);if(!q)return;
  let inp=document.getElementById('as-q');if(inp)inp.value='';
  asAdd('me',esc(q));
  setTimeout(()=>asAdd('bot',asAnswer(q)),180);
}
function asGo(where){
  asClose();
  if(where==='signin'){if(typeof orgGo==='function')orgGo('reg');return;}
  if(where==='watch'){let w=document.getElementById('awatch');if(w)w.scrollIntoView({behavior:'smooth'});let q=document.getElementById('dc-q');if(q)setTimeout(()=>q.focus(),400);return;}
  if(typeof showTab==='function')showTab(where);
}
function asOpenHelp(){asClose();renderHelp();openM('demo-mo');}
function asToggle(){let p=document.getElementById('as-panel');if(!p)return;if(p.classList.contains('on'))asClose();else asOpen();}
function asOpen(){
  let p=document.getElementById('as-panel');if(!p)return;
  setTxt(document.getElementById('as-title'),'💬 '+asT('title'));
  let inp=document.getElementById('as-q');if(inp)inp.placeholder=asT('ph');
  let log=document.getElementById('as-log');
  if(log&&(!log.children.length||log.getAttribute('data-lang')!==CURRENT_LANG)){log.innerHTML='';log.setAttribute('data-lang',CURRENT_LANG);asAdd('bot',`<p>${esc(asT('hello'))}</p>${asChips()}`);}
  p.classList.add('on');
  if(inp&&window.matchMedia&&window.matchMedia('(min-width:900px)').matches)inp.focus();
}
function asClose(){let p=document.getElementById('as-panel');if(p)p.classList.remove('on');}
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target&&e.target.id==='as-q'){e.preventDefault();asAsk(e.target.value);}
  if(e.key==='Escape'&&document.getElementById('as-panel')?.classList.contains('on'))asClose();
});
