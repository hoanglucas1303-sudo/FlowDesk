import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ subId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { subId } = await context.params;

    // Verify ownership
    const existing = await prisma.subscription.findUnique({
      where: { id: subId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Không tìm thấy gói gia hạn" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      category,
      icon,
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

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (icon !== undefined) updateData.icon = icon;
    if (cost !== undefined) updateData.cost = parseFloat(cost) || 0;
    if (currency !== undefined) updateData.currency = currency;
    if (period !== undefined) updateData.period = period;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
    if (renewalDate !== undefined) updateData.renewalDate = renewalDate ? new Date(renewalDate) : null;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (status !== undefined) updateData.status = status;
    if (licenseKey !== undefined) updateData.licenseKey = licenseKey;
    if (notes !== undefined) updateData.notes = notes;

    const subscription = await prisma.subscription.update({
      where: { id: subId },
      data: updateData,
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json({ error: "Không thể cập nhật gói gia hạn" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { subId } = await context.params;

    // Verify ownership
    const existing = await prisma.subscription.findUnique({
      where: { id: subId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Không tìm thấy gói gia hạn" }, { status: 404 });
    }

    await prisma.subscription.delete({
      where: { id: subId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subscription error:", error);
    return NextResponse.json({ error: "Không thể xóa gói gia hạn" }, { status: 500 });
  }
}
