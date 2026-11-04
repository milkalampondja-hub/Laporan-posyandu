const fs=require('fs'),vm=require('vm');
const store={};
let now=1700000000000;
const ctx={
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>store[k]??null,setProperty:(k,v)=>{store[k]=v}})},
 Utilities:{sleep(){},computeDigest:(a,t)=>Array.from(Buffer.from(require('crypto').createHash('sha256').update(t).digest())).map(x=>x>127?x-256:x),DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1}},
 Date:class extends Date{constructor(...a){a.length?super(...a):super(now)}static now(){return now}},
 console, JSON, Math, Object, String, Array, parseInt, RegExp, Error, Number, Boolean
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8'),ctx);
const run=c=>vm.runInContext(c,ctx);
run("PANTAU_SANDI='rahasia'");
// buat operator
run("simpanAdmin({robin: hashAdmin('robin','sandi123')}); simpanKelAdmin({robin:'Taipa'})");
function coba(u,p){return run(`(function(){var w=masuk(${JSON.stringify(u)},${JSON.stringify(p)});return w?{ok:true}:gagalLogin()})()`)}
function tampil(l,r){console.log(l.padEnd(34),JSON.stringify(r).slice(0,170))}
for(let i=1;i<=5;i++) tampil('robin salah '+i,coba('robin','x'));
tampil('robin benar saat terkunci',coba('robin','sandi123'));
now+=6*60000; tampil('setelah 6 menit benar',coba('robin','sandi123'));
for(let i=1;i<=5;i++) coba('robin','x');   // 5 salah lagi -> 5 menit kedua? n=5 lagi
for(let i=1;i<=4;i++) {now+=6*60000; tampil('lanjut salah (n naik) '+i,coba('robin','x'));}
store.PANTAU_GAGAL=undefined;delete store.PANTAU_GAGAL;
let log=[];
for(let n=1;n<=21;n++){ const r=coba('robin','x'); log.push(n+':'+(r.kunci?(r.permanen?'PERM':r.pesan.match(/\d+ menit/)[0]):'salah')); if(r.kunci&&!r.permanen) now+=(parseInt(r.pesan.match(/(\d+) menit/)[1])+1)*60000; }
console.log(log.join(' '));
tampil('robin benar setelah permanen',coba('robin','sandi123'));
run("hapusGagal('robin')"); tampil('setelah dibuka',coba('robin','sandi123'));
// admin utama
let l2=[];for(let n=1;n<=22;n++){const r=coba('admin','x');l2.push(n+':'+(r.kunci?(r.permanen?'PERM':r.pesan.match(/\d+ menit/)[0]):'salah'));if(r.kunci&&!r.permanen) now+=(parseInt(r.pesan.match(/(\d+) menit/)[1])+1)*60000;}
console.log('utama:',l2.join(' '));
tampil('utama benar',coba('admin','rahasia'));
tampil('user tak dikenal x6',[1,2,3,4,5,6].map(()=>coba('hantu','x')).pop());
console.log('GAGAL keys:',Object.keys(JSON.parse(store.PANTAU_GAGAL||'{}')));
