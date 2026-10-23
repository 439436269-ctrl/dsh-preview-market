/**
 * dsh-preview-market — a vertical preview market for DeepSeek Harness.
 *
 * The Host half owns the authenticated catalog and installed-package routes.
 * The browser half is a settings tab that lists the catalog, shows which
 * preview plugins the active profile already has, and hands installs/updates
 * to dsh-market (or prints the official `dsh plugin add` command when the
 * general market is not present). It never imports a child plugin's code; each
 * preview plugin remains an independent Loader entry.
 *
 * @module dsh-preview-market
 */
import { resolveConfig } from "./config.js";
import { Config } from "./schema.js";
import { registerMarketRoutes } from "./routes.js";

/** Plugin name, also the settings-page namespace through the bundle patch. */
export const name = "preview-market";

/** Host service the routes need: the authenticated `/api` fence. */
export const inject = ["connection"];

export { Config };

/**
 * Mount the read-only market routes and expose the route root to the browser.
 * @param ctx - host context carrying `connection` and `profileContext`.
 * @param config - loader-supplied configuration.
 */
export function apply(ctx, config) {
  const settings = resolveConfig(config);
  if (!settings.enabled) return;

  ctx.effect(() => registerMarketRoutes(ctx, settings), "preview-market: routes");

  // The client reads its route root from the served page, so a configured root
  // and the client's URL can never drift apart.
  ctx.on("webserver/index-inject", (table) => {
    table.push({
      kind: "global",
      name: "__DSH_PREVIEW_MARKET_CONFIG__",
      value: { routeRoot: settings.routeRoot },
    });
  });
}
