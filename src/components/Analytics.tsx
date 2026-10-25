"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

/** Sends gated page views on load and client-side navigation; renders nothing. */
const Analytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

export default Analytics;
