"""Local browser smoke and resource check. Uses preinstalled Selenium."""
import json
import time
import threading
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=650,850")
options.add_argument("--force-prefers-reduced-motion=no-preference")
root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
browser = webdriver.Chrome(options=options)
try:
    browser.get(f"http://127.0.0.1:{server.server_port}/demo.html")
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {
        "features": [{"name": "prefers-reduced-motion", "value": "no-preference"}]
    })
    browser.refresh()
    time.sleep(0.3)
    def inspect():
        return browser.execute_script("""
          return {
            images: document.querySelectorAll('.gifrift-image').length,
            messages: document.querySelectorAll('.message').length,
            broken: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).length,
            stats: document.querySelector('#stats').textContent,
            heap: performance.memory?.usedJSHeapSize ?? null
          }
        """)
    start = inspect()
    assert start["images"] == 1 and start["broken"] == 0, start
    browser.find_element("id", "enabled").click()
    off = inspect()
    assert off["images"] == 0, off
    browser.find_element("id", "enabled").click()
    assert inspect()["images"] == 1
    browser.find_element("id", "stress").click()
    time.sleep(0.1)
    loaded = inspect()
    assert loaded["messages"] == 103 and loaded["images"] == 6 and loaded["broken"] == 0, loaded
    browser.find_element("id", "clear").click()
    cleared = inspect()
    assert cleared["images"] == 0 and cleared["messages"] == 0, cleared
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {
        "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]
    })
    browser.find_element("id", "add").click()
    reduced = inspect()
    assert reduced["images"] == 0, reduced
    browser.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": """
      window.savedSettings = {};
      window.chrome = {storage: {local: {
        get: (_defaults, callback) => callback({enabled: true, allowMotion: false, namePaintsEnabled: true}),
        set: async values => { Object.assign(window.savedSettings, values); }
      }}};
    """})
    browser.get(f"http://127.0.0.1:{server.server_port}/popup.html")
    browser.find_element("id", "enabled").click()
    saved = browser.execute_script("return window.savedSettings.enabled")
    assert saved is False, "Settings were not saved"
    assert browser.execute_script("return getComputedStyle(document.querySelector('#paint-preview-name')).backgroundImage.startsWith('linear-gradient')"), "Paint preview not rendered"
    browser.find_element("id", "name-paints").click()
    assert browser.execute_script("return window.savedSettings.namePaintsEnabled") is False, "Paint preference was not saved"
    assert browser.execute_script("return !document.querySelector('#paint-preview-name').classList.contains('looptv-name-paint')"), "Paint preview off must be unstyled"
    print(json.dumps({"initial": start, "disabled": off, "stress": loaded, "cleared": cleared, "reduced": reduced}, ensure_ascii=False))
finally:
    browser.quit()
    server.shutdown()
