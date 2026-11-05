(() => {
  "use strict";
  const VALID_ID = /^[A-Za-z0-9]{6,40}$/;

  function idFromLink(link) {
    let url;
    try { url = new URL(link, location.href); } catch { return null; }
    if (url.protocol !== "https:" || !["giphy.com", "www.giphy.com"].includes(url.hostname)) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2 || !["gifs", "media"].includes(parts[0])) return null;
    const id = parts[0] === "gifs" ? parts[1].split("-").at(-1) : parts[1];
    return VALID_ID.test(id ?? "") ? id : null;
  }

  chrome.runtime.sendMessage({ type: "picker-status" }, result => {
    if (chrome.runtime.lastError || !result?.ok) return;
    const compactStyle = document.createElement("style");
    compactStyle.id = "gifrift-compact-style";
    compactStyle.textContent = `
      html.gifrift-compact body * { visibility: hidden !important; }
      html.gifrift-compact .giphy-search-bar,
      html.gifrift-compact .giphy-search-bar *,
      html.gifrift-compact .giphy-grid,
      html.gifrift-compact .giphy-grid *,
      html.gifrift-compact #gifrift-giphy-guide {
        visibility: visible !important;
      }
      html.gifrift-compact body { overflow: hidden !important; }
      html.gifrift-compact .giphy-search-bar {
        position: fixed !important;
        top: 0 !important; left: 0 !important; right: 0 !important;
        z-index: 2147483646 !important;
        width: auto !important; max-width: none !important;
        height: 56px !important; padding: 0 !important; margin: 0 !important;
        background: #121212 !important;
      }
      html.gifrift-compact .giphy-search-bar input {
        font-size: 14px !important;
      }
      html.gifrift-compact .giphy-grid {
        position: fixed !important;
        top: 56px !important; bottom: 0 !important;
        left: 0 !important; right: 0 !important;
        z-index: 2147483645 !important;
        width: auto !important; height: auto !important;
        max-height: none !important;
        padding: 6px !important;
        overflow-y: auto !important; overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        background: #121212 !important;
      }
    `;
    document.head.append(compactStyle);
    function applyCompact() {
      const grid = document.querySelector(".giphy-grid");
      const search = document.querySelector(".giphy-search-bar");
      if (!grid || !search) return;
      document.documentElement.classList.add("gifrift-compact");
      // Do not leave the native search suggestions covering the grid on launch.
      if (document.activeElement?.closest?.(".giphy-search-bar")) document.activeElement.blur();
    }
    applyCompact();
    const compactObserver = new MutationObserver(() => {
      if (!document.documentElement.classList.contains("gifrift-compact")) applyCompact();
    });
    compactObserver.observe(document.body, { childList: true, subtree: true });
    const banner = document.createElement("aside");
    banner.id = "gifrift-giphy-guide";
    banner.textContent = "GIFRIFT · Clique sur un GIF";
    banner.style.cssText = "position:fixed;bottom:8px;right:10px;z-index:2147483647;max-width:175px;padding:5px 8px;border:1px solid #a970ff;border-radius:6px;background:#20152d;color:white;font:600 10px/1.3 system-ui,sans-serif;box-shadow:0 4px 14px #0008;pointer-events:none;opacity:.9";
    document.body.append(banner);

    let busy = false;
    document.addEventListener("click", event => {
      if (busy || !event.target?.closest) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      const id = idFromLink(anchor.href);
      if (!id) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      busy = true;
      banner.textContent = "GIFRIFT · Préparation du GIF…";
      chrome.runtime.sendMessage({ type: "picker-select", id }, result => {
        busy = false;
        if (chrome.runtime.lastError || !result?.ok) {
          banner.textContent = "GIFRIFT · Champ Twitch occupé ou introuvable. Vide le message et réessaie.";
        }
      });
    }, true);
  });
})();
