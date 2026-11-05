const TWITCH = "https://www.twitch.tv/";
const GIPHY = /^https:\/\/(?:www\.)?giphy\.com\//;
const ID = /^[A-Za-z0-9]{6,40}$/;
const PICKER_URL = "https://giphy.com/search/reaction";

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type === "open-giphy" && sender.url?.startsWith(TWITCH) && Number.isInteger(sender.tab?.id)) {
    chrome.windows.create({
      url: PICKER_URL, type: "popup", width: 390, height: 610, focused: true
    }, async window => {
      if (chrome.runtime.lastError || !window?.id) {
        respond({ error: "window" });
        return;
      }
      await chrome.storage.session.set({ gifriftPicker: { windowId: window.id, tabId: sender.tab.id } });
      respond({ ok: true });
    });
    return true;
  }
  if (!GIPHY.test(sender.url ?? "") || !Number.isInteger(sender.tab?.windowId)) return;
  if (message?.type !== "picker-status" && message?.type !== "picker-select") return;
  (async () => {
    const { gifriftPicker } = await chrome.storage.session.get("gifriftPicker");
    if (gifriftPicker?.windowId !== sender.tab.windowId) return { error: "not-picker" };
    if (message.type === "picker-status") return { ok: true };
    if (!ID.test(message.id ?? "")) return { error: "invalid-id" };
    return await new Promise(resolve => {
      chrome.tabs.sendMessage(gifriftPicker.tabId, {
        type: "gifrift-insert", id: message.id
      }, response => {
        if (chrome.runtime.lastError || !response?.ok) {
          resolve({ error: "twitch-tab", detail: response?.error ?? "editor-unavailable" });
          return;
        }
        chrome.windows.remove(gifriftPicker.windowId, () => {
          void chrome.runtime.lastError;
        });
        chrome.storage.session.remove("gifriftPicker");
        resolve({ ok: true });
      });
    });
  })().then(respond, () => respond({ error: "unavailable" }));
  return true;
});

chrome.windows.onRemoved.addListener(async windowId => {
  const { gifriftPicker } = await chrome.storage.session.get("gifriftPicker");
  if (gifriftPicker?.windowId === windowId) {
    await chrome.storage.session.remove("gifriftPicker");
  }
});
