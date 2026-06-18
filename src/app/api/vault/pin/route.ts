import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { action, pin } = body;

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: "Mã PIN phải có tối thiểu 4 số" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { vaultPin: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (action === "setup") {
      if (user.vaultPin) {
        return NextResponse.json({ error: "Mã PIN đã được thiết lập trước đó" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.userId },
        data: { vaultPin: pin },
      });
      return NextResponse.json({ success: true, message: "Thiết lập mã PIN thành công" });
    } else if (action === "verify") {
      if (!user.vaultPin) {
        return NextResponse.json({ error: "Mã PIN chưa được thiết lập" }, { status: 400 });
      }
      if (user.vaultPin === pin) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: "Mã PIN không chính xác" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
    }
  } catch (error) {
    console.error("Vault PIN API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
