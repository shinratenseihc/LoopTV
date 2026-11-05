const enabled = document.querySelector("#enabled");
const allowMotion = document.querySelector("#allow-motion");
const namePaintsEnabled = document.querySelector("#name-paints");
const namePaintsAnimated = document.querySelector("#name-paints-animated");
const previewName = document.querySelector("#paint-preview-name");
const previewInput = document.querySelector("#paint-preview-input");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function updatePreview() {
  const name = previewInput.value.trim() || "LoopTV";
  previewName.textContent = name;
  previewName.style.setProperty("--looptv-name-gradient", LoopTVNamePaints.gradientFor(name));
  previewName.classList.toggle("looptv-name-paint", namePaintsEnabled.checked);
  previewName.classList.toggle("looptv-name-paint-motion", namePaintsEnabled.checked &&
    namePaintsAnimated.checked && !motion.matches);
  namePaintsAnimated.disabled = !namePaintsEnabled.checked;
}

chrome.storage.local.get({ enabled: true, allowMotion: false, namePaintsEnabled: true, namePaintsAnimated: false }, settings => {
  enabled.checked = settings.enabled !== false;
  allowMotion.checked = settings.allowMotion === true;
  namePaintsEnabled.checked = settings.namePaintsEnabled !== false;
  namePaintsAnimated.checked = settings.namePaintsAnimated === true;
  updatePreview();
});
enabled.addEventListener("change", () => chrome.storage.local.set({ enabled: enabled.checked }));
allowMotion.addEventListener("change", () => chrome.storage.local.set({ allowMotion: allowMotion.checked }));
namePaintsEnabled.addEventListener("change", () => {
  chrome.storage.local.set({ namePaintsEnabled: namePaintsEnabled.checked });
  updatePreview();
});
namePaintsAnimated.addEventListener("change", () => {
  chrome.storage.local.set({ namePaintsAnimated: namePaintsAnimated.checked });
  updatePreview();
});
previewInput.addEventListener("input", updatePreview);
motion.addEventListener("change", updatePreview);
