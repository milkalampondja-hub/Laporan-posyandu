import json,urllib.parse,datetime
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
BL=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
now=datetime.date.today();bl=BL[now.month-1];prev=BL[(now.month-2)%12]
def rep(n,kel,pos,jenis,b,tk):return {'n':'LP-%d'%n,'tk':tk,'thn':str(now.year),'bln':b,'kel':kel,'pos':pos,'jenis':jenis,'tgl':'01/10/2026','kader':'x','hasil':'','ver':1,'pdf':True}
DATA=[rep(1,'Taipa','Beringin','Posyandu Balita',bl,'05/%02d/%d 10:00:00'%(now.month,now.year)),
 rep(2,'Taipa','beringin','Posyandu Lansia',bl,'28/%02d/%d 10:00:00'%(now.month,now.year)),
 rep(3,'Mamboro Barat','Bougenvile','Posyandu Balita',bl,'06/%02d/%d 10:00:00'%(now.month,now.year)),
 rep(4,'Mamboro','Salah Nama','Posyandu Balita',bl,'06/%02d/%d 10:00:00'%(now.month,now.year)),
 rep(5,'Taipa','Beringin','Posyandu Balita',prev,'05/%02d/%d 10:00:00'%(now.month,now.year))]
import sys
PERAN=sys.argv[1]
SEED=json.loads(open('/home/claude/laporan-posyandu/seed-posyandu.js',encoding='utf-8').read().split('=',1)[1].rstrip().rstrip(';'))
st={'pw':'rahasia','res':{},'list':SEED,'ban':['','',''],'batas':25,'sk':{}}
log=[]
def h(route):
    r=route.request
    if r.method=='POST':
        body=urllib.parse.parse_qs(r.post_data or '');d=json.loads(body['data'][0])
        log.append({k:(v if len(str(v))<80 else '<%d>'%len(str(v))) for k,v in d.items()})
        out={'ok':True}
        if d['aksi']=='nomor':
            for x in st['list']:
                if x['id']==d['id']: x['hp']=d['hp'];x['hpJenis']=d['hpJenis'];x['hpNama']=d['hpNama']
            out={'ok':True,'list':[x for x in st['list'] if PERAN=='utama' or x['kel']=='Taipa']}
        elif d['aksi']=='pos': st['list']=d['list'];out={'ok':True,'list':d['list']}
        elif d['aksi']=='atur':
            if 'bannerIdx' in d: st['ban'][d['bannerIdx']]=d['banner']
            if 'batas' in d: st['batas']=d['batas']
        elif d['aksi']=='sk': out={'ok':True,'sk':{'Balita':{'id':'abc','tgl':'23/10/2026 05:00','ukuran':3000000}}};st['sk']=out['sk']
        st['res'][d['id']]=out
        return route.fulfill(content_type='text/html',body='<html></html>')
    q=parse_qs(urlparse(r.url).query);cb=q['cb'][0];a=q.get('aksi',[''])[0]
    if a=='hasil': out=st['res'].get(q['id'][0],{'ok':False,'tunggu':True})
    elif a=='cek': out={'ok':True}
    elif q.get('p',[''])[0]!=st['pw']: out={'ok':False,'login':False,'pesan':'x'}
    elif a=='profil': out={'ok':True,'nama':'Max Juniar Ratowo','nip':'199306052019081001','jabatan':'','unit':'','foto':'','banners':st['ban'],'batas':st['batas'],'sk':st['sk'],'peran':PERAN,'kel':'Taipa','admins':[]}
    elif a=='log': out={'ok':True,'log':[{'t':'24/10/2026 01:10','u':'admin','a':'menambah operator op1 (Kelurahan Mamboro)'}]}
    elif a=='posyandu': out={'ok':True,'list':[x for x in st['list'] if PERAN=='utama' or x['kel']=='Taipa'],'sk':st['sk']}
    else: out={'ok':True,'data':DATA,'peran':PERAN,'kel':'Taipa'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')


with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3000)
    print('isop:',pg.evaluate("document.getElementById('app').classList.contains('isop')"))
    print('banner vis:',pg.locator('#bm').is_visible(),'panel vis:',pg.locator('#panel').is_visible(),'secMx vis:',pg.locator('#secMx').is_visible())
    print('rows:',pg.locator('.prow').count(),'wa links:',pg.locator('a.wa').count())
    pg.screenshot(path=S+'shots/ber_%s.png'%PERAN,full_page=False)
    if PERAN=='admin':
        # isi nomor untuk baris pertama
        pg.locator('.prow button:has-text("Isi nomor")').first.click();pg.wait_for_timeout(300)
        pg.fill('input[type=tel]','0812 3456 7890');pg.click('text=Simpan nomor');pg.wait_for_timeout(2500)
        print('log:',[x for x in log if x.get('aksi')=='nomor'])
        print('wa links sesudah:',pg.locator('a.wa').count())
        href=pg.locator('a.wa').first.get_attribute('href');print(href[:140])
        import urllib.parse as u;print(u.unquote(href.split('text=')[1]))
        pg.locator('.prow button:has-text("Ubah nomor")').first.click();pg.wait_for_timeout(300)
        pg.select_option('.modal select','perwakilan');pg.fill('.modal input[type=text]','Ibu Sari');pg.click('text=Simpan nomor');pg.wait_for_timeout(2500)
        print('perwakilan:',pg.locator('.prow .ct span').first.inner_text())
        pg.screenshot(path=S+'shots/ber2_admin.png')
        pg.click('#bnav [data-go="r"]');pg.wait_for_timeout(600)
        print('rekap cards:',pg.locator('#rkIsi .card h4').all_inner_texts())
        pg.click('#bnav [data-go="l"]');pg.wait_for_timeout(500)
        print('opdl vis:',pg.locator('.opdl').is_visible())
        pg.click('#bnav [data-go="d"]');pg.wait_for_timeout(500)
        pg.locator('#dpList details summary').first.click();pg.wait_for_timeout(300)
        print('ubah nomor btn in data:',pg.locator('#dpList button:has-text("nomor ketua")').count())
    print('errs',errs)
    b.close()
