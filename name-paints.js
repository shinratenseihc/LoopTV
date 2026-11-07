// Deterministic, serverless Twitch name paints. Loaded before twitch.js and popup.js.
globalThis.LoopTVNamePaints = (() => {
  "use strict";

  // Original, fixed palettes: user input never becomes CSS or loads remote assets.
  // Existing IDs stay stable so saved choices survive a catalogue update.
  const palettes = [
    { id: "neon", label: "Néon", hue: 320, group: "Classiques", colors: ["#ff5cc8", "#a76bff", "#5fe7ff"] },
    { id: "sunset", label: "Sunset", hue: 32, group: "Classiques", colors: ["#ffe36f", "#ff9d59", "#ff65b3"] },
    { id: "lagoon", label: "Lagon", hue: 172, group: "Classiques", colors: ["#66ffbf", "#42dceb", "#8f9dff"] },
    { id: "orchid", label: "Orchidée", hue: 275, group: "Classiques", colors: ["#fba6ff", "#e37bff", "#88c9ff"] },
    { id: "ember", label: "Brasier", hue: 0, group: "Classiques", colors: ["#ff8b76", "#f747a2", "#9b8cff"] },
    { id: "lime", label: "Citron", hue: 100, group: "Classiques", colors: ["#ccff76", "#6bf6a5", "#50dff5"] },
    { id: "electric", label: "Électrique", hue: 222, group: "Classiques", colors: ["#7cc7ff", "#6d96ff", "#be87ff"] },
    { id: "gold", label: "Soleil", hue: 60, group: "Classiques", colors: ["#ffca71", "#ffd65c", "#97ffb0"] },
    { id: "plasma", label: "Plasma", hue: 294, group: "Néons", effect: "glow", colors: ["#fc20ef", "#7823ff", "#e54fff"] },
    { id: "ultraviolet", label: "Ultraviolet", hue: 262, group: "Néons", effect: "glow", colors: ["#ad54ff", "#f86dff", "#6f46ff"] },
    { id: "laser", label: "Laser", hue: 132, group: "Néons", effect: "glow", colors: ["#34ff7f", "#b5ff4a", "#13edcc"] },
    { id: "pink-flash", label: "Pink Flash", hue: 335, group: "Néons", effect: "glow", colors: ["#ff4ca5", "#fff0fa", "#ff4b83"] },
    { id: "toxic", label: "Toxique", hue: 98, group: "Néons", effect: "glow", colors: ["#d9ff30", "#7cff17", "#05ff9a"] },
    { id: "hyperblue", label: "Hyperblue", hue: 210, group: "Néons", effect: "glow", colors: ["#3ad9ff", "#265fff", "#96dfff"] },
    { id: "redline", label: "Redline", hue: 350, group: "Néons", effect: "glow", colors: ["#ff3131", "#ffb745", "#ff4c79"] },
    { id: "aurora", label: "Aurore", hue: 178, group: "Néons", effect: "glow", colors: ["#41ffe3", "#8a71ff", "#f477ff"] },
    { id: "obsidian", label: "Obsidienne", hue: 250, group: "Métalliques", effect: "metal", colors: ["#9793af", "#eeeeff", "#4b526e"] },
    { id: "ivory", label: "Ivoire", hue: 48, group: "Métalliques", effect: "metal", colors: ["#f7eccc", "#ffffff", "#bdb39d"] },
    { id: "blacklight", label: "Blacklight", hue: 281, group: "Métalliques", effect: "metal", colors: ["#8d68ff", "#e7d7ff", "#6745bb"] },
    { id: "chrome", label: "Chrome", hue: 216, group: "Métalliques", effect: "metal", colors: ["#cad6e8", "#ffffff", "#8296ad"] },
    { id: "titanium", label: "Titane", hue: 197, group: "Métalliques", effect: "metal", colors: ["#96b1bf", "#f5ffff", "#5f839c"] },
    { id: "copper", label: "Cuivre", hue: 29, group: "Métalliques", effect: "metal", colors: ["#ffb36f", "#fff0cc", "#b95d34"] },
    { id: "rose-gold", label: "Or Rose", hue: 345, group: "Métalliques", effect: "metal", colors: ["#f6a8aa", "#fff0e7", "#c77799"] },
    { id: "graphite", label: "Graphite", hue: 218, group: "Métalliques", effect: "metal", colors: ["#8a99b3", "#f0f2ff", "#535b76"] },
    { id: "cotton", label: "Cotton", hue: 325, group: "Pastels", colors: ["#ffb7e7", "#c7caff", "#a5ecff"] },
    { id: "peach", label: "Pêche", hue: 24, group: "Pastels", colors: ["#ffd1a2", "#ffc1cd", "#ffedb6"] },
    { id: "lilac", label: "Lilas", hue: 270, group: "Pastels", colors: ["#cbb6ff", "#f4c8ff", "#a9c8ff"] },
    { id: "mint", label: "Menthe", hue: 158, group: "Pastels", colors: ["#bdffe3", "#a4f5ea", "#c8ddff"] },
    { id: "icecream", label: "Sorbet", hue: 183, group: "Pastels", colors: ["#fff0c3", "#b6f2f5", "#e7c6ff"] },
    { id: "bubblegum", label: "Bubblegum", hue: 334, group: "Pastels", colors: ["#ff9bdc", "#ffd2f2", "#d7b1ff"] },
    { id: "spring", label: "Printemps", hue: 96, group: "Pastels", colors: ["#e5ffa9", "#b5f8bc", "#b2fbec"] },
    { id: "peachsky", label: "Ciel Rose", hue: 13, group: "Pastels", colors: ["#ffcfb1", "#ffd6e7", "#b4d9ff"] },
    { id: "inferno", label: "Inferno", hue: 15, group: "Duos", colors: ["#ff441e", "#ffd040", "#ff2700"] },
    { id: "deep-sea", label: "Abysses", hue: 200, group: "Duos", colors: ["#3bf1fb", "#095dba", "#31bfff"] },
    { id: "cyberpunk", label: "Cyberpunk", hue: 305, group: "Duos", effect: "glow", colors: ["#ff2dbe", "#f7f74c", "#2fdaff"] },
    { id: "venom", label: "Venom", hue: 124, group: "Duos", colors: ["#91ff2b", "#2cba61", "#f0ff4f"] },
    { id: "horizon", label: "Horizon", hue: 35, group: "Duos", colors: ["#fbac51", "#e84e8c", "#625bfb"] },
    { id: "alien", label: "Alien", hue: 157, group: "Duos", effect: "glow", colors: ["#33ff90", "#12c2db", "#abff39"] },
    { id: "bloodmoon", label: "Lune Rouge", hue: 355, group: "Duos", colors: ["#e92a4c", "#b348d4", "#ff9575"] },
    { id: "glacier", label: "Glacier", hue: 195, group: "Duos", colors: ["#d4ffff", "#5fa4ff", "#e2dcff"] },
    { id: "glitch", label: "Glitch", hue: 300, group: "Fantaisie", effect: "glow", colors: ["#ff2b7e", "#50fff2", "#ff6b32"] },
    { id: "prism", label: "Prisme", hue: 330, group: "Fantaisie", effect: "glow", colors: ["#ff6688", "#6affa7", "#8c7aff"] },
    { id: "spectral", label: "Spectral", hue: 250, group: "Fantaisie", effect: "glow", colors: ["#a37dff", "#69f4e4", "#ed7fff"] },
    { id: "solarflare", label: "Solar Flare", hue: 45, group: "Fantaisie", effect: "glow", colors: ["#fff13b", "#ff613b", "#ffd48d"] },
    { id: "sakura", label: "Sakura", hue: 338, group: "Fantaisie", colors: ["#ffafd8", "#ff6e9f", "#ffe2ed"] },
    { id: "matrix", label: "Matrix", hue: 120, group: "Fantaisie", effect: "glow", colors: ["#18ff48", "#d0ff79", "#00c9a3"] },
    { id: "midnight", label: "Minuit", hue: 235, group: "Fantaisie", colors: ["#7d99ff", "#ae83e9", "#4ad7ef"] },
    { id: "sunset-drive", label: "Night Drive", hue: 330, group: "Fantaisie", effect: "glow", colors: ["#f9497d", "#b44ffb", "#4d8fff"] }
  ];
  // Twitch nests the display-name inside .chat-line__username. Painting both
  // produces two gradients on the same name, so always choose one leaf.
  const usernameSelectors = [
    '.chat-author__display-name',
    '[data-a-target="chat-message-username"]',
    '.chat-line__username'
  ];
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

  function paintFor(name, paletteId = "auto", twitchColor = "") {
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
    return {
      gradient: `linear-gradient(${angle}deg, ${selected.colors.join(", ")})`,
      effect: selected.effect ?? "",
      glow: selected.colors[1]
    };
  }

  function gradientFor(name, paletteId = "auto", twitchColor = "") {
    return paintFor(name, paletteId, twitchColor)?.gradient ?? null;
  }

  function clear(element) {
    element.classList.remove("looptv-name-paint", "looptv-name-paint-motion",
      "looptv-name-paint-glow", "looptv-name-paint-metal");
    element.style.removeProperty("--looptv-name-gradient");
    element.style.removeProperty("--looptv-name-glow");
    delete element.dataset.looptvPaintName;
    delete element.dataset.looptvPaintSignature;
  }

  function sync(root, { enabled = true, animated = true,
                        targetName = "", paletteId = "auto" } = {}) {
    if (!enabled) {
      for (const element of root.querySelectorAll(".looptv-name-paint")) clear(element);
      return;
    }
    const animate = animated;
    const target = normalize(targetName);
    for (const row of root.querySelectorAll(rowSelector)) {
      const element = usernameSelectors.map(selector => row.querySelector(selector)).find(Boolean);
      if (!element) continue;
      // Remove any paint left on a wrapper by earlier experimental builds.
      for (const wrapper of row.querySelectorAll(".looptv-name-paint")) {
        if (wrapper !== element) clear(wrapper);
      }
      const name = element.textContent.trim().replace(/:$/, "").trim();
      const selected = target && target === normalize(name) ? paletteId : "auto";
      // Twitch usually sets inline colors; computed style is a safe fallback
      // for class-based colors, while neutral text colors fall back to the hash.
      const nativeColor = element.style.color || getComputedStyle(element).color;
      const signature = `${name}|${selected}|${nativeColor}`;
      if (signature === element.dataset.looptvPaintSignature && element.classList.contains("looptv-name-paint")) {
        element.classList.toggle("looptv-name-paint-motion", animate);
        continue;
      }
        const paint = paintFor(name, selected, nativeColor);
        if (!paint) {
        if (element.classList.contains("looptv-name-paint")) clear(element);
        continue;
      }
        element.style.setProperty("--looptv-name-gradient", paint.gradient);
        element.style.setProperty("--looptv-name-glow", paint.glow);
      element.dataset.looptvPaintName = name;
      element.dataset.looptvPaintSignature = signature;
      element.classList.add("looptv-name-paint");
        element.classList.toggle("looptv-name-paint-glow", paint.effect === "glow");
        element.classList.toggle("looptv-name-paint-metal", paint.effect === "metal");
      element.classList.toggle("looptv-name-paint-motion", animate);
    }
  }

  return Object.freeze({
    gradientFor, paintFor, sync, paletteFromTwitchColor,
    palettes: Object.freeze(palettes.map(({ id, label, group, effect }) =>
      Object.freeze({ id, label, group, effect: effect ?? "" })))
  });
})();
