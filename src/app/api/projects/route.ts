import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/projects — List all user's projects
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { userId: session.userId };
    if (status === "ACTIVE" || status === "ARCHIVED") {
      where.status = status;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            pages: true,
            tasks: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách dự án" },
      { status: 500 }
    );
  }
}

// POST /api/projects — Create project
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên dự án không được để trống" },
        { status: 400 }
      );
    }

    // Get the max sortOrder for this user's projects
    const maxSort = await prisma.project.aggregate({
      where: { userId: session.userId },
      _max: { sortOrder: true },
    });

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description || null,
        icon: icon || "📁",
        color: color || "#3B82F6",
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        userId: session.userId,
      },
      include: {
        _count: {
          select: {
            pages: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Không thể tạo dự án" },
      { status: 500 }
    );
  }
}
