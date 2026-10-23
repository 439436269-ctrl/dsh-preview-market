/**
 * Regenerate catalog.json from the shipped catalog module.
 *
 * The JSON file is a machine-readable snapshot for external consumers; the
 * Host route still serves lib/catalog.js. `npm test` fails if the two drift.
 */
import { writeFile } from "node:fs/promises";
import { catalogPayload } from "../lib/catalog.js";

await writeFile(new URL("../catalog.json", import.meta.url), `${JSON.stringify(catalogPayload(), null, 2)}\n`);
console.log("wrote catalog.json");
