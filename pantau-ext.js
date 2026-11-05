/* Pantau Laporan Posyandu - tambahan: banner geser, menu akun, Beranda, Rekapitulasi, Data Posyandu, Pengaturan lanjutan. */
(function () {
'use strict';
var RUANG = null, CAD = null, cadJalan = false;
var PENGUMUMAN = '', WABANTU = '', POS = [], SK = {}, BATAS = 25, BANNERS = ['', '', ''], POSDIMUAT = false;
var EXT_CSS = [
'.grid4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}',
'.stat{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px;min-width:0}',
'.stat b{display:block;font-size:26px;line-height:1.1}.stat span{font-size:12.5px;color:var(--muted)}',
'.stat.ok b{color:var(--ok)}.stat.warn b{color:var(--warn)}',
'.bar{height:12px;border-radius:99px;background:var(--none);overflow:hidden}.bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ffc800,#2fa04a)}',
'.barrow{margin:10px 0}.barrow .l{display:flex;justify-content:space-between;font-size:14px;margin-bottom:5px}',
'.chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}',
'.chip2{font-size:13px;padding:4px 10px;border-radius:99px;background:var(--warn-soft);color:var(--warn);font-weight:600}',
'.chip2.b{background:var(--accent-soft);color:var(--accent-text)}',
'.ok2{background:var(--ok-soft);color:var(--ok);border-radius:12px;padding:12px;font-weight:600}',
'.warn2{background:var(--warn-soft);color:var(--warn);border-radius:12px;padding:10px 12px;font-size:13.5px;margin:8px 0}',
'.cmp{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:4px;align-items:end;height:130px;margin:10px 0 4px}',
'.cmp div{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;font-size:10px;color:var(--muted)}',
'.cmp i{display:block;width:100%;max-width:22px;border-radius:5px 5px 0 0;background:#ffc800;min-height:2px}.cmp div.on i{background:#2fa04a}',
'.cmp small{margin-top:3px;font-size:10px}',
'.toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.toolbar .btn{min-height:42px;padding:6px 14px;font-size:14px}',
'#dpStat{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0}#dpStat .stat{padding:8px 6px}#dpStat .stat b{font-size:22px}#dpStat .stat span{font-size:11.5px;line-height:1.2;display:block}',
'.fl2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.fl2 select,.fl2 input{width:100%;min-height:44px;border:1.5px solid var(--line);border-radius:12px;padding:8px 10px;background:var(--surface);color:var(--fg);font-size:15px}.fl2 .full{grid-column:1/-1}',
'.pos{border:1px solid var(--line);border-radius:14px;margin-bottom:10px;background:var(--surface);overflow:hidden}',
'.pos.off{opacity:.65}',
'.pos>summary{list-style:none;cursor:pointer;padding:12px 14px}.pos>summary::-webkit-details-marker{display:none}',
'.pos .a{font-weight:700}.pos .b{font-size:13.5px;color:var(--muted)}',
'.pos .det{padding:0 14px 12px;font-size:14px}.pos .det table{font-size:14px}.pos .det th,.pos .det td{padding:6px 4px}',
'.pos .acts{display:flex;gap:8px;margin-top:10px}.pos .acts .btn{min-height:40px;padding:4px 14px;font-size:14px}',
'.skc{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;background:var(--surface)}',
'.skc .ic2{width:46px;height:46px;border-radius:12px;background:var(--accent-soft);color:var(--accent-text);display:grid;place-items:center;font-weight:800;flex:none}',
'.skc .t{flex:1;min-width:0}.skc .t b{display:block}.skc .t span{font-size:13px;color:var(--muted)}',
'.modal{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}',
'.modal .box{background:var(--bg);color:var(--fg);width:100%;max-width:640px;max-height:92vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px}',
'.modal.full .box{max-width:980px;height:94vh;display:flex;flex-direction:column;padding:10px}.modal.full iframe{flex:1;border:0;border-radius:10px;background:#fff;width:100%}',
'@media(min-width:700px){.modal{align-items:center}.modal .box{border-radius:18px}.grid4{grid-template-columns:repeat(4,minmax(0,1fr))}}',
'.krow{display:grid;grid-template-columns:1fr 100px 34px 34px;gap:6px;margin-bottom:6px;align-items:center}',
'.krow input[type=text]{min-height:40px;border:1.5px solid var(--line);border-radius:10px;padding:6px 8px;background:var(--surface);color:var(--fg);width:100%;font-size:14px}',
'.krow button{min-height:36px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--fg)}',
'.accpop{position:fixed;z-index:120;min-width:230px;background:var(--surface);color:var(--fg);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:6px}',
'.accpop .h{padding:10px 12px;border-bottom:1px solid var(--line);font-size:13px;color:var(--muted)}.accpop .h b{display:block;color:var(--fg);font-size:15px}',
'.accpop button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:none;color:var(--fg);padding:11px 12px;border-radius:10px;font-size:15px}',
'.accpop button:hover{background:var(--accent-soft)}',
'.acctbtn{cursor:pointer}.hchev{font-size:18px;flex:none;margin-left:auto}',
'.slots{display:grid;gap:10px}.slot{display:flex;align-items:center;gap:10px}.slot img,.slot .em{width:112px;height:64px;border-radius:10px;object-fit:cover;background:var(--none);flex:none;display:grid;place-items:center;font-size:12px;color:var(--muted)}',
'.slot .t{flex:1;min-width:0;font-size:14px}.slot .btn{min-height:38px;padding:4px 12px;font-size:13px}',
'.lt{font-size:13px;color:var(--muted)}',
'.dtbl{width:100%;border-collapse:collapse;font-size:14px}.dtbl th,.dtbl td{padding:8px 4px;border-bottom:1px solid var(--line);text-align:center}.dtbl th:first-child,.dtbl td:first-child{text-align:left}.dtbl tr:last-child td{border-bottom:0}',
'.dtbl td.pc{font-weight:700}',
'#app.isop #bm,#app.isop #bd{display:none!important}',
'#app.isop[data-view="b"] #panel{display:none}',
'#app.isop #secMx{display:none}',
'.opdl{display:none;gap:8px;margin:0 0 12px;flex-wrap:wrap}#app.isop .opdl{display:flex}.opdl .btn{min-height:40px;padding:4px 14px;font-size:14px}',
'.pengum{background:var(--accent-soft);color:var(--accent-text);border-radius:14px;padding:10px 14px;font-size:14px;margin-bottom:12px;font-weight:600}',
'.hm{border-radius:12px;padding:9px 12px;margin:10px 0 2px;font-weight:700;font-size:14px}.hm.ok{background:var(--ok-soft);color:var(--ok)}.hm.warn{background:var(--warn-soft);color:var(--warn)}',
'.prow{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:8px;background:var(--surface)}.prow .rt{display:flex;gap:8px;align-items:center}.prow .nm{flex:1;min-width:0}.prow .nm b{display:block}.prow .nm small{color:var(--muted);font-size:13px}',
'.prow .ct{display:flex;flex-wrap:wrap;gap:6px 8px;margin-top:8px;align-items:center;font-size:13.5px;color:var(--muted)}.prow .ct span{flex:1;min-width:140px}',
'@keyframes kedip{0%,100%{opacity:1}50%{opacity:.3}}.pill.kedip{animation:kedip 1.1s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.pill.kedip{animation:none}}',
'.ruang .rh{display:flex;align-items:center;gap:8px;margin-bottom:12px}.ruang .rh h4{margin:0;flex:1}',
'.chipst{font-size:12.5px;font-weight:800;padding:4px 10px;border-radius:99px;white-space:nowrap}.chipst.ok{background:var(--ok-soft);color:var(--ok)}.chipst.warn{background:var(--warn-soft);color:var(--warn)}.chipst.bad{background:#fde8e6;color:#b3261e}',
'.rg{display:flex;align-items:center;gap:16px}.donut{position:relative;width:108px;height:108px;flex:none}.donut svg{width:100%;height:100%;transform:rotate(-90deg)}.donut .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}.donut .c b{font-size:23px}.donut .c span{font-size:11px;color:var(--muted)}',
'.rg .tx{min-width:0}.rg .tx b{font-size:18px;display:block}.rg .tx span{color:var(--muted);font-size:13.5px;display:block;margin-top:2px}',
'.seg{display:flex;height:14px;border-radius:99px;overflow:hidden;background:var(--none);margin:14px 0 8px}.seg i{display:block;height:100%}',
'.leg{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;font-size:13px}.leg div{display:flex;align-items:center;gap:6px;min-width:0}.leg i{width:10px;height:10px;border-radius:3px;flex:none}.leg span{margin-left:auto;font-weight:700}',
'.est{margin-top:12px;font-size:13px;background:var(--accent-soft);color:var(--accent-text);border-radius:10px;padding:8px 10px;line-height:1.4}.fn2{margin-top:8px;font-size:12px;color:var(--muted)}',
'.cadr{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px}.cadr:last-child{border-bottom:0}.cadr span{flex:1}.cadr small{color:var(--muted)}',
'.btn.wa{background:#1fa855;color:#fff;border-color:#1fa855;text-decoration:none}.btn.sm.kc{min-height:36px;padding:3px 12px;font-size:13px}'
].join('\n');
var stl = document.createElement('style'); stl.textContent = EXT_CSS; document.head.appendChild(stl);

function $(i) { return document.getElementById(i); }
function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
function utama() { return PERAN === 'utama'; }
function isOp() { return !!KELSAYA && KELSAYA !== '-'; }
function J_B() { return 'Posyandu Balita'; } function J_L() { return 'Posyandu Lansia'; }
var JENIS = [J_B(), J_L()];
function kunci(kel, jenis, nama) {
  return [kel, jenis, String(nama || '').toLowerCase().replace(/posyandu/g, '').replace(/[^a-z0-9]/g, '').replace(/bougenv[a-z]*/, 'bougenvil')].join('|');
}
function aktifKader(p) { return (p.kader || []).filter(function (k) { return k.aktif !== false; }); }
var KELSAYA = '', SERVER_ALIAS = false, UBAH_BUKA = false, UBAH_MODE = '', IMPOR = null;
function dasarPos() { var l = POS.length ? POS : (window.SEED_POS || []); return KELSAYA ? l.filter(function (p) { return p.kel === KELSAYA; }) : l; }
window.terapKel = function (k) {
  KELSAYA = k || ''; try { pasangAs(); } catch (x) { }
  Array.prototype.forEach.call(document.getElementsByClassName('wil'), function (w) {
    w.textContent = '';
    if (KELSAYA && KELSAYA !== '-') {
      w.classList.add('op');
      var l1 = document.createElement('span'); l1.textContent = 'Kecamatan Palu Utara';
      var l2 = document.createElement('span'); l2.textContent = 'Kelurahan ' + KELSAYA;
      w.appendChild(l1); w.appendChild(l2);
    } else { w.classList.remove('op'); w.textContent = 'Kecamatan Palu Utara'; }
  });
  var op = !!KELSAYA, bb = $('btnBuat'), la = $('lnkApp'), ap = $('app'); if (ap) ap.classList.toggle('isop', op && KELSAYA !== '-');
  if (bb) { bb.style.display = op ? 'flex' : 'none'; var bk = $('btnBuatKel'); if (bk) bk.textContent = KELSAYA === '-' ? '' : KELSAYA; }
  if (la) la.style.display = op ? 'none' : '';
  KEL.length = 0; (KELSAYA ? [KELSAYA] : KEL_SEMUA).forEach(function (x) { KEL.push(x); });
  var fw = $('fkw'); if (fw) { var sk = !!KELSAYA && KELSAYA !== '-'; fw.style.display = sk ? 'none' : ''; if (sk && $('fk')) $('fk').value = ''; } var dk = $('dfk'); if (dk) dk.style.display = (!!KELSAYA && KELSAYA !== '-') ? 'none' : '';
};
function posAktif() { return dasarPos().filter(function (p) { return p.aktif !== false; }); }
function persen(a, b) { return b ? Math.round(a * 100 / b) : 0; }
function pilihEl(id, opts, val) { var s = $(id); s.textContent = ''; opts.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); }); if (val != null) s.value = val; }

/* ---------- perhitungan ---------- */
function tglKirim(d) { var m = /^(\d\d)\/(\d\d)\/(\d{4})/.exec(d.tk || ''); return m ? new Date(+m[3], +m[2] - 1, +m[1], 12) : null; }
/* Batas laporan bulan X jatuh pada tanggal BATAS di bulan berikutnya (laporan Oktober, batas 8 November). */
function batasTgl(th, bl) {
  var m = BULAN.indexOf(bl), ny = +th + (m === 11 ? 1 : 0), nm = (m + 1) % 12, last = new Date(ny, nm + 1, 0).getDate();
  return new Date(ny, nm, Math.min(BATAS, last), 23, 59, 59);
}
function teksBatas(th, bl) { var d = batasTgl(th, bl); return d.getDate() + ' ' + BULAN[d.getMonth()] + (d.getFullYear() !== +th ? ' ' + d.getFullYear() : ''); }
/* Bulan laporan yang sedang dikumpulkan: sampai tanggal batas masih bulan lalu, setelah itu bulan berjalan. */
function periodeAktif(now) {
  now = now || new Date(); var y = now.getFullYear(), m = now.getMonth();
  if (now.getDate() <= BATAS) { m--; if (m < 0) { m = 11; y--; } }
  return { bl: BULAN[m], th: String(y) };
}
window.periodeAktif = periodeAktif;
function hitung(th, bl) {
  var master = posAktif(), uniq = terbaru(DATA.filter(function (d) { return d.thn === String(th) && d.bln === bl; })), idx = {}, dikenal = {};
  uniq.forEach(function (d) { idx[kunci(d.kel, d.jenis, d.pos)] = d; });
  var batas = batasTgl(th, bl), now = new Date();
  var rows = master.map(function (p) {
    var k = kunci(p.kel, p.jenis, p.nama), d = idx[k], st;
    dikenal[k] = 1;
    (p.alias || []).forEach(function (a) { var ka = kunci(p.kel, p.jenis, a); dikenal[ka] = 1; if (!d && idx[ka]) d = idx[ka]; });
    if (d) { var tk = tglKirim(d); st = (tk && tk > batas) ? 'telat' : 'tepat'; }
    else st = now > batas ? 'lewat' : 'belum';
    return { p: p, d: d, st: st };
  });
  var asing = uniq.filter(function (d) { return !dikenal[kunci(d.kel, d.jenis, d.pos)]; });
  return { rows: rows, uniq: uniq, asing: asing, batas: batas,
    masuk: rows.filter(function (r) { return r.d; }), belum: rows.filter(function (r) { return !r.d; }),
    terlambat: rows.filter(function (r) { return r.st === 'telat' || r.st === 'lewat'; }) };
}
function sub(h, f) { var r = h.rows.filter(f); return { total: r.length, masuk: r.filter(function (x) { return x.d; }).length }; }
function pillSt(r) {
  var map = { tepat: ['ok', 'Laporan sudah masuk'], telat: ['w', 'Laporan masuk terlambat'], lewat: ['no', 'Laporan belum masuk (terlambat)'], belum: ['no', 'Laporan belum masuk'] };
  var x = map[r.st], sp = el('span', 'pill ' + (x[0] === 'ok' ? 'ok' : 'no'), x[1]); sp.style.whiteSpace = 'normal'; sp.style.textAlign = 'center'; sp.style.maxWidth = '12.5em'; sp.style.lineHeight = '1.25';
  if (r.st === 'tepat' || r.st === 'telat') { sp.style.background = 'var(--ok-soft)'; sp.style.color = 'var(--ok)'; }
  else if (r.st === 'lewat') { sp.style.background = 'var(--warn-soft)'; sp.style.color = 'var(--warn)'; }
  return sp;
}
function periodeBeranda() {
  /* Ringkasan Beranda selalu untuk bulan laporan yang sedang dikumpulkan, tidak ikut filter di menu Laporan. */
  return periodeAktif(new Date());
}

/* ---------- banner geser ---------- */
var TEKS = [[['Bersama Wujudkan', 'Generasi Sehat'], ['Melalui Laporan Posyandu', 'yang Akurat dan Tepat Waktu']],
  [['Data yang Baik,', 'Layanan Lebih Baik'], ['Pantau laporan Posyandu', 'seluruh kelurahan di sini']],
  [['Sehat Bersama,', 'Kuat Bersama'], ['Terima kasih kepada seluruh', 'kader Posyandu Palu Utara']]];
function baris(parent, lines) { lines.forEach(function (t, i) { if (i) parent.appendChild(document.createElement('br')); parent.appendChild(document.createTextNode(t)); }); }
var bnIx = 0, bnT = null;
function fotoBanner() { var a = BANNERS.filter(Boolean); return a.length ? a : ['banner.jpg']; }
function bangunBanner() {
  var fs = fotoBanner();
  [$('bm'), $('bd')].forEach(function (box, bi) {
    if (!box) return;
    box.textContent = '';
    fs.forEach(function (f, i) {
      var sl = el('div', 'slide' + (i === 0 ? ' on' : '')), bt = el('div', 'bt');
      if (bi === 0) {
        var t = TEKS[i % 3], h = el('h2'), p = el('p'); baris(h, t[0]); baris(p, t[1]); bt.appendChild(h); bt.appendChild(p); bt.appendChild(el('div', 'bar1'));
      } else {
        var im = document.createElement('img'); im.src = 'logo.png'; im.alt = ''; bt.appendChild(im);
        var dv = el('div'); dv.appendChild(el('h2', null, 'PANTAU LAPORAN POSYANDU')); dv.appendChild(el('p', null, 'Meningkatkan pelayanan kesehatan masyarakat melalui data yang akurat dan tepat waktu.')); bt.appendChild(dv);
      }
      var ph = el('div', 'ph'); ph.style.backgroundImage = 'url("' + f + '")';
      sl.appendChild(bt); sl.appendChild(ph); box.appendChild(sl);
    });
    if (fs.length > 1) {
      var dots = el('div', 'bdots');
      fs.forEach(function (f, i) { var d = document.createElement('i'); if (i === 0) d.className = 'on'; d.addEventListener('click', function () { pilihBanner(i); mulaiBanner(); }); dots.appendChild(d); });
      box.appendChild(dots);
      var x0 = null;
      box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', function (e) {
        if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { pilihBanner(bnIx + (dx < 0 ? 1 : -1)); mulaiBanner(); }
      }, { passive: true });
    }
  });
  bnIx = 0; mulaiBanner();
}
function pilihBanner(n) {
  var jml = fotoBanner().length; bnIx = (n + jml) % jml;
  [$('bm'), $('bd')].forEach(function (box) {
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('.slide'), function (s, i) { s.classList.toggle('on', i === bnIx); });
    Array.prototype.forEach.call(box.querySelectorAll('.bdots i'), function (s, i) { s.classList.toggle('on', i === bnIx); });
  });
}
function mulaiBanner() { clearInterval(bnT); if (fotoBanner().length > 1) bnT = setInterval(function () { pilihBanner(bnIx + 1); }, 6000); }

/* ---------- menu akun ---------- */
function tutupMenu() { var o = document.querySelector('.accpop'); if (o) o.remove(); }
function bukaMenu(btn) {
  var ada = document.querySelector('.accpop'); if (ada) { ada.remove(); return; }
  var pop = el('div', 'accpop'), h = el('div', 'h'), b = el('b', null, PROFIL.nama || 'Admin Posyandu');
  h.appendChild(b); h.appendChild(document.createTextNode((PROFIL.nip ? 'NIP ' + PROFIL.nip : 'NIP belum diisi') + ' · ' + (utama() ? 'Admin kecamatan' : 'Petugas')));
  pop.appendChild(h);
  var b1 = el('button', null, 'Ubah profil'), b2 = el('button', null, 'Keluar dari akun');
  if (CRED && CRED.as) {
    var bk = el('button', null, 'Kembali ke admin kecamatan');
    bk.addEventListener('click', function (e) { e.stopPropagation(); tutupMenu(); gantiAs(''); });
    pop.appendChild(bk);
  } else if (utama() && ADM && ADM.length) {
    var bo = el('button', null, 'Masuk sebagai operator kelurahan');
    bo.addEventListener('click', function (e) { e.stopPropagation(); tutupMenu(); pilihOperator(); });
    pop.appendChild(bo);
  }
  b1.addEventListener('click', function (e) { e.stopPropagation(); tutupMenu(); go('p'); setTimeout(function () { var c = $('pvfoto'); if (c && c.closest('.card')) c.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); });
  b2.addEventListener('click', function (e) { e.stopPropagation(); tutupMenu(); keluar(); });
  pop.appendChild(b1); pop.appendChild(b2); document.body.appendChild(pop);
  var r = btn.getBoundingClientRect(), w = pop.offsetWidth;
  if (r.top > window.innerHeight * 0.6) { pop.style.bottom = (window.innerHeight - r.top + 6) + 'px'; pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px'; }
  else { pop.style.top = (r.bottom + 6) + 'px'; pop.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px'; }
}
document.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('.acctbtn');
  if (btn) { e.stopPropagation(); bukaMenu(btn); return; }
  if (!e.target.closest || !e.target.closest('.accpop')) tutupMenu();
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { tutupMenu(); tutupModal(); } });
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.tabbar button[data-t]'); if (!b) return;
  var bar = b.parentNode; Array.prototype.forEach.call(bar.children, function (x) { x.classList.toggle('on', x === b); });
  var tg = $(bar.getAttribute('data-for')); if (tg) tg.setAttribute(bar.getAttribute('data-attr'), b.getAttribute('data-t'));
});

/* ---------- masuk sebagai operator kelurahan (khusus admin kecamatan) ---------- */
function gantiAs(nama) {
  if (!CRED) return;
  if (nama) CRED.as = nama; else delete CRED.as;
  try { sessionStorage.setItem('pantau-cred', JSON.stringify(CRED)); } catch (x) { }
  location.reload();
}
function pilihOperator() {
  var box = el('div'), info = el('div', 'b', 'Pilih operator untuk dilihat. Anda masuk otomatis tanpa kata sandi, dan bisa kembali kapan saja lewat menu akun.');
  info.style.marginBottom = '10px'; box.appendChild(info);
  ADM.forEach(function (a) {
    var b = el('button', 'btn line', a.u + ' · Kelurahan ' + (a.kel || 'belum dipilih') + (a.nama ? ' · ' + a.nama : ''));
    b.type = 'button'; b.style.cssText = 'display:block;width:100%;text-align:left;margin-bottom:8px';
    b.addEventListener('click', function () { gantiAs(a.u); });
    box.appendChild(b);
  });
  bukaModal('Masuk sebagai operator', box);
}
function pasangAs() {
  var b = document.getElementById('barAs'), on = !!(CRED && CRED.as);
  if (!on) { if (b) b.remove(); return; }
  if (!b) {
    b = el('div'); b.id = 'barAs';
    b.style.cssText = 'position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));white-space:nowrap;transform:translateX(-50%);z-index:80;background:#1f2a44;color:#fff;border-radius:999px;padding:8px 8px 8px 16px;font-size:13px;font-weight:700;display:flex;gap:10px;align-items:center;box-shadow:0 4px 18px rgba(0,0,0,.35);max-width:94vw';
    var t = el('span'); t.id = 'barAsT'; var k = el('button', null, 'Kembali'); k.type = 'button';
    k.style.cssText = 'border:0;border-radius:999px;background:#ffc800;color:#3a2a00;font-weight:800;padding:6px 14px;cursor:pointer';
    k.addEventListener('click', function () { gantiAs(''); });
    b.appendChild(t); b.appendChild(k); document.body.appendChild(b);
  }
  document.getElementById('barAsT').textContent = 'Melihat sebagai ' + CRED.as;
}

/* ---------- modal ---------- */
function bukaModal(judul, isi, full) {
  tutupModal();
  var m = el('div', 'modal' + (full ? ' full' : '')), bx = el('div', 'box');
  var hd = el('div'); hd.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px';
  var h = el('h4', null, judul); h.style.cssText = 'flex:1;margin:0';
  var x = el('button', 'btn sm plain', 'Tutup'); x.type = 'button'; x.addEventListener('click', tutupModal);
  hd.appendChild(h); hd.appendChild(x); bx.appendChild(hd); bx.appendChild(isi); m.appendChild(bx);
  m.addEventListener('click', function (e) { if (e.target === m) tutupModal(); });
  m.id = 'modalExt'; document.body.appendChild(m); return bx;
}
function tutupModal() { var m = $('modalExt'); if (m) m.remove(); }

