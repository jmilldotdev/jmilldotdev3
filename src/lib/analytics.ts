/** The served production host; the apex redirects here. */
const SITE = "jmill.dev";
const CANONICAL_HOST = `www.${SITE}`;
const EVENTS_URL = "https://events.cuelight.fyi/e";
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

type AnalyticsEvent =
  | { name: "project_open"; project: string }
  | { name: "project_link_open"; project: string }
  | { name: "contact_open"; channel: "x" | "github" | "email" };

export function analyticsAllowed(): boolean {
  if (
    process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT !== "production" ||
    typeof window === "undefined" ||
    window.location.protocol !== "https:" ||
    window.location.hostname !== CANONICAL_HOST
  ) {
    return false;
  }

  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  return privacy.globalPrivacyControl !== true && navigator.doNotTrack !== "1";
}

function eventProperties(event: AnalyticsEvent): Record<string, string> | null {
  switch (event.name) {
    case "project_open":
    case "project_link_open":
      return SLUG_PATTERN.test(event.project)
        ? { project: event.project }
        : null;
    case "contact_open":
      return { channel: event.channel };
  }
}

/** Fire-and-forget; never delays or alters the action that triggered it. */
export function trackEvent(event: AnalyticsEvent): void {
  if (!analyticsAllowed()) return;
  const props = eventProperties(event);
  if (!props) return;

  navigator.sendBeacon?.(
    EVENTS_URL,
    JSON.stringify({
      site: SITE,
      name: event.name,
      path: window.location.pathname,
      props,
    })
  );
}
