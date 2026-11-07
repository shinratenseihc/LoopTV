import { test } from "node:test";
import assert from "node:assert/strict";
import { createKlipyClient, normalizeKlipy, parseKlipyMarker } from "../klipy-api.js";

const id = "1234567890123456";
const gif = {
  id,
  title: "Salut",
  content_description: "Salutation animée",
  content_description_source: "Creator",
  flags: "",
  media_formats: {
    gif: {url:"https://static.klipy.com/example/full.gif?source=klipy", dims:[440,220], size: 800000},
    tinygif: {url:"https://static.klipy.com/example/tiny.gif", dims:[220,110], size: 120000}
  }
};
const ok = (results = [gif], next = "12") => ({ok:true,status:200, json:async()=>({results,next})});
const bad = status => ({ok:false,status});
const urls = [];
const mockFetch = async (url, options) => {
  urls.push({ url:new URL(url), options });
  return ok();
};
const client = createKlipyClient("TESTKEYONLY1234", mockFetch);

test("real Twitch marker parser accepts only canonical KLIPY IDs, not GIPHY", () => {
  assert.equal(parseKlipyMarker(`[gifrift:k:${id}]`), id);
  assert.equal(parseKlipyMarker(`[ltv:k:${id}]`), id);
  for (const text of ["[gifrift:g:AbCd1234]", "[gifrift:k:abc]", "[ltv:g:AbCd1234]", "[ltv:k:abc]", "[ltv:k:01] extra", "[gifrift:k:01] extra", "[gifrift:k:1<script>]", `[ltv:k:${"1".repeat(33)}]`]) {
    assert.equal(parseKlipyMarker(text), null);
  }
});

test("search and featured keep the query and paginate without reordering", async () => {
  let res = await client.browse("funny cat");
  assert.equal(res.gifs[0].id, id);
  assert.equal(res.gifs[0].source, "Creator");
  assert.equal(res.next, "12");
  let req = urls.at(-1);
  assert.equal(req.url.pathname, "/v2/search");
  assert.equal(req.url.searchParams.get("q"), "funny cat");
  assert.equal(req.url.searchParams.get("limit"), "12");
  assert.equal(req.url.searchParams.get("media_filter"), "gif,tinygif");
  assert.equal(req.url.searchParams.get("contentfilter"), "medium");
  assert.equal(req.options.referrerPolicy, "no-referrer");
  await client.browse("funny cat", "12");
  assert.equal(urls.at(-1).url.searchParams.get("pos"), "12");
  await client.browse("funny cat", "nX==");
  assert.equal(urls.at(-1).url.searchParams.get("pos"), "nX==");
  await client.browse("");
  assert.equal(urls.at(-1).url.pathname, "/v2/featured");
  const count = urls.length;
  assert.equal((await client.browse("x".repeat(81))).error, "invalid-query");
  assert.equal((await client.browse("x", "not valid pos")).error, "invalid-query");
  assert.equal(urls.length, count);
});

test("posts resolves string IDs with the accepted v2 format filter", async () => {
  const res = await client.resolve([id]);
  assert.equal(res.gifs[0].id, id);
  const req = urls.at(-1).url;
  assert.equal(req.pathname, "/v2/posts");
  assert.equal(req.searchParams.get("ids"), id);
  assert.equal(req.searchParams.get("media_filter"), "gif,tinygif");
  assert.equal(req.searchParams.has("limit"), false);
  const count = urls.length;
  assert.equal((await client.resolve(["invalid-id"])).error, "invalid-ids");
  assert.equal(urls.length, count);
});

test("rejects unsafe media, static/sticker and oversized dimensions/sizes", () => {
  assert.equal(normalizeKlipy(gif).media, gif.media_formats.gif.url);
  assert.equal(normalizeKlipy({...gif, flags:"sticker"}), null);
  assert.equal(normalizeKlipy({...gif, media_formats:{...gif.media_formats,gif:{...gif.media_formats.gif,size:3000000}}}).media, gif.media_formats.tinygif.url);
  assert.equal(normalizeKlipy({...gif, media_formats:{...gif.media_formats,tinygif:{...gif.media_formats.tinygif,size:1000001}}}), null);
  assert.equal(normalizeKlipy({...gif, media_formats:{...gif.media_formats,tinygif:{...gif.media_formats.tinygif,url:"https://evil.com/tiny.gif"}}}), null);
  assert.equal(normalizeKlipy({...gif, media_formats:{...gif.media_formats,tinygif:{...gif.media_formats.tinygif,url:"https://static.klipy.com.evil.com/tiny.gif"}}}), null);
  assert.equal(normalizeKlipy({...gif, media_formats:{...gif.media_formats,tinygif:{...gif.media_formats.tinygif,url:"https://static.klipy.com:444/tiny.gif"}}}), null);
  assert.equal(normalizeKlipy({...gif, media_formats:{...gif.media_formats,tinygif:{...gif.media_formats.tinygif,dims:[99999,100]}}}), null);
});

test("handles 401, 403, 429, 500, malformed response and network errors", async () => {
  for (const [status, code] of [[401,"invalid-key"],[403,"invalid-key"],[429,"rate-limit"],[500,"unavailable"]]) {
    const res = await createKlipyClient("TESTKEYONLY1234", async()=>bad(status)).browse("test");
    assert.equal(res.error, code);
  }
  assert.equal((await createKlipyClient("TESTKEYONLY1234", async()=>({ok:true,json:async()=>({data:[]})})).browse("test")).error,"malformed-response");
  assert.equal((await createKlipyClient("TESTKEYONLY1234", async()=>{throw new Error("network");}).browse("test")).error,"network");
  assert.equal((await createKlipyClient("", mockFetch).browse("test")).error,"missing-key");
});
