(() => {
  "use strict";
  const ID = /^\d{1,32}$/;
  const MARKER = /^\[gifrift:k:(\d{1,32})\]$/;
  const DEMO = "[gifrift:demo]";
  const MAX_GIFS = 6;
  const INPUT_SELECTOR = '[data-a-target="chat-input"][contenteditable="true"], [data-a-target="chat-input"] [contenteditable="true"]';
  const BUTTONS_SELECTOR = '[data-test-selector="chat-input-buttons-container"]';
  const ROW_SELECTOR = '.chat-line__message, [data-a-target="chat-line-message"]';
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const pending = new Set();
  const failed = new Set();
  const pendingInputs = new WeakSet();
  let enabled = true;
  let allowMotion = true;
  let namePaintsEnabled = true;
  let namePaintsAnimated = true;
  let namePaintTarget = "";
  let namePaintPalette = "auto";
  let queued = false;
  let knownInput = null;
  let knownButton = null;
  let picker = null;
  let browseSerial = 0;
  let searchTimer;
  let lastChannel = location.pathname.split("/")[1] ?? "";

  function readMarker(text) {
    if (text === DEMO) return { provider: "demo", id: "demo" };
    const id = typeof text === "string" ? MARKER.exec(text)?.[1] : null;
    return id ? { provider: "klipy", id } : null;
  }

  function ask(action, data = {}) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: "klipy", action, ...data }, response => {
        resolve(chrome.runtime.lastError ? { error: "network" } : response ?? { error: "unavailable" });
      });
    });
  }

  function insertMarker(input, marker) {
    if (!input || pendingInputs.has(input)) return false;
    const current = input.textContent.replace(/\uFEFF/g, "").trim();
    if (current) {
      input.focus();
      return current === marker;
    }
    input.focus();
    const leaf = input.querySelector("[data-slate-leaf]");
    const text = leaf && document.createTreeWalker(leaf, NodeFilter.SHOW_TEXT).nextNode();
    if (!text) return false;
    const range = document.createRange();
    range.setStart(text, text.textContent.length);
    range.collapse(true);
    const selection = getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    pendingInputs.add(input);
    setTimeout(() => pendingInputs.delete(input), 500);
    input.dispatchEvent(new InputEvent("beforeinput", {
      bubbles: true, cancelable: true, inputType: "insertText", data: marker
    }));
    input.focus();
    return true;
  }

  function closePicker() {
    if (picker) picker.hidden = true;
    ++browseSerial;
    clearTimeout(searchTimer);
  }

  function openPicker(bar) {
    const host = bar.closest(".chat-input") ?? bar.parentElement;
    if (!host) return;
    if (picker?.isConnected && picker.parentElement === host) {
      if (!picker.hidden) closePicker();
      else {
        picker.hidden = false;
        picker.querySelector(".gifrift-search").focus();
      }
      return;
    }
    picker?.remove();
    const panel = document.createElement("section");
    picker = panel;
    panel.className = "gifrift-picker";
    panel.setAttribute("aria-label", "Sélectionner un GIF KLIPY");
    const heading = document.createElement("div");
    heading.className = "gifrift-picker-heading";
    const title = document.createElement("strong");
    title.textContent = "LoopTV · GIFs";
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Fermer le sélecteur");
    close.addEventListener("click", closePicker);
    heading.append(title, close);
    const search = document.createElement("input");
    search.className = "gifrift-search";
    search.type = "search";
    search.maxLength = 80;
    search.placeholder = "Search KLIPY";
    search.setAttribute("aria-label", "Search KLIPY");
    const status = document.createElement("p");
    status.className = "gifrift-picker-info";
    status.setAttribute("role", "status");
    const grid = document.createElement("div");
    grid.className = "gifrift-picker-grid";
    grid.setAttribute("aria-label", "Résultats GIF KLIPY");
    const more = document.createElement("button");
    more.type = "button";
    more.className = "gifrift-more";
    more.textContent = "Voir plus";
    more.hidden = true;
    const credit = document.createElement("div");
    credit.className = "gifrift-attribution";
    credit.textContent = "Powered by KLIPY";
    panel.append(heading, search, status, grid, more, credit);
    host.classList.add("gifrift-picker-host");
    host.append(panel);
    const state = { query: "", next: "", busy: false, page: 0 };

    async function load(moreResults = false) {
      if (state.busy || panel.hidden || !panel.isConnected) return;
      if (moreResults && !state.next) return;
      state.busy = true;
      const serial = browseSerial;
      more.hidden = true;
      status.textContent = moreResults ? "Chargement des GIFs suivants…" : "Recherche des GIFs…";
      if (!moreResults) grid.replaceChildren();
      const response = await ask("browse", { query: state.query, pos: moreResults ? state.next : "" });
      state.busy = false;
      if (serial !== browseSerial || !panel.isConnected || panel.hidden) return;
      if (response.error) {
        status.textContent = ({
          "missing-key": "Configuration KLIPY absente.",
          "invalid-key": "Clé d’application KLIPY refusée.",
          "rate-limit": "Limite KLIPY atteinte. Réessaie plus tard.",
          network: "Connexion KLIPY indisponible."
        })[response.error] ?? "Recherche indisponible. Réessaie.";
        more.hidden = !state.next;
        return;
      }
      const gifs = Array.isArray(response.gifs) ? response.gifs : [];
      state.next = typeof response.next === "string" && response.next !== "0" ? response.next : "";
      state.page++;
      for (const gif of gifs) {
        if (!ID.test(gif.id ?? "") || typeof gif.preview !== "string") continue;
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "gifrift-choice";
        choice.title = gif.title || "GIF KLIPY";
        choice.setAttribute("aria-label", gif.title || "Choisir ce GIF");
        const img = document.createElement("img");
        img.src = gif.preview;
        img.alt = gif.title || "GIF KLIPY";
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        choice.append(img);
        choice.addEventListener("click", () => {
          const ok = insertMarker(document.querySelector(INPUT_SELECTOR), `[gifrift:k:${gif.id}]`);
          if (ok) closePicker();
          else status.textContent = "Efface d’abord ton message actuel.";
        });
        grid.append(choice);
      }
      status.textContent = grid.childElementCount ? "Clique sur un GIF, puis envoie avec Entrée." : "Aucun GIF trouvé.";
      more.hidden = !state.next || gifs.length === 0;
    }
    function newSearch() {
      clearTimeout(searchTimer);
      ++browseSerial;
      state.query = search.value;
      state.next = "";
      state.page = 0;
      state.busy = false;
      searchTimer = setTimeout(() => load(), 450);
    }
    search.addEventListener("input", newSearch);
    search.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        clearTimeout(searchTimer);
        ++browseSerial;
        state.query = search.value;
        state.next = "";
        state.busy = false;
        load();
      }
    });
    more.addEventListener("click", () => load(true));
    panel.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closePicker();
      knownButton?.focus();
    });
    search.focus();
    load();
  }

  function clean(row) {
    const media = row.querySelector("[data-gifrift-media]");
    if (!media) return;
    const source = media.previousElementSibling;
    if (source?.matches(".text-fragment")) source.hidden = false;
    media.remove();
  }

  function renderGif(row, source, marker, details) {
    if (!row.isConnected || !source.isConnected || row.querySelector("[data-gifrift-media]") ||
        readMarker(source.textContent)?.id !== marker.id) return;
    const container = document.createElement("span");
    container.dataset.gifriftMedia = "1";
    container.dataset.gifriftId = marker.id;
    container.className = "gifrift-media-container";
    const image = document.createElement("img");
    image.className = "gifrift-media";
    image.alt = details?.title || "GIF animé KLIPY";
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    if (Number.isInteger(details?.width)) image.width = Math.min(details.width, 300);
    if (Number.isInteger(details?.height)) image.height = Math.min(details.height, 240);
    image.addEventListener("load", () => {
      if (container.isConnected && enabled && (!motion.matches || allowMotion) &&
          readMarker(source.textContent)?.id === marker.id) source.hidden = true;
    }, { once: true });
    image.addEventListener("error", () => {
      clean(row);
      if (marker.provider === "klipy") markFailed(marker.id);
      schedule();
    }, { once: true });
    image.src = marker.provider === "demo" ? chrome.runtime.getURL("assets/demo.gif") : details.media;
    const credit = document.createElement("span");
    credit.className = "gifrift-attribution";
    credit.textContent = marker.provider === "demo" ? "LoopTV demo" :
      `Powered by KLIPY${details.source ? " · " + details.source : ""}`;
    container.append(image, credit);
    source.after(container);
  }

  function markFailed(id) {
    failed.add(id);
    if (failed.size > 64) failed.delete(failed.values().next().value);
  }

  async function resolve(ids) {
    const response = await ask("resolve", { ids });
    for (const id of ids) pending.delete(id);
    if (response.error) {
      for (const id of ids) markFailed(id);
      schedule();
      return;
    }
    const found = new Map((Array.isArray(response.gifs) ? response.gifs : [])
      .filter(gif => ID.test(gif.id ?? "")).map(gif => [gif.id, gif]));
    for (const id of ids) if (!found.has(id)) markFailed(id);
    if (enabled && (!motion.matches || allowMotion)) {
      let shown = document.querySelectorAll("[data-gifrift-media]").length;
      for (const row of document.querySelectorAll(ROW_SELECTOR)) {
        if (shown >= MAX_GIFS) break;
        if (row.querySelector("[data-gifrift-media]")) continue;
        const source = [...row.querySelectorAll(".text-fragment")].find(node => {
          const marker = readMarker(node.textContent);
          return marker?.provider === "klipy" && found.has(marker.id) && !node.closest("a,button");
        });
        if (!source) continue;
        const marker = readMarker(source.textContent);
        if (!marker || !found.has(marker.id)) continue;
        renderGif(row, source, marker, found.get(marker.id));
        shown++;
      }
    }
    schedule();
  }

  function update() {
    queued = false;
    if (!document.body) return;
    const channel = location.pathname.split("/")[1] ?? "";
    if (channel !== lastChannel) {
      lastChannel = channel;
      failed.clear();
      closePicker();
    }
    globalThis.LoopTVNamePaints.sync(document, {
      enabled: namePaintsEnabled,
      animated: namePaintsAnimated,
      targetName: namePaintTarget,
      paletteId: namePaintPalette
    });
    const input = document.querySelector(INPUT_SELECTOR);
    const bar = document.querySelector(BUTTONS_SELECTOR);
    const send = bar?.querySelector('[data-a-target="chat-send-button"]');
    const sendContainer = send && [...bar.children].find(child => child.contains(send));
    const buttonHost = sendContainer || bar;
    if (input && bar && (input !== knownInput || knownButton?.parentElement !== buttonHost)) {
      knownButton?.parentElement?.classList.remove("gifrift-send-group");
      knownButton?.remove();
      knownInput = input;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gifrift-button";
      button.textContent = "GIF";
      button.setAttribute("aria-label", "Ouvrir la recherche GIF KLIPY");
      button.title = "LoopTV : chercher un GIF";
      button.addEventListener("click", () => openPicker(bar));
      if (sendContainer) {
        sendContainer.classList.add("gifrift-send-group");
        sendContainer.prepend(button);
      }
      else bar.append(button);
      knownButton = button;
    } else if (!input || !bar) {
      knownInput = null;
      knownButton?.parentElement?.classList.remove("gifrift-send-group");
      knownButton?.remove();
      knownButton = null;
      picker?.remove();
      picker = null;
    }
    let shown = 0;
    const ids = [];
    for (const row of document.querySelectorAll(ROW_SELECTOR)) {
      const existing = row.querySelector("[data-gifrift-media]");
      if (!enabled || (motion.matches && !allowMotion) || shown >= MAX_GIFS) {
        if (existing) clean(row);
        continue;
      }
      if (existing) {
        const source = existing.previousElementSibling;
        if (readMarker(source?.textContent)?.id !== existing.dataset.gifriftId) clean(row);
        else { shown++; continue; }
      }
      const fragment = [...row.querySelectorAll(".text-fragment")]
        .find(el => readMarker(el.textContent) && !el.closest("a,button"));
      if (!fragment) continue;
      const marker = readMarker(fragment.textContent);
      if (marker.provider === "demo") {
        renderGif(row, fragment, marker, { title: "GIF de démonstration" });
        shown++;
      } else if (!pending.has(marker.id) && !failed.has(marker.id) &&
                 !ids.includes(marker.id) && shown + pending.size + ids.length < MAX_GIFS) {
        ids.push(marker.id);
      }
    }
    if (ids.length) {
      for (const id of ids) pending.add(id);
      resolve(ids);
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  motion.addEventListener("change", schedule);
  chrome.storage.local.get({ enabled: true, allowMotion: true, namePaintsEnabled: true, namePaintsAnimated: true,
    namePaintTarget: "", namePaintPalette: "auto" }, settings => {
    enabled = settings.enabled !== false;
    allowMotion = settings.allowMotion !== false;
    namePaintsEnabled = settings.namePaintsEnabled !== false;
    namePaintsAnimated = settings.namePaintsAnimated !== false;
    namePaintTarget = typeof settings.namePaintTarget === "string" ? settings.namePaintTarget : "";
    namePaintPalette = typeof settings.namePaintPalette === "string" ? settings.namePaintPalette : "auto";
    schedule();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.enabled) enabled = changes.enabled.newValue !== false;
    if (changes.allowMotion) allowMotion = changes.allowMotion.newValue !== false;
    if (changes.namePaintsEnabled) namePaintsEnabled = changes.namePaintsEnabled.newValue !== false;
    if (changes.namePaintsAnimated) namePaintsAnimated = changes.namePaintsAnimated.newValue !== false;
    if (changes.namePaintTarget) namePaintTarget = typeof changes.namePaintTarget.newValue === "string" ? changes.namePaintTarget.newValue : "";
    if (changes.namePaintPalette) namePaintPalette = typeof changes.namePaintPalette.newValue === "string" ? changes.namePaintPalette.newValue : "auto";
    schedule();
  });
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true, subtree: true, characterData: true
  });
  schedule();
})();
