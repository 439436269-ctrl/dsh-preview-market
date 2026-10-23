/**
 * Installed-package inventory for the preview market.
 *
 * The market does not install packages itself in 0.1.0: it reports what the
 * active profile already has and links installs/updates to dsh-market or the
 * official `dsh plugin add` command. Reading package.json plus each package's
 * manifest is enough to render an accurate installed view without importing
 * any child plugin code.
 *
 * @module dsh-preview-market/installed
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { CATALOG } from "./catalog.js";

/**
 * Resolve the profile directory the Host is running from.
 * @param ctx - host context (uses `profileContext` when available).
 * @param configured - explicit `profileDir` config, or empty.
 * @returns an absolute profile directory.
 */
export function resolveProfileDir(ctx, configured) {
  if (typeof configured === "string" && configured.trim() !== "") return configured.trim();
  const context = typeof ctx?.get === "function" ? ctx.get("profileContext") : undefined;
  if (context !== null && typeof context === "object" && typeof context.dir === "string" && context.dir !== "") {
    return context.dir;
  }
  const home = typeof process.env.DSH_HOME === "string" && process.env.DSH_HOME.trim() !== ""
    ? process.env.DSH_HOME.trim()
    : join(homedir(), ".dsh");
  return join(home, "profiles", "desktop");
}

/**
 * Read the profile's direct dependencies and the preview manifest of each.
 * @param profileDir - absolute profile directory.
 * @returns `{ profileDir, installed }`, where installed entries carry the
 *   catalog metadata when known and the package's own `dsh.preview` otherwise.
 */
export async function readInstalled(profileDir) {
  let manifest = {};
  try {
    manifest = JSON.parse(await readFile(join(profileDir, "package.json"), "utf8"));
  } catch {
    return { profileDir, installed: [] };
  }
  const dependencies = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
  };
  const catalogByName = new Map(CATALOG.map((entry) => [entry.name, entry]));
  const installed = [];
  for (const name of Object.keys(dependencies)) {
    let pkg;
    try {
      pkg = JSON.parse(await readFile(join(profileDir, "node_modules", name, "package.json"), "utf8"));
    } catch {
      continue;
    }
    const preview = pkg?.dsh?.preview;
    const known = catalogByName.get(name);
    if (known === undefined && (preview === null || typeof preview !== "object")) continue;
    installed.push({
      name,
      version: typeof pkg.version === "string" ? pkg.version : "",
      capability: (known?.capability ?? preview?.capability ?? ""),
      kind: (known?.kind ?? preview?.kind ?? ""),
      extensions: (known?.extensions ?? preview?.extensions ?? []),
      requires: (known?.requires ?? preview?.requires ?? []),
    });
  }
  return { profileDir, installed };
}