/* ---------- Beranda ---------- */
function tileStat(cls, n, lbl) { var d = el('div', 'stat ' + cls); d.appendChild(el('b', null, n)); d.appendChild(el('span', null, lbl)); return d; }
/* Di Pantau kecamatan, laporan baru dihitung masuk bila laporan digital sudah dikirim DAN laporan fisik sudah diterima. */
/* Masa peralihan: berkas fisik yang diterima tanpa laporan digital tetap dihitung masuk. Pilihan disimpan di perangkat ini (nanti bisa dipindah ke Code.gs). */
/* Pilihan kini disimpan di server (berlaku di semua perangkat). Simpanan di perangkat hanya cadangan sampai server menjawab. */
var FISIK_SRV = null;
function fisikSaja() { if (FISIK_SRV !== null) return FISIK_SRV; try { return localStorage.getItem('pantau_fisik_saja') !== '0'; } catch (e) { return true; } }
function setFisikSaja(v) { FISIK_SRV = !!v; try { localStorage.setItem('pantau_fisik_saja', v ? '1' : '0'); } catch (e) {} }
window.terapFisik = function (v) {
  if (v !== true && v !== false) return;   // server belum pernah menyimpan pilihan: pakai simpanan perangkat
  var ubah = FISIK_SRV !== v; setFisikSaja(v);
  if (ubah) { try { renderBeranda(); renderRekap(); renderKelAll(); } catch (e) {} }
};
function fisikTanda(r, pr) { return !!(SETOR[perKey(pr)] || {})[r.p.id]; }
function fisikOK(r, pr) { return !!((r.d || fisikSaja()) && fisikTanda(r, pr)); }
function lengkap(r, pr) { return isOp() ? !!r.d : fisikOK(r, pr); }
function pillKec(r, pr) {
  var pl = pillSt(r);
  if (!isOp() && fisikOK(r, pr) && !r.d) { pl.textContent = 'Fisik diterima, belum lewat aplikasi'; pl.style.background = 'var(--accent-soft)'; pl.style.color = 'var(--accent-text)'; }
  else if (!isOp() && !fisikOK(r, pr)) {
    if (r.d) { pl.textContent = 'Menunggu berkas fisik'; pl.style.background = 'var(--p-blue)'; pl.style.color = 'var(--ink-blue)'; }
    else if (fisikTanda(r, pr)) { pl.textContent = 'Menunggu laporan digital'; pl.style.background = 'var(--accent-soft)'; pl.style.color = 'var(--accent-text)'; }
  }
  return pl;
}
function renderBeranda() {
  var box = $('sumB'); if (!box) return; box.textContent = '';
  box.classList.toggle('bgrid', !isOp());
  var pr = periodeBeranda(), h = hitung(pr.th, pr.bl);
  if (isOp()) { berandaOp(box); return; }
  var c = el('div', 'card span2 hero2c');
  var SS = SETOR[perKey(pr)], MM = SS || {}, tot = h.rows.length;
  var lg = h.rows.filter(function (x) { return fisikOK(x, pr); }), pc2 = persen(lg.length, tot);
  var mf = h.rows.filter(function (x) { return x.d && !MM[x.p.id]; }).length;
  var bs = lg.filter(function (x) { return !x.d; }).length;
  var md = h.rows.filter(function (x) { return !x.d && MM[x.p.id]; }).length - bs;
  var belumN = Math.max(0, tot - lg.length - mf - Math.max(0, md));
  var hero = el('div', 'hero2');
  /* cincin kemajuan */
  var CC = 2 * Math.PI * 48, cin = el('div', 'cincin');
  cin.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="cn0" cx="60" cy="60" r="48"></circle><circle class="cn1" cx="60" cy="60" r="48" transform="rotate(-90 60 60)" stroke-dasharray="' + (SS ? (CC * lg.length / (tot || 1)).toFixed(1) : 0) + ' ' + CC.toFixed(1) + '"></circle></svg>';
  var ct = el('div', 'cin-t'); ct.appendChild(el('b', null, SS ? lg.length + '/' + tot : '\u2026')); ct.appendChild(el('small', null, SS ? pc2 + '%' : '')); cin.appendChild(ct);
  hero.appendChild(cin);
  /* tengah: judul, tiga angka, catatan */
  var mid = el('div', 'hmid'), lr = el('div', 'hlbl');
  lr.appendChild(el('span', null, ('Laporan ' + pr.bl + ' ' + pr.th).toUpperCase()));
  lr.appendChild(btn('Muat ulang data', 'sm plain', function () { if (typeof muat === 'function') muat(); }));
  mid.appendChild(lr);
  var tt = el('div', 'htt'); tt.appendChild(el('b', null, (SS ? lg.length : '\u2026') + ' dari ' + tot)); tt.appendChild(document.createTextNode(' Posyandu sudah masuk ke kecamatan')); mid.appendChild(tt);
  var k3 = el('div', 'kot3');
  [['g', lg.length, 'sudah masuk'], ['y', mf, 'menunggu berkas fisik'], ['r', belumN, 'belum masuk']].forEach(function (q) {
    var d = el('div', 'kot ' + q[0]); d.appendChild(el('b', null, SS ? String(q[1]) : '\u2026')); d.appendChild(el('span', null, q[2])); k3.appendChild(d);
  });
  mid.appendChild(k3);
  mid.appendChild(el('small', 'hnote', fisikSaja() ? 'Dihitung masuk bila berkas fisik sudah diterima kecamatan. Laporan digital menyusul.' : 'Dihitung masuk bila laporan digital dan berkas fisik sudah ada.'));
  hero.appendChild(mid);
  /* sisa waktu kader */
  var bt = batasTgl(pr.th, pr.bl), hr0 = new Date(); hr0.setHours(0, 0, 0, 0);
  var hari = Math.round((new Date(bt.getFullYear(), bt.getMonth(), bt.getDate()) - hr0) / 86400000);
  var sw = el('div', 'sisa' + (hari < 0 ? ' lewat' : ''));
  sw.appendChild(el('small', 'sl', hari < 0 ? 'BATAS KADER SUDAH LEWAT' : 'SISA WAKTU KADER'));
  sw.appendChild(el('b', null, hari < 0 ? Math.abs(hari) + ' hari' : (hari === 0 ? 'Hari ini' : hari + ' hari')));
  var s1 = el('span'); s1.appendChild(document.createTextNode('Batas kader mengirim: ')); s1.appendChild(el('em', 'nb', teksBatas(pr.th, pr.bl))); sw.appendChild(s1);
  var s2 = el('span', 'sl2'); s2.appendChild(document.createTextNode('Antar berkas fisik: ')); s2.appendChild(el('em', 'nb', teksBatasKel(pr.th, pr.bl))); sw.appendChild(s2);
  hero.appendChild(sw);
  c.appendChild(hero);
  if (SS) {
    var kt = [];
    if (bs > 0) kt.push(bs + ' di antaranya hanya berkas fisik (belum lewat aplikasi)');
    if (md > 0) kt.push(md + ' menunggu laporan digital');
    if (kt.length) c.appendChild(el('div', 'hasil2k', kt.join(' \u00b7 ')));
    if (!fisikSaja()) c.appendChild(el('div', 'hasil2k hasil2n', 'Masa peralihan dimatikan: laporan dihitung masuk bila digital dan berkas fisik sudah ada.'));
  }
  if (h.asing.length) c.appendChild(el('div', 'warn2', h.asing.length + ' laporan memakai nama Posyandu yang belum cocok dengan Data Posyandu, sehingga tidak dihitung. Periksa ejaan di menu Data Posyandu.'));
  if (!POS.length) c.appendChild(el('div', 'warn2', 'Memakai daftar Posyandu dari SK. ' + (utama() ? 'Buka menu Data Posyandu lalu tekan "Simpan daftar dari SK" agar bisa diubah.' : '')));
  box.appendChild(c);
  var c2 = el('div', 'card'); c2.appendChild(el('h4', null, 'Posyandu yang belum lengkap'));
  var blm = h.rows.filter(function (x) { return !fisikOK(x, pr); });
  if (!SS) c2.appendChild(el('div', 'lt', 'Memuat status penerimaan laporan fisik\u2026'));
  else if (!blm.length) c2.appendChild(el('div', 'ok2', 'Semua Posyandu sudah mengumpulkan laporan ' + pr.bl + ' ' + pr.th + '.'));
  if (SS) KEL.forEach(function (k) {
    var semua = h.rows.filter(function (r) { return r.p.kel === k; }); if (!semua.length) return;
    var l = blm.filter(function (r) { return r.p.kel === k; });
    var dt = document.createElement('details'), sm = document.createElement('summary'); dt.open = !!BELUM_OPEN[k]; dt.addEventListener('toggle', function () { BELUM_OPEN[k] = dt.open; });
    sm.className = 'kh'; sm.style.cssText = 'cursor:pointer;list-style:none';
    sm.appendChild(el('span', 'kht', k + ' (' + l.length + ' belum)')); sm.appendChild(el('small', 'kmasuk', (semua.length - l.length) + '/' + semua.length + ' masuk'));
    var bk = el('button', 'btn sm plain only-d bukakel', 'Buka \u203a'); bk.type = 'button';
    bk.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); pilihKel(k, ''); });
    sm.appendChild(bk); dt.appendChild(sm);
    if (!l.length) dt.appendChild(el('div', 'ok2', 'Semua Posyandu di kelurahan ini sudah mengumpulkan laporan.'));
    l.forEach(function (r) { dt.appendChild(barisPos(r, pr)); }); c2.appendChild(dt);
  });
  box.appendChild(c2);
  muatSetor(pr);
  if (utama()) kartuSetor(box, h, pr);
  pasangRuang();
  pasangPeng();
}
/* Kotak Drive dan kader pengganti dipindah dari Beranda: Drive ke Pengaturan, kader pengganti ke Data Posyandu. */
function pasangRuang() { var b = $('boxRuang'); if (!b) return; b.textContent = ''; if (utama()) kartuRuang(b); }
function pasangPeng() { var b = $('pengBox'); if (!b) return; b.textContent = ''; kaderPengganti(b); }
/* ---------- Penyerahan laporan ke kecamatan ---------- */
var SETOR = {}, SETOR_T = {}, SETOR_BUSY = 0, SETOR_OPEN = {}, BELUM_OPEN = {}, SETOR_VIA = {}, SETOR_MENUNGGU = false;
function perKey(pr) { var m = BULAN.indexOf(pr.bl) + 1; return pr.th + '-' + (m < 10 ? '0' : '') + m; }
function hariIni() { var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
function tglId(iso) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
function muatSetor(pr, paksa) {
  var k = perKey(pr); if (!CRED) return;
  if (!paksa && SETOR_T[k] && Date.now() - SETOR_T[k] < 60000) return;
  SETOR_T[k] = Date.now();
  jsonp({ aksi: 'setoran', u: CRED.u, p: CRED.p, per: k }, 20000).then(function (r) {
    if (r && r.ok && !SETOR_BUSY) { SETOR[k] = r.data || {}; SETOR_VIA[k] = r.via || {}; renderBeranda(); renderKelAll(); if (rkDibuat) renderRekap(); }
  }).catch(function () { SETOR_T[k] = 0; });
}
/* Catat atau batalkan penyerahan. Tampilan diperbarui lebih dulu, lalu dikirim ke server; bila gagal, kembali ke data server. */
function simpanSetor(pr, ids, tgl) {
  var k = perKey(pr), m = SETOR[k] = SETOR[k] || {};
  ids.forEach(function (id) { if (tgl) m[id] = tgl; else delete m[id]; });
  renderBeranda(); SETOR_BUSY++;
  kirimAtur({ aksi: 'setor', per: k, ids: ids, tgl: tgl }).then(function () {
    SETOR_BUSY--; if (!SETOR_BUSY) toast(tgl ? 'Penyerahan laporan dicatat.' : 'Catatan penyerahan dibatalkan.');
  }).catch(function (er) {
    SETOR_BUSY--; toast(er.message || 'Gagal menyimpan'); SETOR_T[k] = 0; if (!SETOR_BUSY) muatSetor(pr, true);
  });
}
function kartuSetor(box, h, pr) {
  var k = perKey(pr), M = SETOR[k] || {}, c = el('div', 'card'), tot = h.rows.length, n = h.rows.filter(function (r) { return M[r.p.id]; }).length;
  c.appendChild(el('h4', null, 'Penyerahan laporan ke kecamatan - ' + pr.bl + ' ' + pr.th));
  c.appendChild(el('div', 'lt', 'Centang Posyandu yang laporannya sudah disahkan kelurahan dan diserahkan ke kecamatan.'));
  var lkp = h.rows.filter(function (r) { return M[r.p.id] && r.d; }).length, mnt = n - lkp;
  c.appendChild(el('div', 'hm ' + (tot && lkp === tot ? 'ok' : 'warn'), n + ' dari ' + tot + ' fisik diterima \u00b7 ' + lkp + ' sudah lengkap dengan digital'));
  var tb = el('div', 'toolbar'); tb.appendChild(btn('Unduh PDF: belum menyerahkan', 'sm', function (ev) { unduhPoster(h, pr, 'pdf', ev.currentTarget); })); tb.appendChild(document.createTextNode(' ')); tb.appendChild(btn('Unduh gambar (untuk WhatsApp)', 'sm plain', function (ev) { unduhPoster(h, pr, 'png', ev.currentTarget); }));
  if (mnt > 0 || SETOR_MENUNGGU) { tb.appendChild(document.createTextNode(' ')); tb.appendChild(btn(SETOR_MENUNGGU ? 'Tampilkan semua' : 'Hanya yang menunggu digital (' + mnt + ')', 'sm plain', function () { SETOR_MENUNGGU = !SETOR_MENUNGGU; renderBeranda(); })); }
  c.appendChild(tb);
  KEL.forEach(function (kel) {
    var l = h.rows.filter(function (r) { return r.p.kel === kel && (!SETOR_MENUNGGU || (M[r.p.id] && !r.d)); }).sort(function (a, b) { return a.p.jenis.localeCompare(b.p.jenis) || a.p.nama.localeCompare(b.p.nama); });
    if (!l.length) return;
    var sudah = l.filter(function (r) { return M[r.p.id]; }).length, belum = l.filter(function (r) { return !M[r.p.id]; });
    var dt = document.createElement('details'), sm = document.createElement('summary'); dt.open = (kel in SETOR_OPEN) ? SETOR_OPEN[kel] : false;
    dt.addEventListener('toggle', function () { SETOR_OPEN[kel] = dt.open; });
    sm.className = 'kh'; sm.style.cssText = 'cursor:pointer;list-style:none'; sm.textContent = kel + ' (' + sudah + ' dari ' + l.length + ' sudah menyerahkan)';
    dt.appendChild(sm);
    if (belum.length) dt.appendChild(btn('Centang semua ' + kel, 'sm plain', function () { simpanSetor(pr, belum.map(function (r) { return r.p.id; }), hariIni()); }));
    l.forEach(function (r) {
      var tg = M[r.p.id], it = el('div', 'item'); it.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;flex-wrap:wrap';
      var lb = document.createElement('label'); lb.style.cssText = 'display:flex;align-items:center;gap:10px;flex:1;min-width:200px;min-height:44px;cursor:pointer';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!tg; cb.style.cssText = 'width:22px;height:22px;flex:none;accent-color:var(--ok)';
      cb.addEventListener('change', function () { simpanSetor(pr, [r.p.id], cb.checked ? hariIni() : ''); });
      var t = el('div'); t.appendChild(el('div', 'a', r.p.nama + ' (' + r.p.jenis.replace('Posyandu ', '') + ')'));
      var kt = el('div', 'b', r.d ? 'Sudah dibuat di aplikasi' : (tg ? (fisikSaja() ? 'Fisik diterima, belum lewat aplikasi' : 'Fisik diterima, menunggu laporan digital') : 'Belum dibuat di aplikasi'));
      if (tg && !r.d) { kt.style.color = 'var(--warn)'; kt.style.fontWeight = '700'; } t.appendChild(kt);
      lb.appendChild(cb); lb.appendChild(t); it.appendChild(lb);
      if (tg) {
        var di = document.createElement('input'); di.type = 'date'; di.value = tg; di.max = hariIni(); di.setAttribute('aria-label', 'Tanggal diserahkan ' + r.p.nama);
        di.style.cssText = 'min-height:40px;border:1.5px solid var(--line);border-radius:10px;padding:4px 8px;background:var(--surface);color:var(--fg);font-size:14px';
        di.addEventListener('change', function () { if (di.value) simpanSetor(pr, [r.p.id], di.value); });
        it.appendChild(di);
      }
      dt.appendChild(it);
    });
    c.appendChild(dt);
  });
  box.appendChild(c);
}
/* Poster pengingat: Posyandu yang belum menyerahkan laporan ke kecamatan. Digambar di kanvas, bisa diunduh sebagai gambar (untuk grup WhatsApp) atau PDF. */
function belumSetorData(h, pr) {
  var M = SETOR[perKey(pr)] || {}, hasil = { 'Posyandu Balita': [], 'Posyandu Lansia': [] };
  h.rows.filter(function (r) { return !M[r.p.id]; }).sort(function (x, y) {
    return KEL.indexOf(x.p.kel) - KEL.indexOf(y.p.kel) || x.p.nama.localeCompare(y.p.nama);
  }).forEach(function (r) { if (hasil[r.p.jenis]) hasil[r.p.jenis].push(r.p); });
  return hasil;
}
function gambarPoster(h, pr) {
  return new Promise(function (res, rej) {
    var logo = new Image(); logo.onerror = function () { logo = null; lanjut(); }; logo.onload = lanjut; logo.src = 'logo.png';
    var done = false;
    function lanjut() {
      if (done) return; done = true;
      try { res(lukis(logo)); } catch (er) { rej(er); }
    }
    function lukis(logo) {
      var D = belumSetorData(h, pr), W = 1536, M = 40, GAP = 40, PW = (W - 2 * M - GAP) / 2, RH = 48, TOP = 372, HB = 92, TH = 64;
      var n = Math.max(D['Posyandu Balita'].length, D['Posyandu Lansia'].length, 1), PH = HB + TH + n * RH + 6, H = Math.max(1024, TOP + PH + 210);
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var c = cv.getContext('2d');
      var NAVY = '#12264a', KUNING = '#ffcd1f', KUNING2 = '#fff1a8', F = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
      function rr(x, y, w, hh, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
      function fit(t, maxW, px, wt) { var s = px; do { c.font = wt + ' ' + s + 'px ' + F; if (c.measureText(t).width <= maxW || s <= 13) break; s -= 1; } while (true); while (c.measureText(t).width > maxW && t.length > 3) { t = t.slice(0, -2); } return t; }
      function spaced(t, x, y, gap) { var w = 0, i; for (i = 0; i < t.length; i++) w += c.measureText(t[i]).width + gap; var cx = x; for (i = 0; i < t.length; i++) { c.fillText(t[i], cx, y); cx += c.measureText(t[i]).width + gap; } return w; }
      // latar
      c.fillStyle = '#f9fafc'; c.fillRect(0, 0, W, H);
      var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#eef1f7'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = KUNING; c.beginPath(); c.moveTo(0, 0); c.lineTo(330, 0); c.quadraticCurveTo(170, 40, 120, 190); c.quadraticCurveTo(80, 300, 0, 330); c.closePath(); c.fill();
      c.fillStyle = '#ffe36b'; c.beginPath(); c.moveTo(0, 0); c.lineTo(200, 0); c.quadraticCurveTo(90, 50, 60, 150); c.quadraticCurveTo(40, 210, 0, 220); c.closePath(); c.fill();
      c.fillStyle = NAVY; c.beginPath(); c.moveTo(W - 520, 0); c.lineTo(W, 0); c.lineTo(W, 130); c.quadraticCurveTo(W - 220, 120, W - 520, 0); c.closePath(); c.fill();
      c.fillStyle = KUNING; c.beginPath(); c.moveTo(W - 330, 0); c.lineTo(W - 120, 0); c.quadraticCurveTo(W - 160, 70, W - 330, 0); c.closePath(); c.fill();
      c.fillStyle = KUNING; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H - 150); c.quadraticCurveTo(420, H - 60, 900, H - 100); c.quadraticCurveTo(1250, H - 130, W, H - 40); c.lineTo(W, H); c.closePath(); c.fill();
      c.fillStyle = NAVY; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H - 70); c.quadraticCurveTo(300, H - 20, 620, H - 55); c.quadraticCurveTo(900, H - 80, 1100, H); c.closePath(); c.fill();
      // kepala surat
      if (logo && logo.width) { var lh = 118, lw = lh * logo.width / logo.height; c.drawImage(logo, 100, 46, lw, lh); }
      c.fillStyle = NAVY; c.fillRect(278, 60, 3, 108);
      c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.font = '800 48px ' + F; c.fillText('KECAMATAN PALU UTARA', 312, 110);
      c.font = '700 34px ' + F; spaced('KOTA PALU', 314, 160, 9);
      // judul
      rr(190, 200, W - 380, 138, 69); c.fillStyle = NAVY; c.fill();
      c.textAlign = 'center'; c.fillStyle = '#ffffff'; c.font = '800 54px ' + F; c.fillText('POSYANDU YANG BELUM MEMASUKAN', W / 2, 262);
      c.fillStyle = KUNING; c.font = '800 66px ' + F; c.fillText('LAPORAN BULAN ' + pr.bl.toUpperCase(), W / 2, 322);
      c.strokeStyle = KUNING; c.lineWidth = 9; c.lineCap = 'round';
      [-0.6, 0, 0.6].forEach(function (a) {
        c.beginPath(); c.moveTo(150 - 26 * Math.cos(a), 270 + 26 * Math.sin(a)); c.lineTo(150 - 64 * Math.cos(a), 270 + 64 * Math.sin(a)); c.stroke();
        c.beginPath(); c.moveTo(W - 150 + 26 * Math.cos(a), 270 + 26 * Math.sin(a)); c.lineTo(W - 150 + 64 * Math.cos(a), 270 + 64 * Math.sin(a)); c.stroke();
      });
      // panel
      function orang(cx, cy, s, tinggi, tongkat) {
        c.fillStyle = NAVY; c.beginPath(); c.arc(cx, cy - 22 * s * tinggi, 8 * s, 0, 7); c.fill();
        c.beginPath(); c.moveTo(cx - 11 * s, cy + 24 * s * tinggi); c.lineTo(cx - 8 * s, cy - 10 * s * tinggi); c.quadraticCurveTo(cx, cy - 16 * s * tinggi, cx + 8 * s, cy - 10 * s * tinggi); c.lineTo(cx + 11 * s, cy + 24 * s * tinggi); c.closePath(); c.fill();
        if (tongkat) { c.strokeStyle = NAVY; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(cx + 15 * s, cy - 2 * s); c.lineTo(cx + 15 * s, cy + 26 * s * tinggi); c.stroke(); }
      }
      ['Posyandu Balita', 'Posyandu Lansia'].forEach(function (jn, ix) {
        var x0 = M + ix * (PW + GAP), data = D[jn], y0 = TOP;
        c.save(); c.shadowColor = 'rgba(18,38,74,.18)'; c.shadowBlur = 18; c.shadowOffsetY = 6; rr(x0, y0, PW, PH, 26); c.fillStyle = '#fff'; c.fill(); c.restore();
        c.save(); rr(x0, y0, PW, PH, 26); c.clip();
        var gg = c.createLinearGradient(0, y0, 0, y0 + HB); gg.addColorStop(0, '#ffe45c'); gg.addColorStop(1, KUNING); c.fillStyle = gg; c.fillRect(x0, y0, PW, HB);
        c.fillStyle = NAVY; c.font = '800 46px ' + F; c.textAlign = 'center'; c.fillText(jn.toUpperCase(), x0 + PW / 2 + 40, y0 + 60);
        var cw = [90, 300, PW - 390], ty = y0 + HB;
        c.fillStyle = NAVY; c.fillRect(x0, ty, PW, TH);
        c.fillStyle = '#fff'; c.font = '800 26px ' + F;
        c.fillText('NO', x0 + cw[0] / 2, ty + 41); c.fillText('NAMA POSYANDU', x0 + cw[0] + cw[1] / 2, ty + 41); c.fillText('KELURAHAN', x0 + cw[0] + cw[1] + cw[2] / 2, ty + 41);
        var rows = data.length ? data : [null];
        rows.forEach(function (p, k) {
          var yy = ty + TH + k * RH;
          c.fillStyle = k % 2 ? '#fbfcff' : '#ffffff'; c.fillRect(x0 + cw[0], yy, PW - cw[0], RH);
          c.fillStyle = KUNING2; c.fillRect(x0, yy, cw[0], RH);
          c.strokeStyle = 'rgba(18,38,74,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0, yy + RH); c.lineTo(x0 + PW, yy + RH); c.moveTo(x0 + cw[0], yy); c.lineTo(x0 + cw[0], yy + RH); c.moveTo(x0 + cw[0] + cw[1], yy); c.lineTo(x0 + cw[0] + cw[1], yy + RH); c.stroke();
          c.fillStyle = NAVY; c.textAlign = 'center';
          if (!p) { c.font = '700 24px ' + F; c.fillText('Semua sudah menyerahkan laporan', x0 + cw[0] + (PW - cw[0]) / 2, yy + 31); return; }
          c.font = '800 28px ' + F; c.fillText(String(k + 1), x0 + cw[0] / 2, yy + 33);
          var nm = fit(p.nama.toUpperCase(), cw[1] - 20, 25, 600); c.fillText(nm, x0 + cw[0] + cw[1] / 2, yy + 32);
          var al = 'KEL. ' + p.kel.toUpperCase();
          var ax = x0 + cw[0] + cw[1] + cw[2] / 2;
          c.font = '600 23px ' + F;
          if (c.measureText(al).width <= cw[2] - 20) c.fillText(al, ax, yy + 32);
          else {
            var kt = al.split(' '), sp = Math.ceil(kt.length / 2), l1 = kt.slice(0, sp).join(' '), l2 = kt.slice(sp).join(' ');
            if (kt.length > 3) { var best = 1, sel = 1e9; for (var q = 1; q < kt.length; q++) { c.font = '600 19px ' + F; var d1 = Math.abs(c.measureText(kt.slice(0, q).join(' ')).width - c.measureText(kt.slice(q).join(' ')).width); if (d1 < sel) { sel = d1; best = q; } } l1 = kt.slice(0, best).join(' '); l2 = kt.slice(best).join(' '); }
            c.fillText(fit(l1, cw[2] - 16, 19, 600), ax, yy + 21); c.fillText(fit(l2, cw[2] - 16, 19, 600), ax, yy + 41);
          }
        });
        c.restore();
        c.strokeStyle = KUNING; c.lineWidth = 4; rr(x0, y0, PW, PH, 26); c.stroke();
        // ikon bulat
        c.fillStyle = '#fff'; c.beginPath(); c.arc(x0 + 78, y0 + 46, 56, 0, 7); c.fill(); c.strokeStyle = KUNING; c.lineWidth = 6; c.stroke();
        if (ix === 0) { orang(x0 + 62, y0 + 48, 1.5, 1, false); orang(x0 + 98, y0 + 60, 1.1, .8, false); c.fillStyle = KUNING; c.beginPath(); c.arc(x0 + 108, y0 + 22, 7, 0, 7); c.fill(); }
        else { orang(x0 + 62, y0 + 48, 1.5, 1, false); orang(x0 + 96, y0 + 48, 1.5, 1, true); }
      });
      c.textAlign = 'center'; c.fillStyle = NAVY; c.font = '600 22px ' + F;
      var now = new Date();
      c.fillText('Per ' + now.getDate() + ' ' + BULAN[now.getMonth()] + ' ' + now.getFullYear() + ' • Batas pengumpulan laporan ' + pr.bl + ': ' + teksBatas(pr.th, pr.bl), W / 2, TOP + PH + 44);
      return cv;
    }
  });
}
function unduhBerkas(blob, nama) { var u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = nama; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); URL.revokeObjectURL(u); }, 5000); }
/* PDF satu halaman berisi gambar JPEG (dibuat sendiri, tidak memerlukan pustaka atau internet). */
function pdfDariKanvas(cv) {
  var b64 = cv.toDataURL('image/jpeg', 0.92).split(',')[1], bin = atob(b64), n = bin.length, jpg = new Uint8Array(n), i;
  for (i = 0; i < n; i++) jpg[i] = bin.charCodeAt(i);
  var w = Math.round(cv.width * 75) / 100, hh = Math.round(cv.height * 75) / 100, parts = [], off = [], len = 0;
  function add(x) { var bt = x; if (typeof x === 'string') { bt = new Uint8Array(x.length); for (var k = 0; k < x.length; k++) bt[k] = x.charCodeAt(k) & 255; } parts.push(bt); len += bt.length; }
  add('%PDF-1.4\n');
  off[1] = len; add('1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n');
  off[2] = len; add('2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n');
  off[3] = len; add('3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 ' + w + ' ' + hh + ']/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>\nendobj\n');
  off[4] = len; add('4 0 obj\n<</Type/XObject/Subtype/Image/Width ' + cv.width + '/Height ' + cv.height + '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ' + n + '>>\nstream\n'); add(jpg); add('\nendstream\nendobj\n');
  var cs = 'q ' + w + ' 0 0 ' + hh + ' 0 0 cm /Im0 Do Q';
  off[5] = len; add('5 0 obj\n<</Length ' + cs.length + '>>\nstream\n' + cs + '\nendstream\nendobj\n');
  var xr = len, x = 'xref\n0 6\n0000000000 65535 f \n';
  for (i = 1; i <= 5; i++) x += ('0000000000' + off[i]).slice(-10) + ' 00000 n \n';
  add(x + 'trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n' + xr + '\n%%EOF');
  return new Blob(parts, { type: 'application/pdf' });
}
function unduhPoster(h, pr, jenis, b) {
  var teks = b ? b.textContent : '', nama = 'Belum-menyerahkan-laporan-' + pr.bl + '-' + pr.th;
  if (b) { b.disabled = true; b.textContent = 'Menyiapkan…'; }
  gambarPoster(h, pr).then(function (cv) {
    if (jenis === 'png') {
      return new Promise(function (ok) { cv.toBlob(function (bl) { unduhBerkas(bl, nama + '.png'); toast('Gambar diunduh.'); ok(); }, 'image/png'); });
    }
    unduhBerkas(pdfDariKanvas(cv), nama + '.pdf'); toast('PDF diunduh.');
  }).catch(function (er) { toast('Gagal membuat gambar: ' + (er.message || er)); })
    .then(function () { if (b) { b.disabled = false; b.textContent = teks; } });
}
function kaderPengganti(box) {
  var pg = penggantiSementara();
  if (pg.length) {
    var c3 = el('div', 'card'); c3.appendChild(el('h4', null, 'Kader pengganti sementara'));
    c3.appendChild(el('div', 'lt', 'Menurut laporan terakhir tiap Posyandu. Segera urus perubahan SK. Setelah SK baru terbit, ubah nama kader di menu Data Posyandu.'));
    pg.forEach(function (x) {
      var it = el('div', 'item'); it.appendChild(el('div', 'a', x.p.nama + ' (' + x.p.jenis.replace('Posyandu ', '') + ') - ' + x.p.kel));
      x.pasangan.forEach(function (q) { it.appendChild(el('div', 'b', q.lama + ' digantikan ' + q.baru)); });
      it.appendChild(el('div', 'b', 'Tercatat di laporan ' + x.d.bln + ' ' + x.d.thn)); c3.appendChild(it);
    });
    box.appendChild(c3);
  }
}


