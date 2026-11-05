import { test } from "node:test";
import assert from "node:assert/strict";
import { createManifest } from "../scripts/build.mjs";

test("Chromium and Firefox share the same application and Twitch content script", () => {
  const chromium = createManifest(false);
  const firefox = createManifest(true);
  assert.equal(chromium.name, "LoopTV");
  assert.equal(chromium.version, firefox.version);
  assert.deepEqual(chromium.content_scripts, firefox.content_scripts);
  assert.deepEqual(chromium.content_scripts[0].js, ["name-paints.js", "twitch.js"]);
  assert.deepEqual(chromium.content_scripts[0].css, ["twitch.css", "name-paints.css"]);
  assert.equal(chromium.content_scripts.length, 1, "LoopTV must not inject into personal overlay sites");
  assert.equal(chromium.version, "0.8.0");
  assert.equal(chromium.background.service_worker, "background.js");
  assert.equal(chromium.background.type, "module");
  assert.ok(!chromium.browser_specific_settings);
  assert.deepEqual(firefox.background, {scripts:["background.js"], type:"module"});
  assert.ok(firefox.browser_specific_settings.gecko.id);
  assert.deepEqual(firefox.browser_specific_settings.gecko.data_collection_permissions.required, ["searchTerms"]);
  for (const m of [chromium, firefox]) {
    assert.deepEqual(m.permissions, ["storage"]);
    assert.deepEqual(m.host_permissions, ["https://api.klipy.com/*"]);
    assert.equal(m.icons[128], "icons/icon-128.png");
  }
});
