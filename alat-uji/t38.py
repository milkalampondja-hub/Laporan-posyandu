from playwright.sync_api import sync_playwright
import json,re
from urllib.parse import urlparse,parse_qs
POS=[dict(pid='p1',nama='Mekar',kel='Mamboro',jenis='Posyandu Balita',dibuat=True,versi=1,terima=None)]
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    return route.abort()
    out={'ok':True,'per':'2026-10','list':POS,'riwayat':[],'batas':8,'oleh':'Petugas','peran':'terima'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context(viewport={'width':390,'height':844})
    pg=ctx.new_page();ctx.route('**/script.google.com/**',h)
    pg.goto('http://localhost:8765/terima.html')
    pg.evaluate("localStorage.setItem('terima-cred',JSON.stringify({u:'petugas',p:'x'}));localStorage.setItem('terima-rekap',JSON.stringify({u:'petugas',r:{ok:true,per:'2026-10',list:[{pid:'p1',nama:'Mekar',kel:'Mamboro',jenis:'Posyandu Balita',dibuat:true,versi:1,terima:{tgl:'2026-11-01',jam:'08:00',oleh:'A',nomor:'n',via:'qr'}}],riwayat:[],batas:8,oleh:'Petugas'}}))")
    pg.reload();pg.wait_for_timeout(600)
    print('0,6 detik (server belum menjawab):',pg.inner_text('#sT'),pg.inner_text('#sS'),pg.inner_text('#perB'))
    pg.wait_for_timeout(3500)
    print('setelah server menjawab:',pg.inner_text('#sT'),pg.inner_text('#sS'))
