import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOG, CATALOG_SCHEMA, catalogPayload } from "../lib/catalog.js";

test("the catalog lists the three first-party preview plugins", () => {
  assert.deepEqual(CATALOG.map((entry) => entry.name), [
    "dsh-preview-media",
    "dsh-preview-blender",
    "dsh-preview-stl"
  ]);
  assert.equal(CATALOG_SCHEMA, 1);
});

test("every entry has the fields the market renders and validates", () => {
  for (const entry of CATALOG) {
    assert.match(entry.name, /^dsh-preview-/);
    assert.match(entry.repo, /^https:\/\/github\.com\/439436269-ctrl\//);
    assert.ok(["media", "three"].includes(entry.kind));
    assert.ok(Array.isArray(entry.extensions) && entry.extensions.length > 0);
    assert.ok(Array.isArray(entry.requires));
    assert.equal(typeof entry.version, "string");
    assert.equal(typeof entry.description.zh, "string");
    assert.equal(typeof entry.description.en, "string");
  }
});

test("the payload keeps schema and plugins together", () => {
  assert.deepEqual(catalogPayload(), { schema: 1, plugins: CATALOG });
});
