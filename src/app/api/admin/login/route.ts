import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    const adminKey = process.env.ADMIN_KEY;

    if (!adminKey || key !== adminKey) {
      return NextResponse.json({ error: "Invalid key" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_key", key, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
