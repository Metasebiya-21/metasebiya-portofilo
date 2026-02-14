"use client";

import { useMemo, useState } from "react";
import { siteContent } from "@/content/site";

type SkillGroup = {
  label: string;
  skills: string[];
};

type SkillDetail = {
  description: string | null;
  howIUseIt: string | null;
  technicalUse: string | null;
};

function getJustificationBullets(detail?: SkillDetail) {
  if (!detail) return [];
  return [detail.technicalUse, detail.howIUseIt, detail.description]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .flatMap((value) => value.split(/\r?\n/))
    .map((line) => line.replace(/^\s*[-*]\s?/, "").trim())
    .filter(Boolean);
}

export default function InteractiveSkills({
  groups,
  skillDetails,
}: {
  groups: SkillGroup[];
  skillDetails?: Record<string, SkillDetail>;
}) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.label ?? "");
  const [activeSkill, setActiveSkill] = useState("");

  const current = useMemo(
    () => groups.find((group) => group.label === activeGroup) ?? groups[0],
    [activeGroup, groups],
  );

  if (!current) return null;

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/65">
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => {
          const isActive = group.label === current.label;
          return (
            <button
              key={group.label}
              type="button"
              onClick={() => {
                setActiveGroup(group.label);
                setActiveSkill("");
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-300 bg-white/70 text-slate-700 hover:border-sky-500 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-sky-300"
              }`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {current.skills.map((skill) => {
          const selected = activeSkill === skill;
          return (
            <button
              key={skill}
              type="button"
              onClick={() => setActiveSkill(skill)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white/70 text-slate-800 hover:-translate-y-0.5 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        {activeSkill
          ? `${siteContent.interactive.skills.emphasisPrefix} ${activeSkill}`
          : siteContent.interactive.skills.tipIdle}
      </p>

      {activeSkill && skillDetails?.[activeSkill] && getJustificationBullets(skillDetails[activeSkill]).length > 0 && (
        <article className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/60">
          <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
            {getJustificationBullets(skillDetails[activeSkill]).map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      )}
    </div>
  );
}
