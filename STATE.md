# jmill.dev — STATE

## Current state
- Production: https://www.jmill.dev, deployed by the GitHub/Vercel integration from `main` in `jmilldotdev/jmilldotdev3`.
- 2026-11-04: jmill approved replacing Cuelight's domain with `cuelight.fyi` and redeploying. The selected Obsidian CMS import updated `content/cuelight.mdx`, `src/config/metadata.json`, and `src/config/projects.json` (source commit `ee90930`; production cherry-pick `bb4a686`).
- The standalone content renderer now reads the CMS's lowercase `url` field, retaining uppercase `URL` for existing notes, so https://www.jmill.dev/c/cuelight exposes its project link as well as the desktop project window.

## Release lifecycle
- Preserve the unrelated mobile/window working-tree edits. Use the detached release worktree `/home/jmill/sdj/tmp/jmill-dev-openpanel-release`, based on `origin/main`, and cherry-pick only the scoped content/link commits.
- Push its exact commit to `origin/main` (ordinary fast-forward). Observe the exact SHA's GitHub Production deployment status, then fetch the public page.
- CMS: `VAULT_ROOT=/home/jmill/sdj/nhx4b pnpm generate:content --notes "project/😤 Cuelight.md"`; the note is shared with selfdrivingjazz.com, whose separate `npm run sync:vault` pipeline also ran.
- No other vault notes or unrelated project content were changed.
