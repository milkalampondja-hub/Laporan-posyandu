exec(open('t33.py').read().split("st={'res':{}}")[0])
st={'res':{}}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('**/script.google.com/**',h);ctx.route('**/script.googleusercontent.com/**',h)
    pg.goto('http://localhost:8765/terima.html#u=petugas&p=rahasia');pg.wait_for_timeout(2500)
    print('langsung masuk:',pg.locator('#app').is_visible(),pg.locator('#login').is_visible(),'| alamat:',pg.url,'| ringkasan',pg.inner_text('#sT'))
    pg.goto('http://localhost:8765/terima.html');pg.wait_for_timeout(2000)
    print('buka lagi tanpa tautan:',pg.locator('#app').is_visible())
    pg.goto('http://localhost:8765/terima.html#u=petugas&p=SALAH');pg.reload();pg.wait_for_timeout(2500)
    print('tautan salah/dicabut -> kembali ke login:',pg.locator('#login').is_visible(),pg.inner_text('#lerr'))
    print(errs)
