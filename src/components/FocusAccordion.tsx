"use client";

import { useState } from "react";
import { siteContent } from "@/content/site";

type FocusItem = {
  title: string;
  detail: string;
};

export default function FocusAccordion({ items }: { items: FocusItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        return (
          <article
            key={item.title}
            className={`rounded-xl border bg-white/75 p-4 transition dark:bg-slate-900/65 ${
              isOpen ? "border-sky-500 shadow-sm" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <h3>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
              aria-controls={`focus-panel-${index}`}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
              <span aria-hidden="true"
                className={`text-xs font-medium uppercase tracking-wide ${
                  isOpen ? "text-sky-700 dark:text-sky-300" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isOpen ? siteContent.interactive.accordion.open : siteContent.interactive.accordion.closed}
              </span>
            </button>
            </h3>
            {isOpen && <p id={`focus-panel-${index}`} className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.detail}</p>}
          </article>
        );
      })}
    </div>
  );
}
