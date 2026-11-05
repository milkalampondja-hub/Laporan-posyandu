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
var HEADER      = ['Nomor Laporan','Tanggal Kirim','Tahun','Bulan','Kelurahan','Posyandu','Jenis','Tanggal Kegiatan','Nama Kader','Versi','Nama File','Link File','Hasil Kegiatan','Status PDF','Kode QR'];
// Login aplikasi Pantau. GANTI kedua nilai ini di Apps Script Anda sebelum diterapkan.
var PANTAU_USER = 'admin';
var PANTAU_SANDI = 'GantiSandi2026';
var NAMA_PENGATURAN = 'pengaturan-pantau.json';
var ID_RE       = /^[A-Za-z0-9]{6,40}$/;

var TOKEN_BALAS = '';
var ID_AKTIF = '';
var AS_USER = '';
var IZIN_TERIMA = false;   // akun penerima hanya boleh dipakai oleh aplikasi Terima   // admin kecamatan melihat sebagai operator kelurahan

function doGet(e) {
  var p = (e && e.parameter) || {};
  AS_USER = String(p.as || '').toLowerCase();
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
    var ps = bacaPengaturan(PANTAU_USER);
    hasil = { ok: true, list: bacaPos().filter(function (x) { return x.aktif !== false; })
      .map(function (x) {
        return { nama: x.nama, kel: x.kel, jenis: x.jenis,
                 kader: (x.kader || []).filter(function (k) { return k.aktif !== false; }).map(function (k) { return { nama: k.nama, jabatan: k.jabatan }; }) };
      }), info: ps.pengumuman, infoTgl: ps.pengumumanTgl, wa: ps.wa, batas: ps.batas };
  }
  else if (p.aksi === 'posyandu') {
    if (masuk(p.u, p.p)) {
      var w0 = masuk(p.u, p.p);
      hasil = { ok: true, list: bacaPos().filter(function (x) { return w0.peran !== 'admin' || x.kel === w0.kel; }),
                sk: bacaPengaturan(PANTAU_USER).sk, kel: w0.kel || '', fitur: ['alias'] };
    } else {
      hasil = gagalLogin();
    }
  }
  else if (p.aksi === 'daftar') {
    var w1 = masuk(p.u, p.p);
    if (w1) {
      hasil = daftarLaporan(w1.peran === 'admin' ? w1.kel : '');
      hasil.peran = w1.peran; hasil.kel = w1.kel || ''; hasil.st = bacaStamp();
    } else {
      hasil = gagalLogin();
    }
  }
  else if (p.aksi === 'profil') {
    var w2 = masuk(p.u, p.p);
    if (w2) {
      var c = bacaPengaturan(w2.u), bs = bacaPengaturan(PANTAU_USER);
      hasil = { ok: true, nama: c.nama, nip: c.nip, jabatan: c.jabatan, unit: c.unit, foto: c.foto,
                banners: bs.banners, batas: bs.batas, batasKel: bs.batasKel, sk: bs.sk, pengumuman: bs.pengumuman, wa: bs.wa, fisik: bs.fisik, peran: w2.peran, kel: w2.kel || '' };
      if (w2.peran === 'utama') { hasil.admins = daftarAdmin(); hasil.ruang = bacaRuang(); hasil.penerima = infoPenerima(); }
    } else {
      hasil = gagalLogin();
    }
  }
  else if (p.aksi === 'ubah') {
    // Pemeriksaan ringan untuk Pantau: hanya menjawab apakah ada perubahan data sejak terakhir.
    if (masuk(p.u, p.p)) hasil = { ok: true, st: bacaStamp() };
    else hasil = gagalLogin();
  }
  else if (p.aksi === 'cadangan') {
    var w4 = masuk(p.u, p.p);
    if (w4 && w4.peran === 'utama') hasil = { ok: true, cadangan: daftarCadangan() };
    else if (w4) hasil = { ok: false, pesan: 'Hanya admin utama yang boleh melihat cadangan' };
    else hasil = gagalLogin();
  }
  else if (p.aksi === 'setoran') {
    // Status penyerahan laporan ke kecamatan untuk satu bulan (hanya setelah login).
    var w6 = masuk(p.u, p.p);
    if (!w6) hasil = gagalLogin();
    else if (!/^20\d\d-(0[1-9]|1[0-2])$/.test(String(p.per || ''))) hasil = { ok: false, pesan: 'Bulan tidak valid' };
    else { var sj = bacaSetorLengkap(); hasil = { ok: true, per: String(p.per), data: sj.d[String(p.per)] || {}, via: sj.t[String(p.per)] || {} }; }
  }
  else if (p.aksi === 'tcari') { hasil = terimaCari(p); }
  else if (p.aksi === 'trekap') { hasil = terimaRekap(p); }
  else if (p.aksi === 'tterima' || p.aksi === 'tbatal') { hasil = terimaGet(p); }
  else if (p.aksi === 'tlembar') { hasil = terimaLembarCari(p); }
  else if (p.aksi === 'tlterima') { hasil = terimaLembarGet(p); }
  else if (p.aksi === 'lembarkel') { hasil = lembarKelurahan(p); }
  else if (p.aksi === 'pdf') {
    // Unduh PDF laporan (hanya setelah login). Operator hanya boleh laporan kelurahannya.
    var w5 = masuk(p.u, p.p);
    if (w5) hasil = ambilPdf(String(p.n || ''), w5);
    else hasil = gagalLogin();
  }
  else if (p.aksi === 'log') {
    var w3 = masuk(p.u, p.p);
    if (w3 && w3.peran === 'utama') {
      var zl = Session.getScriptTimeZone();
      hasil = { ok: true, log: bacaLog().map(function (x) { return { t: Utilities.formatDate(new Date(x.t), zl, 'dd/MM/yyyy HH:mm'), u: x.u, a: x.a }; }) };
    } else {
      Utilities.sleep(1200);
      hasil = { ok: false, login: false, pesan: 'Hanya admin utama yang boleh melihat catatan perubahan' };
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
/** Akun penerima aplikasi Terima Posyandu (maksimal 10): [{u, h (hash), nama, buat}]. Hanya bisa scan dan konfirmasi penerimaan.
 *  Format lama (satu akun {u,h,nama}) otomatis dibaca sebagai daftar berisi satu akun. */
var MAKS_PENERIMA = 10;
function daftarPenerima() {
  var o; try { o = JSON.parse(PropertiesService.getScriptProperties().getProperty('PANTAU_PENERIMA') || '{}'); } catch (x) { o = {}; }
  if (Array.isArray(o.list)) return o.list;
  return o && o.u ? [{ u: o.u, h: o.h, nama: o.nama || '', buat: 0 }] : [];
}
function simpanPenerima(list) { PropertiesService.getScriptProperties().setProperty('PANTAU_PENERIMA', JSON.stringify({ list: list })); }
function cariPenerima(k) { var l = daftarPenerima(); for (var i = 0; i < l.length; i++) if (l[i].u === k) return l[i]; return null; }
function bacaPakai() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('PANTAU_PENERIMA_PAKAI') || '{}'); } catch (x) { return {}; } }
/** Catat kapan petugas terakhir memakai aplikasi (paling sering sekali tiap 10 menit, agar cepat). */
function catatPakai(u) {
  try {
    var g = bacaPakai(), now = Date.now();
    if (g[u] && now - g[u] < 600000) return;
    g[u] = now; PropertiesService.getScriptProperties().setProperty('PANTAU_PENERIMA_PAKAI', JSON.stringify(g));
  } catch (x) {}
}
function bacaKelAdmin() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('PANTAU_ADMIN_KEL') || '{}'); } catch (x) { return {}; }
}
function simpanKelAdmin(a) { PropertiesService.getScriptProperties().setProperty('PANTAU_ADMIN_KEL', JSON.stringify(a)); }
function simpanAdmin(a) { PropertiesService.getScriptProperties().setProperty('PANTAU_ADMINS', JSON.stringify(a)); }
function hashAdmin(k, p) { return hashSandi(k + '|' + String(p || '')); }
function berkasProfil(u) { return (!u || u === PANTAU_USER) ? NAMA_PENGATURAN : 'pengaturan-pantau-' + u + '.json'; }
/** Masuk sebagai admin utama atau admin tambahan. Hasil: {u, peran} atau null. Salah berulang akan mengunci akun bertahap. */
function masuk(u, p) {
  u = String(u || ''); KUNCI_INFO = null; GAGAL_PESAN = '';
  var k = kunciAkun(u), dikenal = akunDikenal(k);
  if (dikenal) { var kd = statusKunci(k); if (kd) { KUNCI_INFO = kd; return null; } }
  var w = null;
  if (u === PANTAU_USER) { if (sandiBenar(u, p)) w = { u: u, peran: 'utama' }; }
  else {
    var a = bacaAdmin(), pn = a[k] ? null : cariPenerima(k);
    if (a[k] && a[k] === hashAdmin(k, p)) w = { u: k, peran: 'admin', kel: bacaKelAdmin()[k] || '-' };
    else if (pn && pn.h === hashAdmin(k, p)) w = { u: k, peran: 'terima', nama: pn.nama || 'Operator Kecamatan' };
  }
  if (w) {
    if (dikenal) hapusGagal(k);
    if (w.peran === 'terima' && !IZIN_TERIMA) return null;   // akun penerima tidak berlaku untuk aplikasi lain
    // Hanya admin kecamatan yang boleh masuk sebagai operator kelurahan (tanpa kata sandi operator).
    if (w.peran === 'utama' && AS_USER && AS_USER !== PANTAU_USER && bacaAdmin()[AS_USER]) w = { u: AS_USER, peran: 'admin', kel: bacaKelAdmin()[AS_USER] || '-' };
    return w;
  }
  if (dikenal) { catatGagal(k); }
  return null;
}
// ===================== Kunci login bertahap =====================
// Salah kata sandi 5 kali: terkunci 5 menit; 10 kali: 10 menit; 15 kali: 15 menit; 20 kali: terkunci sampai dibuka admin kecamatan.
// Akun admin utama tidak pernah terkunci permanen (maksimal 60 menit), agar tidak bisa dikunci oleh orang lain.
var KUNCI_INFO = null, GAGAL_PESAN = '';
function bacaGagal() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('PANTAU_GAGAL') || '{}'); } catch (x) { return {}; } }
function simpanGagal(g) { PropertiesService.getScriptProperties().setProperty('PANTAU_GAGAL', JSON.stringify(g)); }
function kunciAkun(u) { return u === PANTAU_USER ? PANTAU_USER : String(u || '').toLowerCase(); }
function akunDikenal(k) { return k === PANTAU_USER || !!bacaAdmin()[k] || !!cariPenerima(k); }
function statusKunci(k) {
  var e = bacaGagal()[k];
  if (!e) return null;
  if (e.perm && k !== PANTAU_USER) return { permanen: true, menit: 0 };
  if (e.sampai && e.sampai > Date.now()) return { permanen: false, menit: Math.ceil((e.sampai - Date.now()) / 60000) };
  return null;
}
function hapusGagal(k) { var g = bacaGagal(); if (g[k]) { delete g[k]; simpanGagal(g); } }
function catatGagal(k) {
  var g = bacaGagal(), now = Date.now(), e = g[k] || { n: 0, t: 0 };
  if (!e.perm && e.t && now - e.t > 24 * 3600000) e.n = 0;
  e.n++; e.t = now;
  if (e.n >= 20) {
    if (k === PANTAU_USER) { if (e.n % 5 === 0) e.sampai = now + 60 * 60000; }
    else e.perm = true;
  } else if (e.n % 5 === 0) e.sampai = now + (e.n / 5) * 5 * 60000;
  g[k] = e; simpanGagal(g);
  var kd = statusKunci(k);
  if (kd) { KUNCI_INFO = kd; return; }
  var sisa = 5 - (e.n % 5);
  if (k !== PANTAU_USER && e.n >= 15) GAGAL_PESAN = '. Peringatan: akun terkunci permanen setelah ' + (20 - e.n) + ' kali salah lagi';
  else if (sisa <= 2) GAGAL_PESAN = '. Sisa ' + sisa + ' percobaan sebelum dikunci sementara';
}
/** Jawaban untuk login yang gagal (salah sandi atau sedang terkunci). */
function gagalLogin() {
  if (KUNCI_INFO) {
    return { ok: false, login: false, kunci: true, permanen: !!KUNCI_INFO.permanen,
             pesan: KUNCI_INFO.permanen ? 'Akun terkunci karena terlalu banyak salah memasukkan kata sandi. Hubungi admin kecamatan untuk membuka aplikasi.'
                                        : 'Terlalu banyak salah memasukkan kata sandi. Coba lagi dalam ' + KUNCI_INFO.menit + ' menit.' };
  }
  Utilities.sleep(1200);
  return { ok: false, login: false, pesan: 'Nama pengguna atau kata sandi salah' + GAGAL_PESAN };
}
/** Darurat: jalankan dari editor Apps Script untuk membuka semua akun yang terkunci (termasuk admin utama). */
function bukaSemuaKunci() { simpanGagal({}); }

