import json
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad'
d=[{"n":"LP-2026-10-001","tk":"20/10/2026 15:02:17","thn":"2026","bln":"Oktober","kel":"Taipa","pos":"Melati 1","jenis":"Posyandu Balita","tgl":"20 Oktober 2026","ver":1,"pdf":True},
{"n":"LP-2026-10-003","tk":"20/10/2026 16:00:00","thn":"2026","bln":"Oktober","kel":"Mamboro","pos":"Mawar","jenis":"Posyandu Lansia","tgl":"19 Oktober 2026","ver":1,"pdf":True}]
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    ok=q.get('u',[''])[0]=='admin' and q.get('p',[''])[0]=='rahasia'
    body={"ok":True,"data":d} if ok else {"ok":False,"login":False,"pesan":"Nama pengguna atau kata sandi salah"}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(body)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.route('https://script.google.com/**',h)
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.screenshot(path=S+'/shots/login.png')
    pg.fill('#lu','admin');pg.fill('#lp','salah');pg.click('#lb');pg.wait_for_timeout(700)
    print('salah ->',pg.inner_text('#lerr'),'| login visible:',pg.is_visible('#login'),'| app visible:',pg.is_visible('#app'))
    pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(900)
    print('benar -> app:',pg.is_visible('#app'),'|',pg.inner_text('#tot').replace('\n',' '))
    pg.screenshot(path=S+'/shots/dash.png')
    pg.reload();pg.wait_for_timeout(800)
    print('reload tetap masuk:',pg.is_visible('#app'))
    pg.click('#out');print('keluar -> login:',pg.is_visible('#login'))
    pg.reload();pg.wait_for_timeout(500);print('setelah keluar+reload login:',pg.is_visible('#login'))
    b.close()
