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

Production promotion follows the workspace
[`software-feedback-loop.md` rollout policy](../../../infra/docs/software-feedback-loop.md#rollout-and-acceptance).
jmill's 2026-10-24 request authorizes this analytics-only production rollout;
no additional production go is needed for that scope. It does not authorize
unrelated working-tree changes. The analytics closure is committed separately
on `rc/openpanel-jmilldev-20261024`; never deploy the dirty working tree.

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
**Production from `main`**. Before the analytics cutover, GitHub deployment
records identified production source `e554737`, matching `origin/main`; the separate
`rc/mobile-projects-20261020` commit is only a Preview and must not be included.
Vercel CLI access is **not** required and is not a release blocker.

The analytics-only source is isolated from the dirty canonical checkout in
`/home/jmill/sdj/tmp/jmill-dev-openpanel-release` (a detached Git worktree).
It excludes unrelated mobile-window edits and the untracked health route.
Do not regenerate vault content or merge unrelated RC work into this release.

The public jmill.dev OpenPanel client ID is committed in
`src/config/openpanel.json`: `6d507382-51ad-4290-b039-8defbe1b3702`, with allowed
domain `https://www.jmill.dev`. `next.config.ts` uses this public value as the
fallback and enables the existing production-environment gate only when Vercel
sets `VERCEL_ENV=production`. Existing explicit `NEXT_PUBLIC_*` overrides still
take precedence. Preview deployments and development remain disabled by default;
the canonical hostname and browser privacy gates are unchanged. No management
key or client secret belongs in this file.

Update the detached release worktree to the exact analytics-only commit, then:

```sh
# Run from /home/jmill/sdj/tmp/jmill-dev-openpanel-release
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
Wait for a **Production success for the exact pushed SHA**, then use a real
browser at <https://www.jmill.dev/> to confirm the old Umami request is gone and
OpenPanel `/track` is present. Confirm event arrival where destination read
access permits. Neither a Git push nor a successful build proves collection.
No additional production go or Vercel dashboard environment setup is needed.

## Analytics

`src/components/Analytics.tsx` + `src/lib/analytics.ts` send production-only
[OpenPanel](https://openpanel.dev/docs/sdks/web) analytics via `@openpanel/web`
(this replaced the old hard-coded Umami script). Nothing loads unless **all**
hold: `NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT=production` (inlined from the Vercel
production environment or an explicit override), a valid public client ID from
`src/config/openpanel.json` or `NEXT_PUBLIC_OPENPANEL_CLIENT_ID`, and the page is served from
`https://www.jmill.dev` (the apex redirects there), and the browser sends
neither Do Not Track nor Global Privacy Control. Otherwise the SDK chunk is
never fetched and no request is made, so `pnpm dev`, the MTS tailnet dev server
and Vercel preview URLs stay silent even if they inherit production variables.

| variable | value |
| --- | --- |
| `NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT` | optional override; otherwise `production` only when `VERCEL_ENV=production` |
| `NEXT_PUBLIC_OPENPANEL_CLIENT_ID` | optional override for `src/config/openpanel.json`'s public `clientId` (no client secret, ever) |
| `NEXT_PUBLIC_OPENPANEL_API_URL` | optional; defaults to `https://api.openpanel.dev`, must be HTTPS without credentials or query |

These are public build-time values inlined into the client bundle. The committed
public configuration supports the GitHub production build without Vercel
dashboard access. Changing the ID requires a new production build/deployment.

The real public client ID is committed in `src/config/openpanel.json`; no
fixture or another site's client is used. Future ID changes must be committed
before the fast-forward production push above.

The API URL can remain unset. Do not use a fixture ID or another site's client,
and do not put any OpenPanel management credential or client secret in
`NEXT_PUBLIC_*`. The parent rollout owns API access and client provisioning.
Production must deploy the analytics-only committed source closure, not the
unrelated dirty working tree. Preview silence is not evidence of destination
delivery.

Auto-capture, outgoing-link and `data-track` attribute tracking, session
replay, identify and profiles are all off; an SDK filter drops anything but
the events below. Page views send origin + path (no query string or hash)
and the public page title; the referrer is reduced to an external origin. Named events:

| event | properties | fired by |
| --- | --- | --- |
| `project_open` | `project` (id) | opening a project in the Projects window, incl. previous/next |
| `project_link_open` | `project` (id) | the project detail "Open project" button |
| `contact_open` | `channel` (`x`\|`github`\|`email`) | About presence links |

Tracking is fire-and-forget and never blocks navigation. Smoke check on
production: devtools Network filtered to `openpanel` shows a `/track`
`screen_view` POST on load and `project_open` after opening a project; on a
preview URL, or with DNT/GPC enabled, the same filter stays empty.

### Cutover status

Pre-cutover browser baseline on 2026-10-25 UTC (2026-10-24 local), with DNT unset and
GPC false:

- Managed preview `/` returned 200 and made no OpenPanel or Umami requests;
  the canonical-host/environment gates intentionally keep it tracker-free.
- <https://jmill.dev> redirected to <https://www.jmill.dev/> (200). That
  still-unpromoted deployment loaded the old Umami `script.js` (200) and sent
  `/api/send` (POST 200), with no OpenPanel requests.
- Source removes the old Umami script and has no other analytics provider
  integration. Historical Umami data/account configuration is untouched.
- Destination event arrival must be confirmed separately from browser HTTP
  success; the parent rollout owns the dashboard evidence. The requested
  analytics-only production rollout is already authorized.