/** Daftar petugas penerima beserta kunci, terakhir dipakai, dan jumlah laporan yang sudah diterimanya. */
function infoPenerima() {
  var pakai = bacaPakai(), jml = {};
  try {
    var sl = bacaSetorLengkap();
    Object.keys(sl.t).forEach(function (pr) { Object.keys(sl.t[pr]).forEach(function (id) { var by = sl.t[pr][id].by; if (by && (sl.d[pr] || {})[id]) jml[by] = (jml[by] || 0) + 1; }); });
  } catch (x) {}
  return daftarPenerima().map(function (q) { return { u: q.u, nama: q.nama || '', kunci: statusKunci(q.u), buat: q.buat || 0, pakai: pakai[q.u] || 0, jml: jml[q.u] || 0, hp: q.hp === 'iphone' ? 'iphone' : 'android' }; });
}
/** Periksa sandi admin utama di server (untuk tindakan penting). Salah berulang ikut menghitung kunci login. */
function cekKonfirmasi(w, k) {
  var x = masuk(w.u, String(k || ''));
  if (!x) { Utilities.sleep(1200); throw new Error('Sandi tidak cocok'); }
}
function daftarAdmin() {
  var a = bacaAdmin();
  return Object.keys(a).sort().map(function (k) { var c = bacaPengaturan(k); return { u: k, nama: c.nama, nip: c.nip, kel: bacaKelAdmin()[k] || '', kunci: statusKunci(k) }; });
}
/** Hanya admin utama: tambah, hapus, atau ganti kata sandi admin tambahan. */
function kelola(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh mengelola admin'); }
  var a = bacaAdmin(), nu = String(d.nu || '').toLowerCase().trim(), ns = String(d.ns || '');
  if (d.op === 'penerima' || d.op === 'hapuspenerima') {
    var lp = daftarPenerima(), ip = -1; lp.forEach(function (q, i) { if (q.u === nu) ip = i; });
    if (d.op === 'hapuspenerima') {
      if (ip < 0) throw new Error('Petugas penerima tidak ditemukan');
      var nmh = lp[ip].nama || nu; lp.splice(ip, 1); simpanPenerima(lp); hapusGagal(nu);
      catatLog(w.u, 'menghapus petugas penerima ' + nmh + ' (' + nu + ')');
    } else {
      if (!/^[a-z0-9]{3,20}$/.test(nu)) throw new Error('Nama pengguna 3-20 huruf kecil atau angka');
      if (nu === PANTAU_USER.toLowerCase() || a[nu]) throw new Error('Nama pengguna itu sudah dipakai akun lain');
      var nmp = bersih(d.nama, 40);
      if (!nmp) throw new Error('Isi nama petugas penerima');
      if (ip < 0 && lp.length >= MAKS_PENERIMA) throw new Error('Petugas penerima sudah penuh (maksimal ' + MAKS_PENERIMA + ')');
      if (ns) {
        if (ns.length < 6 || ns.length > 60) throw new Error('Kata sandi minimal 6 karakter');
      } else if (ip < 0) throw new Error('Kata sandi minimal 6 karakter');
      var hpn = d.hp === 'iphone' ? 'iphone' : 'android';
      if (ip < 0) { lp.push({ u: nu, h: hashAdmin(nu, ns), nama: nmp, buat: Date.now(), hp: hpn }); catatLog(w.u, 'menambah petugas penerima ' + nmp + ' (' + nu + ')'); }
      else {
        var lamaNm = lp[ip].nama || '';
        if (ns) lp[ip].h = hashAdmin(nu, ns);
        lp[ip].nama = nmp;
        if (d.hp !== undefined) lp[ip].hp = hpn;
        catatLog(w.u, (ns ? 'membuat tautan akses baru untuk petugas penerima ' : 'mengubah nama petugas penerima ') + nmp + ' (' + nu + ')' + (lamaNm && lamaNm !== nmp ? ' dari ' + lamaNm : ''));
      }
      simpanPenerima(lp); hapusGagal(nu);
    }
    return simpanHasil({ ok: true, admins: daftarAdmin(), penerima: infoPenerima() }, 'a');
  }
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
    catatLog(w.u, 'menambah operator ' + nu + ' (Kelurahan ' + kl + ')');
  } else if (d.op === 'sandi') {
    if (!a[nu]) throw new Error('Admin tidak ditemukan');
    if (ns.length < 6 || ns.length > 60) throw new Error('Kata sandi minimal 6 karakter');
    a[nu] = hashAdmin(nu, ns); simpanAdmin(a); hapusGagal(nu);
    catatLog(w.u, 'mengganti kata sandi operator ' + nu);
  } else if (d.op === 'kel') {
    if (!a[nu]) throw new Error('Admin tidak ditemukan');
    if (KELURAHAN.indexOf(String(d.kel || '')) < 0) throw new Error('Kelurahan tidak dikenal');
    var k2 = bacaKelAdmin(); k2[nu] = String(d.kel); simpanKelAdmin(k2);
    catatLog(w.u, 'memindahkan operator ' + nu + ' ke Kelurahan ' + d.kel);
  } else if (d.op === 'buka') {
    if (!a[nu] && !cariPenerima(nu)) throw new Error('Admin tidak ditemukan');
    hapusGagal(nu);
    catatLog(w.u, 'membuka kunci akun operator ' + nu);
  } else if (d.op === 'hapus') {
    if (!a[nu]) throw new Error('Admin tidak ditemukan');
    delete a[nu]; simpanAdmin(a); hapusGagal(nu);
    var k3 = bacaKelAdmin(); delete k3[nu]; simpanKelAdmin(k3);
    var it = induk().getFilesByName(berkasProfil(nu));
    while (it.hasNext()) it.next().setTrashed(true);
    catatLog(w.u, 'menghapus operator ' + nu);
  } else if (d.op !== 'daftar') {
    throw new Error('Perintah tidak dikenal');
  }
  return simpanHasil({ ok: true, admins: daftarAdmin(), penerima: infoPenerima() }, 'a');
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
    c.batasKel = parseInt(o.batasKel, 10) || 0;
    c.sk = (o.sk && typeof o.sk === 'object') ? o.sk : {};
    c.pengumuman = String(o.pengumuman || '');
    c.pengumumanTgl = String(o.pengumumanTgl || '');
    c.wa = String(o.wa || '');
    c.fisik = o.fisik === false ? false : (o.fisik === true ? true : null);   // masa peralihan: null = belum pernah diatur di server
  }
  return c;
}
function simpanPengaturan(c, u) {
  var nb = berkasProfil(u), teks = JSON.stringify(c), f = induk(), it = f.getFilesByName(nb);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(nb, teks, MimeType.PLAIN_TEXT);
  if (!u || u === PANTAU_USER) { try { CacheService.getScriptCache().removeAll(['cfg_batas', 'nm_' + PANTAU_USER]); } catch (x) {} }
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
  if (d.batasKel !== undefined) {
    if (w.peran !== 'utama') throw new Error('Hanya admin utama yang boleh mengubah batas waktu kelurahan');
    var bk = parseInt(d.batasKel, 10);
    if (!(bk >= 1 && bk <= 31)) throw new Error('Batas tanggal 1 sampai 31');
    c.batasKel = bk;
  }
  if (d.pengumuman !== undefined) {
    if (w.peran !== 'utama') throw new Error('Hanya admin utama yang boleh mengubah pengumuman');
    var pbaru = String(d.pengumuman).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
    if (pbaru !== c.pengumuman) c.pengumumanTgl = pbaru ? Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '';
    c.pengumuman = pbaru;
  }
  if (d.wa !== undefined) {
    if (w.peran !== 'utama') throw new Error('Hanya admin utama yang boleh mengubah nomor bantuan');
    var nw = String(d.wa).replace(/[^0-9]/g, '');
    if (nw.indexOf('0') === 0) nw = '62' + nw.slice(1);
    if (nw && !/^\d{9,15}$/.test(nw)) throw new Error('Nomor WhatsApp tidak valid');
    c.wa = nw;
  }
  if (d.fisik !== undefined) {
    if (w.peran !== 'utama') throw new Error('Hanya admin utama yang boleh mengubah masa peralihan');
    cekKonfirmasi(w, d.konfirmasi);
    c.fisik = d.fisik === true || d.fisik === 'true' || d.fisik === 1 || d.fisik === '1';
  }
  if (d.sandiBaru !== undefined) {
    var sb = String(d.sandiBaru);
    if (sb.length < 6 || sb.length > 60) throw new Error('Kata sandi baru minimal 6 karakter');
    if (w.peran === 'utama') PropertiesService.getScriptProperties().setProperty('PANTAU_SANDI_HASH', hashSandi(sb));
    else { var ad = bacaAdmin(); ad[w.u] = hashAdmin(w.u, sb); simpanAdmin(ad); }
  }
  simpanPengaturan(c, w.u);
  var cl = [];
  if (d.nama !== undefined || d.nip !== undefined || d.jabatan !== undefined || d.unit !== undefined) cl.push('mengubah data profil');
  if (d.foto !== undefined) cl.push('mengubah foto profil');
  if (d.bannerIdx !== undefined) cl.push('mengubah banner ' + (parseInt(d.bannerIdx, 10) + 1));
  if (d.batas !== undefined) cl.push('mengubah batas waktu menjadi tanggal ' + c.batas);
  if (d.batasKel !== undefined) cl.push('mengubah batas waktu kelurahan mengantar laporan menjadi tanggal ' + c.batasKel);
  if (d.pengumuman !== undefined) cl.push(c.pengumuman ? 'mengubah pengumuman untuk kader' : 'menghapus pengumuman untuk kader');
  if (d.wa !== undefined) cl.push(c.wa ? 'mengubah nomor WhatsApp bantuan' : 'menghapus nomor WhatsApp bantuan');
  if (d.fisik !== undefined) cl.push(c.fisik ? 'menghidupkan masa peralihan' : 'mematikan masa peralihan');
  if (d.sandiBaru !== undefined) cl.push('mengganti kata sandi');
  if (cl.length) catatLog(w.u, cl.join(', '));
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

/** Ambil berkas PDF satu laporan dari Drive (tanpa membuat berkas dibagikan ke umum), dikirim sebagai base64. */
function ambilPdf(nomor, w) {
  try {
    var sh = lembar(), n = sh.getLastRow();
    if (n < 2 || !nomor) return { ok: false, pesan: 'Laporan tidak ditemukan' };
    var rows = sh.getRange(2, 1, n - 1, HEADER.length).getValues(), r = null;
    for (var i = rows.length - 1; i >= 0; i--) { if (String(rows[i][0]) === nomor) { r = rows[i]; break; } }
    if (!r) return { ok: false, pesan: 'Laporan tidak ditemukan' };
    if (w.peran === 'admin' && String(r[4]) !== w.kel) return { ok: false, pesan: 'Laporan ini bukan di kelurahan Anda' };
    var m = /\/d\/([A-Za-z0-9_-]+)/.exec(String(r[11] || ''));
    if (!m) return { ok: false, pesan: 'PDF laporan ini belum tersimpan di Drive' };
    var f = DriveApp.getFileById(m[1]);
    if (f.getSize() > 20 * 1024 * 1024) return { ok: false, pesan: 'Berkas PDF terlalu besar untuk diunduh dari sini' };
    return { ok: true, nama: f.getName(), b64: Utilities.base64Encode(f.getBlob().getBytes()) };
  } catch (err) {
    return { ok: false, pesan: 'PDF tidak bisa diambil: ' + String(err.message || err) };
  }
}

function doPost(e) {
  var tag = 's';
  try {
    var d = JSON.parse((e.parameter && e.parameter.data) ? e.parameter.data : e.postData.contents);
    AS_USER = String(d.as || '').toLowerCase();
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
      if (d.aksi === 'nomor') { tag = 'a'; return simpanNomor(d); }
      if (d.aksi === 'setor') { tag = 'a'; return catatSetor(d); }
      if (d.aksi === 'lembar') { tag = 'a'; return buatLembar(d); }
      if (d.aksi === 'bukalaporan') { tag = 'a'; return bukaLaporan(d); }
      if (d.aksi === 'terima') { tag = 'a'; return terimaKonfirmasi(d); }
      if (d.aksi === 'terimabatal') { tag = 'a'; return terimaBatal(d); }
      if (d.aksi === 'sk') { tag = 'a'; return simpanSk(d, cache); }
      if (d.aksi === 'cadang') { tag = 'a'; return cadangSekarang(d); }
      if (d.aksi === 'pulih') { tag = 'a'; return pulihkanPos(d); }
      if (d.aksi === 'ruang') { tag = 'a'; return perbaruiRuang(d); }
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
  var v = validasi(d); cekKunciLaporan(v);
  var sh = lembar(), nb = nomorBaru(sh, v);
  sh.appendRow([nb.nomor, new Date(), v.thn, v.bln, v.kel, v.pos, v.jenis, bersih(d.tanggalKegiatan, 120),
                bersih(d.kader, 900), nb.versi, '', '', bersih(d.hasilText, 800), 'PDF menunggu', String(d.id || '')]);
  sentuhStamp();
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
  if (!info) cekKunciLaporan(v);
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
                  bersih(d.kader, 900), nb.versi, nama, file.getUrl(), bersih(d.hasilText, 800), 'PDF tersimpan', String(d.id || '')]);
  }
  cache.removeAll(kunciCache);
  sentuhStamp();
  return simpanHasil({ ok: true, nomor: nb.nomor, versi: nb.versi }, 's');
}

