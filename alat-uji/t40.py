import sys
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
def jalan(peran,tag):
    M.PERAN=peran
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx=b.new_context(viewport={'width':1280,'height':800},accept_downloads=True);pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
        ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        pg.fill('#lu','admin' if peran=='utama' else 'op');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3200)
        vis=lambda s:pg.locator(s).first.is_visible()
        print(tag,'Beranda: filter terlihat=',vis('#fcard'),'| tarik data terlihat=',pg.locator('.card.dl').first.is_visible(),'| judul matriks=',pg.inner_text('#mx2h'))
        pg.locator('#nav [data-go=l]').click();pg.wait_for_timeout(700)
        print(tag,'Laporan: filter=',vis('#fcard'),'| tarik data=',vis('.card.dl'),'| tiles=',pg.locator('#tot .tile').count(),'| cari="%s" readonly=%s'%(pg.input_value('#fq'),pg.get_attribute('#fq','readonly')))
        pg.screenshot(path=OUT+'n5_%s_laporan.png'%tag)
        pg.locator('#nav [data-go=r]').click();pg.wait_for_timeout(700)
        pg.locator('.tabbar:visible button[data-t=ang]').click();pg.wait_for_timeout(1200)
        print(tag,'Angka: periode card tersembunyi=',not pg.locator('#rkBox>.card').first.is_visible(),'| judul=',pg.inner_text('#angHd'),'| ket=',pg.inner_text('#angKet'))
        pg.screenshot(path=OUT+'n5_%s_angka.png'%tag)
        pg.select_option('#angB','Oktober');pg.wait_for_timeout(1200)
        print(tag,'Okt -> ket=',pg.inner_text('#angKet'),'| isi=',pg.inner_text('#angTab')[:90].replace('\n',' / '))
        pg.screenshot(path=OUT+'n5_%s_angka2.png'%tag)
        if peran=='utama':
            with pg.expect_download(timeout=4000) as d: pg.click('#angX')
            print('unduh:',d.value.suggested_filename)
        print(tag,'galat:',errs);b.close()
ids=[x['id'] for x in M.SEED if x['kel']=='Taipa' and x['nama'].lower()=='beringin' and x['jenis']=='Posyandu Balita']
M.SET['2026-10']={ids[0]:'2026-10-30'}
jalan('utama','kec')
jalan('admin','op')
