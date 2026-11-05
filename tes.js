/* Mode tes dan pemeliharaan, dipakai bersama oleh Pantau, Terima, dan aplikasi kader.
   - Ketuk nomor versi 5 kali (atau buka tautan dengan #tes), masukkan kode: mode tes menyala di perangkat ini.
   - Selama menyala, semua permintaan membawa kode tes dan server memakai data TES yang terpisah dari data asli.
   - Pita merah selalu tampil; mode tes mati sendiri setelah 3 jam.
   - Saat admin menyalakan pemeliharaan, server menolak kader dan petugas; aplikasi menampilkan popup. */
(function () {
  var UH = '30b31af050739ab03ff27e5b30667767cc2a39b050f925850d4d53c2366077c5', K = 'lp-tes', LAMA = 3 * 3600000, W = window;
  var flagHash = /(^|[#&])tes(&|$)/.test(location.hash || '');

  function baca() {
    try {
      var o = JSON.parse(localStorage.getItem(K) || 'null');
      if (o && o.kode && o.sampai > Date.now()) return o;
      if (o) localStorage.removeItem(K);
    } catch (e) {}
    return null;
  }
  W.TES_KODE = function () { var o = baca(); return o ? o.kode : ''; };
  W.TES_ON = function () { return !!baca(); };

  function hh(ts) { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2); }
  function sha(t) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode('lp-uji:' + t)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }

  /* ---------- pita merah ---------- */
  function bar() {
    var o = baca(), b = document.getElementById('tesbar');
    if (!o) { if (b) b.remove(); document.documentElement.style.removeProperty('--tesbar'); document.body.style.paddingTop = ''; return; }
    if (!b) {
      b = document.createElement('div'); b.id = 'tesbar'; b.setAttribute('role', 'status');
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99998;background:#b3261e;color:#fff;font:700 12.5px/1.3 system-ui,sans-serif;padding:7px 10px;display:flex;gap:8px;align-items:center;justify-content:center;min-height:46px;box-sizing:border-box';
      var s = document.createElement('span'); s.style.textAlign = 'center'; s.id = 'tesbar-t'; b.appendChild(s);
      var x = document.createElement('button'); x.type = 'button'; x.textContent = 'Matikan';
      x.style.cssText = 'background:#fff;color:#b3261e;border:0;border-radius:8px;padding:5px 10px;font:700 12px system-ui,sans-serif';
      x.addEventListener('click', W.TES_MATI); b.appendChild(x);
      document.body.appendChild(b);
    }
    document.getElementById('tesbar-t').innerHTML = 'MODE TES · data asli tidak berubah<br><span style="font-weight:500;opacity:.9">Mati otomatis pukul ' + hh(o.sampai) + '</span>';
    document.body.style.paddingTop = '46px';
  }
  W.TES_MATI = function () { try { localStorage.removeItem(K); } catch (e) {} location.reload(); };
  W.TES_NYALA = function (kode) { try { localStorage.setItem(K, JSON.stringify({ kode: kode, sampai: Date.now() + LAMA })); } catch (e) {} location.reload(); };

  /* ---------- popup pemeliharaan ---------- */
  W.TES_CATATAN = W.TES_CATATAN || 'Data tidak berubah.';
  W.TES_POPUP = function (sampai) {
    var o = document.getElementById('tespop'), jam = sampai ? hh(sampai) : '';
    if (!o) {
      o = document.createElement('div'); o.id = 'tespop'; o.setAttribute('role', 'alertdialog');
      o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,25,20,.62);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif';
      o.innerHTML = '<div style="background:#fff;color:#14211a;border-radius:24px;padding:28px 22px 22px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
        '<div style="width:76px;height:76px;border-radius:50%;background:#fff1bf;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:40px">\u{1F6E0}️</div>' +
        '<div style="font-size:22px;font-weight:800;margin-bottom:8px">Aplikasi sedang dalam pemeliharaan</div>' +
        '<div style="font-size:16px;line-height:1.5;color:#44544b">Mohon tunggu sebentar dan coba lagi nanti.</div>' +
        '<div id="tespop-j" style="background:#f1f5f2;border-radius:14px;padding:10px 12px;margin:14px 0;font-size:15px"></div>' +
        '<div id="tespop-c" style="font-size:14.5px;color:#0a5b28;margin-bottom:16px"></div>' +
        '<button type="button" id="tespop-x" style="width:100%;border:0;border-radius:16px;background:#0b7d37;color:#fff;font:700 16px system-ui;padding:14px">Coba lagi</button></div>';
      document.body.appendChild(o);
      document.getElementById('tespop-x').addEventListener('click', function () { o.remove(); });
    }
    document.getElementById('tespop-j').innerHTML = jam ? 'Perkiraan selesai <b>pukul ' + jam + '</b>' : 'Perkiraan selesai: belum diketahui';
    document.getElementById('tespop-c').textContent = W.TES_CATATAN;
  };
  /* Dipanggil dari lapisan jaringan tiap aplikasi: tampilkan popup bila server menolak karena pemeliharaan. */
  W.TES_CEK = function (d) {
    try { if (d && d.ok === false && typeof d.pemeliharaan === 'number' && d.pemeliharaan > 0) W.TES_POPUP(d.pemeliharaan); } catch (e) {}
    return d;
  };

  /* ---------- ketuk nomor versi 5 kali, atau tautan #tes ---------- */
  function tanyaKode() {
    if (baca()) { alert('Mode tes sedang menyala. Tekan Matikan di pita merah bagian atas untuk menutupnya.'); return; }
    var k = prompt('Masukkan kode mode tes:'); if (!k) return; k = k.trim();
    sha(k).then(function (h) { if (h === UH) { alert('Mode tes menyala selama 3 jam di perangkat ini. Data asli tidak berubah.'); W.TES_NYALA(k); } else alert('Kode salah.'); }, function () { alert('Peramban tidak mendukung mode tes.'); });
  }
  function pasang() {
    bar();
    var n = 0, tm = null, vs = Array.prototype.slice.call(document.querySelectorAll('#ver,[data-ver]'));
    vs.forEach(function (v) { v.addEventListener('click', function () { n++; clearTimeout(tm); tm = setTimeout(function () { n = 0; }, 3000); if (n < 5) return; n = 0; tanyaKode(); }); });
    if (flagHash && !baca()) setTimeout(tanyaKode, 500);
    setInterval(function () { if (document.getElementById('tesbar') && !baca()) location.reload(); }, 30000);
  }
  window.addEventListener('storage', function (e) { if (e.key === K) location.reload(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();
