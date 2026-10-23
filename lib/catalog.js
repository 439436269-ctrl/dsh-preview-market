/**
 * The vertical preview catalog shipped with this release.
 *
 * One JSON file per plugin lives in `catalog/plugins/`; a third-party
 * submission adds exactly one file and opens a PR. The Host reads and validates
 * every file at startup, so adding an entry never requires touching this module.
 *
 * @module dsh-preview-market/catalog
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Catalog schema version. */
export const CATALOG_SCHEMA = 1;

const PLUGIN_DIR = fileURLToPath(new URL("../catalog/plugins/", import.meta.url));
const REQUIRED = [
  "name",
  "npm",
  "capability",
  "kind",
  "repo",
  "version",
  "description"
];

/** Derive `<owner>__<repo>` from a GitHub repository URL. */
function repoTuple(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`invalid repo URL: ${url}`);
  }
  if (parsed.hostname !== "github.com") throw new Error(`repo must be a github.com URL: ${url}`);
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error(`repo must point at a repository: ${url}`);
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");
  return { owner, repo };
}

function loadCatalog() {
  const files = readdirSync(PLUGIN_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (files.length === 0) throw new Error("catalog/plugins has no entries");

  const seen = new Set();
  return Object.freeze(
    files.map((file) => {
      let entry;
      try {
        entry = JSON.parse(readFileSync(join(PLUGIN_DIR, file), "utf8"));
      } catch (error) {
        throw new Error(`catalog/plugins/${file}: invalid JSON (${error.message})`);
      }
      for (const key of REQUIRED) {
        if (entry[key] === undefined) throw new Error(`catalog/plugins/${file}: missing ${key}`);
      }
      if (typeof entry.description?.zh !== "string" || typeof entry.description?.en !== "string") {
        throw new Error(`catalog/plugins/${file}: description.zh/en must be strings`);
      }
      if (entry.kind === "tool") {
        entry.extensions = [];
        entry.formats = {};
      } else {
        if (!Array.isArray(entry.extensions) || entry.extensions.length === 0) {
          throw new Error(`catalog/plugins/${file}: extensions must be a non-empty array`);
        }
        if (typeof entry.formats !== "object" || entry.formats === null) {
          throw new Error(`catalog/plugins/${file}: formats must be an object`);
        }
      }
      if (seen.has(entry.name)) throw new Error(`duplicate catalog name: ${entry.name}`);
      seen.add(entry.name);
      entry.requires = Array.isArray(entry.requires) ? entry.requires : [];

      const { owner, repo } = repoTuple(entry.repo);
      const stem = file.slice(0, -".json".length);
      if (stem !== `${owner}__${repo}`) {
        throw new Error(`catalog/plugins/${file}: filename must be ${owner}__${repo}.json`);
      }
      return Object.freeze(entry);
    })
  );
}

/** The catalog, loaded from one file per plugin. */
export const CATALOG = loadCatalog();

/** The catalog payload sent to the browser. */
export function catalogPayload() {
  return { schema: CATALOG_SCHEMA, plugins: CATALOG };
}
