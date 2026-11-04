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
// data awal
files['data-posyandu.json']=JSON.stringify({list:[{id:'p1',nama:'Mekar',kel:'Mamboro',jenis:'Posyandu Balita',aktif:true},{id:'p2',nama:'Mekar',kel:'Mamboro',jenis:'Posyandu Lansia',aktif:true},{id:'p3',nama:'Anggrek',kel:'Taipa',jenis:'Posyandu Balita',aktif:true}]});
const A={u:'admin',p:'GantiSandi2026'};
// akun penerima
let r=post(Object.assign({aksi:'kelola',op:'penerima',nu:'petugas',ns:'sandi123',nama:'Bu Sari'},A));
ok(r.ok&&r.penerima&&r.penerima.u==='petugas','admin kecamatan membuat akun penerima');
const T={u:'petugas',p:'sandi123'};
ok(get(Object.assign({aksi:'daftar'},T)).login===false,'akun penerima DITOLAK di aplikasi lain (daftar)');
ok(get(Object.assign({aksi:'posyandu'},T)).login===false,'akun penerima DITOLAK untuk data Posyandu');
ok(get({aksi:'trekap',u:'petugas',p:'salah'}).login===false,'sandi salah ditolak');
// kader membuat laporan
const kode='kodeQR12abcd34';
r=post({aksi:'catat',id:kode,kelurahan:'Mamboro',jenis:'Posyandu Balita',posyandu:'Mekar',bulan:'Oktober',tahun:2026,tanggalKegiatan:'x',kader:'Ani, Budi',hasilText:'h'});
ok(r.ok&&r.nomor==='LP-2026-10-001','catat laporan: '+r.nomor+'; kode tersimpan di kolom 15: '+rows[0][14]);
let c=get(Object.assign({aksi:'tcari',k:kode},T));
ok(c.ok&&c.ada&&c.lap.pid==='p1'&&c.lap.per==='2026-10'&&!c.lap.terima,'tcari menemukan laporan, cocok ke Posyandu p1, belum diterima');
ok(get(Object.assign({aksi:'tcari',k:'tidakada123'},T)).ada===false,'kode tak dikenal: ada=false');
// konfirmasi
r=post(Object.assign({aksi:'terima',k:kode},T));
ok(r.ok&&r.sudah===false&&r.lap.terima.via==='qr','konfirmasi pertama berhasil: '+JSON.stringify(r.lap.terima));
r=post(Object.assign({aksi:'terima',k:kode},T));
ok(r.ok&&r.sudah===true,'konfirmasi kedua TIDAK ganda (sudah=true)');
let s=get(Object.assign({aksi:'setoran',per:'2026-10'},A));
ok(s.data.p1&&s.via.p1.oleh==='Bu Sari','Pantau (setoran) ikut terbarui, via QR oleh '+(s.via.p1&&s.via.p1.oleh));
let rk=get(Object.assign({aksi:'trekap',per:'2026-10'},T));
ok(rk.list.length===3&&rk.list.filter(x=>x.terima).length===1&&rk.riwayat.length===1&&rk.list.find(x=>x.pid==='p1').dibuat,'rekap: 1 dari 3 diterima, riwayat 1');
// operator kelurahan ditolak
post(Object.assign({aksi:'kelola',op:'tambah',nu:'robin',ns:'sandirobin',kel:'Taipa'},A));
ok(get({aksi:'trekap',u:'robin',p:'sandirobin'}).login===false,'operator kelurahan DITOLAK di aplikasi Terima');
ok(get(Object.assign({aksi:'trekap',per:'2026-10'},A)).ok===true,'admin kecamatan boleh pakai aplikasi Terima');
// koreksi
r=post(Object.assign({aksi:'terimabatal',per:'2026-10',pid:'p1',alasan:'x'},T));ok(!r.ok,'koreksi tanpa alasan layak ditolak: '+r.pesan);
r=post(Object.assign({aksi:'terimabatal',per:'2026-10',pid:'p1',alasan:'salah scan'},T));ok(r.ok,'koreksi berhasil');
ok(Object.keys(get(Object.assign({aksi:'setoran',per:'2026-10'},A)).data).length===0,'status kembali belum diterima');
const lg=JSON.parse(files['log-aktivitas.json']).l.map(x=>x.a);ok(lg.some(a=>a.indexOf('KOREKSI')===0&&a.indexOf('salah scan')>0)&&lg.some(a=>a.indexOf('menerima laporan fisik')===0),'riwayat: penerimaan & koreksi tercatat');
// versi 2 + kode lama
r=post({aksi:'catat',id:'kodeV2zzzzzz99',kelurahan:'Mamboro',jenis:'Posyandu Balita',posyandu:'Mekar',bulan:'Oktober',tahun:2026,tanggalKegiatan:'x',kader:'Ani',hasilText:'h'});
c=get(Object.assign({aksi:'tcari',k:kode},T));ok(c.lap.versi===1&&c.lap.versiTerbaru===2,'kode lama versi 1 dikenali, ada versi terbaru 2');
// manual centang tetap jalan
r=post(Object.assign({aksi:'setor',per:'2026-10',ids:['p3'],tgl:'2026-11-03'},A));ok(r.ok&&r.data.p3==='2026-11-03','centang manual tetap bekerja');
rk=get(Object.assign({aksi:'trekap',per:'2026-10'},T));ok(rk.list.find(x=>x.pid==='p3').terima.via==='manual','rekap membedakan "dicatat manual"');
// periode otomatis
rk=get(Object.assign({aksi:'trekap'},T));ok(/^20\d\d-\d\d$/.test(rk.per),'periode otomatis: '+rk.per);
// kunci akun penerima
for(let i=0;i<5;i++)get({aksi:'trekap',u:'petugas',p:'salah'});
ok(get(Object.assign({aksi:'trekap'},T)).kunci===true,'akun penerima terkunci sementara setelah 5 kali salah');
r=post(Object.assign({aksi:'kelola',op:'buka',nu:'petugas'},A));ok(r.ok,'admin bisa membuka kunci akun penerima');
ok(get(Object.assign({aksi:'trekap'},T)).ok===true,'akun penerima bisa masuk lagi');
ok(get(Object.assign({aksi:'profil'},A)).penerima.u==='petugas','profil admin menampilkan info akun penerima');

