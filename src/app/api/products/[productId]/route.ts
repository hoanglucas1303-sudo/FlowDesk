import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ productId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { productId } = await context.params;

    // Verify ownership
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, status, version, url, repoUrl, techStack, docsUrl, demoAccounts, demoDocs } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (version !== undefined) updateData.version = version;
    if (url !== undefined) updateData.url = url;
    if (repoUrl !== undefined) updateData.repoUrl = repoUrl;
    if (techStack !== undefined) updateData.techStack = techStack;
    if (docsUrl !== undefined) updateData.docsUrl = docsUrl;
    if (demoAccounts !== undefined) updateData.demoAccounts = demoAccounts;
    if (demoDocs !== undefined) updateData.demoDocs = demoDocs;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Không thể cập nhật sản phẩm" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { productId } = await context.params;

    // Verify ownership
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Không thể xóa sản phẩm" }, { status: 500 });
  }
}
