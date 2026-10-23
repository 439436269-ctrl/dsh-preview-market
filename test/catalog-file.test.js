import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { catalogPayload } from "../lib/catalog.js";

test("catalog.json matches the shipped catalog", async () => {
  const onDisk = JSON.parse(await readFile(new URL("../catalog.json", import.meta.url), "utf8"));
  assert.deepEqual(onDisk, catalogPayload());
});
