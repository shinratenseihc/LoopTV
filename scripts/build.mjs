// Builds the same extension for Chromium and Firefox without a bundler or npm dependencies.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = join(root, "dist");
const files = ["background.js", "klipy-api.js", "klipy-config.js", "popup.html", "popup.js", "popup.css", "twitch.js", "twitch.css", "name-paints.js", "name-paints.css", "cyan-chat.js", "cyan-chat.css", "assets/demo.gif", "assets/looptv-logo.webp"];
const icons = [16, 48, 96, 128].map(n => `icons/icon-${n}.png`);

function createManifest(firefox) {
  const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
  manifest.icons = Object.fromEntries([16, 48, 96, 128].map(n => [n, `icons/icon-${n}.png`]));
  manifest.action.default_icon = manifest.icons;
  if (firefox) {
    // Firefox MV3 uses an event page; its background scripts support ES module imports.
    manifest.background = { scripts: ["background.js"], type: "module" };
    manifest.browser_specific_settings = {
      gecko: {
        id: "looptv@shinratenseihc",
        strict_min_version: "140.0",
        // Search terms go directly to KLIPY, never to a LoopTV-owned server.
        data_collection_permissions: { required: ["searchTerms"] }
      }
    };
  }
  return manifest;
}

function packageExtension(firefox) {
  const targetName = firefox ? "firefox" : "chromium";
  const target = join(dist, targetName);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  for (const filename of [...files, ...icons]) {
    const from = join(root, filename);
    if (!existsSync(from)) throw new Error(`Fichier requis manquant : ${filename}`);
    const to = join(target, filename);
    mkdirSync(resolve(to, ".."), { recursive: true });
    cpSync(from, to);
  }
  writeFileSync(join(target, "manifest.json"), JSON.stringify(createManifest(firefox), null, 2) + "\n");
  const version = JSON.parse(readFileSync(join(target, "manifest.json"), "utf8")).version;
  const zipPath = join(dist, `LoopTV-${version}-${targetName}.zip`);
  rmSync(zipPath, { force: true });
  // Windows PowerShell supplies native ZIP packaging, no extra npm dependency.
  const args = ["-NoProfile", "-NonInteractive", "-Command", "$src = $env:LOOPTV_DIST_SOURCE; $dst = $env:LOOPTV_DIST_ARCHIVE; Compress-Archive -Path (Join-Path $src '*') -DestinationPath $dst -Force"];
  const result = spawnSync("powershell.exe", args, { encoding: "utf8", windowsHide: true, env: { ...process.env, LOOPTV_DIST_SOURCE: target, LOOPTV_DIST_ARCHIVE: zipPath } });
  if (result.status !== 0) throw new Error(`Échec ZIP ${targetName}: ${(result.stderr || result.stdout || "").trim()}`);
  return zipPath;
}

function main() {
  const configFile = join(root, "klipy-config.js");
  if (!existsSync(configFile)) throw new Error("Configuration KLIPY locale absente. Build annulé.");
  const content = readFileSync(configFile, "utf8");
  if (!/export\s+const\s+KLIPY_APP_KEY\s*=\s*["'][^"']{8,}["']\s*;?/u.test(content) || content.includes("REPLACE_WITH_KLIPY_APP_KEY")) {
    throw new Error("Configuration KLIPY locale invalide. Build annulé.");
  }
  for (const filename of [...files, ...icons]) {
    if (!existsSync(join(root, filename))) throw new Error(`Fichier requis manquant : ${filename}`);
  }
  mkdirSync(dist, { recursive: true });
  const archives = [packageExtension(false), packageExtension(true)];
  for (const archive of archives) console.log(`Créé : ${archive}`);
  console.log("Clé bêta incluse dans les archives (extractible côté client), jamais affichée dans les logs.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

export { createManifest };
