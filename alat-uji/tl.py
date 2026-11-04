from playwright.sync_api import sync_playwright
import json
from urllib.parse import urlparse,parse_qs
OUT='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/desain/img/'
ITEMS=[dict(pid='p1',nama='Mekar',jenis='Posyandu Balita',st='ikut',nomor='LP-1',kode='k1',versi=1,terima=None,dibuka=False),
 dict(pid='p2',nama='Asoka',jenis='Posyandu Balita',st='ikut',nomor='LP-2',kode='k2',versi=1,terima=None,dibuka=False),
 dict(pid='p3',nama='Teratai',jenis='Posyandu Balita',st='belum',nomor='',kode='',versi=0,terima=None,dibuka=False)]
LM=dict(kode='LABCDEFGH23',kel='Mamboro',per='2026-10',bln='Oktober',thn='2026',tgl='2026-11-04',jam='09:00',oleh='Operator Mamboro',ts=1,items=ITEMS,ganti='',diterima=None)
calls=[]
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0];a=q['aksi'][0];calls.append((a,q.get('ids',[''])[0]))
    if a=='trekap': out={'ok':True,'per':'2026-10','list':[],'riwayat':[],'batas':8,'oleh':'Petugas','peran':'terima'}
    elif a=='tlembar': out={'ok':True,'ada':True,'lembar':LM,'oleh':'Petugas'}
    elif a=='tlterima':
        ids=q['ids'][0].split(',')
        for i in ITEMS:
            if i['pid'] in ids: i['terima']={'tgl':'2026-11-04','jam':'10:15','oleh':'Petugas'}
        out={'ok':True,'baru':len(ids),'lewati':[],'lembar':LM}
    else: out={'ok':False,'pesan':'x'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));ctx.route('**/script.google.com/**',h)
    pg.goto('http://localhost:8765/terima.html')
    pg.evaluate("localStorage.setItem('terima-cred',JSON.stringify({u:'petugas',p:'x'}))")
    pg.goto('http://localhost:8765/terima.html?k=LABCDEFGH23');pg.wait_for_timeout(2500)
    print(calls);pg.screenshot(path=OUT+'tl_1.png');
    pg.locator('.lmrow input').nth(1).uncheck()
    print('tombol:',pg.locator('.sheet .btn').first.inner_text())
    pg.locator('.sheet .btn').first.click();pg.wait_for_timeout(1500)
    print('setelah:',pg.inner_text('.sheet h3'),'|',pg.inner_text('.sheet .note.ok'));pg.screenshot(path=OUT+'tl_2.png')
    print(calls[-2:],errs)
