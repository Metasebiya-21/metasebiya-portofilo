"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatbotContent = {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  thinking: string;
  error: string;
  greeting: string;
};

export default function PortfolioChatbot({ content }: { content: ChatbotContent }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: content.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
          history: messages,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || content.error);
      }

      const data = (await response.json()) as { reply?: string };
      setMessages([...nextMessages, { role: "assistant", content: data.reply || content.error }]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : content.error);
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
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 sm:p-6">
      <h2 className="text-xl font-semibold">{content.title}</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{content.subtitle}</p>

      <div className="mt-4 h-72 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
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

      {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={content.placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {content.send}
        </button>
      </form>
    </section>
  );
}
