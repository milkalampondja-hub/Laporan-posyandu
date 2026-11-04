from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page()
    pg.route('**/cdn.jsdelivr.net/**',lambda r:r.abort());pg.route('**/unpkg.com/**',lambda r:r.abort())
    pg.route('**/script.google.com/**',lambda r:r.abort())
    pg.add_init_script("delete window.BarcodeDetector")
    pg.goto('http://localhost:8765/terima.html');pg.wait_for_timeout(2500)
    print(pg.evaluate("typeof muatJsQR"));print(pg.evaluate("muatJsQR().then(()=>typeof window.jsQR).catch(e=>String(e))"))
