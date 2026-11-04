import json
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({'ok':True,'list':[{'nama':'Asoka','kel':'Mamboro','jenis':'Posyandu Balita','kader':[{'nama':'Yuyun','jabatan':'Ketua'}]}],'info':'Laporan bulan ini paling lambat tanggal 25: harap tepat waktu.'})+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for name,dev in [('hp',{'width':390,'height':844})]:
        pg=b.new_page(viewport=dev);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h)
        pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.abort());pg.route('https://fonts.*/**',lambda r:r.abort())
        pg.goto('file:///home/claude/laporan-posyandu/index.html');pg.wait_for_timeout(1500)
        print('info:',pg.locator('.info').inner_text().replace('\n',' | '))
        pg.locator('.pasang summary').click();pg.wait_for_timeout(200)
        pg.locator('.pasang').scroll_into_view_if_needed();pg.screenshot(path=S+'shots/k1.png',full_page=True)
        pg.evaluate("localStorage.clear()")
        print('errs',errs)
    b.close()
