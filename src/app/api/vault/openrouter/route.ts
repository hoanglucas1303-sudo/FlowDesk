import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({ error: "Thiếu API Key" }, { status: 400 });
    }

    // Try fetching account credits first
    try {
      const creditsRes = await fetch("https://openrouter.ai/api/v1/credits", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
      });

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        if (creditsData && creditsData.data) {
          const totalCredits = parseFloat(creditsData.data.total_credits || "0");
          const totalUsage = parseFloat(creditsData.data.total_usage || "0");
          const balance = totalCredits - totalUsage;
          return NextResponse.json({ balance, type: "account" });
        }
      }
    } catch (e) {
      console.warn("OpenRouter credits check failed, falling back to key details:", e);
    }

    // Fallback: Fetch key limits/details
    const keyRes = await fetch("https://openrouter.ai/api/v1/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (!keyRes.ok) {
      const errText = await keyRes.text();
      return NextResponse.json(
        { error: `OpenRouter API Error: ${keyRes.statusText || errText}` },
        { status: keyRes.status }
      );
    }

    const keyData = await keyRes.json();
    if (keyData && keyData.data) {
      const limit = keyData.data.limit;
      const usage = keyData.data.usage || 0;
      const limitRemaining = keyData.data.limit_remaining;

      // If key has limit remaining, return it. Otherwise return remaining or limit - usage
      if (limitRemaining !== null && limitRemaining !== undefined) {
        return NextResponse.json({ balance: parseFloat(limitRemaining), type: "key" });
      } else if (limit !== null && limit !== undefined) {
        const balance = Math.max(0, parseFloat(limit) - parseFloat(usage));
        return NextResponse.json({ balance, type: "key" });
      }

      // If it's unlimited key and credits endpoint failed, return null (meaning unlimited)
      return NextResponse.json({ balance: null, type: "unlimited" });
    }

    return NextResponse.json({ error: "Không tìm thấy dữ liệu từ OpenRouter" }, { status: 400 });
  } catch (error) {
    console.error("OpenRouter balance check error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi kết nối OpenRouter" }, { status: 500 });
  }
}
