from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context();pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/terima.html');pg.wait_for_timeout(2500)
    print('sw aktif:',pg.evaluate("navigator.serviceWorker.ready.then(r=>!!r.active)"))
    print('cache:',pg.evaluate("caches.open('terima-v1').then(c=>c.keys()).then(k=>k.map(x=>x.url.split('/').pop()))"))
    ctx.set_offline(True)
    pg.goto('http://localhost:8765/terima.html?k=abc');pg.wait_for_timeout(800)
    print('offline judul:',pg.title(),'| login terlihat:',pg.locator('#login').is_visible(),errs)
