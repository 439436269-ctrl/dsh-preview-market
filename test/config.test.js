import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, resolveConfig } from "../lib/config.js";

test("defaults keep the route under /api", () => {
  assert.deepEqual(resolveConfig(), DEFAULTS);
  assert.equal(resolveConfig().routeRoot, "/api/preview-market");
});

test("a route outside /api falls back to the fenced default", () => {
  assert.equal(resolveConfig({ routeRoot: "/preview-market" }).routeRoot, DEFAULTS.routeRoot);
  assert.equal(resolveConfig({ routeRoot: "preview-market" }).routeRoot, DEFAULTS.routeRoot);
  assert.equal(resolveConfig({ routeRoot: "/api/custom/" }).routeRoot, "/api/custom");
});

test("enabled and debug are boolean, profileDir is trimmed", () => {
  const config = resolveConfig({ enabled: false, debug: true, profileDir: "  C:/profiles/desktop  " });
  assert.equal(config.enabled, false);
  assert.equal(config.debug, true);
  assert.equal(config.profileDir, "C:/profiles/desktop");
});
