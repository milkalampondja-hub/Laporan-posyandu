/**
 * Arsip Laporan Posyandu - Kecamatan Palu Utara
 * Tahap 1: data laporan dicatat ke Google Sheets (cepat).
 * Tahap 2: PDF disimpan ke Google Drive (Laporan Posyandu / Tahun / Bulan / Kelurahan / Posyandu)
 * lalu baris yang sama di Sheets diperbarui dengan link file.
 */
var NAMA_FOLDER = 'Laporan Posyandu';
var NAMA_SHEET  = 'Rekap Laporan Posyandu';
var MAKS_BYTE   = 25 * 1024 * 1024;
var KELURAHAN   = ['Kayumalue Ngapa','Kayumalue Pajeko','Mamboro','Mamboro Barat','Taipa'];
var JENIS       = ['Posyandu Balita','Posyandu Lansia'];
var BULAN       = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var HEADER      = ['Nomor Laporan','Tanggal Kirim','Tahun','Bulan','Kelurahan','Posyandu','Jenis','Tanggal Kegiatan','Nama Kader','Versi','Nama File','Link File','Hasil Kegiatan','Status PDF'];
// Login aplikasi Pantau. GANTI kedua nilai ini di Apps Script Anda sebelum diterapkan.
var PANTAU_USER = 'admin';
var PANTAU_SANDI = 'GantiSandi2026';
var NAMA_PENGATURAN = 'pengaturan-pantau.json';
var ID_RE       = /^[A-Za-z0-9]{6,40}$/;

var TOKEN_BALAS = '';
var ID_AKTIF = '';

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = /^[A-Za-z0-9_]{1,40}$/.test(String(p.cb || '')) ? String(p.cb) : '';
  var hasil = { ok: true, pesan: 'Arsip Laporan Posyandu aktif' };
  var cache = CacheService.getScriptCache();
  if (p.aksi === 'cek' && ID_RE.test(String(p.id))) {
    hasil = { ok: cache.get('lp_' + p.id + '_' + parseInt(p.i, 10)) != null };
  } else if (p.aksi === 'hasil' && ID_RE.test(String(p.id)) && (p.tag === 'c' || p.tag === 's' || p.tag === 'a')) {
    var v = cache.get('hasil_' + p.tag + '_' + p.id);
    hasil = v ? JSON.parse(v) : { ok: false, tunggu: true };
  }
  else if (p.aksi === 'daftar') {
    if (sandiBenar(p.u, p.p)) {
      hasil = daftarLaporan();
    } else {
      Utilities.sleep(1200);
      hasil = { ok: false, login: false, pesan: 'Nama pengguna atau kata sandi salah' };
    }
  }
  else if (p.aksi === 'profil') {
    if (sandiBenar(p.u, p.p)) {
      var c = bacaPengaturan();
      hasil = { ok: true, nama: c.nama, foto: c.foto, banner: c.banner };
    } else {
      Utilities.sleep(1200);
      hasil = { ok: false, login: false, pesan: 'Nama pengguna atau kata sandi salah' };
    }
  }
  var teks = JSON.stringify(hasil);
  if (cb) return ContentService.createTextOutput(cb + '(' + teks + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(teks).setMimeType(ContentService.MimeType.JSON);
}

/** Login Pantau: kata sandi awal dari PANTAU_SANDI, setelah diganti dari aplikasi disimpan sebagai hash. */
function hashSandi(t) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'pantau|' + String(t), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
function sandiBenar(u, p) {
  if (String(u || '') !== PANTAU_USER) return false;
  var h = PropertiesService.getScriptProperties().getProperty('PANTAU_SANDI_HASH');
  return h ? hashSandi(p) === h : String(p || '') === PANTAU_SANDI;
}
function bacaPengaturan() {
  var c = { nama: 'Admin Posyandu', foto: '', banner: '' };
  try {
    var it = induk().getFilesByName(NAMA_PENGATURAN);
    if (it.hasNext()) {
      var o = JSON.parse(it.next().getBlob().getDataAsString());
      if (o.nama) c.nama = String(o.nama);
      c.foto = String(o.foto || ''); c.banner = String(o.banner || '');
    }
  } catch (x) {}
  return c;
}
function simpanPengaturan(c) {
  var teks = JSON.stringify(c), f = induk(), it = f.getFilesByName(NAMA_PENGATURAN);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_PENGATURAN, teks, MimeType.PLAIN_TEXT);
}
function cekGambar(s, maks) {
  s = String(s || '');
  if (!s) return '';
  if (s.length > maks) throw new Error('Foto terlalu besar');
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(s)) throw new Error('Format foto tidak valid');
  return s;
}
/** Ubah nama, foto profil, foto banner, atau kata sandi (wajib login). */
function atur(d) {
  if (!sandiBenar(d.u, d.p)) { Utilities.sleep(1200); throw new Error('Kata sandi salah'); }
  var c = bacaPengaturan();
  if (d.nama !== undefined) {
    var n = bersih(d.nama, 40);
    if (!n) throw new Error('Nama tidak boleh kosong');
    c.nama = n;
  }
  if (d.foto !== undefined) c.foto = cekGambar(d.foto, 45000);
  if (d.banner !== undefined) c.banner = cekGambar(d.banner, 90000);
  if (d.sandiBaru !== undefined) {
    var sb = String(d.sandiBaru);
    if (sb.length < 6 || sb.length > 60) throw new Error('Kata sandi baru minimal 6 karakter');
    PropertiesService.getScriptProperties().setProperty('PANTAU_SANDI_HASH', hashSandi(sb));
  }
  simpanPengaturan(c);
  return simpanHasil({ ok: true }, 'a');
}

