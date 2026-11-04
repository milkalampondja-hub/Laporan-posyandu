import sys,io
sys.path.insert(0,'.')
import pantau_mock as M
from pantau_mock import *
import openpyxl
# templat: ekspor lalu ubah
def buat(path):
    wb=openpyxl.Workbook();ws=wb.active
    hdr=['Nama Posyandu','Kelurahan','Jenis (Balita/Lansia)','Alamat','Puskesmas','Ketua/Penanggung Jawab','Nomor HP','Jadwal Kegiatan','Status (Aktif/Nonaktif)','Kader (pisahkan dengan titik koma; format: Nama - Jabatan)','Nama lama (isi hanya jika ganti nama)']
    ws.append(hdr)
    S=[x for x in M.SEED]
    for i,x in enumerate(S):
        pass
        nama=x['nama']+(' Merah' if i==0 else '');lama=''
        if i==1: nama=x['nama']+' Indah';lama=x['nama']
        kader='; '.join((k['nama']+(' - '+k['jabatan'] if k.get('jabatan') else '')) for k in x.get('kader',[]))
        if i==2: kader='Kader Pengganti - Ketua'
        ws.append([nama,x['kel'],'Balita' if 'Balita' in x['jenis'] else 'Lansia','','',x.get('ketua',''),x.get('hp',''),'', 'Aktif',kader,lama])
    ws.append(['Posyandu Uji Baru','Taipa','Lansia','','','Hasna','0853','','Aktif','Hasna - Ketua',''])
    wb.save(path)
buat('/tmp/impor_uji.xlsx')
import csv
wbk=openpyxl.load_workbook('/tmp/impor_uji.xlsx');w=wbk.active
with open('/tmp/impor_uji.csv','w',newline='',encoding='utf-8') as f:
    csv.writer(f).writerows([[('' if c is None else c) for c in r] for r in w.iter_rows(values_only=True)])
STUB='''window.XLSX={read:function(b){var t=new TextDecoder().decode(new Uint8Array(b));return {SheetNames:['a'],Sheets:{a:t}};},utils:{sheet_to_json:function(t){var rows=[],cur=[],f='',q=false,i=0;for(;i<t.length;i++){var c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){cur.push(f);f=''}else if(c=='\\n'||c=='\\r'){if(c=='\\r'&&t[i+1]=='\\n')i++;cur.push(f);f='';rows.push(cur);cur=[]}else f+=c}if(f||cur.length){cur.push(f);rows.push(cur)}var h=rows[0];return rows.slice(1).filter(function(r){return r.join('')}).map(function(r){var o={};h.forEach(function(k,j){o[k]=r[j]==null?'':r[j]});return o})}}};'''
IMG='desain/img/'
def jalan(fitur):
    M.FITUR=fitur
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx=b.new_context(viewport={'width':1280,'height':1000});pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        ctx.route('https://cdnjs.cloudflare.com/**',lambda r:r.fulfill(content_type='application/javascript',body=STUB));ctx.route('**/script.google.com/**',M.h);ctx.route('**/script.googleusercontent.com/**',M.h)
        pg.goto('http://localhost:8765/pantau.html');pg.wait_for_timeout(500)
        pg.fill('#lu','admin');pg.fill('#lp','rahasia');pg.click('#lb');pg.wait_for_timeout(3500)
        pg.evaluate("tampilView('d')");pg.wait_for_timeout(500)
        print('fitur',fitur,'toolbar:',pg.locator('#dpTool button').all_inner_texts())
        pg.click('#dpTool button.hl-ubah');pg.wait_for_timeout(300)
        pg.screenshot(path=IMG+'n11_pilih.png')
        pg.click('text=Mulai dari Excel');pg.wait_for_timeout(300)
        pg.set_input_files('#impPos','/tmp/impor_uji.csv');pg.wait_for_timeout(800)
        print(pg.locator('.ist').inner_text().replace('\n',' '))
        print('warn:',pg.locator('#dpUbah .warn2').all_inner_texts())
        pg.locator('#dpUbah').screenshot(path=IMG+'n11_pratinjau_mirip.png')
        if fitur:
            pg.locator('input[name=konfirmasi-impor]').click();pg.keyboard.type('salah');pg.click('text=/Terapkan/');pg.wait_for_timeout(200)
            print('salah:',pg.locator('#dpUbah .st').inner_text())
            pg.locator('input[name=konfirmasi-impor]').click();pg.keyboard.type('rahasia');pg.click('text=/Terapkan/');pg.wait_for_timeout(800)
            print('setelah terapkan, dpUbah kosong:',pg.locator('#dpUbah').inner_text()=='' ,'| stat:',pg.inner_text('#dpStat').replace('\n',' '))
            ren=[x for x in M.st['list'] if x.get('alias')] if hasattr(M,'st') else None
            print('alias tersimpan:',[(x['nama'],x['alias']) for x in (ren or [])][:2])
        print('errs',errs);b.close()
jalan(False)
