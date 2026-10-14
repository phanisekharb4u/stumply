// Stumply — Match start, toss, innings, mid-match changes, the scoring engine and discarding a match.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  MATCH START / TOSS / INNINGS
// ══════════════════════════════════════════════════════════════════════════
function startMatch(mid){
  let m=APP.matches.find(x=>x.id===mid);if(!m)return;
  if(m.status==='completed'){toast('This match is already completed','warn');return;}
  let live=APP.matches.find(x=>x.status==='live');
  if(live&&live.id!==mid){toast('A match is already live!');return;}
  _pendingStart=m;
  document.getElementById('toss-d').value='bat';
  let opts=[m.teamAId,m.teamBId].map(id=>{let t=APP.teams.find(x=>x.id===id);return`<option value="${id}">${esc(t?t.name:id)}</option>`;}).join('');
  document.getElementById('toss-w').innerHTML=opts;
  openM('toss-mo');
}
let _pendingStart=null;
function cancelToss(){_pendingStart=null;closeM('toss-mo');}
function confirmToss(){
  let m=_pendingStart||APP.liveMatch;_pendingStart=null;
  if(!m){closeM('toss-mo');return;}
  if(m.status!=='live'){
    if(APP.matches.some(x=>x.status==='live'&&x.id!==m.id)){closeM('toss-mo');toast('A match is already live!');return;}
    APP.liveMatch=m;m.status='live';_undoStack=[];
    document.getElementById('livebadge').classList.remove('hidden');
    notifyMatchStarted(rawTeamName(m.teamAId),rawTeamName(m.teamBId),m.matchType||'League');
  }
  let w=document.getElementById('toss-w').value,d=document.getElementById('toss-d').value;
  m.toss={winner:w,decision:d};
  let bat=d==='bat'?w:(w===m.teamAId?m.teamBId:m.teamAId);
  let bwl=bat===m.teamAId?m.teamBId:m.teamAId;
  closeM('toss-mo');startInnings(1,bat,bwl);
}
// Everyone named for the match, including substitutes (used for fielders)
function getMatchSquad(m, teamId){
  if(m.playingXI&&m.playingXI[teamId]&&m.playingXI[teamId].length>0)return m.playingXI[teamId];
  let t=APP.teams.find(x=>x.id===teamId);
  return t?t.players:[];
}
// The playing XI only: substitutes cannot bat or bowl
function getMatchXI(m, teamId){
  let all=getMatchSquad(m,teamId);
  let xi=all.filter(p=>!p.isSub);
  return xi.length?xi:all;
}
function startInnings(num,batId,bwlId){
  let m=APP.liveMatch,sup=num>2;
  let batT=APP.teams.find(t=>t.id===batId),bwlT=APP.teams.find(t=>t.id===bwlId);
  let batPlayers=getMatchXI(m,batId);
  let bwlPlayers=getMatchXI(m,bwlId);
  let inn={
    number:num,battingTeamId:batId,bowlingTeamId:bwlId,
    runs:0,wickets:0,legalBalls:0,overs:0,ballInOver:0,
    batsmen:{},bowlers:{},striker:null,nonStriker:null,currentBowler:null,
    fallOfWickets:[],deliveries:[],thisOver:[],pastOvers:[],
    extras:{wide:0,noball:0,bye:0,legbye:0,total:0},
    currentPartnership:{runs:0,balls:0},partnerships:[],
    completed:false,target:null
  };
  // All out when one batter is left (fewer players per side means fewer wickets)
  let side=Math.min(m.size||teamSize(),batPlayers.length||11);
  inn.maxW=Math.max(1,side-1);
  if(APP.tournament.lms&&!sup){inn.lms=true;inn.maxW=Math.max(1,side);}
  if(sup){inn.super=true;inn.maxBalls=6;inn.maxW=Math.min(2,inn.maxW);}
  else if(m.overs)inn.maxBalls=m.overs*6;
  if(num%2===0)inn.target=m.innings[num-2].runs+1;
  if(sup&&num>4){
    let pb=m.innings.slice(2,num-1).filter(i=>i.super&&i.battingTeamId===batId).pop();
    let pw=m.innings.slice(2,num-1).filter(i=>i.super&&i.bowlingTeamId===bwlId).pop();
    let outIds=new Set(pb?Object.keys(pb.batsmen||{}).filter(id=>pb.batsmen[id].status==='out'):[]);
    let bowled=new Set(pw?Object.keys(pw.bowlers||{}).filter(id=>hasBowled(pw.bowlers[id])):[]);
    let okBat=batPlayers.filter(p=>!outIds.has(p.id)),okBwl=bwlPlayers.filter(p=>!bowled.has(p.id));
    if(okBat.length>=2)batPlayers=okBat;
    if(okBwl.length)bwlPlayers=okBwl;
    inn.maxW=Math.max(1,Math.min(2,batPlayers.length-1));
  }
  m.innings.push(inn);m.currentInnings=num-1;
  batPlayers.forEach(p=>{inn.batsmen[p.id]={name:p.name,runs:0,balls:0,fours:0,sixes:0,status:'yet',dismissal:''};});
  bwlPlayers.forEach(p=>{inn.bowlers[p.id]={name:p.name,overs:0,maidens:0,runs:0,wickets:0,wides:0,noballs:0,balls:0};});
  let opO=batPlayers.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  let bwO=bwlPlayers.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  document.getElementById('ins-op1').innerHTML=opO;
  document.getElementById('ins-op2').innerHTML=opO;
  if(batPlayers.length>1)document.getElementById('ins-op2').selectedIndex=1;
  document.getElementById('ins-bwl').innerHTML=bwO;
  setTxt(document.getElementById('ins-title'),sup?`⚡ ${soName(m,{number:num})} — ${batT?batT.name:batId} batting`:`🏏 Innings ${num} — ${batT?batT.name:batId} batting`);
  openM('ins-mo');saveState();
}
function confirmInningsSetup(){
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let op1=document.getElementById('ins-op1').value,op2=document.getElementById('ins-op2').value;
  let bwl=document.getElementById('ins-bwl').value;
  if(op1===op2){toast('Select two different openers');return;}
  inn.striker=op1;inn.nonStriker=op2;inn.currentBowler=bwl;
  inn.batsmen[op1].status='batting';inn.batsmen[op2].status='batting';noteBowler(inn);
  closeM('ins-mo');afterScore();showTab('live');toast('Innings started! 🏏');
}

