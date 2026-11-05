"""Verify that Firefox can temporarily install the packaged MV3 extension.

Runs in one disposable headless Firefox session. No Twitch messages or KLIPY API
calls are made; this is a browser-load check, not an end-to-end Twitch test.
"""
import json
import os
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.firefox.options import Options


root = Path(__file__).resolve().parents[1]
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
archive = root / "dist" / f"LoopTV-{version}-firefox.zip"
if not archive.exists():
    raise SystemExit("Build Firefox absent : lancer npm run build")

options = Options()
options.add_argument("-headless")
firefox_bin = Path(r"C:\Program Files\Mozilla Firefox\firefox.exe")
if firefox_bin.exists():
    options.binary_location = str(firefox_bin)

driver = webdriver.Firefox(options=options)
try:
    addon_id = driver.install_addon(str(archive), temporary=True)
    assert addon_id == "looptv@shinratenseihc", "Firefox loaded unexpected extension ID"
    print(json.dumps({"firefox_temporary_install": True, "addon_id": addon_id,
                      "browser": driver.capabilities.get("browserVersion"),
                      "mode": "headless; no Twitch messages or API calls"}))
finally:
    driver.quit()
