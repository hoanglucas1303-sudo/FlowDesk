import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
        ⚙️ Cài đặt hệ thống
      </h1>

      <SettingsClient
        initialUser={{
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
      />
    </div>
  );
}
