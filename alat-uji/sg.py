import sys
sys.path.insert(0,'.')
import tk
from tk import *
M.PERAN='utama'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':1440,'height':900});pg=ctx.new_page()
    ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
    ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
    pg.evaluate("window.scrollTo(0,0);document.querySelectorAll('.stbody').forEach(e=>e.scrollTop=40)")
    pg.mouse.wheel(0,400);pg.wait_for_timeout(600)
    pg.evaluate("document.querySelectorAll('.stbody').forEach(e=>e.scrollTop=e.scrollHeight>e.clientHeight?60:0)")
    pg.wait_for_timeout(300)
    pg.screenshot(path='desain/img/sg.png');b.close()
