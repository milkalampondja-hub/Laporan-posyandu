const {chromium}=require('/home/claude/.npm-global/lib/node_modules/@playwright/test');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:390,height:844}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('https://script.google.com/**',r=>{
 const cb=new URL(r.request().url()).searchParams.get('cb');
 const d=[{n:'LP-2026-10-001',tk:'20/10/2026 15:02:17',thn:'2026',bln:'Oktober',kel:'Taipa',pos:'Melati 1',jenis:'Posyandu Balita',tgl:'20 Oktober 2026',ver:1,pdf:true},
 {n:'LP-2026-10-002',tk:'20/10/2026 15:03:12',thn:'2026',bln:'Oktober',kel:'Taipa',pos:'Melati 1',jenis:'Posyandu Balita',tgl:'20 Oktober 2026',ver:2,pdf:false},
 {n:'LP-2026-10-003',tk:'20/10/2026 16:00:00',thn:'2026',bln:'Oktober',kel:'Mamboro',pos:'Mawar',jenis:'Posyandu Lansia',tgl:'19 Oktober 2026',ver:1,pdf:true}];
 r.fulfill({contentType:'application/javascript',body:cb+'('+JSON.stringify({ok:true,data:d})+');'});
});
await p.goto('file:///home/claude/laporan-posyandu/pantau.html');
await p.waitForTimeout(800);
console.log(await p.innerText('#tot'),'|',await p.innerText('#mx'));
console.log((await p.innerText('#ls')).slice(0,300));
await p.screenshot({path:'/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/shots/pantau.png',fullPage:true});
await b.close();})();
