type Project = {
  title: string;
  summary: string;
  tags: string[];
  link?: string;
};

export default function ProjectCard({ title, summary, tags, link }: Project) {
  return (
    <article className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition">
      <h3 className="text-lg font-semibold">
        {link ? <a href={link} target="_blank" rel="noreferrer" className="hover:underline">{title}</a> : title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{summary}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map(t => (
          <li key={t} className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-0.5">{t}</li>
        ))}
      </ul>
    </article>
  );
}
