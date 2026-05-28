import { NextRequest, NextResponse } from "next/server";
import { validateCmsPassword, generateSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password;

    if (!password) {
      return NextResponse.json({ message: "Password is required." }, { status: 400 });
    }

    if (!validateCmsPassword(password)) {
      return NextResponse.json({ message: "Invalid password." }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Login successful." }, { status: 200 });
    response.cookies.set("cms_session", generateSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
