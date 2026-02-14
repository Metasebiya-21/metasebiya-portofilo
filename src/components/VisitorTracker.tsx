"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_SESSION_KEY = "portfolio_visitor_session_id";

function getVisitorSessionId() {
  const saved = window.localStorage.getItem(VISITOR_SESSION_KEY);
  if (saved) return saved;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(VISITOR_SESSION_KEY, generated);
  return generated;
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getVisitorSessionId();
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname || "/",
        sessionId,
      }),
    });
  }, [pathname]);

  return null;
}