// ══════════════════════════════════════════════════════════════════════════
//  MID-MATCH MANAGE MODAL
// ══════════════════════════════════════════════════════════════════════════
function openManage(){
  if(APP.role!=='admin')return;
  if(!APP.liveMatch){toast('No live match');return;}
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  if(!inn||inn.completed){toast('Innings not in progress');return;}
  let batT=APP.teams.find(t=>t.id===inn.battingTeamId);
  let bwlT=APP.teams.find(t=>t.id===inn.bowlingTeamId);
  // Batsmen — all non-out players from the Playing XI
  let batPlayers=getMatchXI(m,inn.battingTeamId);
  let available=batPlayers.filter(p=>inn.batsmen[p.id]&&inn.batsmen[p.id].status!=='out');
  let bOpts='<option value="">— keep current —</option>'
    +available.map(p=>{
      let st=inn.batsmen[p.id].status;
      let sel=(p.id===inn.striker)?'selected':'';
      return`<option value="${p.id}" ${sel}>${esc(p.name)} (${st})</option>`;
    }).join('');
  let nsOpts='<option value="">— keep current —</option>'
    +available.map(p=>{
      let st=inn.batsmen[p.id].status;
      let sel=(p.id===inn.nonStriker)?'selected':'';
      return`<option value="${p.id}" ${sel}>${esc(p.name)} (${st})</option>`;
    }).join('');
  document.getElementById('mg-sk').innerHTML=bOpts;
  document.getElementById('mg-ns').innerHTML=nsOpts;
  // Bowlers
  let bwlPlayers2=getMatchXI(m,inn.bowlingTeamId);
  let bwlOpts=bwlPlayers2.map(p=>{
    let b=inn.bowlers[p.id],bmx=bowlerMaxOvers(liveOvers()),maxed=p.id!==inn.currentBowler&&bowlerMaxed(b);
    let prev=p.id!==inn.currentBowler&&p.id===inn.lastOverBowler&&inn.legalBalls>0;
    return`<option value="${p.id}" ${p.id===inn.currentBowler?'selected':''} ${maxed||prev?'disabled':''}>${esc(p.name)} — ${bowlerOvTxt(b)} ov${maxed?' ⛔('+bmx+')':prev?' (prev over)':p.id===inn.currentBowler?' (current)':''}</option>`;
  }).join('');
  document.getElementById('mg-bwl').innerHTML=bwlOpts;
  document.getElementById('mg-bwarn').textContent='';
  openM('mg-mo');
}
function applyBatsmen(){
  if(APP.role!=='admin'||!APP.liveMatch)return;
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let sk=document.getElementById('mg-sk').value;
  let ns=document.getElementById('mg-ns').value;
  if(sk&&ns&&sk===ns){toast('Striker and non-striker must differ');return;}
  const back=id=>{if(inn.batsmen[id].status==='retired'){inn.log=inn.log||[];let lb=inn.legalBalls;inn.log.push({o:Math.floor(lb/6)+'.'+(lb%6+1),e:'rb',d:inn.batsmen[id].name,r:0});inn.batsmen[id].dismissal='';}};
  if(sk){back(sk);inn.batsmen[sk].status='batting';inn.striker=sk;}
  if(ns){back(ns);inn.batsmen[ns].status='batting';inn.nonStriker=ns;}
  closeM('mg-mo');afterScore();toast('✅ Batsmen updated');
}
function applyBowler(){
  if(APP.role!=='admin'||!APP.liveMatch)return;
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let bid=document.getElementById('mg-bwl').value;
  if(!bid){toast('Select a bowler');return;}
  let bw=inn.bowlers[bid];
  let bmxA=bowlerMaxOvers(liveOvers());
  if(bid!==inn.currentBowler&&bowlerBalls(bw)>=bmxA*6){document.getElementById('mg-bwarn').textContent='⚠ Max '+bmxA+' overs reached!';return;}
  if(bid!==inn.currentBowler&&bid===inn.lastOverBowler&&inn.legalBalls>0){document.getElementById('mg-bwarn').textContent='⚠ This bowler bowled the previous over — choose someone else.';return;}
  inn.currentBowler=bid;noteBowler(inn);closeM('mg-mo');afterScore();toast('✅ Bowler changed');
}

