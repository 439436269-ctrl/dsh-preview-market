# Changelog

## 0.1.0

- New vertical preview market plugin: catalog, installed inventory, Settings → Plugins tab.
- Reads the active profile's `package.json` and each package's `dsh.preview` manifest; never imports child plugin code.
- Install/update delegates to dsh-market when present, with a copyable `dsh plugin` command as fallback.
- Catalog ships media, Blender and STL preview plugins.
