/**
 * Arsip Laporan Posyandu - Kecamatan Palu Utara
 * Menerima PDF + data dari aplikasi, menyimpan PDF ke Google Drive
 * (Laporan Posyandu / Tahun / Bulan / Kelurahan / Posyandu) dan mencatat ke Google Sheets.
 * Semua dibuat otomatis di akun Google pemilik script ini.
 */
var NAMA_FOLDER = 'Laporan Posyandu';
var NAMA_SHEET  = 'Rekap Laporan Posyandu';
var MAKS_BYTE   = 25 * 1024 * 1024;
var KELURAHAN   = ['Kayumalue Ngapa','Kayumalue Pajeko','Mamboro','Mamboro Barat','Taipa'];
var JENIS       = ['Posyandu Balita','Posyandu Lansia'];
var BULAN       = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var HEADER      = ['Nomor Laporan','Tanggal Kirim','Tahun','Bulan','Kelurahan','Posyandu','Jenis','Tanggal Kegiatan','Nama Kader','Versi','Nama File','Link File'];

function doGet() { return ContentService.createTextOutput(JSON.stringify({ ok: true, pesan: 'Arsip Laporan Posyandu aktif' })).setMimeType(ContentService.MimeType.JSON); }

var TOKEN_BALAS = '';

function doPost(e) {
  var kunci = LockService.getScriptLock();
  try {
    kunci.waitLock(30000);
    var d = JSON.parse((e.parameter && e.parameter.data) ? e.parameter.data : e.postData.contents);
    TOKEN_BALAS = String(d.t || '');
    var cache = CacheService.getScriptCache();
    if (d.aksi === 'ping') return jawab({ ok: true, pesan: 'ping' });
    if (d.aksi === 'bagian') {
      if (!/^[A-Za-z0-9]{6,40}$/.test(String(d.id))) throw new Error('ID tidak valid');
      if (String(d.isi).length > 95000) throw new Error('Potongan terlalu besar');
      cache.put('lp_' + d.id + '_' + parseInt(d.i, 10), String(d.isi), 21600);
      return jawab({ ok: true, i: d.i });
    }
    if (d.aksi === 'selesai') {
      if (!/^[A-Za-z0-9]{6,40}$/.test(String(d.id))) throw new Error('ID tidak valid');
      var n = parseInt(d.n, 10), bagian = [], kunciCache = [];
      if (!(n >= 1 && n <= 400)) throw new Error('Jumlah potongan tidak valid');
      for (var i = 0; i < n; i++) {
        var k = 'lp_' + d.id + '_' + i, v = cache.get(k);
        if (v == null) throw new Error('Potongan ' + (i + 1) + ' tidak ditemukan, coba kirim lagi');
        bagian.push(v); kunciCache.push(k);
      }
      cache.removeAll(kunciCache);
      d.pdf = bagian.join('');
    }
    var kel = String(d.kelurahan || ''), jenis = String(d.jenis || '');
    var pos = bersih(d.posyandu), bln = String(d.bulan || ''), thn = parseInt(d.tahun, 10);
    if (KELURAHAN.indexOf(kel) < 0) throw new Error('Kelurahan tidak dikenal');
    if (JENIS.indexOf(jenis) < 0) throw new Error('Jenis laporan tidak dikenal');
    if (!pos) throw new Error('Nama posyandu kosong');
    if (BULAN.indexOf(bln) < 0) throw new Error('Bulan tidak valid');
    if (!(thn >= 2024 && thn <= 2100)) throw new Error('Tahun tidak valid');
    var bytes = Utilities.base64Decode(String(d.pdf || ''));
    if (!bytes.length || bytes.length > MAKS_BYTE) throw new Error('Ukuran PDF tidak sesuai');
    if (bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) throw new Error('Berkas bukan PDF');

    var sh = lembar();
    var nBln = BULAN.indexOf(bln) + 1;
    var kodeBln = (nBln < 10 ? '0' : '') + nBln;
    var folder = anak(anak(anak(anak(induk(), String(thn)), kodeBln + '-' + bln), kel), pos);

    var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues() : [];
    var versi = 1;
    rows.forEach(function (r) { if (r[2] == thn && r[3] == bln && r[4] == kel && r[5] == pos && r[6] == jenis) versi++; });
    var urut = rows.filter(function (r) { return r[2] == thn && r[3] == bln; }).length + 1;
    var nomor = 'LP-' + thn + '-' + kodeBln + '-' + ('000' + urut).slice(-3);
    var nama = nomor + ' ' + jenis + ' ' + pos + ' ' + bln + ' ' + thn + (versi > 1 ? ' v' + versi : '') + '.pdf';
    var file = folder.createFile(Utilities.newBlob(bytes, 'application/pdf', nama));

    sh.appendRow([nomor, new Date(), thn, bln, kel, pos, jenis, bersih(d.tanggalKegiatan), bersih(d.kader), versi, nama, file.getUrl()]);
    return jawab({ ok: true, nomor: nomor, versi: versi });
  } catch (err) {
    return jawab({ ok: false, pesan: String(err.message || err) });
  } finally {
    try { kunci.releaseLock(); } catch (x) {}
  }
}

function jawab(o) {
  o.t = TOKEN_BALAS;
  var teks = JSON.stringify(o).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<script>window.top.postMessage(' + teks + ',"*");</script>');
}
function bersih(s) { return String(s == null ? '' : s).replace(/[\\\/:*?"<>|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120); }

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
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold').setBackground('#0a7a35').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Jalankan sekali dari editor ("Run") agar Google meminta izin akses Drive dan Sheets. */
function aktifkan() { lembar(); induk(); }
