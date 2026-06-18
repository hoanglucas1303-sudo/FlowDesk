import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ taskId: string }> };

// GET /api/tasks/[taskId] — Get task with labels and linked page
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { taskId } = await context.params;

    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: {
        labels: true,
        page: {
          select: { id: true, title: true, icon: true },
        },
        project: {
          select: { id: true, name: true, userId: true },
        },
      },
    });

    if (!task || task.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy công việc" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "Không thể tải công việc" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[taskId] — Update task
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { taskId } = await context.params;

    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id: taskId },
      include: {
        project: { select: { userId: true } },
      },
    });

    if (!existing || existing.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy công việc" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, pageId, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (pageId !== undefined) updateData.pageId = pageId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        labels: true,
        page: {
          select: { id: true, title: true, icon: true },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật công việc" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[taskId] — Delete task
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { taskId } = await context.params;

    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id: taskId },
      include: {
        project: { select: { userId: true } },
      },
    });

    if (!existing || existing.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy công việc" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Không thể xoá công việc" },
      { status: 500 }
    );
  }
}