function simpanHasil(o, tag) {
  if (ID_RE.test(ID_AKTIF)) {
    try { CacheService.getScriptCache().put('hasil_' + tag + '_' + ID_AKTIF, JSON.stringify(o), 21600); } catch (x) {}
  }
  return jawab(o);
}

/** Penanda perubahan data (waktu terakhir ada laporan atau data Posyandu yang berubah). */
function bacaStamp() { return PropertiesService.getScriptProperties().getProperty('STAMP_DATA') || '0'; }
function sentuhStamp() { try { var lama = parseInt(bacaStamp(), 10) || 0; PropertiesService.getScriptProperties().setProperty('STAMP_DATA', String(Math.max(Date.now(), lama + 1))); } catch (x) {} }

function jawab(o) {
  o.t = TOKEN_BALAS;
  var teks = JSON.stringify(o).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<script>window.top.postMessage(' + teks + ',"*");</script>');
}
function bersih(s, maks) { return String(s == null ? '' : s).replace(/[\\\/:*?"<>|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maks || 120); }

var INDUK_MEM = null;
function induk() {
  if (INDUK_MEM) return INDUK_MEM;
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('FOLDER_ID');
  if (id) { try { INDUK_MEM = DriveApp.getFolderById(id); return INDUK_MEM; } catch (x) { INDUK_MEM = null; } }
  var it = DriveApp.getFoldersByName(NAMA_FOLDER);
  var f = it.hasNext() ? it.next() : DriveApp.createFolder(NAMA_FOLDER);
  try { props.setProperty('FOLDER_ID', f.getId()); } catch (x) {}
  INDUK_MEM = f;
  return f;
}
/** Baca berkas JSON kecil dengan cache sementara. Kunci cache memuat penanda perubahan data, jadi otomatis baru setiap ada perubahan. */
function bacaBerkasCepat(nb) {
  var cache = CacheService.getScriptCache(), k = 'bk_' + nb + '_' + bacaStamp();
  try { var v = cache.get(k); if (v) return JSON.parse(v); } catch (x) {}
  var o = bacaBerkas(nb);
  try { var s = JSON.stringify(o); if (s.length < 90000) cache.put(k, s, 900); } catch (x) {}
  return o;
}
/** Batas tanggal pengumpulan laporan (disimpan sementara; dihapus saat pengaturan admin utama berubah). */
function bacaBatas() {
  var cache = CacheService.getScriptCache();
  try { var v = cache.get('cfg_batas'); if (v) return parseInt(v, 10) || 25; } catch (x) {}
  var b = bacaPengaturan(PANTAU_USER).batas;
  try { cache.put('cfg_batas', String(b), 21600); } catch (x) {}
  return b;
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
  var o = bacaBerkasCepat(NAMA_POS);
  return Array.isArray(o.list) ? o.list : [];
}
function kunciPos(kel, jenis, nama) {
  return [kel, jenis, String(nama || '').toLowerCase().replace(/posyandu/g, '').replace(/[^a-z0-9]/g, '').replace(/bougenv[a-z]*/, 'bougenvil')].join('|');
}
/** Nama lama sebuah Posyandu (bila pernah ganti nama): laporan lama tetap dikenali lewat nama ini. */
function cariLap(lap, x) {
  var r = lap[kunciPos(x.kel, x.jenis, x.nama)];
  if (r) return r;
  var al = Array.isArray(x.alias) ? x.alias : [];
  for (var i = 0; i < al.length; i++) { r = lap[kunciPos(x.kel, x.jenis, al[i])]; if (r) return r; }
  return null;
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
               jadwal: bersih(x.jadwal, 80), aktif: x.aktif !== false, kader: kader,
               hpJenis: x.hpJenis === 'perwakilan' ? 'perwakilan' : 'ketua', hpNama: bersih(x.hpNama, 60),
               alias: (Array.isArray(x.alias) ? x.alias : []).map(function (a) { return bersih(a, 60); }).filter(function (a) { return a && kunciPos(kel, jenis, a) !== k; }).slice(0, 5) });
  });
  return out;
}
/** Hanya admin utama: simpan seluruh daftar Posyandu. */
function simpanPos(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh mengubah data Posyandu'); }
  if (d.konfirmasi !== undefined) cekKonfirmasi(w, d.konfirmasi);
  var lama = bacaPos(), list = bersihPos(d.list), teks = JSON.stringify({ list: list, tgl: Date.now() }), f = induk(), it = f.getFilesByName(NAMA_POS);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_POS, teks, MimeType.PLAIN_TEXT);
  sentuhStamp();
  try { catatLog(w.u, ringkasPos(lama, list)); } catch (x) {}
  return simpanHasil({ ok: true, list: list }, 'a');
}
/** Admin utama atau operator: ubah nomor HP ketua atau perwakilan satu Posyandu. Operator hanya untuk kelurahannya. */
function simpanNomor(d) {
  var w = masuk(d.u, d.p);
  if (!w) { Utilities.sleep(1200); throw new Error('Silakan masuk lagi'); }
  var lama = bacaPos(), id = String(d.pid || ''), ix = -1;
  lama.forEach(function (x, i) { if (x.id === id) ix = i; });
  if (ix < 0) throw new Error('Posyandu tidak ditemukan. Minta admin kecamatan menyimpan daftar Posyandu terlebih dahulu');
  var p = lama[ix];
  if (w.peran !== 'utama' && p.kel !== w.kel) throw new Error('Posyandu ini bukan di kelurahan Anda');
  var hp = String(d.hp || '').replace(/[^0-9+ \-]/g, '').slice(0, 20);
  if (hp && hp.replace(/[^0-9]/g, '').length < 9) throw new Error('Nomor HP terlalu pendek');
  p.hp = hp;
  p.hpJenis = d.hpJenis === 'perwakilan' ? 'perwakilan' : 'ketua';
  p.hpNama = p.hpJenis === 'perwakilan' ? bersih(d.hpNama, 60) : '';
  var teks = JSON.stringify({ list: lama, tgl: Date.now() }), f = induk(), it = f.getFilesByName(NAMA_POS);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_POS, teks, MimeType.PLAIN_TEXT);
  sentuhStamp();
  catatLog(w.u, (hp ? 'mengisi' : 'menghapus') + ' nomor HP ' + p.jenis + ' ' + p.nama + ' (' + p.kel + ')');
  return simpanHasil({ ok: true, list: lama.filter(function (x) { return w.peran === 'utama' || x.kel === w.kel; }) }, 'a');
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
  catatLog(w.u, 'mengunggah SK Posyandu ' + jenis + ' (' + (Math.round(bytes.length / 104857.6) / 10) + ' MB)');
  return simpanHasil({ ok: true, sk: c.sk }, 'a');
}