/** Untuk aplikasi pemantau (hanya setelah login): data laporan beserta angka hasil kegiatan dan nama kader. */
function daftarLaporan() {
  try {
    var sh = lembar(), n = sh.getLastRow();
    if (n < 2) return { ok: true, data: [], waktu: Date.now() };
    var zona = Session.getScriptTimeZone();
    var tgl = function (v) { return v instanceof Date ? Utilities.formatDate(v, zona, 'dd/MM/yyyy HH:mm:ss') : String(v == null ? '' : v); };
    var rows = sh.getRange(2, 1, n - 1, HEADER.length).getValues();
    var data = [];
    rows.forEach(function (r) {
      if (!r[0]) return;
      data.push({ n: String(r[0]), tk: tgl(r[1]), thn: String(r[2]), bln: String(r[3]), kel: String(r[4]), pos: String(r[5]),
                  jenis: String(r[6]), tgl: tgl(r[7]), kader: String(r[8] || ''), hasil: String(r[12] || ''),
                  ver: parseInt(r[9], 10) || 1, pdf: String(r[13] || '') === 'PDF tersimpan' });
    });
    return { ok: true, data: data, waktu: Date.now() };
  } catch (err) {
    return { ok: false, pesan: String(err.message || err) };
  }
}

function doPost(e) {
  var tag = 's';
  try {
    var d = JSON.parse((e.parameter && e.parameter.data) ? e.parameter.data : e.postData.contents);
    TOKEN_BALAS = String(d.t || '');
    ID_AKTIF = String(d.id || '');
    if (!ID_RE.test(ID_AKTIF)) throw new Error('ID tidak valid');
    var cache = CacheService.getScriptCache();

    if (d.aksi === 'bagian') {
      if (String(d.isi).length > 95000) throw new Error('Potongan terlalu besar');
      cache.put('lp_' + d.id + '_' + parseInt(d.i, 10), String(d.isi), 21600);
      return jawab({ ok: true, i: d.i });
    }

    var kunci = LockService.getScriptLock();
    try {
      kunci.waitLock(30000);
      if (d.aksi === 'catat') { tag = 'c'; return catat(d, cache); }
      if (d.aksi === 'selesai') { tag = 's'; return selesai(d, cache); }
      if (d.aksi === 'atur') { tag = 'a'; return atur(d); }
      throw new Error('Aksi tidak dikenal');
    } finally {
      try { kunci.releaseLock(); } catch (x) {}
    }
  } catch (err) {
    return simpanHasil({ ok: false, pesan: String(err.message || err) }, tag);
  }
}

function validasi(d) {
  var v = { kel: String(d.kelurahan || ''), jenis: String(d.jenis || ''), pos: bersih(d.posyandu, 120),
            bln: String(d.bulan || ''), thn: parseInt(d.tahun, 10) };
  if (KELURAHAN.indexOf(v.kel) < 0) throw new Error('Kelurahan tidak dikenal');
  if (JENIS.indexOf(v.jenis) < 0) throw new Error('Jenis laporan tidak dikenal');
  if (!v.pos) throw new Error('Nama posyandu kosong');
  if (BULAN.indexOf(v.bln) < 0) throw new Error('Bulan tidak valid');
  if (!(v.thn >= 2024 && v.thn <= 2100)) throw new Error('Tahun tidak valid');
  v.nBln = BULAN.indexOf(v.bln) + 1;
  v.kodeBln = (v.nBln < 10 ? '0' : '') + v.nBln;
  return v;
}

function nomorBaru(sh, v) {
  var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues() : [];
  var versi = 1;
  rows.forEach(function (r) { if (r[2] == v.thn && r[3] == v.bln && r[4] == v.kel && r[5] == v.pos && r[6] == v.jenis) versi++; });
  var urut = rows.filter(function (r) { return r[2] == v.thn && r[3] == v.bln; }).length + 1;
  return { nomor: 'LP-' + v.thn + '-' + v.kodeBln + '-' + ('000' + urut).slice(-3), versi: versi };
}

