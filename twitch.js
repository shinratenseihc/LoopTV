(() => {
  "use strict";
  const MARKER_PATTERN = /^\[gifrift:g:([A-Za-z0-9]{6,40})\]$/;
  const MAX_GIFS = 6;
  const INPUT_SELECTOR = '[data-a-target="chat-input"][contenteditable="true"], [data-a-target="chat-input"] [contenteditable="true"]';
  const BUTTONS_SELECTOR = '[data-test-selector="chat-input-buttons-container"]';
  const ROW_SELECTOR = '.chat-line__message, [data-a-target="chat-line-message"]';
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = true;
  let allowMotion = false;
  let queued = false;
  let knownInput = null;
  let knownButton = null;
  let picker = null;
  const pendingInputs = new WeakSet();
  const markerId = text => text === "[gifrift:demo]" ? "demo" : (MARKER_PATTERN.exec(text)?.[1] ?? null);

  function giphyId(link) {
    if (typeof link !== "string" || link.length > 1024) return null;
    let url;
    try { url = new URL(link.trim()); } catch { return null; }
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    let id = null;
    if (host === "giphy.com" || host === "www.giphy.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length === 2 && parts[0] === "gifs") id = parts[1].split("-").at(-1);
      if (parts.length === 2 && parts[0] === "media") id = parts[1];
    } else if (/^media\d*\.giphy\.com$/.test(host)) {
      const match = /^\/media\/([A-Za-z0-9]{6,40})\/[^/]+\.(?:gif|webp)$/.exec(url.pathname);
      id = match?.[1];
    }
    return /^[A-Za-z0-9]{6,40}$/.test(id ?? "") ? id : null;
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

  function openPicker(bar) {
    const host = bar.closest(".chat-input") ?? bar.parentElement;
    if (!host) return;
    if (picker?.isConnected && picker.parentElement === host) {
      picker.hidden = !picker.hidden;
      if (!picker.hidden) picker.querySelector("input").focus();
      return;
    }
    picker?.remove();
    picker = document.createElement("section");
    picker.className = "gifrift-picker";
    picker.setAttribute("aria-label", "Partager un GIF GIPHY");
    const heading = document.createElement("div");
    heading.className = "gifrift-picker-heading";
    const title = document.createElement("strong");
    title.textContent = "GIFRIFT";
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Fermer");
    close.addEventListener("click", () => { picker.hidden = true; });
    heading.append(title, close);
    const searchLink = document.createElement("a");
    searchLink.href = "https://giphy.com/search/gifs";
    searchLink.target = "_blank";
    searchLink.rel = "noopener noreferrer";
    searchLink.textContent = "Chercher un GIF sur GIPHY";
    searchLink.className = "gifrift-search-link";
    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "Colle ici le lien du GIF";
    input.setAttribute("aria-label", "Lien GIPHY");
    input.maxLength = 1024;
    const info = document.createElement("p");
    info.className = "gifrift-picker-info";
    info.setAttribute("role", "status");
    const preview = document.createElement("img");
    preview.className = "gifrift-link-preview";
    preview.alt = "Aperçu du GIF";
    preview.hidden = true;
    const select = document.createElement("button");
    select.className = "gifrift-insert";
    select.type = "button";
    select.textContent = "Insérer dans le chat";
    select.disabled = true;
    input.addEventListener("input", () => {
      const id = giphyId(input.value);
      select.disabled = !id;
      preview.hidden = !id;
      if (id) {
        preview.src = `https://media.giphy.com/media/${id}/200.gif`;
        info.textContent = "GIF prêt. L'envoi reste manuel avec Entrée.";
      } else {
        preview.removeAttribute("src");
        info.textContent = "Colle le lien d'un GIF GIPHY.";
      }
    });
    select.addEventListener("click", () => {
      const id = giphyId(input.value);
      if (!id) return;
      if (insertMarker(document.querySelector(INPUT_SELECTOR), `[gifrift:g:${id}]`)) picker.hidden = true;
      else info.textContent = "Efface d'abord le message déjà présent dans le chat.";
    });
    picker.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      picker.hidden = true;
      knownButton?.focus();
    });
    info.textContent = "Colle le lien d'un GIF GIPHY.";
    const credit = document.createElement("div");
    credit.className = "gifrift-attribution";
    credit.textContent = "GIF hébergé par GIPHY";
    picker.append(heading, searchLink, input, info, preview, select, credit);
    host.classList.add("gifrift-picker-host");
    host.append(picker);
    input.focus();
  }

  function clean(row) {
    const media = row.querySelector("[data-gifrift-media]");
    if (!media) return;
    const source = media.previousElementSibling;
    if (source?.matches(".text-fragment")) source.hidden = false;
    media.remove();
  }

  function renderGif(row, source, id) {
    if (!row.isConnected || !source.isConnected || row.querySelector("[data-gifrift-media]")) return;
    const container = document.createElement("span");
    container.dataset.gifriftMedia = "1";
    container.dataset.gifriftId = id;
    container.className = "gifrift-media-container";
    const image = document.createElement("img");
    image.className = "gifrift-media";
    image.alt = "GIF animé partagé avec GIFRIFT";
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("load", () => {
      if (container.isConnected && enabled && (!motion.matches || allowMotion)) source.hidden = true;
    }, { once: true });
    image.addEventListener("error", () => { clean(row); }, { once: true });
    image.src = id === "demo" ? chrome.runtime.getURL("assets/demo.gif") : `https://media.giphy.com/media/${id}/200.gif`;
    const credit = document.createElement("span");
    credit.className = "gifrift-attribution";
    credit.textContent = "GIF via GIPHY";
    container.append(image, credit);
    source.after(container);
  }

  function update() {
    queued = false;
    const input = document.querySelector(INPUT_SELECTOR);
    const bar = document.querySelector(BUTTONS_SELECTOR);
    if (input && bar && (input !== knownInput || knownButton?.parentElement !== bar)) {
      knownButton?.remove();
      knownInput = input;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gifrift-button";
      button.textContent = "GIF";
      button.setAttribute("aria-label", "Ouvrir la recherche de GIFs");
      button.title = "GIFRIFT : chercher une animation GIPHY";
      button.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "open-giphy" }, response => {
          if (chrome.runtime.lastError || !response?.ok) openPicker(bar);
        });
      });
      const controls = [...bar.children].find(child => child.querySelector(".shield-mode-shortcut__btn"));
      const send = bar.querySelector('[data-a-target="chat-send-button"]');
      const sendContainer = [...bar.children].find(child => child.contains(send));
      if (controls || sendContainer) bar.insertBefore(button, controls || sendContainer);
      else bar.append(button);
      knownButton = button;
    } else if (!input || !bar) {
      knownInput = null;
      knownButton?.remove();
      knownButton = null;
      picker?.remove();
      picker = null;
    }
    let shown = 0;
    for (const row of document.querySelectorAll(ROW_SELECTOR)) {
      const existing = row.querySelector("[data-gifrift-media]");
      if (!enabled || (motion.matches && !allowMotion) || shown >= MAX_GIFS) {
        if (existing) clean(row);
        continue;
      }
      if (existing) {
        const source = existing.previousElementSibling;
        const id = markerId(source?.textContent);
        if (id !== existing.dataset.gifriftId) clean(row);
        else { shown++; continue; }
      }
      const fragment = [...row.querySelectorAll(".text-fragment")]
        .find(el => markerId(el.textContent) && !el.closest("a,button"));
      if (!fragment) continue;
      const id = markerId(fragment.textContent);
      renderGif(row, fragment, id);
      shown++;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  motion.addEventListener("change", schedule);
  chrome.storage.local.get({ enabled: true, allowMotion: false }, values => {
    enabled = values.enabled !== false;
    allowMotion = values.allowMotion === true;
    schedule();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.enabled) enabled = changes.enabled.newValue !== false;
    if (changes.allowMotion) allowMotion = changes.allowMotion.newValue === true;
    schedule();
  });
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message?.type !== "gifrift-insert" || !/^[A-Za-z0-9]{6,40}$/.test(message.id ?? "")) return;
    const ok = insertMarker(document.querySelector(INPUT_SELECTOR), `[gifrift:g:${message.id}]`);
    respond({ ok });
  });
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  schedule();
})();
