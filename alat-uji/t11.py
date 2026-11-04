import json
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
seed=open('/home/claude/laporan-posyandu/seed-posyandu.js',encoding='utf8').read()
lst=json.loads(seed[len('window.SEED_POS='):-1])
pub=[{'nama':x['nama'],'kel':x['kel'],'jenis':x['jenis'],'kader':[{'nama':k['nama'],'jabatan':k['jabatan']} for k in x['kader']]} for x in lst]
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({'ok':True,'list':pub})+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h)
    pg.goto('file:///tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/idx_test.html');pg.wait_for_timeout(800)
    pg.click('[data-start="0"]');pg.wait_for_timeout(500)
    pg.click('[data-jenis="balita"]');pg.wait_for_timeout(300)
    pg.select_option('#kelurahan','Mamboro');pg.wait_for_timeout(300)
    print('opsi:',pg.locator('#posyandu option').all_inner_texts())
    pg.select_option('#posyandu','Asoka');pg.wait_for_timeout(400)
    print('kader terkunci:',pg.locator('.lock .nm').all_inner_texts())
    pg.fill('[data-peng="1"]','Siti');pg.fill('[data-peng="3"]','Rina')
    pg.screenshot(path=S+'shots/k1.png',full_page=True)
    print('stage html ok');
    res=pg.evaluate("(function(){var h=__t.ph();var d=document.createElement('div');d.innerHTML=h;return {kader:d.querySelector('table.kv').innerText.split('Tanggal')[0],cat:(d.querySelector('.cat')||{}).innerText||null,cls:d.querySelector('.pg').className}})()")
    print(res)
    pg.evaluate("__t.set('peng',{})")
    print('tanpa pengganti:',pg.evaluate("(function(){var d=document.createElement('div');d.innerHTML=__t.ph();return !!d.querySelector('.cat')})()"))
    # pratinjau
    pg.evaluate("__t.set('peng',{1:'Siti',3:'Rina'})")
    print('ERR',errs)
    b.close()
