import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CATALOG, CATALOG_SCHEMA, catalogPayload } from "../lib/catalog.js";

const PLUGIN_DIR = fileURLToPath(new URL("../catalog/plugins/", import.meta.url));

test("the first-party preview plugins are present", () => {
  for (const name of ["dsh-preview-media", "dsh-preview-blender", "dsh-preview-stl"]) {
    assert.ok(CATALOG.some((entry) => entry.name === name), `${name} missing`);
  }
  assert.equal(CATALOG_SCHEMA, 1);
});

test("every entry has the fields the market renders and validates", () => {
  for (const entry of CATALOG) {
    assert.match(entry.name, /^[a-z0-9][a-z0-9-]*$/);
    assert.match(entry.npm, /^[a-z0-9][a-z0-9-]*$/);
    assert.match(entry.repo, /^https:\/\/github\.com\//);
    assert.equal(typeof entry.kind, "string");
    assert.ok(Array.isArray(entry.extensions) && entry.extensions.length > 0);
    assert.ok(Array.isArray(entry.requires));
    assert.equal(typeof entry.version, "string");
    assert.equal(typeof entry.description.zh, "string");
    assert.equal(typeof entry.description.en, "string");
  }
});

test("each entry lives in exactly one catalog/plugins file", () => {
  const files = readdirSync(PLUGIN_DIR).filter((file) => file.endsWith(".json")).sort();
  assert.equal(files.length, CATALOG.length);
  for (const file of files) {
    const entry = JSON.parse(readFileSync(new URL(`../catalog/plugins/${file}`, import.meta.url), "utf8"));
    const stem = file.slice(0, -".json".length);
    const repo = entry.repo.split("/").slice(-2);
    assert.equal(stem, `${repo[0]}__${repo[1]}`);
    assert.ok(CATALOG.some((candidate) => candidate.name === entry.name));
  }
});

test("the payload keeps schema and plugins together", () => {
  assert.deepEqual(catalogPayload(), { schema: 1, plugins: CATALOG });
});
