/**
 * The schemastery schema alone, separated from the defaulting helpers so
 * `lib/config.js` stays importable in a plain `node --test` run (schemastery is
 * supplied by the DSH host at runtime, not by this package).
 *
 * @module dsh-preview-market/schema
 */
import z from "@deepseek-ai/schemastery";

/** Schema the loader validates and the settings page renders. */
export const Config = z.object({
  enabled: z.boolean().default(true).description(
    "Register the preview market routes and its settings tab at all. Off keeps the plugin idle."
  ),
  routeRoot: z.string().default("/api/preview-market").description(
    "Authenticated route root for the market's catalog and installed-package inventory; it must stay under /api so the connection fence authenticates it."
  ),
  profileDir: z.string().default("").description(
    "Profile directory whose package.json and node_modules are inspected. Empty uses the Host profileContext, then $DSH_HOME/profiles/desktop."
  ),
  debug: z.boolean().default(false).description(
    "Write market request diagnostics to $DSH_HOME/preview-market-debug.log. Leave off unless you are diagnosing the inventory."
  ),
}).description("Preview market: a vertical catalog of preview plugins plus an installed-package inventory.");
