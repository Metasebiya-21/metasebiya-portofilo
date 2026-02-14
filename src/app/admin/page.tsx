import AdminShell from "@/components/AdminShell";
import AdminRecentQuestionsClient from "@/components/AdminRecentQuestionsClient";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const QUESTIONS_PER_PAGE = 5;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ chatPage?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const rawPage = Number(params.chatPage || "1");
  const currentPage = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1;

  const [visitorCount, projectClicks, chatQuestions, topCountries, topProjects, topIps] = await Promise.all([
    prisma.visitorEvent.count().catch(() => 0),
    prisma.projectClick.count().catch(() => 0),
    prisma.chatMessage.count({ where: { role: "user" } }).catch(() => 0),
    prisma.visitorEvent.groupBy({
      by: ["country"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }).catch(() => []),
    prisma.projectClick.groupBy({
      by: ["projectTitle"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }).catch(() => []),
    prisma.visitorEvent.groupBy({
      by: ["ip"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }).catch(() => []),
  ]);

  const totalPages = Math.max(1, Math.ceil(chatQuestions / QUESTIONS_PER_PAGE));
  const normalizedPage = Math.min(currentPage, totalPages);

  const recentQuestions = await prisma.chatMessage.findMany({
    where: { role: "user" },
    orderBy: { createdAt: "desc" },
    skip: (normalizedPage - 1) * QUESTIONS_PER_PAGE,
    take: QUESTIONS_PER_PAGE,
  }).catch(() => []);

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-wide text-slate-500">Visitors</p>
          <p className="mt-2 text-3xl font-semibold">{visitorCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-wide text-slate-500">Project Clicks</p>
          <p className="mt-2 text-3xl font-semibold">{projectClicks}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-wide text-slate-500">Chat Questions</p>
          <p className="mt-2 text-3xl font-semibold">{chatQuestions}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold">Top Project Clicks</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topProjects.map((item) => (
              <li key={item.projectTitle} className="flex items-center justify-between">
                <span>{item.projectTitle}</span>
                <span className="text-slate-500">{item._count.id ?? 0}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold">Visitor Countries</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topCountries.map((item) => (
              <li key={item.country || "unknown"} className="flex items-center justify-between">
                <span>{item.country || "Unknown"}</span>
                <span className="text-slate-500">{item._count._all}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <AdminRecentQuestionsClient
        questions={recentQuestions.map((question) => ({
          id: question.id,
          content: question.content,
          createdAt: question.createdAt.toISOString(),
        }))}
        currentPage={normalizedPage}
        totalPages={totalPages}
      />

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-lg font-semibold">Top Visitor IPs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {topIps.map((item) => (
            <li key={item.ip || "unknown"} className="flex items-center justify-between">
              <span>{item.ip || "Unknown"}</span>
              <span className="text-slate-500">{item._count._all}</span>
            </li>
          ))}
        </ul>
      </section>
      </main>
    </AdminShell>
  );
}
