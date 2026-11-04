import json
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
seed=open('/home/claude/laporan-posyandu/seed-posyandu.js',encoding='utf8').read()
lst=json.loads(seed[len('window.SEED_POS='):-1])
pub=[{'nama':x['nama'],'kel':x['kel'],'jenis':x['jenis'],'kader':x['kader']} for x in lst]
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({'ok':True,'list':pub})+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':900,'height':1300})
    pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h)
    pg.goto('file://'+S+'idx_test.html');pg.wait_for_timeout(800)
    pg.click('[data-start="0"]');pg.click('[data-jenis="balita"]');pg.select_option('#kelurahan','Mamboro');pg.select_option('#posyandu','Asoka');pg.wait_for_timeout(300)
    pg.fill('[data-peng="1"]','Siti')
    pg.evaluate("""(function(){__t.set('tanggal','2026-10-10');var d=document.createElement('div');d.id='tst';d.style.cssText='position:absolute;left:0;top:0;z-index:999;background:#fff';d.innerHTML=__t.ph();document.body.appendChild(d);var pg=d.querySelector('.pg');['','t1','t2'].some(function(c){pg.classList.remove('t1','t2');if(c)pg.classList.add(c);return pg.scrollHeight<=1248});})()""")
    pg.wait_for_timeout(300);pg.locator('#tst .pg').first.screenshot(path=S+'shots/pdf1.png')
    b.close()
