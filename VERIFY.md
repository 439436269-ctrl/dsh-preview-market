# Verification record — dsh-preview-market 0.1.0

## Unit tests (2026-10-23)

`node --test test/*.test.js` → **10 pass, 0 fail**.

| File | Covers |
|---|---|
| `test/config.test.js` | defaults, `/api` route fence, route normalization, boolean normalization |
| `test/catalog.test.js` | three catalog entries, required fields, payload shape |
| `test/installed.test.js` | profile `package.json` + `node_modules` inventory, missing profile, `profileContext` resolution |
| `test/client.test.js` | bundle registers exactly one `settings.plugins.tab` entry with id `dsh-preview-market` |

## Host / bundle smoke (2026-10-23, preview-test profile)

- Installed the packed tarball into a throwaway `preview-test` profile with `dsh plugin --profile preview-test add …`.
- `dsh --profile preview-test --dump-config` contains one `id: preview-market` row with `routeRoot: /api/preview-market`.
- The Web boot graph (`__DSH_BOOT__`) contains `dsh-preview-market` and injects `__DSH_PREVIEW_MARKET_CONFIG__`.
- The combo bundle URL returned **200** (16,213 B) and contains `settings.plugins.tab` + `dsh-preview-market`.

## Settings tab e2e (2026-10-23, preview-test)

Installed `dsh-preview-market@0.1.0` plus `dsh-preview-media@0.1.4`, `dsh-preview-blender@0.1.0`, `dsh-preview-stl@0.1.0` into `preview-test`, started the Web host, and ran:

```sh
node scripts/e2e-settings.mjs --base http://127.0.0.1:59003 --token <token>
```

Result: **PASS** — opened Settings → Built-in plugins → Preview market and found the tab plus the three installed cards (`dsh-preview-media`, `dsh-preview-blender`, `dsh-preview-stl`). No page errors; the only console 404 is the expected `/dsh-market/status` probe when dsh-market is absent. Screenshot: `%TEMP%\dsh-preview-market-settings.png`.

## Not yet verified live

- One-click install through dsh-market (requires the new packages in its curated registry; the market entries are scheduled for 2026-10-24).
- Fallback command copy in a real browser.

These are the next checks after the new market entries are accepted.
