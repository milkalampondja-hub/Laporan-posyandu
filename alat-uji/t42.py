import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
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
    print(pg.locator('.hm').first.inner_text())
    pg.locator('summary.kh', has_text='sudah menyerahkan').filter(has_text='Taipa').first.click();pg.wait_for_timeout(400)
    pg.screenshot(path=OUT+'n7_setor.png',full_page=True)
    pg.get_by_text('Hanya yang menunggu digital').click();pg.wait_for_timeout(600)
    print(pg.locator('.hm').first.inner_text(), '|', [e.inner_text() for e in pg.locator('.toolbar .btn').all()][:4])
    print(errs)