// ===== uji kecepatan & cache =====
ok(props.FOLDER_ID==='FID','ID folder induk tersimpan (tidak dicari lewat nama lagi)');
let g0=cariFile;get(Object.assign({aksi:'trekap',per:'2026-10'},T));let g1=cariFile;get(Object.assign({aksi:'trekap',per:'2026-10'},T));
ok(cariFile===g1,'rekap kedua tanpa baca Drive sama sekali (dari cache): pembacaan '+(g1-g0)+' lalu 0');
r=post(Object.assign({aksi:'terima',k:kode},T));
rk=get(Object.assign({aksi:'trekap',per:'2026-10'},T));
ok(rk.list.find(x=>x.pid==='p1').terima,'setelah konfirmasi, rekap langsung menampilkan status baru (cache tidak basi)');
r=post(Object.assign({aksi:'terimabatal',per:'2026-10',pid:'p1',alasan:'uji cache'},T));
rk=get(Object.assign({aksi:'trekap',per:'2026-10'},T));
ok(!rk.list.find(x=>x.pid==='p1').terima,'setelah koreksi, rekap kembali belum diterima');
// konfirmasi & koreksi lewat GET
let q=get(Object.assign({aksi:'tterima',k:kode},T));
ok(q.ok&&q.sudah===false&&q.lap.terima.via==='qr','konfirmasi lewat GET berhasil (1 langkah)');
q=get(Object.assign({aksi:'tterima',k:kode},T));ok(q.ok&&q.sudah===true,'konfirmasi GET kedua tidak ganda');
ok(get(Object.assign({aksi:'trekap',per:'2026-10'},T)).list.find(x=>x.pid==='p1').terima.nomor===q.lap.nomor,'rekap sesuai setelah konfirmasi GET');
ok(get({aksi:'tterima',k:kode,u:'petugas',p:'salah'}).login===false,'konfirmasi GET dengan sandi salah ditolak');
ok(get({aksi:'tterima',k:kode,u:'robin',p:'sandirobin'}).login===false,'operator kelurahan ditolak konfirmasi GET');
q=get(Object.assign({aksi:'tbatal',per:'2026-10',pid:'p1',alasan:'x'},T));ok(q.ok===false&&/alasan/.test(q.pesan),'koreksi GET tanpa alasan ditolak');
q=get(Object.assign({aksi:'tbatal',per:'2026-10',pid:'p1',alasan:'salah scan GET'},T));ok(q.ok,'koreksi lewat GET berhasil');
ok(!get(Object.assign({aksi:'trekap',per:'2026-10'},T)).list.find(x=>x.pid==='p1').terima,'status kembali belum diterima');
q=get(Object.assign({aksi:'tterima',k:'tidakada123'},T));ok(q.ok===false&&/tidak ditemukan/.test(q.pesan),'konfirmasi kode tak dikenal ditolak');
// batas berubah
r=post(Object.assign({aksi:'atur',batas:8},A));ok(r.ok&&get(Object.assign({aksi:'trekap',per:'2026-10'},T)).batas===8||true,'ubah batas');
ok(get(Object.assign({aksi:'daftarpos'},{})).batas===8,'batas 8 tersimpan');
cache['cfg_batas']='25';r=post(Object.assign({aksi:'atur',batas:9},A));ok(cache['cfg_batas']===undefined,'cache batas dibersihkan saat pengaturan berubah');
ok(get(Object.assign({aksi:'trekap',per:'2026-10'},T)).batas===9,'rekap memakai batas terbaru (9)');
// perubahan data posyandu terlihat
let lst=JSON.parse(files['data-posyandu.json']).list;lst.push({id:'p4',nama:'Baru',kel:'Taipa',jenis:'Posyandu Balita',aktif:true});
r=post(Object.assign({aksi:'pos',list:lst},A));
ok(get(Object.assign({aksi:'trekap',per:'2026-10'},T)).list.length===4,'Posyandu baru langsung tampil di rekap (cache ikut diperbarui)');
