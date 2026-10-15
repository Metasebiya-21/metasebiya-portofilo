"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/client-session";

const VISITOR_SESSION_KEY = "portfolio_visitor_session_id";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getOrCreateSessionId(VISITOR_SESSION_KEY);
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname || "/",
        sessionId,
      }),
    }).catch(() => {
      // Analytics is best-effort.
    });
  }, [pathname]);

  return null;
}