// ===================== Penyerahan laporan ke kecamatan =====================
var NAMA_SETOR = 'setoran-laporan.json';
/** Bentuk data: d = { "2026-10": { "idPosyandu": "2026-11-03" } }, t = { "2026-10": { "idPosyandu": { nomor, kode, oleh, jam, ts } } } (t hanya untuk yang dikonfirmasi lewat aplikasi Terima). */
function bacaSetorLengkap() {
  var o = bacaBerkasCepat(NAMA_SETOR);
  return { d: (o && o.d && typeof o.d === 'object') ? o.d : {}, t: (o && o.t && typeof o.t === 'object') ? o.t : {} };
}
function bacaSetor() { return bacaSetorLengkap().d; }
function tulisSetor(dd, tt) {
  var ks = Object.keys(dd).sort();
  while (ks.length > 24) { var k0 = ks.shift(); delete dd[k0]; delete tt[k0]; }
  var teks = JSON.stringify({ d: dd, t: tt }), f = induk(), it = f.getFilesByName(NAMA_SETOR);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_SETOR, teks, MimeType.PLAIN_TEXT);
  sentuhStamp();
}
/** Hanya admin utama: catat (atau batalkan) penyerahan laporan satu atau beberapa Posyandu untuk satu bulan. */
function catatSetor(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin kecamatan yang boleh mencatat penyerahan laporan'); }
  var per = String(d.per || '');
  if (!/^20\d\d-(0[1-9]|1[0-2])$/.test(per)) throw new Error('Bulan tidak valid');
  var ids = Array.isArray(d.ids) ? d.ids : [];
  if (!ids.length || ids.length > 100) throw new Error('Pilih Posyandu terlebih dahulu');
  var tgl = String(d.tgl || '');
  if (tgl && !/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(tgl)) throw new Error('Tanggal tidak valid');
  var sl = bacaSetorLengkap(), semua = sl.d, tt = sl.t, m = semua[per] || {}, n = 0;
  ids.forEach(function (id) {
    id = String(id || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
    if (!id) return;
    if (tgl) m[id] = tgl; else delete m[id];
    if (tt[per]) delete tt[per][id];
    n++;
  });
  semua[per] = m;
  tulisSetor(semua, tt);
  catatLog(w.u, (tgl ? 'mencatat ' + n + ' Posyandu sudah menyerahkan laporan ' : 'membatalkan penyerahan laporan ' + n + ' Posyandu ') + per);
  return simpanHasil({ ok: true, per: per, data: m }, 'a');
}


// ===================== Alur kelurahan: lembar pengantar dan kunci laporan =====================
// Kelurahan membuat lembar pengantar (satu per kelurahan per bulan). Laporan yang ikut diantar dikunci agar kader tidak bisa
// mengirim ulang sampai kelurahan membuka kembali. Kode lembar (huruf besar) dipindai di aplikasi Terima: semua laporan
// pada lembar tercatat diterima sekaligus.
var NAMA_LEMBAR = 'lembar-pengantar.json';
var NAMA_KUNCI = 'kunci-laporan.json';
function bacaKunciLap() { var o = bacaBerkasCepat(NAMA_KUNCI); return (o && o.K && typeof o.K === 'object') ? o.K : {}; }
function tulisKunciLap(K) {
  var teks = JSON.stringify({ K: K }), f = induk(), it = f.getFilesByName(NAMA_KUNCI);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_KUNCI, teks, MimeType.PLAIN_TEXT);
  sentuhStamp();
}
function bacaLembarSemua() { var o = bacaBerkasCepat(NAMA_LEMBAR); return (o && o.L && typeof o.L === 'object') ? o.L : {}; }
function tulisLembarSemua(L) {
  var ks = Object.keys(L).sort(function (a, b) { return (L[a].ts || 0) - (L[b].ts || 0); });
  while (ks.length > 120) delete L[ks.shift()];
  var teks = JSON.stringify({ L: L }), f = induk(), it = f.getFilesByName(NAMA_LEMBAR);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_LEMBAR, teks, MimeType.PLAIN_TEXT);
  sentuhStamp();
}
function kodeLembarBaru() {
  var h = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'L';
  for (var i = 0; i < 10; i++) s += h.charAt(Math.floor(Math.random() * h.length));
  return s;
}
function adaKodeLembar(k) { return /^L[A-Z0-9]{10}$/.test(String(k || '')); }
function kunciLap(per, kel, jenis, nama) { return per + '|' + kunciPos(kel, jenis, nama); }
/** Laporan terbaru tiap Posyandu untuk satu bulan: { kunciPos: {nomor, kode, versi, pdf} }. */
function laporanPeriode(per) {
  var out = {}, sh = lembar(), n = sh.getLastRow();
  if (n > 1) sh.getRange(2, 1, n - 1, HEADER.length).getValues().forEach(function (x) {
    if (kodePeriode(x[2], x[3]) !== per) return;
    var k = kunciPos(String(x[4]), String(x[6]), String(x[5])), v = parseInt(x[9], 10) || 1;
    if (!out[k] || v >= out[k].versi) out[k] = { nomor: String(x[0]), kode: String(x[14] || ''), versi: v, pdf: String(x[13] || '') === 'PDF tersimpan' };
  });
  return out;
}
/** Dipanggil saat kader mengirim laporan: tolak bila laporan bulan itu sudah dicetak oleh kelurahan. */
function cekKunciLaporan(v) {
  var per = kodePeriode(v.thn, v.bln);
  if (per && bacaKunciLap()[kunciLap(per, v.kel, v.jenis, v.pos)]) {
    throw new Error('Laporan bulan ini sudah dicetak oleh pihak kelurahan, sehingga tidak bisa dikirim ulang. Hubungi pihak kelurahan untuk membuka kembali.');
  }
}
function masukKelurahan(d) {
  var w = masuk(d.u, d.p);
  if (!w || (w.peran !== 'admin' && w.peran !== 'utama')) { Utilities.sleep(1200); throw new Error('Silakan masuk lagi'); }
  var kel = w.peran === 'admin' ? w.kel : String(d.kel || '');
  if (KELURAHAN.indexOf(kel) < 0) throw new Error('Kelurahan tidak dikenal');
  return { w: w, kel: kel };
}
function periodeValid(per) { per = String(per || ''); if (!/^20\d\d-(0[1-9]|1[0-2])$/.test(per)) throw new Error('Bulan tidak valid'); return per; }
function denganKunci(fn) {
  var kunci = LockService.getScriptLock();
  try { kunci.waitLock(20000); } catch (x) { throw new Error('Server sedang sibuk, coba lagi'); }
  try { return fn(); } finally { try { kunci.releaseLock(); } catch (x) {} }
}
/** POST (kelurahan atau admin kecamatan): buat lembar pengantar satu bulan. Status tiap Posyandu ditetapkan saat ini. */
function buatLembar(d) {
  var m = masukKelurahan(d), w = m.w, kel = m.kel, per = periodeValid(d.per);
  var tahan = {}; (Array.isArray(d.tahan) ? d.tahan : []).forEach(function (x) { tahan[String(x || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12)] = true; });
  return denganKunci(function () {
    var sl = bacaSetorLengkap(), L = bacaLembarSemua(), K = bacaKunciLap(), lap = laporanPeriode(per);
    var pos = bacaPos().filter(function (x) { return x.aktif !== false && x.kel === kel; })
      .sort(function (a, b) { return a.jenis.localeCompare(b.jenis) || a.nama.localeCompare(b.nama); });
    var items = pos.map(function (x) {
      var r = cariLap(lap, x), st;
      if ((sl.d[per] || {})[x.id]) st = 'diterima';
      else if (!r) st = 'belum';
      else if (!r.pdf) st = 'pdfbelum';
      else if (tahan[x.id]) st = 'tahan';
      else st = 'ikut';
      return { pid: x.id, nama: x.nama, jenis: x.jenis, st: st, nomor: r ? r.nomor : '', kode: r ? r.kode : '', versi: r ? r.versi : 0 };
    });
    var ikut = items.filter(function (x) { return x.st === 'ikut'; });
    if (!ikut.length) throw new Error('Belum ada laporan yang bisa diantar. Laporan harus sudah dikirim kader dan PDF-nya tersimpan.');
    var zona = Session.getScriptTimeZone(), now = new Date(), kode = kodeLembarBaru();
    // lembar lama untuk kelurahan dan bulan yang sama dinyatakan diganti; kuncinya dilepas lalu dipasang ulang sesuai lembar baru
    Object.keys(L).forEach(function (k) {
      var o = L[k]; if (o.kel !== kel || o.per !== per || o.ganti) return;
      o.ganti = kode;
      Object.keys(K).forEach(function (kk) { if (K[kk] === k) delete K[kk]; });
    });
    items.forEach(function (x) {
      if (x.st === 'ikut' || (x.st === 'diterima' && x.nomor)) { var q = pos.filter(function (y) { return y.id === x.pid; })[0]; K[kunciLap(per, q.kel, q.jenis, q.nama)] = kode; }
    });
    var oleh = namaOperator(w);
    L[kode] = { kode: kode, kel: kel, per: per, bln: BULAN[parseInt(per.slice(5), 10) - 1], thn: per.slice(0, 4),
                tgl: Utilities.formatDate(now, zona, 'yyyy-MM-dd'), jam: Utilities.formatDate(now, zona, 'HH:mm'), oleh: oleh, ts: now.getTime(),
                items: items, ganti: '', diterima: null };
    tulisLembarSemua(L); tulisKunciLap(K);
    catatLog(w.u, 'membuat lembar pengantar ' + kel + ' ' + per + ' (' + ikut.length + ' laporan) [' + kode + ']');
    return simpanHasil({ ok: true, lembar: L[kode] }, 'a');
  });
}
/** POST: buka kembali satu laporan yang sudah dikunci, agar kader bisa mengirim ulang. */
function bukaLaporan(d) {
  var m = masukKelurahan(d), w = m.w, kel = m.kel, per = periodeValid(d.per);
  var pid = String(d.pid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12), alasan = bersih(d.alasan, 120);
  if (alasan.length < 3) throw new Error('Tulis alasan membuka kembali laporan');
  return denganKunci(function () {
    var x = bacaPos().filter(function (q) { return q.id === pid && q.kel === kel; })[0];
    if (!x) throw new Error('Posyandu tidak ditemukan di kelurahan ini');
    var sl = bacaSetorLengkap();
    if ((sl.d[per] || {})[pid]) throw new Error('Laporan ini sudah diterima kecamatan. Batalkan dulu penerimaannya lewat Koreksi di aplikasi Terima.');
    var K = bacaKunciLap(), kk = kunciLap(per, x.kel, x.jenis, x.nama);
    if (!K[kk]) return simpanHasil({ ok: true, per: per, pid: pid }, 'a');
    delete K[kk]; tulisKunciLap(K);
    catatLog(w.u, 'membuka kembali laporan ' + x.jenis + ' ' + x.nama + ' (' + x.kel + ') ' + per + '. Alasan: ' + alasan);
    return simpanHasil({ ok: true, per: per, pid: pid }, 'a');
  });
}
/** Keterangan lembar beserta keadaan terbarunya (sudah diterima, dibuka kembali, diganti). */
function lembarLengkap(o, sl, K) {
  var pos = bacaPos(), byId = {}; pos.forEach(function (x) { byId[x.id] = x; });
  var hasil = JSON.parse(JSON.stringify(o));
  hasil.items.forEach(function (it) {
    var q = byId[it.pid]; it.terima = statusTerima(o.per, it.pid, sl);
    it.dibuka = !!(it.st === 'ikut' && q && K[kunciLap(o.per, q.kel, q.jenis, q.nama)] !== o.kode && !it.terima);
  });
  return hasil;
}
/** GET (kelurahan atau admin kecamatan): lembar satu kelurahan untuk satu bulan beserta laporan yang terkunci. */
function lembarKelurahan(p) {
  var m;
  try { m = masukKelurahan(p); } catch (err) { return { ok: false, login: false, pesan: String(err.message || err) }; }
  var per; try { per = periodeValid(p.per); } catch (err) { return { ok: false, pesan: String(err.message || err) }; }
  var L = bacaLembarSemua(), K = bacaKunciLap(), sl = bacaSetorLengkap(), daftar = [], kunciPid = {};
  Object.keys(L).forEach(function (k) { if (L[k].kel === m.kel && L[k].per === per) daftar.push(lembarLengkap(L[k], sl, K)); });
  daftar.sort(function (a, b) { return b.ts - a.ts; });
  bacaPos().forEach(function (x) { if (x.kel === m.kel) { var v = K[kunciLap(per, x.kel, x.jenis, x.nama)]; if (v) kunciPid[x.id] = v; } });
  return { ok: true, per: per, kel: m.kel, lembar: daftar.slice(0, 5), kunci: kunciPid };
}
/** GET (aplikasi Terima): cari lembar pengantar dari kodenya. */
function terimaLembarCari(p) {
  var w = masukTerima(p.u, p.p);
  if (!w) return gagalLogin();
  if (!adaKodeLembar(p.k)) return { ok: true, ada: false };
  var o = bacaLembarSemua()[String(p.k)];
  if (!o) return { ok: true, ada: false };
  return { ok: true, ada: true, lembar: lembarLengkap(o, bacaSetorLengkap(), bacaKunciLap()), oleh: namaOperator(w) };
}
/** GET (aplikasi Terima): konfirmasi penerimaan semua laporan pada lembar (dikurangi yang tidak dicentang petugas). */
function terimaLembarGet(p) {
  var w = masukTerima(p.u, p.p);
  if (!w) return gagalLogin();
  if (!adaKodeLembar(p.k)) return { ok: false, pesan: 'Kode lembar tidak dikenal' };
  var ids = {}; String(p.ids || '').split(',').forEach(function (x) { x = x.replace(/[^A-Za-z0-9]/g, '').slice(0, 12); if (x) ids[x] = true; });
  try {
    return denganKunci(function () {
      var L = bacaLembarSemua(), o = L[String(p.k)];
      if (!o) throw new Error('Lembar tidak ditemukan');
      if (o.ganti) throw new Error('Lembar ini sudah diganti dengan lembar yang lebih baru. Minta pihak kelurahan menyerahkan lembar yang terbaru.');
      var sl = bacaSetorLengkap(), K = bacaKunciLap(), zona = Session.getScriptTimeZone(), now = new Date(), oleh = namaOperator(w);
      var lap = laporanPeriode(o.per), pos = bacaPos(), byId = {}; pos.forEach(function (x) { byId[x.id] = x; });
      var baru = 0, lewati = [];
      sl.d[o.per] = sl.d[o.per] || {}; sl.t[o.per] = sl.t[o.per] || {};
      o.items.forEach(function (it) {
        if (it.st !== 'ikut' || !ids[it.pid] || sl.d[o.per][it.pid]) return;
        var q = byId[it.pid], r = q ? cariLap(lap, q) : null;
        if (!q || !r || r.nomor !== it.nomor) { lewati.push(it.nama + ': laporan berubah setelah lembar dibuat'); return; }
        if (K[kunciLap(o.per, q.kel, q.jenis, q.nama)] !== o.kode) { lewati.push(it.nama + ': laporan sudah dibuka kembali'); return; }
        sl.d[o.per][it.pid] = Utilities.formatDate(now, zona, 'yyyy-MM-dd');
        sl.t[o.per][it.pid] = { nomor: it.nomor, kode: it.kode, oleh: oleh, by: w.u, jam: Utilities.formatDate(now, zona, 'HH:mm'), ts: now.getTime(), lembar: o.kode };
        baru++;
      });
      if (baru) tulisSetor(sl.d, sl.t);
      if (baru && !o.diterima) { o.diterima = { tgl: Utilities.formatDate(now, zona, 'yyyy-MM-dd'), jam: Utilities.formatDate(now, zona, 'HH:mm'), oleh: oleh, ts: now.getTime() }; tulisLembarSemua(L); }
      if (baru) catatLog(w.u, 'menerima lembar pengantar ' + o.kel + ' ' + o.per + ': ' + baru + ' laporan [' + o.kode + ']');
      return { ok: true, baru: baru, lewati: lewati, lembar: lembarLengkap(o, sl, K) };
    });
  } catch (err) {
    return { ok: false, pesan: String(err.message || err) };
  }
}

