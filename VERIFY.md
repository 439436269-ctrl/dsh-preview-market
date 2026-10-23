# Verification record — dsh-preview-market 0.1.0

## Unit tests (2026-10-23)

`node --test test/*.test.js` → **10 pass, 0 fail**.

| File | Covers |
|---|---|
| `test/config.test.js` | defaults, `/api` route fence, route normalization, boolean normalization |
| `test/catalog.test.js` | three catalog entries, required fields, payload shape |
| `test/installed.test.js` | profile `package.json` + `node_modules` inventory, missing profile, `profileContext` resolution |
| `test/client.test.js` | bundle registers exactly one `settings.plugins.tab` entry with id `dsh-preview-market` |

## Not yet verified live

- The settings tab rendering inside the DSH Web client.
- One-click install through dsh-market (requires the new packages in its curated registry).
- Fallback command copy in a real browser.

These are the next checks after the package is installed into a test profile.
