import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
OUT='desain/img/'
ids=[x['id'] for x in M.SEED if x['kel']=='Mamboro Barat'][:3]
M.SET['2026-10']={ids[0]:'2026-10-30',ids[1]:'2026-10-30'}
def jalan(peran,w,h,tag,scheme='light'):
    M.PERAN=peran
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx=b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,device_scale_factor=1 if w>600 else 2);pg=ctx.new_page()
        ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        pg.fill('#lu','admin' if peran=='utama' else 'op');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
        pg.screenshot(path=OUT+'n13_%s.png'%tag,full_page=True);b.close()
jalan('admin',1280,900,'op_web');jalan('admin',390,844,'op_hp');jalan('admin',1280,900,'op_gelap','dark')
