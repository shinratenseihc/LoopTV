"""Offline Chrome check of GIFRIFT's active Twitch content script + controlled Slate editor."""
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
opts.add_argument("--window-size=1200,1100")
browser = webdriver.Chrome(options=opts)
id = "1234567890123456"
try:
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {
        "features": [{"name": "prefers-reduced-motion", "value": "no-preference"}]
    })
    browser.get(f"http://127.0.0.1:{server.server_port}/test/twitch-fixture.html")
    browser.execute_script("""
      window.apiRequests = [];
      const entry = (id, title = 'KLIPY GIF') => ({
        id: String(id), title, preview:'/assets/demo.gif',
        media:'/assets/demo.gif', width:220, height:110, source:'Creator'
      });
      window.chrome = {
        runtime: {
          getURL: name => '/'+name,
          sendMessage: (message, callback) => {
            window.apiRequests.push(message);
            if (message.action === 'resolve') {
              callback({gifs:message.ids.map(id => entry(id))});
              return;
            }
            if (message.action !== 'browse') return callback({error:'invalid-action'});
            if (message.query === 'slow') {
              setTimeout(() => callback({gifs:[entry('3333333333333333','SLOW RESULT')],next:''}), 700);
              return;
            }
            if (message.query === 'fast') return callback({gifs:[entry('4444444444444444','FAST RESULT')],next:''});
            if (message.query === 'cat') return callback({gifs:[entry('2222222222222222','CAT RESULT')],next:''});
            if (message.pos === '12') return callback({gifs:Array.from({length:6}, (_,i) => entry('9876543210'+String(i).padStart(6,'0'))),next:''});
            callback({gifs:Array.from({length:12}, (_,i) => entry('1234567890'+String(i).padStart(6,'0'))),next:'12'});
          }
        },
        storage: {
          local: {get: (defaults, callback) => callback({...defaults,enabled:true})},
          onChanged: {addListener:listener => window.notifyStorage=listener}
        }
      };
      const paints=document.createElement('script');
      paints.src='/name-paints.js';
      paints.onload=()=>{const script=document.createElement('script');script.src='/twitch.js';document.body.append(script);};
      document.body.append(paints);
    """)
    time.sleep(.3)
    js = lambda statement: browser.execute_script("return " + statement)
    count = lambda: js("document.querySelectorAll('.gifrift-media').length")
    assert count() == 1, "Original demo should still render"
    assert js("[...document.querySelectorAll('#fixture-chat .text-fragment')].find(el=>el.textContent==='[gifrift:demo]').hidden") is True
    assert js("document.querySelectorAll('.gifrift-button').length") == 1
    assert js("document.querySelector('.gifrift-button').nextElementSibling.contains(document.querySelector('[data-a-target=chat-send-button]'))"), "GIF must be the left sibling of Chat inside its own group"
    assert js("document.querySelector('.gifrift-button').parentElement.classList.contains('gifrift-send-group')"), "GIF and Chat must form one wrapping group"
    assert js("Math.abs(document.querySelector('.gifrift-button').getBoundingClientRect().top - document.querySelector('[data-a-target=chat-send-button]').getBoundingClientRect().top) < 1"), "GIF must be on the SAME ROW as Chat"
    assert js("document.querySelector('.gifrift-button').getBoundingClientRect().right < document.querySelector('[data-a-target=chat-send-button]').getBoundingClientRect().left"), "GIF must be LEFT of Chat"
    assert js("document.querySelector('.gifrift-button').getBoundingClientRect().top < document.querySelector('.shield-mode-shortcut__btn').getBoundingClientRect().top"), "GIF+Chat should be above moderation in wrap-reverse Twitch"
    assert js("getComputedStyle(document.querySelector('.gifrift-button')).height") == "32px"
    assert js("getComputedStyle(document.querySelector('.gifrift-button')).borderRadius") == "9000px"
    assert js("getComputedStyle(document.querySelector('.gifrift-button')).backgroundColor") == "rgb(145, 71, 255)"

    assert js("document.querySelectorAll('.looptv-name-paint').length") == 3
    assert js("!document.querySelector('#paint-row .chat-line__username').classList.contains('looptv-name-paint')"), "Never apply paint to both Twitch username wrapper and leaf"
    assert js("document.querySelectorAll('#paint-row .looptv-name-paint').length") == 1, "One painted element per author"
    assert js("document.querySelector('#paint-row-alt [data-a-target=chat-message-username]').style.getPropertyValue('--looptv-name-gradient')") == js("LoopTVNamePaints.gradientFor('Viewer123','auto','rgb(0, 128, 255)')"), "Use computed CSS color when no inline color exists"
    assert js("document.querySelector('#paint-row-legacy .chat-line__username').classList.contains('looptv-name-paint')"), "Support legacy markup with username wrapper only"
    assert js("getComputedStyle(document.querySelector('#paint-row .chat-author__display-name')).backgroundImage.startsWith('linear-gradient')")
    assert js("getComputedStyle(document.querySelector('#paint-row .chat-author__display-name')).webkitTextFillColor") == "rgba(0, 0, 0, 0)"
    assert js("!document.querySelector('#paint-row .text-fragment').classList.contains('looptv-name-paint')"), "Message body must not be painted"
    assert js("document.querySelector('#paint-row .chat-author__display-name').classList.contains('looptv-name-paint-motion')"), "Name paints must animate by default"
    assert js("getComputedStyle(document.querySelector('#paint-row .chat-author__display-name')).animationName") == "looptv-name-flow"
    assert browser.execute_script("""
      const node = document.querySelector('#paint-row .chat-author__display-name');
      const animation = node.getAnimations().find(item => item.animationName === 'looptv-name-flow');
      if (!animation) return false;
      animation.pause();
      animation.currentTime = 100;
      const a = getComputedStyle(node).backgroundPosition;
      animation.currentTime = 2300;
      const b = getComputedStyle(node).backgroundPosition;
      animation.play();
      return a !== b;
    """), "Animated paint must change actual background position, not just set a class"
    assert js("document.querySelector('#paint-row .chat-author__display-name').style.color") == 'rgb(255, 0, 0)', "Must preserve Twitch's native name color"
    assert js("document.querySelector('#paint-row .chat-author__display-name').style.getPropertyValue('--looptv-name-gradient')") == js("LoopTVNamePaints.gradientFor('ShinraTensei','auto','rgb(255, 0, 0)')"), "Twitch's native color must determine the shared automatic gradient"
    other_before = js("document.querySelector('#paint-row-alt [data-a-target=chat-message-username]').style.getPropertyValue('--looptv-name-gradient')")
    browser.execute_script("window.notifyStorage({namePaintTarget:{newValue:'shinratensei'},namePaintPalette:{newValue:'lagoon'}},'local')")
    time.sleep(.1)
    assert js("document.querySelector('#paint-row .chat-author__display-name').style.getPropertyValue('--looptv-name-gradient')") == js("LoopTVNamePaints.gradientFor('ShinraTensei','lagoon')"), "Chosen palette applies to the selected name"
    assert js("document.querySelector('#paint-row-alt [data-a-target=chat-message-username]').style.getPropertyValue('--looptv-name-gradient')") == other_before, "Other names keep their existing paints"
    browser.execute_script("window.notifyStorage({namePaintPalette:{newValue:'plasma'}},'local')")
    time.sleep(.1)
    assert js("document.querySelector('#paint-row .chat-author__display-name').classList.contains('looptv-name-paint-glow')"), "Selected neon paint should glow"
    browser.execute_script("window.notifyStorage({namePaintPalette:{newValue:'auto'}},'local')")
    time.sleep(.1)
    assert js("document.querySelector('#paint-row .chat-author__display-name').style.getPropertyValue('--looptv-name-gradient')") == js("LoopTVNamePaints.gradientFor('ShinraTensei','auto','rgb(255, 0, 0)')"), "Auto restores shared Twitch-derived palette"
    browser.execute_script("document.querySelector('#paint-row .chat-author__display-name').style.color='rgb(0, 0, 255)'; document.body.append(document.createElement('hr'))")
    time.sleep(.1)
    assert js("document.querySelector('#paint-row .chat-author__display-name').style.getPropertyValue('--looptv-name-gradient')") == js("LoopTVNamePaints.gradientFor('ShinraTensei','auto','rgb(0, 0, 255)')"), "Twitch color updates the gradient without another service"
    browser.execute_script("document.querySelector('#paint-row .chat-author__display-name').style.color='rgb(255, 0, 0)'; document.body.append(document.createElement('hr'))")
    browser.execute_script("window.notifyStorage({namePaintsAnimated:{newValue:false}},'local')")
    time.sleep(.1)
    assert js("!document.querySelector('#paint-row .chat-author__display-name').classList.contains('looptv-name-paint-motion')"), "Motion toggle must stop gradients"
    browser.execute_script("window.notifyStorage({namePaintsAnimated:{newValue:true}},'local')")
    time.sleep(.1)
    assert js("document.querySelector('#paint-row .chat-author__display-name').classList.contains('looptv-name-paint-motion')")
    browser.execute_script("window.notifyStorage({namePaintsEnabled:{newValue:false}},'local')")
    time.sleep(.1)
    assert js("document.querySelectorAll('.looptv-name-paint').length") == 0, "Opt-out must remove paint styling"
    browser.execute_script("window.notifyStorage({namePaintsEnabled:{newValue:true},namePaintsAnimated:{newValue:false}},'local')")
    time.sleep(.1)
    assert js("document.querySelectorAll('.looptv-name-paint').length") == 3
    browser.execute_script("document.querySelector('#paint-row .chat-author__display-name').textContent='NewName'")
    time.sleep(.1)
    assert js("document.querySelector('#paint-row .chat-author__display-name').dataset.looptvPaintName") == "NewName", "Recycled rows need a fresh gradient"

    browser.find_element("css selector", ".gifrift-button").click()
    time.sleep(.2)
    assert js("document.querySelector('.gifrift-picker').hidden") is False
    assert js("document.querySelector('.gifrift-search').placeholder") == "Search KLIPY"
    assert js("document.querySelector('.gifrift-attribution').textContent") == "Powered by KLIPY"
    assert abs(js("document.querySelector('.gifrift-picker').getBoundingClientRect().width - document.querySelector('.chat-input').getBoundingClientRect().width")) < 2
    assert js("getComputedStyle(document.querySelector('.gifrift-picker-grid')).overflowY") == "auto"
    assert js("document.querySelectorAll('.gifrift-choice').length") == 12

    assert js("document.querySelector('.gifrift-picker-grid').scrollHeight > document.querySelector('.gifrift-picker-grid').clientHeight"), "Result grid must be scrollable"
    browser.execute_script("document.querySelector('.gifrift-picker-grid').scrollTop = 200")
    assert js("document.querySelector('.gifrift-picker-grid').scrollTop") > 0
    browser.find_element("css selector", ".gifrift-more").click()
    time.sleep(.1)
    assert js("document.querySelectorAll('.gifrift-choice').length") == 18, "Pagination should append only on demand"
    assert js("window.apiRequests.filter(x=>x.action==='browse' && x.pos==='12').length") == 1

    search = browser.find_element("css selector", ".gifrift-search")
    search.send_keys("slow")
    time.sleep(.5)
    search.send_keys(Keys.CONTROL, "a")
    search.send_keys("fast")
    time.sleep(.55)
    assert js("document.querySelector('.gifrift-choice img')?.alt") == "FAST RESULT", "Stale responses must not replace new search"
    time.sleep(.3)
    assert js("document.querySelector('.gifrift-choice img')?.alt") == "FAST RESULT"
    search.send_keys(Keys.CONTROL, "a")
    search.send_keys("cat")
    time.sleep(.55)
    assert js("document.querySelector('.gifrift-choice img')?.alt") == "CAT RESULT"

    # An existing draft must stay untouched.
    browser.execute_script("""
      window.fixtureState.text='already written';
      document.querySelector('[data-slate-leaf]').textContent='already written';
    """)
    browser.find_element("css selector", ".gifrift-choice").click()
    assert js("window.fixtureState.text") == "already written"
    assert js("document.querySelector('.gifrift-picker').hidden") is False
    browser.execute_script("""
      window.fixtureState.text='';
      document.querySelector('[data-slate-leaf]').textContent='\uFEFF';
    """)
    browser.find_element("css selector", ".gifrift-choice").click()
    time.sleep(.1)
    marker = "[ltv:k:2222222222222222]"
    assert js("window.fixtureState.text") == marker, "Slate model was not updated"
    assert js("document.querySelector('.gifrift-picker').hidden") is True
    browser.find_element("css selector", '[data-a-target="chat-input"]').send_keys(Keys.ENTER)
    assert js("window.fixtureState.submitted") == [marker], "Enter did not send marker"

    browser.execute_script("""
      const frag = document.createDocumentFragment();
      for (let n=0;n<100;n++) {
        const row=document.createElement('div');
        row.className='chat-line__message';
        const outer=document.createElement('span');
        outer.className='chat-line__username';
        const author=document.createElement('span');
        author.className='chat-author__display-name';
        author.textContent='Viewer'+n;
        author.style.color=n%2 ? 'rgb(255,105,180)' : 'rgb(100,150,255)';
        outer.append(author);
        const text=document.createElement('span');
        text.className='text-fragment';
        text.textContent=n%2 ? 'message normal' : '[gifrift:k:1234567890123456]';
        row.append(outer,text);frag.append(row);
      }
      document.querySelector('#fixture-chat').append(frag);
    """)
    time.sleep(.3)
    assert count() == 6, ("max six GIFs", count())
    assert js("document.querySelectorAll('#fixture-chat .looptv-name-paint').length") == 103, "100 busy-chat usernames must be painted once each"
    assert js("document.querySelectorAll('#fixture-chat .chat-line__username.looptv-name-paint').length") == 1, "Do not paint nested wrappers during chat bursts"
    before = js("window.apiRequests.filter(x=>x.action==='resolve').length")
    browser.execute_script("document.querySelector('#fixture-chat').append(document.createElement('p'))")
    time.sleep(.2)
    after = js("window.apiRequests.filter(x=>x.action==='resolve').length")
    assert before == after, "MutationObserver is repeating already resolved requests"

    browser.execute_script("document.querySelector('#fixture-chat').replaceChildren()")
    time.sleep(.2)
    assert count() == 0, "Deleting messages must delete images"
    assert js("document.querySelectorAll('#fixture-chat .looptv-name-paint').length") == 0, "Removed users must not leave paint nodes behind"
    browser.execute_script("""
      const row=document.createElement('div');
      row.className='chat-line__message';
      const author=document.createElement('span');
      author.className='chat-author__display-name';
      author.textContent='ShinraTensei';
      const text=document.createElement('span');
      text.className='text-fragment';
      text.textContent='[gifrift:k:1234567890123456]';
      row.append(author,text);
      document.querySelector('#fixture-chat').append(row);
    """)
    time.sleep(.2)
    assert count() == 1
    assert js("document.querySelector('#fixture-chat .text-fragment').hidden") is True
    browser.execute_script("window.notifyStorage({enabled:{newValue:false}},'local')")
    time.sleep(.2)
    assert count() == 0
    assert js("document.querySelector('#fixture-chat .text-fragment').hidden") is False
    browser.execute_script("window.notifyStorage({enabled:{newValue:true}},'local')")
    time.sleep(.2)
    assert count() == 1
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {
        "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]
    })
    time.sleep(.2)
    assert count() == 1, "GIFs must animate by default even when Windows reduces motion"
    browser.execute_script("window.notifyStorage({namePaintsAnimated:{newValue:true}},'local')")
    time.sleep(.1)
    assert js("document.querySelector('#fixture-chat .chat-author__display-name').classList.contains('looptv-name-paint-motion')"), "Explicit Name Paint animation setting overrides Windows reduced motion"
    assert js("getComputedStyle(document.querySelector('#fixture-chat .chat-author__display-name')).animationName") == "looptv-name-flow"
    browser.execute_script("window.notifyStorage({namePaintsAnimated:{newValue:false}},'local')")
    time.sleep(.1)
    assert js("getComputedStyle(document.querySelector('#fixture-chat .chat-author__display-name')).animationName") == "none", "User's motion opt-out always works"
    browser.execute_script("window.notifyStorage({allowMotion:{newValue:false}},'local')")
    time.sleep(.2)
    assert count() == 0, "Explicit user motion opt-out must still work"
    browser.execute_script("window.notifyStorage({allowMotion:{newValue:true}},'local')")
    time.sleep(.2)
    assert count() == 1, "Re-enabling GIF motion must restore animations"
    browser.execute_script("history.replaceState({},'', '/anotherchannel'); document.body.append(document.createElement('hr'));")
    time.sleep(.2)
    assert js("document.querySelector('.gifrift-picker').hidden") is True
    print(json.dumps({"picker":"integrated", "page_count":18, "slate":"enter works", "max_gifs":6,
        "deletion":True, "motion":True, "channel_change":True, "stale_search":True,
        "draft_preserved":True, "name_paints":"selectable local palettes + native Twitch color + opt-out + motion"}, ensure_ascii=False))
finally:
    browser.quit()
    server.shutdown()
