import sys
sys.path.insert(0,'.')
from pantau_mock import *
import pantau_mock as M

OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
    print('kartu antar:',pg.locator('.antar').count())
    pg.locator('.antar').first.scroll_into_view_if_needed();pg.screenshot(path=OUT+'antar_1.png')
    btn=pg.get_by_role('button',name='Buat lembar pengantar dan unduh PDF').last
    with pg.expect_download(timeout=30000) as dl:
        btn.click()
    d=dl.value;path=S+'antar_hasil.pdf';d.save_as(path);print('berkas:',d.suggested_filename)
    pg.wait_for_timeout(1500);pg.locator('.antar').last.scroll_into_view_if_needed();pg.screenshot(path=OUT+'antar_2.png')
    print([l for l in M.log if l['aksi'] in('lembar','bukalaporan')])
    print('galat:',errs)
