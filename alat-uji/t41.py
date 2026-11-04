import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
ids=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['nama'].lower()=='beringin' and x['jenis']=='Posyandu Balita']
M.SET['2026-11']={ids[0]:'2026-11-05'}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':1280,'height':800});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
    ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3200)
    pg.locator('#nav [data-go=r]').click();pg.wait_for_timeout(600)
    pg.locator('.tabbar:visible button[data-t=ang]').click();pg.wait_for_timeout(800)
    pg.select_option('#angB','November');pg.wait_for_timeout(1500)
    print(pg.inner_text('#angKet'));pg.screenshot(path=OUT+'n5_angka_nov.png')
    pg.select_option('#angJ','Posyandu Lansia');pg.wait_for_timeout(500);print(pg.inner_text('#angKet'))
    print(errs)
