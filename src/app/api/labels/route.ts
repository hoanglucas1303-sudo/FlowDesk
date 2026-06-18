import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/labels?projectId=xxx — List labels for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

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

    const labels = await prisma.label.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(labels);
  } catch (error) {
    console.error("List labels error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách nhãn" },
      { status: 500 }
    );
  }
}

// POST /api/labels — Create label
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, projectId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên nhãn không được để trống" },
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

    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color: color || "#6B7280",
        projectId,
      },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    // Handle unique constraint violation
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Nhãn này đã tồn tại trong dự án" },
        { status: 409 }
      );
    }
    console.error("Create label error:", error);
    return NextResponse.json(
      { error: "Không thể tạo nhãn" },
      { status: 500 }
    );
  }
}
