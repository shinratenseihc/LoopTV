import { createKlipyClient } from "./klipy-api.js";

// The application key is optional in a source checkout. Loading an unpacked
// repository must not prevent the service worker from registering when the
// git-ignored configuration file is absent. Packaged builds include this file.
const clientReady = fetch(chrome.runtime.getURL("klipy-config.js"))
  .then(response => response.ok ? response.text() : "")
  .then(source => {
    const key = /^\s*export\s+const\s+KLIPY_APP_KEY\s*=\s*(['"])([^'"]+)\1\s*;?\s*$/m.exec(source)?.[2] ?? "";
    return createKlipyClient(key);
  })
  .catch(() => createKlipyClient(""));
const inflight = new Map();

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== "klipy") return;
  const twitch = sender.url?.startsWith("https://www.twitch.tv/");
  const cyan = /^https:\/\/chat\.johnnycyan\.com\/v2(?:\/|\?|$)/.test(sender.url ?? "");
  if (!twitch && !cyan) return;
  let task;
  if (message.action === "browse") {
    // The transparent overlay only needs to resolve marker IDs, not browse.
    if (!twitch) return respond({ error: "invalid-action" }), false;
    if (typeof message.query !== "string" || typeof message.pos !== "string") return respond({ error: "invalid-query" }), false;
    task = () => clientReady.then(client => client.browse(message.query, message.pos));
  } else if (message.action === "resolve") {
    task = () => clientReady.then(client => client.resolve(message.ids));
  } else return respond({ error: "invalid-action" }), false;
  // Deduplicate same in-flight search/ID resolutions only; no persistent caching.
  const scope = message.action === "browse"
    ? ["browse", message.query, message.pos]
    : ["resolve", Array.isArray(message.ids) ? [...message.ids].sort() : message.ids];
  const key = JSON.stringify(scope);
  if (!inflight.has(key)) {
    const pending = Promise.resolve().then(task).catch(() => ({ error: "network" }));
    inflight.set(key, pending);
    pending.finally(() => inflight.delete(key));
  }
  inflight.get(key).then(respond, () => respond({ error: "network" }));
  return true;
});
