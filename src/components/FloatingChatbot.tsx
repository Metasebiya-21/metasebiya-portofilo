"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { siteContent } from "@/content/site";
import Icon from "@/components/Icon";
import { getOrCreateSessionId } from "@/lib/client-session";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_SESSION_KEY = "portfolio_chat_session_id";

export default function FloatingChatbot() {
  const content = siteContent.contact.chatbot;
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: content.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSessionId(getOrCreateSessionId(CHAT_SESSION_KEY));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isOpen]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || content.error);
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply || content.error }]);
    } catch (submitError) {
      const messageText = submitError instanceof Error ? submitError.message : content.error;
      setError(messageText || content.error);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: content.error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[60]">
      {isOpen && (
        <section className="pointer-events-auto fixed bottom-20 right-6 flex max-h-[calc(100dvh-6rem)] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{content.title}</h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{content.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Close chat"
            >
              <Icon name="xmark" />
            </button>
          </div>

          <div
            role="log"
            aria-live="polite"
            className="mt-3 h-72 min-h-0 shrink space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
            {messages.map((messageEntry, index) => (
              <div
                key={`${messageEntry.role}-${index}`}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  messageEntry.role === "user"
                    ? "ml-auto bg-sky-600 text-white"
                    : "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {messageEntry.content}
              </div>
            ))}
            {isLoading && (
              <div className="max-w-[85%] rounded-xl bg-white px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {content.thinking}
              </div>
            )}
          </div>

          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={content.placeholder}
              aria-label={content.placeholder}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !sessionId}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {content.send}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="pointer-events-auto fixed bottom-6 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-sky-500 bg-sky-600 text-xl text-white shadow-md transition hover:bg-sky-700"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        title={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <Icon name="comments" />
      </button>
    </div>
  );
}
