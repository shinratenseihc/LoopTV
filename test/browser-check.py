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
from selenium.webdriver.common.keys import Keys

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
      window.savedSettings = JSON.parse(localStorage.getItem('looptv-test-settings') || '{}');
      window.chrome = {storage: {local: {
        get: (defaults, callback) => callback({ ...defaults, ...window.savedSettings }),
        set: async values => {
          Object.assign(window.savedSettings, values);
          localStorage.setItem('looptv-test-settings', JSON.stringify(window.savedSettings));
        }
      }}};
    """})
    browser.get(f"http://127.0.0.1:{server.server_port}/popup.html")
    assert browser.find_element("id", "allow-motion").is_selected(), "GIF motion should be enabled by default"
    browser.find_element("id", "allow-motion").click()
    assert browser.execute_script("return window.savedSettings.allowMotion") is False, "User must be able to disable forced GIF motion"
    browser.find_element("id", "enabled").click()
    saved = browser.execute_script("return window.savedSettings.enabled")
    assert saved is False, "Settings were not saved"
    assert browser.execute_script("return !document.querySelector('#panel-gifs').hidden"), "GIF tab should open by default"
    browser.find_element("id", "tab-paints").click()
    assert browser.execute_script("return document.querySelector('#panel-gifs').hidden && !document.querySelector('#panel-paints').hidden"), "Only paint settings should be visible"
    assert browser.execute_script("return window.savedSettings.popupTab") == "paints", "Selected settings tab not saved"
    browser.find_element("id", "tab-paints").send_keys(Keys.ARROW_LEFT)
    assert browser.execute_script("return !document.querySelector('#panel-gifs').hidden"), "ArrowLeft should open the GIF settings tab"
    browser.find_element("id", "tab-gifs").send_keys(Keys.ARROW_RIGHT)
    assert browser.execute_script("return !document.querySelector('#panel-paints').hidden"), "ArrowRight should return to color settings"
    assert browser.execute_script("return getComputedStyle(document.querySelector('#paint-preview-name')).backgroundImage.startsWith('linear-gradient')"), "Paint preview not rendered"
    assert browser.execute_script("return document.querySelectorAll('.paint-palette-choice').length") == 9, "Eight presets plus automatic choice expected"
    browser.find_element("id", "paint-preview-input").send_keys("ShinraTensei")
    assert browser.execute_script("return window.savedSettings.namePaintTarget") == "ShinraTensei", "Name target not saved"
    browser.find_element("css selector", '[data-palette-id="lagoon"]').click()
    assert browser.execute_script("return window.savedSettings.namePaintPalette") == "lagoon", "Selected gradient not saved"
    assert browser.execute_script("return document.querySelector('[data-palette-id=lagoon]').getAttribute('aria-pressed')") == "true", "Palette must be visibly selected"
    assert browser.execute_script("return document.querySelector('#paint-preview-name').style.getPropertyValue('--looptv-name-gradient') === LoopTVNamePaints.gradientFor('ShinraTensei','lagoon')"), "Live palette preview incorrect"
    browser.find_element("id", "name-paints").click()
    assert browser.execute_script("return window.savedSettings.namePaintsEnabled") is False, "Paint preference was not saved"
    assert browser.execute_script("return !document.querySelector('#paint-preview-name').classList.contains('looptv-name-paint')"), "Paint preview off must be unstyled"
    browser.refresh()
    assert browser.execute_script("return document.querySelector('#tab-paints').getAttribute('aria-selected')") == "true", "Current tab must persist across popup reopening"
    assert browser.execute_script("return document.querySelector('#paint-preview-input').value") == "ShinraTensei", "Target username must persist"
    assert not browser.find_element("id", "allow-motion").is_selected(), "Explicitly disabled motion must persist"
    assert browser.execute_script("return document.querySelector('[data-palette-id=lagoon]').getAttribute('aria-pressed')") == "true", "Chosen palette must persist"
    assert browser.execute_script("return document.documentElement.scrollWidth <= window.innerWidth"), "Popup must fit horizontally"
    print(json.dumps({"initial": start, "disabled": off, "stress": loaded, "cleared": cleared, "reduced": reduced}, ensure_ascii=False))
finally:
    browser.quit()
    server.shutdown()
