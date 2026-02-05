import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const validToken = process.env.ADMIN_INVITE_TOKEN;

    if (!validToken) {
      return NextResponse.json(
        { error: "Admin invite system not configured" },
        { status: 500 }
      );
    }

    if (token !== validToken) {
      return NextResponse.json(
        { error: "Invalid invite token" },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
