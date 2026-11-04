const fs=require("fs");let src=fs.readFileSync('apps-script/Code.gs','utf8');
global.rows=[[1,'',2026,'Oktober','Taipa','Posyandu Beringin','Posyandu Balita'],[2,'',2026,'Oktober','Mamboro Barat','bougenvile','Posyandu Lansia'],[3,'',2026,'Oktober','Taipa','Anggur ','Posyandu Lansia']];
global.Session={getScriptTimeZone:()=> 'Asia/Makassar',getEffectiveUser:()=>({getEmail:()=>'x'})};
global.Utilities={formatDate:(d,z,f)=>f=='M'?'10':f=='yyyy'?'2026':'x'};
global.HEADER=new Array(14);
src+=';global.lembar=()=>({getLastRow:()=>4,getRange:()=>({getValues:()=>rows})});global.out={b:belumKirimBulanIni(),h:null};out.h=htmlBelumKirim(out.b);';
(0,eval)(src);
console.log(out.b.jumlahBelum,out.b.total);console.log(out.h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,500));
