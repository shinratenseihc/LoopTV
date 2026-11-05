const enabled = document.querySelector("#enabled");
const allowMotion = document.querySelector("#allow-motion");
const namePaintsEnabled = document.querySelector("#name-paints");
const namePaintsAnimated = document.querySelector("#name-paints-animated");
const previewName = document.querySelector("#paint-preview-name");
const previewInput = document.querySelector("#paint-preview-input");
const paletteList = document.querySelector("#paint-palette-list");
const paintChoiceNote = document.querySelector("#paint-choice-note");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let namePaintPalette = "auto";
const tabButtons = [...document.querySelectorAll(".popup-tab")];

function showTab(name, save = true) {
  const selected = name === "paints" ? "paints" : "gifs";
  for (const button of tabButtons) {
    const active = button.id === `tab-${selected}`;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    document.querySelector(`#panel-${button.id.slice(4)}`).hidden = !active;
  }
  if (save) chrome.storage.local.set({ popupTab: selected });
}

for (const button of tabButtons) {
  button.addEventListener("click", () => showTab(button.id.slice(4)));
  button.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" || event.key === "ArrowLeft" ? tabButtons[0] : tabButtons[1];
    showTab(next.id.slice(4));
    next.focus();
  });
}

const availablePalettes = [{ id: "auto", label: "Auto" }, ...LoopTVNamePaints.palettes];
for (const palette of availablePalettes) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "paint-palette-choice";
  button.dataset.paletteId = palette.id;
  button.setAttribute("aria-label", `Dégradé ${palette.label}`);
  button.setAttribute("aria-pressed", "false");
  const sample = document.createElement("span");
  sample.className = "paint-palette-choice-sample";
  sample.style.backgroundImage = LoopTVNamePaints.gradientFor("LoopTV", palette.id);
  const label = document.createElement("span");
  label.textContent = palette.label;
  button.append(sample, label);
  button.addEventListener("click", () => {
    namePaintPalette = palette.id;
    chrome.storage.local.set({ namePaintPalette });
    updatePreview();
  });
  paletteList.append(button);
}

function updatePreview() {
  const name = previewInput.value.trim() || "LoopTV";
  previewName.textContent = name;
  previewName.style.setProperty("--looptv-name-gradient", LoopTVNamePaints.gradientFor(name, namePaintPalette));
  previewName.classList.toggle("looptv-name-paint", namePaintsEnabled.checked);
  previewName.classList.toggle("looptv-name-paint-motion", namePaintsEnabled.checked &&
    namePaintsAnimated.checked && !motion.matches);
  namePaintsAnimated.disabled = !namePaintsEnabled.checked;
  for (const button of paletteList.children) {
    button.setAttribute("aria-pressed", String(button.dataset.paletteId === namePaintPalette));
  }
  paintChoiceNote.textContent = namePaintPalette === "auto"
    ? "Auto : l'aperçu est indicatif, Twitch peut choisir un autre dégradé."
    : previewInput.value.trim()
      ? "Choix local : visible seulement chez toi."
      : "Entre ton pseudo pour appliquer ce choix dans ton chat.";
}

chrome.storage.local.get({ enabled: true, allowMotion: false, namePaintsEnabled: true,
  namePaintsAnimated: false, namePaintTarget: "", namePaintPalette: "auto", popupTab: "gifs" }, settings => {
  enabled.checked = settings.enabled !== false;
  allowMotion.checked = settings.allowMotion === true;
  namePaintsEnabled.checked = settings.namePaintsEnabled !== false;
  namePaintsAnimated.checked = settings.namePaintsAnimated === true;
  previewInput.value = typeof settings.namePaintTarget === "string" ? settings.namePaintTarget : "";
  namePaintPalette = availablePalettes.some(palette => palette.id === settings.namePaintPalette)
    ? settings.namePaintPalette : "auto";
  showTab(settings.popupTab, false);
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
previewInput.addEventListener("input", () => {
  chrome.storage.local.set({ namePaintTarget: previewInput.value.trim() });
  updatePreview();
});
motion.addEventListener("change", updatePreview);
