import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." }, { status: 200 });
  response.cookies.set(CMS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0
  });
  return response;
}