// ===================== Aplikasi Terima Posyandu (scan QR laporan fisik) =====================
/** Masuk untuk aplikasi Terima: admin kecamatan atau akun penerima. Operator kelurahan ditolak. */
function masukTerima(u, p) {
  IZIN_TERIMA = true;
  var w = masuk(u, p);
  if (w && w.peran !== 'utama' && w.peran !== 'terima') return null;
  if (w && w.peran === 'terima') catatPakai(w.u);
  return w;
}
function namaOperator(w) {
  if (w.peran === 'terima') return w.nama || w.u;
  var cache = CacheService.getScriptCache(), k = 'nm_' + w.u, utama = (w.u === PANTAU_USER);
  if (utama) { try { var v = cache.get(k); if (v) return v; } catch (x) {} }
  var n = bacaPengaturan(w.u).nama || w.u;
  if (utama) { try { cache.put(k, n, 21600); } catch (x) {} }
  return n;
}
function kodePeriode(thn, bln) { var m = BULAN.indexOf(String(bln)) + 1; return m ? thn + '-' + (m < 10 ? '0' : '') + m : ''; }
/** Cari laporan berdasarkan kode QR. Hasil: null atau keterangan lengkap beserta status penerimaannya. */
function infoLaporanKode(kode) {
  kode = String(kode || '');
  if (!ID_RE.test(kode)) return null;
  var cache = CacheService.getScriptCache(), ck = 'ik_' + kode + '_' + bacaStamp();
  try { var cv = cache.get(ck); if (cv) return JSON.parse(cv); } catch (x) {}
  var sh = lembar(), n = sh.getLastRow();
  if (n < 2) return null;
  var rows = sh.getRange(2, 1, n - 1, HEADER.length).getValues(), r = null, maks = 0;
  for (var i = 0; i < rows.length; i++) { if (String(rows[i][14] || '') === kode) { r = rows[i]; break; } }
  if (!r) return null;
  rows.forEach(function (x) { if (x[2] == r[2] && x[3] == r[3] && x[4] == r[4] && x[5] == r[5] && x[6] == r[6]) maks = Math.max(maks, parseInt(x[9], 10) || 1); });
  var per = kodePeriode(r[2], r[3]), kp = kunciPos(String(r[4]), String(r[6]), String(r[5])), pid = '', nmPos = '';
  bacaPos().forEach(function (x) {
    if (pid) return;
    var cocok = kunciPos(x.kel, x.jenis, x.nama) === kp || (Array.isArray(x.alias) ? x.alias : []).some(function (a) { return kunciPos(x.kel, x.jenis, a) === kp; });
    if (cocok) { pid = x.id; nmPos = x.nama; }
  });
  var o = { nomor: String(r[0]), versi: parseInt(r[9], 10) || 1, versiTerbaru: maks, pos: String(r[5]), kel: String(r[4]), jenis: String(r[6]),
            kader: String(r[8] || ''), bln: String(r[3]), thn: String(r[2]), per: per, pid: pid, kode: kode, terima: null };
  if (pid && per) o.terima = statusTerima(per, pid);
  try { cache.put(ck, JSON.stringify(o), 120); } catch (x) {}
  return o;
}
function statusTerima(per, pid, sl) {
  sl = sl || bacaSetorLengkap();
  var tgl = (sl.d[per] || {})[pid];
  if (!tgl) return null;
  var t = (sl.t[per] || {})[pid];
  return { tgl: tgl, jam: t ? t.jam : '', oleh: t ? t.oleh : '', nomor: t ? t.nomor : '', via: t ? 'qr' : 'manual' };
}
/** GET: cari laporan dari kode QR (hanya untuk aplikasi Terima). */
function terimaCari(p) {
  var w = masukTerima(p.u, p.p);
  if (!w) return gagalLogin();
  var o = infoLaporanKode(p.k);
  return o ? { ok: true, ada: true, lap: o, oleh: namaOperator(w) } : { ok: true, ada: false };
}
/** GET: daftar Posyandu beserta status penerimaan satu bulan, dan riwayat penerimaan terbaru. */
function terimaRekap(p) {
  var w = masukTerima(p.u, p.p);
  if (!w) return gagalLogin();
  var per = /^20\d\d-(0[1-9]|1[0-2])$/.test(String(p.per || '')) ? String(p.per) : '';
  var batas = bacaBatas();
  if (!per) {   // bulan yang sedang ditunggu: sampai tanggal batas, laporan bulan sebelumnya
    var nw = new Date(), y0 = nw.getFullYear(), m0 = nw.getMonth();
    if (nw.getDate() <= batas) { m0--; if (m0 < 0) { m0 = 11; y0--; } }
    per = y0 + '-' + (m0 + 1 < 10 ? '0' : '') + (m0 + 1);
  }
  var cache = CacheService.getScriptCache(), ck = 'rk_' + per + '_' + batas + '_' + bacaStamp(), hasil = null;
  if (!p.fresh) { try { var cv = cache.get(ck); if (cv) hasil = JSON.parse(cv); } catch (x) {} }
  if (!hasil) {
    hasil = hitungRekap(per, batas);
    try { var s = JSON.stringify(hasil); if (s.length < 90000) cache.put(ck, s, 120); } catch (x) {}
  }
  hasil.oleh = namaOperator(w); hasil.peran = w.peran;
  return hasil;
}
function hitungRekap(per, batas) {
  var pos = bacaPos(), sl = bacaSetorLengkap(), ada = {}, ver = {};
  var sh = lembar(), n = sh.getLastRow();
  if (n > 1 && per) {
    sh.getRange(2, 1, n - 1, HEADER.length).getValues().forEach(function (x) {
      if (kodePeriode(x[2], x[3]) !== per) return;
      var k = kunciPos(String(x[4]), String(x[6]), String(x[5])); ada[k] = true; ver[k] = Math.max(ver[k] || 0, parseInt(x[9], 10) || 1);
    });
  }
  var list = pos.filter(function (x) { return x.aktif !== false; }).map(function (x) {
    var k = kunciPos(x.kel, x.jenis, x.nama), st = per ? statusTerima(per, x.id, sl) : null;
    (Array.isArray(x.alias) ? x.alias : []).forEach(function (a) { var ka = kunciPos(x.kel, x.jenis, a); if (!ada[k] && ada[ka]) k = ka; });
    return { pid: x.id, nama: x.nama, kel: x.kel, jenis: x.jenis, dibuat: !!ada[k], versi: ver[k] || 0, terima: st };
  });
  var byId = {}; pos.forEach(function (x) { byId[x.id] = x; });
  var riw = [];
  Object.keys(sl.t).forEach(function (pr) {
    Object.keys(sl.t[pr]).forEach(function (id) {
      var t = sl.t[pr][id], x = byId[id]; if (!x || !(sl.d[pr] || {})[id]) return;
      riw.push({ pos: x.nama, kel: x.kel, jenis: x.jenis, per: pr, tgl: sl.d[pr][id], jam: t.jam, oleh: t.oleh, nomor: t.nomor, ts: t.ts || 0 });
    });
  });
  riw.sort(function (a, b) { return b.ts - a.ts; });
  return { ok: true, per: per, list: list, riwayat: riw.slice(0, 15), batas: batas };
}
/** POST: konfirmasi penerimaan satu laporan fisik. Satu laporan hanya bisa dikonfirmasi satu kali. */
function terimaKonfirmasi(d) {
  var w = masukTerima(d.u, d.p);
  if (!w) { Utilities.sleep(1200); throw new Error('Silakan masuk lagi'); }
  return simpanHasil(terimaKonfirmasiInti(d, w), 'a');
}
function terimaKonfirmasiInti(d, w) {
  var o = infoLaporanKode(d.k);
  if (!o) throw new Error('Laporan tidak ditemukan');
  if (!o.pid || !o.per) throw new Error('Posyandu ' + o.pos + ' tidak ada di Data Posyandu, jadi penerimaan belum bisa dicatat. Minta admin kecamatan memeriksa Data Posyandu.');
  if (o.terima) return { ok: true, sudah: true, lap: o };
  var zona = Session.getScriptTimeZone(), now = new Date(), sl = bacaSetorLengkap();
  var oleh = namaOperator(w);
  sl.d[o.per] = sl.d[o.per] || {}; sl.t[o.per] = sl.t[o.per] || {};
  sl.d[o.per][o.pid] = Utilities.formatDate(now, zona, 'yyyy-MM-dd');
  sl.t[o.per][o.pid] = { nomor: o.nomor, kode: o.kode, oleh: oleh, by: w.u, jam: Utilities.formatDate(now, zona, 'HH:mm'), ts: now.getTime() };
  tulisSetor(sl.d, sl.t);
  catatLog(w.u, 'menerima laporan fisik ' + o.jenis + ' ' + o.pos + ' (' + o.kel + ') ' + o.bln + ' ' + o.thn + ' [' + o.nomor + ']');
  o.terima = statusTerima(o.per, o.pid);
  return { ok: true, sudah: false, lap: o };
}
/** POST: koreksi, batalkan penerimaan yang salah konfirmasi (alasan wajib, tercatat di catatan perubahan). */
function terimaBatal(d) {
  var w = masukTerima(d.u, d.p);
  if (!w) { Utilities.sleep(1200); throw new Error('Silakan masuk lagi'); }
  return simpanHasil(terimaBatalInti(d, w), 'a');
}
function terimaBatalInti(d, w) {
  var per = String(d.per || ''), pid = String(d.pid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12), alasan = bersih(d.alasan, 120);
  if (!/^20\d\d-(0[1-9]|1[0-2])$/.test(per) || !pid) throw new Error('Data tidak valid');
  if (alasan.length < 3) throw new Error('Tulis alasan koreksi');
  var sl = bacaSetorLengkap();
  if (!(sl.d[per] || {})[pid]) throw new Error('Penerimaan ini sudah tidak tercatat');
  var x = bacaPos().filter(function (q) { return q.id === pid; })[0], t = (sl.t[per] || {})[pid];
  delete sl.d[per][pid]; if (sl.t[per]) delete sl.t[per][pid];
  tulisSetor(sl.d, sl.t);
  catatLog(w.u, 'KOREKSI: membatalkan penerimaan laporan ' + (x ? x.jenis + ' ' + x.nama + ' (' + x.kel + ')' : pid) + ' ' + per + (t ? ' [' + t.nomor + ' oleh ' + t.oleh + ']' : '') + '. Alasan: ' + alasan);
  return { ok: true, per: per, pid: pid };
}
/** GET: konfirmasi atau koreksi penerimaan dalam satu langkah (lebih cepat dari POST). Tetap memakai kunci agar tidak bentrok. */
function terimaGet(p) {
  var w = masukTerima(p.u, p.p);
  if (!w) return gagalLogin();
  var kunci = LockService.getScriptLock();
  try { kunci.waitLock(20000); } catch (x) { return { ok: false, pesan: 'Server sedang sibuk, coba lagi' }; }
  try {
    var d = { u: p.u, p: p.p, k: p.k, per: p.per, pid: p.pid, alasan: p.alasan };
    return p.aksi === 'tbatal' ? terimaBatalInti(d, w) : terimaKonfirmasiInti(d, w);
  } catch (err) {
    return { ok: false, pesan: String(err.message || err) };
  } finally {
    try { kunci.releaseLock(); } catch (x) {}
  }
}