// ══════════════════════════════════════════════════════════════════════════
//  SCORING ENGINE  (ICC rules)
// ══════════════════════════════════════════════════════════════════════════
// ── Undo: snapshot of the live match taken before every scoring action ──
let _undoStack=[];
let _inn2Timer=null;
function pushUndo(){
  let m=APP.liveMatch;if(!m)return;
  try{
    _undoStack.push({id:m.id,snap:JSON.stringify(m),fh:!!APP.pendingFreeHit});
    if(_undoStack.length>30)_undoStack.shift();
  }catch(e){}
}
function undoLast(){
  if(APP.role!=='admin'){toast('Only admin can score');return;}
  let u=_undoStack.pop();
  if(!u){toast('Nothing to undo','warn');return;}
  let idx=APP.matches.findIndex(x=>x.id===u.id);
  if(idx<0||APP.matches.some(x=>x.status==='live'&&x.id!==u.id)){_undoStack=[];toast('Nothing to undo','warn');return;}
  if(APP.matches[idx].status==='completed'&&!window.confirm('Reopen this finished match? The result is removed for everyone until the match is finished again.')){_undoStack.push(u);return;}
  if(_inn2Timer){clearTimeout(_inn2Timer);_inn2Timer=null;}
  let m=JSON.parse(u.snap);
  APP.matches[idx]=m;APP.liveMatch=m;
  APP.pendingFreeHit=u.fh;APP.pendingExtra=null;
  ['nov-mo','ins-mo','wkt-mo','ex-mo','mg-mo','rh-mo','rain-mo','motm-mo','tourn-complete-mo'].forEach(id=>{let e=document.getElementById(id);if(e)e.classList.remove('on');});
  try{closeCelebration();}catch(e){}
  document.getElementById('livebadge').classList.remove('hidden');
  saveState();renderLive();renderMatches();renderHistory();populateSCSelect();renderHome();
  toast('↩ Last entry undone');
}
// Second innings ends as soon as the target is reached
function checkChase(inn){
  if(inn&&!inn.completed&&inn.target&&inn.runs>=inn.target)endInnings();
}
// Ball-by-ball commentary: recorded before the ball counter moves on
function logBall(inn,e,r,d,x){
  inn.log=inn.log||[];
  let lb=inn.legalBalls,bw=inn.bowlers[inn.currentBowler],bs=inn.batsmen[inn.striker];
  let c={o:Math.floor(lb/6)+'.'+(lb%6+1),b:bw?bw.name:'',s:bs?bs.name:'',e,r:r||0};
  if(d)c.d=d;if(x)c.x=x;if(APP.pendingFreeHit)c.fh=1;
  inn.log.push(c);if(inn.log.length>600)inn.log.shift();
}
function addRun(r){
  if(!canScore())return;
  pushUndo();
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  logBall(inn,'run',r);
  inn.runs+=r;
  let bs=inn.batsmen[inn.striker];
  if(bs){bs.runs+=r;bs.balls++;if(r===4)bs.fours++;if(r===6)bs.sixes++;}
  let bw=inn.bowlers[inn.currentBowler];if(bw)bw.runs+=r;
  inn.currentPartnership.runs+=r;inn.currentPartnership.balls++;
  let lbl=APP.pendingFreeHit?(r?r+'FH':'FH'):(r===0?'·':String(r));APP.pendingFreeHit=false;
  inn.thisOver.push(lbl);
  advBall(inn);
  if(r%2===1)swapEnds(inn);
  // Milestone notifications (50, 100, 150...)
  if(bs){
    let prev=bs.runs-r, curr=bs.runs;
    if(prev<100&&curr>=100) notifyCentury(bs.name,curr);
    else if(prev<50&&curr>=50) notifyHalfCentury(bs.name,curr);
  }
  checkChase(inn);
  flashScore();afterScore();
}
function addExtra(type){
  if(!canScore())return;
  APP.pendingExtra=type;
  setTxt(document.getElementById('ex-title'),type==='wide'?'Wide':type==='noball'?'No Ball':type==='bye'?'Bye':'Leg Bye');
  document.getElementById('ex-runs').value=1;
  let br=document.getElementById('ex-bat-row');if(br)br.style.display=type==='noball'?'':'none';
  let bc2=document.getElementById('ex-bat');if(bc2)bc2.checked=false;
  let hint=document.getElementById('ex-hint');
  if(hint)hint.style.color='var(--dim)';
  if(hint)hint.textContent=(type==='wide'||type==='noball')
    ?'Total for this delivery, including the 1 penalty run. Example: '+(type==='wide'?'wide + 2 run':'no ball + 2 run')+' = 3.'+(type==='noball'?' Runs not off the bat count as byes.':'')
    :'Runs taken as '+(type==='bye'?'byes':'leg byes')+'.';
  openM('ex-mo');
}
function confirmExtra(){
  let type=APP.pendingExtra,raw=String(document.getElementById('ex-runs').value).trim();
  if(!/^\d+$/.test(raw)||+raw<1||+raw>8){
    let h=document.getElementById('ex-hint');
    if(h){h.style.color='var(--red)';h.textContent='Enter a whole number from 1 to 8.';}
    document.getElementById('ex-runs').focus();return;
  }
  let runs=+raw;
  let offBat=type==='noball'&&!!document.getElementById('ex-bat')?.checked;
  closeM('ex-mo');
  if(!type||!canScore())return;
  pushUndo();
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let bw=inn.bowlers[inn.currentBowler];
  let bs=inn.batsmen[inn.striker];
  logBall(inn,type==='wide'?'wd':type==='noball'?'nb':type==='bye'?'b':'lb',runs,offBat?'bat':'');
  inn.runs+=runs;inn.currentPartnership.runs+=runs;
  if(type==='wide'||type==='noball'){
    // 1 penalty run + anything the batters ran / hit
    let taken=runs-1;
    let batRuns=offBat?taken:0;
    let exRuns=runs-batRuns;
    inn.extras.total+=exRuns;
    if(type==='wide'){inn.extras.wide=(inn.extras.wide||0)+exRuns;}
    else{
      // No ball: 1 penalty run is a no-ball extra; runs not off the bat are byes
      inn.extras.noball=(inn.extras.noball||0)+1;
      if(exRuns>1)inn.extras.bye=(inn.extras.bye||0)+(exRuns-1);
    }
    if(type==='wide'){
      if(bw){bw.runs+=runs;bw.wides=(bw.wides||0)+runs;}
    } else {
      // No ball: bowler is charged the penalty and runs off the bat (not byes)
      if(bw){bw.runs+=1+batRuns;bw.noballs++;}
      if(bs){
        bs.balls++;bs.runs+=batRuns;inn.currentPartnership.balls++;
        if(batRuns===4)bs.fours++;if(batRuns===6)bs.sixes++;
        let prev=bs.runs-batRuns;
        if(prev<100&&bs.runs>=100)notifyCentury(bs.name,bs.runs);
        else if(prev<50&&bs.runs>=50)notifyHalfCentury(bs.name,bs.runs);
      }
      APP.pendingFreeHit=!APP.tournament.noFH;
    }
    inn.thisOver.push((runs>1?runs:'')+(type==='wide'?'wd':'nb'));
    // Strike changes only on runs actually taken, not on the penalty run
    if(taken%2===1)swapEnds(inn);
    // wide/noball: NO advBall — not a legal delivery
  } else {
    // Byes / leg byes: legal delivery, not charged to the bowler
    inn.extras.total+=runs;inn.extras[type]=(inn.extras[type]||0)+runs;
    inn.currentPartnership.balls++;
    inn.thisOver.push(type==='bye'?`B${runs}`:`LB${runs}`);
    if(bs)bs.balls++;
    APP.pendingFreeHit=false;
    advBall(inn);
    if(runs%2===1)swapEnds(inn);
  }
  APP.pendingExtra=null;
  checkChase(inn);
  flashScore();afterScore();
}
function triggerWicket(){
  if(!canScore())return;
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let st=inn.striker?inn.batsmen[inn.striker]:null;
  document.getElementById('wkt-bats').textContent=st?st.name:'—';
  document.getElementById('wkt-type').value=APP.pendingFreeHit?'Run Out':'Bowled';
  {let lo=[...document.getElementById('wkt-type').options].find(o=>o.value==='LBW');if(lo){lo.disabled=!!APP.tournament.noLBW;lo.hidden=!!APP.tournament.noLBW;}}
  let fsel=document.getElementById('wkt-fld');
  fsel.innerHTML='<option value="">— Select fielder —</option>'+getMatchSquad(m,inn.bowlingTeamId).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}${p.isSub?' (sub)':''}</option>`).join('');
  fsel.value='';
  onDismChange();
  let batT=APP.teams.find(t=>t.id===inn.battingTeamId);
  let xiPlayers=getMatchXI(APP.liveMatch,inn.battingTeamId);
  let rem=xiPlayers.filter(p=>inn.batsmen[p.id]&&inn.batsmen[p.id].status==='yet');
  let back=xiPlayers.filter(p=>inn.batsmen[p.id]&&inn.batsmen[p.id].status==='retired');
  document.getElementById('wkt-ro').value='striker';document.getElementById('wkt-ro').onchange=onDismChange;
  document.getElementById('wkt-del').value='normal';document.getElementById('wkt-runs').value=0;
  // Players first — auto-select the first available batsman
  // Skip option goes at the END so it's never accidentally chosen
  let sel=document.getElementById('wkt-next');
  sel.innerHTML=rem.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')
    +back.map(p=>`<option value="${p.id}">${esc(p.name)} (retired hurt)</option>`).join('')
    +'<option value="" style="color:var(--dim)">— Set later via ⚙️ Manage —</option>';
  // Auto-select first available player if any remain
  if(rem.length>0) sel.value=rem[0].id;
  else if(back.length>0) sel.value=back[0].id;
  else sel.value='';
  openM('wkt-mo');
}
function onDismChange(){
  let t=document.getElementById('wkt-type').value;
  document.getElementById('wkt-frow').style.display=['Caught','Stumped','Run Out'].includes(t)?'':'none';
  document.getElementById('wkt-rorow').style.display=t==='Run Out'?'':'none';
  let we=document.getElementById('wkt-err');if(we)we.textContent='';
  let we2=document.getElementById('wkt-err2');if(we2)we2.textContent='';
  document.getElementById('wkt-delrow').style.display=(t==='Run Out'||t==='Stumped')?'':'none';
  document.getElementById('wkt-runrow').style.display=t==='Run Out'?'':'none';
  let dsel=document.getElementById('wkt-del'),dv=dsel.value;
  dsel.innerHTML='<option value="normal">Normal ball</option><option value="wide">Wide</option>'+(t==='Stumped'?'':'<option value="noball">No ball</option>');
  dsel.value=(t==='Stumped'&&dv==='noball')?'normal':(dv||'normal');
  // Show who is actually out (the non-striker can be run out)
  {let lm0=APP.liveMatch,li0=lm0&&lm0.innings[lm0.currentInnings];
   if(li0){let who=(t==='Run Out'&&document.getElementById('wkt-ro').value==='ns')?li0.nonStriker:li0.striker;
     let b0=who&&li0.batsmen[who];document.getElementById('wkt-bats').textContent=b0?b0.name:'—';}}
  // Stumped: default to the wicket-keeper when the squad has one
  let fs=document.getElementById('wkt-fld'),lm=APP.liveMatch,li=lm&&lm.innings[lm.currentInnings];
  if(fs&&li&&t==='Stumped'&&!fs.value){
    let wk=getMatchSquad(lm,li.bowlingTeamId).find(p=>p.role==='Wicket-keeper');
    if(wk)fs.value=wk.name;
  }
}
function confirmWicket(){
  if(!canScore()){closeM('wkt-mo');return;}
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let type=document.getElementById('wkt-type').value;
  let fielder=document.getElementById('wkt-fld').value.trim();
  let nextId=document.getElementById('wkt-next').value;
  let roWho=document.getElementById('wkt-ro').value;
  let werr=document.getElementById('wkt-err');if(werr)werr.textContent='';
  if(APP.pendingFreeHit&&type!=='Run Out'){toast('Free hit — the batter can only be run out','warn');document.getElementById('wkt-type').value='Run Out';onDismChange();return;}
  if((type==='Caught'||type==='Stumped')&&!fielder){if(werr)werr.textContent='Choose the fielder.';return;}
  let bw=inn.bowlers[inn.currentBowler];
  let werr2=document.getElementById('wkt-err2');if(werr2)werr2.textContent='';
  if(type==='Stumped'&&bw&&fielder===bw.name){if(werr)werr.textContent='The bowler cannot be the stumper — choose the wicket-keeper.';return;}
  let del=(type==='Run Out'||type==='Stumped')?document.getElementById('wkt-del').value:'normal';
  if(type==='Stumped'&&del==='noball'){if(werr2)werr2.textContent='A batter cannot be stumped off a no ball.';return;}
  let r=0;
  if(type==='Run Out'){
    let raw=String(document.getElementById('wkt-runs').value).trim();
    if(!/^[0-6]$/.test(raw)){if(werr2)werr2.textContent='Runs must be a whole number from 0 to 6.';return;}
    r=+raw;
  }
  if(type==='Run Out'&&roWho==='ns'&&!inn.nonStriker){if(werr2)werr2.textContent='No non-striker is set.';return;}
  pushUndo();
  let dismissedId=(type==='Run Out'&&roWho==='ns')?inn.nonStriker:inn.striker;
  let dname=inn.batsmen[dismissedId]?inn.batsmen[dismissedId].name:'?';
  let bname=bw?bw.name:'?';
  let dstr=buildDism(type,bname,fielder);
  logBall(inn,'out',r,dname+' '+dispDism(dstr),del==='normal'?'':del);
  let bs=inn.batsmen[dismissedId];
  if(bs){bs.status='out';bs.dismissal=dstr;}
  let legal=del==='normal';
  // Runs and extras on the ball the wicket fell on
  let facer=inn.batsmen[inn.striker];
  if(del==='wide'){
    let tot=1+r;inn.runs+=tot;inn.extras.total+=tot;inn.extras.wide=(inn.extras.wide||0)+tot;
    if(bw){bw.runs+=tot;bw.wides=(bw.wides||0)+tot;}
    inn.currentPartnership.runs+=tot;
  }else if(del==='noball'){
    inn.runs+=1+r;inn.extras.total+=1;inn.extras.noball=(inn.extras.noball||0)+1;
    if(bw){bw.runs+=1+r;bw.noballs=(bw.noballs||0)+1;}
    if(facer){facer.balls++;facer.runs+=r;}
    inn.currentPartnership.runs+=1+r;inn.currentPartnership.balls++;
  }else{
    inn.runs+=r;if(bw)bw.runs+=r;
    if(facer){facer.balls++;facer.runs+=r;}
    inn.currentPartnership.runs+=r;inn.currentPartnership.balls++;
  }
  APP.pendingFreeHit=del==='noball'&&!APP.tournament.noFH;
  if(['Bowled','Caught','LBW','Stumped','Hit Wicket'].includes(type)&&bw)bw.wickets++;
  inn.wickets++;
  let lb=inn.legalBalls+(legal?1:0);
  inn.fallOfWickets.push({score:inn.runs,wicket:inn.wickets,batsman:dname,over:Math.floor(lb/6)+'.'+(lb%6)});
  {let nm=id=>id&&inn.batsmen[id]?inn.batsmen[id].name:'';inn.partnerships.push({...inn.currentPartnership,a:nm(inn.striker),b:nm(inn.nonStriker)});}
  inn.currentPartnership={runs:0,balls:0};
  inn.thisOver.push((r?r:'')+(del==='wide'?'wd':del==='noball'?'nb':'')+'W');
  if(legal)advBall(inn);
  if(r%2===1)swapEnds(inn);
  closeM('wkt-mo');
  if(allOut(inn)){endInnings();return;}
  // Set next batsman if selected
  if(nextId){
    if(dismissedId===inn.striker)inn.striker=nextId;
    else inn.nonStriker=nextId;
    if(inn.batsmen[nextId])inn.batsmen[nextId].status='batting';
    toast(`${dname} — ${dstr} ⚡`);
    // Notify wicket
    notifyWicket(dname,bs?bs.runs:0,dstr,`${inn.runs}/${inn.wickets}`,ov(inn));
  } else if(lmsAlone(inn)){
    // Last man stands: the batter left keeps batting, always on strike
    if(dismissedId===inn.striker)inn.striker=inn.nonStriker;
    inn.nonStriker=null;
    let lone=inn.striker&&inn.batsmen[inn.striker];
    toast(`${dname} — ${dstr} ⚡ Last man stands: ${lone?lone.name:'the last batter'} bats on alone`);
    notifyWicket(dname,bs?bs.runs:0,dstr,`${inn.runs}/${inn.wickets}`,ov(inn));
  } else {
    // Missed — clear that end so canScore() will warn until ⚙️ is used
    if(dismissedId===inn.striker)inn.striker=null;
    else inn.nonStriker=null;
    toast(`${dname} out. ⚙️ Tap Manage to set next batsman!`,'warn');
    // Notify wicket
    notifyWicket(dname,bs?bs.runs:0,dstr,`${inn.runs}/${inn.wickets}`,ov(inn));
  }
  checkChase(inn);
  afterScore();
}
function buildDism(type,bwl,fld){
  if(type==='Bowled')return`b ${bwl}`;
  if(type==='Caught')return fld&&fld===bwl?`c & b ${bwl}`:`c ${fld||'fielder'} b ${bwl}`;
  if(type==='LBW')return`lbw b ${bwl}`;
  if(type==='Run Out')return`run out (${fld||'fielder'})`;
  if(type==='Stumped')return`st ${fld||'keeper'} b ${bwl}`;
  if(type==='Hit Wicket')return`hit wkt b ${bwl}`;
  return type.toLowerCase();
}
function advBall(inn){
  if(inn.completed)return;
  inn.ballInOver++;inn.legalBalls++;
  let bw=inn.bowlers[inn.currentBowler];if(bw){bw.balls=(bw.balls||0)+1;if(bw.balls>=6){bw.overs=(bw.overs||0)+1;bw.balls-=6;}}
  inn.overs=Math.floor(inn.legalBalls/6);
  if(inn.ballInOver>=6)completeOver(inn);
  if(inn.legalBalls>=innBalls(inn)&&!inn.completed)endInnings();
}
function completeOver(inn){
  let bw=inn.bowlers[inn.currentBowler];
  if(bw){
    let oR=inn.thisOver.filter(b=>!/wd|nb/.test(b)).reduce((a,b)=>a+(parseInt(b)||0),0);
    let hE=inn.thisOver.some(b=>/wd|nb/.test(b));
    if(oR===0&&!hE)bw.maidens++;
  }
  inn.lastOverBowler=inn.currentBowler;
  inn.ballInOver=0;
  inn.pastOvers=inn.pastOvers||[];
  inn.pastOvers.push([...inn.thisOver]);
  inn.thisOver=[];
  swapEnds(inn);
  if(inn.legalBalls<innBalls(inn)&&!allOut(inn))promptNewOver(inn);
}
function promptNewOver(inn){
  if(APP.role!=='admin')return;
  let bwlT=APP.teams.find(t=>t.id===inn.bowlingTeamId);
  let bwlPlayers=getMatchXI(APP.liveMatch,inn.bowlingTeamId);
  let opts=bwlPlayers.map(p=>{
    let b=inn.bowlers[p.id],bmx=bowlerMaxOvers(liveOvers()),mx=bowlerMaxed(b,true),cur=p.id===inn.currentBowler;
    return`<option value="${p.id}" ${mx||cur?'disabled':''}>${esc(p.name)} — ${bowlerOvTxt(b)} ov${mx?' (max '+bmx+')':cur?' (prev)':''}</option>`;
  }).join('');
  document.getElementById('nov-bwl').innerHTML=opts;
  document.getElementById('nov-warn').textContent='';
  openM('nov-mo');
}
function confirmNewOver(){
  let bid=document.getElementById('nov-bwl').value;
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  let bw=inn.bowlers[bid];
  let bmx=bowlerMaxOvers(liveOvers());
  if(bowlerMaxed(bw,true)){document.getElementById('nov-warn').textContent='⚠ Max '+bmx+' overs per bowler!';return;}
  if(bid===inn.currentBowler){document.getElementById('nov-warn').textContent='⚠ Same bowler consecutive overs not allowed!';return;}
  inn.currentBowler=bid;noteBowler(inn);closeM('nov-mo');afterScore();
}
function triggerRetiredHurt(){
  if(!APP.liveMatch||APP.role!=='admin')return;
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  if(!inn||inn.completed)return;
  let opts=[['striker',inn.striker],['ns',inn.nonStriker]].filter(x=>x[1]&&inn.batsmen[x[1]])
    .map(x=>`<option value="${x[0]}">${esc(inn.batsmen[x[1]].name)} (${x[0]==='striker'?'striker':'non-striker'})</option>`).join('');
  if(!opts){toast('No batter at the crease','warn');return;}
  document.getElementById('rh-who').innerHTML=opts;
  openM('rh-mo');
}
function confirmRetiredHurt(){
  let m=APP.liveMatch,inn=m&&m.innings[m.currentInnings];
  closeM('rh-mo');
  if(!inn||inn.completed)return;
  let end=document.getElementById('rh-who').value==='ns'?'nonStriker':'striker';
  let bs=inn[end]&&inn.batsmen[inn[end]];if(!bs)return;
  pushUndo();
  inn.log=inn.log||[];{let lb=inn.legalBalls;inn.log.push({o:Math.floor(lb/6)+'.'+(lb%6+1),e:'rh',d:bs.name,r:0});}
  bs.status='retired';bs.dismissal='retired hurt';
  inn[end]=null;
  inn.partnerships=inn.partnerships||[];{let nm=id=>id&&inn.batsmen[id]?inn.batsmen[id].name:'';inn.partnerships.push({...inn.currentPartnership,a:nm(inn.striker),b:nm(inn.nonStriker)});}
  inn.currentPartnership={runs:0,balls:0};
  toast(`${bs.name} retired hurt — use ⚙️ Manage to set next batsman`,'warn');
  afterScore();openManage();
}
function swapEnds(inn){if(lmsAlone(inn)){if(!inn.striker){inn.striker=inn.nonStriker;inn.nonStriker=null;}return;}let t=inn.striker;inn.striker=inn.nonStriker;inn.nonStriker=t;}
function endInnings(){
  let m=APP.liveMatch,inn=m.innings[m.currentInnings];
  inn.completed=true;closeM('nov-mo');
  // Notify innings complete
  let batTeam=APP.teams.find(t=>t.id===inn.battingTeamId);
  notifyInningsComplete(batTeam?batTeam.name:'Team',inn.runs,inn.wickets,ov(inn));
  if(inn.number%2===1){
    toast(inn.super?`Super Over: ${batTeam?batTeam.name:'Team'} need to defend ${inn.runs}`:'Innings 1 complete! Starting Innings 2...');
    saveState();
    let nx=inn.number+1;
    _inn2Timer=setTimeout(()=>{_inn2Timer=null;if(APP.liveMatch===m&&inn.completed&&m.innings.length===nx-1)startInnings(nx,inn.bowlingTeamId,inn.battingTeamId);},1500);
  } else {determineWinner(m);}
  renderLive();
}
// ══════════════════════════════════════════════════════════════════════════
//  DISCARD / ABANDON MATCH
// ══════════════════════════════════════════════════════════════════════════
function setDiscardText(){setTxt(document.getElementById('disc-nr-txt'),'Match stays in history as "No Result". Scores so far are saved.'+(APP.tournament.single?'':' Each team gets 1 point.'));}
function openDiscard(){
  if(!APP.liveMatch){toast('No live match');return;}
  // Reset to defaults
  let r=document.getElementById('disc-no-result');
  if(r)r.checked=true;
  let e=document.getElementById('disc-err');if(e)e.textContent='';
  setDiscardText();
  let rs=document.getElementById('disc-reason');
  if(rs)rs.value='Rain/Bad Weather';
  openM('discard-mo');
}
function confirmDiscard(){
  if(!APP.liveMatch){closeM('discard-mo');return;}
  let m=APP.liveMatch;
  let reason=document.getElementById('disc-reason')?.value||'Other';
  let action=[...document.querySelectorAll('input[name="disc-action"]')].find(r=>r.checked)?.value||'no_result';
  let errEl=document.getElementById('disc-err');
  if(errEl)errEl.textContent='';

  if(action==='no_result'){
    // Mark as completed with No Result — preserve scores so far
    m.status='completed';m.completedAt=Date.now();
    m.winner='no_result';
    m.resultText=`No Result — ${reason}`;
    // Mark any incomplete innings as completed
    (m.innings||[]).forEach(inn=>{inn.completed=true;});
    APP.liveMatch=null;
    document.getElementById('livebadge').classList.add('hidden');
    closeM('discard-mo');
    saveState();renderLive();renderHistory();renderMatches();populateSCSelect();
    toast(`Match abandoned — No Result (${reason})`,'warn');

  } else if(action==='reschedule'){
    // Reset all innings data, put back to scheduled
    m.status='scheduled';
    m.innings=[];
    m.currentInnings=0;
    m.winner=null;
    m.toss=null;
    m.resultText=null;
    delete m.overs;
    APP.liveMatch=null;
    APP.pendingFreeHit=false;
    APP.pendingExtra=null;
    document.getElementById('livebadge').classList.add('hidden');
    closeM('discard-mo');
    saveState();renderLive();renderHistory();renderMatches();populateSCSelect();
    toast(`Match reset — scores cleared, ready to reschedule`,'warn');

  } else if(action==='delete'){
    // Permanently delete
    APP.matches=APP.matches.filter(x=>x.id!==m.id);
    APP.liveMatch=null;
    APP.pendingFreeHit=false;
    APP.pendingExtra=null;
    document.getElementById('livebadge').classList.add('hidden');
    closeM('discard-mo');
    saveState();renderLive();renderHistory();renderMatches();populateSCSelect();
    toast('Match permanently deleted');
  }
}

function canScore(){
  if(APP.role!=='admin'){toast('Only admin can score');return false;}
  if(!APP.liveMatch){toast('No live match');return false;}
  let inn=APP.liveMatch.innings[APP.liveMatch.currentInnings];
  if(!inn||inn.completed){toast('Innings complete');return false;}
  if(!inn.currentBowler){toast('No bowler set — use ⚙️ Manage');return false;}
  if(needBowler(inn)){promptNewOver(inn);return false;}
  if(!inn.striker){toast('No striker set — use ⚙️ Manage');return false;}
  if(!inn.nonStriker&&!lmsAlone(inn)){toast('No non-striker set — use ⚙️ Manage');openManage();return false;}
  return true;
}
// Economy rate from runs, completed overs and extra balls
function econ(runs,overs,balls){let b=(overs||0)*6+(balls||0);return b>0?(runs||0)*6/b:null;}
function econTxt(runs,overs,balls){let e=econ(runs,overs,balls);return e===null?'—':e.toFixed(2);}
function hasBowled(b){return !!(b&&((b.overs||0)||(b.balls||0)||(b.runs||0)||(b.wides||0)||(b.noballs||0)));}
function todayISO(){return new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);}
function ov(inn){return`${Math.floor(inn.legalBalls/6)}.${inn.legalBalls%6}`;}
function dispDism(d){let m=String(d||'').match(/^c (.+) b \1$/);return m?'c & b '+m[1]:(d||'');}
function scTxt(inn){return allOut(inn)?`${inn.runs} all out`:`${inn.runs}/${inn.wickets}`;}
function plural(n,w){n=n||0;return n+' '+w+(n===1?'':'s');}
function venueTxt(m){return m&&m.venue&&m.venue!=='TBD'?m.venue:'Venue not set';}
function realUmpires(m){return ((m&&m.umpires)||[]).filter(u=>u&&!/^(Umpire [12]|Third Umpire)$/.test(u));}
// True when an over has just ended and the next bowler has not been chosen yet
function needBowler(inn){
  return !!(inn&&!inn.completed&&inn.legalBalls>0&&inn.legalBalls<innBalls(inn)&&!allOut(inn)&&
    inn.ballInOver===0&&!(inn.thisOver||[]).length&&inn.currentBowler&&inn.currentBowler===inn.lastOverBowler);
}
function promptBowlerNow(){let m=APP.liveMatch,inn=m&&m.innings[m.currentInnings];if(inn&&needBowler(inn))promptNewOver(inn);}
function noteBowler(inn){inn.bowlOrder=inn.bowlOrder||[];if(inn.currentBowler&&!inn.bowlOrder.includes(inn.currentBowler))inn.bowlOrder.push(inn.currentBowler);}
function lastCompletedMatch(){
  let done=APP.matches.map((m,i)=>({m,i})).filter(x=>x.m.status==='completed');
  if(!done.length)return null;
  done.sort((a,b)=>((a.m.completedAt||0)-(b.m.completedAt||0))||(a.i-b.i));
  return done[done.length-1].m;
}
function resultCard(m){
  if(!m)return'';
  let sc=m.innings.map(inn=>`<div style="font-size:13px;color:var(--txt2)">${inn.super?'⚡ '+soName(m,inn)+' · ':''}${esc(rawTeamName(inn.battingTeamId))}: <b>${scTxt(inn)}</b> (${ov(inn)})</div>`).join('');
  return `<div style="font-size:12px;color:var(--dim);font-weight:600">LATEST RESULT</div>
    <div style="font-family:var(--disp);font-size:15px;margin-top:3px;color:var(--txt)">${esc(rawTeamName(m.teamAId))} <span style="color:var(--dim)">vs</span> ${esc(rawTeamName(m.teamBId))}</div>
    ${sc}<div style="color:var(--em);font-weight:700;margin-top:4px">🏆 ${esc(m.resultText||'')}</div>
    <button class="bsm" style="margin-top:8px" onclick="showMHist('${m.id}')">📊 View scorecard</button>
    ${canSuperOver(m)?`<button class="bsm bgld" style="margin-top:8px" onclick="startSuperOver('${m.id}')">⚡ Play Super Over</button>`:''}`;
}
