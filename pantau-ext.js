/* Pantau Laporan Posyandu - tambahan: banner geser, menu akun, Beranda, Rekapitulasi, Data Posyandu, Pengaturan lanjutan. */
(function () {
'use strict';
var POS = [], SK = {}, BATAS = 25, BANNERS = ['', '', ''], POSDIMUAT = false;
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
'.dtbl td.pc{font-weight:700}'
].join('\n');
var stl = document.createElement('style'); stl.textContent = EXT_CSS; document.head.appendChild(stl);

function $(i) { return document.getElementById(i); }
function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
function utama() { return PERAN === 'utama'; }
function J_B() { return 'Posyandu Balita'; } function J_L() { return 'Posyandu Lansia'; }
var JENIS = [J_B(), J_L()];
function kunci(kel, jenis, nama) {
  return [kel, jenis, String(nama || '').toLowerCase().replace(/posyandu/g, '').replace(/[^a-z0-9]/g, '').replace(/bougenv[a-z]*/, 'bougenvil')].join('|');
}
function aktifKader(p) { return (p.kader || []).filter(function (k) { return k.aktif !== false; }); }
var KELSAYA = '';
function dasarPos() { var l = POS.length ? POS : (window.SEED_POS || []); return KELSAYA ? l.filter(function (p) { return p.kel === KELSAYA; }) : l; }
window.terapKel = function (k) {
  KELSAYA = k || '';
  KEL.length = 0; (KELSAYA ? [KELSAYA] : KEL_SEMUA).forEach(function (x) { KEL.push(x); });
};
function posAktif() { return dasarPos().filter(function (p) { return p.aktif !== false; }); }
function persen(a, b) { return b ? Math.round(a * 100 / b) : 0; }
function pilihEl(id, opts, val) { var s = $(id); s.textContent = ''; opts.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); }); if (val != null) s.value = val; }

