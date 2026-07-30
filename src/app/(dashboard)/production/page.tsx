import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProductionClient from "./production-client";
import type { DemoAccount, DemoDoc } from "@/types";

export default async function ProductionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const initialProducts = await prisma.product.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  // Serialize JSON fields and dates safely for client component
  const serializedProducts = initialProducts.map((prod) => ({
    ...prod,
    createdAt: prod.createdAt.toISOString(),
    updatedAt: prod.updatedAt.toISOString(),
    // Prisma Json type parsing fallback to empty arrays with assertions
    demoAccounts: (Array.isArray(prod.demoAccounts) ? prod.demoAccounts : []) as unknown as DemoAccount[],
    demoDocs: (Array.isArray(prod.demoDocs) ? prod.demoDocs : []) as unknown as DemoDoc[],
  }));

  return <ProductionClient initialProducts={serializedProducts} />;
}