// ===================== Cadangan data =====================
var NAMA_CADANGAN = 'Cadangan';
var SIMPAN_CADANGAN = 8;
function folderCadangan() { return anak(induk(), NAMA_CADANGAN); }
function kodeTgl() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function hapusNama(f, nama) { var it = f.getFilesByName(nama); while (it.hasNext()) it.next().setTrashed(true); }
/** Simpan satu cadangan: berkas data (Posyandu, pengaturan, operator, catatan) dan salinan Google Sheets. Hanya 8 terakhir yang disimpan. */
function buatCadangan(oleh) {
  var f = folderCadangan(), kode = kodeTgl(), nama = 'cadangan-data-' + kode + '.json';
  var ops = Object.keys(bacaAdmin()).sort().map(function (u) { return { u: u, kel: bacaKelAdmin()[u] || '', profil: bacaBerkas(berkasProfil(u)) }; });
  var isi = JSON.stringify({ versi: 1, tgl: new Date().toISOString(), oleh: String(oleh || ''), posyandu: bacaPos(), pengaturan: bacaBerkas(NAMA_PENGATURAN), operator: ops, setoran: bacaSetor(), log: bacaLog() });
  hapusNama(f, nama);
  f.createFile(nama, isi, MimeType.PLAIN_TEXT);
  var sid = PropertiesService.getScriptProperties().getProperty('SHEET_ID'), ns = 'cadangan-rekap-' + kode;
  if (sid) { try { var sf = DriveApp.getFileById(sid); hapusNama(f, ns); sf.makeCopy(ns, f); } catch (x) {} }
  ['cadangan-data-', 'cadangan-rekap-'].forEach(function (awal) {
    var arr = [], it = f.getFiles();
    while (it.hasNext()) { var x = it.next(); if (x.getName().indexOf(awal) === 0) arr.push(x); }
    arr.sort(function (a, b) { return a.getName() < b.getName() ? 1 : -1; });
    arr.slice(SIMPAN_CADANGAN).forEach(function (x) { x.setTrashed(true); });
  });
  return nama;
}
function daftarCadangan() {
  var f = folderCadangan(), it = f.getFiles(), out = [];
  while (it.hasNext()) {
    var x = it.next(), n = x.getName();
    if (n.indexOf('cadangan-data-') === 0) out.push({ id: x.getId(), tgl: n.replace('cadangan-data-', '').replace('.json', ''), ukuran: x.getSize() });
  }
  out.sort(function (a, b) { return a.tgl < b.tgl ? 1 : -1; });
  return out;
}
/** Dijalankan otomatis setiap Minggu dini hari (lihat aktifkanCadangan). */
function cadangMingguan() {
  buatCadangan('otomatis');
  try { hitungRuang(); } catch (x) {}
  catatLog('sistem', 'cadangan mingguan tersimpan');
}
/** Jalankan SEKALI dari editor Apps Script untuk memasang cadangan otomatis tiap Minggu pukul 02.00. */
function aktifkanCadangan() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'cadangMingguan') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('cadangMingguan').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(2).create();
  buatCadangan('pemasangan');
}
function cadangSekarang(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh membuat cadangan'); }
  buatCadangan(w.u);
  catatLog(w.u, 'membuat cadangan data');
  return simpanHasil({ ok: true, cadangan: daftarCadangan() }, 'a');
}
/** Pulihkan daftar Posyandu dari satu cadangan. Keadaan sebelumnya disimpan dulu sebagai cadangan baru. */
function pulihkanPos(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh memulihkan data'); }
  var id = String(d.berkas || ''), ada = daftarCadangan().filter(function (x) { return x.id === id; })[0];
  if (!ada) throw new Error('Cadangan tidak ditemukan');
  var o = JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString());
  var list = bersihPos(o.posyandu);
  buatCadangan('sebelum pemulihan');
  var teks = JSON.stringify({ list: list, tgl: Date.now() }), f = induk(), it = f.getFilesByName(NAMA_POS);
  if (it.hasNext()) it.next().setContent(teks); else f.createFile(NAMA_POS, teks, MimeType.PLAIN_TEXT);
  sentuhStamp();
  catatLog(w.u, 'memulihkan data Posyandu dari cadangan ' + ada.tgl);
  return simpanHasil({ ok: true, list: list, cadangan: daftarCadangan() }, 'a');
}


