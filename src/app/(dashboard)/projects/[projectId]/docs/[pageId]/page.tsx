import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import PageEditor from "./page-editor";

interface PageEditorViewProps {
  params: Promise<{ projectId: string; pageId: string }>;
}

export default async function PageEditorView({
  params,
}: PageEditorViewProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId, pageId } = await params;

  const page = await prisma.page.findFirst({
    where: { id: pageId, projectId },
    include: {
      project: {
        select: { userId: true },
      },
    },
  });

  if (!page || page.project.userId !== session.userId) {
    notFound();
  }

  return (
    <PageEditor
      pageId={page.id}
      projectId={projectId}
      initialTitle={page.title}
      initialContent={page.content}
      initialIcon={page.icon}
    />
  );
}