/* ---------- perhitungan ---------- */
function tglKirim(d) { var m = /^(\d\d)\/(\d\d)\/(\d{4})/.exec(d.tk || ''); return m ? new Date(+m[3], +m[2] - 1, +m[1], 12) : null; }
function hitung(th, bl) {
  var master = posAktif(), uniq = terbaru(DATA.filter(function (d) { return d.thn === String(th) && d.bln === bl; })), idx = {}, dikenal = {};
  uniq.forEach(function (d) { idx[kunci(d.kel, d.jenis, d.pos)] = d; });
  var m = BULAN.indexOf(bl), batas = new Date(+th, m, BATAS, 23, 59, 59), now = new Date();
  var rows = master.map(function (p) {
    var k = kunci(p.kel, p.jenis, p.nama), d = idx[k], st;
    dikenal[k] = 1;
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
  var map = { tepat: ['ok', 'Sudah masuk'], telat: ['w', 'Masuk terlambat'], lewat: ['no', 'Belum, lewat batas'], belum: ['no', 'Belum masuk'] };
  var x = map[r.st], sp = el('span', 'pill ' + (x[0] === 'ok' ? 'ok' : 'no'), x[1]);
  if (r.st === 'telat' || r.st === 'lewat') { sp.style.background = 'var(--warn-soft)'; sp.style.color = 'var(--warn)'; }
  return sp;
}
function periodeBeranda() {
  var now = new Date(), bl = $('fb').value || BULAN[now.getMonth()], th = $('ft').value || String(now.getFullYear());
  return { bl: bl, th: th };
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
function renderBeranda() {
  var box = $('sumB'); if (!box) return; box.textContent = '';
  var pr = periodeBeranda(), h = hitung(pr.th, pr.bl), pc = persen(h.masuk.length, h.rows.length);
  var c = el('div', 'card'); c.appendChild(el('h4', null, 'Ringkasan ' + pr.bl + ' ' + pr.th));
  c.appendChild(el('div', 'lt', 'Batas pengumpulan: tanggal ' + BATAS + ' ' + pr.bl));
  var g = el('div', 'grid4');
  g.appendChild(tileStat('', h.rows.length, 'Total Posyandu terdaftar'));
  g.appendChild(tileStat('ok', h.masuk.length, 'Laporan sudah masuk'));
  g.appendChild(tileStat('warn', h.belum.length, 'Laporan belum masuk'));
  g.appendChild(tileStat('', pc + '%', 'Capaian laporan'));
  c.appendChild(g);
  var br = el('div', 'bar'); br.appendChild(document.createElement('i')).style.width = pc + '%'; c.appendChild(br);
  if (h.asing.length) c.appendChild(el('div', 'warn2', h.asing.length + ' laporan memakai nama Posyandu yang belum cocok dengan Data Posyandu, sehingga tidak dihitung. Periksa ejaan di menu Data Posyandu.'));
  if (!POS.length) c.appendChild(el('div', 'warn2', 'Memakai daftar Posyandu dari SK. ' + (utama() ? 'Buka menu Data Posyandu lalu tekan "Simpan daftar dari SK" agar bisa diubah.' : '')));
  box.appendChild(c);
  var c2 = el('div', 'card'); c2.appendChild(el('h4', null, 'Posyandu yang belum mengumpulkan laporan'));
  if (!h.belum.length) c2.appendChild(el('div', 'ok2', 'Semua Posyandu sudah mengumpulkan laporan ' + pr.bl + ' ' + pr.th + '.'));
  KEL.forEach(function (k) {
    var l = h.belum.filter(function (r) { return r.p.kel === k; }); if (!l.length) return;
    c2.appendChild(el('div', 'kh', k + ' (' + l.length + ')'));
    var ch = el('div', 'chips');
    l.forEach(function (r) { ch.appendChild(el('span', 'chip2' + (r.p.jenis === J_B() ? ' b' : ''), r.p.jenis.replace('Posyandu ', '') + ' · ' + r.p.nama)); });
    c2.appendChild(ch);
  });
  box.appendChild(c2);
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
/* Posyandu yang laporan terakhirnya memuat "Nama (Pengganti — Kader Pengganti Sementara)". */
function penggantiSementara() {
  var akhir = {};
  DATA.forEach(function (d) { var k = kunci(d.kel, d.jenis, d.pos); if (!akhir[k] || d.n > akhir[k].n) akhir[k] = d; });
  var out = [];
  Object.keys(akhir).forEach(function (k) {
    var d = akhir[k], re = /([^,()]+?)\s*\(([^()]+?)\s+\u2014\s+Kader Pengganti Sementara\)/g, m, ps = [];
    while ((m = re.exec(d.kader || ''))) ps.push({ lama: m[1].trim(), baru: m[2].trim() });
    if (!ps.length) return;
    var p = dasarPos().filter(function (x) { return kunci(x.kel, x.jenis, x.nama) === k; })[0] || { nama: d.pos, kel: d.kel, jenis: d.jenis };
    out.push({ p: p, d: d, pasangan: ps });
  });
  return out.sort(function (a, b) { return a.p.kel.localeCompare(b.p.kel) || a.p.nama.localeCompare(b.p.nama); });
}

/* ---------- Rekapitulasi ---------- */
var rkDibuat = false;
function rkSiap() {
  var box = $('rkBox'); if (!box || rkDibuat) return; rkDibuat = true;
  box.innerHTML = '<div class="card"><h4>Periode rekap</h4><div class="fl2"><select id="rb"></select><select id="rt"></select></div>' +
    '<div class="toolbar"><button class="btn sm" id="rkx" type="button">Unduh rekap (Excel)</button></div></div><div id="rkIsi"></div>';
  var now = new Date();
  pilihEl('rb', BULAN.map(function (b) { return [b, b]; }), BULAN[now.getMonth()]);
  var th = {}; th[now.getFullYear()] = 1; DATA.forEach(function (d) { if (d.thn) th[d.thn] = 1; });
  pilihEl('rt', Object.keys(th).sort().reverse().map(function (t) { return [t, t]; }), String(now.getFullYear()));
  $('rb').addEventListener('change', renderRekap); $('rt').addEventListener('change', renderRekap);
  $('rkx').addEventListener('click', unduhRekap);
}
function barRow(lbl, a, b) { var pc = persen(a, b), r = el('div', 'barrow'), l = el('div', 'l'); l.appendChild(el('span', null, lbl)); l.appendChild(el('b', null, a + ' dari ' + b + ' · ' + pc + '%')); r.appendChild(l); var bar = el('div', 'bar'); bar.appendChild(document.createElement('i')).style.width = pc + '%'; r.appendChild(bar); return r; }
function tabel(heads, rows, pcCol) {
  var t = el('table', 'dtbl'), hd = el('tr'); heads.forEach(function (x) { hd.appendChild(el('th', null, x)); }); t.appendChild(hd);
  rows.forEach(function (r) { var tr = el('tr'); r.forEach(function (v, i) { tr.appendChild(el('td', i === pcCol ? 'pc' : null, v)); }); t.appendChild(tr); });
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
  var R = rkData(), h = R.h, now = new Date();
  // 1 per bulan
  var c1 = el('div', 'card'); c1.appendChild(el('h4', null, 'Rekap laporan per bulan - ' + R.th));
  c1.appendChild(tabel(['Bulan', 'Balita', 'Lansia', 'Total', '%'], R.bulanan.map(function (o) {
    var fut = +R.th > now.getFullYear() || (+R.th === now.getFullYear() && o.i > now.getMonth());
    if (fut) return [o.b, '-', '-', '-', '-'];
    return [o.b, o.sb.masuk + '/' + o.sb.total, o.sl.masuk + '/' + o.sl.total, o.m + '/' + o.tot, persen(o.m, o.tot) + '%'];
  }), 4)); isi.appendChild(c1);
  // 2 per kelurahan
  var c2 = el('div', 'card'); c2.appendChild(el('h4', null, 'Rekap laporan per kelurahan - ' + R.bl + ' ' + R.th));
  var gt = { b: [0, 0], l: [0, 0] };
  var rowsK = KEL.map(function (k) {
    var a = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_B(); }), b = sub(h, function (r) { return r.p.kel === k && r.p.jenis === J_L(); });
    gt.b[0] += a.masuk; gt.b[1] += a.total; gt.l[0] += b.masuk; gt.l[1] += b.total;
    return [k, a.masuk + '/' + a.total, b.masuk + '/' + b.total, (a.masuk + b.masuk) + '/' + (a.total + b.total), persen(a.masuk + b.masuk, a.total + b.total) + '%'];
  });
  rowsK.push(['JUMLAH', gt.b[0] + '/' + gt.b[1], gt.l[0] + '/' + gt.l[1], (gt.b[0] + gt.l[0]) + '/' + (gt.b[1] + gt.l[1]), persen(gt.b[0] + gt.l[0], gt.b[1] + gt.l[1]) + '%']);
  c2.appendChild(tabel(['Kelurahan', 'Balita', 'Lansia', 'Total', '%'], rowsK, 4)); isi.appendChild(c2);
  // 3 persentase
  var c3 = el('div', 'card'); c3.appendChild(el('h4', null, 'Persentase laporan masuk'));
  c3.appendChild(barRow('Keseluruhan', h.masuk.length, h.rows.length));
  c3.appendChild(barRow('Posyandu Balita', gt.b[0], gt.b[1])); c3.appendChild(barRow('Posyandu Lansia', gt.l[0], gt.l[1]));
  isi.appendChild(c3);
  // 4 rekap posyandu
  var c4 = el('div', 'card'); c4.appendChild(el('h4', null, 'Rekap Posyandu Balita dan Lansia'));
  JENIS.forEach(function (j) {
    c4.appendChild(el('div', 'kh', j));
    KEL.forEach(function (k) {
      var l = h.rows.filter(function (r) { return r.p.kel === k && r.p.jenis === j; }); if (!l.length) return;
      c4.appendChild(el('div', 'lt', k + ' - ' + l.filter(function (r) { return r.d; }).length + ' dari ' + l.length + ' sudah masuk'));
      l.forEach(function (r) {
        var it = el('div', 'item'); it.style.cssText = 'display:flex;align-items:center;gap:8px;padding:9px 12px';
        var t = el('div'); t.style.flex = '1'; t.appendChild(el('div', 'a', r.p.nama));
        if (r.d) t.appendChild(el('div', 'b', 'Dikirim ' + (r.d.tk || '-').slice(0, 10)));
        it.appendChild(t); it.appendChild(pillSt(r)); c4.appendChild(it);
      });
    });
  });
  isi.appendChild(c4);
  // 5 terlambat
  var c5 = el('div', 'card'); c5.appendChild(el('h4', null, 'Daftar Posyandu yang terlambat'));
  c5.appendChild(el('div', 'lt', 'Batas pengumpulan tanggal ' + BATAS + ' ' + R.bl + ' ' + R.th + '. Belum masuk setelah batas, atau dikirim setelah batas.'));
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
  var c7 = el('div', 'card'); c7.appendChild(el('h4', null, 'Jumlah angka hasil kegiatan per kelurahan - ' + R.bl)); var tt = el('div'); tt.id = 'tt'; c7.appendChild(tt); isi.appendChild(c7);
  jumlahTabel(tt, h.uniq, '');
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
  box.innerHTML = '<div class="card"><h4>Data Posyandu</h4><p class="hint">Sumber utama nama Posyandu untuk menu Laporan dan Rekapitulasi, sehingga nama tidak tercatat ganda.</p>' +
    '<div class="grid4" id="dpStat"></div><div class="toolbar" id="dpTool"></div>' +
    '<div class="fl2"><select id="dfk"></select><select id="dfj"></select><select id="dfs"></select><input id="dfq" type="search" placeholder="Cari Posyandu atau kader" autocomplete="off"></div></div>' +
    '<div id="dpList"></div><div class="card"><h4>Surat Keputusan (SK) Kader</h4><p class="hint">Ketuk SK untuk membacanya utuh.</p><div id="skBox"></div></div>';
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
  st.appendChild(tileStat('', ak.length, 'Posyandu aktif')); st.appendChild(tileStat('', ak.filter(function (p) { return p.jenis === J_B(); }).length, 'Balita'));
  st.appendChild(tileStat('', ak.filter(function (p) { return p.jenis === J_L(); }).length, 'Lansia'));
  st.appendChild(tileStat('', ak.reduce(function (n, p) { return n + aktifKader(p).length; }, 0), 'Kader aktif'));
  var tb = $('dpTool'); tb.textContent = '';
  if (utama()) {
    if (!POS.length) tb.appendChild(btn('Simpan daftar dari SK', '', simpanDariSK));
    else tb.appendChild(btn('Tambah Posyandu', '', function () { formPos(null); }));
    tb.appendChild(btn('Impor Excel', 'line', function () { $('impPos').click(); }));
  }
  tb.appendChild(btn('Ekspor Excel', 'line', ekspor));
  if (utama() && !$('impPos')) { var inp = document.createElement('input'); inp.type = 'file'; inp.id = 'impPos'; inp.accept = '.xlsx,.xls,.csv'; inp.style.display = 'none'; inp.addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (f) impor(f); }); document.body.appendChild(inp); }
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
    l.appendChild(el('div', 'kh', k + ' (' + g.length + ')'));
    g.forEach(function (p) { l.appendChild(kartuPos(p)); });
  });
  renderSK();
}
function kartuPos(p) {
  var d = document.createElement('details'); d.className = 'pos' + (p.aktif === false ? ' off' : '');
  var s = document.createElement('summary'); s.appendChild(el('div', 'a', p.jenis.replace('Posyandu', 'Posyandu') + ' ' + p.nama));
  s.appendChild(el('div', 'b', [p.ketua ? 'Ketua/PJ: ' + p.ketua : '', p.hp ? 'HP ' + p.hp : '', aktifKader(p).length + ' kader'].filter(Boolean).join(' · ')));
  var tg = el('div', 'tags'); tg.appendChild(el('span', 'tag ' + (p.aktif === false ? 'g' : ''), p.aktif === false ? 'Nonaktif' : 'Aktif'));
  if (p.jadwal) tg.appendChild(el('span', 'tag g', p.jadwal)); s.appendChild(tg); d.appendChild(s);
  var det = el('div', 'det');
  if (p.alamat) det.appendChild(el('div', 'b', 'Alamat: ' + p.alamat)); if (p.puskesmas) det.appendChild(el('div', 'b', p.puskesmas));
  var rows = (p.kader || []).map(function (k, i) { return [String(i + 1), k.nama, k.jabatan || '-', k.aktif === false ? 'Nonaktif' : 'Aktif']; });
  if (rows.length) { var t = tabel(['No', 'Nama kader', 'Jabatan', 'Status'], rows); t.style.marginTop = '8px'; det.appendChild(t); }
  if (utama() && POS.length) {
    var ac = el('div', 'acts'); ac.appendChild(btn('Edit', 'sm plain', function () { formPos(p); }));
    ac.appendChild(btn(p.aktif === false ? 'Aktifkan' : 'Nonaktifkan', 'sm plain', function () {
      if (!confirm((p.aktif === false ? 'Aktifkan ' : 'Nonaktifkan ') + p.nama + '?')) return;
      var n = POS.map(function (x) { return x.id === p.id ? Object.assign({}, x, { aktif: x.aktif === false }) : x; }); simpanDaftar(n, 'Status Posyandu diperbarui.');
    })); det.appendChild(ac);
  }
  d.appendChild(det); return d;
}
function simpanDaftar(list, ok) {
  return kirimAtur({ aksi: 'pos', list: list }).then(function (r) { POS = r.list || list; POSOK = true; renderData(); renderBeranda(); renderRekap(); if (ok) toast(ok); return true; })
    .catch(function (e) { alert('Gagal menyimpan: ' + e.message); return false; });
}
function toast(t) { var d = el('div', 'ok2', t); d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:90px;z-index:300;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.25)'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2800); }
function simpanDariSK() {
  if (!confirm('Simpan daftar ' + (window.SEED_POS || []).length + ' Posyandu dan nama kader dari SK ke server?')) return;
  simpanDaftar(JSON.parse(JSON.stringify(window.SEED_POS || [])), 'Daftar dari SK tersimpan.');
}
function formPos(p) {
  var baru = !p; p = p || { id: 'n' + Date.now().toString(36), nama: '', kel: KEL[0], jenis: J_B(), alamat: '', puskesmas: '', ketua: '', hp: '', jadwal: '', aktif: true, kader: [] };
  var f = el('div');
  function fld(id, lbl, val, ph) { var w = el('div', 'fld'); w.appendChild(el('label', null, lbl)); var i = document.createElement('input'); i.id = id; i.type = 'text'; i.value = val || ''; if (ph) i.placeholder = ph; w.appendChild(i); f.appendChild(w); return i; }
  fld('fpN', 'Nama Posyandu', p.nama);
  var w1 = el('div', 'fld'); w1.appendChild(el('label', null, 'Kelurahan')); var sk = document.createElement('select'); sk.id = 'fpK'; sk.style.cssText = 'width:100%;min-height:50px;border:1.5px solid var(--line);border-radius:12px;padding:8px;background:var(--surface);color:var(--fg);font-size:16px'; KEL.forEach(function (k) { var o = document.createElement('option'); o.textContent = k; sk.appendChild(o); }); sk.value = p.kel; w1.appendChild(sk); f.appendChild(w1);
  var w2 = el('div', 'fld'); w2.appendChild(el('label', null, 'Jenis Posyandu')); var sj = sk.cloneNode(false); sj.id = 'fpJ'; [[J_B(), 'Balita'], [J_L(), 'Lansia']].forEach(function (j) { var o = document.createElement('option'); o.value = j[0]; o.textContent = j[1]; sj.appendChild(o); }); sj.value = p.jenis; w2.appendChild(sj); f.appendChild(w2);
  fld('fpA', 'Alamat', p.alamat); fld('fpP', 'Puskesmas', p.puskesmas); fld('fpQ', 'Nama ketua atau kader penanggung jawab', p.ketua);
  fld('fpH', 'Nomor HP kader', p.hp, 'Contoh: 0812 3456 7890'); fld('fpD', 'Jadwal kegiatan', p.jadwal, 'Contoh: Setiap tanggal 10, pukul 09.00');
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
    var np = { id: p.id, nama: nama, kel: $('fpK').value, jenis: $('fpJ').value, alamat: $('fpA').value.trim(), puskesmas: $('fpP').value.trim(), ketua: $('fpQ').value.trim(), hp: $('fpH').value.trim(), jadwal: $('fpD').value.trim(), aktif: $('fpAk').checked, kader: kader };
    var dup = POS.some(function (x) { return x.id !== p.id && kunci(x.kel, x.jenis, x.nama) === kunci(np.kel, np.jenis, np.nama); });
    if (dup) { er.textContent = 'Posyandu dengan nama, kelurahan, dan jenis yang sama sudah ada'; er.className = 'st bad'; return; }
    var n = baru ? POS.concat([np]) : POS.map(function (x) { return x.id === p.id ? np : x; });
    sv.disabled = true; er.textContent = 'Menyimpan…'; er.className = 'st';
    simpanDaftar(n, 'Data Posyandu tersimpan.').then(function (ok) { if (ok) tutupModal(); else { sv.disabled = false; er.textContent = ''; } });
  });
  f.appendChild(sv); bukaModal(baru ? 'Tambah Posyandu' : 'Edit Posyandu', f);
}
/* ekspor dan impor Excel */
var KOLOM = ['Nama Posyandu', 'Kelurahan', 'Jenis (Balita/Lansia)', 'Alamat', 'Puskesmas', 'Ketua/Penanggung Jawab', 'Nomor HP', 'Jadwal Kegiatan', 'Status (Aktif/Nonaktif)', 'Kader (pisahkan dengan titik koma; format: Nama - Jabatan)'];
function ekspor() {
  var data = dasarPos().map(function (p) {
    var o = {}; o[KOLOM[0]] = p.nama; o[KOLOM[1]] = p.kel; o[KOLOM[2]] = p.jenis.replace('Posyandu ', ''); o[KOLOM[3]] = p.alamat || ''; o[KOLOM[4]] = p.puskesmas || ''; o[KOLOM[5]] = p.ketua || ''; o[KOLOM[6]] = p.hp || ''; o[KOLOM[7]] = p.jadwal || '';
    o[KOLOM[8]] = p.aktif === false ? 'Nonaktif' : 'Aktif'; o[KOLOM[9]] = (p.kader || []).map(function (k) { return k.nama + (k.jabatan ? ' - ' + k.jabatan : '') + (k.aktif === false ? ' (nonaktif)' : ''); }).join('; '); return o;
  });
  var kader = []; dasarPos().forEach(function (p) { (p.kader || []).forEach(function (k, i) { kader.push({ Kelurahan: p.kel, Jenis: p.jenis, Posyandu: p.nama, No: i + 1, 'Nama Kader': k.nama, Jabatan: k.jabatan || '', Status: k.aktif === false ? 'Nonaktif' : 'Aktif' }); }); });
  if (window.XLSX) {
    var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(data); ws['!cols'] = KOLOM.map(function (k, i) { return { wch: i === 9 ? 60 : Math.max(14, Math.min(28, k.length)) }; });
    XLSX.utils.book_append_sheet(wb, ws, 'Data Posyandu'); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kader), 'Daftar Kader'); XLSX.writeFile(wb, 'Data-Posyandu-Palu-Utara.xlsx'); return;
  }
  csvUnduh('Data-Posyandu-Palu-Utara.csv', [['Data Posyandu', data], ['Daftar Kader', kader]]);
}
function impor(file) {
  if (!window.XLSX) { alert('Fitur Excel belum termuat. Periksa internet lalu coba lagi.'); return; }
  var rd = new FileReader();
  rd.onload = function () {
    try {
      var wb = XLSX.read(rd.result, { type: 'array' }), rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      var kolom = function (r, i) { var key = Object.keys(r).filter(function (k) { return k.toLowerCase().indexOf(KOLOM[i].toLowerCase().slice(0, 8)) === 0; })[0]; return key ? String(r[key]).trim() : ''; };
      var n = POS.slice(), baru = 0, ubah = 0, lewat = [];
      rows.forEach(function (r, i) {
        var nama = kolom(r, 0), kel = KEL.filter(function (k) { return k.toLowerCase() === kolom(r, 1).toLowerCase(); })[0], jr = kolom(r, 2).toLowerCase(), jenis = jr.indexOf('bal') === 0 ? J_B() : jr.indexOf('lan') === 0 ? J_L() : '';
        if (!nama || !kel || !jenis) { lewat.push(i + 2); return; }
        var kader = kolom(r, 9).split(/[;\n]+/).map(function (s) { s = s.trim(); if (!s) return null; var off = /\(nonaktif\)\s*$/i.test(s); s = s.replace(/\(nonaktif\)\s*$/i, '').trim(); var m = s.split(/\s+[-–]\s+/); return { nama: m[0].trim(), jabatan: (m[1] || '').trim(), aktif: !off }; }).filter(Boolean);
        var st = kolom(r, 8).toLowerCase(), np = { nama: nama, kel: kel, jenis: jenis, alamat: kolom(r, 3), puskesmas: kolom(r, 4), ketua: kolom(r, 5), hp: kolom(r, 6), jadwal: kolom(r, 7), aktif: st.indexOf('non') !== 0, kader: kader };
        var ix = -1; n.forEach(function (x, j) { if (kunci(x.kel, x.jenis, x.nama) === kunci(kel, jenis, nama)) ix = j; });
        if (ix >= 0) { np.id = n[ix].id; n[ix] = np; ubah++; } else { np.id = 'n' + Date.now().toString(36) + i; n.push(np); baru++; }
      });
      if (!baru && !ubah) { alert('Tidak ada baris yang bisa dibaca. Pastikan kolom Nama Posyandu, Kelurahan, dan Jenis terisi (gunakan hasil Ekspor Excel sebagai contoh).'); return; }
      if (!confirm('Impor: ' + baru + ' Posyandu baru, ' + ubah + ' diperbarui' + (lewat.length ? ', ' + lewat.length + ' baris dilewati (baris ' + lewat.slice(0, 8).join(', ') + ')' : '') + '. Lanjutkan?')) return;
      simpanDaftar(n, 'Impor berhasil.');
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
function pasangSetelan() {
  var cb = $('cardBan'), ca = $('cardApp');
  if (cb) cb.style.display = utama() ? '' : 'none'; if (ca) ca.style.display = utama() ? '' : 'none';
  var pt = $('peranTxt'); if (pt) pt.textContent = utama() ? 'Admin kecamatan' : (PERAN ? 'Petugas/operator' : '-');
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

/* ---------- kait ke aplikasi utama ---------- */
window.terimaProfil = function (r) {
  BANNERS = (r.banners || ['', '', '']).slice(0, 3); while (BANNERS.length < 3) BANNERS.push('');
  if (r.batas) BATAS = r.batas; if (r.sk) SK = r.sk;
  bangunBanner(); renderBeranda();
};
window.pasangExt = function () { pasangSetelan(); };
window.ambilPos = function () {
  if (!CRED) return;
  jsonp({ aksi: 'posyandu', u: CRED.u, p: CRED.p }).then(function (r) {
    if (r && r.ok) { POS = r.list || []; SK = r.sk || SK; POSOK = true; POSDIMUAT = true; renderData(); renderBeranda(); renderRekap(); }
  }).catch(function () { });
};
window.tampilBaru = function () { renderBeranda(); renderRekap(); renderData(); };
window.setelahKeluar = function () { terapKel(''); POS = []; SK = {}; BANNERS = ['', '', '']; POSOK = false; bangunBanner(); tutupMenu(); tutupModal(); };
document.addEventListener('DOMContentLoaded', function () { bangunBanner(); });
if (document.readyState !== 'loading') bangunBanner();
})();
