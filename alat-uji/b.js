var BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],BATAS=8;function esc(s){return s}
function batasHtml(){
  if(!(BATAS>=1&&BATAS<=31))return "";
  /* Laporan bulan X dikumpulkan paling lambat tanggal BATAS di bulan berikutnya. Sampai tanggal batas, yang dikumpulkan masih bulan lalu. */
  /* Dari tanggal 1 sampai tanggal batas, dua bulan laporan terbuka sekaligus (bulan lalu dan bulan berjalan). */
  var n=new Date(),y=n.getFullYear(),m=n.getMonth(),out="";
  if(n.getDate()<=BATAS){var py=m===0?y-1:y,pm=m===0?11:m-1;out+=batasSatu(n,pm,py)}
  return out+batasSatu(n,m,y);
}
function batasSatu(n,m,y){
  var dm=(m+1)%12,dy=m===11?y+1:y,akhir=new Date(dy,dm+1,0).getDate(),tg=Math.min(BATAS,akhir);
  var a=new Date(n.getFullYear(),n.getMonth(),n.getDate()),b=new Date(dy,dm,tg),sisa=Math.round((b-a)/86400000),kls="ok",teks;
  var lap="laporan "+BULAN[m],tgl=tg+" "+BULAN[dm];
  if(sisa>7){teks="Batas "+lap+": "+tgl+" · tinggal "+sisa+" hari"}
  else if(sisa>3){kls="mep";teks="Batas "+lap+": "+tgl+" · tinggal "+sisa+" hari"}
  else if(sisa>0){kls="dekat";teks="Segera buat "+lap+" · tinggal "+sisa+" hari (batas "+tgl+")"}
  else if(sisa===0){kls="dekat";teks="Hari ini batas terakhir "+lap+" ("+tgl+")"}
  else{kls="lewat";teks="Batas "+lap+" ("+tgl+") sudah lewat, buat laporan secepatnya"}
  return '<div class="batas '+kls+'" role="status"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>'+esc(teks)+'</span></div>';
}

[[2026,9,3],[2026,9,25],[2026,10,1],[2026,10,9],[2027,0,3]].forEach(function(t){var R=Date;global.Date=function(a,b,c){return arguments.length?new R(a,b,c):new R(t[0],t[1],t[2])};Date.prototype=R.prototype;console.log(t.join('-'));console.log(batasHtml().replace(/<svg.*?<\/svg>/g,'').replace(/<[^>]+>/g,'|'));global.Date=R})