/* ---------- Ruang Google Drive (admin kecamatan) ---------- */
function fmtB(b) {
  b = +b || 0;
  if (b >= 1073741824) return (b / 1073741824).toFixed(b >= 10737418240 ? 0 : 1).replace('.', ',') + ' GB';
  if (b >= 1048576) return (b / 1048576).toFixed(b >= 104857600 ? 0 : 1).replace('.', ',') + ' MB';
  if (b >= 1024) return Math.round(b / 1024) + ' KB';
  return b + ' B';
}
function fmtWaktu(ms) { var d = new Date(ms), z = function (n) { return (n < 10 ? '0' : '') + n; }; return z(d.getDate()) + '/' + z(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + z(d.getHours()) + '.' + z(d.getMinutes()); }
function hitungRuangKlien(btnEl, ket) {
  btnEl.disabled = true; ket.textContent = 'Menghitung ruang Drive, mohon tunggu…';
  kirimAtur({ aksi: 'ruang' }).then(function (r) { RUANG = r.ruang; renderBeranda(); })
    .catch(function (e) { btnEl.disabled = false; ket.textContent = 'Gagal: ' + e.message; });
}
function kartuRuang(box) {
  var c = el('div', 'card ruang'), rh = el('div', 'rh'); rh.appendChild(el('h4', null, 'Ruang Google Drive')); c.appendChild(rh);
  var ket = el('div', 'fn2');
  if (!RUANG) {
    c.appendChild(el('div', 'lt', 'Lihat berapa ruang Drive yang terpakai oleh PDF laporan dan cadangan, serta perkiraan sampai kapan ruangnya cukup.'));
    var b0 = btn('Hitung sekarang', 'sm', function () { hitungRuangKlien(b0, ket); }); b0.style.marginTop = '10px'; c.appendChild(b0); c.appendChild(ket); box.appendChild(c); return;
  }
  var R = RUANG, pakai = +R.pakai || 0, batas = +R.batas || 0, pct = batas > 0 ? Math.min(100, pakai * 100 / batas) : 0;
  var cls = pct < 60 ? 'ok' : pct < 85 ? 'warn' : 'bad', lbl = batas <= 0 ? 'Tanpa batas' : pct < 60 ? 'Aman' : pct < 85 ? 'Perlu diperhatikan' : 'Hampir penuh';
  rh.appendChild(el('span', 'chipst ' + cls, lbl));
  var rg = el('div', 'rg'), dn = el('div', 'donut'), NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 100 100');
  var warna = { ok: '#2fa04a', warn: '#e9a100', bad: '#d93025' }[cls], K = 2 * Math.PI * 40;
  [['var(--none)', K], [warna, K * pct / 100]].forEach(function (x, i) {
    var ci = document.createElementNS(NS, 'circle'); ci.setAttribute('cx', 50); ci.setAttribute('cy', 50); ci.setAttribute('r', 40); ci.setAttribute('fill', 'none'); ci.setAttribute('stroke', x[0]); ci.setAttribute('stroke-width', 11);
    if (i) { ci.setAttribute('stroke-dasharray', x[1] + ' ' + K); ci.setAttribute('stroke-linecap', 'round'); } sv.appendChild(ci);
  });
  var ct = el('div', 'c'); ct.appendChild(el('b', null, batas > 0 ? (pct < 10 ? pct.toFixed(1).replace('.', ',') : Math.round(pct)) + '%' : '∞')); ct.appendChild(el('span', null, 'terpakai'));
  dn.appendChild(sv); dn.appendChild(ct); rg.appendChild(dn);
  var tx = el('div', 'tx'); tx.appendChild(el('b', null, fmtB(pakai) + (batas > 0 ? ' dari ' + fmtB(batas) : ''))); tx.appendChild(el('span', null, batas > 0 ? 'Sisa ' + fmtB(Math.max(0, batas - pakai)) : 'Kuota tidak dibatasi'));
  tx.appendChild(el('span', null, 'Dipakai aplikasi ini: ' + fmtB(R.pdf + R.sk + R.cadangan + R.lain))); rg.appendChild(tx); c.appendChild(rg);
  var seg = [['PDF laporan', R.pdf, '#2fa04a'], ['SK Posyandu', R.sk, '#ffc800'], ['Cadangan', R.cadangan, '#3b82c4'], ['Data aplikasi', R.lain, '#9aa0a6']], tot = seg.reduce(function (n, x) { return n + (+x[1] || 0); }, 0) || 1;
  var bar = el('div', 'seg'); seg.forEach(function (x) { if (x[1] > 0) { var i = document.createElement('i'); i.style.width = (x[1] * 100 / tot) + '%'; i.style.background = x[2]; i.title = x[0]; bar.appendChild(i); } }); c.appendChild(bar);
  var lg = el('div', 'leg'); seg.forEach(function (x) { var d = el('div'), i = document.createElement('i'); i.style.background = x[2]; d.appendChild(i); d.appendChild(document.createTextNode(x[0])); d.appendChild(el('span', null, fmtB(x[1]))); lg.appendChild(d); }); c.appendChild(lg);
  var aktif = posAktif().length, rata = R.nPdf > 0 ? R.pdf / R.nPdf : 0, bln = aktif * rata, est = el('div', 'est');
  if (rata > 0 && batas > 0) {
    var cukup = (batas - pakai) / bln, tx2 = cukup > 120 ? 'lebih dari 10 tahun' : cukup >= 12 ? 'sekitar ' + (Math.round(cukup / 12 * 10) / 10).toString().replace('.', ',') + ' tahun' : 'sekitar ' + Math.max(0, Math.floor(cukup)) + ' bulan';
    est.textContent = 'Perkiraan: ' + aktif + ' Posyandu × ' + fmtB(rata) + ' = ' + fmtB(bln) + ' per bulan. Ruang cukup untuk ' + tx2 + '.';
  } else est.textContent = 'Perkiraan masa cukup akan muncul setelah ada PDF laporan tersimpan.';
  c.appendChild(est);
  ket.textContent = 'Diperbarui ' + fmtWaktu(R.tgl) + (R.sebagian ? ' · hitungan sebagian (berkas terlalu banyak)' : '') + '. Angka dari Google; kuota akun dipakai bersama layanan Google lainnya.';
  c.appendChild(ket);
  var b1 = btn('Perbarui', 'sm plain', function () { hitungRuangKlien(b1, ket); }); b1.style.marginTop = '10px'; c.appendChild(b1);
  box.appendChild(c);
}

/* ---------- Cadangan data (admin kecamatan) ---------- */
function tglCad(t) { var m = /^(\d{4})-(\d\d)-(\d\d)/.exec(t || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : t; }
function muatCadangan() {
  if (cadJalan || !CRED || !utama()) return; cadJalan = true;
  jsonp({ aksi: 'cadangan', u: CRED.u, p: CRED.p }).then(function (r) { cadJalan = false; if (r && r.ok) { CAD = r.cadangan || []; pasangCadangan(); } }).catch(function () { cadJalan = false; });
}
function pasangCadangan() {
  var c = $('cardCad'); if (!c) return; c.style.display = utama() ? '' : 'none'; if (!utama()) return;
  c.textContent = ''; c.appendChild(el('h4', null, 'Cadangan data'));
  c.appendChild(el('p', 'hint', 'Cadangan otomatis tiap Minggu dini hari, disimpan di folder Cadangan pada Drive (8 terakhir). Isinya data Posyandu, pengaturan, akun operator tanpa kata sandi, catatan perubahan, dan salinan rekap laporan.'));
  var st = el('div', 'st');
  if (CAD === null) { c.appendChild(el('div', 'lt', 'Memuat daftar cadangan…')); muatCadangan(); return; }
  var last = CAD[0], tua = last ? (Date.now() - new Date(last.tgl + 'T00:00:00').getTime()) / 86400000 : 999;
  if (!last) c.appendChild(el('div', 'warn2', 'Belum ada cadangan. Jalankan fungsi aktifkanCadangan sekali di Apps Script agar cadangan otomatis aktif, atau tekan Cadangkan sekarang.'));
  else if (tua > 9) c.appendChild(el('div', 'warn2', 'Cadangan terakhir ' + tglCad(last.tgl) + '. Cadangan otomatis mungkin belum aktif: jalankan fungsi aktifkanCadangan di Apps Script.'));
  else c.appendChild(el('div', 'ok2', 'Cadangan terakhir: ' + tglCad(last.tgl)));
  var bc = btn('Cadangkan sekarang', 'sm', function () {
    bc.disabled = true; st.textContent = 'Membuat cadangan…'; st.className = 'st';
    kirimAtur({ aksi: 'cadang' }).then(function (r) { CAD = r.cadangan || []; pasangCadangan(); toast('Cadangan tersimpan.'); }).catch(function (e) { bc.disabled = false; st.textContent = e.message; st.className = 'st bad'; });
  }); bc.style.margin = '10px 0'; c.appendChild(bc);
  CAD.forEach(function (x) {
    var r = el('div', 'cadr'), sp = el('span', null, tglCad(x.tgl)); sp.appendChild(document.createTextNode(' ')); sp.appendChild(el('small', null, fmtB(x.ukuran))); r.appendChild(sp);
    r.appendChild(btn('Pulihkan', 'sm plain', function () {
      if (!confirm('Pulihkan daftar Posyandu dari cadangan ' + tglCad(x.tgl) + '? Keadaan sekarang disimpan dulu sebagai cadangan baru.')) return;
      st.textContent = 'Memulihkan…'; st.className = 'st';
      kirimAtur({ aksi: 'pulih', berkas: x.id }).then(function (r2) { POS = r2.list || POS; CAD = r2.cadangan || CAD; POSOK = true; renderData(); renderBeranda(); pasangCadangan(); toast('Data Posyandu dipulihkan.'); }).catch(function (e) { st.textContent = e.message; st.className = 'st bad'; });
    })); c.appendChild(r);
  });
  c.appendChild(st);
}

/* ---------- Beranda khusus operator kelurahan ---------- */
function nomorWA(hp) { var n = String(hp || '').replace(/[^0-9]/g, ''); if (n.indexOf('62') === 0) return n; if (n.indexOf('0') === 0) return '62' + n.slice(1); if (n.indexOf('8') === 0) return '62' + n; return n; }
function namaKontak(p) { return p.hpJenis === 'perwakilan' && p.hpNama ? p.hpNama : (p.ketua || ''); }
function pesanWA(p, pr, lewat) {
  var j = new Date().getHours(), sapa = j < 11 ? 'pagi' : j < 15 ? 'siang' : j < 18 ? 'sore' : 'malam', nm = namaKontak(p), url;
  try { url = new URL('./', location.href).href; } catch (e) { url = ''; }
  return 'Selamat ' + sapa + ' Bapak/Ibu' + (nm ? ' ' + nm : '') + ', kami dari Kecamatan Palu Utara. Laporan ' + p.jenis + ' ' + p.nama + ' bulan ' + pr.bl + ' ' + pr.th +
    ' belum kami terima. Batas pembuatan laporan tanggal ' + teksBatas(pr.th, pr.bl) + (lewat ? ' sudah terlewat' : '') + '. Mohon segera dibuat lewat aplikasi laporan' + (url ? ': ' + url : '') + '\nTerima kasih.';
}
function hitungMundur(pr) {
  var now = new Date(), b = batasTgl(pr.th, pr.bl), sel = Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000), fmt = 'Batas pembuatan laporan ' + pr.bl + ': tanggal ' + teksBatas(pr.th, pr.bl) + ' · ';
  if (sel > 0) return { t: fmt + 'tinggal ' + sel + ' hari', c: sel > 3 ? 'ok' : 'warn' };
  if (sel === 0) return { t: fmt + 'hari ini hari terakhir', c: 'warn' };
  return { t: fmt + 'sudah lewat ' + (-sel) + ' hari', c: 'warn' };
}
/* Unduh PDF laporan yang sudah dibuat kader. PDF diambil lewat server setelah login, jadi berkas di Drive tidak perlu dibagikan ke umum. */
function unduhPdf(d, b) {
  if (!CRED || !d || !d.n) return;
  var teks = b.textContent; b.disabled = true; b.textContent = 'Menyiapkan…';
  jsonp({ aksi: 'pdf', u: CRED.u, p: CRED.p, n: d.n }, 90000).then(function (r) {
    if (!r || !r.ok) throw new Error((r && r.pesan) || 'PDF tidak bisa diunduh');
    var bin = atob(r.b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    var url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' })), a = document.createElement('a');
    a.href = url; a.download = r.nama || (d.n + '.pdf'); document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 5000);
    toast('PDF laporan diunduh.');
  }).catch(function (er) { toast(er.message || 'PDF tidak bisa diunduh'); })
    .then(function () { b.disabled = false; b.textContent = teks; });
}
window.unduhPdf = unduhPdf;
function tombolPdf(d) { return btn('Unduh PDF', 'sm kc plain', function (ev) { unduhPdf(d, ev.currentTarget || ev.target); }); }
function barisPos(r, pr) {
  var p = r.p, row = el('div', 'prow'), top = el('div', 'rt'), nm = el('div', 'nm');
  nm.appendChild(el('b', null, p.nama)); nm.appendChild(el('small', null, p.jenis.replace('Posyandu ', '') + (r.d ? ' \u00b7 dibuat ' + (r.d.tk || '').slice(0, 10) : '') + ((SETOR[perKey(pr)] || {})[p.id] ? ' \u00b7 sudah diserahkan ke kecamatan ' + tglId(SETOR[perKey(pr)][p.id]) + (((SETOR_VIA[perKey(pr)] || {})[p.id]) ? ' (dipindai QR oleh ' + SETOR_VIA[perKey(pr)][p.id].oleh + ')' : '') : '')));
  var pl = pillKec(r, pr); if (!r.d) pl.classList.add('kedip'); top.appendChild(nm); top.appendChild(pl); row.appendChild(top);
  var ct = el('div', 'ct'), n = nomorWA(p.hp);
  if (p.hp) ct.appendChild(el('span', null, (p.hpJenis === 'perwakilan' ? 'Perwakilan' : 'Ketua') + (namaKontak(p) ? ' ' + namaKontak(p) : '') + ' \u00b7 ' + p.hp));
  else ct.appendChild(el('span', null, 'Nomor HP belum diisi'));
  if (!r.d && p.hp) {
    var a = document.createElement('a'); a.className = 'btn sm kc wa'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ingatkan lewat WhatsApp';
    a.href = 'https://wa.me/' + n + '?text=' + encodeURIComponent(pesanWA(p, pr, r.st === 'lewat')); ct.appendChild(a);
  }
  if (r.d && r.d.pdf) ct.appendChild(tombolPdf(r.d));
  ct.appendChild(btn(p.hp ? 'Ubah nomor' : 'Isi nomor', 'sm kc plain', function () { formNomor(p); }));
  row.appendChild(ct); return row;
}
/* Dari tanggal 1 sampai tanggal batas, dua bulan laporan terbuka sekaligus (bulan lalu dan bulan berjalan). */
function periodeOpList() {
  var now = new Date(), y = now.getFullYear(), m = now.getMonth(), cur = { bl: BULAN[m], th: String(y) };
  if (now.getDate() > BATAS) return [cur];
  var py = m === 0 ? y - 1 : y, pm = m === 0 ? 11 : m - 1;
  return [{ bl: BULAN[pm], th: String(py) }, cur];
}
function berandaOp(box) {
  if (PENGUMUMAN) box.appendChild(el('div', 'pengum', PENGUMUMAN));
  var ps = periodeOpList();
  ps.forEach(function (pr, i) { muatSetor(pr); var h = hitung(pr.th, pr.bl); kartuOp(box, h, pr, persen(h.masuk.length, h.rows.length), ps.length > 1, i); });
  pasangPeng();
}
var OP_BUKA = {};
function kartuOp(box, h, pr, pc, dua, idx) {
  var c = el('div', 'card opc'), kp = perKey(pr); if (!(kp in OP_BUKA)) OP_BUKA[kp] = idx === 0;
  var hd = el('div', 'fold'), ht = el('div'); ht.appendChild(el('h4', null, 'Laporan ' + pr.bl + ' ' + pr.th));
  var tot = h.rows.length, msk = h.masuk.length, body = el('div', 'opb'), ar = el('span', 'ar', OP_BUKA[kp] ? '\u25BE' : '\u25B8');
  if (!OP_BUKA[kp] && dua) ht.appendChild(el('div', 'lt', msk + ' dari ' + tot + ' sudah membuat laporan \u00b7 ' + hitungMundur(pr).t));
  hd.appendChild(ht); if (dua) hd.appendChild(ar); c.appendChild(hd);
  if (dua) { hd.style.cursor = 'pointer'; hd.addEventListener('click', function () { OP_BUKA[kp] = !OP_BUKA[kp]; renderBeranda(); }); }
  if (!OP_BUKA[kp] && dua) { box.appendChild(c); return; }
  var SO = SETOR[kp] || {}, fs = h.rows.filter(function (x) { return !x.d && SO[x.p.id]; }).length, bl2 = Math.max(0, tot - msk - fs);
  var hero = el('div', 'hero2 h2op'), CC = 2 * Math.PI * 48, cin = el('div', 'cincin');
  cin.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="cn0" cx="60" cy="60" r="48"></circle><circle class="cn1" cx="60" cy="60" r="48" transform="rotate(-90 60 60)" stroke-dasharray="' + (CC * Math.max(0, Math.min(100, +pc || 0)) / 100).toFixed(1) + ' ' + CC.toFixed(1) + '"' + (+pc > 0 ? '' : ' style="display:none"') + '></circle></svg>';
  var ct = el('div', 'cin-t'); ct.appendChild(el('b', null, msk + '/' + tot)); ct.appendChild(el('small', null, pc + '%')); cin.appendChild(ct); hero.appendChild(cin);
  var mid = el('div', 'hmid'), tt = el('div', 'htt'); tt.appendChild(el('b', null, msk + ' dari ' + tot)); tt.appendChild(document.createTextNode(' Posyandu sudah membuat laporan')); mid.appendChild(tt);
  var k3 = el('div', 'kot3');
  [['g', msk, 'sudah membuat laporan'], ['y', fs, 'fisik saja'], ['r', bl2, 'belum kirim']].forEach(function (q) { var d = el('div', 'kot ' + q[0]); d.appendChild(el('b', null, String(q[1]))); d.appendChild(el('span', null, q[2])); k3.appendChild(d); });
  mid.appendChild(k3); hero.appendChild(mid); body.appendChild(hero);
  if (tot && msk === tot) body.appendChild(el('div', 'hm ok', 'Semua Posyandu sudah membuat laporan. Terima kasih.'));
  else { var hm = hitungMundur(pr); body.appendChild(el('div', 'hm ' + hm.c, hm.t)); }
  if (h.asing.length) body.appendChild(el('div', 'warn2', h.asing.length + ' laporan memakai nama Posyandu yang belum cocok dengan Data Posyandu, sehingga tidak dihitung.'));
  if (!tot) body.appendChild(el('div', 'empty', 'Belum ada Posyandu terdaftar untuk kelurahan ini.'));
  else kartuAntar(body, h, pr, true);
  c.appendChild(body); box.appendChild(c);
}
function formNomor(p) {
  var f = el('div');
  f.appendChild(el('div', 'lt', p.jenis + ' ' + p.nama + ' · ' + p.kel));
  var w1 = el('div', 'fld'); w1.appendChild(el('label', null, 'Nomor ini milik'));
  var sj = document.createElement('select'); sj.style.cssText = 'width:100%;min-height:50px;border:1.5px solid var(--line);border-radius:12px;padding:8px;background:var(--surface);color:var(--fg);font-size:16px';
  [['ketua', 'Ketua Posyandu'], ['perwakilan', 'Perwakilan Posyandu']].forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; sj.appendChild(op); });
  sj.value = p.hpJenis === 'perwakilan' ? 'perwakilan' : 'ketua'; w1.appendChild(sj); f.appendChild(w1);
  var w2 = el('div', 'fld'); w2.appendChild(el('label', null, 'Nama perwakilan')); var inN = document.createElement('input'); inN.type = 'text'; inN.maxLength = 60; inN.value = p.hpNama || ''; inN.placeholder = 'Nama yang memegang nomor ini'; w2.appendChild(inN); f.appendChild(w2);
  var w3 = el('div', 'fld'); w3.appendChild(el('label', null, 'Nomor HP / WhatsApp')); var inH = document.createElement('input'); inH.type = 'tel'; inH.inputMode = 'tel'; inH.maxLength = 20; inH.value = p.hp || ''; inH.placeholder = 'Contoh: 0812 3456 7890'; w3.appendChild(inH); f.appendChild(w3);
  function atur() { w2.style.display = sj.value === 'perwakilan' ? '' : 'none'; } sj.addEventListener('change', atur); atur();
  f.appendChild(el('div', 'lt', 'Nomor dipakai untuk mengirim pengingat lewat WhatsApp, dan juga terlihat oleh admin kecamatan. Kosongkan lalu simpan untuk menghapus.'));
  var er = el('div', 'st'); f.appendChild(er);
  var sv = btn('Simpan nomor', 'wide', function () {
    var hp = inH.value.trim();
    if (hp && hp.replace(/[^0-9]/g, '').length < 9) { er.textContent = 'Nomor HP terlalu pendek'; er.className = 'st bad'; return; }
    if (!POS.length) { er.textContent = 'Daftar Posyandu belum disimpan oleh admin kecamatan. Minta admin menyimpannya di menu Data Posyandu.'; er.className = 'st bad'; return; }
    sv.disabled = true; er.textContent = 'Menyimpan…'; er.className = 'st';
    kirimAtur({ aksi: 'nomor', pid: p.id, hp: hp, hpJenis: sj.value, hpNama: inN.value.trim() }).then(function (r) {
      if (r && r.list) POS = r.list; renderBeranda(); renderData(); tutupModal(); toast('Nomor tersimpan.');
    }).catch(function (e) { sv.disabled = false; er.textContent = e.message; er.className = 'st bad'; });
  });
  f.appendChild(sv); bukaModal('Nomor ketua atau perwakilan', f);
}
/* Posyandu yang laporan terakhirnya memuat "Nama (Pengganti — Kader Pengganti Sementara)". */
function penggantiSementara() {
  var akhir = {};
  DATA.forEach(function (d) { var k = kunci(d.kel, d.jenis, d.pos); if (!akhir[k] || d.n > akhir[k].n) akhir[k] = d; });
  var out = [];
  Object.keys(akhir).forEach(function (k) {
    var d = akhir[k], re = /([^,()]+?)\s*\(([^()]+?)\s+\u2014\s+Kader Pengganti Sementara\)/g, m, ps = [];
    while ((m = re.exec(d.kader || ''))) ps.push({ lama: m[1].trim(), baru: m[2].trim() });
    if (!ps.length) return;
    var p = dasarPos().filter(function (x) { return kunci(x.kel, x.jenis, x.nama) === k || (x.alias || []).some(function (a) { return kunci(x.kel, x.jenis, a) === k; }); })[0] || { nama: d.pos, kel: d.kel, jenis: d.jenis };
    out.push({ p: p, d: d, pasangan: ps });
  });
  return out.sort(function (a, b) { return a.p.kel.localeCompare(b.p.kel) || a.p.nama.localeCompare(b.p.nama); });
}

