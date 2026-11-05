import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../name-paints.js", import.meta.url), "utf8");
const paints = runInNewContext(`${source}\nLoopTVNamePaints;`);

test("Name Paints are stable across clients, case, and Unicode normalization", () => {
  const one = paints.gradientFor("ShinraTensei");
  assert.match(one, /^linear-gradient\(\d+deg, #[0-9a-f]{6}, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
  assert.equal(one, paints.gradientFor("shinratensei"));
  assert.equal(one, paints.gradientFor(" SHINRATENSEI "));
  assert.equal(paints.gradientFor("élo"), paints.gradientFor("e\u0301lo"));
  assert.notEqual(one, paints.gradientFor("AnotherViewer"));
});

test("Name Paints reject invalid or excessive names and cannot generate executable CSS", () => {
  assert.equal(paints.gradientFor(""), null);
  assert.equal(paints.gradientFor(null), null);
  assert.equal(paints.gradientFor("x".repeat(81)), null);
  assert.match(paints.gradientFor("a');background:url(https://invalid.example)"), /^linear-gradient\([#0-9a-z, ]+\)$/);
});

test("48 original free palettes can be selected without arbitrary CSS", () => {
  assert.equal(paints.palettes.length, 48);
  const styles = new Set(paints.palettes.map(palette => paints.gradientFor("ShinraTensei", palette.id)));
  assert.equal(styles.size, 48);
  assert.equal(new Set(paints.palettes.map(palette => palette.id)).size, 48);
  assert.equal(new Set(paints.palettes.map(palette => palette.group)).size, 6);
  assert.equal(paints.gradientFor("SHINRATENSEI", "neon"), paints.gradientFor("shinratensei", "neon"));
  assert.equal(paints.gradientFor("ShinraTensei", "invalid'); background:url(https://example.com)"),
    paints.gradientFor("ShinraTensei"));
  assert.equal(paints.paintFor("ShinraTensei", "plasma").effect, "glow");
  assert.equal(paints.paintFor("ShinraTensei", "chrome").effect, "metal");
  assert.equal(paints.paintFor("ShinraTensei", "mint").effect, "");
  for (const palette of paints.palettes) {
    assert.match(paints.gradientFor("ShinraTensei", palette.id),
      /^linear-gradient\(\d+deg, #[0-9a-f]{6}, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
  }
});

test("Twitch native colors select the same gradient on different clients", () => {
  assert.equal(paints.paletteFromTwitchColor("#ff0000"), "ember");
  assert.equal(paints.paletteFromTwitchColor("rgb(255, 0, 0)"), "ember");
  assert.equal(paints.paletteFromTwitchColor("#808080"), null);
  assert.equal(paints.paletteFromTwitchColor("url(https://example.com)"), null);
  assert.equal(paints.paletteFromTwitchColor("rgb(500, 0, 0)"), null);
  assert.equal(paints.gradientFor("ShinraTensei", "auto", "#ff0000"),
    paints.gradientFor("ShinraTensei", "ember"));
  assert.notEqual(paints.gradientFor("ShinraTensei", "auto", "#ff0000"),
    paints.gradientFor("ShinraTensei", "auto", "#0000ff"));
});
