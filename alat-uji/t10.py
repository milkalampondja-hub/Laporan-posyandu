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
    elif a=='profil': out={'ok':True,'nama':'Max Juniar Ratowo','nip':'199306052019081001','jabatan':'','unit':'','foto':'','banners':st['ban'],'batas':st['batas'],'sk':st['sk'],'peran':'utama','admins':[]}
    elif a=='posyandu': out={'ok':True,'list':st['list'],'sk':st['sk']}
    else: out={'ok':True,'data':DATA,'peran':'utama'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h)
    pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=undefined'))
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(2500)
    pg.screenshot(path=S+'shots/b1.png')
    print('ringkasan:',pg.inner_text('#sumB')[:400].replace('\n',' | '))
    pg.evaluate("go('r')");pg.wait_for_timeout(500);pg.screenshot(path=S+'shots/r1.png',full_page=True)
    print('rekap ok',len(pg.inner_text('#rkIsi')))
    pg.evaluate("go('d')");pg.wait_for_timeout(500)
    print('tombol:',pg.inner_text('#dpTool').replace('\n',' | '))
    pg.click('#dpTool >> text=Simpan daftar dari SK');pg.wait_for_timeout(2500)
    print('after seed list',len(st['list']),pg.inner_text('#dpStat').replace('\n',' '))
    pg.screenshot(path=S+'shots/d1.png',full_page=True)
    pg.click('#dpList details:first-of-type summary');pg.wait_for_timeout(200)
    pg.click('#dpList details[open] >> text=Edit');pg.wait_for_timeout(300);pg.fill('#fpH','0812 000');pg.screenshot(path=S+'shots/d2.png');pg.click('text=Simpan perubahan');pg.wait_for_timeout(2500)
    print('hp saved:',st['list'][0]['hp'])
    pg.evaluate("go('b')");pg.wait_for_timeout(300)
    print('ringkasan2:',pg.inner_text('#sumB')[:300].replace('\n',' | '))
    pg.screenshot(path=S+'shots/b2.png',full_page=True)
    pg.evaluate("go('p')");pg.wait_for_timeout(500);pg.screenshot(path=S+'shots/p1.png',full_page=True)
    print('banner card:',pg.is_visible('#cardBan'),pg.is_visible('#cardApp'))
    pg.set_input_files('#cardBan .slot:first-child input',S+'besar.jpg');pg.wait_for_timeout(3500)
    print('banner saved',[len(x) for x in st['ban']],'slides',pg.locator('#bm .slide').count())
    pg.click('.hello');pg.wait_for_timeout(200);print('menu:',pg.inner_text('.accpop').replace('\n',' | '));pg.screenshot(path=S+'shots/m1.png')
    print('ERR',errs);print(log[-3:])
    b.close()
