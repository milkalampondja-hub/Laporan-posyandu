import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
OUT='desain/img/'
ids=[x['id'] for x in M.SEED if x['kel']=='Mamboro Barat'][:3]
M.SET['2026-10']={ids[0]:'2026-10-30',ids[1]:'2026-10-30'}
def jalan(peran,w,h,tag,scheme='light',views=('b','l','d','r','s')):
    M.PERAN=peran
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx=b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,device_scale_factor=1 if w>600 else 2);pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        pg.fill('#lu','admin' if peran=='utama' else 'op');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
        for v in views:
            pg.evaluate("tampilView('%s')"%v);pg.wait_for_timeout(500)
            pg.screenshot(path=OUT+'k_%s_%s.png'%(tag,v))
        print(tag,errs);b.close()
if __name__=='__main__':
    jalan('utama',1280,900,'lap_t');jalan('utama',390,844,'hp_t');jalan('utama',1280,900,'lap_g','dark');jalan('utama',390,844,'hp_g','dark')
