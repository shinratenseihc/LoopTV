// Deterministic, serverless Twitch name paints. Loaded before twitch.js and popup.js.
globalThis.LoopTVNamePaints = (() => {
  "use strict";

  // Every LoopTV viewer computes the same gradient from the same display name.
  const palettes = [
    ["#ff5cc8", "#a76bff", "#5fe7ff"],
    ["#ffe36f", "#ff9d59", "#ff65b3"],
    ["#66ffbf", "#42dceb", "#8f9dff"],
    ["#fba6ff", "#e37bff", "#88c9ff"],
    ["#ff8b76", "#f747a2", "#9b8cff"],
    ["#ccff76", "#6bf6a5", "#50dff5"],
    ["#7cc7ff", "#6d96ff", "#be87ff"],
    ["#ffca71", "#ffd65c", "#97ffb0"]
  ];
  const usernameSelector = '.chat-author__display-name, .chat-line__username, [data-a-target="chat-message-username"]';
  const rowSelector = '.chat-line__message, [data-a-target="chat-line-message"]';

  function gradientFor(name) {
    if (typeof name !== "string") return null;
    const normalized = name.normalize("NFC").trim().toLowerCase();
    if (!normalized || normalized.length > 80) return null;
    let hash = 2166136261;
    for (let i = 0; i < normalized.length; i++) {
      hash = Math.imul(hash ^ normalized.charCodeAt(i), 16777619) >>> 0;
    }
    const colors = palettes[hash % palettes.length];
    const angle = 95 + ((hash >>> 8) % 66);
    return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
  }

  function clear(element) {
    element.classList.remove("looptv-name-paint", "looptv-name-paint-motion");
    element.style.removeProperty("--looptv-name-gradient");
    delete element.dataset.looptvPaintName;
  }

  function sync(root, { enabled = true, animated = false, reducedMotion = false } = {}) {
    if (!enabled) {
      for (const element of root.querySelectorAll(".looptv-name-paint")) clear(element);
      return;
    }
    const animate = animated && !reducedMotion;
    for (const row of root.querySelectorAll(rowSelector)) {
      for (const element of row.querySelectorAll(usernameSelector)) {
        const name = element.textContent.trim().replace(/:$/, "").trim();
        if (name === element.dataset.looptvPaintName && element.classList.contains("looptv-name-paint")) {
          element.classList.toggle("looptv-name-paint-motion", animate);
          continue;
        }
        const gradient = gradientFor(name);
        if (!gradient) {
          if (element.classList.contains("looptv-name-paint")) clear(element);
          continue;
        }
        element.style.setProperty("--looptv-name-gradient", gradient);
        element.dataset.looptvPaintName = name;
        element.classList.add("looptv-name-paint");
        element.classList.toggle("looptv-name-paint-motion", animate);
      }
    }
  }

  return Object.freeze({ gradientFor, sync });
})();
