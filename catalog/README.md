# Preview catalog

One JSON file per plugin. A third-party submission adds **exactly one file** here and opens a PR; nobody edits the market's code.

```
catalog/plugins/<owner>__<repo>.json
```

The filename must match the repository URL: `https://github.com/<owner>/<repo>` → `<owner>__<repo>.json`. The Host validates the filename, the required fields, duplicate names and the repository host at startup.

## Entry shape

```json
{
  "name": "dsh-preview-example",
  "npm": "dsh-preview-example",
  "capability": "example",
  "kind": "three",
  "repo": "https://github.com/example/dsh-preview-example",
  "version": "0.1.0",
  "minDsh": "0.2.0-rc.2",
  "requires": [],
  "extensions": ["example"],
  "formats": { "model": ["example"] },
  "description": {
    "zh": "一句话说明这个预览插件做什么。",
    "en": "One sentence describing what this preview plugin does."
  }
}
```

Required: `name`, `npm`, `capability`, `kind`, `repo`, `version`, `extensions`, `formats`, `description.zh`, `description.en`.

Optional: `minDsh`, `requires` (defaults to `[]`).

- `kind` is currently `media` or `three`; `three` entries get the shared WebGL viewport.
- `extensions` drives the document-preview registration in the child plugin; the catalog only displays it.
- `formats` groups extensions for the card, e.g. `{ "video": [...], "audio": [...] }`.

## Submit a plugin

1. Add `catalog/plugins/<owner>__<repo>.json` with the shape above.
2. Run `npm test` (it validates every file and the `catalog.json` snapshot).
3. Run `npm run catalog:write` to regenerate the root `catalog.json` snapshot.
4. Open a PR that adds **one plugin file plus the regenerated snapshot**.

The plugin itself stays an independent DSH package with its own `dsh.bundle` and repository. Being in this catalog does **not** make one-click install work by itself: the package also has to be present in the connected dsh-market registry; otherwise the market shows the copyable `dsh plugin add` command.

Do not add a plugin to this catalog if it is only a copy of an existing package under another name. The catalog is for distinct preview capabilities.
