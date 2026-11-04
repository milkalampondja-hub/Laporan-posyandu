import json
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad'
bal="Oktober: Sasaran Ibu Hamil 5, Kunjungan Ibu Hamil 4, Sasaran Bayi Balita (S) 60, Memiliki KMS (K) 55, Kunjungan (D) 50, BB Naik (N) 40, BB Tidak Naik (T) 8, BGM 1, Stunting 2"
old="Oktober Sasaran Ibu Hamil 0, Kunjungan Ibu Hamil 0, Sasaran Bayi Balita (S) 0, Memiliki KMS (K) 0, Kunjungan (D) 0, BB Naik (N) 0, BB Tidak Naik (T) 0, BGM 0, Stunting 0"
lan="Oktober: Sasaran lansia 30, Kunjungan lansia 22 | November: Sasaran lansia 30, Kunjungan lansia 25"
d=[{"n":"LP-2026-10-001","tk":"20/10/2026 15:02:17","thn":"2026","bln":"Oktober","kel":"Taipa","pos":"Melati 1","jenis":"Posyandu Balita","tgl":"20 Oktober 2026","kader":"Anu, Tonti","hasil":old,"ver":1,"pdf":True},
{"n":"LP-2026-10-002","tk":"20/10/2026 15:03:12","thn":"2026","bln":"Oktober","kel":"Taipa","pos":"Melati 1","jenis":"Posyandu Balita","tgl":"20 Oktober 2026","kader":"Anu, Tonti","hasil":bal,"ver":2,"pdf":True},
{"n":"LP-2026-10-003","tk":"20/10/2026 16:00:00","thn":"2026","bln":"Oktober","kel":"Mamboro","pos":"Mawar","jenis":"Posyandu Lansia","tgl":"19 Oktober 2026","kader":"Budi","hasil":lan,"ver":1,"pdf":True}]
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({"ok":True,"data":d})+');')
STUB="""window.XLSX={utils:{book_new:()=>({s:[]}),json_to_sheet:r=>({r:r}),book_append_sheet:(w,s,n)=>w.s.push([n,s.r])},writeFile:(w,n)=>{window.__x={w:w,n:n}}};"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},accept_downloads=True)
    pg=ctx.new_page()
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.route('https://script.google.com/**',h)
    pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body=STUB))
    pg.goto('file:///home/claude/laporan-posyandu/pantau.html')
    pg.fill('#lu','a');pg.fill('#lp','b');pg.click('#lb');pg.wait_for_timeout(900)
    print('tanpa revisi:',pg.inner_text('#tot').replace('\n',' '))
    
    
    pg.click('#dx');pg.wait_for_timeout(300)
    x=pg.evaluate('window.__x')
    print(x['n'])
    for n,r in x['w']['s']:
        print(n);[print('  ',json.dumps(o,ensure_ascii=False)) for o in r]
    with pg.expect_download() as dl: pg.click('#dc')
    f=dl.value;f.save_as(S+'/o.csv');print(f.suggested_filename);print(open(S+'/o.csv',encoding='utf-8-sig').read()[:900])
    
    b.close()
