import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProjectsClient from "./projects-client";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.userId, status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { pages: true, tasks: true },
      },
    },
  });

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    icon: p.icon,
    color: p.color,
    pageCount: p._count.pages,
    taskCount: p._count.tasks,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <ProjectsClient initialProjects={serializedProjects} />;
}
