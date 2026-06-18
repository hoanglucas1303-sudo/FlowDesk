import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ pageId: string }> };

// GET /api/pages/[pageId] — Get page with content
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { pageId } = await context.params;

    const page = await prisma.page.findFirst({
      where: { id: pageId },
      include: {
        project: {
          select: { id: true, name: true, userId: true },
        },
        children: {
          select: { id: true, title: true, icon: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!page || page.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy trang" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json(
      { error: "Không thể tải trang" },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[pageId] — Update page
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { pageId } = await context.params;

    // Verify ownership
    const existing = await prisma.page.findFirst({
      where: { id: pageId },
      include: {
        project: { select: { userId: true } },
      },
    });

    if (!existing || existing.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy trang" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, icon, isPinned, parentId, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (icon !== undefined) updateData.icon = icon;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const page = await prisma.page.update({
      where: { id: pageId },
      data: updateData,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật trang" },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[pageId] — Delete page
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { pageId } = await context.params;

    // Verify ownership
    const existing = await prisma.page.findFirst({
      where: { id: pageId },
      include: {
        project: { select: { userId: true } },
      },
    });

    if (!existing || existing.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy trang" },
        { status: 404 }
      );
    }

    await prisma.page.delete({
      where: { id: pageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json(
      { error: "Không thể xoá trang" },
      { status: 500 }
    );
  }
}