function catat(d, cache) {
  var ada = cache.get('info_' + d.id);
  if (ada) return simpanHasil(JSON.parse(ada), 'c');
  var v = validasi(d), sh = lembar(), nb = nomorBaru(sh, v);
  sh.appendRow([nb.nomor, new Date(), v.thn, v.bln, v.kel, v.pos, v.jenis, bersih(d.tanggalKegiatan, 120),
                bersih(d.kader, 300), nb.versi, '', '', bersih(d.hasilText, 800), 'PDF menunggu']);
  var info = { ok: true, nomor: nb.nomor, versi: nb.versi };
  cache.put('info_' + d.id, JSON.stringify(info), 21600);
  return simpanHasil(info, 'c');
}

function selesai(d, cache) {
  var prev = cache.get('hasil_s_' + d.id);
  if (prev && JSON.parse(prev).ok) return jawab(JSON.parse(prev));
  var v = validasi(d), n = parseInt(d.n, 10), bagian = [], kunciCache = [];
  if (!(n >= 1 && n <= 400)) throw new Error('Jumlah potongan tidak valid');
  for (var i = 0; i < n; i++) {
    var k = 'lp_' + d.id + '_' + i, s = cache.get(k);
    if (s == null) throw new Error('Potongan ' + (i + 1) + ' tidak ditemukan, coba kirim lagi');
    bagian.push(s); kunciCache.push(k);
  }
  var bytes = Utilities.base64Decode(bagian.join(''));
  if (!bytes.length || bytes.length > MAKS_BYTE) throw new Error('Ukuran PDF tidak sesuai');
  if (bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) throw new Error('Berkas bukan PDF');

  var sh = lembar(), infoTeks = cache.get('info_' + d.id), info = infoTeks ? JSON.parse(infoTeks) : null;
  var nb = info ? { nomor: info.nomor, versi: info.versi } : nomorBaru(sh, v);
  var folder = anak(anak(anak(anak(induk(), String(v.thn)), v.kodeBln + '-' + v.bln), v.kel), v.pos);
  var nama = nb.nomor + ' ' + v.jenis + ' ' + v.pos + ' ' + v.bln + ' ' + v.thn + (nb.versi > 1 ? ' v' + nb.versi : '') + '.pdf';
  var file = folder.createFile(Utilities.newBlob(bytes, 'application/pdf', nama));

  var baris = 0;
  if (info && sh.getLastRow() > 1) {
    var kol = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
    for (var r = kol.length - 1; r >= 0; r--) { if (kol[r][0] === nb.nomor) { baris = r + 2; break; } }
  }
  if (baris) {
    sh.getRange(baris, 11, 1, 2).setValues([[nama, file.getUrl()]]);
    sh.getRange(baris, 14).setValue('PDF tersimpan');
  } else {
    sh.appendRow([nb.nomor, new Date(), v.thn, v.bln, v.kel, v.pos, v.jenis, bersih(d.tanggalKegiatan, 120),
                  bersih(d.kader, 300), nb.versi, nama, file.getUrl(), bersih(d.hasilText, 800), 'PDF tersimpan']);
  }
  cache.removeAll(kunciCache);
  return simpanHasil({ ok: true, nomor: nb.nomor, versi: nb.versi }, 's');
}

function simpanHasil(o, tag) {
  if (ID_RE.test(ID_AKTIF)) {
    try { CacheService.getScriptCache().put('hasil_' + tag + '_' + ID_AKTIF, JSON.stringify(o), 21600); } catch (x) {}
  }
  return jawab(o);
}

