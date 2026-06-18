import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DocumentsClient from "./documents-client";

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const pages = await prisma.page.findMany({
    where: { project: { userId: session.userId, status: "ACTIVE" } },
    orderBy: { updatedAt: "desc" },
    include: {
      project: {
        select: { id: true, name: true, icon: true, color: true },
      },
    },
  });

  const serializedPages = pages.map((page) => ({
    id: page.id,
    title: page.title,
    icon: page.icon,
    projectId: page.projectId,
    updatedAt: page.updatedAt.toISOString(),
    project: page.project,
  }));

  return <DocumentsClient initialPages={serializedPages} />;
}
