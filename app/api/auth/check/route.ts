import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ message: "Authenticated." }, { status: 200 });
}
