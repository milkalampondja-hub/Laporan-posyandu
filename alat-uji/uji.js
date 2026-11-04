var BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],BATAS=8;
function batasTgl(th, bl) {var m = BULAN.indexOf(bl), ny = +th + (m === 11 ? 1 : 0), nm = (m + 1) % 12, last = new Date(ny, nm + 1, 0).getDate();return new Date(ny, nm, Math.min(BATAS, last), 23, 59, 59);}
function periodeAktif(now){var y=now.getFullYear(),m=now.getMonth();if(now.getDate()<=BATAS){m--;if(m<0){m=11;y--}}return BULAN[m]+' '+y}
[[2026,9,25],[2026,10,1],[2026,10,8],[2026,10,9],[2027,0,5],[2027,0,9]].forEach(function(t){console.log(t.join('-'),'aktif:',periodeAktif(new Date(t[0],t[1],t[2])))});
console.log(batasTgl(2026,'Oktober').toDateString(),batasTgl(2026,'Desember').toDateString());
