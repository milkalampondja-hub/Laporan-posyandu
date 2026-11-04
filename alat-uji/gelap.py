import sys
sys.path.insert(0,'.')
from pantau_mock import *
O='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for n,(w,hh) in {'web':(1280,800),'hp':(390,844)}.items():
        ctx=b.new_context(viewport={'width':w,'height':hh},device_scale_factor=1 if n=='web' else 2,color_scheme='dark')
        pg=ctx.new_page();ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        if n=='web':pg.screenshot(path=O+'gelap_login.png')
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3000)
        pg.screenshot(path=O+'gelap_%s.png'%n,clip=None if n=='web' else {'x':0,'y':0,'width':390,'height':844})