function jawab(o) {
  o.t = TOKEN_BALAS;
  var teks = JSON.stringify(o).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<script>window.top.postMessage(' + teks + ',"*");</script>');
}
function bersih(s, maks) { return String(s == null ? '' : s).replace(/[\\\/:*?"<>|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maks || 120); }

function induk() {
  var it = DriveApp.getFoldersByName(NAMA_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(NAMA_FOLDER);
}
function anak(p, nama) {
  var it = p.getFoldersByName(nama);
  return it.hasNext() ? it.next() : p.createFolder(nama);
}
function lembar() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SHEET_ID'), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (x) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(NAMA_SHEET);
    props.setProperty('SHEET_ID', ss.getId());
    var f = DriveApp.getFileById(ss.getId());
    induk().addFile(f); DriveApp.getRootFolder().removeFile(f);
  }
  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0 || sh.getRange(1, HEADER.length).getValue() !== HEADER[HEADER.length - 1]) {
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold').setBackground('#0a7a35').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Jalankan sekali dari editor agar Google meminta izin akses Drive dan Sheets. */
function aktifkan() { lembar(); induk(); }


// ===================== Pengingat WhatsApp resmi (Meta Cloud API) tanggal 25 =====================
// Token, ID nomor, dan nomor tujuan disimpan di Script Properties (bukan di kode / GitHub).
var GRAPH_VER = 'v26.0';
var NAMA_TEMPLATE = 'pengingat_laporan_posyandu';
var URL_PANTAU = 'https://milkalampondja-hub.github.io/Laporan-posyandu/pantau.html';

function dataBulanIni() {
  var zona = Session.getScriptTimeZone(), now = new Date();
  var bln = BULAN[parseInt(Utilities.formatDate(now, zona, 'M'), 10) - 1], thn = Utilities.formatDate(now, zona, 'yyyy');
  var sh = lembar(), n = sh.getLastRow(), uniq = {};
  if (n > 1) sh.getRange(2, 1, n - 1, HEADER.length).getValues().forEach(function (r) {
    if (!r[0] || String(r[2]) !== thn || String(r[3]) !== bln) return;
    uniq[[r[4], String(r[5]).toLowerCase(), r[6]].join('|')] = { kel: String(r[4]), jenis: String(r[6]) };
  });
  var ada = {}, total = 0;
  Object.keys(uniq).forEach(function (k) { var u = uniq[k]; ada[u.jenis + '|' + u.kel] = (ada[u.jenis + '|' + u.kel] || 0) + 1; total++; });
  var per = JENIS.map(function (j) {
    var masuk = 0, belum = [];
    KELURAHAN.forEach(function (k) { var c = ada[j + '|' + k] || 0; masuk += c; if (!c) belum.push(k); });
    return { jenis: j, masuk: masuk, belum: belum };
  });
  return { bln: bln, thn: thn, total: total, per: per };
}
function ringkasJenis(x) {
  return x.masuk + ' laporan' + (x.belum.length ? ', belum ada dari ' + x.belum.join(', ') : ', semua kelurahan sudah ada');
}
function ringkasanBulanIni(d) {
  d = d || dataBulanIni();
  var b = ['Pengingat tanggal 25 - Laporan Posyandu ' + d.bln + ' ' + d.thn, 'Total laporan masuk: ' + d.total];
  d.per.forEach(function (x) { b.push(x.jenis.replace('Posyandu ', '') + ': ' + ringkasJenis(x)); });
  b.push('Buka Pantau: ' + URL_PANTAU);
  return b.join('\n');
}

/** Kirim lewat WhatsApp Business Platform. Template harus sudah disetujui Meta (lihat panduan). */
function kirimWA(d) {
  var p = PropertiesService.getScriptProperties(), token = p.getProperty('WA_TOKEN'), idNomor = p.getProperty('WA_PHONE_ID'), tujuan = p.getProperty('WA_NOMOR');
  if (!token || !idNomor || !tujuan) throw new Error('Pengaturan WhatsApp belum lengkap');
  var teks = function (t) { return String(t).replace(/\s+/g, ' ').trim().slice(0, 900); };
  var isi = [d.bln + ' ' + d.thn, String(d.total), ringkasJenis(d.per[0]), ringkasJenis(d.per[1])].map(function (t) { return { type: 'text', text: teks(t) }; });
  var r = UrlFetchApp.fetch('https://graph.facebook.com/' + GRAPH_VER + '/' + encodeURIComponent(idNomor) + '/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: tujuan, type: 'template',
      template: { name: NAMA_TEMPLATE, language: { code: 'id' }, components: [{ type: 'body', parameters: isi }] } })
  });
  if (r.getResponseCode() !== 200) throw new Error('WhatsApp gagal ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 200));
}

function kirimPengingat25() {
  var d = dataBulanIni();
  try { kirimWA(d); }
  catch (err) { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Pengingat tanggal 25 - Laporan Posyandu', ringkasanBulanIni(d) + '\n\n(WhatsApp tidak terkirim: ' + err.message + ')'); }
}

/** Isi tiga nilai dari Meta, jalankan sekali, lalu kosongkan lagi isinya di kode. */
function simpanWA() {
  PropertiesService.getScriptProperties().setProperties({
    WA_TOKEN: 'ISI_TOKEN_PERMANEN',
    WA_PHONE_ID: 'ISI_PHONE_NUMBER_ID',
    WA_NOMOR: '628xxxxxxxxxx'
  });
}

/** Jalankan sekali: pasang jadwal tiap tanggal 25 pukul 08.00 (zona waktu proyek). */
function pasangPengingat() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'kirimPengingat25') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('kirimPengingat25').timeBased().onMonthDay(25).atHour(8).create();
}

/** Untuk mencoba sekarang tanpa menunggu tanggal 25. */
function ujiPengingat() { kirimPengingat25(); }
