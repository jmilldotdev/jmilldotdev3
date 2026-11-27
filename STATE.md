# jmill.dev — STATE

## Current state
- Production: https://www.jmill.dev runs on Cloudflare Worker `jmill-dev`, version `99480d89-0ca2-4ae0-9588-3579a7fef3d6`, source `237759a4a8`. https://jmill.dev returns a Worker `307` to `www` preserving path and query. Both hostnames present a trusted Universal SSL certificate.
- The Cloudflare zone is active. Existing apex and `www` records were proxied in place to activate the staged `jmill-dev` routes. Both authoritative nameservers matched the five Google MX records, the verification TXT, and the vault records before and after each proxy change. The Vercel project was not changed.
- [/healthz](https://www.jmill.dev/healthz) returned `jmill-dev-ready` with `x-opennext: 1`. Key pages, the three wiki APIs, and the mobile homepage passed. Cloudflare GraphQL counted the controlled `/c/cuelight` pageview at 18:11 UTC; Site events recorded the controlled `project_open` at 18:12:13 UTC.
- [Mobile, HTTPS, DNS, and analytics proof](https://jmill-desktop.tail587341.ts.net/outputs/result-jmill-dev-cloudflare-cutover-20261127). [JMI-189](https://linear.app/selfdrivingjazz/issue/JMI-189/point-jmilldev-at-cloudflare) is resolved.

## Prior releases
- 2026-11-04: jmill approved replacing Cuelight's domain with `cuelight.fyi` and redeploying. The selected Obsidian CMS import updated `content/cuelight.mdx`, `src/config/metadata.json`, and `src/config/projects.json` (source commit `ee90930`; production cherry-pick `bb4a686`).
- The standalone content renderer now reads the CMS's lowercase `url` field, retaining uppercase `URL` for existing notes, so https://www.jmill.dev/c/cuelight exposes its project link as well as the desktop project window.

## Release lifecycle
- [Build and deploy from the clean Workers release branch](README.md#cloudflare-workers-production-deployment). Do not deploy the dirty canonical checkout or push to Vercel's `main`.
- The Worker deploy token is `op://sdj/Cloudflare jmill.dev/workers_deploy_token` (account Workers Scripts Edit); renew through `admin-access` as needed. The site token used by the browser is public and separate from API credentials.
- CMS: `VAULT_ROOT=/home/jmill/sdj/nhx4b pnpm generate:content --notes "project/😤 Cuelight.md"`; the note is shared with selfdrivingjazz.com, whose separate `npm run sync:vault` pipeline also ran.
- No other vault notes or unrelated project content were changed.
