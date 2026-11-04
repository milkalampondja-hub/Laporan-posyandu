import json,urllib.parse
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
st={'nama':'Admin Posyandu','foto':'','banner':'','pw':'rahasia','res':{}}
log=[]
def h(route):
    r=route.request
    if r.method=='POST':
        body=urllib.parse.parse_qs(r.post_data or '')
        d=json.loads(body['data'][0]);log.append({k:(v if len(str(v))<60 else '<%d chars>'%len(str(v))) for k,v in d.items()})
        if d['p']!=st['pw']: st['res'][d['id']]={'ok':False,'pesan':'Kata sandi salah'}
        else:
            if 'nama' in d: st['nama']=d['nama']
            if 'foto' in d: st['foto']=d['foto']
            if 'banner' in d: st['banner']=d['banner']
            if 'sandiBaru' in d: st['pw']=d['sandiBaru']
            st['res'][d['id']]={'ok':True}
        return route.fulfill(content_type='text/html',body='<html></html>')
    q=parse_qs(urlparse(r.url).query);cb=q['cb'][0];a=q.get('aksi',[''])[0]
    if a=='hasil': out=st['res'].get(q['id'][0],{'ok':False,'tunggu':True})
    elif q.get('p',[''])[0]!=st['pw']: out={'ok':False,'login':False,'pesan':'Nama pengguna atau kata sandi salah'}
    elif a=='profil': out={'ok':True,'nama':st['nama'],'foto':st['foto'],'banner':st['banner']}
    else: out={'ok':True,'data':[]}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.route('https://script.google.com/**',h)
    pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body='window.XLSX=1'))
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(1200)
    pg.evaluate("go('p')")
    pg.fill('#inNama','dr. Santi');pg.set_input_files('#inFoto',S+'besar.jpg');pg.wait_for_timeout(700)
    pg.click('#svProfil');pg.wait_for_timeout(2500);print('profil:',pg.inner_text('#stProfil'))
    pg.set_input_files('#inBan',S+'besar.jpg');pg.wait_for_timeout(900)
    pg.click('#svBan');pg.wait_for_timeout(2500);print('banner:',pg.inner_text('#stBan'))
    pg.fill('#pwLama','salah');pg.fill('#pwBaru','baru123');pg.fill('#pwUlang','baru123');pg.click('#svPw');print('pw salah:',pg.inner_text('#stPw'))
    pg.fill('#pwLama','rahasia');pg.fill('#pwUlang','beda');pg.click('#svPw');print('pw beda:',pg.inner_text('#stPw'))
    pg.fill('#pwUlang','baru123');pg.click('#svPw');pg.wait_for_timeout(2500);print('pw ok:',pg.inner_text('#stPw'))
    for l in log: print('POST',l)
    print('sizes foto/banner:',len(st['foto']),len(st['banner']),'pw server:',st['pw'])
    pg.evaluate("go('b')");pg.wait_for_timeout(300)
    print('sapaan:',pg.inner_text('.hello .w').replace('\n',' | '))
    pg.screenshot(path=S+'shots/set_home.png')
    pg.evaluate("go('p')");pg.wait_for_timeout(300);pg.screenshot(path=S+'shots/set_p.png',full_page=True)
    pg.click('#out');pg.fill('#lu','admin');pg.fill('#lp','baru123');pg.click('#lb');pg.wait_for_timeout(1500)
    print('login sandi baru:',pg.is_visible('#app'),'| nama setelah login ulang:',pg.inner_text('.hello .w b'))
    pg.screenshot(path=S+'shots/set_home2.png')
    b.close()
