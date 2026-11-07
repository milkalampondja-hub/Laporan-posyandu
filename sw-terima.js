/* Service worker untuk ketiga aplikasi (kader, Pantau, Terima). Satu berkas karena ketiganya berada di folder yang sama
   (nama berkas tetap "sw-terima.js" supaya HP yang sudah memasang Terima tidak bingung).
   - Terima: halaman terbuka seketika dari simpanan di HP dan diperbarui di latar belakang (seperti sebelumnya).
   - Kader dan Pantau: selalu ambil dari internet dulu. Simpanan di HP hanya dipakai bila tidak ada sinyal
     atau sinyal sangat lambat, jadi aplikasi tetap bisa dibuka di posyandu yang sinyalnya lemah.
   - Pustaka dari cdnjs dan huruf Google disimpan sekali (alamatnya berversi, isinya tidak berubah).
   Server Apps Script dan versi.json tidak pernah dicegat. Halaman memberi tahu berkas apa saja yang ia pakai
   (pesan "simpan"), jadi HP hanya menyimpan berkas aplikasi yang memang dibuka di HP itu. */
var NAMA = 'posyandu-v11';
var TERIMA = ['terima.html', 'terima', 'pindah.js', 'kantor.jpg', 'jsQR.js', 'tes.js', 'logo.png', 'icon-terima-192.png', 'icon-terima-512.png', 'apple-touch-icon-terima.png'];
var DULU_JARINGAN = ['index.html', 'pantau', 'pantau.html', 'pantau-ext.js', 'pantau-tema.css', 'pantau-modern.css', 'seed-posyandu.js',
  'pembaruan.js', 'banner.jpg', 'palu.jpg', 'palu-kader.jpg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest',
  'icon-pantau-192.png', 'icon-pantau-512.png', 'apple-touch-icon-pantau.png', 'pantau.webmanifest', 'terima.webmanifest'];
var LUAR = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

/* nama simpanan untuk sebuah alamat; '' bila alamat itu tidak diurus di sini */
function kunci(u) {
  if (u.origin === location.origin) {
    var n = u.pathname.split('/').pop();
    if (n === '' && u.pathname.replace(/[^/]*$/, '') === new URL('./', location.href).pathname) n = 'index.html';
    return (TERIMA.indexOf(n) >= 0 || DULU_JARINGAN.indexOf(n) >= 0) ? n : '';
  }
  return LUAR.indexOf(u.hostname) >= 0 ? u.href : '';
}

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== NAMA; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* halaman mengirim daftar berkas yang dipakainya; yang belum tersimpan diambil dan disimpan */
self.addEventListener('message', function (e) {
  var l = e.data && e.data.simpan; if (!Array.isArray(l)) return;
  e.waitUntil(caches.open(NAMA).then(function (c) {
    return Promise.all(l.slice(0, 80).map(function (s) {
      var u; try { u = new URL(s, location.href); } catch (x) { return; }
      var k = kunci(u); if (!k) return;
      return c.match(k).then(function (ada) {
        if (ada) return;
        return fetch(u.href).then(function (res) { if (res && res.ok && !res.redirected) return c.put(k, res); }).catch(function () {});
      });
    }));
  }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url), k = kunci(u); if (!k) return;

  /* pustaka & huruf dari luar: pakai simpanan bila ada */
  if (u.origin !== location.origin) {
    e.respondWith(caches.open(NAMA).then(function (c) {
      return c.match(k).then(function (ada) {
        return ada || fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(k, res.clone()); return res; });
      });
    }));
    return;
  }

  /* kader & Pantau: internet dulu; simpanan bila tidak ada sinyal atau lebih dari 7 detik belum ada jawaban */
  if (DULU_JARINGAN.indexOf(k) >= 0) {
    e.respondWith(caches.open(NAMA).then(function (c) {
      return new Promise(function (ok, gagal) {
        var selesai = false;
        function jawab(x) { if (!selesai) { selesai = true; ok(x); } }
        var t = setTimeout(function () { c.match(k).then(function (a) { if (a) jawab(a); }); }, 7000);
        fetch(r).then(function (res) {
          clearTimeout(t);
          if (res && res.ok && !res.redirected) c.put(k, res.clone());
          jawab(res);
        }, function (err) {
          clearTimeout(t);
          c.match(k).then(function (a) { if (a) jawab(a); else if (!selesai) { selesai = true; gagal(err); } });
        });
      });
    }));
    return;
  }

  /* Terima: muat ulang karena pembaruan (alamat memuat ?u=...): ambil langsung dari jaringan, lalu simpan sebagai salinan baru. */
  var nama = k;
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
