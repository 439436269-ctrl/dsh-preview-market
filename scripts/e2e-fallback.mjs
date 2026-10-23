/**
 * Fallback install/copy e2e for dsh-preview-market.
 *
 * Requires a running host where at least one catalog entry is NOT installed
 * (remove one package from a throwaway profile first). It proves that with
 * dsh-market absent, the market shows the exact `dsh plugin` command instead of
 * pretending to install, and that the copy button writes that command to the
 * clipboard.
 *
 * Usage:
 *   node scripts/e2e-fallback.mjs --base http://127.0.0.1:<port> --token <token>
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

const base = argument("base") ?? "http://127.0.0.1:59004";
const token = argument("token");
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true, channel: process.env.E2E_BROWSER_CHANNEL });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"]
});
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
  await page.waitForTimeout(1000);

  const installButtons = dialog.getByRole("button", { name: /^安装$/ });
  if ((await installButtons.count()) === 0) {
    console.log("SKIP no uninstalled catalog entry in this profile");
    process.exit(0);
  }
  const card = installButtons.first().locator("xpath=ancestor::article");
  const cardText = await card.innerText();
  const packageName = (cardText.match(/dsh-preview-[a-z0-9-]+/) ?? [])[0];
  if (packageName === undefined) throw new Error("could not read the package name from the card");
  await installButtons.first().click();
  await page.waitForTimeout(800);
  const text = await dialog.innerText();
  const command = `dsh plugin --profile `;
  if (!text.includes(command) || !text.includes(`add ${packageName}@`)) {
    throw new Error(`fallback command not shown for ${packageName}`);
  }

  const copy = dialog.getByRole("button", { name: /复制安装命令/ }).first();
  await copy.click();
  await page.waitForTimeout(500);
  const copiedText = await dialog.innerText();
  let clipboard = "";
  try { clipboard = await page.evaluate(() => navigator.clipboard.readText()); } catch {}
  if (!/命令已复制/.test(copiedText) && !clipboard.includes("dsh plugin")) {
    throw new Error("copy command did not report success");
  }

  if (errors.length > 0) throw new Error(`page errors: ${errors.slice(0, 3).join(" | ")}`);
  await page.screenshot({ path: join(process.env.TEMP ?? homedir(), "dsh-preview-market-fallback.png") });
  console.log(`PASS fallback for ${packageName}; clipboard=${JSON.stringify(clipboard)}`);
} finally {
  await browser.close();
}
