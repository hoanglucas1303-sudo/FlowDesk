import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const credentials = await prisma.credential.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("List credentials error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách tài khoản bảo mật" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, url, username, secret, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên tài khoản không được để trống" }, { status: 400 });
    }

    if (!username || !username.trim()) {
      return NextResponse.json({ error: "Tên đăng nhập không được để trống" }, { status: 400 });
    }

    if (!secret || !secret.trim()) {
      return NextResponse.json({ error: "Mật khẩu không được để trống" }, { status: 400 });
    }

    const credential = await prisma.credential.create({
      data: {
        name: name.trim(),
        category: category || "Hosting",
        url: url || null,
        username: username.trim(),
        secret: secret.trim(),
        notes: notes || null,
        userId: session.userId,
      },
    });

    return NextResponse.json(credential, { status: 201 });
  } catch (error) {
    console.error("Create credential error:", error);
    return NextResponse.json({ error: "Không thể tạo tài khoản bảo mật" }, { status: 500 });
  }
}
