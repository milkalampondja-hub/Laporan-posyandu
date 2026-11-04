import sys
sys.path.insert(0,'.')
from pantau_mock import *
import pantau_mock as M
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');ctx=b.new_context(viewport={'width':1280,'height':800})
    pg=ctx.new_page();ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
    print(pg.evaluate("typeof ambil+' '+JSON.stringify(ambil({jenis:'Posyandu Balita',bln:'Oktober',hasil:'Oktober Sasaran Bayi Balita (S) 90, Kunjungan (D) 60, BGM 2'})[0].v)"))
