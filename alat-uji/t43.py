import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
ids=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['nama'].lower()=='beringin' and x['jenis']=='Posyandu Balita']
lain=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['id']!=ids[0]][:2]
M.SET['2026-10']={ids[0]:'2026-10-30',lain[0]:'2026-10-30',lain[1]:'2026-10-31'}
def jalan(w,hh,scheme,tag,tema=None):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx=b.new_context(viewport={'width':w,'height':hh},color_scheme=scheme,device_scale_factor=1 if w>600 else 2);pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
        pg.locator('#sumB .card').first.screenshot(path=OUT+'n8_%s.png'%tag)
        print(tag,errs,pg.inner_text('.hasil2').replace('\n',' | '),'||',pg.inner_text('.hasil2k'),'||',pg.locator('#sumB .pill, #sumB .prow .pill').all_inner_texts()[:6])
        b.close()
jalan(1280,800,'light','web')
jalan(390,844,'light','hp')
jalan(1280,800,'dark','gelap')
