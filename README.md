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

### Isolated production deployment

The analytics-only source is isolated from the dirty canonical checkout in
`/home/jmill/sdj/tmp/jmill-dev-openpanel-release` (a detached Git worktree).
It contains the committed analytics closure, not the unrelated mobile-window
edits or untracked health route. Do not regenerate vault content during this
deployment; that would introduce changes outside the approved source closure.

Use the existing Vercel project that owns `www.jmill.dev`, not a newly created
project. The authenticated `jmilldotdev` CLI account currently cannot find that
project in either accessible scope (`jmilldotdevs-projects` or
`timkosters-projects`), so its actual project ID/scope must be recovered through
an existing credential with access. Do not guess the project or use
`--create-if-missing`. Once the owning project is accessible and this site's
real OpenPanel client is provisioned, the production invocation is:

```sh
# Required inputs: existing owning Vercel project/scope and public site client.
: "${JMILL_VERCEL_PROJECT_ID:?Set the existing www.jmill.dev Vercel project ID}"
: "${JMILL_VERCEL_SCOPE:?Set that project's owning Vercel scope}"
: "${NEXT_PUBLIC_OPENPANEL_CLIENT_ID:?Set the real jmill.dev public client ID}"

/home/jmill/.npm/_npx/69f9afb961c37556/node_modules/.bin/vercel deploy \
  /home/jmill/sdj/tmp/jmill-dev-openpanel-release \
  --prod --yes \
  --project "$JMILL_VERCEL_PROJECT_ID" \
  --scope "$JMILL_VERCEL_SCOPE" \
  --build-env NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT=production \
  --build-env "NEXT_PUBLIC_OPENPANEL_CLIENT_ID=$NEXT_PUBLIC_OPENPANEL_CLIENT_ID"
```

This uses the installed Vercel CLI 65.2.0 and uploads only the isolated source;
Vercel performs the production build. The optional OpenPanel API URL is omitted
to use the Cloud default. Also retain the two public values in the project's
Production environment for later builds. No additional production go is needed
for this analytics-only command. It has **not** been executed: the site client
and owning-project access are missing. After deployment, repeat the real
canonical browser/network check and confirm arrival in OpenPanel where access
permits; a successful Vercel build alone does not prove tracking.

## Analytics

`src/components/Analytics.tsx` + `src/lib/analytics.ts` send production-only
[OpenPanel](https://openpanel.dev/docs/sdks/web) analytics via `@openpanel/web`
(this replaced the old hard-coded Umami script). Nothing loads unless **all**
hold: `NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT=production`, a valid
`NEXT_PUBLIC_OPENPANEL_CLIENT_ID`, the page is served from
`https://www.jmill.dev` (the apex redirects there), and the browser sends
neither Do Not Track nor Global Privacy Control. Otherwise the SDK chunk is
never fetched and no request is made, so `pnpm dev`, the MTS tailnet dev server
and Vercel preview URLs stay silent even if they inherit production variables.

| variable | value |
| --- | --- |
| `NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT` | `production` (anything else disables) |
| `NEXT_PUBLIC_OPENPANEL_CLIENT_ID` | public OpenPanel client ID for this site (no client secret, ever) |
| `NEXT_PUBLIC_OPENPANEL_API_URL` | optional; defaults to `https://api.openpanel.dev`, must be HTTPS without credentials or query |

These are public build-time values inlined into the client bundle: set them
only in the Vercel project's **Production** environment and redeploy after
changing them.

The only missing analytics configuration input is this site's real public
OpenPanel client ID. Once provisioned, the exact Vercel **Production** values
are:

```dotenv
NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT=production
NEXT_PUBLIC_OPENPANEL_CLIENT_ID=<jmill.dev public client ID>
```

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

Browser observation on 2026-10-25 UTC (2026-10-24 local), with DNT unset and
GPC false:

- Managed preview `/` returned 200 and made no OpenPanel or Umami requests;
  the canonical-host/environment gates intentionally keep it tracker-free.
- <https://jmill.dev> redirected to <https://www.jmill.dev/> (200). That
  still-unpromoted deployment loaded the old Umami `script.js` (200) and sent
  `/api/send` (POST 200), with no OpenPanel requests.
- Source removes the old Umami script and has no other analytics provider
  integration. Historical Umami data/account configuration is untouched.
- OpenPanel event arrival is not verified: this site's client is not yet
  provisioned and the source cutover is not promoted. Production completion
  requires the public client ID and an analytics-only deployment, then a real
  browser `/track` request plus destination-event confirmation where read access
  permits. The requested analytics-only rollout is already authorized.
