import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/search?q=xxx — Global search
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || !q.trim()) {
      return NextResponse.json(
        { pages: [], tasks: [], projects: [] }
      );
    }

    const query = q.trim();

    // Search in parallel
    const [pages, tasks, projects] = await Promise.all([
      // Search pages by title
      prisma.page.findMany({
        where: {
          project: { userId: session.userId },
          title: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          icon: true,
          projectId: true,
          project: { select: { name: true } },
        },
        take: 5,
      }),

      // Search tasks by title
      prisma.task.findMany({
        where: {
          project: { userId: session.userId },
          title: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          projectId: true,
          project: { select: { name: true } },
        },
        take: 5,
      }),

      // Search projects by name
      prisma.project.findMany({
        where: {
          userId: session.userId,
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ pages, tasks, projects });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Không thể tìm kiếm" },
      { status: 500 }
    );
  }
}
