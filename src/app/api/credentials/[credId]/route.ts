import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ credId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { credId } = await context.params;

    // Verify ownership
    const existing = await prisma.credential.findUnique({
      where: { id: credId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản bảo mật" }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, url, username, secret, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (url !== undefined) updateData.url = url;
    if (username !== undefined) updateData.username = username.trim();
    if (secret !== undefined) updateData.secret = secret.trim();
    if (notes !== undefined) updateData.notes = notes;

    const credential = await prisma.credential.update({
      where: { id: credId },
      data: updateData,
    });

    return NextResponse.json(credential);
  } catch (error) {
    console.error("Update credential error:", error);
    return NextResponse.json({ error: "Không thể cập nhật tài khoản bảo mật" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { credId } = await context.params;

    // Verify ownership
    const existing = await prisma.credential.findUnique({
      where: { id: credId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản bảo mật" }, { status: 404 });
    }

    await prisma.credential.delete({
      where: { id: credId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete credential error:", error);
    return NextResponse.json({ error: "Không thể xóa tài khoản bảo mật" }, { status: 500 });
  }
}
