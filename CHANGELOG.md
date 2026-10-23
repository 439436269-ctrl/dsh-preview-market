# Changelog

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
