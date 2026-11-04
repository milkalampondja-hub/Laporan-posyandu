const vm=require('vm'),fs=require('fs'),crypto=require('crypto');
const code=fs.readFileSync('/home/claude/laporan-posyandu/apps-script/Code.gs','utf8');
const props={},cache={},files={};
function mkFile(n){return {getName:()=>n,getBlob:()=>({getDataAsString:()=>files[n]}),setContent:c=>{files[n]=c},setTrashed:()=>{delete files[n]},getSize:()=>(files[n]||'').length,getId:()=>n}}
const folder={getId:()=>'FID',getFilesByName:n=>{cariFile++;const a=files[n]!==undefined?[mkFile(n)]:[];let i=0;return{hasNext:()=>i<a.length,next:()=>a[i++]}},createFile:(n,c)=>{files[n]=c;return mkFile(n)},getFoldersByName:n=>({hasNext:()=>true,next:()=>folder})};
let rows=[];let cariFile=0;
const sheet={getLastRow:()=>rows.length+1,getRange:(r,c,nr,nc)=>({getValues:()=>rows.slice(r-2,r-2+nr).map(x=>x.slice(c-1,c-1+nc)),setValues(){},setValue(){}}),appendRow:r=>rows.push(r)};
const ctx={console,JSON,Math,Date,parseInt,String,Object,Array,Error,RegExp,
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]===undefined?null:props[k],setProperty:(k,v)=>{props[k]=v}})},
 CacheService:{getScriptCache:()=>({get:k=>cache[k]===undefined?null:cache[k],put:(k,v)=>{cache[k]=v},removeAll:ks=>ks.forEach(k=>delete cache[k])})},
 LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
 DriveApp:{getFoldersByName:n=>({hasNext:()=>true,next:()=>folder}),getFolderById:i=>{if(i!=='FID')throw new Error('x');return folder}},
 MimeType:{PLAIN_TEXT:'t'},
 Utilities:{sleep(){},getUuid:()=>crypto.randomUUID(),Charset:{UTF_8:1},DigestAlgorithm:{SHA_256:1},computeDigest:(a,t)=>Array.from(crypto.createHash('sha256').update(t).digest()).map(x=>x>127?x-256:x),
  formatDate:(d,z,f)=>{const p=n=>String(n).padStart(2,'0');return f.replace('yyyy',d.getFullYear()).replace('MM',p(d.getMonth()+1)).replace('dd',p(d.getDate())).replace('HH',p(d.getHours())).replace('mm',p(d.getMinutes()))}},
 Session:{getScriptTimeZone:()=>'Asia/Makassar'},
 ContentService:{MimeType:{JSON:1,JAVASCRIPT:2},createTextOutput:t=>({t,setMimeType(){return this}})},
 HtmlService:{createHtmlOutput:h=>({h})}};
vm.createContext(ctx);vm.runInContext(code,ctx);
vm.runInContext("lembar=function(){return __sheet}",ctx);ctx.__sheet=sheet;
const get=q=>{const o=ctx.doGet({parameter:Object.assign({cb:'cb'},q)});return JSON.parse(o.t.replace(/^cb\(|\);$/g,''))};
let n=0;const post=d=>{d.id=d.id||('r'+(++n)+'abcdefgh');d.t=d.id;ctx.doPost({parameter:{data:JSON.stringify(d)}});return JSON.parse(cache['hasil_a_'+d.id]||cache['hasil_c_'+d.id]||cache['hasil_s_'+d.id])};
const ok=(c,m)=>console.log((c?'OK   ':'GAGAL')+' '+m);
files['data-posyandu.json']=JSON.stringify({list:[
 {id:'p1',nama:'Mekar',kel:'Mamboro',jenis:'Posyandu Balita',aktif:true},{id:'p2',nama:'Asoka',kel:'Mamboro',jenis:'Posyandu Balita',aktif:true},
 {id:'p3',nama:'Teratai',kel:'Mamboro',jenis:'Posyandu Balita',aktif:true},{id:'p4',nama:'Anggur',kel:'Taipa',jenis:'Posyandu Lansia',aktif:true}]});
