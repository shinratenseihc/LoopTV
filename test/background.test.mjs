import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

let handler;
let executed = 0;
let finishRequest;
const fakeClient = {
  browse: () => {
    executed++;
    return new Promise(resolve => { finishRequest = resolve; });
  },
  resolve: async ids => ({ gifs: ids.map(id=>({id})) })
};
const chrome = { runtime: {
  getURL: path => `chrome-extension://test/${path}`,
  onMessage: { addListener(fn) { handler = fn; } }
} };
const script = readFileSync(new URL("../background.js", import.meta.url), "utf8")
  .replace(/^import .+;\s*$/gm, "");
vm.runInNewContext(script, {
  chrome, fetch: async () => ({ok:true, text: async () => 'export const KLIPY_APP_KEY = "FAKEKEY";'}),
  createKlipyClient: key => { assert.equal(key,"FAKEKEY"); return fakeClient; }, Map, JSON, Promise
});

const send = (message, sender = {url:"https://www.twitch.tv/channel"}) =>
  new Promise(resolve => {
    if (handler(message, sender, resolve) !== true) resolve(null);
  });

test("background blocks unrelated sites and unknown actions", async () => {
  assert.equal(await send({type:"klipy",action:"browse",query:"cat",pos:""}, {url:"https://not-twitch.invalid"}), null);
  assert.equal((await send({type:"klipy",action:"invalid"})).error,"invalid-action");
  assert.equal((await send({type:"klipy",action:"browse",query:null,pos:""})).error,"invalid-query");
  assert.equal(await send({type:"klipy",action:"resolve",ids:["123456"]},
    {url:"https://chat.johnnycyan.com/v2/?channel=test"}), null);
});

test("background deduplicates concurrent identical requests", async () => {
  const a = send({type:"klipy",action:"browse",query:"cat",pos:""});
  const b = send({type:"klipy",action:"browse",query:"cat",pos:""});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(executed, 1);
  finishRequest({gifs:[],next:""});
  assert.deepEqual(await a, {gifs:[],next:""});
  assert.deepEqual(await b, {gifs:[],next:""});
});

test("missing git-ignored KLIPY config does not prevent worker registration", async () => {
  let noConfigHandler;
  let seenKey;
  const noConfigChrome = { runtime: {
    getURL: path => `chrome-extension://test/${path}`,
    onMessage: { addListener(fn) { noConfigHandler = fn; } }
  } };
  vm.runInNewContext(script, {
    chrome: noConfigChrome,
    fetch: async () => { throw new Error("File not found"); },
    createKlipyClient: key => {
      seenKey = key;
      return {browse: async () => ({error:"missing-key"}), resolve: async () => ({error:"missing-key"})};
    },
    Map, JSON, Promise
  });
  const result = await new Promise(resolve => {
    assert.equal(noConfigHandler({type:"klipy",action:"browse",query:"cat",pos:""},
      {url:"https://www.twitch.tv/channel"}, resolve), true);
  });
  assert.equal(seenKey, "");
  assert.equal(result.error, "missing-key");
});
