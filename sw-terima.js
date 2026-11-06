/* Service worker khusus aplikasi Terima: membuat halaman terbuka seketika dari simpanan di HP.
   Hanya menyentuh terima.html dan berkas pendukungnya. Server Apps Script dan aplikasi lain tidak dicegat.
   Halaman diperbarui di latar belakang, jadi versi baru muncul pada pembukaan berikutnya. */
var NAMA = 'terima-v8';
var BERKAS = ['terima.html', 'jsQR.js', 'tes.js', 'logo.png', 'icon-terima-192.png', 'icon-terima-512.png', 'apple-touch-icon-terima.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(NAMA).then(function (c) {
    return Promise.all(BERKAS.map(function (b) { return c.add(b).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== NAMA; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== location.origin) return;
  var nama = u.pathname.split('/').pop();
  if (BERKAS.indexOf(nama) < 0) return;
  /* Muat ulang karena pembaruan (alamat memuat ?u=...): ambil langsung dari jaringan, lalu simpan sebagai salinan baru. */
  if (u.searchParams.get('u')) {
    e.respondWith(fetch(nama, { cache: 'reload' }).then(function (res) {
      if (res && res.ok) { var s = res.clone(); caches.open(NAMA).then(function (c) { c.put(nama, s); }); }
      return res;
    }).catch(function () { return caches.open(NAMA).then(function (c) { return c.match(nama); }); }));
    return;
  }
  e.respondWith(caches.open(NAMA).then(function (c) {
    return c.match(nama).then(function (ada) {
      var baru = fetch(nama, { cache: 'no-cache' }).then(function (res) { if (res && res.ok) c.put(nama, res.clone()); return res; }).catch(function () { return ada; });
      return ada || baru;
    });
  }));
});