const A={u:'admin',p:'GantiSandi2026'};
post(Object.assign({aksi:'kelola',op:'penerima',nu:'petugas',ns:'sandi123',nama:'Bu Sari'},A));
post(Object.assign({aksi:'kelola',op:'tambah',nu:'mamb',ns:'sandimamb',kel:'Mamboro'},A));
post(Object.assign({aksi:'kelola',op:'tambah',nu:'taip',ns:'sanditaip',kel:'Taipa'},A));
const T={u:'petugas',p:'sandi123'},M={u:'mamb',p:'sandimamb'},TP={u:'taip',p:'sanditaip'};
const lapor=(id,pos,bln)=>post({aksi:'catat',id:id,kelurahan:'Mamboro',jenis:'Posyandu Balita',posyandu:pos,bulan:bln||'Oktober',tahun:2026,tanggalKegiatan:'x',kader:'Ani',hasilText:'h'});
let r=lapor('kodemekar12345','Mekar');ok(r.ok,'kader Mekar kirim laporan');rows[rows.length-1][13]='PDF tersimpan';
r=lapor('kodeasoka12345','Asoka');ok(r.ok,'kader Asoka kirim laporan');rows[rows.length-1][13]='PDF tersimpan';
// Teratai belum mengirim
let L=post(Object.assign({aksi:'lembar',per:'2026-10'},M));
ok(L.ok&&/^L[A-Z0-9]{10}$/.test(L.lembar.kode),'operator Mamboro membuat lembar: '+(L.lembar&&L.lembar.kode));
const st=x=>L.lembar.items.find(i=>i.pid===x).st;
ok(st('p1')==='ikut'&&st('p2')==='ikut'&&st('p3')==='belum','Mekar & Asoka ikut, Teratai belum mengirim');
// kunci: kirim ulang ditolak
r=lapor('kodemekar2xxxxx','Mekar');ok(!r.ok&&/sudah dicetak/.test(r.pesan||''),'kirim ulang Mekar DITOLAK: '+(r.pesan||'').slice(0,50));
r=lapor('kodeteratai1234','Teratai');ok(r.ok,'Teratai (belum terkunci) tetap bisa kirim');rows[rows.length-1][13]='PDF tersimpan';
r=lapor('kodemekarokt11','Mekar','November');ok(r.ok,'bulan lain (November) tidak terkunci');
// operator lain tidak boleh
r=post(Object.assign({aksi:'bukalaporan',per:'2026-10',pid:'p1',alasan:'uji'},TP));ok(!r.ok,'operator Taipa tidak boleh membuka laporan Mamboro: '+r.pesan);
// info lembar untuk Terima
let c=get(Object.assign({aksi:'tlembar',k:L.lembar.kode},T));
ok(c.ok&&c.ada&&c.lembar.items.length===3,'Terima menemukan lembar dengan 3 baris');
ok(get(Object.assign({aksi:'tlembar',k:L.lembar.kode},M)).login===false,'operator kelurahan tidak boleh memakai Terima');
// konfirmasi: hanya p1 (petugas membuang centang p2)
let q=get(Object.assign({aksi:'tlterima',k:L.lembar.kode,ids:'p1'},T));
ok(q.ok&&q.baru===1,'konfirmasi lembar: 1 laporan tercatat (p2 tidak dicentang)');
let s=get(Object.assign({aksi:'setoran',per:'2026-10'},A));ok(s.data.p1&&!s.data.p2&&s.via.p1.oleh==='Bu Sari','Pantau: p1 diterima via lembar, p2 belum');
q=get(Object.assign({aksi:'tlterima',k:L.lembar.kode,ids:'p1,p2'},T));ok(q.ok&&q.baru===1,'pemindaian ulang menambah p2 saja, p1 tidak ganda');
q=get(Object.assign({aksi:'tlterima',k:L.lembar.kode,ids:'p1,p2'},T));ok(q.ok&&q.baru===0,'pemindaian ketiga: tidak ada yang baru');
ok(Object.keys(get(Object.assign({aksi:'setoran',per:'2026-10'},A)).data).length===2,'total 2 laporan diterima');
// teratai tidak dalam lembar pertama -> tidak bisa lewat lembar itu
q=get(Object.assign({aksi:'tlterima',k:L.lembar.kode,ids:'p3'},T));ok(q.ok&&q.baru===0,'Teratai tidak ikut lembar lama, tidak tercatat');
// buka kembali laporan yang sudah diterima ditolak
r=post(Object.assign({aksi:'bukalaporan',per:'2026-10',pid:'p1',alasan:'uji coba'},M));ok(!r.ok&&/sudah diterima/.test(r.pesan),'tidak bisa buka kembali yang sudah diterima: '+r.pesan);
// lembar baru: Teratai ikut, yang diterima otomatis "diterima"
let L2=post(Object.assign({aksi:'lembar',per:'2026-10'},M));
const st2=x=>L2.lembar.items.find(i=>i.pid===x).st;
ok(L2.ok&&st2('p3')==='ikut'&&st2('p1')==='diterima'&&st2('p2')==='diterima','lembar susulan: Teratai ikut, 2 lainnya "diterima"');
q=get(Object.assign({aksi:'tlterima',k:L.lembar.kode,ids:'p3'},T));ok(q.ok===false&&/diganti/.test(q.pesan),'lembar lama sudah diganti ditolak: '+q.pesan);
q=get(Object.assign({aksi:'tlterima',k:L2.lembar.kode,ids:'p3'},T));ok(q.ok&&q.baru===1,'lembar susulan: Teratai tercatat');
// tahan + buka kembali
lapor('kodeasoka99999','Asoka','Desember');rows[rows.length-1][13]='PDF tersimpan';
let L3=post(Object.assign({aksi:'lembar',per:'2026-12',tahan:['p2']},M));
ok(!L3.ok,'lembar tanpa laporan siap ikut ditolak: '+L3.pesan);
lapor('kodemekar99999','Mekar','Desember');rows[rows.length-1][13]='PDF tersimpan';
L3=post(Object.assign({aksi:'lembar',per:'2026-12',tahan:['p2']},M));
ok(L3.ok&&L3.lembar.items.find(i=>i.pid==='p2').st==='tahan'&&L3.lembar.items.find(i=>i.pid==='p1').st==='ikut','Asoka ditahan, Mekar ikut');
r=lapor('kodeasoka88888','Asoka','Desember');ok(r.ok,'laporan yang ditahan tidak terkunci, kader boleh kirim ulang');
r=lapor('kodemekar88888','Mekar','Desember');ok(!r.ok,'Mekar Desember terkunci');
r=post(Object.assign({aksi:'bukalaporan',per:'2026-12',pid:'p1',alasan:'ada salah ketik'},M));ok(r.ok,'kelurahan membuka kembali Mekar Desember');
r=lapor('kodemekar77777','Mekar','Desember');ok(r.ok,'setelah dibuka kembali, kader bisa kirim ulang');
q=get(Object.assign({aksi:'tlterima',k:L3.lembar.kode,ids:'p1,p2'},T));ok(q.ok&&q.baru===0&&q.lewati.length>=1,'laporan yang dibuka/berubah dilewati saat konfirmasi: '+JSON.stringify(q.lewati));
// daftar lembar & kunci untuk Pantau
let lk=get(Object.assign({aksi:'lembarkel',per:'2026-10'},M));ok(lk.ok&&lk.kel==='Mamboro'&&lk.lembar.length===2&&lk.kunci.p1,'Pantau: daftar lembar dan kunci terbaca');
lk=get(Object.assign({aksi:'lembarkel',per:'2026-10',kel:'Taipa'},A));ok(lk.ok&&lk.kel==='Taipa'&&lk.lembar.length===0,'admin kecamatan bisa melihat kelurahan lain');
ok(get(Object.assign({aksi:'lembarkel',per:'2026-10'},{u:'x',p:'y'})).login===false,'tanpa login ditolak');
// batas kelurahan
r=post(Object.assign({aksi:'atur',batasKel:15},A));ok(r.ok&&get(Object.assign({aksi:'profil'},A)).batasKel===15,'batas kelurahan tersimpan (15)');
r=post(Object.assign({aksi:'atur',batasKel:40},A));ok(!r.ok,'batas kelurahan 40 ditolak');
r=post(Object.assign({aksi:'atur',batasKel:12},M));ok(!r.ok,'operator tidak boleh mengubah batas kelurahan');
const lg=JSON.parse(files['log-aktivitas.json']).l.map(x=>x.a);ok(lg.some(a=>/membuat lembar pengantar Mamboro/.test(a))&&lg.some(a=>/membuka kembali laporan/.test(a)),'catatan perubahan mencatat lembar dan buka kembali');
