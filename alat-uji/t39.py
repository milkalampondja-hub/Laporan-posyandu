import sys,json
sys.path.insert(0,'.')
from pantau_mock import *
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
JS="""()=>{const v=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
 return {t:[...document.querySelectorAll('button, a.btn')].filter(v).map(e=>(e.innerText||e.title||'').trim().replace(/\\s+/g,' ')).filter(Boolean),
  j:[...document.querySelectorAll('h4,label')].filter(v).map(e=>e.innerText.trim().replace(/\\s+/g,' ')).filter(Boolean)}}"""
def run(port):
    res={}
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx=b.new_context(viewport={'width':1280,'height':800});pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
        ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:%s/pantau.html'%port);pg.wait_for_timeout(500)
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3200)
        for v,tabs in [('p',['akun','app','pengguna']),('r',['ring','pos','ang'])]:
            pg.locator('#nav [data-go=%s]'%v).click();pg.wait_for_timeout(900)
            u={'t':set(),'j':set()}
            for t in tabs:
                if port=='8765':
                    pg.locator('.tabbar:visible button[data-t=%s]'%t).click();pg.wait_for_timeout(300)
                    pg.screenshot(path=OUT+'n4_%s_%s.png'%(v,t))
                r=pg.evaluate(JS);u['t']|=set(r['t']);u['j']|=set(r['j'])
                if port!='8765':break
            res[v]=u
        res['err']=errs
        # halaman kelurahan lewat Beranda
        if port=='8765':
            pg.locator('#nav [data-go=b]').click();pg.wait_for_timeout(900)
            pg.locator('.bukakel:visible').first.click();pg.wait_for_timeout(900)
            res['kel_h1']=pg.inner_text('#pgt');res['kel_isi']=pg.inner_text('#kelBox')[:120]
            pg.screenshot(path=OUT+'n4_kel.png')
            pg.locator('#kelBox .bcl').first.click();pg.wait_for_timeout(600)
            res['balik']=pg.inner_text('#pgt')
            pg.locator('#nav [data-go=d]').click();pg.wait_for_timeout(900)
            res['peng']=pg.inner_text('#pengBox')[:80]
            pg.screenshot(path=OUT+'n4_pos.png')
        b.close()
    return res
a=run('8766');b=run('8765')
for v in 'pr':
    print(v,'tombol hilang:',sorted(a[v]['t']-b[v]['t']));print(v,'judul hilang:',sorted(a[v]['j']-b[v]['j']))
print({k:b[k] for k in b if k not in 'pr'},a['err'])
