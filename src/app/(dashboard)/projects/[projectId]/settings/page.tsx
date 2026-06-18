import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProjectSettingsClient from "./project-settings-client";

interface ProjectSettingsProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectSettings({ params }: ProjectSettingsProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.userId },
  });

  if (!project) redirect("/");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
        ⚙️ Cài đặt dự án
      </h1>

      <ProjectSettingsClient
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
          icon: project.icon,
          color: project.color,
        }}
      />
    </div>
  );
}
