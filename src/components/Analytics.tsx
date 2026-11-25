"use client";

import { useEffect } from "react";
import { analyticsAllowed } from "@/lib/analytics";

const TOKEN = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();
const BEACON_ID = "cloudflare-web-analytics";

const Analytics = () => {
  useEffect(() => {
    if (!TOKEN || !analyticsAllowed() || document.getElementById(BEACON_ID)) return;

    const script = document.createElement("script");
    script.id = BEACON_ID;
    script.type = "module";
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
    document.head.appendChild(script);
  }, []);

  return null;
};

export default Analytics;
