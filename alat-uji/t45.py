import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
ids=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['nama'].lower()=='beringin' and x['jenis']=='Posyandu Balita']
lain=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['id']!=ids[0]][:2]
M.SET['2026-10']={ids[0]:'2026-10-30',lain[0]:'2026-10-30',lain[1]:'2026-10-31'}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':1280,'height':900});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
    ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
    def st(t): print(t,'|',pg.inner_text('.hasil2').replace('\n',' / '),'|',pg.inner_text('.hasil2k') if pg.locator('.hasil2k').count() else '-')
    st('ON')
    pg.evaluate("go('p')") if False else None
    pg.evaluate("document.querySelector('[data-v=p],#navP,[onclick*=\"go(\\'p\\')\"]')&&0")
    # buka pengaturan lewat fungsi
    pg.evaluate("tampilView('p')");pg.wait_for_timeout(300)
    pg.click('#tabP button[data-t=app]');pg.wait_for_timeout(300)
    cb=pg.locator('#cardApp input[type=checkbox]');print('checkbox',cb.count(),cb.is_checked())
    cb.uncheck();pg.wait_for_timeout(500)
    pg.evaluate("tampilView('b')");pg.wait_for_timeout(300)
    st('OFF')
    pg.locator('#cardApp').screenshot(path='desain/img/n9_set.png') if False else None
    print(errs);b.close()
