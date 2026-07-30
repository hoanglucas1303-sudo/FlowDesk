import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("List products error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách sản phẩm" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status, version, url, repoUrl, techStack, docsUrl, demoAccounts, demoDocs } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên sản phẩm không được để trống" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description || null,
        status: status || "Active",
        version: version || "1.0.0",
        url: url || null,
        repoUrl: repoUrl || null,
        techStack: techStack || null,
        docsUrl: docsUrl || null,
        demoAccounts: demoAccounts || [],
        demoDocs: demoDocs || [],
        userId: session.userId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Không thể tạo sản phẩm mới" }, { status: 500 });
  }
}
