// Cyan Chat (chat.johnnycyan.com/v2) compatibility for browser and WebView2.
// The browser extension resolves IDs; no key or direct API access enters the page.
(() => {
  "use strict";

  const marker = /^\[(?:ltv|gifrift):k:(\d{1,32})\]$/;
  const selector = "#chat_container .message";
  const MAX_GIFS = 6;
  const cache = new Map();
  const pending = new Set();
  const failed = new Set();
  let queued = false;

  function validMedia(url) {
    if (typeof url !== "string") return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === "static.klipy.com" &&
        !parsed.username && !parsed.password && parsed.pathname.toLowerCase().endsWith(".gif");
    } catch {
      return false;
    }
  }

  function render(element, id, gif) {
    if (!element.isConnected || marker.exec(element.textContent.trim())?.[1] !== id ||
        !validMedia(gif?.media) || element.querySelector("img")) return;
    const image = document.createElement("img");
    image.className = "looptv-cyan-gif";
    image.alt = typeof gif.title === "string" ? gif.title.slice(0, 120) : "GIF LoopTV";
    // Detached lazy-loaded images never become visible, so they may never load.
    image.loading = "eager";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("load", () => {
      if (element.isConnected && marker.exec(element.textContent.trim())?.[1] === id) {
        element.replaceChildren(image);
        schedule();
      }
    }, {once: true});
    image.addEventListener("error", () => failed.add(id), {once: true});
    image.src = gif.media;
  }

  function resolve(ids) {
    for (const id of ids) pending.add(id);
    chrome.runtime.sendMessage({type: "klipy", action: "resolve", ids}, response => {
      for (const id of ids) pending.delete(id);
      if (chrome.runtime.lastError || !Array.isArray(response?.gifs)) {
        ids.forEach(id => failed.add(id));
        return;
      }
      const results = new Map(response.gifs
        .filter(gif => marker.test(`[ltv:k:${gif?.id}]`) && validMedia(gif?.media))
        .map(gif => [gif.id, gif]));
      for (const id of ids) {
        if (!results.has(id)) failed.add(id);
        else {
          cache.set(id, results.get(id));
          if (cache.size > 64) cache.delete(cache.keys().next().value);
        }
      }
      schedule();
    });
  }

  function update() {
    queued = false;
    const elements = [...document.querySelectorAll(selector)];
    const shown = document.querySelectorAll("#chat_container .looptv-cyan-gif").length;
    let available = Math.max(0, MAX_GIFS - shown - pending.size);
    if (!available) return;
    const wanted = [];
    // Recent messages get priority when a busy chat contains many old markers.
    for (const element of elements.reverse()) {
      if (available <= 0) break;
      if (element.querySelector("img")) continue;
      const id = marker.exec(element.textContent.trim())?.[1];
      if (!id || failed.has(id) || pending.has(id)) continue;
      if (cache.has(id)) {
        render(element, id, cache.get(id));
        available--;
      } else if (!wanted.includes(id)) {
        wanted.push(id);
        available--;
      }
    }
    if (wanted.length) resolve(wanted);
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true, subtree: true, characterData: true
  });
  schedule();
})();
