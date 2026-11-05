import { parseMarker } from "./marker.js";

const MAX_VISIBLE = 6;
const GIFS = Object.freeze({
  demo: { src: "./assets/demo.gif", label: "Carré violet animé de démonstration GIFRIFT" }
});

export function mountChat(root, { enabled, reducedMotion } = {}) {
  if (!(root instanceof HTMLElement)) throw new TypeError("Chat container required");
  const observer = new MutationObserver(refresh);
  let active = 0;
  let disposed = false;
  const isEnabled = () => enabled?.() ?? true;
  const isReduced = () => reducedMotion?.() ?? false;

  function restore(message) {
    const marker = message.dataset.marker;
    if (!marker) return;
    message.replaceChildren(document.createTextNode(marker));
    delete message.dataset.marker;
    delete message.dataset.gifriftRendered;
  }

  function refresh() {
    if (disposed) return;
    observer.disconnect();
    try {
      active = 0;
      for (const message of root.querySelectorAll("[data-chat-message]")) {
        if (message.dataset.gifriftRendered && !message.querySelector("img.gifrift-image")) {
          delete message.dataset.marker;
          delete message.dataset.gifriftRendered;
        }
        if (message.dataset.gifriftRendered) {
          if (!isEnabled() || isReduced() || active >= MAX_VISIBLE) restore(message);
          else {
            active++;
            continue;
          }
        }
        if (!isEnabled() || isReduced() || active >= MAX_VISIBLE) continue;
        const marker = message.textContent;
        const id = parseMarker(marker);
        const asset = id === null ? null : GIFS[id];
        if (!asset) continue;
        const img = document.createElement("img");
        img.src = asset.src;
        img.alt = asset.label;
        img.width = 300;
        img.height = 240;
        img.loading = "lazy";
        img.decoding = "async";
        img.className = "gifrift-image";
        message.dataset.marker = marker;
        message.dataset.gifriftRendered = "1";
        message.replaceChildren(img);
        active++;
      }
    } finally {
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    }
  }

  refresh();
  return {
    refresh,
    stats: () => ({ rendered: active, limit: MAX_VISIBLE }),
    dispose() {
      disposed = true;
      observer.disconnect();
      for (const message of root.querySelectorAll("[data-gifrift-rendered]")) restore(message);
      active = 0;
    }
  };
}
