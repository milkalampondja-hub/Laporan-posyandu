import json,urllib.parse,time
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
POS=[('p1','Mekar','Mamboro','Posyandu Balita'),('p2','Mekar','Mamboro','Posyandu Lansia'),('p3','Anggrek','Taipa','Posyandu Balita'),('p4','Bougenvil','Mamboro Barat','Posyandu Balita'),('p5','Teratai','Kayumalue Ngapa','Posyandu Lansia')]
LAP={'kodeA1b2c3':dict(nomor='LP-2026-10-001',versi=1,versiTerbaru=1,pos='Mekar',kel='Mamboro',jenis='Posyandu Balita',kader='Ani, Budi',bln='Oktober',thn='2026',per='2026-10',pid='p1',kode='kodeA1b2c3'),
     'kodeOld999':dict(nomor='LP-2026-10-002',versi=1,versiTerbaru=2,pos='Anggrek',kel='Taipa',jenis='Posyandu Balita',kader='Cici',bln='Oktober',thn='2026',per='2026-10',pid='p3',kode='kodeOld999'),
     'kodeNoPos1':dict(nomor='LP-2026-10-003',versi=1,versiTerbaru=1,pos='Hilang',kel='Taipa',jenis='Posyandu Lansia',kader='Dedi',bln='Oktober',thn='2026',per='2026-10',pid='',kode='kodeNoPos1')}
TERIMA={}  # (per,pid)->dict
RIW=[]
log=[]
def lst(per):
    return [dict(pid=i,nama=n,kel=k,jenis=j,dibuat=(i in('p1','p3')),versi=1,terima=TERIMA.get((per,i))) for i,n,k,j in POS]
def h(route):
    r=route.request
    if r.method=='POST':
        body=urllib.parse.parse_qs(r.post_data or '');d=json.loads(body['data'][0]);log.append({k:v for k,v in d.items() if k!='p'})
        out={'ok':False,'pesan':'x'}
        if d['aksi']=='terima':
            l=dict(LAP[d['k']]);key=(l['per'],l['pid'])
            if key in TERIMA: l['terima']=TERIMA[key];out={'ok':True,'sudah':True,'lap':l}
            else:
                TERIMA[key]=dict(tgl='2026-11-02',jam='07:05',oleh='Petugas Kecamatan',nomor=l['nomor'],via='qr');l['terima']=TERIMA[key]
                RIW.insert(0,dict(pos=l['pos'],kel=l['kel'],jenis=l['jenis'],per=l['per'],tgl='2026-11-02',jam='07:05',oleh='Petugas Kecamatan',nomor=l['nomor'],ts=1));out={'ok':True,'sudah':False,'lap':l}
        elif d['aksi']=='terimabatal':
            if len(d['alasan'])<3: out={'ok':False,'pesan':'Tulis alasan koreksi'}
            else: TERIMA.pop((d['per'],d['pid']),None);RIW.clear();out={'ok':True}
        st['res'][d['id']]=out
        return route.fulfill(content_type='text/html',body='<html></html>')
    q=parse_qs(urlparse(r.url).query);cb=q['cb'][0];a=q.get('aksi',[''])[0]
    if a=='hasil': out=st['res'].get(q['id'][0],{'ok':False,'tunggu':True})
    elif q.get('p',[''])[0]!='rahasia': out={'ok':False,'login':False,'pesan':'Nama pengguna atau kata sandi salah'}
    elif a=='trekap':
        per=q.get('per',[''])[0] or '2026-10'
        out={'ok':True,'per':per,'list':lst(per),'riwayat':list(RIW),'batas':8,'oleh':'Petugas Kecamatan','peran':'terima'}
    elif a=='tcari':
        k=q['k'][0];l=LAP.get(k)
        if l: l=dict(l);l['terima']=TERIMA.get((l['per'],l['pid'])) if l['pid'] else None
        out={'ok':True,'ada':bool(l),'lap':l}
    else: out={'ok':True}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
st={'res':{}}
SCAN=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,permissions=['camera'])
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    # BarcodeDetector tiruan: membaca isi dari antrean SCAN
    pg.add_init_script("""window.__q=[];window.BarcodeDetector=class{constructor(){}async detect(){return window.__q.length?[{rawValue:window.__q.shift()}]:[]}};""")
    pg.goto('http://localhost:8765/terima.html')
    pg.fill('#lu','petugas');pg.fill('#lp','salah');pg.click('#lb');pg.wait_for_timeout(1800)
    print('salah sandi:',pg.inner_text('#lerr'))
    pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(2000)
    print('ringkasan:',pg.inner_text('#sT'),pg.inner_text('#sS'),pg.inner_text('#sB'),'|',pg.inner_text('#perB'))
    pg.screenshot(path=S+'tr1.png')
    def scan(txt):
        pg.evaluate("t=>window.__q.push(t)",txt);pg.click('#scan');pg.wait_for_timeout(1800)
    scan('https://x.github.io/Laporan-posyandu/terima.html?k=kodeA1b2c3')
    print('detail:',pg.locator('.sheet h3').inner_text(),'|',pg.locator('.sheet .kv').inner_text().replace('\n',' / '))
    pg.screenshot(path=S+'tr2.png')
    pg.click('text=KONFIRMASI DITERIMA');pg.wait_for_timeout(3500)
    print('setelah konfirmasi:',pg.locator('.sheet h3').inner_text(),'|',pg.locator('.sheet .note').all_inner_texts())
    pg.screenshot(path=S+'tr3.png')
    pg.click('.sheet button:has-text("Tutup")');pg.wait_for_timeout(500)
    print('ringkasan:',pg.inner_text('#sT'),pg.inner_text('#sS'),pg.inner_text('#sB'),'| riwayat:',pg.locator('#riw .row').count())
    pg.screenshot(path=S+'tr4.png')
    scan('kodeA1b2c3')
    print('scan ulang:',pg.locator('.sheet .note').all_inner_texts(),'tombol:',pg.locator('.sheet .btn').all_inner_texts())
    pg.click('text=Koreksi: batalkan');pg.wait_for_timeout(300)
    pg.click('text=Batalkan penerimaan');pg.wait_for_timeout(300);print('tanpa alasan:',pg.locator('.sheet .err').inner_text())
    pg.fill('.sheet input','salah scan');pg.click('text=Batalkan penerimaan');pg.wait_for_timeout(3500)
    print('setelah koreksi:',pg.inner_text('#sS'),'log:',log[-1])
    scan('kodeTidakAda1');print('tak dikenal:',pg.locator('.sheet h3').inner_text(),pg.locator('.sheet .note').all_inner_texts());pg.click('.sheet button:has-text("Tutup")')
    scan('kodeOld999');print('versi lama:',pg.locator('.sheet .note').all_inner_texts());pg.click('.sheet button:has-text("Batal")');
    scan('kodeNoPos1');print('tanpa posyandu:',pg.locator('.sheet .note').all_inner_texts(),pg.locator('.sheet .btn').all_inner_texts());pg.click('.sheet button:has-text("Batal")')
    scan('bukan qr kita !!');print('pesan kamera:',pg.inner_text('#camMsg'));pg.click('#camX')
    pg.click('.nav button[data-v=R]');pg.wait_for_timeout(300);pg.screenshot(path=S+'tr5.png')
    pg.select_option('#fSt','b');pg.click('#seg button[data-j="Posyandu Balita"]');print('rekap balita belum:',pg.inner_text('#cnt'),pg.locator('#lst .row').count())
    print('errs',errs)
