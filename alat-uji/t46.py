import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
ids=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['nama'].lower()=='beringin' and x['jenis']=='Posyandu Balita']
lain=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['id']!=ids[0]][:2]
M.SET['2026-10']={ids[0]:'2026-10-30',lain[0]:'2026-10-30',lain[1]:'2026-10-31'}
IMG='desain/img/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for scheme in ('light','dark'):
        ctx=b.new_context(viewport={'width':1280,'height':900},color_scheme=scheme);pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
        pg.evaluate("tampilView('p')");pg.wait_for_timeout(300);pg.click('#tabP button[data-t=app]');pg.wait_for_timeout(300)
        card=pg.locator('#cardApp .hm').first
        print(scheme,'status:',card.inner_text())
        pg.locator('#cardApp button:has-text("Matikan masa peralihan")').click();pg.wait_for_timeout(300)
        pg.screenshot(path=IMG+'n10_dialog_%s.png'%scheme)
        pg.locator('input[name=konfirmasi-peralihan]').click();pg.keyboard.type('salah');pg.click('text=Ya, matikan');pg.wait_for_timeout(200)
        print('salah ->',pg.locator('.modal .st, [role=dialog] .st').first.inner_text() if pg.locator('.modal .st, [role=dialog] .st').count() else pg.inner_text('body')[:0], '| masih hidup:',(pg.evaluate("localStorage.getItem(\"pantau_fisik_saja\")")!="0"))
        pg.locator('input[name=konfirmasi-peralihan]').click();pg.keyboard.type('rahasia');pg.click('text=Ya, matikan');pg.wait_for_timeout(500)
        print('benar -> fisikSaja:',(pg.evaluate("localStorage.getItem(\"pantau_fisik_saja\")")!="0"),'| status:',pg.locator('#cardApp .hm').first.inner_text())
        pg.evaluate("tampilView('b')");pg.wait_for_timeout(300)
        print(pg.inner_text('.hasil2').replace('\n',' / '),'|',pg.locator('.hasil2k').all_inner_texts())
        pg.locator('#sumB .card').first.screenshot(path=IMG+'n10_ring_%s.png'%scheme)
        # hidupkan lagi
        pg.evaluate("tampilView('p')");pg.wait_for_timeout(300);pg.click('#tabP button[data-t=app]');pg.wait_for_timeout(200)
        pg.locator('#cardApp button:has-text("Hidupkan masa peralihan")').click();pg.wait_for_timeout(300)
        print('dialog hidup:',pg.inner_text('body').split('Hidupkan masa peralihan?')[1][:170].replace('\n',' ') if 'Hidupkan masa peralihan?' in pg.inner_text('body') else 'tidak ada')
        pg.locator('input[name=konfirmasi-peralihan]').click();pg.keyboard.type('rahasia');pg.click('text=Ya, hidupkan');pg.wait_for_timeout(400)
        print('hidup lagi:',(pg.evaluate("localStorage.getItem(\"pantau_fisik_saja\")")!="0"),errs)
        ctx.close()
    b.close()
