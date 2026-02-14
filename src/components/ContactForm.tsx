"use client";

import { FormEvent, useState } from "react";

type ContactFormContent = {
  title: string;
  description: string;
  fields: {
    name: string;
    email: string;
    message: string;
  };
  placeholders: {
    name: string;
    email: string;
    message: string;
  };
  submit: string;
  helper: string;
};

export default function ContactForm({
  recipientEmail,
  content,
}: {
  recipientEmail: string;
  content: ContactFormContent;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="mt-6 max-w-lg">
      <h2 className="text-xl font-semibold">{content.title}</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{content.description}</p>

      <form className="mt-4 grid grid-cols-1 gap-3.5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{content.fields.name}</span>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={content.placeholders.name}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">{content.fields.email}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={content.placeholders.email}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">{content.fields.message}</span>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={content.placeholders.message}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{content.helper}</p>
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            {content.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