// ===================== Ruang Google Drive =====================
function bacaRuang() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('RUANG_CACHE') || 'null'); } catch (x) { return null; } }
/** Hitung ruang yang dipakai folder aplikasi (PDF laporan, SK, cadangan, data lain) dan kuota Drive. Hasil disimpan sementara. */
function hitungRuang() {
  var mulai = Date.now(), r = { pdf: 0, sk: 0, cadangan: 0, lain: 0, nPdf: 0, sebagian: false };
  function jalan(folder, kat) {
    var fi = folder.getFiles();
    while (fi.hasNext()) {
      if (Date.now() - mulai > 25000) { r.sebagian = true; return; }
      var x = fi.next(); r[kat] += x.getSize(); if (kat === 'pdf') r.nPdf++;
    }
    var fo = folder.getFolders();
    while (fo.hasNext()) { jalan(fo.next(), kat); if (r.sebagian) return; }
  }
  var akar = induk(), fa = akar.getFiles();
  while (fa.hasNext()) r.lain += fa.next().getSize();
  var fs = akar.getFolders();
  while (fs.hasNext()) {
    var sub = fs.next(), nm = sub.getName();
    jalan(sub, nm === 'SK' ? 'sk' : nm === NAMA_CADANGAN ? 'cadangan' : /^\d{4}$/.test(nm) ? 'pdf' : 'lain');
    if (r.sebagian) break;
  }
  try { r.pakai = DriveApp.getStorageUsed(); r.batas = DriveApp.getStorageLimit(); } catch (x) { r.pakai = 0; r.batas = 0; }
  r.tgl = Date.now();
  PropertiesService.getScriptProperties().setProperty('RUANG_CACHE', JSON.stringify(r));
  return r;
}
function perbaruiRuang(d) {
  var w = masuk(d.u, d.p);
  if (!w || w.peran !== 'utama') { Utilities.sleep(1200); throw new Error('Hanya admin utama yang boleh melihat ruang Drive'); }
  return simpanHasil({ ok: true, ruang: hitungRuang() }, 'a');
}


