"use client";

import ThemeToggle from "@/components/ThemeToggle";
import FloatingChatbot from "@/components/FloatingChatbot";
import VisitorTracker from "@/components/VisitorTracker";

export default function ClientWidgets() {
  return (
    <>
      <VisitorTracker />
      <ThemeToggle />
      <FloatingChatbot />
    </>
  );
}
