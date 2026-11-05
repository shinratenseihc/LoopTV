import { mountChat } from "./render.js";

const chat = document.querySelector("#chat");
const checkbox = document.querySelector("#enabled");
const allowMotion = document.querySelector("#allow-motion");
const stats = document.querySelector("#stats");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const renderer = mountChat(chat, {
  enabled: () => checkbox.checked,
  reducedMotion: () => motion.matches && !allowMotion.checked
});

function update() {
  renderer.refresh();
  const { rendered, limit } = renderer.stats();
  stats.textContent = `${chat.children.length} messages · ${rendered}/${limit} GIFs affichés`;
  document.querySelector("#motion").textContent = motion.matches
    ? (allowMotion.checked ? "GIFs animés autorisés par GIFRIFT." : "Windows réduit les animations : GIFRIFT affiche les marqueurs en texte.")
    : "Animations autorisées par le système.";
}

function addMessage(text, sender = "Viewer") {
  const row = document.createElement("div");
  row.className = "message";
  const name = document.createElement("b");
  name.textContent = `${sender} :`;
  const message = document.createElement("span");
  message.dataset.chatMessage = "";
  message.textContent = text;
  row.append(name, " ", message);
  chat.append(row);
  update();
}

checkbox.addEventListener("change", () => {
  if (globalThis.chrome?.storage?.local) chrome.storage.local.set({ enabled: checkbox.checked });
  update();
});
allowMotion.addEventListener("change", () => {
  if (globalThis.chrome?.storage?.local) chrome.storage.local.set({ allowMotion: allowMotion.checked });
  update();
});
motion.addEventListener("change", update);
document.querySelector("#add").addEventListener("click", () => addMessage("[gifrift:demo]"));
document.querySelector("#remove").addEventListener("click", () => {
  chat.lastElementChild?.remove();
  update();
});
document.querySelector("#clear").addEventListener("click", () => {
  chat.replaceChildren();
  update();
});
document.querySelector("#stress").addEventListener("click", () => {
  const batch = document.createDocumentFragment();
  for (let i = 0; i < 100; i++) {
    const row = document.createElement("div");
    row.className = "message";
    const name = document.createElement("b");
    name.textContent = "Viewer :";
    const msg = document.createElement("span");
    msg.dataset.chatMessage = "";
    msg.textContent = i % 4 === 0 ? "[gifrift:demo]" : "Message de test";
    row.append(name, " ", msg);
    batch.append(row);
  }
  chat.append(batch);
  update();
});
if (globalThis.chrome?.storage?.local) {
  chrome.storage.local.get({ enabled: true, allowMotion: false }, ({ enabled, allowMotion: allowMotionSetting }) => {
    checkbox.checked = enabled !== false;
    allowMotion.checked = allowMotionSetting === true;
    update();
  });
}
update();
