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
  else if (p.aksi === 'daftarpos') {
    // Publik (untuk aplikasi kader): nama, kelurahan, jenis, dan nama kader aktif sesuai SK. Nomor HP tidak ikut.
    hasil = { ok: true, list: bacaPos().filter(function (x) { return x.aktif !== false; })
      .map(function (x) {
        return { nama: x.nama, kel: x.kel, jenis: x.jenis,
                 kader: (x.kader || []).filter(function (k) { return k.aktif !== false; }).map(function (k) { return { nama: k.nama, jabatan: k.jabatan }; }) };
      }) };
  }
  else if (p.aksi === 'posyandu') {
    if (masuk(p.u, p.p)) {
      var w0 = masuk(p.u, p.p);
      hasil = { ok: true, list: bacaPos().filter(function (x) { return w0.peran !== 'admin' || x.kel === w0.kel; }),
                sk: bacaPengaturan(PANTAU_USER).sk, kel: w0.kel || '' };
    } else {
      Utilities.sleep(1200);
      hasil = { ok: false, login: false, pesan: 'Nama pengguna atau kata sandi salah' };
    }
  }
  else if (p.aksi === 'daftar') {
    var w1 = masuk(p.u, p.p);
    if (w1) {
      hasil = daftarLaporan(w1.peran === 'admin' ? w1.kel : '');
      hasil.peran = w1.peran; hasil.kel = w1.kel || '';
    } else {
      Utilities.sleep(1200);
      hasil = { ok: false, login: false, pesan: 'Nama pengguna atau kata sandi salah' };
    }
  }
  else if (p.aksi === 'profil') {
    var w2 = masuk(p.u, p.p);
    if (w2) {
      var c = bacaPengaturan(w2.u), bs = bacaPengaturan(PANTAU_USER);
      hasil = { ok: true, nama: c.nama, nip: c.nip, jabatan: c.jabatan, unit: c.unit, foto: c.foto,
                banners: bs.banners, batas: bs.batas, sk: bs.sk, peran: w2.peran, kel: w2.kel || '' };
      if (w2.peran === 'utama') hasil.admins = daftarAdmin();
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
/** Admin tambahan (maksimal 5): nama pengguna dan hash kata sandi di Script Properties. */
var MAKS_ADMIN = 5;
function bacaAdmin() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('PANTAU_ADMINS') || '{}'); } catch (x) { return {}; }
}
function bacaKelAdmin() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('PANTAU_ADMIN_KEL') || '{}'); } catch (x) { return {}; }
}
function simpanKelAdmin(a) { PropertiesService.getScriptProperties().setProperty('PANTAU_ADMIN_KEL', JSON.stringify(a)); }
function simpanAdmin(a) { PropertiesService.getScriptProperties().setProperty('PANTAU_ADMINS', JSON.stringify(a)); }
function hashAdmin(k, p) { return hashSandi(k + '|' + String(p || '')); }
function berkasProfil(u) { return (!u || u === PANTAU_USER) ? NAMA_PENGATURAN : 'pengaturan-pantau-' + u + '.json'; }
/** Masuk sebagai admin utama atau admin tambahan. Hasil: {u, peran} atau null. */
function masuk(u, p) {
  u = String(u || '');
  if (u === PANTAU_USER) return sandiBenar(u, p) ? { u: u, peran: 'utama' } : null;
  var k = u.toLowerCase(), a = bacaAdmin();
  if (a[k] && a[k] === hashAdmin(k, p)) return { u: k, peran: 'admin', kel: bacaKelAdmin()[k] || '-' };
  return null;
}
function daftarAdmin() {
  var a = bacaAdmin();
  return Object.keys(a).sort().map(function (k) { var c = bacaPengaturan(k); return { u: k, nama: c.nama, nip: c.nip, kel: bacaKelAdmin()[k] || '' }; });
}
/** Hanya admin utama: tambah, hapus, atau ganti kata sandi admin tambahan. */
function kelola(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh mengelola admin'); }
  var a = bacaAdmin(), nu = String(d.nu || '').toLowerCase().trim(), ns = String(d.ns || '');
  if (d.op !== 'daftar') {
    if (!/^[a-z0-9]{3,20}$/.test(nu)) throw new Error('Nama pengguna 3-20 huruf kecil atau angka');
    if (nu === PANTAU_USER.toLowerCase()) throw new Error('Nama pengguna itu dipakai admin utama');
  }
  if (d.op === 'tambah') {
    if (a[nu]) throw new Error('Nama pengguna sudah dipakai');
    if (Object.keys(a).length >= MAKS_ADMIN) throw new Error('Admin tambahan sudah penuh (maksimal ' + MAKS_ADMIN + ')');
    if (ns.length < 6 || ns.length > 60) throw new Error('Kata sandi minimal 6 karakter');
    var kl = String(d.kel || '');
    if (KELURAHAN.indexOf(kl) < 0) throw new Error('Pilih kelurahan untuk operator');
    a[nu] = hashAdmin(nu, ns); simpanAdmin(a);
    var km = bacaKelAdmin(); km[nu] = kl; simpanKelAdmin(km);
    var nm = bersih(d.nama, 40);
    if (nm) simpanPengaturan({ nama: nm, nip: '', jabatan: '', unit: '', foto: '' }, nu);
  } else if (d.op === 'sandi') {
    if (!a[nu]) throw new Error('Admin tidak ditemukan');
    if (ns.length < 6 || ns.length > 60) throw new Error('Kata sandi minimal 6 karakter');
    a[nu] = hashAdmin(nu, ns); simpanAdmin(a);
  } else if (d.op === 'kel') {
    if (!a[nu]) throw new Error('Admin tidak ditemukan');
    if (KELURAHAN.indexOf(String(d.kel || '')) < 0) throw new Error('Kelurahan tidak dikenal');
    var k2 = bacaKelAdmin(); k2[nu] = String(d.kel); simpanKelAdmin(k2);
  } else if (d.op === 'hapus') {
    if (!a[nu]) throw new Error('Admin tidak ditemukan');
    delete a[nu]; simpanAdmin(a);
    var k3 = bacaKelAdmin(); delete k3[nu]; simpanKelAdmin(k3);
    var it = induk().getFilesByName(berkasProfil(nu));
    while (it.hasNext()) it.next().setTrashed(true);
  } else if (d.op !== 'daftar') {
    throw new Error('Perintah tidak dikenal');
  }
  return simpanHasil({ ok: true, admins: daftarAdmin() }, 'a');
}
function bacaBerkas(nb) {
  try {
    var it = induk().getFilesByName(nb);
    if (it.hasNext()) return JSON.parse(it.next().getBlob().getDataAsString());
  } catch (x) {}
  return {};
}
/** Profil satu admin. Untuk admin utama ikut berisi pengaturan bersama: banner (maks 3), batas tanggal, SK. */
function bacaPengaturan(u) {
  var o = bacaBerkas(berkasProfil(u));
  var c = { nama: o.nama ? String(o.nama) : 'Admin Posyandu', nip: String(o.nip || ''), jabatan: String(o.jabatan || ''),
            unit: String(o.unit || ''), foto: String(o.foto || '') };
  if (!u || u === PANTAU_USER) {
    var bn = Array.isArray(o.banners) ? o.banners : (o.banner ? [o.banner] : []);
    c.banners = [String(bn[0] || ''), String(bn[1] || ''), String(bn[2] || '')];
    c.batas = parseInt(o.batas, 10) || 25;
    c.sk = (o.sk && typeof o.sk === 'object') ? o.sk : {};
  }
  return c;
}
function simpanPengaturan(c, u) {
  var nb = berkasProfil(u), teks = JSON.stringify(c), f = induk(), it = f.getFilesByName(nb);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(nb, teks, MimeType.PLAIN_TEXT);
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
  var w = masuk(d.u, d.p);
  if (!w) { Utilities.sleep(1200); throw new Error('Kata sandi salah'); }
  var c = bacaPengaturan(w.u);
  if (d.nama !== undefined) {
    var n = bersih(d.nama, 40);
    if (!n) throw new Error('Nama tidak boleh kosong');
    c.nama = n;
  }
  if (d.nip !== undefined) c.nip = bersih(d.nip, 30).replace(/[^0-9 ]/g, '');
  if (d.foto !== undefined) c.foto = cekGambar(d.foto, 45000);
  if (d.jabatan !== undefined) c.jabatan = bersih(d.jabatan, 60);
  if (d.unit !== undefined) c.unit = bersih(d.unit, 80);
  if (d.bannerIdx !== undefined) {
    if (w.peran !== 'utama') throw new Error('Hanya admin utama yang boleh mengubah banner');
    var bi = parseInt(d.bannerIdx, 10);
    if (!(bi >= 0 && bi < 3)) throw new Error('Nomor banner tidak valid');
    c.banners[bi] = cekGambar(d.banner, 60000);
  }
  if (d.batas !== undefined) {
    if (w.peran !== 'utama') throw new Error('Hanya admin utama yang boleh mengubah batas waktu');
    var bt = parseInt(d.batas, 10);
    if (!(bt >= 1 && bt <= 31)) throw new Error('Batas tanggal 1 sampai 31');
    c.batas = bt;
  }
  if (d.sandiBaru !== undefined) {
    var sb = String(d.sandiBaru);
    if (sb.length < 6 || sb.length > 60) throw new Error('Kata sandi baru minimal 6 karakter');
    if (w.peran === 'utama') PropertiesService.getScriptProperties().setProperty('PANTAU_SANDI_HASH', hashSandi(sb));
    else { var ad = bacaAdmin(); ad[w.u] = hashAdmin(w.u, sb); simpanAdmin(ad); }
  }
  simpanPengaturan(c, w.u);
  return simpanHasil({ ok: true }, 'a');
}

