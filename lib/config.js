/**
 * Host configuration defaults and normalization for the preview market.
 *
 * The schemastery schema lives in `./schema.js` so this module stays importable
 * without the host-supplied `@deepseek-ai/schemastery` package (unit tests and
 * the routes run against these helpers directly).
 *
 * @module dsh-preview-market/config
 */

/** Default authenticated route root. */
export const DEFAULT_ROUTE_ROOT = "/api/preview-market";

/** Fallback when the loader supplies no config object at all. */
export const DEFAULTS = Object.freeze({
  enabled: true,
  routeRoot: DEFAULT_ROUTE_ROOT,
  profileDir: "",
  debug: false,
});

/**
 * Merge a loader-supplied config over the defaults.
 * @param config - whatever the loader supplied.
 * @returns a complete, validated-enough config.
 */
export function resolveConfig(config) {
  const input = config !== null && typeof config === "object" ? config : {};
  return {
    enabled: input.enabled === undefined ? DEFAULTS.enabled : input.enabled === true,
    routeRoot: normalizeRouteRoot(input.routeRoot),
    profileDir: typeof input.profileDir === "string" ? input.profileDir.trim() : "",
    debug: input.debug === undefined ? DEFAULTS.debug : input.debug === true,
  };
}

/** Keep the route root under /api; anything else would skip the authenticated fence. */
function normalizeRouteRoot(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  const candidate = raw === "" ? DEFAULTS.routeRoot : raw;
  const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
  if (!withSlash.startsWith("/api/")) return DEFAULTS.routeRoot;
  return withSlash.replace(/\/+$/, "");
}
