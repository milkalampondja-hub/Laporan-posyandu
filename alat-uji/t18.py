from playwright.sync_api import sync_playwright
posts=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844})
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    def h(route):
        r=route.request
        posts.append((r.method,r.url[:80]))
        route.fulfill(content_type='application/javascript',body='cb({"ok":true})')
    ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body=''))
    ctx.route('https://fonts.googleapis.com/**',lambda r:r.fulfill(body=''))
    pg.goto('file:///home/claude/laporan-posyandu/_uji_test.html')
    msgs=[]
    def dlg(d):
        msgs.append((d.type,d.message[:60]))
        d.accept(CODE if d.type=='prompt' else None)
    pg.on('dialog',dlg)
    for CODE in ['SALAH','UJI-PALU-4821']:
        for _ in range(5): pg.click('#ver')
        pg.wait_for_timeout(600)
        print(CODE,'bar:',pg.locator('#uji-bar').count(),msgs[-1])
    print('persist:',pg.evaluate("localStorage.getItem('lp-uji')"))
    n0=len(posts)
    pg.evaluate("__t.box();__t.set(new Blob(['x'],{type:'application/pdf'}))");pg.evaluate("__t.kirim()");pg.wait_for_timeout(800)
    print('box:',pg.inner_text('#arsip'),'| permintaan baru ke server:',len(posts)-n0)
    pg.reload();pg.wait_for_timeout(500);print('setelah reload bar:',pg.locator('#uji-bar').count())
    pg.screenshot(path='shots/uji.png')
    pg.click('#uji-off');print('dimatikan, bar:',pg.locator('#uji-bar').count(),pg.evaluate("localStorage.getItem('lp-uji')"))
    # tanpa uji: kirim harus menghubungi server
    n1=len(posts)
    pg.evaluate("__t.box();__t.set(new Blob(['x'],{type:'application/pdf'}))");pg.evaluate("void(__t.kirim())");pg.wait_for_timeout(1500)
    print('tanpa uji, permintaan ke server:',len(posts)-n1)
    print('errs',errs)
    b.close()
