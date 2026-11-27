This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Release and private preview

Production promotion requires explicit approval under the workspace
[`rollout policy`](../../../infra/docs/software-feedback-loop.md#rollout-and-acceptance).
Never deploy the dirty working tree or include unrelated changes.

The documented preview is the managed, on-demand live-source service:

```sh
# From /home/jmill/sdj/infra/ops
bin/sdj jmilldev apply  # reconcile after dependency/lockfile changes
bin/sdj jmilldev start
bin/sdj jmilldev status --json
```

Review at <https://jmill-desktop.tail587341.ts.net:8453>. This serves the
canonical working tree, including unrelated uncommitted edits; it is not an
immutable release or a Vercel deployment. Do not stage those unrelated edits
into the analytics commit. See the
[`infra/ops` lifecycle SOP](../../../infra/ops/README.md#jmilldev-on-demand-development-server).

### Isolated GitHub production deployment

The Vercel GitHub integration for `jmilldotdev/jmilldotdev3` deploys
**Production from `main`**. Set `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`
to the public token for this site in the Vercel project's **Production**
environment before building. Do not merge the full local release branch or
`rc/mobile-projects-20261020` into production.

Prepare the scoped analytics commit in an isolated worktree based on
`origin/main`. It must exclude unrelated mobile/window edits and the
untracked health route. Do not regenerate vault content for this release.

```sh
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
git log --oneline origin/main..HEAD  # must contain only analytics/config/docs
release_sha=$(git rev-parse HEAD)
git push origin HEAD:main           # ordinary fast-forward; never force

gh api "repos/jmilldotdev/jmilldotdev3/deployments?environment=Production&sha=$release_sha" \
  --jq '.[] | {id, sha, environment, statuses_url}'
# Use the returned deployment ID; repeat for up to about five minutes.
gh api "repos/jmilldotdev/jmilldotdev3/deployments/<deployment-id>/statuses" \
  --jq '.[] | {state, environment_url, log_url}'
```

Stop if the ancestry check fails or the commit list contains unrelated changes.
Wait for **Production success for the exact pushed SHA**, then follow the
browser check below. Neither a Git push nor a successful build proves collection.

### Cloudflare Workers deployment

Build from the isolated Cloudflare migration branch, not the dirty
working tree. Use Node.js 22.12+ and pnpm. The deployment targets the
`jmill-dev` Worker on `workers.dev`; this command does not change DNS.

```sh
pnpm install --frozen-lockfile
NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT=production \
  NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN="${JMill_RUM_SITE_TOKEN:?Set the public site token}" \
  /home/jmill/sdj/infra/ops/bin/heavy-job 6G pnpm build:worker
pnpm preview:worker --ip 127.0.0.1   # optional local Workers runtime check

CLOUDFLARE_API_TOKEN="$(op read --no-newline 'op://sdj/Cloudflare jmill.dev/workers_deploy_token')" \
  pnpm deploy:worker
```

`JMill_RUM_SITE_TOKEN` is the public `site_token` from
`GET /accounts/{account_id}/rum/site_info/list` for `host=www.jmill.dev`
and `auto_install=false`. Authenticate that lookup with the existing
broker-provisioned `rum_api_token` in `sdj/Cloudflare SDJ events`; never pass
the management token to the build. The deploy token comes from `admin-access`
with `Workers Scripts Edit` for the configured account. Both preview URLs
remain tracker-free because analytics only runs on `www.jmill.dev`.

## Analytics

Cloudflare Web Analytics measures pageviews. Existing named custom events
go to `https://events.cuelight.fyi/e`. Both are enabled only on
`https://www.jmill.dev` in a production build, and neither runs when the
browser signals Do Not Track or Global Privacy Control.

| Build variable | Value |
| --- | --- |
| `NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT` | Optional override; defaults to `production` only when `VERCEL_ENV=production`. |
| `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | This site's public Cloudflare token. If unset, only custom events are enabled. |

Changing a variable requires a new build. Do not put credentials in
`NEXT_PUBLIC_*`. Custom events send the apex site, event name, pathname
only (no query or fragment), and the following properties:

| event | properties | fired by |
| --- | --- | --- |
| `project_open` | `project` (id) | opening a project in the Projects window, incl. previous/next |
| `project_link_open` | `project` (id) | the project detail "Open project" button |
| `contact_open` | `channel` (`x`\|`github`\|`email`) | About presence links |

On production, check the Network panel for `beacon.min.js` and a Cloudflare
`/cdn-cgi/rum` POST (switch tabs or navigate if needed). Open a project and
check for `POST https://events.cuelight.fyi/e` carrying `project_open`. Verify
the custom event in Site events and the pageview in Cloudflare. Repeat with
DNT/GPC enabled and on a preview URL; neither request should occur.

### Historical baseline before the OpenPanel cutover

Pre-cutover browser baseline on 2026-10-25 UTC (2026-10-24 local), with DNT unset and
GPC false:

- Managed preview `/` returned 200 and made no OpenPanel or Umami requests;
  the canonical-host/environment gates intentionally keep it tracker-free.
- <https://jmill.dev> redirected to <https://www.jmill.dev/> (200). That
  still-unpromoted deployment loaded the old Umami `script.js` (200) and sent
  `/api/send` (POST 200), with no OpenPanel requests.
- The OpenPanel change removed the old Umami integration without changing
  historical Umami data or account configuration.
