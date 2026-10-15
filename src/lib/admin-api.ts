import { prisma } from "@/lib/prisma";

export function asStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// sortOrder is an INT4 column, so append new rows after the current max instead of using timestamps.
export async function nextSortOrder(model: "project" | "experience") {
  const result =
    model === "project"
      ? await prisma.project.aggregate({ _max: { sortOrder: true } })
      : await prisma.experience.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? 0) + 1;
}
