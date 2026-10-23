## Preview plugin submission

- [ ] Added exactly one `catalog/plugins/<owner>__<repo>.json` (filename matches the repository URL).
- [ ] The plugin is its own DSH package with a `dsh.bundle` patch and a public repository.
- [ ] `npm test` passes.
- [ ] `npm run catalog:write` regenerated `catalog.json`.
- [ ] The entry is not a renamed copy of an existing catalog plugin.

The panel, routes and downloaded package stay unchanged; this PR only adds catalog data. See `catalog/README.md` for the entry shape.
