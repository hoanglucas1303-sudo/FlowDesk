import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";

// POST /api/auth — Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu" },
        { status: 400 }
      );
    }

    if (password !== "@123") {
      return NextResponse.json(
        { error: "Mật khẩu truy cập không đúng" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { error: "Hệ thống chưa được khởi tạo người dùng" },
        { status: 500 }
      );
    }

    const token = await signToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng nhập" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth — Logout
export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng xuất" },
      { status: 500 }
    );
  }
}
