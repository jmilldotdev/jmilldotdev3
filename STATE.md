# jmill.dev — STATE

## Current state
- Production: https://www.jmill.dev, deployed by the GitHub/Vercel integration from `main` in `jmilldotdev/jmilldotdev3`.
- 2026-11-04: jmill approved replacing Cuelight's domain with `cuelight.fyi` and redeploying. The selected Obsidian CMS import updated `content/cuelight.mdx`, `src/config/metadata.json`, and `src/config/projects.json` (source commit `ee90930`; production cherry-pick `bb4a686`).
- The standalone content renderer now reads the CMS's lowercase `url` field, retaining uppercase `URL` for existing notes, so https://www.jmill.dev/c/cuelight exposes its project link as well as the desktop project window.
- Analytics migration prepared in source: Cloudflare Web Analytics pageviews and `sdj-events` custom events replace OpenPanel. Production still needs the public Cloudflare site token in the Vercel build and browser verification after rollout.

## Release lifecycle
- Preserve unrelated mobile/window working-tree edits. Prepare only the scoped analytics commit in an isolated worktree based on `origin/main`; never push the full local release branch.
- Push its exact commit to `origin/main` (ordinary fast-forward). Observe the exact SHA's GitHub Production deployment status, then fetch the public page.
- CMS: `VAULT_ROOT=/home/jmill/sdj/nhx4b pnpm generate:content --notes "project/😤 Cuelight.md"`; the note is shared with selfdrivingjazz.com, whose separate `npm run sync:vault` pipeline also ran.
- No other vault notes or unrelated project content were changed.
