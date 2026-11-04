import json
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad'
d=[{"n":"LP-2026-10-001","tk":"20/10/2026 15:02:17","thn":"2026","bln":"Oktober","kel":"Taipa","pos":"Melati 1","jenis":"Posyandu Balita","tgl":"20 Oktober 2026","ver":1,"pdf":True},
{"n":"LP-2026-10-002","tk":"20/10/2026 15:03:12","thn":"2026","bln":"Oktober","kel":"Taipa","pos":"Melati 1","jenis":"Posyandu Balita","tgl":"20 Oktober 2026","ver":2,"pdf":False},
{"n":"LP-2026-10-003","tk":"20/10/2026 16:00:00","thn":"2026","bln":"Oktober","kel":"Mamboro","pos":"Mawar","jenis":"Posyandu Lansia","tgl":"19 Oktober 2026","ver":1,"pdf":True}]
def h(route):
    cb=parse_qs(urlparse(route.request.url).query)['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({"ok":True,"data":d})+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.route('https://script.google.com/**',h)
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.wait_for_timeout(1000)
    print(pg.inner_text('#tot').replace('\n',' '),'|',pg.inner_text('#mx').replace('\n',' '))
    print(pg.inner_text('#ls')[:400])
    pg.screenshot(path=S+'/shots/pantau.png',full_page=True)
    b.close()
