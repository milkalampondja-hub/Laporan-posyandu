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
st={'pw':'rahasia','res':{},'list':[],'ban':['','',''],'batas':25,'sk':{}}
log=[]
def h(route):
    r=route.request
    if r.method=='POST':
        body=urllib.parse.parse_qs(r.post_data or '');d=json.loads(body['data'][0])
        log.append({k:(v if len(str(v))<80 else '<%d>'%len(str(v))) for k,v in d.items()})
        out={'ok':True}
        if d['aksi']=='pos': st['list']=d['list'];out={'ok':True,'list':d['list']}
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
    elif a=='profil': out={'ok':True,'nama':'Max Juniar Ratowo','nip':'199306052019081001','jabatan':'','unit':'','foto':'','banners':st['ban'],'batas':st['batas'],'sk':st['sk'],'peran':'admin','kel':'Mamboro'}
    elif a=='posyandu': out={'ok':True,'list':st['list'],'sk':st['sk'],'kel':'Mamboro'}
    else: out={'ok':True,'data':DATA,'peran':'admin','kel':'Mamboro'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h)
    pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.fill('#lu','op');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(2500)
    t=pg.inner_text('body')
    print('KEL',pg.evaluate('KEL'))
    for k in ['Mamboro','Kayumalue','Taipa']: print(k, k in t)
    print('opt Kel:',pg.evaluate("[...document.querySelectorAll('#dfk option')].map(o=>o.value)"))
    print(pg.inner_text('#sumB')[:300].replace('\n',' | '))
    print('btn',pg.evaluate("[getComputedStyle(btnBuat).display,btnBuat.getBoundingClientRect().height,getComputedStyle(lnkApp).display]"));pg.screenshot(path=S+'shots/op.png');pg.set_viewport_size({'width':1200,'height':800});pg.wait_for_timeout(300);pg.screenshot(path=S+'shots/opd.png');print('errs',errs)
    b.close()
