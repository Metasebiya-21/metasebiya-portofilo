export const aboutContent = {
  sectionLabel: "About",
  stats: [
    { label: "Experience", value: "5+ years" },
    { label: "Focus", value: "Backend + Data" },
  ],
  skillGroups: [
    {
      label: "Backend",
      skills: ["Java", "Spring Boot", "Python", "FastAPI", "Django", "Node.js"],
    },
    {
      label: "Data",
      skills: ["Apache Pulsar", "Kafka", "PostgreSQL", "MySQL", "Event-Driven Systems"],
    },
    {
      label: "Cloud",
      skills: ["AWS", "Docker", "CI/CD", "System Design", "Observability"],
    },
    {
      label: "AI",
      skills: ["TensorFlow", "PyTorch", "OCR", "NLP", "Recommenders"],
    },
  ],
  focusAreas: [
    {
      title: "Backend systems that scale without surprises",
      detail:
        "I design APIs and services with clear boundaries, practical observability, and failure-aware patterns. The goal is predictable delivery under load, not complexity for its own sake.",
    },
    {
      title: "Real-time pipelines for decision-ready data",
      detail:
        "I build event streaming workflows that are easy to evolve over time, with strong schema ownership and reliable processing semantics for production use.",
    },
    {
      title: "Applied ML aligned with product outcomes",
      detail:
        "I focus on ML/AI features that solve a concrete product problem, from OCR to recommendations, and support them with repeatable deployment and measurable impact.",
    },
  ],
};

type ProjectSkillSource = {
  category: string;
  tags: string[];
};

export function buildSkillGroupsByCategory(projects: ProjectSkillSource[]) {
  const byCategory = projects.reduce<Record<string, Record<string, number>>>((acc, project) => {
    const category = project.category?.trim();
    if (!category) return acc;
    if (!acc[category]) acc[category] = {};
    for (const tag of project.tags) {
      const normalizedTag = tag.trim();
      if (!normalizedTag) continue;
      acc[category][normalizedTag] = (acc[category][normalizedTag] ?? 0) + 1;
    }
    return acc;
  }, {});

  const groups = Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, tagCounts]) => ({
      label,
      skills: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([tag]) => tag),
    }))
    .filter((group) => group.skills.length > 0);

  return groups.length ? groups : aboutContent.skillGroups;
}
