"""Load the unpacked LoopTV package in Brave and Edge (sequential checks).

No network requests to Twitch/KLIPY or chat messages. Each browser quits before
the next starts, so this cannot pile up test browser processes. Branded Chrome
removed the --load-extension switch in version 137; test it via chrome://extensions.
"""
import json
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions


root = Path(__file__).resolve().parents[1]
unpacked = root / "dist" / "chromium"
assert (unpacked / "manifest.json").exists(), "Build manquant : npm run build"

browsers = [
    ("Brave", Path(r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"), ChromeOptions, webdriver.Chrome),
    ("Edge", Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"), EdgeOptions, webdriver.Edge),
]

# Traverse shadow roots because the Extensions management screen is Web Components.
visible_text = """
const walk = root => {
  let result = root.innerText || root.textContent || '';
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) result += '\\n' + walk(element.shadowRoot);
  }
  return result;
};
return walk(document.documentElement);
"""

for name, binary, option_class, factory in browsers:
    if not binary.exists():
        print(json.dumps({"browser": name, "skipped": "not installed"}))
        continue
    opts = option_class()
    opts.binary_location = str(binary)
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1100,900")
    opts.add_argument("--no-first-run")
    opts.add_argument("--disable-extensions-except=" + str(unpacked))
    opts.add_argument("--load-extension=" + str(unpacked))
    browser = factory(options=opts)
    try:
        browser.get("edge://extensions" if name == "Edge" else "chrome://extensions")
        text = ""
        for _ in range(10):
            text = browser.execute_script(visible_text)
            if "LoopTV" in text:
                break
            time.sleep(0.5)
        if "LoopTV" not in text:
            print(json.dumps({"browser": name, "page_title": browser.title,
                              "page_url": browser.current_url,
                              "extensions_page_text_preview": text[:400]}, ensure_ascii=False))
            raise AssertionError(name + " did not list LoopTV in the extension manager")
        worker_seen = False
        for _ in range(8):
            targets = browser.execute_cdp_cmd("Target.getTargets", {})["targetInfos"]
            worker_seen = any(t.get("type") == "service_worker" and
                              t.get("url", "").endswith("/background.js") for t in targets)
            if worker_seen:
                break
            time.sleep(0.25)
        assert worker_seen, name + " did not start the LoopTV background service worker"
        print(json.dumps({"browser": name, "version": browser.capabilities.get("browserVersion"),
                          "unpacked_extension_listed": True,
                          "service_worker_started": True,
                          "mode": "headless; no Twitch messages or API calls"}))
    finally:
        browser.quit()
