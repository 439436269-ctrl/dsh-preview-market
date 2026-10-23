# dsh-preview-market

A **vertical preview market** for DeepSeek Harness. One settings tab lists the preview plugins that exist for DSH, shows which ones the active profile already has, and hands installs/updates to [dsh-market](https://github.com/dsh-market/dsh-market) or the official `dsh plugin` command.

It is not a general plugin market, and it does not implement previews itself: every preview plugin stays an independent Loader entry with its own repository, version and settings. The market only provides the catalog, the installed view and the entry points.

## Install

```sh
dsh plugin --profile <profile> add dsh-preview-market
```

Open **Settings → Plugins → Preview market**.

## What it does

- **Catalog** — first-party preview plugins with their formats, host requirements and versions.
- **Installed view** — reads the active profile's `package.json` and each package's `dsh.preview` manifest; never imports child plugin code.
- **Install / update** — delegates to `dsh-market` when it is present. Without it, the card shows the exact `dsh plugin --profile <profile> add <package>@<version>` command to copy.
- **Independent plugins** — media, Blender and STL remain separate packages; this page has no renderer and does not merge their code.

## Catalog (0.1.0)

| Package | Formats | Host requirement |
|---|---|---|
| `dsh-preview-media` | mp4/mov/webm/mkv + mp3/flac/wav/… | — |
| `dsh-preview-blender` | `.blend` | Blender 3.6+ |
| `dsh-preview-stl` | `.stl` | — |

## Configuration

Settings → Plugins → Preview market (namespace `preview-market`):

| Key | Default | Meaning |
|---|---|---|
| `enabled` | `true` | Register the routes and the settings tab. |
| `routeRoot` | `/api/preview-market` | Authenticated route root; must stay under `/api`. |
| `profileDir` | `""` | Profile to inspect. Empty uses the Host `profileContext`, then `$DSH_HOME/profiles/desktop`. |
| `debug` | `false` | Reserved for request diagnostics. |

## Development

```sh
node --test test/*.test.js
```

Settings-tab end-to-end (requires a running host with the plugin installed):

```sh
node scripts/e2e-settings.mjs --base http://127.0.0.1:<port> --token <token>
```

The client bundle is `lib/client.js` (classic `__ModuleLoader__.load` factory, no build step).

## Status

`0.1.0` — catalog + installed inventory + settings tab. One-click install requires the package to be present in the connected dsh-market registry; otherwise use the copyable command. Enable/disable stays in **Settings → Plugins**.
