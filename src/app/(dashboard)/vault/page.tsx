import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import VaultClient from "./vault-client";

export default async function VaultPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, initialSubscriptions, initialCredentials] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { vaultPin: true },
    }),
    prisma.subscription.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.credential.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const hasPin = !!user.vaultPin;

  // Serialize dates for Client Component
  const serializedSubscriptions = initialSubscriptions.map((sub) => ({
    ...sub,
    renewalDate: sub.renewalDate ? sub.renewalDate.toISOString() : null,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  }));

  const serializedCredentials = initialCredentials.map((cred) => ({
    ...cred,
    createdAt: cred.createdAt.toISOString(),
    updatedAt: cred.updatedAt.toISOString(),
  }));

  return (
    <VaultClient
      hasPin={hasPin}
      initialSubscriptions={serializedSubscriptions}
      initialCredentials={serializedCredentials}
    />
  );
}
