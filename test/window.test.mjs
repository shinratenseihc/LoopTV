import { test } from "node:test";
import assert from "node:assert/strict";

let listener, removedListener, session = {}, sent = [], closed = [];
globalThis.chrome = {
  runtime: {
    onMessage: { addListener(fn) { listener = fn; } },
    lastError: null
  },
  storage: {
    session: {
      async set(data) { Object.assign(session, data); },
      async get(key) { return { [key]: session[key] }; },
      async remove(key) { delete session[key]; }
    }
  },
  windows: {
    create(options, callback) {
      assert.equal(options.type, "popup");
      assert.equal(options.url, "https://giphy.com/search/reaction");
      assert.equal(options.width, 390);
      assert.equal(options.height, 610);
      callback({ id: 140 });
    },
    remove(id, callback) { closed.push(id); callback(); },
    onRemoved: { addListener(fn) { removedListener = fn; } }
  },
  tabs: {
    sendMessage(tabId, message, callback) {
      sent.push({tabId, message});
      callback({ok: true});
    }
  }
};
await import("../background.js");

function send(message, sender) {
  return new Promise(resolve => {
    if (!listener(message, sender, resolve)) resolve(null);
  });
}
const twitch = { url: "https://www.twitch.tv/channel", tab: { id: 12, windowId: 1 } };
const giphy = { url: "https://giphy.com/search/reaction", tab: { id: 13, windowId: 140 } };
test("open real GIPHY popup and hand one selected GIF to the originating Twitch tab", async () => {
  assert.deepEqual(await send({type:"open-giphy"}, twitch), {ok:true});
  assert.deepEqual(await send({type:"picker-status"}, giphy), {ok:true});
  assert.deepEqual(await send({type:"picker-select", id:"cZ7rmKfFYOvYI"}, giphy), {ok:true});
  assert.deepEqual(sent[0], { tabId:12, message:{type:"gifrift-insert",id:"cZ7rmKfFYOvYI"} });
  assert.deepEqual(closed, [140]);
  assert.equal(session.gifriftPicker, undefined);
});
test("GIPHY pages outside our picker cannot send selections", async () => {
  assert.deepEqual(await send({type:"open-giphy"}, twitch), {ok:true});
  assert.deepEqual(await send({type:"picker-status"}, { ...giphy, tab: {windowId: 2} }), {error:"not-picker"});
  assert.deepEqual(await send({type:"picker-select",id:"../../bad"}, giphy), {error:"invalid-id"});
  assert.equal(await send({type:"picker-select",id:"good123"}, { ...giphy, url:"https://evil.example/" }), null);
  assert.equal(sent.length, 1);
  await removedListener(140);
  assert.equal(session.gifriftPicker, undefined);
});
