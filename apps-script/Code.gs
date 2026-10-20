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
  } else if (p.aksi === 'hasil' && ID_RE.test(String(p.id)) && (p.tag === 'c' || p.tag === 's')) {
    var v = cache.get('hasil_' + p.tag + '_' + p.id);
    hasil = v ? JSON.parse(v) : { ok: false, tunggu: true };
  }
  else if (p.aksi === 'daftar') {
    hasil = daftarLaporan();
  }
  var teks = JSON.stringify(hasil);
  if (cb) return ContentService.createTextOutput(cb + '(' + teks + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(teks).setMimeType(ContentService.MimeType.JSON);
}

/** Untuk aplikasi pemantau: hanya data umum (tanpa nama kader dan tanpa link file). */
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
                  jenis: String(r[6]), tgl: tgl(r[7]), ver: parseInt(r[9], 10) || 1, pdf: String(r[13] || '') === 'PDF tersimpan' });
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
