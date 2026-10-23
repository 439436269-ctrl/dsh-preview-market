/**
 * Top-level Settings section e2e for dsh-preview-market.
 *
 * Opens Settings, asserts a "Preview market" nav row exists next to the plugin
 * market, clicks it, and checks the Discover / Installed tabs plus the three
 * catalog cards.
 *
 * Usage:
 *   node scripts/e2e-section.mjs --base http://127.0.0.1:<port> --token <token>
 */
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function loadPlaywright() {
  const cacheRoot = join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), "npm-cache", "_npx");
  const candidates = [
    process.env.PLAYWRIGHT_MODULE_DIR,
    join(process.cwd(), "node_modules", "playwright"),
    join(homedir(), "node_modules", "playwright"),
  ].filter(Boolean);
  if (existsSync(cacheRoot)) {
    for (const entry of readdirSync(cacheRoot)) candidates.push(join(cacheRoot, entry, "node_modules", "playwright"));
  }
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    return import(pathToFileURL(join(candidate, "index.mjs")).href);
  }
  throw new Error("playwright not found; set PLAYWRIGHT_MODULE_DIR to a directory containing playwright/");
}

function argument(name) {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
}

const base = argument("base") ?? "http://127.0.0.1:59010";
const token = argument("token");
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true, channel: process.env.E2E_BROWSER_CHANNEL });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error" && !/Failed to load resource.*404/.test(message.text())) errors.push(message.text());
});

try {
  await page.goto(token === undefined ? base : `${base}/?token=${token}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const notice = page.getByRole("button", { name: /^继续$/ });
  if (await notice.count()) {
    await notice.last().click();
    await page.waitForTimeout(500);
  }

  await page.getByRole("button", { name: /设置|Settings/ }).last().click();
  await page.waitForTimeout(1200);
  const dialog = page.locator('[role="dialog"]').last();
  const nav = (await dialog.locator("nav button").allInnerTexts()).map((entry) => entry.trim());
  if (!nav.includes("预览市场") && !nav.includes("Preview market")) {
    throw new Error(`no Preview market nav row: ${nav.join(", ")}`);
  }

  await dialog.getByRole("button", { name: /^预览市场$|^Preview market$/ }).first().click();
  await page.waitForTimeout(1000);
  const text = await dialog.innerText();
  const checks = {
    discover: /发现|Discover/.test(text),
    installed: /已安装|Installed/.test(text),
    media: text.includes("dsh-preview-media"),
    blender: text.includes("dsh-preview-blender"),
    stl: text.includes("dsh-preview-stl"),
    snip: text.includes("dsh-preview-snip")
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok);
  console.log("checks", JSON.stringify(checks));
  if (failed.length > 0) throw new Error(`missing: ${failed.map(([name]) => name).join(", ")}`);
  if (errors.length > 0) throw new Error(`page errors: ${errors.slice(0, 3).join(" | ")}`);

  const screenshot = join(process.env.TEMP ?? homedir(), "preview-market-section.png");
  await page.screenshot({ path: screenshot });
  console.log(`PASS ${screenshot}`);
} finally {
  await browser.close();
}
