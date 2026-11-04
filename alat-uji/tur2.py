# Memotret semua halaman Pantau + mencatat daftar tombol/menu/teks (inventaris fitur)
import sys,json
sys.path.insert(0,'.')
from pantau_mock import *
import pantau_mock as M
PORT=sys.argv[1];TAG=sys.argv[2]
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/'
INV={}
def inv(pg,nama):
    INV[nama]=pg.evaluate("""()=>{const v=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
      const q=s=>[...document.querySelectorAll(s)].filter(v);
      return {tombol:q('button, a.btn, [role=button]').map(e=>(e.innerText||e.getAttribute('aria-label')||e.title||'').trim().replace(/\\s+/g,' ')).filter(Boolean),
              input:q('input,select,textarea').map(e=>(e.id||e.name||e.type)),
              judul:q('h1,h2,h3,h4,.card h3,.sec-t,label').map(e=>e.innerText.trim().replace(/\\s+/g,' ')).filter(Boolean)}}""")
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for ukur,(w,hh) in {'web':(1280,800),'hp':(390,844)}.items():
        ctx=b.new_context(viewport={'width':w,'height':hh},device_scale_factor=1 if ukur=='web' else 2,color_scheme='light')
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
        ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:%s/pantau.html'%PORT);pg.wait_for_timeout(600)
        pg.screenshot(path=OUT+'img/%s_%s_login.png'%(TAG,ukur));inv(pg,ukur+'_login')
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3200)
        for v,n in [('b','beranda'),('l','laporan'),('d','posyandu'),('r','rekap'),('p','atur')]:
            pg.locator('#bnav [data-go=%s]'%v if ukur=='hp' else '#nav [data-go=%s]'%v).click();pg.wait_for_timeout(1200)
            pg.screenshot(path=OUT+'img/%s_%s_%s.png'%(TAG,ukur,n),full_page=(ukur=='hp'));inv(pg,ukur+'_'+n)
        # menu akun
        pg.locator('.hello.acctbtn' if ukur=='hp' else '.uacct.acctbtn').first.click();pg.wait_for_timeout(400)
        pg.screenshot(path=OUT+'img/%s_%s_menuakun.png'%(TAG,ukur));inv(pg,ukur+'_menuakun')
        print(ukur,'galat halaman:',errs);ctx.close()
json.dump(INV,open(OUT+'inv_%s.json'%TAG,'w'),ensure_ascii=False,indent=1)
