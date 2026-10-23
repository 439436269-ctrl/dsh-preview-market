# Verification record — dsh-preview-market 0.1.3

## Unit tests (2026-10-23)

`node --test test/*.test.js` → **12 pass, 0 fail**.

| File | Covers |
|---|---|
| `test/config.test.js` | defaults, `/api` route fence, route normalization, boolean normalization |
| `test/catalog.test.js` | one file per entry, required fields, filename/repository match, duplicates, payload shape |
| `test/catalog-file.test.js` | `catalog.json` snapshot matches the files |
| `test/installed.test.js` | profile `package.json` + `node_modules` inventory, missing profile, `profileContext` resolution |
| `test/client.test.js` | bundle registers the `settings.section` and `settings.plugins.tab` entries |

## Host / bundle smoke (2026-10-23, preview-test profile)

- Installed the packed tarball into a throwaway `preview-test` profile with `dsh plugin --profile preview-test add …`.
- `dsh --profile preview-test --dump-config` contains one `id: preview-market` row with `routeRoot: /api/preview-market`.
- The Web boot graph (`__DSH_BOOT__`) contains `dsh-preview-market` and injects `__DSH_PREVIEW_MARKET_CONFIG__`.
- The combo bundle URL returned **200** (16,213 B) and contains `settings.plugins.tab` + `dsh-preview-market`.

## One-file catalog (2026-10-23)

- Moved the three entries from `lib/catalog.js` into `catalog/plugins/<owner>__<repo>.json`; the Host loads and validates every file at startup.
- Added a temporary `catalog/plugins/example__dsh-preview-example.json`; `CATALOG` went from 3 to 4 entries without any code change, then was removed.
- Unit tests (12 pass) validate every file, the filename/repository match, duplicate names, required fields, and the `catalog.json` snapshot.
- `catalog/README.md` + `.github/PULL_REQUEST_TEMPLATE.md` document the one-file PR.

## Top-level section e2e (2026-10-23, preview-test)

```sh
node scripts/e2e-section.mjs --base http://127.0.0.1:59010 --token <token>
```

Result: **PASS** — the Settings nav contains `预览市场` immediately after `插件市场`; opening it shows the `发现` / `已安装` tabs and the three catalog cards (`dsh-preview-media`, `dsh-preview-blender`, `dsh-preview-stl`). No page errors. Screenshot: `docs/preview-market-section.png`.

## Settings tab e2e (2026-10-23, preview-test)

Installed `dsh-preview-market@0.1.0` plus `dsh-preview-media@0.1.4`, `dsh-preview-blender@0.1.0`, `dsh-preview-stl@0.1.0` into `preview-test`, started the Web host, and ran:

```sh
node scripts/e2e-settings.mjs --base http://127.0.0.1:59003 --token <token>
```

Result: **PASS** — opened Settings → Built-in plugins → Preview market and found the tab plus the three installed cards (`dsh-preview-media`, `dsh-preview-blender`, `dsh-preview-stl`). No page errors; the only console 404 is the expected `/dsh-market/status` probe when dsh-market is absent. Screenshot: `%TEMP%\dsh-preview-market-settings.png`.

## Fallback install/copy e2e (2026-10-23, preview-test)

Removed `dsh-preview-stl` from `preview-test`, restarted the host, and ran:

```sh
node scripts/e2e-fallback.mjs --base http://127.0.0.1:59004 --token <token>
```

Result: **PASS** — the STL card showed `安装`; clicking it displayed `dsh plugin --profile preview-test add dsh-preview-stl@0.1.0` (dsh-market absent); the media card's copy button reported `命令已复制` and the clipboard held `dsh plugin --profile preview-test add dsh-preview-media@0.1.4`. No page errors. STL was reinstalled afterwards.

## Toggle / configure e2e (2026-10-23, preview-test + dsh-market 1.67.0)

With dsh-market installed, ran:

```sh
node scripts/e2e-toggle.mjs --base http://127.0.0.1:59006 --token <token>
```

Result: **PASS** — the STL card showed `停用`; clicking it wrote `dsh-preview-stl` into `/dsh-market/installed`'s `disabled` list and showed `已切换，刷新页面后生效`; clicking `启用` removed it again. The media card's `配置` showed `在 设置 → 插件 → dsh-preview-media 配置。` No page errors; screenshot: `%TEMP%\dsh-preview-market-toggle.png`.

## npm artifact install (2026-10-23, preview-test)

Replaced the local tarball with the published `dsh-preview-market@0.1.1` from npm (`dsh plugin --profile preview-test add dsh-preview-market@0.1.1`), then ran the settings e2e against that install:

```sh
node scripts/e2e-settings.mjs --base http://127.0.0.1:59007 --token <token>
```

Result: **PASS** — tab and all three installed cards rendered from the npm artifact. `package.json` dependency is `0.1.1`, `node_modules/dsh-preview-market/package.json` reports `0.1.1`.

## One-click install e2e (fixture registry, 2026-10-23)

To exercise the real install route without waiting for the production catalog, a local registry fixture was served on `127.0.0.1:59008`:

```json
{"plugins":[{"name":"dsh-preview-stl","url":"https://github.com/439436269-ctrl/dsh-preview-stl","npm":"dsh-preview-stl","category":["ui"]}]}
```

The host was started with `DSHM_REGISTRY_URL=http://127.0.0.1:59008/plugins.json`, `dsh-preview-stl` was removed from `preview-test`, and the market's STL card was clicked. Result: **PASS** — dshmarket installed `dsh-preview-stl@0.1.0`; `/dsh-market/installed` contained it, the notice said `已安装: dsh-preview-stl`, and the card switched to `已是最新` with `停用`/`配置`. No page errors. Screenshot: `%TEMP%\market-oneclick.png`.

This proves the install route itself; the production catalog still needs the entries scheduled for 2026-10-24.

## Not yet verified live

- Production one-click install through the real dsh-market catalog (the new entries are scheduled for 2026-10-24).
- Desktop installation (the desktop profile is Electron-managed).
