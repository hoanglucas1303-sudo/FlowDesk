import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { UI } from "@/lib/constants";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

const tabs = [
  { key: "overview", label: UI.overview, href: "" },
  { key: "docs", label: UI.documents, href: "/docs" },
  { key: "tasks", label: UI.tasks, href: "/tasks" },
  { key: "settings", label: UI.settings, href: "/settings" },
];

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.userId },
    include: {
      _count: {
        select: { pages: true, tasks: true },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="flex flex-col h-full">
      {/* Project header */}
      <div className="border-b border-border bg-bg-surface px-6 pt-6">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-3xl"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
            >
              {project.icon}
            </span>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm text-text-muted mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <TabLink
                key={tab.key}
                href={`/projects/${projectId}${tab.href}`}
                label={tab.label}
                tabKey={tab.key}
                projectId={projectId}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function TabLink({
  href,
  label,
  tabKey: _tabKey,
  projectId: _projectId,
}: {
  href: string;
  label: string;
  tabKey: string;
  projectId: string;
}) {
  return (
    <Link
      href={href}
      className="relative px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-t-lg hover:bg-bg-elevated"
    >
      {label}
    </Link>
  );
}
