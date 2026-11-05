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
