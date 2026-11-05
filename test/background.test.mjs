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
const chrome = { runtime: { onMessage: { addListener(fn) { handler = fn; } } } };
const script = readFileSync(new URL("../background.js", import.meta.url), "utf8")
  .replace(/^import .+;\s*$/gm, "");
vm.runInNewContext(script, {chrome, KLIPY_APP_KEY:"FAKEKEY", createKlipyClient: () => fakeClient, Map, JSON, Promise});

const send = (message, sender = {url:"https://www.twitch.tv/channel"}) =>
  new Promise(resolve => {
    if (handler(message, sender, resolve) !== true) resolve(null);
  });

test("background blocks unrelated sites and unknown actions", async () => {
  assert.equal(await send({type:"klipy",action:"browse",query:"cat",pos:""}, {url:"https://not-twitch.invalid"}), null);
  assert.equal((await send({type:"klipy",action:"invalid"})).error,"invalid-action");
  assert.equal((await send({type:"klipy",action:"browse",query:null,pos:""})).error,"invalid-query");
});

test("background deduplicates concurrent identical requests", async () => {
  const a = send({type:"klipy",action:"browse",query:"cat",pos:""});
  const b = send({type:"klipy",action:"browse",query:"cat",pos:""});
  await Promise.resolve(); await Promise.resolve();
  assert.equal(executed, 1);
  finishRequest({gifs:[],next:""});
  assert.deepEqual(await a, {gifs:[],next:""});
  assert.deepEqual(await b, {gifs:[],next:""});
});
