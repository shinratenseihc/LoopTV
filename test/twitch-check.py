"""Test local du script Twitch sur un DOM simulé, sans messages réels."""
import json
import threading
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
opts = Options()
opts.add_argument("--headless=new")
browser = webdriver.Chrome(options=opts)
try:
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {
        "features": [{"name": "prefers-reduced-motion", "value": "no-preference"}]
    })
    browser.get(f"http://127.0.0.1:{server.server_port}/test/twitch-fixture.html")
    browser.execute_script("""
      window.chrome = {
        runtime: {
          getURL: name => '/'+name,
          sendMessage: (message, callback) => {
            window.openedPicker = message;
            callback({ok: true});
          },
          onMessage: {addListener: listener => window.twitchMessageHandler = listener}
        },
        storage: {
          local: {get: (_, callback) => callback({enabled: true})},
          onChanged: {addListener: listener => window.notifyStorage = listener}
        }
      };
    """)
    browser.execute_script("""
      const el = document.createElement('script');
      el.src = '/twitch.js';
      document.body.append(el);
    """)
    time.sleep(.3)
    def count():
        return browser.execute_script("return document.querySelectorAll('.gifrift-media').length")
    assert count() == 1, ("first marker", count())
    assert browser.execute_script("return document.querySelector('#fixture-chat .text-fragment').hidden") is True, "marker stays visible"
    assert browser.execute_script("return document.querySelectorAll('.gifrift-button').length") == 1
    assert browser.execute_script("return document.querySelector('[data-test-selector=chat-input-buttons-container] > .gifrift-button') !== null")
    assert browser.execute_script("return document.querySelector('[data-a-target=chat-input] .gifrift-button') === null")
    browser.find_element("css selector", ".gifrift-button").click()
    time.sleep(.1)
    assert browser.execute_script("return window.openedPicker?.type === 'open-giphy'"), "GIPHY window not requested"
    browser.execute_script("""
      window.twitchMessageHandler(
        {type:'gifrift-insert', id:'cZ7rmKfFYOvYI'},
        {},
        response => window.insertResponse = response
      );
    """)
    time.sleep(.1)
    assert browser.execute_script("return document.querySelector('[data-a-target=chat-input]').textContent.includes('[gifrift:g:cZ7rmKfFYOvYI]')")
    assert browser.execute_script("return window.fixtureState.text") == "[gifrift:g:cZ7rmKfFYOvYI]", "Slate model not updated"
    assert browser.execute_script("return window.insertResponse?.ok === true")
    browser.find_element("css selector", '[data-a-target="chat-input"]').send_keys(Keys.ENTER)
    assert browser.execute_script("return window.fixtureState.submitted") == ["[gifrift:g:cZ7rmKfFYOvYI]"], "Enter did not submit"
    time.sleep(.55)
    browser.execute_script("""
      window.twitchMessageHandler(
        {type:'gifrift-insert', id:'cZ7rmKfFYOvYI'},
        {},
        response => window.insertResponse = response
      );
    """)
    assert browser.execute_script("return window.fixtureState.text") == "[gifrift:g:cZ7rmKfFYOvYI]", "Cannot insert again after Enter"
    browser.execute_script("""
      window.chrome.runtime.sendMessage = (_, callback) => callback({error:'window'});
    """)
    browser.find_element("css selector", ".gifrift-button").click()
    assert browser.execute_script("return document.querySelector('.gifrift-picker')?.hidden === false"), "Manual link fallback did not open"
    field = browser.find_element("css selector", ".gifrift-picker input")
    field.send_keys("https://example.org/bad.gif")
    assert browser.find_element("css selector", ".gifrift-insert").get_attribute("disabled") is not None
    field.clear()
    field.send_keys("https://giphy.com/gifs/funny-hello-cZ7rmKfFYOvYI")
    assert browser.find_element("css selector", ".gifrift-insert").get_attribute("disabled") is None
    browser.execute_script("""
      const frag = document.createDocumentFragment();
      for(let n=0;n<100;n++) {
        const row=document.createElement('div');
        row.className='chat-line__message';
        const msg=document.createElement('span');
        msg.className='text-fragment';
        msg.textContent = n%2 ? 'message courant' : '[gifrift:demo]';
        row.append(msg);
        frag.append(row);
      }
      document.querySelector('#fixture-chat').append(frag);
    """)
    time.sleep(.3)
    assert count() == 6, ("limit", count())
    browser.execute_script("""
      document.querySelector('#fixture-chat').replaceChildren();
    """)
    time.sleep(.2)
    assert count() == 0, ("deleted messages", count())
    browser.execute_script("""
      const row=document.createElement('div');
      row.className='chat-line__message';
      const fragment=document.createElement('span');
      fragment.className='text-fragment';
      fragment.textContent='[gifrift:g:cZ7rmKfFYOvYI]';
      row.append(fragment);
      document.querySelector('#fixture-chat').append(row);
    """)
    time.sleep(.2)
    assert count() == 1
    assert browser.execute_script("return document.querySelector('#fixture-chat .text-fragment').hidden") is True
    browser.execute_script("window.notifyStorage({enabled:{newValue:false}}, 'local')")
    time.sleep(.2)
    assert count() == 0, ("disable", count())
    assert browser.execute_script("return document.querySelector('#fixture-chat .text-fragment').hidden") is False, "marker not restored"
    browser.execute_script("window.notifyStorage({enabled:{newValue:true}}, 'local')")
    time.sleep(.2)
    assert count() == 1, ("enable", count())
    assert browser.execute_script("return document.querySelector('#fixture-chat .text-fragment').hidden") is True
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {
        "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]
    })
    time.sleep(.2)
    assert count() == 0, ("reduced motion", count())
    assert browser.execute_script("return document.querySelector('#fixture-chat .text-fragment').hidden") is False
    browser.execute_script("window.notifyStorage({allowMotion:{newValue:true}}, 'local')")
    time.sleep(.2)
    assert count() == 1, ("explicit motion override", count())
    browser.execute_script("window.notifyStorage({allowMotion:{newValue:false}}, 'local')")
    time.sleep(.2)
    assert count() == 0, ("restore system preference", count())
    print(json.dumps({"simulated_messages":100,"max_gifs":6,"deletion":True,"toggle":True,"reduced_motion":True,"motion_override":True}))
finally:
    browser.quit()
    server.shutdown()