/* ---------- Rekapitulasi ---------- */
var rkDibuat = false;
function rkSiap() {
  var box = $('rkBox'); if (!box || rkDibuat) return; rkDibuat = true;
  box.innerHTML = '<div class="card"><div class="lhd"><div class="lht"><h4>Periode rekap</h4><small>Pilih bulan dan tahun, lalu cetak atau unduh</small></div><div class="rkctl"><div class="fl2"><select id="rb" aria-label="Bulan"></select><select id="rt" aria-label="Tahun"></select></div>' +
    '<div class="toolbar lact"><button class="btn sm" id="rkp" type="button">Cetak rekap (PDF)</button> <button class="btn sm line" id="rkx" type="button">Unduh rekap (Excel)</button></div></div></div></div>' +
    '<div class="tabbar" id="tabR" data-for="rkIsi" data-attr="data-rtab"><button type="button" class="on" data-t="ring">Ringkasan</button><button type="button" data-t="pos">Per Posyandu</button><button type="button" data-t="ang">Angka kegiatan</button></div><div id="rkIsi" data-rtab="ring"></div>';
  var now = new Date();
  var pa = periodeAktif(now);
  pilihEl('rb', BULAN.map(function (b) { return [b, b]; }), pa.bl);
  var th = {}; th[now.getFullYear()] = 1; th[pa.th] = 1; DATA.forEach(function (d) { if (d.thn) th[d.thn] = 1; });
  pilihEl('rt', Object.keys(th).sort().reverse().map(function (t) { return [t, t]; }), pa.th);
  $('rb').addEventListener('change', renderRekap); $('rt').addEventListener('change', renderRekap);
  $('rkx').addEventListener('click', unduhRekap); $('rkp').addEventListener('click', cetakRekap);
}
function barRow(lbl, a, b) { var pc = persen(a, b), r = el('div', 'barrow'), l = el('div', 'l'); l.appendChild(el('span', null, lbl)); l.appendChild(el('b', null, a + ' dari ' + b + ' · ' + pc + '%')); r.appendChild(l); var bar = el('div', 'bar'); bar.appendChild(document.createElement('i')).style.width = pc + '%'; r.appendChild(bar); return r; }
function tabel(heads, rows, pcCol) {
  var t = el('table', 'dtbl'), hd = el('tr'); heads.forEach(function (x) { hd.appendChild(el('th', null, x)); }); t.appendChild(hd);
  rows.forEach(function (r) { var tr = el('tr'); r.forEach(function (v, i) {
    if (i === pcCol && /^\d+%$/.test(v)) { var n = parseInt(v, 10), td = el('td', 'pc'); td.appendChild(el('span', 'pcp ' + (n === 0 ? 'p0' : n >= 100 ? 'p2' : 'p1'), v)); tr.appendChild(td); }
    else tr.appendChild(el('td', i === pcCol ? 'pc' : null, v));
  }); t.appendChild(tr); });
  var sc = el('div', 'scroll'); t.style.minWidth = '0'; sc.appendChild(t); return sc;
}
function rkData() {
  var bl = $('rb').value, th = $('rt').value, h = hitung(th, bl), bm = BULAN.indexOf(bl);
  var bulanan = BULAN.map(function (b, i) {
    var x = hitung(th, b), sb = sub(x, function (r) { return r.p.jenis === J_B(); }), sl = sub(x, function (r) { return r.p.jenis === J_L(); });
    return { b: b, i: i, x: x, sb: sb, sl: sl, tot: x.rows.length, m: x.masuk.length };
  });
  return { bl: bl, th: th, h: h, bm: bm, bulanan: bulanan };
}
function renderRekap() {
  rkSiap(); var isi = $('rkIsi'); if (!isi) return; isi.textContent = '';
  if (!ADA) { isi.appendChild(el('div', 'empty', 'Data belum dimuat.')); return; }
  var R = rkData(), h = R.h, now = new Date(), prR = { bl: R.bl, th: R.th };
  if (!isOp()) muatSetor(prR);
  var nt = el('div', 'lt rknote'); nt.setAttribute('data-tab', 'ring');
  if (!isOp()) { nt.textContent = 'Angka Balita, Lansia, dan Total di halaman ini adalah laporan digital yang sudah terkirim. Laporan yang resmi dihitung masuk (digital + fisik diterima kecamatan) tampil di Beranda dan di kolom "Fisik diterima" pada tabel per kelurahan.'; isi.appendChild(nt); }
  // 0 angka ringkas (operator)
  var cs = null;
  if (isOp()) {
    cs = el('div', 'card rkst');
    [['a', h.masuk.length + '/' + h.rows.length, 'Laporan masuk'], ['d', persen(h.masuk.length, h.rows.length) + '%', 'Capaian ' + R.bl], ['b', String(h.terlambat.length), 'Terlambat'], ['c', String(h.rows.length - h.masuk.length), 'Belum masuk']].forEach(function (x) {
      var d = el('div', x[0]); d.appendChild(el('b', null, x[1])); d.appendChild(document.createTextNode(x[2])); cs.appendChild(d);
    });
    isi.appendChild(cs);
  }
  // 1 per bulan
  var c1 = el('div', 'card'); c1.appendChild(el('h4', null, 'Rekap laporan per bulan - ' + R.th));
  c1.appendChild(tabel(['Bulan', 'Balita', 'Lansia', 'Total', '%'], R.bulanan.map(function (o) {
    var fut = +R.th > now.getFullYear() || (+R.th === now.getFullYear() && o.i > now.getMonth());
    if (fut) return [o.b, '-', '-', '-', '-'];
    return [o.b, o.sb.masuk + '/' + o.sb.total, o.sl.masuk + '/' + o.sl.total, o.m + '/' + o.tot, persen(o.m, o.tot) + '%'];
  }), 4)); isi.appendChild(c1);
  (function () {
    var trs = c1.querySelectorAll('tr');
    R.bulanan.forEach(function (o, i) {
      var tr = trs[i + 1]; if (!tr) return;
      var fut = +R.th > now.getFullYear() || (+R.th === now.getFullYear() && o.i > now.getMonth());
      if (fut || !o.m) tr.classList.add('nol'); if (o.i === R.bm) tr.classList.add('sel');
    });
    if (isOp()) {
      var kosong = [];
      for (var q = 0; q < R.bulanan.length && q < R.bm && !R.bulanan[q].m; q++) kosong.push(trs[q + 1]);
      if (kosong.length >= 2) {
        var td0 = kosong[0].children[0]; kosong[0].textContent = '';
        var tdk = el('td', 'gab', R.bulanan[0].b + ' - ' + R.bulanan[kosong.length - 1].b + ': belum ada laporan'); tdk.colSpan = 5; kosong[0].appendChild(tdk);
        for (var w = 1; w < kosong.length; w++) kosong[w].style.display = 'none';
      }
    }
  })();
  // 2 per kelurahan
  var c2 = el('div', 'card'); c2.appendChild(el('h4', null, 'Rekap laporan per kelurahan - ' + R.bl + ' ' + R.th));
  var op1 = isOp();
  var gt = { b: [0, 0], l: [0, 0] }, fisT = 0;
  var rowsK = KEL.map(function (k) {
    var a = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_B(); }), b = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_L(); });
    gt.b[0] += a.masuk; gt.b[1] += a.total; gt.l[0] += b.masuk; gt.l[1] += b.total;
    var fk = SETOR[perKey(prR)] ? h.rows.filter(function (r) { return r.p.kel === k && fisikTanda(r, prR); }).length : null; fisT += fk || 0;
    return [k, a.masuk + '/' + a.total, b.masuk + '/' + b.total, (a.masuk + b.masuk) + '/' + (a.total + b.total), persen(a.masuk + b.masuk, a.total + b.total) + '%', fk === null ? '\u2026' : fk + '/' + (a.total + b.total)];
  });
  rowsK.push(['JUMLAH', gt.b[0] + '/' + gt.b[1], gt.l[0] + '/' + gt.l[1], (gt.b[0] + gt.l[0]) + '/' + (gt.b[1] + gt.l[1]), persen(gt.b[0] + gt.l[0], gt.b[1] + gt.l[1]) + '%', SETOR[perKey(prR)] ? fisT + '/' + h.rows.length : '\u2026']);
  c2.appendChild(tabel(['Kelurahan', 'Balita', 'Lansia', 'Total', '%', 'Fisik diterima'], rowsK, 4)); (function () { var tr = c2.querySelectorAll('tr'); if (tr.length) tr[tr.length - 1].classList.add('jm'); })(); if (!op1) isi.appendChild(c2);
  // 3 persentase
  var c3 = el('div', 'card'); c3.appendChild(el('h4', null, 'Persentase laporan masuk'));
  c3.appendChild(barRow('Keseluruhan', h.masuk.length, h.rows.length));
  c3.appendChild(barRow('Posyandu Balita', gt.b[0], gt.b[1])); c3.appendChild(barRow('Posyandu Lansia', gt.l[0], gt.l[1]));
  if (!op1) isi.appendChild(c3);
  // 4 rekap posyandu
  var c4 = el('div', 'card rkpos'); c4.appendChild(el('h4', null, 'Rekap Posyandu Balita dan Lansia bulan ' + R.bl + ' ' + R.th));
  JENIS.forEach(function (j) {
    c4.appendChild(el('div', 'kh', j));
    KEL.forEach(function (k) {
      var l = h.rows.filter(function (r) { return r.p.kel === k && r.p.jenis === j; }); if (!l.length) return;
      c4.appendChild(el('div', 'lt', k + ' - ' + l.filter(function (r) { return r.d; }).length + ' dari ' + l.length + ' sudah masuk'));
      l.forEach(function (r) {
        var it = el('div', 'item rg-' + (r.st === 'tepat' || r.st === 'telat' ? 'g' : r.st === 'lewat' ? 'y' : 'r')); it.style.cssText = 'display:flex;align-items:center;gap:8px;padding:9px 12px';
        var t = el('div'); t.style.flex = '1'; t.appendChild(el('div', 'a', r.p.nama));
        if (r.d) t.appendChild(el('div', 'b', 'Dikirim ' + (r.d.tk || '-').slice(0, 10)));
        it.appendChild(t); it.appendChild(pillSt(r)); c4.appendChild(it);
      });
    });
  });
  isi.appendChild(c4);
  // 5 terlambat
  var c5 = el('div', 'card'); c5.appendChild(el('h4', null, 'Daftar Posyandu yang terlambat'));
  c5.appendChild(el('div', 'lt', 'Batas pengumpulan laporan ' + R.bl + ' ' + R.th + ': tanggal ' + teksBatas(R.th, R.bl) + '. Belum masuk setelah batas, atau dikirim setelah batas.'));
  if (!h.terlambat.length) c5.appendChild(el('div', 'ok2', 'Tidak ada Posyandu yang terlambat.'));
  h.terlambat.forEach(function (r) {
    var it = el('div', 'item'); it.appendChild(el('div', 'a', r.p.nama));
    var ket = r.p.kel + ' · ' + r.p.jenis.replace('Posyandu ', '');
    if (r.d) { var tk = tglKirim(r.d), hr = Math.max(1, Math.ceil((tk - h.batas) / 86400000)); ket += ' · terlambat ' + hr + ' hari (dikirim ' + (r.d.tk || '').slice(0, 10) + ')'; } else ket += ' · belum mengirim';
    it.appendChild(el('div', 'b', ket)); c5.appendChild(it);
  });
  isi.appendChild(c5);
  // 6 perbandingan
  var c6 = el('div', 'card'); c6.appendChild(el('h4', null, 'Perbandingan capaian antarbulan - ' + R.th));
  var cm = el('div', 'cmp');
  R.bulanan.forEach(function (o) {
    var fut = +R.th > now.getFullYear() || (+R.th === now.getFullYear() && o.i > now.getMonth());
    var d = el('div', o.i === R.bm ? 'on' : ''), pc = fut ? 0 : persen(o.m, o.tot);
    d.appendChild(el('small', null, fut ? '' : pc + '%')); var b = document.createElement('i'); b.style.height = Math.max(2, pc * 0.9) + 'px'; d.appendChild(b); d.appendChild(el('small', null, o.b.slice(0, 3)));
    cm.appendChild(d);
  });
  c6.appendChild(cm);
  var cur = R.bulanan[R.bm], prev = R.bm > 0 ? R.bulanan[R.bm - 1] : null;
  if (prev) {
    var dp = persen(cur.m, cur.tot) - persen(prev.m, prev.tot), arah = dp > 0 ? 'naik ' + dp : dp < 0 ? 'turun ' + Math.abs(dp) : 'tetap';
    c6.appendChild(el('div', dp >= 0 ? 'ok2' : 'warn2', R.bl + ': ' + cur.m + ' dari ' + cur.tot + ' laporan (' + persen(cur.m, cur.tot) + '%). ' + prev.b + ': ' + prev.m + ' dari ' + prev.tot + ' (' + persen(prev.m, prev.tot) + '%). Capaian ' + arah + (dp ? ' poin persen.' : '.')));
  }
  isi.appendChild(c6);
  // 7 angka
  var c7 = kartuAngka(isi);
  [[cs || c1, 'ring'], [c1, 'ring'], [c2, 'ring'], [c3, 'ring'], [c6, 'ring'], [c4, 'pos'], [c5, 'pos']].forEach(function (x) { x[0].setAttribute('data-tab', x[1]); });
}
/* ---------- Hasil laporan (angka kegiatan): filter sendiri, hanya dari laporan yang fisiknya sudah diterima ---------- */
var ANG = null;
function angDaftar() {
  var pr = { bl: ANG.bl, th: ANG.th }, h = hitung(pr.th, pr.bl);
  var rows = h.rows.filter(function (r) { return r.d && (!ANG.j || r.p.jenis === ANG.j) && (!ANG.k || r.p.kel === ANG.k); });
  if (isOp()) return { op: true, pakai: rows.map(function (r) { return r.d; }), n: rows.length, m: 0 };
  if (!SETOR[perKey(pr)]) { muatSetor(pr); return { muat: true, pakai: [], n: 0, m: 0 }; }
  var ok = rows.filter(function (r) { return fisikTanda(r, pr); });
  var tf = h.rows.filter(function (r) { return !r.d && fisikTanda(r, pr) && (!ANG.j || r.p.jenis === ANG.j) && (!ANG.k || r.p.kel === ANG.k); }).length;
  return { pakai: ok.map(function (r) { return r.d; }), n: ok.length, m: rows.length - ok.length, f: tf };
}
function angKet(a) {
  if (a.muat) return 'Memuat status penerimaan laporan fisik\u2026';
  if (a.op) return 'Dihitung dari semua laporan digital kelurahan Anda.';
  return a.n + ' laporan fisik diterima' + (a.m ? ', ' + a.m + ' lainnya menunggu berkas fisik.' : '.') + (a.f ? ' ' + a.f + ' laporan fisik belum punya data digital, angkanya tidak ikut dihitung.' : '');
}
function renderAngkaIsi() {
  var box = $('angTab'); if (!box) return; box.textContent = '';
  var a = angDaftar();
  $('angHd').textContent = 'Jumlah angka hasil kegiatan' + (ANG.k ? ' - ' + ANG.k : ' per kelurahan') + ' - ' + ANG.bl + ' ' + ANG.th;
  $('angKet').textContent = angKet(a);
  if (a.muat) return;
  jumlahTabel(box, a.pakai, ANG.k);
}
function kartuAngka(isi) {
  if (!ANG) { var pa = periodeAktif(new Date()); ANG = { bl: pa.bl, th: pa.th, j: '', k: '' }; }
  var c = el('div', 'card'); c.setAttribute('data-tab', 'ang');
  c.innerHTML = '<h4>Filter hasil laporan</h4><div class="fl2"><select id="angB" aria-label="Bulan"></select><select id="angT" aria-label="Tahun"></select><select id="angJ" aria-label="Jenis"></select><select id="angK" aria-label="Kelurahan"></select></div>' +
    '<div class="toolbar"><button class="btn sm" id="angX" type="button">Unduh angka kegiatan (Excel)</button></div>';
  isi.appendChild(c);
  var c2 = el('div', 'card'); c2.setAttribute('data-tab', 'ang');
  c2.innerHTML = '<h4 id="angHd"></h4><div class="lt" id="angKet"></div><div id="angTab"></div>';
  isi.appendChild(c2);
  var th = {}; th[String(new Date().getFullYear())] = 1; th[ANG.th] = 1; DATA.forEach(function (d) { if (d.thn) th[d.thn] = 1; });
  pilihEl('angB', BULAN.map(function (b) { return [b, b]; }), ANG.bl);
  pilihEl('angT', Object.keys(th).sort().reverse().map(function (t) { return [t, t]; }), ANG.th);
  pilihEl('angJ', [['', 'Semua jenis'], [J_B(), 'Balita'], [J_L(), 'Lansia']], ANG.j);
  pilihEl('angK', [['', 'Semua kelurahan']].concat(KEL.map(function (k) { return [k, k]; })), ANG.k);
  if (KEL.length < 2) $('angK').style.display = 'none';
  [['angB', 'bl'], ['angT', 'th'], ['angJ', 'j'], ['angK', 'k']].forEach(function (x) {
    $(x[0]).addEventListener('change', function () { ANG[x[1]] = this.value; renderAngkaIsi(); });
  });
  $('angX').addEventListener('click', unduhAngka);
  renderAngkaIsi();
  return c2;
}
function unduhAngka() {
  if (!ADA) { alert('Data belum dimuat.'); return; }
  var a = angDaftar(); if (a.muat) { alert('Status penerimaan laporan fisik masih dimuat. Coba lagi sebentar.'); return; }
  var bag = [], kl = ANG.k;
  ['Posyandu Balita', 'Posyandu Lansia'].forEach(function (j) {
    var fl = FIELD[j], sb = a.pakai.filter(function (d) { return d.jenis === j; }); if (!sb.length) return;
    var rows = [], gt = fl.map(function () { return 0; }), gl = 0;
    KEL.filter(function (k) { return !kl || k === kl; }).forEach(function (k) {
      var ds = sb.filter(function (d) { return d.kel === k; }), tot = fl.map(function () { return 0; });
      ds.forEach(function (d) { ambil(d).forEach(function (r) { fl.forEach(function (f, i) { if (r.v[f] !== '') tot[i] += r.v[f]; }); }); });
      var o = { Kelurahan: k, Laporan: ds.length }; fl.forEach(function (f, i) { o[f] = tot[i]; gt[i] += tot[i]; }); gl += ds.length; rows.push(o);
    });
    var jm = { Kelurahan: 'JUMLAH', Laporan: gl }; fl.forEach(function (f, i) { jm[f] = gt[i]; }); rows.push(jm);
    bag.push([j.replace('Posyandu ', ''), rows]);
  });
  if (!bag.length) { alert('Belum ada laporan untuk pilihan ini.'); return; }
  bag.push(['Keterangan', [{ Periode: ANG.bl + ' ' + ANG.th, Keterangan: angKet(a) }]]);
  var nm = 'Angka-kegiatan-' + ANG.bl + '-' + ANG.th + (kl ? '-' + kl.replace(/\s+/g, '-') : '');
  if (window.XLSX) {
    var wb = XLSX.utils.book_new();
    bag.forEach(function (x) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(x[1]), x[0]); });
    XLSX.writeFile(wb, nm + '.xlsx'); return;
  }
  csvUnduh(nm + '.csv', bag);
}
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function cetakRekap() {
  if (!ADA) { alert('Data belum dimuat.'); return; }
  var R = rkData(), h = R.h, now = new Date(), op = KELSAYA && KELSAYA !== '-';
  var pf = (typeof PROFIL !== 'undefined' && PROFIL) ? PROFIL : {};
  var ST = { tepat: 'Sudah masuk', telat: 'Masuk terlambat', lewat: 'Belum, lewat batas', belum: 'Belum masuk' };
  var gt = { b: [0, 0], l: [0, 0] };
  var rk = KEL.map(function (k) {
    var a = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_B(); }), b = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_L(); });
    gt.b[0] += a.masuk; gt.b[1] += a.total; gt.l[0] += b.masuk; gt.l[1] += b.total;
    return '<tr><td>' + esc(k) + '</td><td class="c">' + a.masuk + ' / ' + a.total + '</td><td class="c">' + b.masuk + ' / ' + b.total + '</td><td class="c">' + (a.masuk + b.masuk) + ' / ' + (a.total + b.total) + '</td><td class="c">' + persen(a.masuk + b.masuk, a.total + b.total) + '%</td></tr>';
  }).join('');
  if (KEL.length > 1) rk += '<tr class="jm"><td>JUMLAH</td><td class="c">' + gt.b[0] + ' / ' + gt.b[1] + '</td><td class="c">' + gt.l[0] + ' / ' + gt.l[1] + '</td><td class="c">' + (gt.b[0] + gt.l[0]) + ' / ' + (gt.b[1] + gt.l[1]) + '</td><td class="c">' + persen(gt.b[0] + gt.l[0], gt.b[1] + gt.l[1]) + '%</td></tr>';
  var no = 0, rin = h.rows.slice().sort(function (x, y) { return x.p.kel.localeCompare(y.p.kel) || x.p.jenis.localeCompare(y.p.jenis) || x.p.nama.localeCompare(y.p.nama); }).map(function (r) {
    return '<tr><td class="c">' + (++no) + '</td><td>' + esc(r.p.nama) + '</td><td>' + esc(r.p.kel) + '</td><td>' + esc(r.p.jenis.replace('Posyandu ', '')) + '</td><td>' + ST[r.st] + '</td><td class="c">' + esc(r.d ? (r.d.tk || '').slice(0, 10) : '-') + '</td></tr>';
  }).join('');
  var tot = h.rows.length, msk = h.masuk.length;
  var tgl = now.getDate() + ' ' + BULAN[now.getMonth()] + ' ' + now.getFullYear();
  var logo = new URL('logo.png', location.href).href;
  var html = '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rekap Laporan Posyandu ' + esc(R.bl) + ' ' + esc(R.th) + '</title><style>' +
    '@page{size:A4;margin:16mm 15mm}*{box-sizing:border-box}body{font:11pt/1.4 "Times New Roman",Tinos,serif;color:#000;margin:0;padding:14px}' +
    '.kop{display:flex;align-items:center;gap:14px;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:12px}.kop img{width:64px;height:auto}.kop div{flex:1;text-align:center;line-height:1.25}' +
    '.kop b{display:block;font-size:13pt;letter-spacing:.02em}.kop small{font-size:10pt}h1{font-size:13pt;text-align:center;margin:6px 0 2px;text-transform:uppercase}.sb{text-align:center;margin:0 0 12px}' +
    'h2{font-size:11.5pt;margin:14px 0 5px}table{border-collapse:collapse;width:100%;font-size:10pt}th,td{border:1px solid #000;padding:4px 6px;vertical-align:top}th{background:#eee}.c{text-align:center}.jm td{font-weight:700;background:#f4f4f4}' +
    'tr{page-break-inside:avoid}.ring{margin:0 0 4px}.ttd{margin-top:26px;margin-left:55%;text-align:center;page-break-inside:avoid}.ttd .sp{height:64px}.ttd u{font-weight:700}' +
    '.bar{position:sticky;top:0;background:#0a7a35;color:#fff;padding:10px 12px;margin:-14px -14px 14px;font:14px/1.4 sans-serif}.bar button{margin-left:10px;padding:6px 14px;border:0;border-radius:6px;font-weight:700}' +
    '@media print{.bar{display:none}body{padding:0}}</style></head><body>' +
    '<div class="bar">Pilih <b>Cetak</b>, lalu tujuan <b>Simpan sebagai PDF</b> untuk membuat berkas PDF. <button onclick="print()">Cetak / PDF</button></div>' +
    '<div class="kop"><img src="' + logo + '" alt=""><div><b>PEMERINTAH KOTA PALU</b><b>KECAMATAN PALU UTARA</b>' + (op ? '<b>KELURAHAN ' + esc(KELSAYA.toUpperCase()) + '</b>' : '') + '<small>Rekapitulasi Laporan Posyandu</small></div></div>' +
    '<h1>Rekapitulasi Laporan Posyandu</h1><p class="sb">Bulan ' + esc(R.bl) + ' ' + esc(R.th) + ' &middot; Batas pengumpulan tanggal ' + esc(teksBatas(R.th, R.bl)) + '</p>' +
    '<h2>1. Ringkasan</h2><p class="ring">Total Posyandu terdaftar: <b>' + tot + '</b>. Laporan sudah masuk: <b>' + msk + '</b>. Belum masuk: <b>' + (tot - msk) + '</b>. Terlambat: <b>' + h.terlambat.length + '</b>. Capaian: <b>' + persen(msk, tot) + '%</b>.</p>' +
    '<h2>2. Rekap per kelurahan</h2><table><tr><th>Kelurahan</th><th>Balita</th><th>Lansia</th><th>Total</th><th>%</th></tr>' + rk + '</table>' +
    '<h2>3. Rincian per Posyandu</h2><table><tr><th>No</th><th>Nama Posyandu</th><th>Kelurahan</th><th>Jenis</th><th>Status</th><th>Tanggal kirim</th></tr>' + rin + '</table>' +
    '<div class="ttd">Palu, ' + tgl + '<br>' + esc(pf.jabatan || 'Petugas Pengelola Laporan Posyandu') + '<div class="sp"></div><u>' + esc(pf.nama || 'Admin Posyandu') + '</u>' + (pf.nip ? '<br>NIP. ' + esc(pf.nip) : '') + '</div>' +
    '</body></html>';
  var w = null; try { w = window.open('', '_blank'); } catch (x) { }
  if (!w) { alert('Jendela cetak diblokir. Izinkan pop-up untuk situs ini lalu coba lagi.'); return; }
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function () { try { w.focus(); } catch (x) { } }, 300);
}
function unduhRekap() {
  if (!ADA) { alert('Data belum dimuat.'); return; }
  var R = rkData(), h = R.h, now = new Date();
  var s1 = R.bulanan.map(function (o) { return { Bulan: o.b, 'Balita masuk': o.sb.masuk, 'Balita total': o.sb.total, 'Lansia masuk': o.sl.masuk, 'Lansia total': o.sl.total, 'Total masuk': o.m, 'Total Posyandu': o.tot, 'Capaian (%)': persen(o.m, o.tot) }; });
  var s2 = KEL.map(function (k) { var a = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_B(); }), b = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_L(); }); return { Kelurahan: k, 'Balita masuk': a.masuk, 'Balita total': a.total, 'Lansia masuk': b.masuk, 'Lansia total': b.total, 'Capaian (%)': persen(a.masuk + b.masuk, a.total + b.total) }; });
  var s3 = h.rows.map(function (r) { return { Kelurahan: r.p.kel, Jenis: r.p.jenis, Posyandu: r.p.nama, Status: { tepat: 'Sudah masuk', telat: 'Masuk terlambat', lewat: 'Belum masuk (lewat batas)', belum: 'Belum masuk' }[r.st], 'Tanggal kirim': r.d ? r.d.tk : '' }; });
  var nm = 'Rekap-Posyandu-' + R.bl + '-' + R.th;
  if (window.XLSX) {
    var wb = XLSX.utils.book_new();
    [['Per Bulan', s1], ['Per Kelurahan', s2], ['Status Posyandu', s3]].forEach(function (x) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(x[1]), x[0]); });
    XLSX.writeFile(wb, nm + '.xlsx'); return;
  }
  csvUnduh(nm + '.csv', [['Per Bulan', s1], ['Per Kelurahan', s2], ['Status Posyandu', s3]]);
}
function csvUnduh(nama, bagian) {
  var out = [], q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
  bagian.forEach(function (b) { if (!b[1].length) return; var k = Object.keys(b[1][0]); out.push(b[0]); out.push(k.map(q).join(';')); b[1].forEach(function (o) { out.push(k.map(function (x) { return q(o[x]); }).join(';')); }); out.push(''); });
  var bl = new Blob(['﻿' + out.join('\r\n')], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
  a.href = URL.createObjectURL(bl); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ---------- Data Posyandu ---------- */
var dpDibuat = false, dpFilter = { kel: '', jenis: '', st: '', q: '' };
function dpSiap() {
  var box = $('dpBox'); if (!box || dpDibuat) return; dpDibuat = true;
  box.innerHTML = '<div class="card"><div class="lhd"><div class="lht"><h4>Data Posyandu</h4><small>Sumber nama Posyandu untuk menu Laporan dan Rekap.</small></div><div class="toolbar lact" id="dpTool"></div></div>' +
    '<div class="grid4" id="dpStat"></div>' +
    '<div class="fl2"><input class="full" id="dfq" type="search" name="cari-posyandu-x" readonly onfocus="this.removeAttribute(\'readonly\')" placeholder="Cari Posyandu atau kader…" aria-label="Cari Posyandu atau kader" autocomplete="off"><select class="full" id="dfk" aria-label="Kelurahan"></select><select id="dfj" aria-label="Jenis"></select><select id="dfs" aria-label="Status"></select></div></div>' +
    '<div id="dpUbah"></div><div id="dpList"></div><div class="card"><h4>Surat Keputusan (SK) Kader</h4><p class="hint">Ketuk SK untuk membacanya utuh.</p><div id="skBox"></div></div>';
  if (KELSAYA && KELSAYA !== '-') $('dfk').style.display = 'none';
  pilihEl('dfk', [['', 'Semua kelurahan']].concat(KEL.map(function (k) { return [k, k]; })));
  pilihEl('dfj', [['', 'Semua jenis'], [J_B(), 'Balita'], [J_L(), 'Lansia']]);
  pilihEl('dfs', [['', 'Semua status'], ['a', 'Aktif'], ['n', 'Nonaktif']]);
  ['dfk', 'dfj', 'dfs'].forEach(function (i) { $(i).addEventListener('change', function () { dpFilter = { kel: $('dfk').value, jenis: $('dfj').value, st: $('dfs').value, q: $('dfq').value }; renderData(); }); });
  $('dfq').addEventListener('input', function () { dpFilter.q = this.value; renderData(); });
}
function btn(txt, cls, fn) { var b = el('button', 'btn ' + (cls || ''), txt); b.type = 'button'; b.addEventListener('click', fn); return b; }
function renderData() {
  dpSiap(); if (!$('dpList')) return;
  var all = dasarPos(), st = $('dpStat'); st.textContent = '';
  var ak = all.filter(function (p) { return p.aktif !== false; });
  st.appendChild(tileStat('sa', ak.length, 'Posyandu aktif')); st.appendChild(tileStat('sb', ak.filter(function (p) { return p.jenis === J_B(); }).length, 'Posyandu Balita'));
  st.appendChild(tileStat('sl', ak.filter(function (p) { return p.jenis === J_L(); }).length, 'Posyandu Lansia'));
  st.appendChild(tileStat('sk', ak.reduce(function (n, p) { return n + aktifKader(p).length; }, 0), 'Kader aktif'));
  var tb = $('dpTool'); tb.textContent = '';
  if (utama()) {
    if (!POS.length) tb.appendChild(btn('Simpan daftar dari SK', '', simpanDariSK));
    tb.appendChild(btn('\u270E Ubah data Posyandu', 'hl-ubah', function () { UBAH_BUKA = !UBAH_BUKA; if (!UBAH_BUKA) { UBAH_MODE = ''; IMPOR = null; } pasangUbah(); }));
  }
  tb.appendChild(btn('Ekspor Excel', 'line', ekspor));
  if (utama() && !$('impPos')) { var inp = document.createElement('input'); inp.type = 'file'; inp.id = 'impPos'; inp.accept = '.xlsx,.xls,.csv'; inp.style.display = 'none'; inp.addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (f) imporPratinjau(f); }); document.body.appendChild(inp); }
  pasangUbah();
  var l = $('dpList'); l.textContent = '';
  var q = (dpFilter.q || '').toLowerCase();
  var fl = all.filter(function (p) {
    if (dpFilter.kel && p.kel !== dpFilter.kel) return false; if (dpFilter.jenis && p.jenis !== dpFilter.jenis) return false;
    if (dpFilter.st === 'a' && p.aktif === false) return false; if (dpFilter.st === 'n' && p.aktif !== false) return false;
    if (q && (p.nama + ' ' + (p.kader || []).map(function (k) { return k.nama; }).join(' ')).toLowerCase().indexOf(q) < 0) return false; return true;
  });
  if (!fl.length) l.appendChild(el('div', 'empty', 'Tidak ada Posyandu yang cocok.'));
  KEL.forEach(function (k) {
    var g = fl.filter(function (p) { return p.kel === k; }).sort(function (a, b) { return a.jenis.localeCompare(b.jenis) || a.nama.localeCompare(b.nama); }); if (!g.length) return;
    var kh = el('div', 'kh', k); kh.appendChild(el('em', 'khn', g.length + ' Posyandu')); l.appendChild(kh);
    var pg = el('div', 'pgrid'); g.forEach(function (p) { pg.appendChild(kartuPos(p)); }); l.appendChild(pg);
  });
  renderSK();
}
function kartuPos(p) {
  var d = document.createElement('details'); d.className = 'pos ' + (p.jenis === J_L() ? 'pl' : 'pb') + (p.aktif === false ? ' off' : '');
  var s = document.createElement('summary'); s.appendChild(el('div', 'a', p.jenis.replace('Posyandu', 'Posyandu') + ' ' + p.nama));
  s.appendChild(el('div', 'b', [p.ketua ? 'Ketua/PJ: ' + p.ketua : '', aktifKader(p).length + ' kader'].filter(Boolean).join(' · ')));
  var tg = el('div', 'tags'); tg.appendChild(el('span', 'tag jn', p.jenis === J_L() ? 'Lansia' : 'Balita')); if (p.aktif === false) tg.appendChild(el('span', 'tag g', 'Nonaktif'));
  tg.appendChild(el('span', 'tag jh ' + (p.hp ? 'ok' : 'no'), p.hp ? 'No. HP ' + p.hp : 'Belum ada nomor HP')); if (p.jadwal) tg.appendChild(el('span', 'tag g', p.jadwal)); s.appendChild(tg); d.appendChild(s);
  var det = el('div', 'det');
  if (p.alamat) det.appendChild(el('div', 'b', 'Alamat: ' + p.alamat)); if (p.puskesmas) det.appendChild(el('div', 'b', p.puskesmas));
  var rows = (p.kader || []).map(function (k, i) { return [String(i + 1), k.nama, k.jabatan || '-', k.aktif === false ? 'Nonaktif' : 'Aktif']; });
  if (rows.length) { var t = tabel(['No', 'Nama kader', 'Jabatan', 'Status'], rows); t.style.marginTop = '8px'; Array.prototype.forEach.call(t.querySelectorAll('tr'), function (tr, i) { var c = tr.lastChild; if (i && c) { c.className = 'stk ' + (c.textContent === 'Aktif' ? 'ok' : 'off'); } }); det.appendChild(t); }
  if (utama() && POS.length) {
    var ac = el('div', 'acts'); ac.appendChild(btn('Edit', 'sm plain', function () { formPos(p); }));
    ac.appendChild(btn(p.aktif === false ? 'Aktifkan' : 'Nonaktifkan', 'sm plain', function () {
      if (!confirm((p.aktif === false ? 'Aktifkan ' : 'Nonaktifkan ') + p.nama + '?')) return;
      var n = POS.map(function (x) { return x.id === p.id ? Object.assign({}, x, { aktif: x.aktif === false }) : x; }); simpanDaftar(n, 'Status Posyandu diperbarui.');
    })); det.appendChild(ac);
  }
  if (isOp() && POS.length) { var ao = el('div', 'acts'); ao.appendChild(btn(p.hp ? 'Ubah nomor ketua/perwakilan' : 'Isi nomor ketua/perwakilan', 'sm plain', function () { formNomor(p); })); det.appendChild(ao); }
  d.appendChild(det); return d;
}
function simpanDaftar(list, ok, konfirmasi) {
  var f = { aksi: 'pos', list: list }; if (konfirmasi !== undefined) f.konfirmasi = konfirmasi;
  return kirimAtur(f).then(function (r) { POS = r.list || list; POSOK = true; renderData(); renderBeranda(); renderRekap(); if (ok) toast(ok); return true; })
    .catch(function (e) { alert('Gagal menyimpan: ' + e.message); return false; });
}
function toast(t) { var d = el('div', 'ok2', t); d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:90px;z-index:300;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.25)'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2800); }
function simpanDariSK() {
  if (!confirm('Simpan daftar ' + (window.SEED_POS || []).length + ' Posyandu dan nama kader dari SK ke server?')) return;
  simpanDaftar(JSON.parse(JSON.stringify(window.SEED_POS || [])), 'Daftar dari SK tersimpan.');
}
function aliasBaru(p, namaBaru) {
  var al = (p.alias || []).slice();
  if (p.nama && p.nama !== namaBaru && kunci(p.kel, p.jenis, p.nama) !== kunci(p.kel, p.jenis, namaBaru)) al.push(p.nama);
  var seen = {}; return al.filter(function (a) { var k = kunci(p.kel, p.jenis, a); if (seen[k] || k === kunci(p.kel, p.jenis, namaBaru)) return false; seen[k] = 1; return true; }).slice(0, 5);
}
function formPos(p) {
  var baru = !p; p = p || { id: 'n' + Date.now().toString(36), nama: '', kel: KEL[0], jenis: J_B(), alamat: '', puskesmas: '', ketua: '', hp: '', jadwal: '', aktif: true, kader: [] };
  var f = el('div');
  function fld(id, lbl, val, ph) { var w = el('div', 'fld'); w.appendChild(el('label', null, lbl)); var i = document.createElement('input'); i.id = id; i.type = 'text'; i.value = val || ''; if (ph) i.placeholder = ph; w.appendChild(i); f.appendChild(w); return i; }
  fld('fpN', 'Nama Posyandu', p.nama);
  var w1 = el('div', 'fld'); w1.appendChild(el('label', null, 'Kelurahan')); var sk = document.createElement('select'); sk.id = 'fpK'; sk.style.cssText = 'width:100%;min-height:50px;border:1.5px solid var(--line);border-radius:12px;padding:8px;background:var(--surface);color:var(--fg);font-size:16px'; KEL.forEach(function (k) { var o = document.createElement('option'); o.textContent = k; sk.appendChild(o); }); sk.value = p.kel; w1.appendChild(sk); f.appendChild(w1);
  var w2 = el('div', 'fld'); w2.appendChild(el('label', null, 'Jenis Posyandu')); var sj = sk.cloneNode(false); sj.id = 'fpJ'; [[J_B(), 'Balita'], [J_L(), 'Lansia']].forEach(function (j) { var o = document.createElement('option'); o.value = j[0]; o.textContent = j[1]; sj.appendChild(o); }); sj.value = p.jenis; w2.appendChild(sj); f.appendChild(w2);
  fld('fpA', 'Alamat', p.alamat); fld('fpP', 'Puskesmas', p.puskesmas); fld('fpQ', 'Nama ketua atau kader penanggung jawab', p.ketua);
  fld('fpH', 'Nomor HP ketua atau perwakilan', p.hp, 'Contoh: 0812 3456 7890'); fld('fpD', 'Jadwal kegiatan', p.jadwal, 'Contoh: Setiap tanggal 10, pukul 09.00');
  var w3 = el('div', 'fld'); var lb = document.createElement('label'); lb.style.cssText = 'display:flex;gap:8px;align-items:center'; var cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'fpAk'; cb.checked = p.aktif !== false; cb.style.cssText = 'width:20px;height:20px;min-height:0'; lb.appendChild(cb); lb.appendChild(document.createTextNode('Posyandu aktif')); w3.appendChild(lb); f.appendChild(w3);
  f.appendChild(el('div', 'kh', 'Daftar kader')); var kl = el('div'); f.appendChild(kl);
  function tambahKader(k) {
    var r = el('div', 'krow'), a = document.createElement('input'), b = document.createElement('input'), c = document.createElement('input'), x = el('button', null, '×');
    a.type = b.type = 'text'; a.placeholder = 'Nama kader'; b.placeholder = 'Jabatan'; a.value = k.nama || ''; b.value = k.jabatan || ''; c.type = 'checkbox'; c.checked = k.aktif !== false; c.title = 'Aktif'; c.style.cssText = 'width:22px;height:22px;min-height:0;justify-self:center';
    x.type = 'button'; x.addEventListener('click', function () { r.remove(); }); r.appendChild(a); r.appendChild(b); r.appendChild(c); r.appendChild(x); kl.appendChild(r);
  }
  (p.kader || []).forEach(tambahKader);
  var tk = btn('Tambah kader', 'sm plain', function () { tambahKader({}); }); tk.style.marginBottom = '8px'; f.appendChild(tk);
  f.appendChild(el('div', 'lt', 'Kotak centang di kanan nama menandai kader aktif.'));
  var er = el('div', 'st'); f.appendChild(er);
  var sv = btn(baru ? 'Tambah Posyandu' : 'Simpan perubahan', 'wide', function () {
    var nama = $('fpN').value.trim(); if (!nama) { er.textContent = 'Nama Posyandu wajib diisi'; er.className = 'st bad'; return; }
    var kader = Array.prototype.map.call(kl.children, function (r) { var i = r.querySelectorAll('input'); return { nama: i[0].value.trim(), jabatan: i[1].value.trim(), aktif: i[2].checked }; }).filter(function (k) { return k.nama; });
    var np = { id: p.id, alias: aliasBaru(p, nama), nama: nama, kel: $('fpK').value, jenis: $('fpJ').value, alamat: $('fpA').value.trim(), puskesmas: $('fpP').value.trim(), ketua: $('fpQ').value.trim(), hp: $('fpH').value.trim(), hpJenis: p.hpJenis, hpNama: p.hpNama, jadwal: $('fpD').value.trim(), aktif: $('fpAk').checked, kader: kader };
    var dup = POS.some(function (x) { return x.id !== p.id && kunci(x.kel, x.jenis, x.nama) === kunci(np.kel, np.jenis, np.nama); });
    if (dup) { er.textContent = 'Posyandu dengan nama, kelurahan, dan jenis yang sama sudah ada'; er.className = 'st bad'; return; }
    var n = baru ? POS.concat([np]) : POS.map(function (x) { return x.id === p.id ? np : x; });
    sv.disabled = true; er.textContent = 'Menyimpan…'; er.className = 'st';
    simpanDaftar(n, 'Data Posyandu tersimpan.').then(function (ok) { if (ok) tutupModal(); else { sv.disabled = false; er.textContent = ''; } });
  });
  f.appendChild(sv); bukaModal(baru ? 'Tambah Posyandu' : 'Edit Posyandu', f);
}
/* ekspor dan impor Excel */
var KOLOM = ['Nama Posyandu', 'Kelurahan', 'Jenis (Balita/Lansia)', 'Alamat', 'Puskesmas', 'Ketua/Penanggung Jawab', 'Nomor HP', 'Jadwal Kegiatan', 'Status (Aktif/Nonaktif)', 'Kader (pisahkan dengan titik koma; format: Nama - Jabatan)', 'Nama lama (isi hanya jika ganti nama)'];
function ekspor() {
  var data = dasarPos().map(function (p) {
    var o = {}; o[KOLOM[0]] = p.nama; o[KOLOM[1]] = p.kel; o[KOLOM[2]] = p.jenis.replace('Posyandu ', ''); o[KOLOM[3]] = p.alamat || ''; o[KOLOM[4]] = p.puskesmas || ''; o[KOLOM[5]] = p.ketua || ''; o[KOLOM[6]] = p.hp || ''; o[KOLOM[7]] = p.jadwal || '';
    o[KOLOM[8]] = p.aktif === false ? 'Nonaktif' : 'Aktif'; o[KOLOM[10]] = ''; o[KOLOM[9]] = (p.kader || []).map(function (k) { return k.nama + (k.jabatan ? ' - ' + k.jabatan : '') + (k.aktif === false ? ' (nonaktif)' : ''); }).join('; '); return o;
  });
  var kader = []; dasarPos().forEach(function (p) { (p.kader || []).forEach(function (k, i) { kader.push({ Kelurahan: p.kel, Jenis: p.jenis, Posyandu: p.nama, No: i + 1, 'Nama Kader': k.nama, Jabatan: k.jabatan || '', Status: k.aktif === false ? 'Nonaktif' : 'Aktif' }); }); });
  if (window.XLSX) {
    var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(data); ws['!cols'] = KOLOM.map(function (k, i) { return { wch: i === 9 ? 60 : Math.max(14, Math.min(28, k.length)) }; });
    XLSX.utils.book_append_sheet(wb, ws, 'Data Posyandu'); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kader), 'Daftar Kader'); XLSX.writeFile(wb, 'Data-Posyandu-Palu-Utara.xlsx'); return;
  }
  csvUnduh('Data-Posyandu-Palu-Utara.csv', [['Data Posyandu', data], ['Daftar Kader', kader]]);
}
/* ---------- Ubah data Posyandu: satu per satu, atau sekaligus dari Excel ---------- */
function pasangUbah() {
  var box = $('dpUbah'); if (!box) return; box.textContent = '';
  if (!utama() || !UBAH_BUKA) return;
  var c = el('div', 'card ubah');
  if (UBAH_MODE === 'excel') { kartuExcel(c); box.appendChild(c); return; }
  var rh = el('div', 'rkhd'); rh.appendChild(el('h4', null, 'Mau mengubah data dengan cara apa?'));
  rh.appendChild(btn('Tutup', 'sm plain', function () { UBAH_BUKA = false; UBAH_MODE = ''; IMPOR = null; pasangUbah(); })); c.appendChild(rh);
  var dua = el('div', 'ubah2');
  function pil(cls, ikon, judul, ket, poin, aksi) {
    var k = el('div', 'pil ' + cls); k.appendChild(el('div', 'pic', ikon)); k.appendChild(el('h5', null, judul)); k.appendChild(el('p', null, ket));
    var ul = el('ul'); poin.forEach(function (x) { ul.appendChild(el('li', null, x)); }); k.appendChild(ul);
    aksi.forEach(function (a) { k.appendChild(a); k.appendChild(document.createTextNode(' ')); }); return k;
  }
  dua.appendChild(pil('a', '✎', 'Satu per satu', 'Untuk perubahan sedikit, misalnya satu kader pindah atau ada Posyandu baru.',
    ['Tambah Posyandu baru', 'Atau ketuk nama Posyandu di daftar untuk mengubah kader, nomor HP, dan status'],
    POS.length ? [btn('Tambah Posyandu', '', function () { formPos(null); })] : [el('small', 'lt', 'Simpan daftar dari SK dulu agar bisa diubah.')]));
  dua.appendChild(pil('b', '📊', 'Sekaligus dari Excel', 'Untuk SK baru: banyak nama kader berganti dalam sekali kerja.',
    ['Unduh templat berisi data sekarang', 'Ubah di Excel, unggah, periksa, lalu setujui dengan sandi'],
    POS.length ? [btn('Mulai dari Excel', '', function () { UBAH_MODE = 'excel'; IMPOR = null; pasangUbah(); })] : [el('small', 'lt', 'Simpan daftar dari SK dulu.')]));
  c.appendChild(dua); box.appendChild(c);
}
function kartuExcel(c) {
  var rh = el('div', 'rkhd'); rh.appendChild(el('h4', null, 'Ubah sekaligus dari Excel'));
  rh.appendChild(btn('‹ Kembali', 'sm plain', function () { UBAH_MODE = ''; IMPOR = null; pasangUbah(); })); c.appendChild(rh);
  function langkah(n, t) { var h = el('div', 'lgk'); h.appendChild(el('span', 'no', String(n))); h.appendChild(el('b', null, t)); return h; }
  c.appendChild(langkah(1, 'Unduh templat, ubah di Excel, lalu unggah'));
  var tl = el('div', 'toolbar'); tl.appendChild(btn('Unduh templat Excel (berisi data sekarang)', 'sm', ekspor)); tl.appendChild(document.createTextNode(' '));
  tl.appendChild(btn(IMPOR ? 'Pilih berkas lain' : 'Pilih berkas Excel / CSV', 'sm line', function () { $('impPos').click(); })); c.appendChild(tl);
  c.appendChild(el('p', 'hint', 'Kolom "Nama lama" diisi hanya kalau nama Posyandunya diganti. Kalau yang berubah hanya nama kader, kosongkan.'));
  if (!IMPOR) return;
  var I = IMPOR, H = I.hasil;
  c.appendChild(langkah(2, 'Periksa perbedaannya (belum tersimpan)'));
  c.appendChild(el('div', 'lt', I.nama + ' · ' + I.baris + ' baris terbaca' + (H.lewat.length ? ' · ' + H.lewat.length + ' baris dilewati (baris ' + H.lewat.slice(0, 8).join(', ') + ')' : '')));
  var st = el('div', 'ist');
  [['s1', H.kader.length, 'kader berubah'], ['s5', H.ganti.length, 'nama Posyandu berubah'], ['s2', H.baru.length, 'Posyandu baru'], ['s3', H.nonaktif.length, I.nonaktifkan ? 'dinonaktifkan' : 'tidak ada di berkas'], ['s6', H.ubahLain.length, 'data lain berubah'], ['s4', H.tetap.length, 'tidak berubah']].forEach(function (x) {
    var b = el('div', 'is ' + x[0]); b.appendChild(el('b', null, String(x[1]))); b.appendChild(el('span', null, x[2])); st.appendChild(b);
  }); c.appendChild(st);
  var tb = el('table', 'itbl');
  function bar(nm, ket, tag, tc) { var tr = el('tr'), a = el('td'); a.appendChild(el('b', null, nm)); tr.appendChild(a); var k = el('td'); if (typeof ket === 'string') k.textContent = ket; else k.appendChild(ket); tr.appendChild(k); var t = el('td'); t.appendChild(el('span', 'itg ' + tc, tag)); tr.appendChild(t); tb.appendChild(tr); }
  function lamaBaru(a, b) { var f = document.createDocumentFragment(), s1 = el('span', 'ilama', a || '(kosong)'); f.appendChild(s1); f.appendChild(document.createTextNode(' → ')); f.appendChild(el('span', 'ibaru', b || '(kosong)')); return f; }
  var maks = 40, n = 0;
  function ada() { return n++ < maks; }
  H.kader.forEach(function (x) { if (ada()) bar(x.baru.nama + ' (' + x.baru.jenis.replace('Posyandu ', '') + ') · ' + x.baru.kel, lamaBaru(x.dari, x.ke), 'ganti kader', 'tu'); });
  H.ganti.forEach(function (x) { if (ada()) bar(x.baru.jenis.replace('Posyandu ', '') + ' · ' + x.baru.kel, lamaBaru(x.lama.nama, x.baru.nama), 'ganti nama Posyandu', 'tn'); });
  H.baru.forEach(function (x) { if (ada()) bar(x.nama + ' (' + x.jenis.replace('Posyandu ', '') + ') · ' + x.kel, 'Posyandu baru' + (x.ketua ? ' · ketua ' + x.ketua : ''), 'baru', 'tb'); });
  H.ubahLain.forEach(function (x) { if (ada()) bar(x.baru.nama + ' (' + x.baru.jenis.replace('Posyandu ', '') + ') · ' + x.baru.kel, x.ket, 'data lain', 'tu'); });
  H.nonaktif.forEach(function (x) { if (ada()) bar(x.nama + ' (' + x.jenis.replace('Posyandu ', '') + ') · ' + x.kel, I.nonaktifkan ? 'Tidak ada di berkas · laporan lama tetap aman' : 'Tidak ada di berkas · dibiarkan seperti sekarang', I.nonaktifkan ? 'nonaktif' : 'dibiarkan', 'th'); });
  if (n > maks) { var tr = el('tr'), td = el('td', 'lt', '… dan ' + (n - maks) + ' baris lainnya'); td.colSpan = 3; tr.appendChild(td); tb.appendChild(tr); }
  if (n) c.appendChild(tb);
  H.peringatan.forEach(function (w) { c.appendChild(el('div', 'warn2', w)); });
  if (H.ganti.length && !SERVER_ALIAS) c.appendChild(el('div', 'warn2', 'Ganti nama Posyandu belum bisa diterapkan: Code.gs di Apps Script belum diperbarui. Perubahan lain tetap bisa diterapkan jika baris ganti nama dikosongkan, atau perbarui Code.gs dulu.'));
  var lb = document.createElement('label'); lb.className = 'inon'; var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = I.nonaktifkan;
  cb.addEventListener('change', function () { IMPOR = rakitImpor(I.rows, I.nama, I.baris, cb.checked); pasangUbah(); });
  lb.appendChild(cb); lb.appendChild(el('span', null, 'Nonaktifkan Posyandu yang tidak ada di berkas (laporan lamanya tetap aman)')); c.appendChild(lb);
  c.appendChild(langkah(3, 'Setujui'));
  var total = H.kader.length + H.ganti.length + H.baru.length + H.ubahLain.length + (I.nonaktifkan ? H.nonaktif.length : 0);
  if (!total) { c.appendChild(el('div', 'ok2', 'Tidak ada perbedaan dengan data sekarang.')); return; }
  var w = el('div', 'fld'); w.appendChild(el('label', null, 'Masukkan sandi Anda untuk menyimpan'));
  var inp = document.createElement('input'); inp.type = 'password'; inp.name = 'konfirmasi-impor'; inp.autocomplete = 'new-password'; inp.setAttribute('readonly', ''); inp.addEventListener('focus', function () { inp.removeAttribute('readonly'); }); w.appendChild(inp); c.appendChild(w);
  var er = el('div', 'st'); c.appendChild(er);
  var bt = el('div', 'toolbar'), ok = btn('Terapkan ' + total + ' perubahan', '', function () {
    if (H.ganti.length && !SERVER_ALIAS) { er.textContent = 'Perbarui Code.gs dulu untuk ganti nama Posyandu'; er.className = 'st bad'; return; }
    if (!CRED || inp.value !== CRED.p) { er.textContent = 'Sandi tidak cocok'; er.className = 'st bad'; inp.value = ''; return; }
    ok.disabled = true; er.textContent = 'Menyimpan…'; er.className = 'st';
    simpanDaftar(I.daftar, total + ' perubahan diterapkan.', inp.value).then(function (b) { if (b) { UBAH_BUKA = false; UBAH_MODE = ''; IMPOR = null; pasangUbah(); } else { ok.disabled = false; er.textContent = ''; } });
  });
  bt.appendChild(ok); bt.appendChild(document.createTextNode(' ')); bt.appendChild(btn('Batal', 'plain', function () { IMPOR = null; pasangUbah(); })); c.appendChild(bt);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } });
}
function mirip(a, b) { a = a.split('|')[2] || ''; b = b.split('|')[2] || ''; if (!a || !b) return false; return a.indexOf(b) === 0 || b.indexOf(a) === 0 || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5)); }
function rakitImpor(rows, nama, baris, nonaktifkan) {
  var H = { kader: [], ganti: [], baru: [], ubahLain: [], tetap: [], nonaktif: [], lewat: [], peringatan: [] }, pakai = {}, sudah = {}, daftar = POS.map(function (x) { return x; });
  var namaKader = function (p) { return aktifKader(p).map(function (k) { return k.nama; }).join(', '); };
  rows.forEach(function (r) {
    if (r.lewat) { H.lewat.push(r.baris); return; }
    var kk = kunci(r.kel, r.jenis, r.nama); if (sudah[kk]) { H.lewat.push(r.baris); return; } sudah[kk] = 1;
    var ix = -1, lama = null;
    daftar.forEach(function (x, j) { if (ix < 0 && kunci(x.kel, x.jenis, x.nama) === kk) ix = j; });
    if (ix < 0 && r.namaLama) daftar.forEach(function (x, j) { if (ix < 0 && kunci(x.kel, x.jenis, x.nama) === kunci(r.kel, r.jenis, r.namaLama)) { ix = j; lama = x; } });
    var np = { nama: r.nama, kel: r.kel, jenis: r.jenis, alamat: r.alamat, puskesmas: r.puskesmas, ketua: r.ketua, hp: r.hp, jadwal: r.jadwal, aktif: r.aktif, kader: r.kader };
    if (ix >= 0) {
      var ex = daftar[ix]; pakai[ex.id] = 1; np.id = ex.id; if (!np.hp) np.hp = ex.hp || ''; np.hpJenis = ex.hpJenis; np.hpNama = ex.hpNama; np.alias = aliasBaru(ex, np.nama);
      if (lama) { H.ganti.push({ lama: ex, baru: np }); }
      else {
        var kb = namaKader(ex) !== namaKader(np) || (ex.ketua || '') !== (np.ketua || '');
        var lain = []; [['alamat', 'alamat'], ['puskesmas', 'puskesmas'], ['jadwal', 'jadwal'], ['hp', 'nomor HP']].forEach(function (f) { if ((ex[f[0]] || '') !== (np[f[0]] || '')) lain.push(f[1]); });
        if ((ex.aktif !== false) !== (np.aktif !== false)) lain.push('status');
        if (kb) H.kader.push({ baru: np, dari: namaKader(ex) || (ex.ketua || ''), ke: namaKader(np) || (np.ketua || '') });
        else if (lain.length) H.ubahLain.push({ baru: np, ket: 'Berubah: ' + lain.join(', ') });
        else H.tetap.push(np);
      }
      daftar[ix] = np;
    } else { np.id = 'n' + Date.now().toString(36) + r.baris; np.alias = []; H.baru.push(np); daftar.push(np); }
  });
  var jmlBaru = H.baru.length;
  daftar.forEach(function (x, j) {
    if (!x.id || pakai[x.id] || x.aktif === false) return; if (H.baru.indexOf(x) >= 0) return;
    if (j >= POS.length) return;
    H.nonaktif.push(x); if (nonaktifkan) daftar[j] = Object.assign({}, x, { aktif: false });
  });
  H.nonaktif.forEach(function (x) { H.baru.forEach(function (b) { if (b.kel === x.kel && b.jenis === x.jenis && mirip(kunci(x.kel, x.jenis, x.nama), kunci(b.kel, b.jenis, b.nama))) H.peringatan.push('"' + x.nama + '" tidak ada di berkas, dan ada "' + b.nama + '" yang baru. Apakah ini Posyandu yang sama? Kalau ya, isi kolom "Nama lama" dengan "' + x.nama + '" lalu unggah lagi, supaya laporan lama ikut.'); }); });
  return { nama: nama, baris: baris, rows: rows, hasil: H, daftar: daftar, nonaktifkan: nonaktifkan, jmlBaru: jmlBaru };
}
function imporPratinjau(file) {
  if (!window.XLSX) { alert('Fitur Excel belum termuat. Periksa internet lalu coba lagi.'); return; }
  var rd = new FileReader();
  rd.onload = function () {
    try {
      var wb = XLSX.read(rd.result, { type: 'array' }), rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      var kolom = function (r, i) { var key = Object.keys(r).filter(function (k) { return k.toLowerCase().indexOf(KOLOM[i].toLowerCase().slice(0, 8)) === 0; })[0]; return key ? String(r[key]).trim() : ''; };
      var baca = rows.map(function (r, i) {
        var nama = kolom(r, 0), kel = KEL_SEMUA.filter(function (k) { return k.toLowerCase() === kolom(r, 1).toLowerCase(); })[0], jr = kolom(r, 2).toLowerCase(), jenis = jr.indexOf('bal') === 0 ? J_B() : jr.indexOf('lan') === 0 ? J_L() : '';
        if (!nama || !kel || !jenis) return { lewat: true, baris: i + 2 };
        var kader = kolom(r, 9).split(/[;\n]+/).map(function (s) { s = s.trim(); if (!s) return null; var off = /\(nonaktif\)\s*$/i.test(s); s = s.replace(/\(nonaktif\)\s*$/i, '').trim(); var m = s.split(/\s+[-–]\s+/); return { nama: m[0].trim(), jabatan: (m[1] || '').trim(), aktif: !off }; }).filter(Boolean);
        return { baris: i + 2, nama: nama, namaLama: kolom(r, 10), kel: kel, jenis: jenis, alamat: kolom(r, 3), puskesmas: kolom(r, 4), ketua: kolom(r, 5), hp: kolom(r, 6), jadwal: kolom(r, 7), aktif: kolom(r, 8).toLowerCase().indexOf('non') !== 0, kader: kader };
      });
      if (!baca.some(function (x) { return !x.lewat; })) { alert('Tidak ada baris yang bisa dibaca. Pastikan kolom Nama Posyandu, Kelurahan, dan Jenis terisi (gunakan templat dari tombol Unduh templat).'); return; }
      UBAH_BUKA = true; UBAH_MODE = 'excel'; IMPOR = rakitImpor(baca, file.name, baca.length, true); pasangUbah();
      var k = $('dpUbah'); if (k && k.scrollIntoView) k.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } catch (e) { alert('Berkas tidak bisa dibaca: ' + e.message); }
  };
  rd.readAsArrayBuffer(file);
}
/* SK */
function renderSK() {
  var b = $('skBox'); if (!b) return; b.textContent = '';
  [['Balita', 'SK Kader Posyandu Balita'], ['Lansia', 'SK Kader Posyandu Lansia']].forEach(function (x) {
    var s = SK[x[0]], c = el('div', 'skc'), ic = el('div', 'ic2', 'PDF'), t = el('div', 't');
    t.appendChild(el('b', null, x[1])); t.appendChild(el('span', null, s ? 'Diunggah ' + s.tgl + (s.ukuran ? ' · ' + (s.ukuran / 1048576).toFixed(1) + ' MB' : '') : 'Belum diunggah'));
    c.appendChild(ic); c.appendChild(t);
    if (s) c.appendChild(btn('Baca', 'sm', function () { lihatSK(x[1], s.id); }));
    if (utama()) { var lb = el('label', 'btn sm plain fbtn', s ? 'Ganti' : 'Unggah'), i = document.createElement('input'); i.type = 'file'; i.accept = 'application/pdf'; i.addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (f) unggahSK(x[0], f, t); }); lb.appendChild(i); c.appendChild(lb); }
    b.appendChild(c);
  });
}
function lihatSK(judul, id) {
  var w = el('div'); w.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0';
  var fr = document.createElement('iframe'); fr.src = 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/preview'; fr.style.minHeight = '60vh';
  var a = el('a', 'btn sm plain', 'Buka di tab baru'); a.href = 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view'; a.target = '_blank'; a.rel = 'noopener'; a.style.margin = '8px 0 0';
  w.appendChild(fr); w.appendChild(a); w.style.flex = '1'; var bx = bukaModal(judul, w, true); fr.style.flex = '1';
}
function b64(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(file); }); }
function kirimForm(data) {
  var tok = Math.random().toString(36).slice(2), nm = 'sf' + tok, fr = document.createElement('iframe'); fr.name = nm; fr.style.display = 'none'; document.body.appendChild(fr);
  var f = document.createElement('form'); f.method = 'POST'; f.action = ARSIP_URL; f.target = nm; f.style.display = 'none'; data.t = tok;
  var i = document.createElement('input'); i.type = 'hidden'; i.name = 'data'; i.value = JSON.stringify(data); f.appendChild(i); document.body.appendChild(f); f.submit();
  return function () { try { f.remove(); fr.remove(); } catch (e) { } };
}
function tundaMs(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
async function kirimBagian(id, q, isi) {
  for (var k = 0; k < 3; k++) {
    var bersih = kirimForm({ aksi: 'bagian', id: id, i: q, isi: isi });
    try { for (var w = 0; w < 50; w++) { await tundaMs(w ? 500 : 300); try { var r = await jsonp({ aksi: 'cek', id: id, i: q }, 12000); if (r && r.ok) { return; } } catch (e) { } } } finally { bersih(); }
  }
  throw new Error('Potongan ' + (q + 1) + ' tidak sampai ke server');
}
async function unggahSK(jenis, file, info) {
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { alert('Pilih berkas PDF.'); return; }
  if (file.size > 7.5 * 1048576) { alert('Ukuran SK maksimal 7,5 MB. Kecilkan PDF-nya lalu coba lagi.'); return; }
  try {
    var data = await b64(file), CH = 94000, n = Math.ceil(data.length / CH), id = 'sk' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36), antre = [], done = 0;
    for (var q = 0; q < n; q++) antre.push(q);
    async function pekerja() { while (antre.length) { var qi = antre.shift(); await kirimBagian(id, qi, data.slice(qi * CH, (qi + 1) * CH)); done++; info.lastChild.textContent = 'Mengunggah… ' + done + ' dari ' + n; } }
    await Promise.all([pekerja(), pekerja(), pekerja(), pekerja()]);
    info.lastChild.textContent = 'Menyimpan di Drive…';
    var r = await kirimAtur({ aksi: 'sk', id: id, jenis: jenis, n: n });
    SK = r.sk || SK; renderSK(); toast('SK tersimpan.');
  } catch (e) { alert('Gagal mengunggah SK: ' + e.message); renderSK(); }
}

