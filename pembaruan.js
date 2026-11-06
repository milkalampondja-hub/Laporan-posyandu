/* Pembaruan otomatis. Dipakai aplikasi kader, Terima, dan Pantau.
   Aplikasi menanyakan versi terbaru di versi.json (tidak pernah memakai simpanan lama).
   Bila ada versi baru dan saat itu aman, halaman dimuat ulang sendiri. Bila tidak aman,
   muncul pita kecil "Ada pembaruan aplikasi" dengan tombol Muat ulang. Tidak pernah memuat ulang
   sendiri saat laporan sedang dikirim atau saat pengguna sedang mengisi. */
(function () {
  'use strict';
  var T0 = Date.now(), sentuh = false, cfg = null, baru = '', pita = null, teks = null;
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) {
    window.addEventListener(n, function () { sentuh = true; }, { capture: true, passive: true });
  });
  /* "dingin" = baru dibuka dan belum disentuh: aman dimuat ulang tanpa merugikan siapa pun */
  function dingin() { return !sentuh && Date.now() - T0 < 15000; }
  function ambil() {
    if (!cfg || typeof fetch !== 'function') return Promise.resolve();
    return fetch('versi.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var v = j && j[cfg.app];
        if (v && String(v) !== String(cfg.v)) { baru = String(v); coba(); }
        else { baru = ''; sembunyi(); }
      })
      .catch(function () {});
  }
  function url() {
    var u = new URL(location.href);
    u.searchParams.set('u', baru);
    return u.toString();
  }
  function muat(paksa) {
    var k = 'pb-' + cfg.app, p = null;
    if (!paksa) {
      try { p = JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) {}
      /* sudah pernah mencoba ke versi ini beberapa saat lalu tetapi halaman masih lama: jangan berputar */
      if (p && p.v === baru && Date.now() - p.t < 120000) return false;
    }
    try { sessionStorage.setItem(k, JSON.stringify({ v: baru, t: Date.now() })); } catch (e) {}
    location.replace(url());
    return true;
  }
  function coba() {
    if (!baru || !cfg) return;
    var ok = false;
    try { ok = cfg.aman ? !!cfg.aman() : dingin(); } catch (e) {}
    if (ok && muat(false)) return;
    tampil();
  }
  function tampil() {
    var cat = '';
    try { cat = (cfg.catatan && cfg.catatan()) || ''; } catch (e) {}
    if (!pita) {
      pita = document.createElement('div');
      pita.setAttribute('role', 'status');
      pita.style.cssText = 'position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:99999;max-width:560px;margin:0 auto;display:flex;align-items:center;gap:12px;background:#042a19;color:#fff;border-radius:18px;padding:10px 10px 10px 16px;box-shadow:0 16px 34px -10px rgba(0,0,0,.55);font:600 14px/1.3 system-ui,-apple-system,sans-serif';
      teks = document.createElement('div');
      teks.style.cssText = 'flex:1;min-width:0';
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = 'Muat ulang';
      b.style.cssText = 'flex:none;border:0;border-radius:12px;background:#c4f25a;color:#042a19;font:800 14px system-ui,sans-serif;padding:10px 14px;cursor:pointer';
      b.addEventListener('click', function () { muat(true); });
      pita.appendChild(teks); pita.appendChild(b);
      (document.body || document.documentElement).appendChild(pita);
    }
    teks.innerHTML = '<div>Ada pembaruan aplikasi</div>' + (cat ? '<div style="font-weight:500;opacity:.8;font-size:12.5px">' + cat + '</div>' : '');
  }
  function sembunyi() { if (pita && pita.parentNode) pita.parentNode.removeChild(pita); pita = null; }
  function mulai(c) {
    cfg = c;
    setTimeout(ambil, 1500);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) ambil(); });
    window.addEventListener('online', function () { setTimeout(ambil, 800); });
    setInterval(function () { if (!document.hidden) ambil(); }, 300000);
  }
  window.PB = { mulai: mulai, coba: coba, cek: ambil, dingin: dingin, status: function () { return { baru: baru, v: cfg && cfg.v }; } };
})();
