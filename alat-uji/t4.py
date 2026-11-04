import json,sys
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/shots/'
bal="Oktober: Sasaran Ibu Hamil 5, Kunjungan Ibu Hamil 4, Sasaran Bayi Balita (S) 60, Memiliki KMS (K) 55, Kunjungan (D) 50, BB Naik (N) 40, BB Tidak Naik (T) 8, BGM 1, Stunting 2"
lan="Oktober: Sasaran lansia 30, Kunjungan lansia 22"
d=[{"n":"LP-2026-10-002","tk":"20/10/2026 15:03:12","thn":"2026","bln":"Oktober","kel":"Taipa","pos":"Melati 1","jenis":"Posyandu Balita","tgl":"20 Oktober 2026","kader":"Anu","hasil":bal,"ver":2,"pdf":True},
{"n":"LP-2026-10-003","tk":"20/10/2026 16:00:00","thn":"2026","bln":"Oktober","kel":"Mamboro","pos":"Mawar","jenis":"Posyandu Lansia","tgl":"19 Oktober 2026","kader":"Budi","hasil":lan,"ver":1,"pdf":False}]
def h(route):
    cb=parse_qs(urlparse(route.request.url).query)['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({"ok":True,"data":d})+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for nm,vp in (('m',{'width':390,'height':844}),('d',{'width':1536,'height':1024})):
        pg=b.new_page(viewport=vp)
        pg.on('pageerror',lambda e:print('ERR',e))
        pg.on('console',lambda m:print('CON',m.text) if m.type=='error' else None)
        pg.route('https://script.google.com/**',h)
        pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=1'))
        pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
        pg.fill('#lu','a');pg.fill('#lp','b');pg.click('#lb');pg.wait_for_timeout(1000)
        print(nm,'scrollW',pg.evaluate('document.documentElement.scrollWidth'),pg.evaluate('innerWidth'));pg.screenshot(path=S+nm+'_b.png',full_page=(nm=='m'))
        for v in ('l','d','r','p'):
            pg.evaluate("go('%s')"%v);pg.wait_for_timeout(200)
            pg.screenshot(path=S+nm+'_'+v+'.png',full_page=(nm=='m'))
        pg.close()
    b.close()
