import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/tasks?projectId=xxx — List tasks for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    if (!projectId) {
      return NextResponse.json(
        { error: "Thiếu tham số projectId" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án" },
        { status: 404 }
      );
    }

    const where: Record<string, unknown> = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        labels: true,
      },
      orderBy: [
        { sortOrder: "asc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("List tasks error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách công việc" },
      { status: 500 }
    );
  }
}

// POST /api/tasks — Create task
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { title, projectId, status, priority, dueDate, description, pageId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Tiêu đề không được để trống" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Thiếu tham số projectId" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án" },
        { status: 404 }
      );
    }

    // Get max sortOrder
    const maxSort = await prisma.task.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        pageId: pageId || null,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
      include: {
        labels: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Không thể tạo công việc" },
      { status: 500 }
    );
  }
}
