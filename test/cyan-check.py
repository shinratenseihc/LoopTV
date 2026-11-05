"""Selenium test for the Cyan Chat content script without Twitch credentials."""
import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=800,700")
browser = webdriver.Chrome(options=options)
try:
    browser.get(f"http://127.0.0.1:{server.server_port}/test/cyan-fixture.html")
    browser.execute_script("""
      const script = document.createElement('script');
      script.src = '/cyan-chat.js';
      document.body.append(script);
    """)
    wait = WebDriverWait(browser, 8)
    js = browser.execute_script
    wait.until(lambda _: js("return document.querySelectorAll('#chat_container img.looptv-cyan-gif').length") == 2)
    assert js("return document.querySelector('#new-marker img').alt") == "LoopTV GIF"
    assert js("return document.querySelector('#legacy-marker img').alt") == "LoopTV GIF"
    assert js("return document.querySelector('#invalid-marker').textContent") == "[ltv:k:123] not a marker"
    assert js("return document.querySelector('#plain-message').textContent") == "Hello"
    assert js("return window.apiCalls.every(call => call.type === 'klipy' && call.action === 'resolve')")
    assert js("return getComputedStyle(document.querySelector('#new-marker img')).maxHeight") == "140px"
    browser.execute_script("""
      const chat = document.querySelector('#chat_container');
      for (let i = 0; i < 40; i++) {
        const line = document.createElement('div');
        line.className = 'chat_line';
        const message = document.createElement('span');
        message.className = 'message';
        message.textContent = '[ltv:k:' + (33000000+i) + ']';
        line.append(message);
        chat.append(line);
      }
    """)
    wait.until(lambda _: js("return document.querySelectorAll('#chat_container img.looptv-cyan-gif').length") == 6)
    assert js("return document.querySelectorAll('#chat_container img.looptv-cyan-gif').length") == 6
    before = js("return window.apiCalls.length")
    browser.execute_script("document.querySelector('#chat_container').append(document.createElement('p'))")
    WebDriverWait(browser, 2).until(lambda _: js("return window.apiCalls.length") >= before)
    assert js("return window.apiCalls.length") == before
    browser.execute_script("document.querySelector('#chat_container').replaceChildren()")
    print(json.dumps({
        "marker_new": "[ltv:k:ID]",
        "marker_legacy": "[gifrift:k:ID]",
        "rendered": 2,
        "max_concurrent_gifs": 6,
        "only_resolve_api": True,
        "unrelated_text_untouched": True
    }))
finally:
    browser.quit()
    server.shutdown()