// ===================== Catatan perubahan =====================
var NAMA_LOG = 'log-aktivitas.json';
function bacaLog() {
  var o = bacaBerkas(NAMA_LOG);
  return Array.isArray(o.l) ? o.l : [];
}
/** Catat satu perubahan (maksimal 300 terakhir). Kegagalan mencatat tidak boleh menggagalkan perubahan itu sendiri. */
function catatLog(user, teks) {
  try {
    var l = bacaLog();
    l.unshift({ t: Date.now(), u: String(user || ''), a: String(teks || '').slice(0, 300) });
    l = l.slice(0, 300);
    var t = JSON.stringify({ l: l }), f = induk(), it = f.getFilesByName(NAMA_LOG);
    if (it.hasNext()) it.next().setContent(t); else f.createFile(NAMA_LOG, t, MimeType.PLAIN_TEXT);
  } catch (x) {}
}
/** Ringkasan perbedaan daftar Posyandu lama dan baru. */
function ringkasPos(lama, baru) {
  var m = {}, o = {}, tambah = [], hapus = [], ubah = [], nonaktif = [], aktif = [];
  lama.forEach(function (x) { m[x.id] = x; });
  baru.forEach(function (x) {
    o[x.id] = 1;
    var y = m[x.id], nm = x.nama + ' (' + x.kel + ')';
    if (!y) { tambah.push(nm); return; }
    if (y.aktif !== false && x.aktif === false) nonaktif.push(nm);
    else if (y.aktif === false && x.aktif !== false) aktif.push(nm);
    else if (JSON.stringify(y) !== JSON.stringify(x)) ubah.push(nm);
  });
  lama.forEach(function (x) { if (!o[x.id]) hapus.push(x.nama + ' (' + x.kel + ')'); });
  var bag = [], daftar = function (a) { return a.slice(0, 4).join(', ') + (a.length > 4 ? ' dan ' + (a.length - 4) + ' lainnya' : ''); };
  if (tambah.length) bag.push('menambah ' + daftar(tambah));
  if (hapus.length) bag.push('menghapus ' + daftar(hapus));
  if (nonaktif.length) bag.push('menonaktifkan ' + daftar(nonaktif));
  if (aktif.length) bag.push('mengaktifkan ' + daftar(aktif));
  if (ubah.length) bag.push('mengubah data ' + daftar(ubah));
  return bag.length ? 'Data Posyandu: ' + bag.join('; ') : 'Menyimpan data Posyandu (tanpa perubahan)';
}
