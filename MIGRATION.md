# Migrating from the old preview package names

The three preview packages were renamed:

| Old | New |
|---|---|
| `dsh-media-preview` | `dsh-preview-media` |
| `dsh-blend-preview` | `dsh-preview-blender` |
| `dsh-stl-preview` | `dsh-preview-stl` |

The old npm packages are deprecated and the old GitHub repositories are kept only as legacy homes. **Do not keep an old and a new package installed together** — they claim the same file extensions and the same document-preview slots.

## 1. Back up the profile

Copy `package.json`, `cordis.patch.yml` and `pnpm-lock.yaml` out of the profile directory first. A desktop profile is managed by the Electron app; the `dsh` CLI refuses to modify it, so use the App's plugin manager (or the dsh-market UI) for the install/remove steps.

## 2. Remove the old packages

Remove `dsh-media-preview`, `dsh-blend-preview` and `dsh-stl-preview` from the profile and from `dsh.profile.bundles`.

## 3. Install the new packages

Install `dsh-preview-media`, `dsh-preview-blender` and `dsh-preview-stl` (and optionally `dsh-preview-market`) with the App plugin manager, dsh-market, or:

```sh
dsh plugin --profile <profile> add dsh-preview-media@0.1.4
dsh plugin --profile <profile> add dsh-preview-blender@0.1.0
dsh plugin --profile <profile> add dsh-preview-stl@0.1.0
dsh plugin --profile <profile> add dsh-preview-market@0.1.1
```

The CLI form only works for profiles it owns (not the Electron-managed `desktop` profile).

## 4. Rewrite the old patch rows

If the profile's `cordis.patch.yml` has an old media row, update it in place:

```yaml
- insert:
    - id: preview-media            # was media-preview
      name: dsh-preview-media      # was dsh-media-preview
      config:
        enabled: true
        routePath: /api/preview/media   # was /api/media-preview
        # maxBytes, chunkBytes, debug, videoExtensions and audioExtensions
        # keep their old values.
```

If a profile has blend/stl rows, the same rule applies: change `id` to `preview-blender` / `preview-stl`, `name` to `dsh-preview-blender` / `dsh-preview-stl`, and `routePath` to `/api/preview/blender` / `/api/preview/stl`. Their config keys (`blenderPath`, `cacheDir`, `unitScale`, …) did not change.

Remove any rows still targeting the old ids: the patch layer must not carry both generations.

## 5. Verify

Restart or refresh the app, then:

- open an `.mp4`/`.mp3`, a `.blend`, and an `.stl` — each should mount the new preview;
- open **Settings → Built-in plugins → Preview market** — the new packages should show as installed, with enable/disable and configure entries;
- if a file opens with the wrong preview or two tabs register an extension, an old package is still installed — remove it and re-check `dsh.profile.bundles`.
