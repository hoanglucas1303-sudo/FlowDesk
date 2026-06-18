import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface PageWithChildren {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
  sortOrder: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: PageWithChildren[];
}

// Build tree structure from flat list
function buildPageTree(pages: PageWithChildren[]): PageWithChildren[] {
  const map = new Map<string, PageWithChildren>();
  const roots: PageWithChildren[] = [];

  // Initialize map
  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  // Build tree
  for (const page of pages) {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// GET /api/pages?projectId=xxx — List pages for a project (tree structure)
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

    const pages = await prisma.page.findMany({
      where: { projectId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        icon: true,
        parentId: true,
        sortOrder: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const tree = buildPageTree(pages as PageWithChildren[]);

    return NextResponse.json(tree);
  } catch (error) {
    console.error("List pages error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách trang" },
      { status: 500 }
    );
  }
}

// POST /api/pages — Create page
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { title, projectId, parentId, icon } = body;

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

    // Get max sortOrder for sibling pages
    const maxSort = await prisma.page.aggregate({
      where: {
        projectId,
        parentId: parentId || null,
      },
      _max: { sortOrder: true },
    });

    const page = await prisma.page.create({
      data: {
        title: title || "Trang mới",
        projectId,
        parentId: parentId || null,
        icon: icon || "📄",
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json(
      { error: "Không thể tạo trang" },
      { status: 500 }
    );
  }
}
