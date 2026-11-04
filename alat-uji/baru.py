import sys
sys.path.insert(0,'.')
from pantau_mock import *
import pantau_mock as M
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for tema in ['light','dark']:
        ctx=b.new_context(viewport={'width':1280,'height':800},color_scheme=tema)
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
        ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(600)
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3200)
        pg.screenshot(path=OUT+'baru_%s_1.png'%tema)
        kn=pg.locator('.pohon .kn');print(tema,'kelurahan',kn.count())
        kn.nth(2).click();pg.wait_for_timeout(900);pg.screenshot(path=OUT+'baru_%s_2.png'%tema)
        pn=pg.locator('.pohon .pn');print('posyandu',pn.count())
        if pn.count():
            pn.nth(1).click();pg.wait_for_timeout(900);pg.screenshot(path=OUT+'baru_%s_3.png'%tema)
        print(errs);ctx.close()
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page()
    ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3000)
    print('hp pohon terlihat:',pg.locator('#pohonKel').is_visible())