/** Untuk aplikasi pemantau (hanya setelah login): data laporan beserta angka hasil kegiatan dan nama kader. */
function daftarLaporan(kel) {
  try {
    var sh = lembar(), n = sh.getLastRow();
    if (n < 2) return { ok: true, data: [], waktu: Date.now() };
    var zona = Session.getScriptTimeZone();
    var tgl = function (v) { return v instanceof Date ? Utilities.formatDate(v, zona, 'dd/MM/yyyy HH:mm:ss') : String(v == null ? '' : v); };
    var rows = sh.getRange(2, 1, n - 1, HEADER.length).getValues();
    var data = [];
    rows.forEach(function (r) {
      if (!r[0]) return;
      if (kel && String(r[4]) !== kel) return;
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
      if (d.aksi === 'kelola') { tag = 'a'; return kelola(d); }
      if (d.aksi === 'pos') { tag = 'a'; return simpanPos(d); }
      if (d.aksi === 'sk') { tag = 'a'; return simpanSk(d, cache); }
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
                bersih(d.kader, 900), nb.versi, '', '', bersih(d.hasilText, 800), 'PDF menunggu']);
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
                  bersih(d.kader, 900), nb.versi, nama, file.getUrl(), bersih(d.hasilText, 800), 'PDF tersimpan']);
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


