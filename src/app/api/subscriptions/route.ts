import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("List subscriptions error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách gói gia hạn" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      cost,
      currency,
      period,
      autoRenew,
      renewalDate,
      paymentMethod,
      status,
      licenseKey,
      notes,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên gói không được để trống" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "Phân loại không được để trống" }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        name: name.trim(),
        category,
        cost: parseFloat(cost) || 0,
        currency: currency || "USD",
        period: period || "monthly",
        autoRenew: autoRenew !== undefined ? autoRenew : true,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        paymentMethod: paymentMethod || null,
        status: status || "Active",
        licenseKey: licenseKey || null,
        notes: notes || null,
        userId: session.userId,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: "Không thể tạo gói gia hạn" }, { status: 500 });
  }
}
