// Deterministic, serverless Twitch name paints. Loaded before twitch.js and popup.js.
globalThis.LoopTVNamePaints = (() => {
  "use strict";

  // Fixed palettes: user input never becomes CSS, and no remote assets are loaded.
  const palettes = [
    { id: "neon", label: "Néon", hue: 320, colors: ["#ff5cc8", "#a76bff", "#5fe7ff"] },
    { id: "sunset", label: "Sunset", hue: 32, colors: ["#ffe36f", "#ff9d59", "#ff65b3"] },
    { id: "lagoon", label: "Lagon", hue: 172, colors: ["#66ffbf", "#42dceb", "#8f9dff"] },
    { id: "orchid", label: "Orchidée", hue: 275, colors: ["#fba6ff", "#e37bff", "#88c9ff"] },
    { id: "ember", label: "Brasier", hue: 0, colors: ["#ff8b76", "#f747a2", "#9b8cff"] },
    { id: "lime", label: "Citron", hue: 100, colors: ["#ccff76", "#6bf6a5", "#50dff5"] },
    { id: "electric", label: "Électrique", hue: 222, colors: ["#7cc7ff", "#6d96ff", "#be87ff"] },
    { id: "gold", label: "Soleil", hue: 60, colors: ["#ffca71", "#ffd65c", "#97ffb0"] }
  ];
  const usernameSelector = '.chat-author__display-name, .chat-line__username, [data-a-target="chat-message-username"]';
  const rowSelector = '.chat-line__message, [data-a-target="chat-line-message"]';

  function normalize(name) {
    return typeof name === "string" ? name.normalize("NFC").trim().toLowerCase() : "";
  }

  // Twitch broadcasts a user's native chat color. It can select the closest
  // free gradient for every LoopTV viewer without a new account or server.
  function paletteFromTwitchColor(color) {
    if (typeof color !== "string") return null;
    let rgb;
    const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim());
    if (hex) {
      const value = hex[1].length === 3 ? [...hex[1]].map(ch => ch + ch).join("") : hex[1];
      rgb = [0, 2, 4].map(i => Number.parseInt(value.slice(i, i + 2), 16));
    } else {
      const match = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*)?\)$/i.exec(color.trim());
      if (!match) return null;
      rgb = match.slice(1, 4).map(Number);
    }
    if (rgb.some(channel => channel > 255)) return null;
    const [r, g, b] = rgb.map(channel => channel / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta < 0.08) return null; // neutral Twitch color: use stable name hash
    let hue;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    return palettes.reduce((best, current) => {
      const distance = item => Math.abs(((hue - item.hue + 540) % 360) - 180);
      return distance(current) < distance(best) ? current : best;
    }, palettes[0]).id;
  }

  function gradientFor(name, paletteId = "auto", twitchColor = "") {
    if (typeof name !== "string") return null;
    const normalized = normalize(name);
    if (!normalized || normalized.length > 80) return null;
    let hash = 2166136261;
    for (let i = 0; i < normalized.length; i++) {
      hash = Math.imul(hash ^ normalized.charCodeAt(i), 16777619) >>> 0;
    }
    const selected = palettes.find(palette => palette.id === paletteId)
      ?? palettes.find(palette => palette.id === paletteFromTwitchColor(twitchColor))
      ?? palettes[hash % palettes.length];
    const angle = 95 + ((hash >>> 8) % 66);
    return `linear-gradient(${angle}deg, ${selected.colors.join(", ")})`;
  }

  function clear(element) {
    element.classList.remove("looptv-name-paint", "looptv-name-paint-motion");
    element.style.removeProperty("--looptv-name-gradient");
    delete element.dataset.looptvPaintName;
    delete element.dataset.looptvPaintSignature;
  }

  function sync(root, { enabled = true, animated = false, reducedMotion = false,
                        targetName = "", paletteId = "auto" } = {}) {
    if (!enabled) {
      for (const element of root.querySelectorAll(".looptv-name-paint")) clear(element);
      return;
    }
    const animate = animated && !reducedMotion;
    const target = normalize(targetName);
    for (const row of root.querySelectorAll(rowSelector)) {
      for (const element of row.querySelectorAll(usernameSelector)) {
        const name = element.textContent.trim().replace(/:$/, "").trim();
        const selected = target && target === normalize(name) ? paletteId : "auto";
        const nativeColor = element.style.color;
        const signature = `${name}|${selected}|${nativeColor}`;
        if (signature === element.dataset.looptvPaintSignature && element.classList.contains("looptv-name-paint")) {
          element.classList.toggle("looptv-name-paint-motion", animate);
          continue;
        }
        const gradient = gradientFor(name, selected, nativeColor);
        if (!gradient) {
          if (element.classList.contains("looptv-name-paint")) clear(element);
          continue;
        }
        element.style.setProperty("--looptv-name-gradient", gradient);
        element.dataset.looptvPaintName = name;
        element.dataset.looptvPaintSignature = signature;
        element.classList.add("looptv-name-paint");
        element.classList.toggle("looptv-name-paint-motion", animate);
      }
    }
  }

  return Object.freeze({
    gradientFor, sync, paletteFromTwitchColor,
    palettes: Object.freeze(palettes.map(({ id, label }) => Object.freeze({ id, label })))
  });
})();
