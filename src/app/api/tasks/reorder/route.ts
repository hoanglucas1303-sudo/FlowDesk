import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// PUT /api/tasks/reorder — Batch reorder tasks (for kanban drag & drop)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { tasks } = body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "Danh sách công việc không hợp lệ" },
        { status: 400 }
      );
    }

    // Verify all tasks belong to user's projects
    const taskIds = tasks.map((t: { id: string }) => t.id);
    const existingTasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: {
        project: { select: { userId: true } },
      },
    });

    const allOwned = existingTasks.every(
      (t) => t.project.userId === session.userId
    );
    if (!allOwned || existingTasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: "Không có quyền thao tác" },
        { status: 403 }
      );
    }

    // Update all tasks in a transaction
    await prisma.$transaction(
      tasks.map((t: { id: string; status: string; sortOrder: number }) =>
        prisma.task.update({
          where: { id: t.id },
          data: {
            status: t.status as "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
            sortOrder: t.sortOrder,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder tasks error:", error);
    return NextResponse.json(
      { error: "Không thể sắp xếp lại công việc" },
      { status: 500 }
    );
  }
}
