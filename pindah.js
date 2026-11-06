/* Pindah alamat aplikasi.
   Alamat baru: https://posyandu-palut.github.io/ (kader), /pantau, /terima.
   - Di ALAMAT BARU: menerima data yang dibawa dari alamat lama (#pindah=...), menyimpannya di HP, lalu membersihkan alamat.
   - Di ALAMAT LAMA, mulai MULAI: Pantau dan Terima langsung diteruskan ke alamat baru (QR ?k= ikut);
     aplikasi kader menampilkan pesan pindah hanya bila aman (di halaman awal, tidak sedang mengirim, antrean HP kosong).
   File ini sama persis di repositori lama dan baru. Harus dimuat paling awal di <head>. */
(function () {
  'use strict';
  var BARU = 'posyandu-palut.github.io';
  var MULAI = Date.UTC(2026, 10, 8, 16, 0, 0); /* 9 November 2026 pukul 00.00 WITA */
  var KUNCI = {
    kader: ['laporan-posyandu-v3', 'lp-pernah', 'lp-poslist', 'lp-wa', 'lp-batas', 'lp-info', 'lp-infotgl', 'lp-infotutup'],
    pantau: ['pantau-tema', 'pantau-seen', 'pantau_nip', 'pantau_trm_tautan', 'pantau_fisik_saja'],
    terima: ['terima-cred', 'terima-rekap']
  };
  var JALUR = { kader: '/', pantau: '/pantau', terima: '/terima' };
  var diBaru = location.hostname === BARU;

  function enc(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function dec(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }

  /* ---------- di alamat baru: terima data ---------- */
  if (diBaru) {
    var m = /(?:^#|&)pindah=([A-Za-z0-9_-]+)/.exec(location.hash || '');
    if (m) {
      try {
        var d = JSON.parse(dec(m[1]));
        Object.keys(d || {}).forEach(function (k) {
          try { if (localStorage.getItem(k) == null && typeof d[k] === 'string') localStorage.setItem(k, d[k]); } catch (e) { }
        });
      } catch (e) { }
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
    }
    window.PINDAH = { baru: true, kader: function () { } };
    return;
  }

  /* ---------- di alamat lama ---------- */
  function aktif() { return Date.now() >= MULAI; }
  function tujuan(app) {
    var q = new URLSearchParams(location.search); q.delete('u');
    var s = q.toString(), d = {};
    (KUNCI[app] || []).forEach(function (k) { try { var v = localStorage.getItem(k); if (v != null) d[k] = v; } catch (e) { } });
    var h = Object.keys(d).length ? '#pindah=' + enc(JSON.stringify(d)) : '';
    return 'https://' + BARU + JALUR[app] + (s ? '?' + s : '') + h;
  }
  function pergi(app) { location.replace(tujuan(app)); }

  var app = /terima\.html$/.test(location.pathname) ? 'terima' : (/pantau\.html$/.test(location.pathname) ? 'pantau' : 'kader');
  if (app !== 'kader') {
    if (aktif()) pergi(app);
    window.PINDAH = { baru: false, kader: function () { } };
    return;
  }

  /* aplikasi kader di alamat lama */
  var kotak = null, cfg = null;
  function tampil() {
    if (kotak) return;
    kotak = document.createElement('div');
    kotak.setAttribute('role', 'dialog'); kotak.setAttribute('aria-modal', 'true');
    kotak.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,26,15,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:system-ui,-apple-system,sans-serif';
    kotak.innerHTML = '<div style="max-width:380px;width:100%;background:#fff;color:#0b2a1b;border-radius:26px;padding:26px 22px 22px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);text-align:center">' +
      '<div style="width:56px;height:56px;margin:0 auto 14px;border-radius:18px;background:#c4f25a;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#042a19" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></div>' +
      '<div style="font-size:20px;font-weight:800;line-height:1.25;margin-bottom:8px">Aplikasi pindah ke alamat baru</div>' +
      '<div style="font-size:14.5px;line-height:1.45;color:#3d5a4a;margin-bottom:14px">Mulai sekarang buat laporan di alamat baru. Data posyandu dan kader di HP ini ikut dibawa, jadi tidak perlu mengisi ulang.</div>' +
      '<div style="font-size:16px;font-weight:800;background:#eef6f0;border-radius:14px;padding:12px;margin-bottom:16px;word-break:break-all">' + BARU + '</div>' +
      '<button type="button" id="pindah-buka" style="width:100%;border:0;border-radius:16px;background:#0e7a46;color:#fff;font:800 16px system-ui,-apple-system,sans-serif;padding:15px;cursor:pointer">Buka alamat baru &rarr;</button>' +
      '<div style="font-size:12.5px;line-height:1.4;color:#5b7366;margin-top:12px">Setelah terbuka, pasang lagi ke layar utama HP (Tambahkan ke Layar Utama) dan hapus ikon yang lama.</div>' +
      '</div>';
    (document.body || document.documentElement).appendChild(kotak);
    document.getElementById('pindah-buka').addEventListener('click', function () { pergi('kader'); });
  }
  function cek() {
    if (!aktif() || !cfg || kotak) return;
    var p;
    try { p = cfg.siap(); } catch (e) { return; }
    Promise.resolve(p).then(function (ok) { if (ok) tampil(); }).catch(function () { });
  }
  window.PINDAH = {
    baru: false,
    kader: function (c) {
      cfg = c;
      setTimeout(cek, 1200);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) cek(); });
      setInterval(cek, 20000);
    },
    cek: cek
  };
})();
