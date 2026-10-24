# Changelog

## 0.1.8

- Catalog follows `dsh-preview-snip@0.2.1` (image-only quick snip, segmented action group, hot-reload CSS fix).

## 0.1.7

- Catalog follows `dsh-preview-snip@0.2.0`: all preview types, plus the annotation editor (box/circle/arrow/text).

## 0.1.6

- README: add preview-market and per-plugin screenshots, plus the current four-entry catalog list (media, Blender, STL, snip).

## 0.1.5

- Catalog version for `dsh-preview-media` follows the media transport fallback release `0.1.5`.

## 0.1.4

- Catalog entries can now be `kind: "tool"` (preview enhancements with no file extensions); `dsh-preview-snip` is the first one.
- Cards show `Type: Tool` instead of a formats line for tool entries; install/toggle/configure stay the same.

## 0.1.3

- Catalog entries now live in `catalog/plugins/<owner>__<repo>.json` — one file per plugin, so third parties can submit a PR without editing market code.
- The Host loads, validates and merges every file at startup; duplicate names and filename/repository mismatches fail fast.
- `catalog.json` remains the generated machine-readable snapshot; a test keeps it in sync.

## 0.1.2

- Add a top-level **Settings → Preview market** section, next to dsh-market, with Discover / Installed tabs.
- Keep the Settings → Plugins tab for discoverability; both render the same panel.

## 0.1.1

- Enable/disable installed preview plugins from the market when dsh-market is present (`/dsh-market/toggle`), with the current state read from `/dsh-market/installed`.
- Add a "Configure" entry per installed card that points to the child plugin's Settings → Plugins page.
- Without dsh-market, the toggle is disabled and the card explains where to manage it.

## 0.1.0

- New vertical preview market plugin: catalog, installed inventory, Settings → Plugins tab.
- Reads the active profile's `package.json` and each package's `dsh.preview` manifest; never imports child plugin code.
- Install/update delegates to dsh-market when present, with a copyable `dsh plugin` command as fallback.
- Catalog ships media, Blender and STL preview plugins.