/* ---------- Pengaturan lanjutan ---------- */
/* Mengubah masa peralihan harus lewat konfirmasi dan sandi, supaya tidak berubah karena salah sentuh. */
function dialogPeralihan(hidup, sesudah) {
  var pr = periodeBeranda(), h = hitung(pr.th, pr.bl), M = SETOR[perKey(pr)], tot = h.rows.length, f = el('div');
  var onN = M ? h.rows.filter(function (r) { return M[r.p.id]; }).length : null, offN = M ? h.rows.filter(function (r) { return r.d && M[r.p.id]; }).length : null;
  var sel = M ? onN - offN : null;
  var t = el('p', 'lt');
  if (hidup) t.textContent = M ? 'Berkas fisik yang diterima tanpa laporan digital akan dihitung masuk. Kartu hasil ' + pr.bl + ' ' + pr.th + ' naik dari ' + offN + ' menjadi ' + onN + ' dari ' + tot + '.' : 'Berkas fisik yang diterima tanpa laporan digital akan dihitung masuk.';
  else t.textContent = M ? sel + ' Posyandu yang hanya berkas fisik tidak lagi dihitung masuk. Kartu hasil ' + pr.bl + ' ' + pr.th + ' turun dari ' + onN + ' menjadi ' + offN + ' dari ' + tot + '.' : 'Berkas fisik tanpa laporan digital tidak lagi dihitung masuk. Laporan baru masuk bila digital dan fisik sudah ada.';
  f.appendChild(t);
  var w = el('div', 'fld'); w.appendChild(el('label', null, 'Masukkan sandi Anda untuk melanjutkan'));
  var inp = document.createElement('input'); inp.type = 'password'; inp.name = 'konfirmasi-peralihan'; inp.autocomplete = 'new-password'; inp.setAttribute('readonly', ''); inp.addEventListener('focus', function () { inp.removeAttribute('readonly'); }); w.appendChild(inp); f.appendChild(w);
  var er = el('div', 'st'); f.appendChild(er);
  function ok() {
    if (!CRED || inp.value !== CRED.p) { er.textContent = 'Sandi tidak cocok'; er.className = 'st bad'; inp.value = ''; return; }
    er.textContent = 'Menyimpan\u2026'; er.className = 'st'; bOk.disabled = true;
    kirimAtur({ fisik: hidup, konfirmasi: inp.value }).then(function () {
      setFisikSaja(hidup); tutupModal(); sesudah();
      renderBeranda(); renderRekap(); renderKelAll(); if (typeof ANG !== 'undefined' && ANG && typeof renderAngkaIsi === 'function') renderAngkaIsi();
      toast(hidup ? 'Masa peralihan dihidupkan.' : 'Masa peralihan dimatikan.');
    }).catch(function (e) { bOk.disabled = false; er.textContent = e.message; er.className = 'st bad'; inp.value = ''; });
  }
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ok(); } });
  var bt = el('div', 'toolbar'); var bOk = btn(hidup ? 'Ya, hidupkan' : 'Ya, matikan', 'wide', ok); bt.appendChild(bOk); bt.appendChild(document.createTextNode(' ')); bt.appendChild(btn('Batal', 'wide plain', function () { tutupModal(); }));
  f.appendChild(bt); bukaModal(hidup ? 'Hidupkan masa peralihan?' : 'Matikan masa peralihan?', f);
}
function pasangSetelan() {
  var cb = $('cardBan'), ca = $('cardApp'), tp = $('tabP');
  if (tp) tp.style.display = utama() ? '' : 'none'; if (!utama() && $('secP')) $('secP').setAttribute('data-ptab', 'akun');
  if (cb) cb.style.display = utama() ? '' : 'none'; if (ca) ca.style.display = utama() ? '' : 'none';
  var pt = $('peranTxt'); if (pt) pt.textContent = utama() ? 'Admin kecamatan' : (PERAN ? 'Petugas/operator' : '-');
  pasangCadangan();
  if (!utama()) return;
  cb.textContent = ''; cb.appendChild(el('h4', null, 'Foto banner beranda (maksimal 3)'));
  cb.appendChild(el('p', 'hint', 'Foto digeser otomatis di Beranda. Pakai foto mendatar. Hanya admin utama yang dapat mengubah.'));
  var sl = el('div', 'slots');
  for (var i = 0; i < 3; i++) (function (i) {
    var r = el('div', 'slot'), th;
    if (BANNERS[i]) { th = document.createElement('img'); th.src = BANNERS[i]; th.alt = ''; } else th = el('div', 'em', 'Kosong');
    var t = el('div', 't', 'Foto ' + (i + 1)), lb = el('label', 'btn sm fbtn', BANNERS[i] ? 'Ganti' : 'Pilih'), inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.addEventListener('change', function () {
      var f = this.files[0]; this.value = ''; if (!f) return; t.textContent = 'Memproses…';
      gambar(f, 'banner').then(function (d) { return kirimAtur({ bannerIdx: i, banner: d }).then(function () { BANNERS[i] = d; bangunBanner(); pasangSetelan(); }); })
        .catch(function (e) { alert(e.message); pasangSetelan(); });
    });
    lb.appendChild(inp); r.appendChild(th); r.appendChild(t); r.appendChild(lb);
    if (BANNERS[i]) r.appendChild(btn('Hapus', 'sm plain', function () { if (!confirm('Hapus foto ' + (i + 1) + '?')) return; kirimAtur({ bannerIdx: i, banner: '' }).then(function () { BANNERS[i] = ''; bangunBanner(); pasangSetelan(); }).catch(function (e) { alert(e.message); }); }));
    sl.appendChild(r);
  })(i);
  cb.appendChild(sl);
  ca.textContent = ''; ca.appendChild(el('h4', null, 'Pengaturan aplikasi'));
  var w = el('div', 'fld'); w.appendChild(el('label', null, 'Batas waktu pengumpulan laporan (tanggal tiap bulan)'));
  var bi = document.createElement('input'); bi.type = 'number'; bi.min = 1; bi.max = 31; bi.value = BATAS; bi.inputMode = 'numeric'; w.appendChild(bi); ca.appendChild(w);
  ca.appendChild(el('p', 'hint', 'Dipakai untuk menandai Posyandu yang terlambat. Periode laporan: bulanan, mengikuti bulan berjalan.'));
  var st = el('div', 'st'); ca.appendChild(btn('Simpan batas waktu', 'wide', function () {
    var v = parseInt(bi.value, 10); if (!(v >= 1 && v <= 31)) { st.textContent = 'Isi tanggal 1 sampai 31'; st.className = 'st bad'; return; }
    st.textContent = 'Menyimpan…'; st.className = 'st';
    kirimAtur({ batas: v }).then(function () { BATAS = v; st.textContent = 'Tersimpan.'; st.className = 'st ok'; renderBeranda(); renderRekap(); }).catch(function (e) { st.textContent = e.message; st.className = 'st bad'; });
  })); ca.appendChild(st);
  ca.appendChild(el('div', 'kh', 'Batas waktu kelurahan mengantar laporan'));
  var wk = el('div', 'fld'); wk.appendChild(el('label', null, 'Batas kelurahan mengantar laporan fisik ke kecamatan (tanggal tiap bulan)'));
  var bk = document.createElement('input'); bk.type = 'number'; bk.min = 1; bk.max = 31; bk.value = batasKelHari(); bk.inputMode = 'numeric'; wk.appendChild(bk); ca.appendChild(wk);
  ca.appendChild(el('p', 'hint', 'Dipakai sebagai batas bagi kelurahan setelah batas kader. Contoh: laporan Oktober, kader sampai 8 November, kelurahan sampai 15 November.'));
  var stk = el('div', 'st'); ca.appendChild(btn('Simpan batas kelurahan', 'wide', function () {
    var v = parseInt(bk.value, 10); if (!(v >= 1 && v <= 31)) { stk.textContent = 'Isi tanggal 1 sampai 31'; stk.className = 'st bad'; return; }
    stk.textContent = 'Menyimpan…'; stk.className = 'st';
    kirimAtur({ batasKel: v }).then(function () { BATAS_KEL = v; stk.textContent = 'Tersimpan.'; stk.className = 'st ok'; renderBeranda(); }).catch(function (e) { stk.textContent = e.message; stk.className = 'st bad'; });
  })); ca.appendChild(stk);
  ca.appendChild(el('div', 'kh', 'Pengumuman untuk kader'));
  var pw = el('div', 'fld'), pa = document.createElement('textarea'); pa.maxLength = 300; pa.rows = 3; pa.value = PENGUMUMAN; pa.placeholder = 'Contoh: Laporan bulan ini paling lambat tanggal 25.';
  pa.style.cssText = 'width:100%;border:1.5px solid var(--line);border-radius:12px;padding:10px 14px;font-size:16px;font-family:inherit;background:var(--surface);resize:vertical';
  pw.appendChild(pa); ca.appendChild(pw);
  ca.appendChild(el('p', 'hint', 'Tampil di halaman awal aplikasi kader. Maksimal 300 huruf. Kosongkan lalu simpan untuk menghapus.'));
  var sp = el('div', 'st'); ca.appendChild(btn('Simpan pengumuman', 'wide', function () {
    var v = pa.value.replace(/\s+/g, ' ').trim(); sp.textContent = 'Menyimpan…'; sp.className = 'st';
    kirimAtur({ pengumuman: v }).then(function () { PENGUMUMAN = v; pa.value = v; sp.textContent = v ? 'Pengumuman tersimpan.' : 'Pengumuman dihapus.'; sp.className = 'st ok'; }).catch(function (e) { sp.textContent = e.message; sp.className = 'st bad'; });
  })); ca.appendChild(sp);
  ca.appendChild(el('div', 'kh', 'Nomor WhatsApp bantuan untuk kader'));
  var ww = el('div', 'fld'), wi = document.createElement('input'); wi.type = 'tel'; wi.inputMode = 'tel'; wi.maxLength = 20; wi.value = WABANTU ? '+' + WABANTU : ''; wi.placeholder = 'Contoh: 08123456789'; ww.appendChild(wi); ca.appendChild(ww);
  ca.appendChild(el('p', 'hint', 'Tombol WhatsApp muncul di halaman awal aplikasi kader. Awalan 0 otomatis menjadi 62. Kosongkan lalu simpan untuk menyembunyikan tombol.'));
  var swa = el('div', 'st'); ca.appendChild(btn('Simpan nomor', 'wide', function () {
    var v = wi.value.trim(); swa.textContent = 'Menyimpan…'; swa.className = 'st';
    kirimAtur({ wa: v }).then(function () { var n = v.replace(/[^0-9]/g, ''); if (n.indexOf('0') === 0) n = '62' + n.slice(1); WABANTU = n; wi.value = n ? '+' + n : ''; swa.textContent = n ? 'Nomor tersimpan.' : 'Nomor dihapus.'; swa.className = 'st ok'; }).catch(function (e) { swa.textContent = e.message; swa.className = 'st bad'; });
  })); ca.appendChild(swa);
  ca.appendChild(el('div', 'kh', 'Masa peralihan ke aplikasi'));
  var pst = el('div', 'hm'), pbox = el('div'); ca.appendChild(pst); ca.appendChild(pbox);
  function pasangPeralihan() {
    var on = fisikSaja(); pst.textContent = ''; pbox.textContent = '';
    pst.className = 'hm ' + (on ? 'warn' : 'ok');
    pst.appendChild(el('b', null, 'Masa peralihan: ' + (on ? 'HIDUP' : 'MATI') + '. '));
    pst.appendChild(document.createTextNode(on ? 'Berkas fisik tanpa laporan digital tetap dihitung masuk.' : 'Laporan dihitung masuk bila digital dan berkas fisik sudah ada.'));
    pbox.appendChild(el('p', 'hint', on ? 'Hidupkan selama Posyandu belum terbiasa membuat laporan lewat aplikasi. Matikan setelah semua memakai aplikasi. Pilihan ini tersimpan di perangkat ini.' : 'Nyalakan lagi bila ada Posyandu yang masih mengantar laporan kertas tanpa aplikasi. Pilihan ini tersimpan di perangkat ini.'));
    pbox.appendChild(btn(on ? 'Matikan masa peralihan' : 'Hidupkan masa peralihan', on ? 'wide plain' : 'wide', function () { dialogPeralihan(!on, pasangPeralihan); }));
  }
  pasangPeralihan();
  ca.appendChild(el('div', 'kh', 'Catatan perubahan'));
  ca.appendChild(el('p', 'hint', 'Daftar perubahan terakhir pada data Posyandu, SK, operator, banner, dan pengaturan (300 terakhir).'));
  var lg = el('div'), sl2 = el('div', 'st');
  ca.appendChild(btn('Tampilkan catatan perubahan', 'sm line', function () {
    sl2.textContent = 'Memuat…'; sl2.className = 'st'; lg.textContent = '';
    jsonp({ aksi: 'log', u: CRED.u, p: CRED.p }).then(function (r) {
      if (!r || !r.ok) { sl2.textContent = (r && r.pesan) || 'Gagal memuat'; sl2.className = 'st bad'; return; }
      sl2.textContent = r.log.length ? '' : 'Belum ada catatan.'; sl2.className = 'st';
      r.log.slice(0, 100).forEach(function (x) {
        var it = el('div', 'item'); it.appendChild(el('div', 'a', x.a.charAt(0).toUpperCase() + x.a.slice(1)));
        it.appendChild(el('div', 'b', x.t + ' · ' + x.u)); lg.appendChild(it);
      });
    }).catch(function (e) { sl2.textContent = e.message; sl2.className = 'st bad'; });
  })); ca.appendChild(sl2); ca.appendChild(lg);
  ca.appendChild(el('div', 'kh', 'Jenis Posyandu dan kelurahan'));
  ca.appendChild(el('div', 'lt', 'Jenis: Posyandu Balita, Posyandu Lansia. Kelurahan: ' + KEL.join(', ') + '. Ditetapkan sistem agar laporan seragam.'));
  ca.appendChild(el('div', 'kh', 'Cadangkan dan pulihkan'));
  var tb = el('div', 'toolbar');
  tb.appendChild(btn('Cadangkan data', 'sm line', function () {
    var blob = new Blob([JSON.stringify({ versi: 1, tanggal: new Date().toISOString(), batas: BATAS, posyandu: POS }, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'cadangan-pantau-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }));
  var pl = el('label', 'btn sm plain fbtn', 'Pulihkan dari cadangan'), pi = document.createElement('input'); pi.type = 'file'; pi.accept = '.json,application/json';
  pi.addEventListener('change', function () {
    var f = this.files[0]; this.value = ''; if (!f) return; var rd = new FileReader();
    rd.onload = function () { try { var o = JSON.parse(rd.result); if (!Array.isArray(o.posyandu)) throw new Error('Berkas cadangan tidak dikenali'); if (!confirm('Pulihkan ' + o.posyandu.length + ' Posyandu dari cadangan? Data Posyandu sekarang akan diganti.')) return; simpanDaftar(o.posyandu, 'Data dipulihkan.'); } catch (e) { alert(e.message); } };
    rd.readAsText(f);
  });
  pl.appendChild(pi); tb.appendChild(pl); ca.appendChild(tb);
  ca.appendChild(el('p', 'hint', 'Cadangan berisi data Posyandu dan nama kader. Laporan yang sudah masuk tersimpan terpisah di Google Sheets dan Drive.'));
}


/* ---------- Alur kelurahan: lembar pengantar + PDF gabungan ---------- */
/* Pejabat tiap kelurahan (sama dengan data di aplikasi kader). */
var LURAH = {
 "Kayumalue Ngapa": { jabatan: "Lurah Kayumalue Ngapa", nama: "MADAWARNI, S.Pt", nip: "197711162011012001" },
 "Kayumalue Pajeko": { jabatan: "Lurah Kayumalue Pajeko", nama: "SANTI, SE", nip: "197609272010012003" },
 "Mamboro": { jabatan: "Lurah Mamboro", nama: "Moh. Gusfan, S.H", nip: "197310252014071001" },
 "Mamboro Barat": { jabatan: "Plh. Lurah Mamboro Barat", nama: "ARI HENDRO PRIYONO, S.Tr.IP", nip: "199803172021081002" },
 "Taipa": { jabatan: "Lurah Taipa", nama: "MUHAMMAD IQBAL, S.Sos", nip: "197002101992031007" }
};

/* Pembuat QR Code kecil (sama dengan aplikasi kader), dipakai untuk kode di lembar pengantar. */
function qrBuat(teks, paksaMask) {
  var DATA = [0, 16, 28, 44, 64, 86, 108], ECN = [0, 10, 16, 26, 18, 24, 16], BLK = [0, 1, 1, 1, 2, 2, 4];
  var ALIGN = [0, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];
  var b = unescape(encodeURIComponent(String(teks))), by = [], i, j, v;
  for (i = 0; i < b.length; i++) by.push(b.charCodeAt(i));
  for (v = 1; v <= 6; v++) if (by.length <= DATA[v] - 2) break;
  if (v > 6) throw new Error('Teks QR terlalu panjang');
  var nd = DATA[v], bits = [];
  function put(val, len) { for (var k = len - 1; k >= 0; k--) bits.push((val >> k) & 1); }
  put(4, 4); put(by.length, 8); by.forEach(function (x) { put(x, 8); });
  for (i = 0; i < 4 && bits.length < nd * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  var cw = []; for (i = 0; i < bits.length; i += 8) { var x = 0; for (j = 0; j < 8; j++) x = x * 2 + bits[i + j]; cw.push(x); }
  for (i = 0; cw.length < nd; i++) cw.push(i % 2 ? 0x11 : 0xEC);
  // Galois field
  var EXP = [], LOG = []; x = 1;
  for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  function mul(a, c) { return (a && c) ? EXP[(LOG[a] + LOG[c]) % 255] : 0; }
  function gen(n) { var g = [1]; for (var k = 0; k < n; k++) { var ng = new Array(g.length + 1).fill(0); for (var q = 0; q < g.length; q++) { ng[q] ^= g[q]; ng[q + 1] ^= mul(g[q], EXP[k]); } g = ng; } return g; }
  function ec(d, n) { var g = gen(n), r = new Array(n).fill(0); d.forEach(function (c) { var f = c ^ r[0]; r.shift(); r.push(0); for (var q = 0; q < n; q++) r[q] ^= mul(g[q + 1], f); }); return r; }
  var nb = BLK[v], per = Math.floor(nd / nb), blocks = [], ecs = [], pos = 0;
  for (i = 0; i < nb; i++) { var d = cw.slice(pos, pos + per); pos += per; blocks.push(d); ecs.push(ec(d, ECN[v])); }
  var fin = [];
  for (i = 0; i < per; i++) blocks.forEach(function (d) { fin.push(d[i]); });
  for (i = 0; i < ECN[v]; i++) ecs.forEach(function (e) { fin.push(e[i]); });
  var n = 17 + 4 * v, M = [], F = [];
  for (i = 0; i < n; i++) { M.push(new Array(n).fill(0)); F.push(new Array(n).fill(false)); }
  function set(r, c, val) { M[r][c] = val ? 1 : 0; F[r][c] = true; }
  function finder(r, c) { for (var a = -1; a <= 7; a++) for (var d2 = -1; d2 <= 7; d2++) { var rr = r + a, cc = c + d2; if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue; var dark = (a >= 0 && a <= 6 && (d2 === 0 || d2 === 6)) || (d2 >= 0 && d2 <= 6 && (a === 0 || a === 6)) || (a >= 2 && a <= 4 && d2 >= 2 && d2 <= 4); set(rr, cc, dark); } }
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  for (i = 8; i < n - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  var al = ALIGN[v];
  al.forEach(function (r) { al.forEach(function (c) { if (F[r][c]) return; for (var a = -2; a <= 2; a++) for (var d2 = -2; d2 <= 2; d2++) set(r + a, c + d2, Math.max(Math.abs(a), Math.abs(d2)) !== 1); }); });
  for (i = 0; i < 9; i++) { if (!F[8][i]) set(8, i, 0); if (!F[i][8]) set(i, 8, 0); }
  for (i = 0; i < 8; i++) { if (!F[8][n - 1 - i]) set(8, n - 1 - i, 0); if (!F[n - 1 - i][8]) set(n - 1 - i, 8, 0); }
  set(n - 8, 8, 1);
  var dataBits = []; fin.forEach(function (c) { for (var k = 7; k >= 0; k--) dataBits.push((c >> k) & 1); });
  var cells = [], up = true, bi = 0;
  for (var col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (var t = 0; t < n; t++) { var r = up ? n - 1 - t : t; for (var dc = 0; dc < 2; dc++) { var c = col - dc; if (!F[r][c]) cells.push([r, c, bi < dataBits.length ? dataBits[bi] : 0]), bi++; } }
    up = !up;
  }
  var MASK = [function (r, c) { return (r + c) % 2 === 0; }, function (r) { return r % 2 === 0; }, function (r, c) { return c % 3 === 0; }, function (r, c) { return (r + c) % 3 === 0; },
    function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; }, function (r, c) { return (r * c) % 2 + (r * c) % 3 === 0; },
    function (r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; }, function (r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }];
  function fmt(mask) { var d3 = mask, rem = d3; for (var k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >> 9) * 0x537); return ((d3 << 10) | (rem & 0x3ff)) ^ 0x5412; }
  function build(mask) {
    var Q = M.map(function (r) { return r.slice(); });
    cells.forEach(function (q) { Q[q[0]][q[1]] = q[2] ^ (MASK[mask](q[0], q[1]) ? 1 : 0); });
    var f = fmt(mask), bit = function (k) { return (f >> k) & 1; };
    for (var k = 0; k < 15; k++) {
      var b1 = bit(k);
      if (k < 6) Q[k][8] = b1; else if (k < 8) Q[k + 1][8] = b1; else Q[n - 15 + k][8] = b1;
      if (k < 8) Q[8][n - 1 - k] = b1; else if (k < 9) Q[8][15 - k] = b1; else Q[8][15 - k - 1] = b1;
    }
    return Q;
  }
  function pen(Q) {
    var p = 0, a, c, run, k;
    for (a = 0; a < n; a++) { for (var dir = 0; dir < 2; dir++) { run = 1; for (c = 1; c < n; c++) { var cur = dir ? Q[c][a] : Q[a][c], pr = dir ? Q[c - 1][a] : Q[a][c - 1]; if (cur === pr) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } } }
    for (a = 0; a < n - 1; a++) for (c = 0; c < n - 1; c++) if (Q[a][c] === Q[a + 1][c] && Q[a][c] === Q[a][c + 1] && Q[a][c] === Q[a + 1][c + 1]) p += 3;
    var pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = pat.slice().reverse();
    for (a = 0; a < n; a++) for (c = 0; c <= n - 11; c++) for (var d4 = 0; d4 < 2; d4++) { var m1 = true, m2 = true; for (k = 0; k < 11; k++) { var val = d4 ? Q[c + k][a] : Q[a][c + k]; if (val !== pat[k]) m1 = false; if (val !== pat2[k]) m2 = false; } if (m1) p += 40; if (m2) p += 40; }
    var dark = 0; Q.forEach(function (r) { r.forEach(function (x) { dark += x; }); });
    p += Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
    return p;
  }
  var best = null, bp = 1e9;
  for (var mk = 0; mk < 8; mk++) { if (paksaMask !== undefined && mk !== paksaMask) continue; var Q = build(mk), pp = pen(Q); if (pp < bp) { bp = pp; best = Q; } }
  return { n: n, v: v, m: best };
}

var BATAS_KEL = 0, LEMB = {}, LEMB_T = {}, LEMB_BUSY = 0;
function batasKelHari() { return BATAS_KEL || Math.min(31, BATAS + 7); }
function teksBatasKel(th, bl) {
  var m = BULAN.indexOf(bl), ny = +th + (m === 11 ? 1 : 0), nm = (m + 1) % 12, last = new Date(ny, nm + 1, 0).getDate(), d = Math.min(batasKelHari(), last);
  return d + ' ' + BULAN[nm] + (ny !== +th ? ' ' + ny : '');
}
function muatLembarKel(pr, paksa) {
  var k = perKey(pr); if (!CRED) return;
  if (!paksa && LEMB_T[k] && Date.now() - LEMB_T[k] < 30000) return;
  LEMB_T[k] = Date.now();
  jsonp({ aksi: 'lembarkel', u: CRED.u, p: CRED.p, per: k, kel: KELSAYA }, 20000).then(function (r) {
    if (r && r.ok && !LEMB_BUSY) { LEMB[k] = { lembar: r.lembar || [], kunci: r.kunci || {} }; renderBeranda(); }
  }).catch(function () { LEMB_T[k] = 0; });
}
var PDFLIB_P = null;
function muatPdfLib() {
  if (window.PDFLib) return Promise.resolve(window.PDFLib);
  if (PDFLIB_P) return PDFLIB_P;
  PDFLIB_P = new Promise(function (res, rej) {
    var s = document.createElement('script'); s.src = 'pdf-lib.min.js?v=1171';
    s.onload = function () { window.PDFLib ? res(window.PDFLib) : (PDFLIB_P = null, rej(new Error('Alat PDF tidak termuat'))); };
    s.onerror = function () { PDFLIB_P = null; rej(new Error('Alat penyusun PDF belum bisa dimuat. Periksa internet lalu coba lagi.')); };
    document.head.appendChild(s);
  });
  return PDFLIB_P;
}
function teksWin(t) { return String(t == null ? '' : t).replace(/[^\x20-\x7E\xA0-\xFF]/g, '?'); }
function tglIdLembar(iso) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
function ketItem(it) {
  if (it.st === 'ikut') return 'Diantar';
  if (it.st === 'diterima') return 'Sudah diterima kecamatan' + (it.terima && it.terima.tgl ? ' ' + tglIdLembar(it.terima.tgl) : '');
  if (it.st === 'tahan') return 'Tidak diantar kali ini';
  if (it.st === 'pdfbelum') return 'PDF laporan belum tersimpan';
  return 'Belum mengirim laporan ke kelurahan';
}
/* Satu halaman lembar pengantar (tanda terima). Hanya tanda tangan penerima dan tanggal diterima yang dikosongkan. */
function gambarLembar(doc, F, lm, label) {
  var pg = doc.addPage([595.28, 841.89]), W = 595.28, M = 56, rgb = PDFLib.rgb, abu = rgb(.42, .45, .47), gelap = rgb(.1, .14, .12);
  var reg = F.reg, bold = F.bold, ln = function (x1, y1, x2, y2, t, c) { pg.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: t || .6, color: c || rgb(.78, .8, .79) }); };
  var tx = function (t, x, y, s, f, c) { pg.drawText(teksWin(t), { x: x, y: y, size: s || 11, font: f || reg, color: c || gelap }); };
  var tengah = function (t, y, s, f, c) { var fo = f || reg; tx(t, (W - fo.widthOfTextAtSize(teksWin(t), s)) / 2, y, s, fo, c); };
  var kananT = function (t, xr, y, s, f, c) { var fo = f || reg; tx(t, xr - fo.widthOfTextAtSize(teksWin(t), s), y, s, fo, c); };
  ln(M, 800, W - M, 800); kananT(label, W - M, 808, 8, bold, abu);
  tengah('TANDA TERIMA LAPORAN POSYANDU', 756, 17, bold); tengah('BUKTI PENYERAHAN DOKUMEN', 738, 9, reg, abu);
  var o = lm.items, ikut = o.filter(function (x) { return x.st === 'ikut'; }).length;
  tx('Telah diterima Laporan Posyandu dari Kelurahan ' + lm.kel, M, 698, 11);
  tx('untuk Kantor Kecamatan Palu Utara, Kota Palu.', M, 682, 11);
  tx('DETAIL DOKUMEN', M, 648, 10, bold, rgb(.12, .25, .2));
  function baris(l, v, y) { tx(l, M + 28, y, 11, bold); tx(':', M + 190, y, 11); tx(v, M + 202, y, 11); ln(M + 198, y - 6, W - M - 90, y - 6, .5, rgb(.85, .87, .86)); }
  baris('Laporan Posyandu Bulan', lm.bln + ' ' + lm.thn, 624); baris('Jumlah Laporan', ikut + ' laporan', 600);
  // daftar laporan
  var y0 = 566, tinggi = Math.max(13, Math.min(19, Math.floor(250 / Math.max(1, o.length)))), x1 = M, x2 = M + 28, x3 = M + 180, x4 = M + 262, ke = W - M;
  pg.drawRectangle({ x: M, y: y0 - 3, width: ke - M, height: 16, color: rgb(.93, .95, .94) });
  tx('No', x1 + 4, y0 + 1, 8.5, bold); tx('Posyandu', x2, y0 + 1, 8.5, bold); tx('Jenis', x3, y0 + 1, 8.5, bold); tx('Keterangan', x4, y0 + 1, 8.5, bold);
  var y = y0 - tinggi;
  o.forEach(function (it, i) {
    tx(String(i + 1), x1 + 4, y + 1, 9); tx(it.nama, x2, y + 1, 9); tx(it.jenis.replace('Posyandu ', ''), x3, y + 1, 9);
    if (it.st === 'ikut' || it.st === 'diterima') { var g = rgb(.1, .55, .28); pg.drawLine({ start: { x: x4, y: y + 4 }, end: { x: x4 + 3, y: y + 1 }, thickness: 1.5, color: g }); pg.drawLine({ start: { x: x4 + 3, y: y + 1 }, end: { x: x4 + 9, y: y + 9 }, thickness: 1.5, color: g }); }
    else { var m = rgb(.75, .2, .15); pg.drawLine({ start: { x: x4, y: y + 1 }, end: { x: x4 + 8, y: y + 9 }, thickness: 1.5, color: m }); pg.drawLine({ start: { x: x4, y: y + 9 }, end: { x: x4 + 8, y: y + 1 }, thickness: 1.5, color: m }); }
    tx(ketItem(it), x4 + 15, y + 1, 9);
    ln(M, y - 4, ke, y - 4, .4, rgb(.88, .9, .89)); y -= tinggi;
  });
  y -= 6;
  tx('Diterima tanggal: ........ / ........ / ' + lm.tgl.slice(0, 4), M, y, 11, reg); tx('', M, y, 1);
  var ys = y - 38, xk = M + 40, xr = W - M - 190, lu = LURAH[lm.kel] || { jabatan: 'Lurah ' + lm.kel, nama: '........................', nip: '........................' };
  var pusat = function (t, xc, yy, s, f) { var fo = f || reg; tx(t, xc - fo.widthOfTextAtSize(teksWin(t), s) / 2, yy, s, fo); };
  pusat('Yang Menyerahkan,', xk + 75, ys, 11, bold); pusat(lu.jabatan, xk + 75, ys - 14, 10);
  pusat('Yang Menerima,', xr + 75, ys, 11, bold); pusat('Pihak Kecamatan', xr + 75, ys - 14, 10);
  var yn = ys - 84;
  pusat('( ' + lu.nama + ' )', xk + 75, yn, 10.5); pusat('NIP. ' + lu.nip, xk + 75, yn - 14, 10);
  pusat('( ................................ )', xr + 75, yn, 10.5);
  // kode QR kecil di kanan bawah
  var url = new URL('terima.html', location.href).href.replace(/[?#].*$/, '') + '?k=' + lm.kode, q = qrBuat(url), S = 2.1, Z = 2, N = (q.n + 2 * Z) * S, qx = W - M - N, qy = 66;
  for (var r = 0; r < q.n; r++) for (var c = 0; c < q.n; c++) if (q.m[r][c]) pg.drawRectangle({ x: qx + (c + Z) * S, y: qy + (q.n - 1 - r + Z) * S, width: S + .15, height: S + .15, color: rgb(0, 0, 0) });
  kananT('Pindai di aplikasi Terima', W - M, qy - 8, 6.5, reg, abu);
  ln(M, 50, W - M, 50); tengah('Tanda Terima Laporan Posyandu  \u00b7  Kode ' + lm.kode + '  \u00b7  dibuat ' + tglIdLembar(lm.tgl) + ' ' + lm.jam, 38, 7.5, reg, abu);
  return pg;
}
function ambilPdfBytes(nomor) {
  return jsonp({ aksi: 'pdf', u: CRED.u, p: CRED.p, n: nomor }, 90000).then(function (r) {
    if (!r || !r.ok) throw new Error((r && r.pesan) || 'PDF laporan tidak bisa diambil');
    var bin = atob(r.b64), arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return arr;
  });
}
/* Susun satu PDF: lembar pengantar (2 salinan) lalu semua laporan yang ikut diantar. */
async function susunPdfGabungan(lm, info) {
  var P = await muatPdfLib(), doc = await P.PDFDocument.create();
  var F = { reg: await doc.embedFont(P.StandardFonts.Helvetica), bold: await doc.embedFont(P.StandardFonts.HelveticaBold) };
  gambarLembar(doc, F, lm, 'UNTUK KECAMATAN'); gambarLembar(doc, F, lm, 'ARSIP KELURAHAN');
  var ikut = lm.items.filter(function (x) { return x.st === 'ikut'; });
  for (var i = 0; i < ikut.length; i++) {
    info('Mengambil laporan ' + (i + 1) + ' dari ' + ikut.length + '…');
    var by = await ambilPdfBytes(ikut[i].nomor), src = await P.PDFDocument.load(by, { ignoreEncryption: true }), hal = await doc.copyPages(src, src.getPageIndices());
    hal.forEach(function (h) { doc.addPage(h); });
  }
  info('Menyusun PDF…');
  var bytes = await doc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
async function unduhGabungan(lm, info) {
  var blob = await susunPdfGabungan(lm, info);
  unduhBerkas(blob, 'Antar Laporan ' + lm.kel + ' ' + lm.bln + ' ' + lm.thn + '.pdf');
}
function kartuAntar(box, h, pr, gabung) {
  muatLembarKel(pr); var k = perKey(pr), D = LEMB[k], S = SETOR[k] || {}, c = gabung ? box : el('div', 'card antar');
  if (gabung) { var sj = el('div', 'kh', 'Centang yang akan diantar ke kecamatan'); sj.style.marginTop = '12px'; c.appendChild(sj); } else c.appendChild(el('h4', null, 'Antar laporan ke kecamatan' + (periodeOpList().length > 1 ? ' · ' + pr.bl : '')));
  c.appendChild(el('div', 'lt', 'Batas mengantar laporan fisik ke kecamatan: tanggal ' + teksBatasKel(pr.th, pr.bl) + '.'));
  c.appendChild(el('p', 'hint', (gabung ? '' : 'Centang laporan yang akan diantar. ') + 'Setelah lembar dibuat, laporan yang ikut tidak bisa dikirim ulang oleh kader kecuali Anda membukanya kembali.'));
  var cek = {}, rows = h.rows.slice().sort(function (a, b) { return a.p.jenis.localeCompare(b.p.jenis) || a.p.nama.localeCompare(b.p.nama); }), siap = 0;
  rows.forEach(function (r) {
    var diterima = S[r.p.id], ada = !!(r.d && r.d.pdf), terkunci = !!(D && D.kunci[r.p.id]), it = el('div', 'item ' + (r.d ? 'op-g' : diterima ? 'op-y' : 'op-r')), lb = document.createElement('label');
    it.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;flex-wrap:wrap'; lb.style.cssText = 'display:flex;align-items:center;gap:10px;flex:1;min-width:200px;min-height:44px;cursor:pointer';
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = ada && !diterima; cb.disabled = !ada || !!diterima; cb.style.cssText = 'width:22px;height:22px;flex:none'; cek[r.p.id] = cb; if (cb.checked) siap++;
    lb.appendChild(cb); var tb = el('div'); tb.appendChild(el('b', null, r.p.nama + ' · ' + r.p.jenis.replace('Posyandu ', '')));
    var ket = diterima ? 'Sudah diterima kecamatan ' + tglId(diterima) : !r.d ? 'Belum mengirim laporan ke kelurahan' : !r.d.pdf ? 'PDF laporan belum tersimpan' : terkunci ? 'Siap diantar · terkunci (sudah dicetak)' : 'Siap diantar';
    var sm = el('div', null, ket); sm.style.cssText = 'font-size:13px;color:var(--muted)'; tb.appendChild(sm); lb.appendChild(tb); it.appendChild(lb);
    var pl = el('span', 'pill'), pt = diterima ? (r.d ? 'Sudah diterima kecamatan' : 'Fisik diterima, belum lewat aplikasi') : !r.d ? (r.st === 'lewat' ? 'Belum kirim (terlambat)' : 'Belum kirim') : r.st === 'telat' ? 'Masuk terlambat' : 'Siap diantar';
    pl.textContent = pt; pl.style.cssText = 'white-space:nowrap;font-size:12px;font-weight:700;border-radius:99px;padding:3px 10px;' + (diterima && r.d ? 'background:var(--ok-soft);color:var(--ok)' : diterima ? 'background:var(--accent-soft);color:var(--accent-text)' : !r.d ? 'background:var(--none);color:var(--muted)' : 'background:var(--accent-soft);color:var(--accent-text)'); it.appendChild(pl);
    if (r.d && r.d.pdf) it.appendChild(tombolPdf(r.d));
    if (!r.d && r.p.hp) { var wa = document.createElement('a'); wa.className = 'btn sm kc wa'; wa.target = '_blank'; wa.rel = 'noopener'; wa.textContent = 'Ingatkan lewat WhatsApp'; wa.href = 'https://wa.me/' + nomorWA(r.p.hp) + '?text=' + encodeURIComponent(pesanWA(r.p, pr, r.st === 'lewat')); it.appendChild(wa); }
    var bn = btn(r.p.hp ? 'Ubah no. HP' : '+ No. HP', 'sm kc plain', function () { formNomor(r.p); }); if (!r.p.hp) { bn.style.color = 'var(--ink-orange)'; bn.style.borderColor = 'var(--ink-orange)'; } it.appendChild(bn);
    if (terkunci && !diterima) it.appendChild(btn('Buka kembali', 'sm kc plain', function () {
      var a = prompt('Alasan membuka kembali laporan ' + r.p.nama + ' (kader akan bisa mengirim ulang):'); if (a == null) return; a = a.trim(); if (a.length < 3) { toast('Tulis alasan singkat.'); return; }
      LEMB_BUSY++; kirimAtur({ aksi: 'bukalaporan', per: k, pid: r.p.id, alasan: a }).then(function () { LEMB_BUSY--; toast('Laporan dibuka kembali. Kader bisa mengirim ulang.'); muatLembarKel(pr, true); })
        .catch(function (e) { LEMB_BUSY--; toast(e.message || 'Gagal membuka kembali'); });
    }));
    c.appendChild(it);
  });
  var st = el('div', 'st'); st.style.margin = '8px 0';
  var tb = btn('Buat lembar pengantar dan unduh PDF', 'wide', function (ev) {
    var b = ev.currentTarget || ev.target, tahan = rows.filter(function (r) { return !cek[r.p.id].checked && !cek[r.p.id].disabled; }).map(function (r) { return r.p.id; });
    var ikut = rows.filter(function (r) { return cek[r.p.id].checked; }).length; if (!ikut) { st.textContent = 'Centang minimal satu laporan.'; st.className = 'st bad'; return; }
    if (!confirm('Buat lembar pengantar untuk ' + ikut + ' laporan?\n\nSetelah dibuat, laporan ini terkunci dan kader tidak bisa mengirim ulang sampai Anda membukanya kembali.')) return;
    var awal = b.textContent; b.disabled = true; st.className = 'st'; st.textContent = 'Membuat lembar pengantar…'; LEMB_BUSY++;
    kirimAtur({ aksi: 'lembar', per: k, tahan: tahan }).then(function (r) {
      if (!r || !r.lembar) throw new Error('Lembar tidak terbentuk'); return unduhGabungan(r.lembar, function (t) { st.textContent = t; });
    }).then(function () { st.textContent = 'PDF diunduh. Cetak, tanda tangani, lalu antar ke kecamatan.'; st.className = 'st ok'; })
      .catch(function (e) { st.textContent = (e.message || 'Gagal') + ' Jika lembar sudah terbentuk, tekan "Unduh ulang lembar terakhir".'; st.className = 'st bad'; })
      .then(function () { LEMB_BUSY--; b.disabled = false; b.textContent = awal; muatLembarKel(pr, true); muatSetor(pr, true); });
  });
  tb.disabled = !siap && !rows.some(function (r) { return !cek[r.p.id].disabled; }); c.appendChild(tb);
  var akt = D && D.lembar.filter(function (x) { return !x.ganti; })[0];
  if (akt) {
    var terima = akt.items.filter(function (x) { return x.terima; }).length, ikutN = akt.items.filter(function (x) { return x.st === 'ikut' || x.st === 'diterima'; }).length;
    c.appendChild(el('div', 'lt', 'Lembar terakhir: dibuat ' + tglId(akt.tgl) + ' ' + akt.jam + ' · ' + terima + ' dari ' + ikutN + ' laporan sudah diterima kecamatan.'));
    c.appendChild(btn('Unduh ulang lembar terakhir', 'sm plain', function (ev) {
      var b = ev.currentTarget || ev.target, awal = b.textContent; b.disabled = true;
      unduhGabungan(akt, function (t) { b.textContent = t; }).then(function () { toast('PDF diunduh.'); }).catch(function (e) { toast(e.message || 'Gagal'); }).then(function () { b.disabled = false; b.textContent = awal; });
    }));
  }
  c.appendChild(st); if (!gabung) box.appendChild(c);
}

/* ---------- kait ke aplikasi utama ---------- */
window.terimaProfil = function (r) {
  BANNERS = (r.banners || ['', '', '']).slice(0, 3); while (BANNERS.length < 3) BANNERS.push('');
  if (r.batas) BATAS = r.batas; if (r.batasKel !== undefined) BATAS_KEL = r.batasKel || 0; if (r.sk) SK = r.sk; if (r.pengumuman !== undefined) PENGUMUMAN = r.pengumuman || ''; if (r.wa !== undefined) WABANTU = r.wa || '';
  if (r.ruang !== undefined) RUANG = r.ruang;
  /* Sekali saja: filter bawaan ikut bulan laporan yang sedang dikumpulkan, bila belum diubah pengguna. */
  if (!window.__filterAwal) {
    window.__filterAwal = 1;
    var now0 = new Date(), fb0 = $('fb'), ft0 = $('ft'), pa = periodeAktif(now0);
    if (fb0 && ft0 && fb0.value === BULAN[now0.getMonth()] && ft0.value === String(now0.getFullYear()) && (pa.bl !== fb0.value || pa.th !== ft0.value)) {
      var ada = false; Array.prototype.forEach.call(ft0.options, function (o) { if (o.value === pa.th) ada = true; });
      if (!ada) { var op0 = document.createElement('option'); op0.value = pa.th; op0.textContent = pa.th; ft0.insertBefore(op0, ft0.firstChild); }
      fb0.value = pa.bl; ft0.value = pa.th;
      if (typeof tampil === 'function') { try { tampil(); } catch (e) {} }
    }
  }
  bangunBanner(); renderBeranda();
};
window.pasangExt = function () { pasangSetelan(); };
window.ambilPos = function () {
  if (!CRED) return;
  jsonp({ aksi: 'posyandu', u: CRED.u, p: CRED.p }).then(function (r) {
    if (r && r.ok) { POS = r.list || []; SK = r.sk || SK; SERVER_ALIAS = !!(r.fitur && r.fitur.indexOf('alias') >= 0); POSOK = true; POSDIMUAT = true; renderData(); renderBeranda(); renderRekap(); }
  }).catch(function () { });
};

/* ---------- Menu Kelurahan bertingkat (komputer): Kelurahan, lalu Posyandu ---------- */
var KSEL = { kel: '', pos: '' }, POHON_BUKA = {};
function posDiKel(kel) { return posAktif().filter(function (p) { return p.kel === kel; }).sort(function (a, b) { return a.jenis.localeCompare(b.jenis) || a.nama.localeCompare(b.nama); }); }
function pilihKel(kel, pos) {
  KSEL.kel = kel; KSEL.pos = pos || ''; POHON_BUKA[kel] = true;
  if (typeof go === 'function') go('k');
}
function renderPohon() {
  var box = $('pohonKel'); if (!box) return; box.textContent = '';
  var pr = periodeBeranda(), h = hitung(pr.th, pr.bl), ada = false;
  box.appendChild(el('h5', 'ph5', 'KELURAHAN'));
  KEL.forEach(function (kel) {
    var l = h.rows.filter(function (r) { return r.p.kel === kel; }); if (!l.length) return; ada = true;
    var m = l.filter(function (r) { return lengkap(r, pr); }).length, buka = !!POHON_BUKA[kel];
    var b = el('button', 'kn' + (buka ? ' open' : '') + (KSEL.kel === kel && !KSEL.pos && $('app').getAttribute('data-view') === 'k' ? ' on' : ''));
    b.type = 'button'; b.appendChild(el('span', 'kt', kel)); b.appendChild(el('i', null, m + ' / ' + l.length)); b.appendChild(el('span', 'kc2', ''));
    b.addEventListener('click', function () {
      if (KSEL.kel === kel && !KSEL.pos && $('app').getAttribute('data-view') === 'k') { POHON_BUKA[kel] = !POHON_BUKA[kel]; renderPohon(); return; }
      pilihKel(kel, '');
    });
    box.appendChild(b);
    if (buka) l.slice().sort(function (a, c) { return a.p.jenis.localeCompare(c.p.jenis) || a.p.nama.localeCompare(c.p.nama); }).forEach(function (r) {
      var pb = el('button', 'pn' + (KSEL.pos === r.p.id ? ' on' : '')); pb.type = 'button';
      pb.appendChild(el('span', 'dt ' + (lengkap(r, pr) ? 'g' : 'r'), '')); pb.appendChild(el('span', 'pt', r.p.nama)); pb.appendChild(el('i', null, r.p.jenis.replace('Posyandu ', '')));
      pb.addEventListener('click', function () { pilihKel(kel, r.p.id); });
      box.appendChild(pb);
    });
  });
  if (!ada) box.textContent = '';
}
function tileKel(cls, n, lbl) { var d = el('div', 'kt4 ' + cls); d.appendChild(el('b', null, n)); d.appendChild(el('span', null, lbl)); return d; }
function jejak(kel, pos) {
  var d = el('div', 'bc'); var a = el('a', 'bcl', 'Beranda'); a.href = '#'; a.addEventListener('click', function (e) { e.preventDefault(); go('b'); }); d.appendChild(a); d.appendChild(document.createTextNode(' › '));
  if (pos) { var k = el('a', 'bcl', kel); k.href = '#'; k.addEventListener('click', function (e) { e.preventDefault(); pilihKel(kel, ''); }); d.appendChild(k); d.appendChild(document.createTextNode(' › ')); d.appendChild(el('b', null, pos)); }
  else d.appendChild(el('b', null, kel));
  return d;
}
function renderKelHal() {
  var box = $('kelBox'); if (!box) return; box.textContent = '';
  if (!KSEL.kel) { box.appendChild(el('div', 'card', 'Pilih kelurahan dari Beranda.')); return; }
  var pr = periodeBeranda(), h = hitung(pr.th, pr.bl); muatSetor(pr);
  var rows = h.rows.filter(function (r) { return r.p.kel === KSEL.kel; }).sort(function (a, b) { return a.p.jenis.localeCompare(b.p.jenis) || a.p.nama.localeCompare(b.p.nama); });
  if (KSEL.pos) { renderPosHal(box, h, pr, rows); return; }
  var m = rows.filter(function (r) { return lengkap(r, pr); }).length, pc = persen(m, rows.length), S = SETOR[perKey(pr)] || {};
  box.appendChild(jejak(KSEL.kel, ''));
  var hd = el('h2', 'kh2', 'Kelurahan ' + KSEL.kel); box.appendChild(hd);
  box.appendChild(el('div', 'lt kh2s', rows.length + ' Posyandu · ' + pr.bl + ' ' + pr.th));
  var g = el('div', 'kgrid'); g.appendChild(tileKel('a', rows.length, 'Total Posyandu')); g.appendChild(tileKel('b', m, 'Sudah masuk')); g.appendChild(tileKel('c', rows.length - m, 'Belum masuk'));
  var cp = tileKel('d', pc + '%', 'Capaian'); var br = el('div', 'bar'); br.appendChild(document.createElement('i')).style.width = pc + '%'; cp.appendChild(br); g.appendChild(cp); box.appendChild(g);
  var c = el('div', 'card'), tb = el('table', 'ktab'), th = el('tr');
  ['Posyandu', 'Jenis', 'Status', 'Diserahkan ke kecamatan', ''].forEach(function (t) { th.appendChild(el('th', null, t)); }); tb.appendChild(th);
  if (!rows.length) c.appendChild(el('div', 'empty', 'Belum ada Posyandu terdaftar di kelurahan ini.'));
  rows.forEach(function (r) {
    var tr = el('tr'), n = el('td'); n.appendChild(el('span', 'dt ' + (lengkap(r, pr) ? 'g' : 'r'), '')); n.appendChild(el('b', null, r.p.nama)); tr.appendChild(n);
    tr.appendChild(el('td', null, r.p.jenis.replace('Posyandu ', ''))); var st = el('td'); st.appendChild(pillKec(r, pr)); tr.appendChild(st);
    tr.appendChild(el('td', null, S[r.p.id] ? tglId(S[r.p.id]) : '-'));
    var bt = el('td'); bt.appendChild(btn('Buka', 'sm', function () { pilihKel(KSEL.kel, r.p.id); })); tr.appendChild(bt); tb.appendChild(tr);
  });
  c.appendChild(tb); box.appendChild(c);
}
function angkaLap(d) {
  if (!d || typeof ambil !== 'function') return null;
  var a = ambil(d).filter(function (x) { return x.b === d.bln; })[0] || ambil(d)[0]; return a ? a.v : null;
}
function renderPosHal(box, h, pr, rows) {
  var r = rows.filter(function (x) { return x.p.id === KSEL.pos; })[0];
  if (!r) { KSEL.pos = ''; renderKelHal(); return; }
  var p = r.p, bal = p.jenis === J_B(), v = angkaLap(r.d) || {}, fm = function (x) { return (x === '' || x == null) ? '-' : x; };
  box.appendChild(jejak(KSEL.kel, p.nama));
  var hd = el('h2', 'kh2', 'Posyandu ' + p.nama + ' '); var pl = pillKec(r, pr); pl.style.verticalAlign = 'middle'; hd.appendChild(pl); box.appendChild(hd);
  box.appendChild(el('div', 'lt kh2s', p.jenis.replace('Posyandu ', '') + ' · Kelurahan ' + p.kel + ' · ' + pr.bl + ' ' + pr.th));
  var S = bal ? v['Sasaran Bayi Balita (S)'] : v['Sasaran lansia'], D = bal ? v['Kunjungan (D)'] : v['Kunjungan lansia'];
  var cap = (S !== '' && S != null && D !== '' && D != null && +S) ? Math.round(D * 100 / S) : null;
  var g = el('div', 'kgrid');
  g.appendChild(tileKel('a', fm(S), bal ? 'Sasaran balita' : 'Sasaran lansia')); g.appendChild(tileKel('b', fm(D), 'Kunjungan'));
  g.appendChild(tileKel('c', bal ? fm(v['BGM']) : fm(S !== '' && D !== '' && S != null && D != null ? Math.max(0, S - D) : ''), bal ? 'BGM' : 'Belum berkunjung'));
  var cp = tileKel('d', cap == null ? '-' : cap + '%', 'Capaian kunjungan'); var br = el('div', 'bar'); br.appendChild(document.createElement('i')).style.width = (cap || 0) + '%'; cp.appendChild(br); g.appendChild(cp); box.appendChild(g);
  var two = el('div', 'ktwo'), c = el('div', 'card'); c.appendChild(el('h4', null, 'Riwayat laporan'));
  var now = { th: +pr.th, m: BULAN.indexOf(pr.bl) }, awal = null;
  DATA.forEach(function (d) { var k = (+d.thn) * 12 + BULAN.indexOf(d.bln); if (awal == null || k < awal) awal = k; });
  var tb = el('table', 'ktab'), th = el('tr'); ['Bulan', 'Status', 'Diserahkan', ''].forEach(function (t) { th.appendChild(el('th', null, t)); }); tb.appendChild(th);
  for (var i = 0; i < 6; i++) {
    var idx = now.th * 12 + now.m - i; if (awal != null && idx < awal) break;
    var q = { th: String(Math.floor(idx / 12)), bl: BULAN[idx % 12] }, hh = hitung(q.th, q.bl), rr = hh.rows.filter(function (x) { return x.p.id === p.id; })[0]; if (!rr) continue;
    if (i) muatSetor(q);
    var tr = el('tr'); tr.appendChild(el('td', null, q.bl + ' ' + q.th)); var st = el('td'); st.appendChild(pillKec(rr, q)); tr.appendChild(st);
    var sv = (SETOR[perKey(q)] || {})[p.id]; tr.appendChild(el('td', null, sv ? tglId(sv) : '-'));
    var bt = el('td'); if (rr.d && rr.d.pdf) bt.appendChild(tombolPdf(rr.d)); tr.appendChild(bt); tb.appendChild(tr);
  }
  c.appendChild(tb); two.appendChild(c);
  var k = el('div', 'card'); k.appendChild(el('h4', null, 'Kontak')); k.appendChild(barisPos(r, pr)); two.appendChild(k); box.appendChild(two);
}
function renderKelAll() { renderPohon(); if ($('app').getAttribute('data-view') === 'k') renderKelHal(); }
window.tampilBaru = function () { renderBeranda(); renderRekap(); renderData(); renderKelAll(); };
window.setelahKeluar = function () { TRM_BARU = null; TRM_TAMBAH = false; SETOR_VIA = {}; SETOR = {}; SETOR_T = {}; SETOR_BUSY = 0; SETOR_OPEN = {}; BELUM_OPEN = {}; KSEL = { kel: '', pos: '' }; POHON_BUKA = {}; LEMB = {}; LEMB_T = {}; LEMB_BUSY = 0; terapKel(''); RUANG = null; CAD = null; POS = []; SK = {}; BANNERS = ['', '', '']; POSOK = false; bangunBanner(); tutupMenu(); tutupModal(); };
document.addEventListener('DOMContentLoaded', function () { bangunBanner(); });
if (document.readyState !== 'loading') bangunBanner();
})();


/* ---------- akun aplikasi Terima Posyandu (khusus admin kecamatan): banyak petugas, masing-masing bernama (maksimal 10) ---------- */
var TRM_BARU = null, TRM_TAMBAH = false, MAKS_TRM = 10;
function trmTautanAmbil(u) { try { return (JSON.parse(localStorage.getItem('pantau_trm_tautan') || '{}'))[u] || ''; } catch (e) { return ''; } }
function trmTautanSimpan(u, v) { try { var o = JSON.parse(localStorage.getItem('pantau_trm_tautan') || '{}'); if (v) o[u] = v; else delete o[u]; localStorage.setItem('pantau_trm_tautan', JSON.stringify(o)); } catch (e) {} }
function trmAcak(n, abc) { var r = new Uint32Array(n), s = '', i; (window.crypto || window.msCrypto).getRandomValues(r); for (i = 0; i < n; i++) s += abc.charAt(r[i] % abc.length); return s; }
function trmWaktu(ts) {
  if (!ts) return 'Belum pernah dipakai';
  var d = new Date(ts), n = new Date(), mnt = Math.round((n - d) / 60000);
  if (mnt < 2) return 'Terakhir dipakai baru saja';
  if (mnt < 60) return 'Terakhir dipakai ' + mnt + ' menit lalu';
  var jam = ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2);
  if (d.toDateString() === n.toDateString()) return 'Terakhir dipakai hari ini ' + jam;
  return 'Terakhir dipakai ' + d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()] + ' ' + jam;
}
window.pasangPenerima = function () {
  var c = $('cardTrm'), adm = $('cardAdm');
  if (!adm) return;
  if (!c) { c = el('div', 'card'); c.id = 'cardTrm'; c.setAttribute('data-tab', 'pengguna'); var adm2 = $('cardAdm2') || adm; adm2.parentNode.insertBefore(c, adm2.nextSibling); }
  c.style.display = PERAN === 'utama' ? '' : 'none'; if (PERAN !== 'utama') return;
  c.textContent = '';
  var L = Array.isArray(PENERIMA) ? PENERIMA : (PENERIMA && PENERIMA.u ? [PENERIMA] : []);
  c.appendChild(el('h4', null, 'Aplikasi Terima Posyandu'));
  var link = new URL('terima.html', location.href).href;
  c.appendChild(el('p', 'hint', 'Aplikasi terpisah untuk mencatat penerimaan laporan fisik dengan memindai QR laporan atau lembar pengantar. Beri satu tautan untuk tiap petugas supaya tercatat siapa yang menerima. Alamat: ' + link));
  var hd = el('div', 'trmhd'); hd.appendChild(el('b', null, 'Petugas penerima (' + L.length + ' dari ' + MAKS_TRM + ')'));
  var bTam = el('button', 'btn sm', '+ Tambah penerima'); bTam.type = 'button'; bTam.disabled = L.length >= MAKS_TRM;
  bTam.addEventListener('click', function () { TRM_TAMBAH = !TRM_TAMBAH; TRM_BARU = null; pasangPenerima(); });
  hd.appendChild(bTam); c.appendChild(hd);
  if (!L.length && !TRM_TAMBAH) c.appendChild(el('p', 'hint', 'Belum ada petugas penerima. Tekan "+ Tambah penerima".'));
  function kotakTautan(o) {
    var bx = el('div', 'trmbox');
    bx.appendChild(el('p', 'hint', 'Tautan untuk ' + o.nama + '. Buka SEKALI di HP petugas itu; setelah itu aplikasi langsung bisa dipakai tanpa mengetik sandi. Jangan dibagikan ke kader.'));
    var inp = el('input'); inp.type = 'text'; inp.readOnly = true; inp.value = o.link; inp.addEventListener('focus', function () { inp.select(); });
    bx.appendChild(inp);
    var r2 = el('div', 'trmbtn'), bs = el('button', 'btn sm', 'Salin tautan'); bs.type = 'button';
    bs.addEventListener('click', function () { try { navigator.clipboard.writeText(o.link).then(function () { bs.textContent = 'Tersalin'; }, function () { inp.select(); }); } catch (x) { inp.select(); } });
    var bw = el('a', 'btn sm plain', 'Kirim lewat WhatsApp'); bw.target = '_blank'; bw.rel = 'noopener'; bw.href = 'https://wa.me/?text=' + encodeURIComponent('Tautan akses aplikasi Terima Posyandu untuk ' + o.nama + ' (jangan dibagikan): ' + o.link);
    r2.appendChild(bs); r2.appendChild(bw); bx.appendChild(r2); return bx;
  }
  if (TRM_TAMBAH) {
    var fm = el('div', 'trmadd'); fm.appendChild(el('label', null, 'Nama petugas penerima'));
    var inN = el('input'); inN.type = 'text'; inN.maxLength = 40; inN.placeholder = 'Contoh: Ibu Sari'; fm.appendChild(inN);
    var bb = el('button', 'btn sm', 'Buat tautan'); bb.type = 'button';
    bb.addEventListener('click', function () {
      var nm = inN.value.trim(); if (!nm) { inN.focus(); return; }
      var u = 'p' + trmAcak(7, 'abcdefghjkmnpqrstuvwxyz23456789'), sdi = trmAcak(14, 'abcdefghjkmnpqrstuvwxyz23456789'), tl = link + '#u=' + u + '&p=' + sdi;
      bb.disabled = true;
      kelolaAdm({ op: 'penerima', nu: u, ns: sdi, nama: nm }, 'Petugas penerima ditambahkan.').then(function (okk) {
        if (okk) { trmTautanSimpan(u, tl); TRM_BARU = { u: u, nama: nm, link: tl }; TRM_TAMBAH = false; }
        pasangPenerima();
      });
    });
    fm.appendChild(bb); c.appendChild(fm);
  }
  if (TRM_BARU) c.appendChild(kotakTautan(TRM_BARU));
  L.forEach(function (q) {
    var warna = q.kunci ? 'r' : (q.pakai ? 'g' : 'y'), k = el('div', 'trmrow ' + warna), t = el('div', 'trmt');
    t.appendChild(el('b', null, q.nama || q.u));
    t.appendChild(el('span', null, q.kunci ? (q.kunci.permanen ? 'TERKUNCI. Buka kunci dulu' : 'Terkunci sementara') : trmWaktu(q.pakai)));
    t.appendChild(el('span', null, (q.jml || 0) + ' laporan diterima'));
    k.appendChild(t);
    var ac = el('div', 'trmbtn'), tl0 = trmTautanAmbil(q.u);
    if (tl0) { var b1 = el('button', 'btn sm plain', 'Salin tautan'); b1.type = 'button'; b1.addEventListener('click', function () { TRM_BARU = { u: q.u, nama: q.nama || q.u, link: tl0 }; TRM_TAMBAH = false; pasangPenerima(); }); ac.appendChild(b1); }
    var b2 = el('button', 'btn sm plain', 'Tautan baru'); b2.type = 'button';
    b2.addEventListener('click', function () {
      if (!confirm('Tautan lama milik ' + (q.nama || q.u) + ' berhenti berlaku. Lanjutkan?')) return;
      var sdi = trmAcak(14, 'abcdefghjkmnpqrstuvwxyz23456789'), tl = link + '#u=' + q.u + '&p=' + sdi;
      kelolaAdm({ op: 'penerima', nu: q.u, ns: sdi, nama: q.nama || q.u }, 'Tautan baru dibuat.').then(function (okk) { if (okk) { trmTautanSimpan(q.u, tl); TRM_BARU = { u: q.u, nama: q.nama || q.u, link: tl }; TRM_TAMBAH = false; } pasangPenerima(); });
    });
    ac.appendChild(b2);
    if (q.kunci) { var b3 = el('button', 'btn sm', 'Buka kunci'); b3.type = 'button'; b3.addEventListener('click', function () { kelolaAdm({ op: 'buka', nu: q.u }, 'Kunci dibuka.'); }); ac.appendChild(b3); }
    var b4 = el('button', 'btn sm plain', 'Hapus'); b4.type = 'button';
    b4.addEventListener('click', function () { if (confirm('Hapus ' + (q.nama || q.u) + '? Tautannya berhenti berlaku.')) { trmTautanSimpan(q.u, ''); if (TRM_BARU && TRM_BARU.u === q.u) TRM_BARU = null; kelolaAdm({ op: 'hapuspenerima', nu: q.u }, 'Petugas penerima dihapus.'); } });
    ac.appendChild(b4); k.appendChild(ac); c.appendChild(k);
  });
};

/* Judul kartu Beranda yang tetap diam saat kartu digulir: judul + keterangan dibungkus .sthd, sisanya .stbody (hanya tampilan). */
(function () {
  function rapikan(card) {
    if (!card || !card.firstElementChild) return;
    var h = card.firstElementChild, w, b, k;
    if (h.classList && h.classList.contains('sthd')) { w = h; }
    else if (h.tagName === 'H4') {
      w = document.createElement('div'); w.className = 'sthd';
      var nx = h.nextElementSibling;
      card.insertBefore(w, h); w.appendChild(h);
      if (nx && nx.classList.contains('lt')) w.appendChild(nx);
    } else return;
    b = card.querySelector(':scope>.stbody');
    if (!b) {
      b = document.createElement('div'); b.className = 'stbody'; card.appendChild(b);
      b.addEventListener('scroll', function () { b.classList.toggle('skrol', b.scrollTop > 2); }, { passive: true });
    }
    k = w.nextElementSibling;
    while (k) { var n = k.nextElementSibling; if (k !== b) b.appendChild(k); k = n; }
  }
  function semua() {
    var a = document.querySelectorAll('#sumB>.card, #secMx>.card');
    for (var i = 0; i < a.length; i++) rapikan(a[i]);
  }
  function awasi(el) {
    if (!el || el._sthd) return; el._sthd = 1;
    new MutationObserver(function () { semua(); }).observe(el, { childList: true });
  }
  function pasang() {
    if (!window.MutationObserver) return;
    var t = [document.getElementById('sumB'), document.getElementById('secMx')], i, c, j;
    for (i = 0; i < t.length; i++) if (t[i]) awasi(t[i]);
    semua();
    c = document.querySelectorAll('#sumB>.card, #secMx>.card');
    for (j = 0; j < c.length; j++) awasi(c[j]);
    /* kartu baru hasil render ulang: pasang pengawas lagi */
    setInterval(function () { semua(); var q = document.querySelectorAll('#sumB>.card, #secMx>.card'); for (var m = 0; m < q.length; m++) awasi(q[m]); }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();
