import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("cms_session");

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ message: "Authenticated." }, { status: 200 });
}