// ===================== Data Posyandu (sumber utama nama Posyandu) =====================
var NAMA_POS = 'data-posyandu.json';
function bacaPos() {
  var o = bacaBerkas(NAMA_POS);
  return Array.isArray(o.list) ? o.list : [];
}
function kunciPos(kel, jenis, nama) {
  return [kel, jenis, String(nama || '').toLowerCase().replace(/posyandu/g, '').replace(/[^a-z0-9]/g, '').replace(/bougenv[a-z]*/, 'bougenvil')].join('|');
}
/** Rapikan dan periksa seluruh daftar sebelum disimpan. */
function bersihPos(arr) {
  if (!Array.isArray(arr)) throw new Error('Data tidak valid');
  if (arr.length > 100) throw new Error('Maksimal 100 Posyandu');
  var pakai = {}, kunci = {}, out = [];
  arr.forEach(function (x, i) {
    var nama = bersih(x.nama, 60), kel = String(x.kel || ''), jenis = String(x.jenis || '');
    if (!nama) throw new Error('Baris ' + (i + 1) + ': nama Posyandu kosong');
    if (KELURAHAN.indexOf(kel) < 0) throw new Error(nama + ': kelurahan tidak dikenal');
    if (JENIS.indexOf(jenis) < 0) throw new Error(nama + ': jenis tidak dikenal');
    var k = kunciPos(kel, jenis, nama);
    if (kunci[k]) throw new Error('Posyandu ganda: ' + nama + ' (' + kel + ', ' + jenis + ')');
    kunci[k] = 1;
    var id = String(x.id || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
    if (!id || pakai[id]) id = 'p' + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    pakai[id] = 1;
    var kader = (Array.isArray(x.kader) ? x.kader : []).slice(0, 15).map(function (q) {
      return { nama: bersih(q.nama, 60), jabatan: bersih(q.jabatan, 20), aktif: q.aktif !== false };
    }).filter(function (q) { return q.nama; });
    out.push({ id: id, nama: nama, kel: kel, jenis: jenis, alamat: bersih(x.alamat, 120), puskesmas: bersih(x.puskesmas, 40),
               ketua: bersih(x.ketua, 60), hp: String(x.hp || '').replace(/[^0-9+ \-]/g, '').slice(0, 20),
               jadwal: bersih(x.jadwal, 80), aktif: x.aktif !== false, kader: kader });
  });
  return out;
}
/** Hanya admin utama: simpan seluruh daftar Posyandu. */
function simpanPos(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh mengubah data Posyandu'); }
  var list = bersihPos(d.list), teks = JSON.stringify({ list: list, tgl: Date.now() }), f = induk(), it = f.getFilesByName(NAMA_POS);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_POS, teks, MimeType.PLAIN_TEXT);
  return simpanHasil({ ok: true, list: list }, 'a');
}
/** Hanya admin utama: simpan berkas PDF SK (Balita atau Lansia) yang dikirim berpotong-potong. */
function simpanSk(d, cache) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh mengunggah SK'); }
  var jenis = String(d.jenis || '');
  if (jenis !== 'Balita' && jenis !== 'Lansia') throw new Error('Jenis SK tidak dikenal');
  var n = parseInt(d.n, 10), bagian = [], kunciCache = [];
  if (!(n >= 1 && n <= 130)) throw new Error('Jumlah potongan tidak valid');
  for (var i = 0; i < n; i++) {
    var k = 'lp_' + d.id + '_' + i, s = cache.get(k);
    if (s == null) throw new Error('Potongan ' + (i + 1) + ' tidak ditemukan, coba unggah lagi');
    bagian.push(s); kunciCache.push(k);
  }
  var bytes = Utilities.base64Decode(bagian.join(''));
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error('Ukuran SK maksimal 10 MB');
  if (bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) throw new Error('Berkas bukan PDF');
  var folder = anak(induk(), 'SK'), nama = 'SK Posyandu ' + jenis + '.pdf', lama = folder.getFilesByName(nama);
  while (lama.hasNext()) lama.next().setTrashed(true);
  var file = folder.createFile(Utilities.newBlob(bytes, 'application/pdf', nama));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var c = bacaPengaturan(PANTAU_USER);
  c.sk[jenis] = { id: file.getId(), tgl: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'), ukuran: bytes.length };
  simpanPengaturan(c, PANTAU_USER);
  cache.removeAll(kunciCache);
  return simpanHasil({ ok: true, sk: c.sk }, 'a');
}
