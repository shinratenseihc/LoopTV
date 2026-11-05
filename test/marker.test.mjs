import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMarker } from "../marker.js";

test("accepts only a complete canonical marker", () => {
  assert.equal(parseMarker("[gifrift:demo]"), "demo");
  assert.equal(parseMarker("[gifrift:a_0-9]"), "a_0-9");
  for (const value of ["", " [gifrift:demo]", "[gifrift:demo] ", "[gifrift:DEMO]", "[gifrift:../demo]", "[gifrift:demo]<img>", "[gifrift:]", "[gifrift:" + "x".repeat(41) + "]", null, {}, "[gifrift:demo]\n"]) {
    assert.equal(parseMarker(value), null, String(value));
  }
});
