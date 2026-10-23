/**
 * Toggle/config e2e for dsh-preview-market.
 *
 * Requires a running host with dsh-market present and at least one installed
 * preview plugin. Disables and re-enables the STL card through
 * /dsh-market/toggle, then proves the Configure entry points at the child
 * plugin's Settings → Plugins page.
 *
 * Usage:
 *   node scripts/e2e-toggle.mjs --base http://127.0.0.1:<port> --token <token>
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

const base = argument("base") ?? "http://127.0.0.1:59006";
const token = argument("token");
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true, channel: process.env.E2E_BROWSER_CHANNEL });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await context.newPage();
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
  await page.waitForTimeout(900);
  const dialog = page.locator('[role="dialog"]').last();
  await dialog.getByRole("button", { name: /内置插件|^Plugins$/ }).first().click();
  await page.waitForTimeout(900);
  await dialog.getByText(/预览市场|Preview market/).last().click();
  await page.waitForTimeout(1200);

  const text = await dialog.innerText();
  if (!/已连接|connected/.test(text)) {
    console.log("SKIP dsh-market is not connected");
    process.exit(0);
  }

  const card = dialog.locator("article").filter({ hasText: "dsh-preview-stl" });
  const buttons = await card.locator("button").allInnerTexts();
  if (!buttons.some((label) => /停用|Disable/.test(label))) {
    console.log("SKIP dsh-preview-stl is not installed");
    process.exit(0);
  }

  await card.getByRole("button", { name: /^停用$|^Disable$/ }).click();
  await page.waitForTimeout(1500);
  let installed = await page.evaluate(async () => (await fetch("/dsh-market/installed", { cache: "no-store" })).json());
  if (!installed.disabled.includes("dsh-preview-stl")) throw new Error("disable did not land");
  const afterDisable = await dialog.innerText();
  if (!/已切换|Toggled/.test(afterDisable)) throw new Error("toggle notice missing");

  await card.getByRole("button", { name: /^启用$|^Enable$/ }).click();
  await page.waitForTimeout(1500);
  installed = await page.evaluate(async () => (await fetch("/dsh-market/installed", { cache: "no-store" })).json());
  if (installed.disabled.includes("dsh-preview-stl")) throw new Error("enable did not land");

  const media = dialog.locator("article").filter({ hasText: "dsh-preview-media" });
  await media.getByRole("button", { name: /^配置$|^Configure$/ }).click();
  await page.waitForTimeout(500);
  if (!/设置 → 插件/.test(await dialog.innerText())) throw new Error("configure hint missing");
  if (errors.length > 0) throw new Error(`page errors: ${errors.slice(0, 3).join(" | ")}`);

  await page.screenshot({ path: join(process.env.TEMP ?? homedir(), "dsh-preview-market-toggle.png") });
  console.log("PASS toggle dsh-preview-stl off/on and configure hint");
} finally {
  await browser.close();
}
