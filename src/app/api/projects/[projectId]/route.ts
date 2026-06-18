import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ projectId: string }> };

// GET /api/projects/[projectId] — Get project with stats
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { projectId } = await context.params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
      include: {
        _count: {
          select: {
            pages: true,
            tasks: true,
          },
        },
        tasks: {
          select: {
            status: true,
            dueDate: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án" },
        { status: 404 }
      );
    }

    // Compute stats
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (t) => t.status === "DONE"
    ).length;
    const inProgressTasks = project.tasks.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const overdueTasks = project.tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length;

    const { tasks: _tasks, ...projectData } = project;

    return NextResponse.json({
      ...projectData,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Không thể tải dự án" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId] — Update project
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { projectId } = await context.params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, icon, color, status } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (status !== undefined) updateData.status = status;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        _count: {
          select: {
            pages: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật dự án" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] — Delete project (cascade pages & tasks)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { projectId } = await context.params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án" },
        { status: 404 }
      );
    }

    // Prisma cascade will handle pages and tasks (defined in schema)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Không thể xoá dự án" },
      { status: 500 }
    );
  }
}
