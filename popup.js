const enabled = document.querySelector("#enabled");
const allowMotion = document.querySelector("#allow-motion");
chrome.storage.local.get({ enabled: true, allowMotion: false }, settings => {
  enabled.checked = settings.enabled !== false;
  allowMotion.checked = settings.allowMotion === true;
});
enabled.addEventListener("change", () => chrome.storage.local.set({ enabled: enabled.checked }));
allowMotion.addEventListener("change", () => chrome.storage.local.set({ allowMotion: allowMotion.checked }));
