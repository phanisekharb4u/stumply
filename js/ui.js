// Stumply — Button wiring and the notification prompts.
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  BIND ALL STATIC EVENT HANDLERS (replaces onclick= attributes)
//  This avoids Content-Security-Policy issues with inline event handlers
// ══════════════════════════════════════════════════════════════════════════
document.addEventListener('click',e=>{
  let b=e.target.closest&&e.target.closest('.pweye');if(!b)return;
  let inp=document.getElementById(b.dataset.for);if(!inp)return;
  let show=inp.type==='password';inp.type=show?'text':'password';
  b.classList.toggle('on',show);b.textContent=show?'🙈':'👁';
  let lbl=show?'Hide password':'Show password';b.setAttribute('aria-label',lbl);b.title=lbl;
});
function bindActions(){
  document.querySelectorAll('[data-action]').forEach(function(el){
    if(el.getAttribute('data-bound'))return; // already bound — skip
    el.setAttribute('data-bound','1');
    var action = el.getAttribute('data-action');
    el.addEventListener('click', function(e){
      // Parse the action string and call the right function
      try{
        // Handle: funcName() and funcName('arg') and funcName('a','b')
        var match = action.match(/^(\w+)\((.*)\)$/);
        if(!match){ console.warn('Unknown action:', action); return; }
        var fnName = match[1];
        var argsStr = match[2].trim();
        // SECURITY: whitelist of allowed functions — NO eval()
        var ALLOWED = {
          doLogin,doRegister,doGuest,doLogout,showForgot,showLogin,showViewer,
          switchStatTab,openLangModal,setLang,showCelebration,closeCelebration,openMOTM,saveMOTM,showTournamentComplete,applyLanguage,openAfterCelebration,closeCelebration,syncNow,newTournament,newSingleMatch,loadUsage,idpStart,finishSetup,confirmRetiredHurt,cancelToss,watchSearch,orgGo,watchGo,addScorer,loadDiscover,openRain,rainSuggest,confirmRain,startSuperOver,superFromCelebration,
          deleteTeam,delPlayer,deleteMatch,confirmDeleteMatch,moveMatch,startMatch,showMHist,openEditMatch,openDiscard,openManage,triggerRetiredHurt,enableNotifications,skipNotifications,toggleNotifications,
          switchTab,fpStep1,
          showTab,saveTournament,addTeam,clearBulk,filterPlayers,
          copyShareLink,openShareLink,updateBowlerMaxLabel,
          openSchedModal,scheduleMatch,cancelSchModal,
          startMatch,confirmToss,confirmInningsSetup,confirmNewOver,
          openManage,applyBatsmen,applyBowler,openDiscard,confirmDiscard,
          triggerWicket,confirmWicket,onDismChange,
          addRun,addExtra,confirmExtra,triggerRetiredHurt,
          openEditMatch,deleteMatch,confirmDeleteMatch,moveMatch,
          populateSCSelect,renderSC,showMHist,
          closeM:function(id){document.getElementById(id)?.classList.remove('on');},
          openM:function(id){document.getElementById(id)?.classList.add('on');},
        };
        var fn = ALLOWED[fnName];
        if(typeof fn !== 'function'){ console.warn('Blocked action:', fnName); return; }
        if(!argsStr){ fn(); return; }
        // Parse args: handle 'string', "string", numbers
        var args = argsStr.split(/,(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/).map(function(a){
          a = a.trim();
          if((a.startsWith("'")&&a.endsWith("'"))||(a.startsWith('"')&&a.endsWith('"')))
            return a.slice(1,-1);
          if(!isNaN(a)) return Number(a);
          return a;
        });
        fn.apply(null, args);
      }catch(err){ console.error('Action error:', action, err); }
    });
  });
  // Special: share-url input select on click
  var shareUrl = document.getElementById('share-url');
  if(shareUrl) shareUrl.addEventListener('click', function(){ this.select(); });
  // Special: overs select onchange
  var ovsEl = document.getElementById('t-overs');
  if(ovsEl) ovsEl.addEventListener('change', function(){
    var cw=document.getElementById('t-overs-custom-wrap');
    if(cw)cw.style.display=(this.value==='custom'?'':'none');
    updateBowlerMaxLabel();
  });
  // Special: overs custom input onchange
  var ovsCustom = document.getElementById('t-overs-custom');
  if(ovsCustom) ovsCustom.addEventListener('change', updateBowlerMaxLabel);
  var dcq = document.getElementById('dc-q');
  if(dcq) dcq.addEventListener('input', function(){var e=document.getElementById('v-err');if(e)e.textContent='';renderDiscover();});
  if(dcq) dcq.addEventListener('keydown', function(e){if(e.key==='Enter'){e.preventDefault();watchSearch();}});
  var rainOv = document.getElementById('rain-ov');
  if(rainOv) rainOv.addEventListener('input', rainSuggest);
  // Special: player team select onchange
  var ptSel = document.getElementById('pt-sel');
  if(ptSel) ptSel.addEventListener('change', filterPlayers);
  // Special: scorecard select onchange
  var scSel = document.getElementById('sc-sel');
  if(scSel) scSel.addEventListener('change', renderSC);
  // Special: wkt-type select onchange
  var wktType = document.getElementById('wkt-type');
  if(wktType) wktType.addEventListener('change', onDismChange);
}

// ══════════════════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════
//  NOTIFICATION UI HELPERS
// ══════════════════════════════════════════════════════════════════════════
function notifMsg(text,warn){
  let s=document.getElementById('notif-status');
  if(s&&s.offsetParent){s.textContent=text;s.style.color=warn?'var(--amber)':'var(--em)';}
  else toast(text,warn?'warn':undefined);
}
async function enableNotifications(){
  lsSet('notif_enabled','1');updateNotifBell();
  if(!('Notification' in window)){
    if(isIOS()&&!isStandalone())notifMsg('✅ Alerts are on inside Stumply while it is open. For alerts on your iPhone lock screen: tap Share, then Add to Home Screen, open Stumply from the new icon and tap Yes, notify me again.',true);
    else notifMsg('✅ Alerts are on. They show inside Stumply while it is open. This browser cannot show phone notifications.');
    return;
  }
  notifMsg('Asking for permission…');
  let granted=false;try{granted=await requestNotifPermission();}catch(e){}
  updateNotifBell();
  if(granted){
    notifMsg('✅ Alerts are on. You will get a notification when a match starts, wickets fall and the result comes.');
    setTimeout(()=>sendNotif('🏏 Stumply alerts are on','You will hear about match starts, wickets and results.','test'),500);
  } else {
    notifMsg('✅ Alerts are on inside Stumply while it is open. Phone notifications are blocked: allow them for this site in your browser settings to get them on the lock screen too.',true);
  }
}
function skipNotifications(){
  lsSet('notif_enabled','0');
  let statusEl=document.getElementById('notif-status');
  if(statusEl)statusEl.textContent='';
  // Hide the notification prompt
  let box=document.querySelector('#authscr .anotif');if(box)box.style.display='none';
}
// Bell in the top bar: tap to turn match alerts on or off
async function toggleNotifications(){
  if(lsGet('notif_enabled')==='1'){lsSet('notif_enabled','0');updateNotifBell();toast('🔕 Match alerts off');return;}
  await enableNotifications();
}
function updateNotifBell(){
  let btn=document.getElementById('notif-btn');
  if(!btn)return;
  btn.style.display='';
  let on=lsGet('notif_enabled')==='1';
  if(!canPhoneNotify()){btn.style.opacity=on?'1':'0.5';btn.textContent=on?'🔔':'🔕';btn.title=on?'Match alerts on (inside the app) — tap to turn off':'Tap to turn on match alerts';return;}
  btn.style.opacity=on?'1':'0.5';btn.textContent=on?'🔔':'🔕';
  btn.title=on?'Match alerts on — tap to turn off':'Tap to turn on match alerts';
}

// Show notification prompt for viewers if not yet decided
function maybePromptNotifications(){
  if(APP.role!=='viewer')return;
  if(!('Notification' in window))return;
  if(Notification.permission==='granted'||Notification.permission==='denied')return;
  if(lsGet('notif_enabled')==='0')return; // user said no
  // Already showing on viewer panel — no extra prompt needed
}

// ══════════════════════════════════════════════════════════════════════════
