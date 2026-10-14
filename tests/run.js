// Stumply end-to-end test runner.
//
//   cd tests && npm install && npx playwright install chromium
//   node run.js                 run every test
//   node run.js match-alerts    run tests whose name contains "match-alerts"
//   node run.js --update        accept the current output as the new expected result
//
// Each test is a script in e2e/ that drives the app in a real browser against a fake
// Firebase (mock-firebase.js, started fresh for every test) and prints what it saw.
// The output is compared line by line with expected/<test>.txt. A test fails when
//   - the script crashes or times out,
//   - the page shows a JavaScript error, or a security check prints "(bad)",
//   - the output no longer matches the expected file.
// In expected files a line starting with ~ matches any line (for values that change run to run).
const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'out');
const args=process.argv.slice(2),UPDATE=args.includes('--update'),only=args.filter(a=>!a.startsWith('--'));
let PW=process.env.PW;
if(!PW){try{PW=path.dirname(require.resolve('playwright/package.json'));}catch(e){console.error('Playwright is not installed. Run: cd tests && npm install && npx playwright install chromium');process.exit(1);}}
const MOCKS=[{PORT:'8771',IDP:'google.com,twitter.com'},{PORT:'8772',CFG:'none'},{PORT:'8774',IDP:'google.com'},{PORT:'8775',ANON:'off'}];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let procs=[];
async function startMocks(){
  stopMocks();
  procs=MOCKS.map(e=>spawn(process.execPath,[path.join(__dirname,'mock-firebase.js')],{env:Object.assign({},process.env,{ROOT},e),stdio:'ignore'}));
  for(const m of MOCKS){for(let i=0;i<50;i++){try{await fetch('http://localhost:'+m.PORT+'/__dump');break;}catch(e){await wait(100);}}}
}
function stopMocks(){procs.forEach(p=>{try{p.kill();}catch(e){}});procs=[];}
// Values that change on every run are replaced so runs can be compared
function norm(t){
  return t.split('\n').filter(l=>!/agent-proxy|fonts\.googleapis|For details:|^- [a-z.]+:443/.test(l)).map(l=>l
    .replace(/\x1b\[[0-9;]*m/g,'')
    .replace(/\b[tm]_[a-z0-9_]{6,}\b/g,'<id>')
    .replace(/\b(?:u|s|a)[0-9][a-z0-9]{5,}\b/g,'<uid>')
    .replace(/\b\d{12,}\b/g,'<time>')
    .replace(/\b20\d\d-\d\d-\d\d\b/g,'<date>')
    .replace(/Season (\d+), 20\d\d/g,'Season $1, <year>')
    .replace(/\b\d{1,2} [A-Z][a-z]{2}, \d\d:\d\d [ap]m\b/g,'<when>')
    .replace(/\bin \d+ ms\b/g,'in <n> ms').replace(/~\d+ ms\b/g,'~<n> ms')
    .replace(/http:\/\/localhost:\d+/g,'<site>')
    .replace(/\s+$/,'')).join('\n').trim()+'\n';
}
function matches(exp,got){
  let e=exp.trim().split('\n'),g=got.trim().split('\n');
  if(e.length!==g.length)return {ok:false,line:Math.min(e.length,g.length)+1,want:e[g.length]||'(end of output)',saw:g[e.length]||'(end of output)'};
  for(let i=0;i<e.length;i++){if(e[i].startsWith('~'))continue;if(e[i]!==g[i])return {ok:false,line:i+1,want:e[i],saw:g[i]};}
  return {ok:true};
}
function runOne(file){
  return new Promise(res=>{
    let out='',done=false;
    const p=spawn(process.execPath,[file],{cwd:OUT,env:Object.assign({},process.env,{PW,TAG:'r10001'})});
    // A script that reports FAILED may leave its browser open: stop it shortly after
    const onData=d=>{out+=d;if(/\bFAILED\b/.test(out)&&!p.killTimer)p.killTimer=setTimeout(()=>p.kill(),1500);};
    p.stdout.on('data',onData);p.stderr.on('data',onData);
    const timer=setTimeout(()=>{if(!done){out+='\nTIMED OUT';p.kill();}},180000);
    p.on('close',code=>{done=true;clearTimeout(timer);res({code,out});});
  });
}
(async()=>{
  fs.mkdirSync(path.join(OUT,'shots'),{recursive:true});
  fs.readdirSync(path.join(__dirname,'expected')).length||0;
  let files=fs.readdirSync(path.join(__dirname,'e2e')).filter(f=>f.endsWith('.js')).sort();
  if(only.length)files=files.filter(f=>only.some(o=>f.includes(o)));
  let results=[];
  for(const f of files){
    const name=f.replace(/\.js$/,''),t0=Date.now();
    await startMocks();
    const {code,out}=await runOne(path.join(__dirname,'e2e',f));
    const got=norm(out);fs.writeFileSync(path.join(OUT,name+'.txt'),got);
    let why='';
    if(/TIMED OUT/.test(out))why='timed out';
    else if(code!==0)why='script exited with code '+code;
    else if(/\bFAILED\b/.test(out))why='script reported FAILED';
    else if(/\(bad\)/.test(out))why='a security check printed (bad)';
    else if(!/no page errors/.test(out))why='JavaScript error on the page, or the test stopped early';
    const expFile=path.join(__dirname,'expected',name+'.txt');
    if(!why){
      if(UPDATE||!fs.existsSync(expFile)){fs.writeFileSync(expFile,got);if(!UPDATE)console.log('  (no expected file yet for '+name+', saved this run as expected)');}
      else{let m=matches(fs.readFileSync(expFile,'utf8'),got);if(!m.ok)why=`output changed at line ${m.line}\n      expected: ${m.want}\n      got:      ${m.saw}`;}
    }
    results.push({name,ok:!why});
    console.log(`${why?'✘':'✔'} ${name}  (${Math.round((Date.now()-t0)/1000)}s)${why?'\n    '+why+'\n    full output: tests/out/'+name+'.txt':''}`);
  }
  stopMocks();
  const bad=results.filter(r=>!r.ok);
  console.log(`\n${results.length-bad.length} passed, ${bad.length} failed`);
  process.exit(bad.length?1:0);
})().catch(e=>{stopMocks();console.error(e);process.exit(1);});
