import json,base64,numpy as np,cv2
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
S='/tmp/claude-0/-home-claude/fe10d577-2312-5888-ae41-85a674125bb9/scratchpad/'
def h(route):
    q=parse_qs(urlparse(route.request.url).query);cb=q['cb'][0]
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps({'ok':True,'list':[]})+');')
JS="""(args)=>{
  var mk=function(w,h,c){var cv=document.createElement('canvas');cv.width=w;cv.height=h;var x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,w,h);return cv.toDataURL('image/jpeg')};
  var S=window.__t.getS();S.kelurahan='Mamboro';S.posyandu='Mekar';S.kota='Palu';S.lurah='Nama Lurah';
  var ph=[];for(var i=0;i<args.n;i++)ph.push({s:mk(300,args.tall?1000:200,'#8fb','jpeg'),w:300,h:args.tall?1000:200});
  S.rows=[{bulan:'Oktober',photos:ph}];
  var host=document.createElement('div');host.id='uji';host.style.cssText='position:absolute;left:0;top:0;width:816px;background:#ccc;z-index:9999';
  host.innerHTML=window.__t.pagesHtml('kodeA1b2c3');document.body.appendChild(host);window.__t.fitLetter(host);
  var pgs=host.querySelectorAll('.pg'),last=pgs[pgs.length-1],q=last.querySelector('.qrbox'),im=q.querySelector('img');
  var r=last.getBoundingClientRect(),qr=im.getBoundingClientRect(),ql=q.getBoundingClientRect();
  var maxb=0;last.querySelectorAll('.ph,.kv,.sign,.cat,.ph-grid').forEach(function(e){if(e.closest('.qrbox'))return;var b=e.getBoundingClientRect().bottom-r.top;if(b>maxb)maxb=b});
  return {n:pgs.length,h:Math.round(r.height),qrTop:Math.round(ql.top-r.top),qrRight:Math.round(r.right-ql.right),qrW:Math.round(qr.width),isi:Math.round(maxb),src:im.src,url:null}
}"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':900,'height':1400});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/script.google.com/**',h);pg.route('**/script.googleusercontent.com/**',h);pg.route('https://cdnjs.cloudflare.com/**',lambda r:r.abort());pg.route('https://fonts.*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/_uji_qr.html');pg.wait_for_timeout(1200)
    for nm,args in [('foto6',{'n':6,'tall':True}),('foto2',{'n':2,'tall':False}),('tanpa',{'n':0,'tall':False})]:
        pg.evaluate("()=>{var u=document.getElementById('uji');if(u)u.remove()}")
        r=pg.evaluate(JS,args);src=r.pop('src')
        print(nm,r)
        last=pg.locator('#uji .pg').last;last.screenshot(path=S+'qr_%s.png'%nm)
        im=cv2.imdecode(np.frombuffer(base64.b64decode(src.split(',')[1]),np.uint8),cv2.IMREAD_GRAYSCALE)
        v,_,_=cv2.QRCodeDetectorAruco().detectAndDecode(im);print('  isi QR:',v)
        sc=cv2.imread(S+'qr_%s.png'%nm);v2,_,_=cv2.QRCodeDetectorAruco().detectAndDecode(sc);print('  isi QR dari tangkapan halaman:',v2)
    print('errs',errs)
