/**
 * Authenticated read-only routes for the preview market.
 *
 * Both routes live under `/api`, so the connection service has already fenced
 * and authenticated the request. They expose only catalog data and the names
 * and versions of installed packages; no child plugin code is imported.
 *
 * @module dsh-preview-market/routes
 */
import { catalogPayload } from "./catalog.js";
import { readInstalled, resolveProfileDir } from "./installed.js";

/** Headers shared by every answer. */
const BASE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

/**
 * Register the market's catalog and installed routes.
 * @param ctx - host context carrying `connection`.
 * @param config - resolved configuration.
 * @returns a disposer that removes both routes.
 */
export function registerMarketRoutes(ctx, config) {
  const disposers = [
    ctx.connection.fetch.register({
      path: `${config.routeRoot}/catalog`,
      methods: ["GET"],
      requestBody: "buffered",
      fetch: () => json(200, { ok: true, ...catalogPayload() }),
    }),
    ctx.connection.fetch.register({
      path: `${config.routeRoot}/installed`,
      methods: ["GET"],
      requestBody: "buffered",
      fetch: async () => {
        try {
          const profileDir = resolveProfileDir(ctx, config.profileDir);
          const context = typeof ctx.get === "function" ? ctx.get("profileContext") : undefined;
          const profile = context !== null && typeof context === "object" && typeof context.name === "string"
            ? context.name
            : "desktop";
          const inventory = await readInstalled(profileDir);
          return json(200, { ok: true, profile, ...inventory });
        } catch (error) {
          return json(500, {
            ok: false,
            error: {
              code: "MARKET_INVENTORY_FAILED",
              message: error instanceof Error ? error.message : String(error),
            },
          });
        }
      },
    }),
  ];
  return () => {
    for (const dispose of disposers) dispose();
  };
}

/** One JSON answer with the shared headers. */
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": String(Buffer.byteLength(JSON.stringify(body))),
    },
  });
}
