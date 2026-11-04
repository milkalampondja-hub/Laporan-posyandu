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
PERAN='utama';AS=[]
FITUR=True
SEED=json.loads(open('/home/claude/laporan-posyandu/seed-posyandu.js',encoding='utf-8').read().split('=',1)[1].rstrip().rstrip(';'))
RUANG={'pdf':310*1048576,'sk':18*1048576,'cadangan':4*1048576,'lain':2*1048576,'nPdf':152,'sebagian':False,'pakai':3.4*1073741824,'batas':15*1073741824,'tgl':1761900000000}
CAD=[{'id':'a1','tgl':'2026-10-26','ukuran':420000},{'id':'a2','tgl':'2026-10-19','ukuran':415000}]
st={'pw':'rahasia','res':{},'list':SEED,'ban':['','',''],'batas':8,'sk':{}}
LEM=[];KUN={}
MINI=__import__('base64').b64encode(b'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]>>endobj\ntrailer<</Root 1 0 R/Size 4>>\n%%EOF').decode()
log=[];SET={'2026-10':{'p5':'2026-10-30'}}
def h(route):
    r=route.request
    if r.method=='POST':
        body=urllib.parse.parse_qs(r.post_data or '');d=json.loads(body['data'][0])
        log.append({k:(v if len(str(v))<80 else '<%d>'%len(str(v))) for k,v in d.items()})
        out={'ok':True}
        if d['aksi']=='ruang': out={'ok':True,'ruang':dict(RUANG,tgl=1761990000000,pdf=320*1048576)}
        elif d['aksi']=='cadang': out={'ok':True,'cadangan':[{'id':'a0','tgl':'2026-11-01','ukuran':430000}]+CAD}
        elif d['aksi']=='nomor':
            for x in st['list']:
                if x['id']==d['id']: x['hp']=d['hp'];x['hpJenis']=d['hpJenis'];x['hpNama']=d['hpNama']
            out={'ok':True,'list':[x for x in st['list'] if PERAN=='utama' or x['kel']=='Mamboro Barat']}
        elif d['aksi']=='setor':
            m=SET.setdefault(d['per'],{})
            for i in d['ids']:
                (m.__setitem__(i,d['tgl']) if d['tgl'] else m.pop(i,None))
            out={'ok':True,'per':d['per'],'data':m}
        elif d['aksi']=='lembar':
            items=[]
            for x in st['list']:
                if x['kel']!='Mamboro Barat': continue
                ada=[y for y in DATA if y['kel']==x['kel'] and y['pos'].lower()[:8]==x['nama'].lower()[:8] and y['jenis']==x['jenis'] and y['bln']==bl]
                items.append({'pid':x['id'],'nama':x['nama'],'jenis':x['jenis'],'st':('ikut' if ada and x['id'] not in d.get('tahan',[]) else ('tahan' if ada else 'belum')),'nomor':ada[0]['n'] if ada else '','kode':'k','versi':1})
            lm={'kode':'LABCDEFGH234','kel':'Mamboro Barat','per':d['per'],'bln':bl,'thn':str(now.year),'tgl':now.isoformat(),'jam':'09:00','oleh':'Operator','ts':1,'items':items,'ganti':'','diterima':None}
            for o in LEM: o['ganti']='LABCDEFGH234'
            LEM.insert(0,lm)
            for i in items:
                if i['st']=='ikut': KUN[i['pid']]='LABCDEFGH234'
            out={'ok':True,'lembar':lm}
        elif d['aksi']=='bukalaporan': KUN.pop(d['pid'],None);out={'ok':True}
        elif d['aksi']=='pos': st['list']=d['list'];out={'ok':True,'list':d['list']}
        elif d['aksi']=='atur':
            if 'bannerIdx' in d: st['ban'][d['bannerIdx']]=d['banner']
            if 'batas' in d: st['batas']=d['batas']
        elif d['aksi']=='sk': out={'ok':True,'sk':{'Balita':{'id':'abc','tgl':'23/10/2026 05:00','ukuran':3000000}}};st['sk']=out['sk']
        st['res'][d['id']]=out
        return route.fulfill(content_type='text/html',body='<html></html>')
    q=parse_qs(urlparse(r.url).query);cb=q['cb'][0];a=q.get('aksi',[''])[0];AS.append(q.get('as',[''])[0]) if a in('profil','daftar') else 0
    if a=='hasil': out=st['res'].get(q['id'][0],{'ok':False,'tunggu':True})
    elif a=='cek': out={'ok':True}
    elif q.get('p',[''])[0]!=st['pw']: out={'ok':False,'login':False,'pesan':'x'}
    elif a=='profil': out={'ok':True,'nama':'Max Juniar Ratowo','nip':'199306052019081001','jabatan':'','unit':'','foto':'','banners':st['ban'],'batas':st['batas'],'sk':st['sk'],'peran':('admin' if q.get('as') else PERAN),'kel':'Mamboro Barat','admins':[{'u':'robin','nama':'Robin','nip':'','kel':'Taipa','kunci':{'permanen':True,'menit':0}},{'u':'sari','nama':'Sari','nip':'','kel':'Mamboro','kunci':None}],'ruang':RUANG}
    elif a=='lembarkel': out={'ok':True,'per':q['per'][0],'kel':'Mamboro Barat','lembar':[o for o in LEM if o['per']==q['per'][0]],'kunci':KUN}
    elif a=='pdf': out={'ok':True,'nama':'x.pdf','b64':MINI}
    elif a=='setoran': out={'ok':True,'per':q['per'][0],'data':SET.get(q['per'][0],{})}
    elif a=='cadangan': out={'ok':True,'cadangan':CAD}
    elif a=='log': out={'ok':True,'log':[{'t':'24/10/2026 01:10','u':'admin','a':'menambah operator op1 (Kelurahan Mamboro)'}]}
    elif a=='posyandu': out={'ok':True,'list':[x for x in st['list'] if PERAN=='utama' or x['kel']=='Mamboro Barat'],'sk':st['sk'],'fitur':(['alias'] if FITUR else [])}
    else: out={'ok':True,'data':DATA,'peran':('admin' if q.get('as') else PERAN),'kel':'Mamboro Barat'}
    route.fulfill(content_type='application/javascript',body=cb+'('+json.dumps(out)+');')



