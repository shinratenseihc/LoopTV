"""Check the GIPHY selection hook against a simulated GIF search page."""
import threading
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
opts = Options()
opts.add_argument("--headless=new")
browser = webdriver.Chrome(options=opts)
try:
    browser.get(f"http://127.0.0.1:{server.server_port}/test/giphy-fixture.html")
    browser.execute_script("""
      window.selections = [];
      window.chrome = { runtime: {
        sendMessage: (message, callback) => {
          if (message.type === 'picker-select') window.selections.push(message);
          callback({ok: true});
        }
      }};
      const script = document.createElement('script');
      script.src = '/giphy-picker.js';
      document.body.append(script);
    """)
    time.sleep(.2)
    assert browser.execute_script("return document.querySelector('#gifrift-giphy-guide') !== null")
    assert browser.execute_script("return document.documentElement.classList.contains('gifrift-compact')")
    assert browser.execute_script("return getComputedStyle(document.querySelector('#distraction')).visibility") == "hidden"
    assert browser.execute_script("return getComputedStyle(document.querySelector('.giphy-grid')).position") == "fixed"
    assert browser.execute_script("return getComputedStyle(document.querySelector('.giphy-grid')).overflowY") == "auto"
    assert browser.execute_script("return getComputedStyle(document.querySelector('.gif-result')).visibility") == "visible"
    browser.find_element("css selector", "a.gif-result img").click()
    time.sleep(.1)
    result = browser.execute_script("return window.selections")
    assert result == [{"type": "picker-select", "id": "cZ7rmKfFYOvYI"}], result
    assert browser.current_url.endswith("/test/giphy-fixture.html"), "Click navigated away"
    print("GIPHY click -> validated ID -> prepared Twitch message: OK")
finally:
    browser.quit()
    server.shutdown()
