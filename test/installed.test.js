import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readInstalled, resolveProfileDir } from "../lib/installed.js";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "preview-market-installed-"));
  await mkdir(join(root, "node_modules", "dsh-preview-stl"), { recursive: true });
  await mkdir(join(root, "node_modules", "dsh-preview-media"), { recursive: true });
  await mkdir(join(root, "node_modules", "other-plugin"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({
    dependencies: {
      "dsh-preview-stl": "0.1.0",
      "dsh-preview-media": "0.1.4",
      "other-plugin": "1.0.0"
    }
  }));
  await writeFile(join(root, "node_modules", "dsh-preview-stl", "package.json"), JSON.stringify({
    name: "dsh-preview-stl",
    version: "0.1.0"
  }));
  await writeFile(join(root, "node_modules", "dsh-preview-media", "package.json"), JSON.stringify({
    name: "dsh-preview-media",
    version: "0.1.4",
    dsh: { preview: { capability: "media", kind: "media", extensions: ["mp4"] } }
  }));
  await writeFile(join(root, "node_modules", "other-plugin", "package.json"), JSON.stringify({
    name: "other-plugin",
    version: "1.0.0"
  }));
  return root;
}

test("readInstalled reports catalog packages and manifest-bearing plugins only", async () => {
  const root = await fixture();
  const result = await readInstalled(root);
  assert.equal(result.profileDir, root);
  assert.deepEqual(result.installed.map((entry) => entry.name).sort(), ["dsh-preview-media", "dsh-preview-stl"]);
  const stl = result.installed.find((entry) => entry.name === "dsh-preview-stl");
  assert.equal(stl.version, "0.1.0");
  assert.equal(stl.capability, "stl");
  assert.deepEqual(stl.extensions, ["stl"]);
  const media = result.installed.find((entry) => entry.name === "dsh-preview-media");
  assert.equal(media.version, "0.1.4");
  assert.equal(media.capability, "media");
});

test("a missing profile package.json yields an empty inventory", async () => {
  const root = await mkdtemp(join(tmpdir(), "preview-market-missing-"));
  const result = await readInstalled(root);
  assert.deepEqual(result.installed, []);
});

test("resolveProfileDir prefers the explicit config, then profileContext", () => {
  assert.equal(resolveProfileDir({}, " C:/profiles/custom "), "C:/profiles/custom");
  assert.equal(resolveProfileDir({ get: () => ({ dir: "C:/profiles/launched" }) }, ""), "C:/profiles/launched");
});
