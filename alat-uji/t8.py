import json,urllib.parse
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
st={'nama':'Admin Posyandu','foto':'','banner':'','pw':'rahasia','res':{},'adm':{}}
log=[]
def h(route):
    r=route.request
    if r.method=='POST':
        body=urllib.parse.parse_qs(r.post_data or '')
        d=json.loads(body['data'][0]);log.append({k:(v if len(str(v))<60 else '<%d chars>'%len(str(v))) for k,v in d.items()})
        if d['p']!=st['pw']: st['res'][d['id']]={'ok':False,'pesan':'Kata sandi salah'}
        else:
            if d['aksi']=='kelola':
                if d['op']=='tambah':
                    if len(st['adm'])>=5: st['res'][d['id']]={'ok':False,'pesan':'penuh'}; return route.fulfill(content_type='text/html',body='<html></html>')
                    st['adm'][d['nu']]=d['ns']
                elif d['op']=='hapus': st['adm'].pop(d['nu'],None)
                st['res'][d['id']]={'ok':True,'admins':[{'u':k,'nama':'','nip':''} for k in st['adm']]};return route.fulfill(content_type='text/html',body='<html></html>')
            if 'nama' in d: st['nama']=d['nama']
            if 'foto' in d: st['foto']=d['foto']
            if 'banner' in d: st['banner']=d['banner']
            if 'sandiBaru' in d: st['pw']=d['sandiBaru']
            st['res'][d['id']]={'ok':True}
        return route.fulfill(content_type='text/html',body='<html></html>')
    q=parse_qs(urlparse(r.url).query);cb=q['cb'][0];a=q.get('aksi',[''])[0]
    if a=='hasil': out=st['res'].get(q['id'][0],{'ok':False,'tunggu':True})
    elif q.get('p',[''])[0]!=st['pw']: out={'ok':False,'login':False,'pesan':'Nama pengguna atau kata sandi salah'}
    elif a=='profil': out={'ok':True,'nama':st['nama'],'foto':st['foto'],'banner':st['banner'],'peran':'utama','admins':[{'u':k,'nama':'','nip':''} for k in st['adm']]}
    else: out={'ok':True,'data':[],'peran':'utama'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h)
    pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=1'))
    pg.route('https://fonts.g*/**',lambda r:r.fulfill(body=''))
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(1500)
    pg.evaluate("go('p')");pg.wait_for_timeout(500)
    print('kartu tampak:',pg.is_visible('#cardAdm'),pg.inner_text('#admInfo'))
    for i in range(6):
        pg.fill('#adU','kader%d'%i);pg.fill('#adP','sandi123');pg.click('#svAdm');pg.wait_for_timeout(2200)
        print(i,pg.inner_text('#stAdm'),'|',pg.inner_text('#admInfo'))
    pg.screenshot(path=S+'shots/adm.png',full_page=True)
    pg.once('dialog',lambda d:d.accept());pg.click('#admList .admrow:first-child button:last-child');pg.wait_for_timeout(2200)
    print('hapus:',pg.inner_text('#stAdm'),'|',pg.inner_text('#admInfo'))
    b.close()
