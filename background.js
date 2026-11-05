import { KLIPY_APP_KEY } from "./klipy-config.js";
import { createKlipyClient } from "./klipy-api.js";

const client = createKlipyClient(KLIPY_APP_KEY);
const inflight = new Map();

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== "klipy" || !sender.url?.startsWith("https://www.twitch.tv/")) return;
  let task;
  if (message.action === "browse") {
    if (typeof message.query !== "string" || typeof message.pos !== "string") return respond({ error: "invalid-query" }), false;
    task = () => client.browse(message.query, message.pos);
  } else if (message.action === "resolve") {
    task = () => client.resolve(message.ids);
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
